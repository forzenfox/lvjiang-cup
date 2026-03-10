/* ========================================================================
   TODO [废弃] 旧版列表编辑模式 - 请使用可视化编辑器 EliminationStageVisualEditor
   废弃时间: 2024-03-10
   计划移除时间: v2.0
   
   此组件暂时保留以便后续迁移，默认已切换到可视化编辑器
   如需切换回旧版，请在 Schedule.tsx 中将 eliminationViewMode 改为 'list'
   ======================================================================== */

import React from 'react';
import { Match, Team, MatchStatus, EliminationBracket } from '../../../types';
import { MatchSection } from './MatchSection';
import { MatchSearchBox } from './MatchSearchBox';
import { useTempMatchManager } from '../hooks/useTempMatchManager';
import { useMatchFilter } from '../hooks/useMatchFilter';

interface EliminationStageEditorProps {
  matches: Match[];
  teams: Team[];
  onUpdate: (match: Match) => void;
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  onDeleteMatch: (matchId: string) => void;
  loading: boolean;
}

const EliminationStageEditor: React.FC<EliminationStageEditorProps> = ({
  matches,
  teams,
  onUpdate,
  onAddMatch,
  onDeleteMatch,
  loading,
}) => {
  const { searchTerm, setSearchTerm, filterMatches } = useMatchFilter(teams);

  const { addTempMatch, cancelTempMatch, getPoolTempMatches } =
    useTempMatchManager<Match>({
      initialGroups: {
        winners: [],
        losers: [],
        finals: [],
      },
    });

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

  const groupedMatches = {
    winners: matches
      .filter(m => m.eliminationBracket === 'winners')
      .sort((a, b) => (a.eliminationGameNumber || 0) - (b.eliminationGameNumber || 0)),
    losers: matches
      .filter(m => m.eliminationBracket === 'losers')
      .sort((a, b) => (a.eliminationGameNumber || 0) - (b.eliminationGameNumber || 0)),
    finals: matches.filter(m => m.eliminationBracket === 'grand_finals'),
  };

  const handleAddTempMatch = (
    eliminationBracket: EliminationBracket,
    round: string
  ) => {
    const newMatch = createEmptyMatch(eliminationBracket, round);
    addTempMatch(round, newMatch);
  };

  return (
    <div className="space-y-4">
      <MatchSearchBox
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="搜索淘汰赛队伍..."
      />

      <MatchSection
        title="胜者组 (Winners Bracket)"
        description="Round 1 (G1, G2) -> Round 2 (G5)"
        matches={filterMatches(groupedMatches.winners)}
        teams={teams}
        tempMatches={getPoolTempMatches('winners')}
        searchTerm={searchTerm}
        onUpdate={onUpdate}
        onDelete={onDeleteMatch}
        onAdd={onAddMatch}
        onCancel={(tempId) => cancelTempMatch('winners', tempId)}
        loading={loading}
        containerClassName="mb-6 rounded-lg border overflow-hidden border-yellow-500/20 bg-yellow-500/5"
        onAddClick={() => handleAddTempMatch('winners', 'winners')}
      />

      <MatchSection
        title="败者组 (Losers Bracket)"
        description="Round 1 (G3, G4) -> Round 2 (G6) -> Round 3 (G7)"
        matches={filterMatches(groupedMatches.losers)}
        teams={teams}
        tempMatches={getPoolTempMatches('losers')}
        searchTerm={searchTerm}
        onUpdate={onUpdate}
        onDelete={onDeleteMatch}
        onAdd={onAddMatch}
        onCancel={(tempId) => cancelTempMatch('losers', tempId)}
        loading={loading}
        containerClassName="mb-6 rounded-lg border overflow-hidden border-blue-500/20 bg-blue-500/5"
        onAddClick={() => handleAddTempMatch('losers', 'losers')}
      />

      <MatchSection
        title="总决赛 (Grand Finals)"
        description="Finals (G8)"
        matches={filterMatches(groupedMatches.finals)}
        teams={teams}
        tempMatches={getPoolTempMatches('finals')}
        searchTerm={searchTerm}
        onUpdate={onUpdate}
        onDelete={onDeleteMatch}
        onAdd={onAddMatch}
        onCancel={(tempId) => cancelTempMatch('finals', tempId)}
        loading={loading}
        containerClassName="mb-6 rounded-lg border overflow-hidden border-purple-500/20 bg-purple-500/5"
        onAddClick={() => handleAddTempMatch('grand_finals', 'finals')}
      />
    </div>
  );
};

export default EliminationStageEditor;
