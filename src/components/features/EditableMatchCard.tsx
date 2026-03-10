import React, { useState } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';
import MatchEditDialog from '@/pages/admin/components/MatchEditDialog';

interface EditableMatchCardProps {
  match: Match;
  teams: Team[];
  onUpdate: (match: Match) => void;
}

const EditableMatchCard: React.FC<EditableMatchCardProps> = ({ match, teams, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isFinished = match.status === 'finished';

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
  };

  return (
    <>
      <Card 
        className="bg-gray-800/80 border-gray-700 p-2.5 hover:bg-gray-800 transition-colors group relative overflow-hidden cursor-pointer hover:border-blue-500/50"
        onClick={handleClick}
      >
        {getStatusBadge(match.status)}
        
        {match.startTime && (
          <div className="absolute top-0 left-0 bg-gray-700/50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-br flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDateTime(match.startTime)}</span>
          </div>
        )}
        
        <div className="flex flex-col gap-2 pt-4">
          <div className={`flex items-center justify-between ${match.winnerId === match.teamAId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center gap-2">
              {teamA?.logo ? (
                <img src={teamA.logo} alt={teamA.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-700" />
              )}
              <span className={`text-sm font-medium ${match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-300'}`}>
                {teamA?.name || '待定'}
              </span>
            </div>
            <span className={`text-sm font-bold ${match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-500'}`}>
              {match.scoreA}
            </span>
          </div>

          <div className={`flex items-center justify-between ${match.winnerId === match.teamBId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center gap-2">
              {teamB?.logo ? (
                <img src={teamB.logo} alt={teamB.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-700" />
              )}
              <span className={`text-sm font-medium ${match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-300'}`}>
                {teamB?.name || '待定'}
              </span>
            </div>
            <span className={`text-sm font-bold ${match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-500'}`}>
              {match.scoreB}
            </span>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>

      <MatchEditDialog
        match={match}
        teams={teams}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};

export default EditableMatchCard;
