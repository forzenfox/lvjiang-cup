import React, { useState, forwardRef } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock, BarChart2 } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';
import MatchEditDialog from '@/pages/admin/components/MatchEditDialog';

interface EditableBracketMatchCardProps {
  match: Match;
  teams: Team[];
  onUpdate: (match: Match) => void;
}

const EditableBracketMatchCard = forwardRef<HTMLDivElement, EditableBracketMatchCardProps>(
  ({ match, teams, onUpdate }, ref) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);

    const teamAWon = match.winnerId === match.teamAId;
    const teamBWon = match.winnerId === match.teamBId;

    const getStatusBadge = (status: MatchStatus) => {
      const styles = {
        upcoming: 'bg-blue-900/40 text-blue-400 border-blue-700/30',
        ongoing: 'bg-green-900/50 text-green-400 border-green-700/30 animate-pulse',
        finished: 'bg-gray-700/50 text-gray-400 border-gray-600/30'
      };
      
      return (
        <span className={`absolute top-0 right-0 px-1.5 py-0.5 text-[10px] rounded-bl border ${styles[status]}`}>
          {status === 'upcoming' ? '未开始' : status === 'ongoing' ? '进行中' : '已结束'}
        </span>
      );
    };

    const handleClick = () => {
      setIsDialogOpen(true);
    };

    const handleSave = (updatedMatch: Match) => {
      onUpdate(updatedMatch);
      return true;
    };

    return (
      <>
        <div className="flex flex-col gap-1 relative group cursor-pointer" onClick={handleClick}>
          <Card 
            ref={ref}
            className="
              relative overflow-hidden transition-all duration-300
              w-48
              bg-gray-800/90 border-gray-700
              hover:shadow-lg hover:shadow-yellow-500/10 hover:border-blue-500/50
              z-10
            "
          >
            {getStatusBadge(match.status)}

            <div className="bg-gray-900/50 px-3 py-1 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{match.startTime ? formatDateTime(match.startTime) : '待定'}</span>
              </div>
            </div>

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

            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Card>
          
          <div className="flex justify-end gap-1 opacity-60 hover:opacity-100 transition-opacity px-1">
            <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white bg-gray-800/50 px-1.5 py-0.5 rounded border border-gray-700">
              <BarChart2 className="w-3 h-3" />
              编辑
            </button>
          </div>
        </div>

        <MatchEditDialog
          match={match}
          teams={teams}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
        />
      </>
    );
  }
);

EditableBracketMatchCard.displayName = 'EditableBracketMatchCard';

export default EditableBracketMatchCard;
