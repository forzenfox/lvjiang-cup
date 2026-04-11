import React, { useState } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';
import MatchDetailModal from './MatchDetailModal';

interface BracketMatchCardProps {
  match: Match;
  teams: Team[];
  testId?: string;
}

// 状态徽章组件 - 官方UI风格
const BracketStatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
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
      className="px-3 py-1 text-sm font-medium rounded"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
      data-testid="match-status"
    >
      {getStatusText()}
    </span>
  );
};

// 队伍Logo组件
const BracketTeamLogo: React.FC<{ team?: Team; size?: number }> = ({ team, size = 32 }) => {
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

// 单行队伍组件 - 参考官方设计
const TeamRow: React.FC<{
  team?: Team;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  testId?: string;
}> = ({ team, score, isWinner, isLoser, testId }) => {
  return (
    <div
      className="flex items-center justify-between px-5"
      style={{
        backgroundColor: isWinner
          ? ELIMINATION_THEME.winnerBg
          : isLoser
            ? ELIMINATION_THEME.loserBg
            : 'transparent',
        height: '55px', // 增大的行高
      }}
      data-testid={testId}
    >
      {/* 左侧：队标 + 队名 */}
      <div className="flex items-center gap-4">
        <BracketTeamLogo team={team} size={32} />
        <span
          className="font-medium truncate"
          style={{
            fontSize: '16px',
            color: isWinner ? ELIMINATION_THEME.winnerText : ELIMINATION_THEME.loserText,
            maxWidth: '180px',
          }}
          data-testid={`${testId}-name`}
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
        data-testid={`${testId}-score`}
      >
        {score ?? 0}
      </span>
    </div>
  );
};

const BracketMatchCard = React.forwardRef<HTMLDivElement, BracketMatchCardProps>(
  ({ match, teams, testId }, ref) => {
    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);
    const isFinished = match.status === 'finished';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isTeamAWinner = isFinished && match.winnerId === match.teamAId;
    const isTeamBWinner = isFinished && match.winnerId === match.teamBId;
    const hasWinner = isFinished && match.winnerId;

    const handleCardClick = () => {
      setIsModalOpen(true);
    };

    return (
      <>
        <div
          ref={ref}
          className="flex flex-col cursor-pointer hover:opacity-90"
          style={{
            width: ELIMINATION_THEME.cardWidth,
          }}
          data-testid={testId || 'bracket-match'}
          onClick={handleCardClick}
        >
          {/* 顶部信息栏：时间（左）+ 状态（右） */}
          <div className="flex items-center justify-between mb-1" style={{ height: '28px' }}>
            {/* 左侧：时间显示 */}
            <span
              className="text-base whitespace-nowrap"
              style={{ color: ELIMINATION_THEME.loserText }}
              data-testid="match-time"
            >
              {match.startTime ? formatMatchTime(match.startTime) : '待定'}
            </span>

            {/* 右侧：状态徽章 */}
            <BracketStatusBadge status={match.status} />
          </div>

          {/* 比赛卡片主体 */}
          <div
            style={{
              backgroundColor: ELIMINATION_THEME.cardBackground,
              height: ELIMINATION_THEME.matchCardHeight,
            }}
          >
            {/* 战队1 - 上方 */}
            <TeamRow
              team={teamA}
              score={match.scoreA}
              isWinner={isTeamAWinner}
              isLoser={hasWinner && !isTeamAWinner}
              testId={`${testId}-team-a`}
            />

            {/* 分隔线 */}
            <div className="mx-5 h-px" style={{ backgroundColor: ELIMINATION_THEME.cardBorder }} />

            {/* 战队2 - 下方 */}
            <TeamRow
              team={teamB}
              score={match.scoreB}
              isWinner={isTeamBWinner}
              isLoser={hasWinner && !isTeamBWinner}
              testId={`${testId}-team-b`}
            />
          </div>
        </div>

        {/* 对战详情弹框 */}
        <MatchDetailModal
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          match={match}
          teams={teams}
        />
      </>
    );
  }
);

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

BracketMatchCard.displayName = 'BracketMatchCard';

export default BracketMatchCard;
