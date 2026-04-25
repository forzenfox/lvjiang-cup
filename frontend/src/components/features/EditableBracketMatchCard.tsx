import React, { useState, forwardRef } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';
import MatchEditDialog from '@/pages/admin/components/MatchEditDialog';
import { useAdvancementStore } from '@/store/advancementStore';

interface EditableBracketMatchCardProps {
  match: Match;
  teams: Team[];
  onUpdate: (match: Match) => void;
  allMatches?: Match[];
}

// 状态徽章组件 - 与BracketMatchCard保持一致
const EditableStatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'upcoming':
        return { bg: 'rgb(59, 130, 246)', text: 'rgb(255, 255, 255)' }; // 蓝色
      case 'ongoing':
        return { bg: 'rgb(34, 197, 94)', text: 'rgb(255, 255, 255)' }; // 绿色
      case 'finished':
        return { bg: 'rgb(107, 114, 128)', text: 'rgb(255, 255, 255)' }; // 灰色
      default:
        return { bg: 'rgb(59, 130, 246)', text: 'rgb(255, 255, 255)' };
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'upcoming':
        return '未开始';
      case 'ongoing':
        return '进行中';
      case 'finished':
        return '已结束';
      default:
        return '未开始';
    }
  };

  const style = getStatusStyle();

  return (
    <span
      className="px-3 py-1 text-sm font-medium rounded cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
    >
      {getStatusText()}
    </span>
  );
};

// 队伍Logo组件 - 与BracketMatchCard保持一致
const EditableTeamLogo: React.FC<{ team?: Team; size?: number }> = ({ team, size = 32 }) => {
  if (team?.logo) {
    return (
      <img
        src={team.logo}
        alt={team.name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return <div className="rounded-full bg-gray-600" style={{ width: size, height: size }} />;
};

// 单行队伍组件 - 与BracketMatchCard保持一致
const EditableTeamRow: React.FC<{
  team?: Team;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
}> = ({ team, score, isWinner, isLoser }) => {
  return (
    <div
      className="flex items-center justify-between px-5 cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        backgroundColor: isWinner
          ? ELIMINATION_THEME.winnerBg
          : isLoser
            ? ELIMINATION_THEME.loserBg
            : 'transparent',
        height: '55px',
      }}
    >
      {/* 左侧：队标 + 队名 */}
      <div className="flex items-center gap-4">
        <EditableTeamLogo team={team} size={32} />
        <span
          className="font-medium truncate"
          style={{
            fontSize: '16px',
            color: isWinner ? ELIMINATION_THEME.winnerText : ELIMINATION_THEME.loserText,
            maxWidth: '180px',
          }}
        >
          {team?.name || '待定'}
        </span>
      </div>

      {/* 右侧：小分 */}
      <span
        className="font-bold text-xl w-8 text-center"
        style={{
          color: isWinner ? ELIMINATION_THEME.scoreActive : ELIMINATION_THEME.scoreDefault,
        }}
      >
        {score ?? 0}
      </span>
    </div>
  );
};

// 格式化比赛时间
const formatMatchTime = (startTime: string): string => {
  if (!startTime) return '待定';
  try {
    const date = new Date(startTime);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  } catch {
    return '待定';
  }
};

const EditableBracketMatchCard = forwardRef<HTMLDivElement, EditableBracketMatchCardProps>(
  ({ match, teams, onUpdate, allMatches = [] }, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const advancement = useAdvancementStore(state => state.advancement);

    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);
    const isFinished = match.status === 'finished';

    const isTeamAWinner = isFinished && match.winnerId === match.teamAId;
    const isTeamBWinner = isFinished && match.winnerId === match.teamBId;
    const hasWinner = isFinished && match.winnerId;

    const handleCardClick = () => {
      setIsDialogOpen(true);
    };

    const handleSave = (updatedMatch: Match) => {
      onUpdate(updatedMatch);
      return true;
    };

    return (
      <>
        <div
          ref={ref}
          className="flex flex-col cursor-pointer hover:opacity-90 group"
          style={{
            width: ELIMINATION_THEME.cardWidth,
          }}
          onClick={handleCardClick}
        >
          {/* 顶部信息栏：时间（左）+ 状态（右） */}
          <div className="flex items-center justify-between mb-1" style={{ height: '28px' }}>
            {/* 左侧：时间显示 */}
            <span
              className="text-base whitespace-nowrap"
              style={{ color: ELIMINATION_THEME.loserText }}
            >
              {match.startTime ? formatMatchTime(match.startTime) : '待定'}
            </span>

            {/* 右侧：状态徽章 */}
            <EditableStatusBadge status={match.status} />
          </div>

          {/* 比赛卡片主体 */}
          <div
            className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            style={{
              backgroundColor: ELIMINATION_THEME.cardBackground,
              height: ELIMINATION_THEME.matchCardHeight,
            }}
          >
            {/* 编辑提示遮罩 */}
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

            {/* 战队1 - 上方 */}
            <EditableTeamRow
              team={teamA}
              score={match.scoreA}
              isWinner={isTeamAWinner}
              isLoser={hasWinner && !isTeamAWinner}
            />

            {/* 分隔线 */}
            <div className="mx-5 h-px" style={{ backgroundColor: ELIMINATION_THEME.cardBorder }} />

            {/* 战队2 - 下方 */}
            <EditableTeamRow
              team={teamB}
              score={match.scoreB}
              isWinner={isTeamBWinner}
              isLoser={hasWinner && !isTeamBWinner}
            />
          </div>

          {/* 编辑提示 */}
          <div className="flex justify-between items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-blue-400">点击编辑</span>
          </div>
        </div>

        {/* 比赛编辑弹框 */}
        <MatchEditDialog
          match={match}
          teams={teams}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          advancement={advancement}
          allMatches={allMatches}
          currentBracket={match.eliminationBracket}
        />
      </>
    );
  }
);

EditableBracketMatchCard.displayName = 'EditableBracketMatchCard';

export default EditableBracketMatchCard;
