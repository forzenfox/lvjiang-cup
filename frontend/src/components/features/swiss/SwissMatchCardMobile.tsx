import React from 'react';
import { Match, Team } from '@/types';
import SwissTeamLogo from './SwissTeamLogo';

interface SwissMatchCardMobileProps {
  match: Match;
  teams: Team[];
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

const SwissMatchCardMobile: React.FC<SwissMatchCardMobileProps> = ({
  match,
  teams,
  onClick,
  className = '',
  'data-testid': testId = 'swiss-match-card-mobile',
}) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isFinished = match.status === 'finished';

  return (
    <div
      className={`flex flex-col items-center p-4 bg-[#0F172A] border-b border-[#1E293B] transition-colors ${
        onClick ? 'cursor-pointer hover:bg-gray-800/50' : ''
      } ${className}`}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="flex flex-col items-center gap-1">
          <SwissTeamLogo team={teamA} size={48} />
          <span
            className={`text-base font-medium ${
              match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-300'
            }`}
            data-testid={`${testId}-team-a-name`}
          >
            {teamA?.name || '待定'}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <span
            className={`text-2xl font-bold ${
              match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-white'
            }`}
            data-testid={`${testId}-score-a`}
          >
            {match.scoreA ?? '--'}
          </span>
          <span className="text-gray-500 text-xl mx-2">:</span>
          <span
            className={`text-2xl font-bold ${
              match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-white'
            }`}
            data-testid={`${testId}-score-b`}
          >
            {match.scoreB ?? '--'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <SwissTeamLogo team={teamB} size={48} />
          <span
            className={`text-base font-medium ${
              match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-300'
            }`}
            data-testid={`${testId}-team-b-name`}
          >
            {teamB?.name || '待定'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SwissMatchCardMobile;