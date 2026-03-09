import React, { useState } from 'react';
import { Match, Team, MatchStatus, EliminationBracket } from '../../../types';
import MatchRow from './MatchRow';
import { Search, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface EliminationStageEditorProps {
  matches: Match[];
  teams: Team[];
  onUpdate: (match: Match) => void;
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  loading: boolean;
}

// 临时比赛项类型
interface TempMatch {
  id: string;
  match: Match;
}

const EliminationStageEditor: React.FC<EliminationStageEditorProps> = ({ matches, teams, onUpdate, onAddMatch, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // 存储各分组的临时新增比赛项
  const [tempMatches, setTempMatches] = useState<Record<string, TempMatch[]>>({
    winners: [],
    losers: [],
    finals: [],
  });

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

  // 创建空白比赛
  const createEmptyMatch = (eliminationBracket: EliminationBracket, round: string): Match => ({
    id: `temp-${Date.now()}`,
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round,
    status: 'upcoming' as MatchStatus,
    startTime: new Date().toISOString(),
    stage: 'elimination',
    eliminationBracket,
  });

  // 添加临时比赛
  const handleAddTempMatch = (poolKey: string, eliminationBracket: EliminationBracket, round: string) => {
    const newTempMatch: TempMatch = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      match: createEmptyMatch(eliminationBracket, round),
    };
    setTempMatches(prev => ({
      ...prev,
      [poolKey]: [...prev[poolKey], newTempMatch],
    }));
  };

  // 取消临时比赛
  const handleCancelTempMatch = (poolKey: string, tempId: string) => {
    setTempMatches(prev => ({
      ...prev,
      [poolKey]: prev[poolKey].filter(t => t.id !== tempId),
    }));
  };

  // 保存临时比赛
  const handleSaveTempMatch = (poolKey: string, tempId: string, match: Omit<Match, 'id'>) => {
    onAddMatch(match);
    // 保存成功后移除临时项
    setTempMatches(prev => ({
      ...prev,
      [poolKey]: prev[poolKey].filter(t => t.id !== tempId),
    }));
  };

  const renderSection = (
    title: string,
    list: Match[],
    description: string,
    colorClass: string,
    poolKey: string,
    eliminationBracket: EliminationBracket
  ) => {
    const filtered = filterMatches(list);
    const poolTempMatches = tempMatches[poolKey] || [];

    if (filtered.length === 0 && searchTerm && poolTempMatches.length === 0) return null;

    return (
      <div className={`mb-6 rounded-lg border overflow-hidden ${colorClass}`}>
        <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
              {filtered.length} 场
            </span>
            {!searchTerm && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAddTempMatch(poolKey, eliminationBracket, title)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-7 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                添加
              </Button>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-800 bg-gray-900/20">
          {/* 现有比赛 */}
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
            !searchTerm && poolTempMatches.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                暂无比赛
              </div>
            )
          )}

          {/* 临时新增比赛 */}
          {poolTempMatches.map(tempMatch => (
            <MatchRow
              key={tempMatch.id}
              match={tempMatch.match}
              teams={teams}
              onUpdate={onUpdate}
              onAdd={(match) => handleSaveTempMatch(poolKey, tempMatch.id, match)}
              onCancel={() => handleCancelTempMatch(poolKey, tempMatch.id)}
              loading={loading}
              isNew={true}
            />
          ))}
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

      {renderSection('胜者组 (Winners Bracket)', groupedMatches.winners, 'Round 1 (G1, G2) -> Round 2 (G5)', 'border-yellow-500/20 bg-yellow-500/5', 'winners', 'winners')}
      {renderSection('败者组 (Losers Bracket)', groupedMatches.losers, 'Round 1 (G3, G4) -> Round 2 (G6) -> Round 3 (G7)', 'border-blue-500/20 bg-blue-500/5', 'losers', 'losers')}
      {renderSection('总决赛 (Grand Finals)', groupedMatches.finals, 'Finals (G8)', 'border-purple-500/20 bg-purple-500/5', 'finals', 'grand_finals')}
    </div>
  );
};

export default EliminationStageEditor;
