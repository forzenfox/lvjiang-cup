import React, { useState } from 'react';
import { Match, Team } from '../../../types';
import MatchRow from './MatchRow';
import { Search } from 'lucide-react';

interface EliminationStageEditorProps {
  matches: Match[];
  teams: Team[];
  onUpdate: (match: Match) => void;
  loading: boolean;
}

const EliminationStageEditor: React.FC<EliminationStageEditorProps> = ({ matches, teams, onUpdate, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group matches by Bracket Type or Round
  const groupedMatches = {
    winners: matches.filter(m => m.eliminationBracket === 'winners').sort((a, b) => (a.eliminationGameNumber || 0) - (b.eliminationGameNumber || 0)),
    losers: matches.filter(m => m.eliminationBracket === 'losers').sort((a, b) => (a.eliminationGameNumber || 0) - (b.eliminationGameNumber || 0)),
    finals: matches.filter(m => m.eliminationBracket === 'grand_finals')
  };

  const filterMatches = (list: Match[]) => {
    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(m => {
      const teamA = teams.find(t => t.id === m.teamAId)?.name.toLowerCase() || '';
      const teamB = teams.find(t => t.id === m.teamBId)?.name.toLowerCase() || '';
      return teamA.includes(lower) || teamB.includes(lower);
    });
  };

  const renderSection = (title: string, list: Match[], description: string, colorClass: string) => {
    const filtered = filterMatches(list);
    if (filtered.length === 0 && searchTerm) return null;

    return (
      <div className={`mb-6 rounded-lg border overflow-hidden ${colorClass}`}>
        <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
            {filtered.length} 场
          </span>
        </div>
        <div className="divide-y divide-gray-800 bg-gray-900/20">
          {filtered.length > 0 ? (
            filtered.map(match => (
              <MatchRow 
                key={match.id} 
                match={match} 
                teams={teams} 
                onUpdate={onUpdate}
                loading={loading}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              暂无比赛
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Local Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索淘汰赛队伍..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {renderSection('胜者组 (Winners Bracket)', groupedMatches.winners, 'Round 1 (G1, G2) -> Round 2 (G5)', 'border-yellow-500/20 bg-yellow-500/5')}
      {renderSection('败者组 (Losers Bracket)', groupedMatches.losers, 'Round 1 (G3, G4) -> Round 2 (G6) -> Round 3 (G7)', 'border-blue-500/20 bg-blue-500/5')}
      {renderSection('总决赛 (Grand Finals)', groupedMatches.finals, 'Finals (G8)', 'border-purple-500/20 bg-purple-500/5')}
    </div>
  );
};

export default EliminationStageEditor;
