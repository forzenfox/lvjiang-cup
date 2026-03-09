import React, { useState } from 'react';
import { Match, Team, MatchStatus } from '../../../types';
import MatchRow from './MatchRow';
import { Search, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface SwissStageEditorProps {
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

const SwissStageEditor: React.FC<SwissStageEditorProps> = ({ matches, teams, onUpdate, onAddMatch, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // 存储各分组的临时新增比赛项
  const [tempMatches, setTempMatches] = useState<Record<string, TempMatch[]>>({
    round1: [],
    round2High: [],
    round2Low: [],
    round3Mid: [],
    round3Low: [],
    round4: [],
  });

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

  // 创建空白比赛
  const createEmptyMatch = (swissRecord: string, round: string): Match => ({
    id: `temp-${Date.now()}`,
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round,
    status: 'upcoming' as MatchStatus,
    startTime: new Date().toISOString(),
    stage: 'swiss',
    swissRecord,
  });

  // 添加临时比赛
  const handleAddTempMatch = (poolKey: string, swissRecord: string, round: string) => {
    const newTempMatch: TempMatch = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      match: createEmptyMatch(swissRecord, round),
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
    poolKey: string,
    fixedRecord?: string
  ) => {
    const filtered = filterMatches(list);
    const poolTempMatches = tempMatches[poolKey] || [];

    if (filtered.length === 0 && searchTerm && poolTempMatches.length === 0) return null;

    return (
      <div className="mb-6 bg-gray-900/30 rounded-lg border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
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
                onClick={() => handleAddTempMatch(poolKey, fixedRecord || '', title)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-7 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                添加
              </Button>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {/* 现有比赛 */}
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
            !searchTerm && poolTempMatches.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                本轮暂无比赛
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
              fixedSwissRecord={fixedRecord}
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
          placeholder="搜索瑞士轮队伍..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {renderSection('Round 1', pools.round1, '0-0 (BO1)', 'round1', '0-0')}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection('Round 2 High', pools.round2High, '1-0 (BO3)', 'round2High', '1-0')}
        {renderSection('Round 2 Low', pools.round2Low, '0-1 (BO3)', 'round2Low', '0-1')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection('Round 3 Mid', pools.round3Mid, '1-1 (BO3)', 'round3Mid', '1-1')}
        {renderSection('Round 3 Low', pools.round3Low, '0-2 (BO3 - 生死战)', 'round3Low', '0-2')}
      </div>

      {renderSection('Round 4', pools.round4, '1-2 (BO3 - 积分循环赛)', 'round4', '1-2')}
    </div>
  );
};

export default SwissStageEditor;
