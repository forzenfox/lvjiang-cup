import React, { useState } from 'react';
import { Match, Team, MatchStatus } from '../../../types';
import MatchRow from './MatchRow';
import { Search } from 'lucide-react';

interface SwissStageEditorProps {
  matches: Match[];
  teams: Team[];
  onUpdate: (match: Match) => void;
  loading: boolean;
}

const SwissStageEditor: React.FC<SwissStageEditorProps> = ({ matches, teams, onUpdate, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Refined Grouping Logic by Pool
  const pools = {
    round1: matches.filter(m => m.swissRecord === '0-0'),
    round2High: matches.filter(m => m.swissRecord === '1-0'),
    round2Low: matches.filter(m => m.swissRecord === '0-1'),
    round3Mid: matches.filter(m => m.swissRecord === '1-1'),
    round3Low: matches.filter(m => m.swissRecord === '0-2'),
    round4: matches.filter(m => m.swissRecord === '1-2'),
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

  const renderSection = (title: string, list: Match[], description: string, fixedRecord?: string) => {
    const filtered = filterMatches(list);
    if (filtered.length === 0 && searchTerm) return null;

    return (
      <div className="mb-6 bg-gray-900/30 rounded-lg border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
            {filtered.length} 场
          </span>
        </div>
        <div className="divide-y divide-gray-800">
          {filtered.length > 0 ? (
            filtered.map(match => (
              <MatchRow 
                key={match.id} 
                match={match} 
                teams={teams} 
                onUpdate={onUpdate}
                loading={loading}
                fixedSwissRecord={fixedRecord}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              本轮暂无比赛
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
          placeholder="搜索瑞士轮队伍..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {renderSection('Round 1', pools.round1, '0-0 (BO1)', '0-0')}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection('Round 2 High', pools.round2High, '1-0 (BO3)', '1-0')}
        {renderSection('Round 2 Low', pools.round2Low, '0-1 (BO3)', '0-1')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection('Round 3 Mid', pools.round3Mid, '1-1 (BO3)', '1-1')}
        {renderSection('Round 3 Low', pools.round3Low, '0-2 (BO3 - 生死战)', '0-2')}
      </div>

      {renderSection('Round 4', pools.round4, '1-2 (BO3 - 积分循环赛)', '1-2')}
    </div>
  );
};

export default SwissStageEditor;
