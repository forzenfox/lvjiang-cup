import React, { useState, useEffect } from 'react';
import { Match, Team, MatchStatus } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Save, X, Edit, Check, PlayCircle, Trophy } from 'lucide-react';

interface MatchRowProps {
  match: Match;
  teams: Team[];
  onUpdate: (updatedMatch: Match) => void;
  loading?: boolean;
}

const MatchRow: React.FC<MatchRowProps> = ({ match, teams, onUpdate, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Match>(match);

  // Sync formData when match prop changes (e.g. external update)
  useEffect(() => {
    setFormData(match);
  }, [match]);

  const handleChange = <K extends keyof Match>(field: K, value: Match[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Auto-calculate winner if finished
    const updated = { ...formData };
    if (updated.status === 'finished' && !updated.winnerId) {
      if (updated.scoreA > updated.scoreB) updated.winnerId = updated.teamAId;
      else if (updated.scoreB > updated.scoreA) updated.winnerId = updated.teamBId;
    }
    
    onUpdate(updated);
    setIsEditing(false);
  };

  const handleQuickStatus = (status: MatchStatus) => {
    const updated = { ...match, status };
    
    // Auto-finish logic
    if (status === 'finished') {
      if (match.scoreA > match.scoreB) updated.winnerId = match.teamAId;
      else if (match.scoreB > match.scoreA) updated.winnerId = match.teamBId;
    }

    onUpdate(updated);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Helper to get team name
  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'TBD';

  if (isEditing) {
    return (
      <div className="bg-gray-800/50 border border-blue-500/50 rounded-lg p-4 mb-2 animate-in fade-in zoom-in-95 duration-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Time & Round */}
          <div className="md:col-span-3 space-y-2">
            <input
              type="text"
              value={formData.round}
              onChange={(e) => handleChange('round', e.target.value)}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
              placeholder="Round"
            />
            <input
              type="datetime-local"
              value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('startTime', new Date(e.target.value).toISOString())}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
            />
          </div>

          {/* Teams & Scores */}
          <div className="md:col-span-5 flex items-center justify-center gap-2">
             <div className="flex flex-col gap-1 w-full">
               <select
                 value={formData.teamAId}
                 onChange={(e) => handleChange('teamAId', e.target.value)}
                 className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
               >
                 <option value="">Select Team A</option>
                 {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
               <input
                 type="number"
                 value={formData.scoreA}
                 onChange={(e) => handleChange('scoreA', parseInt(e.target.value))}
                 className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-center text-white font-bold"
               />
             </div>
             
             <span className="text-gray-500 font-bold">VS</span>
             
             <div className="flex flex-col gap-1 w-full">
               <select
                 value={formData.teamBId}
                 onChange={(e) => handleChange('teamBId', e.target.value)}
                 className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
               >
                 <option value="">Select Team B</option>
                 {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
               <input
                 type="number"
                 value={formData.scoreB}
                 onChange={(e) => handleChange('scoreB', parseInt(e.target.value))}
                 className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-center text-white font-bold"
               />
             </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
             <select
               value={formData.status}
               onChange={(e) => handleChange('status', e.target.value as MatchStatus)}
               className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
             >
               <option value="upcoming">Upcoming</option>
               <option value="ongoing">Ongoing</option>
               <option value="finished">Finished</option>
             </select>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button size="sm" onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  const isWinnerA = match.winnerId === match.teamAId;
  const isWinnerB = match.winnerId === match.teamBId;

  return (
    <div className="bg-gray-800/30 hover:bg-gray-800/50 border-b border-gray-700/50 p-4 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Time & Round */}
        <div className="md:col-span-3 text-sm">
          <div className="text-gray-300 font-medium">{match.round}</div>
          <div className="text-gray-500 text-xs">{formatTime(match.startTime)}</div>
          {match.stage === 'elimination' && (
             <div className="text-xs text-yellow-500/70 mt-1">
               {match.eliminationBracket === 'winners' ? '胜者组' : match.eliminationBracket === 'losers' ? '败者组' : '总决赛'}
               {match.nextMatchId && ` -> ${match.nextMatchId}`}
             </div>
          )}
        </div>

        {/* Teams & Scores */}
        <div className="md:col-span-5 flex items-center justify-center gap-4">
           {/* Team A */}
           <div className={`flex-1 text-right ${isWinnerA ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
             {getTeamName(match.teamAId)}
           </div>
           
           {/* Score */}
           <div className="bg-gray-900 px-3 py-1 rounded text-white font-mono font-bold tracking-widest min-w-[60px] text-center border border-gray-700">
             {match.scoreA} - {match.scoreB}
           </div>
           
           {/* Team B */}
           <div className={`flex-1 text-left ${isWinnerB ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
             {getTeamName(match.teamBId)}
           </div>
        </div>

        {/* Status */}
        <div className="md:col-span-2 text-center">
           <span className={`
             inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             ${match.status === 'finished' ? 'bg-gray-700 text-gray-300' : 
               match.status === 'ongoing' ? 'bg-green-900/50 text-green-400 animate-pulse' : 
               'bg-blue-900/30 text-blue-400'}
           `}>
             {match.status === 'finished' ? '已结束' : match.status === 'ongoing' ? '进行中' : '未开始'}
           </span>
           {match.winnerId && <Trophy className="w-3 h-3 text-yellow-500 inline ml-1" />}
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end gap-2">
          {match.status === 'upcoming' && (
            <Button size="sm" variant="ghost" onClick={() => handleQuickStatus('ongoing')} title="Start Match" className="text-green-400 hover:text-green-300 hover:bg-green-900/20">
              <PlayCircle className="w-4 h-4" />
            </Button>
          )}
          
          {match.status === 'ongoing' && (
             <Button size="sm" variant="ghost" onClick={() => handleQuickStatus('finished')} title="End Match" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
               <Check className="w-4 h-4" />
             </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} title="Edit">
            <Edit className="w-4 h-4 text-blue-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchRow;
