import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Match, Team } from '@/types';
import { formatDateTime } from '@/utils/datetime';
import SwissTeamLogo from './SwissTeamLogo';
import SwissMatchStatusBadge from './SwissMatchStatusBadge';

interface SwissMatchCardProps {
  match: Match;
  teams: Team[];
  onClick?: () => void;
  className?: string;
  record?: string;
  index?: number;
}

const SwissMatchCard: React.FC<SwissMatchCardProps> = ({
  match,
  teams,
  onClick,
  className = '',
  record,
  index,
}) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isFinished = match.status === 'finished';

  const testId = record && index !== undefined
    ? `swiss-match-card-${record}-${index}`
    : 'swiss-match';

return (
    <Card
      className={`bg-gray-800/80 border-gray-700 p-2.5 hover:bg-gray-800 transition-colors group relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-blue-500/50' : ''
      } ${className}`}
      onClick={onClick}
      data-testid={testId}
    >
      <SwissMatchStatusBadge status={match.status} />

      {match.startTime && (
        <div className="absolute top-0 left-0 bg-gray-700/50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-br flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDateTime(match.startTime)}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-4">
        {/* Team A */}
        <div
          className={`flex items-center justify-between ${
            match.winnerId === match.teamAId
              ? 'opacity-100'
              : isFinished
                ? 'opacity-50'
                : 'opacity-100'
          }`}
          data-testid="team-a"
        >
          <div className="flex items-center gap-2">
            <SwissTeamLogo team={teamA} />
            <span
              className={`text-sm font-medium ${
                match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-300'
              }`}
              data-testid="team-a-name"
            >
              {teamA?.name || '待定'}
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-500'
            }`}
            data-testid="team-a-score"
          >
            {match.scoreA}
          </span>
        </div>

        {/* Team B */}
        <div
          className={`flex items-center justify-between ${
            match.winnerId === match.teamBId
              ? 'opacity-100'
              : isFinished
                ? 'opacity-50'
                : 'opacity-100'
          }`}
          data-testid="team-b"
        >
          <div className="flex items-center gap-2">
            <SwissTeamLogo team={teamB} />
            <span
              className={`text-sm font-medium ${
                match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-300'
              }`}
              data-testid="team-b-name"
            >
              {teamB?.name || '待定'}
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-500'
            }`}
            data-testid="team-b-score"
          >
            {match.scoreB}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default SwissMatchCard;
