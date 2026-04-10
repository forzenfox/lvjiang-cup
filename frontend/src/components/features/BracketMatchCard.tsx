import React from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { BarChart2, Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';

interface BracketMatchCardProps {
  match: Match;
  teams: Team[];
  testId?: string;
}

const BracketStatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
  const styles = {
    upcoming: 'bg-blue-900/40 text-blue-400 border-blue-700/30',
    ongoing: 'bg-green-900/50 text-green-400 border-green-700/30 animate-pulse',
    finished: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
  };

  return (
    <span
      className={`absolute top-0 right-0 px-1.5 py-0.5 text-[10px] rounded-bl border ${styles[status]}`}
      data-testid="match-status"
    >
      {status === 'upcoming' ? '未开始' : status === 'ongoing' ? '进行中' : '已结束'}
    </span>
  );
};

const BracketMatchCard = React.forwardRef<HTMLDivElement, BracketMatchCardProps>(
  ({ match, teams, testId }, ref) => {
    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);
    const isGrandFinals = match.eliminationBracket === 'finals';

    // Determine winner
    const teamAWon = match.winnerId === match.teamAId;
    const teamBWon = match.winnerId === match.teamBId;

    return (
      <div className="flex flex-col gap-1 relative group" data-testid={testId || 'bracket-match'}>
        <Card
          ref={ref}
          className={`
          relative overflow-hidden
          ${isGrandFinals ? 'w-56 border-yellow-500/50 bg-gradient-to-br from-yellow-900/30 to-gray-800' : 'w-48'}
          bg-gray-800/90 border-gray-700
          hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300
          z-10
        `}
        >
          {/* 状态徽章 */}
          <BracketStatusBadge status={match.status} />
          {/* Header: Date & Status */}
          <div className="bg-gray-900/50 px-3 py-1 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{match.startTime ? formatDateTime(match.startTime) : '待定'}</span>
            </div>
            {isGrandFinals && <span className="text-xs text-yellow-500 font-bold">总决赛</span>}
          </div>

          {/* Team A */}
          <div
            data-team="a"
            className={`
            flex items-center justify-between px-3 py-2 border-b border-gray-700/50
            ${teamAWon ? 'bg-yellow-500/10' : ''}
          `}
            data-testid="team-a"
          >
            <div className="flex items-center gap-2">
              {teamA?.logo ? (
                <img
                  src={teamA.logo}
                  alt={teamA.name}
                  className="w-5 h-5 rounded-full object-cover"
                  data-testid="team-a-logo"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-700" />
              )}
              <span
                className={`
                text-sm font-medium truncate max-w-[90px]
                ${teamAWon ? 'text-yellow-400' : 'text-gray-300'}
              `}
                data-testid="team-a-name"
              >
                {teamA?.name || '待定'}
              </span>
            </div>
            <span
              className={`
              text-sm font-bold w-6 text-center
              ${teamAWon ? 'text-yellow-400' : 'text-gray-500'}
            `}
              data-testid="team-a-score"
            >
              {match.scoreA}
            </span>
          </div>

          {/* Team B */}
          <div
            data-team="b"
            className={`
            flex items-center justify-between px-3 py-2
            ${teamBWon ? 'bg-yellow-500/10' : ''}
          `}
            data-testid="team-b"
          >
            <div className="flex items-center gap-2">
              {teamB?.logo ? (
                <img
                  src={teamB.logo}
                  alt={teamB.name}
                  className="w-5 h-5 rounded-full object-cover"
                  data-testid="team-b-logo"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-700" />
              )}
              <span
                className={`
                text-sm font-medium truncate max-w-[90px]
                ${teamBWon ? 'text-yellow-400' : 'text-gray-300'}
              `}
                data-testid="team-b-name"
              >
                {teamB?.name || '待定'}
              </span>
            </div>
            <span
              className={`
              text-sm font-bold w-6 text-center
              ${teamBWon ? 'text-yellow-400' : 'text-gray-500'}
            `}
              data-testid="team-b-score"
            >
              {match.scoreB}
            </span>
          </div>
        </Card>

        {/* Action Buttons (Show on hover or always?) - Screenshot shows them always but maybe small */}
        <div className="flex justify-end gap-1 opacity-60 hover:opacity-100 transition-opacity px-1">
          <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white bg-gray-800/50 px-1.5 py-0.5 rounded border border-gray-700">
            <BarChart2 className="w-3 h-3" />
            数据
          </button>
        </div>
      </div>
    );
  }
);

BracketMatchCard.displayName = 'BracketMatchCard';

export default BracketMatchCard;
