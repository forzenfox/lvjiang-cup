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

  return (
    <div
      className={`flex flex-col items-center p-3 bg-[#0F172A] transition-colors active:scale-[0.98] transition-transform duration-100 touch-manipulation ${
        onClick ? 'cursor-pointer hover:bg-gray-800/50' : ''
      } ${className}`}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center gap-3 w-full">
        {/* 左侧队伍 */}
        <div className="flex flex-col items-center gap-0.5 flex-1">
          <SwissTeamLogo team={teamA} size={40} />
          <span
            className={`text-sm font-medium ${
              match.winnerId === match.teamAId ? 'text-white' : 'text-gray-400'
            }`}
            data-testid={`${testId}-team-a-name`}
          >
            {teamA?.name || '待定'}
          </span>
        </div>

        {/* 中间比分 */}
        <div className="flex items-center justify-center gap-1 flex-shrink-0">
          <span
            className={`text-xl font-bold ${
              match.winnerId === match.teamAId ? 'text-[#F59E0B]' : 'text-white'
            }`}
            data-testid={`${testId}-score-a`}
          >
            {match.scoreA ?? '--'}
          </span>
          <span className="text-gray-500 text-sm">:</span>
          <span
            className={`text-xl font-bold ${
              match.winnerId === match.teamBId ? 'text-[#F59E0B]' : 'text-white'
            }`}
            data-testid={`${testId}-score-b`}
          >
            {match.scoreB ?? '--'}
          </span>
          {match.boFormat && (
            <span className="text-[10px] text-gray-500 ml-1">{match.boFormat}</span>
          )}
        </div>

        {/* 右侧队伍 */}
        <div className="flex flex-col items-center gap-0.5 flex-1">
          <SwissTeamLogo team={teamB} size={40} />
          <span
            className={`text-sm font-medium ${
              match.winnerId === match.teamBId ? 'text-white' : 'text-gray-400'
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
