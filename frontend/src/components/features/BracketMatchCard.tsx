import React from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';

interface BracketMatchCardProps {
  match: Match;
  teams: Team[];
  testId?: string;
}

const BracketStatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
  const styles = {
    upcoming: ELIMINATION_THEME.statusUpcoming,
    ongoing: ELIMINATION_THEME.statusOngoing,
    finished: ELIMINATION_THEME.statusFinished,
  };

  return (
    <span
      className={`absolute top-0 right-0 px-2 py-0.5 text-[10px] ${styles[status]}`}
      data-testid="match-status"
    >
      {status === 'upcoming' ? '未开始' : status === 'ongoing' ? '进行中' : '已结束'}
    </span>
  );
};

// 队伍Logo组件
const BracketTeamLogo: React.FC<{ team?: Team; size?: number }> = ({ team, size = 20 }) => {
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
  return (
    <div
      className="rounded-full bg-gray-600"
      style={{ width: size, height: size }}
    />
  );
};

// 单行队伍组件 - 紧凑设计
const TeamRow: React.FC<{
  team?: Team;
  score: number;
  isWinner: boolean;
  isLoser: boolean;
  testId?: string;
}> = ({ team, score, isWinner, isLoser, testId }) => {
  return (
    <div
      className="flex items-center justify-between px-3"
      style={{
        backgroundColor: isWinner ? 'rgba(200, 170, 110, 0.2)' : 'transparent',
        height: '36px', // 固定行高，更紧凑
      }}
      data-testid={testId}
    >
      {/* 左侧：队标 + 队名 */}
      <div className="flex items-center gap-2">
        <BracketTeamLogo team={team} size={20} />
        <span
          className="font-medium truncate"
          style={{
            fontSize: '12px',
            color: isWinner ? ELIMINATION_THEME.winnerText : ELIMINATION_THEME.loserText,
            maxWidth: '90px',
          }}
          data-testid={`${testId}-name`}
        >
          {team?.name || '待定'}
        </span>
      </div>

      {/* 右侧：小分 */}
      <span
        className="font-bold text-base w-5 text-center"
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

    const isTeamAWinner = isFinished && match.winnerId === match.teamAId;
    const isTeamBWinner = isFinished && match.winnerId === match.teamBId;
    const hasWinner = isFinished && match.winnerId;

    return (
      <div
        ref={ref}
        className="relative flex flex-col"
        style={{
          backgroundColor: ELIMINATION_THEME.cardBackground,
          width: ELIMINATION_THEME.cardWidth,
          height: ELIMINATION_THEME.matchCardHeight,
        }}
        data-testid={testId || 'bracket-match'}
      >
        {/* 状态徽章 */}
        <BracketStatusBadge status={match.status} />

        {/* 战队1 - 上方 */}
        <TeamRow
          team={teamA}
          score={match.scoreA}
          isWinner={isTeamAWinner}
          isLoser={hasWinner && !isTeamAWinner}
          testId={`${testId}-team-a`}
        />

        {/* 分隔线 */}
        <div
          className="mx-3 h-px"
          style={{ backgroundColor: ELIMINATION_THEME.cardBorder }}
        />

        {/* 战队2 - 下方 */}
        <TeamRow
          team={teamB}
          score={match.scoreB}
          isWinner={isTeamBWinner}
          isLoser={hasWinner && !isTeamBWinner}
          testId={`${testId}-team-b`}
        />
      </div>
    );
  }
);

BracketMatchCard.displayName = 'BracketMatchCard';

export default BracketMatchCard;
