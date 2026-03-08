import React from 'react';
import { Match, Team } from '@/types';
import { Card } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

interface BracketMatchCardProps {
  match: Match;
  teams: Team[];
}

const BracketMatchCard = React.forwardRef<HTMLDivElement, BracketMatchCardProps>(({ match, teams }, ref) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isGrandFinals = match.eliminationBracket === 'grand_finals';

  // Determine winner
  const teamAWon = match.winnerId === match.teamAId;
  const teamBWon = match.winnerId === match.teamBId;

  return (
    <div className="flex flex-col gap-1 relative group">
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
        {/* Header: Date & Status */}
        <div className="bg-gray-900/50 px-3 py-1 flex justify-between items-center border-b border-gray-700">
          <span className="text-xs text-gray-400">{match.round}</span>
          {isGrandFinals && <span className="text-xs text-yellow-500 font-bold">总决赛</span>}
        </div>

        {/* Team A */}
        <div 
          data-team="a"
          className={`
            flex items-center justify-between px-3 py-2 border-b border-gray-700/50
            ${teamAWon ? 'bg-yellow-500/10' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            {teamA?.logo ? (
              <img 
                src={teamA.logo} 
                alt={teamA.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-700" />
            )}
            <span 
              className={`
                text-sm font-medium truncate max-w-[90px]
                ${teamAWon ? 'text-yellow-400' : 'text-gray-300'}
              `}
            >
              {teamA?.name || '待定'}
            </span>
          </div>
          <span 
            className={`
              text-sm font-bold w-6 text-center
              ${teamAWon ? 'text-yellow-400' : 'text-gray-500'}
            `}
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
        >
          <div className="flex items-center gap-2">
            {teamB?.logo ? (
              <img 
                src={teamB.logo} 
                alt={teamB.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-700" />
            )}
            <span 
              className={`
                text-sm font-medium truncate max-w-[90px]
                ${teamBWon ? 'text-yellow-400' : 'text-gray-300'}
              `}
            >
              {teamB?.name || '待定'}
            </span>
          </div>
          <span 
            className={`
              text-sm font-bold w-6 text-center
              ${teamBWon ? 'text-yellow-400' : 'text-gray-500'}
            `}
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
});

BracketMatchCard.displayName = 'BracketMatchCard';

export default BracketMatchCard;
