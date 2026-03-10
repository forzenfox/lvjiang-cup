import React from 'react';
import { Match, Team, MatchStatus } from '../../../types';
import { MatchSection } from './MatchSection';
import { MatchSearchBox } from './MatchSearchBox';
import { useTempMatchManager } from '../hooks/useTempMatchManager';
import { useMatchFilter } from '../hooks/useMatchFilter';

interface SwissStageEditorProps {
  matches: Match[];
  teams: Team[];
  onUpdate: (match: Match) => void;
  onAddMatch: (match: Omit<Match, 'id'>) => void;
  onDeleteMatch: (matchId: string) => void;
  loading: boolean;
}

const SwissStageEditor: React.FC<SwissStageEditorProps> = ({
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
        round1: [],
        round2High: [],
        round2Low: [],
        round3Mid: [],
        round3Low: [],
        round4: [],
      },
    });

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

  const pools = {
    round1: matches.filter(m => m.swissRecord === '0-0'),
    round2High: matches.filter(m => m.swissRecord === '1-0'),
    round2Low: matches.filter(m => m.swissRecord === '0-1'),
    round3Mid: matches.filter(m => m.swissRecord === '1-1'),
    round3Low: matches.filter(m => m.swissRecord === '0-2'),
    round4: matches.filter(m => m.swissRecord === '1-2'),
  };

  const handleAddTempMatch = (poolKey: string, swissRecord: string, round: string) => {
    const newMatch = createEmptyMatch(swissRecord, round);
    addTempMatch(poolKey, newMatch);
  };

  return (
    <div className="space-y-4">
      <MatchSearchBox
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholder="搜索瑞士轮队伍..."
      />

      <MatchSection
        title="Round 1"
        description="0-0 (BO1)"
        matches={filterMatches(pools.round1)}
        teams={teams}
        tempMatches={getPoolTempMatches('round1')}
        searchTerm={searchTerm}
        onUpdate={onUpdate}
        onDelete={onDeleteMatch}
        onAdd={onAddMatch}
        onCancel={(tempId) => cancelTempMatch('round1', tempId)}
        loading={loading}
        onAddClick={() => handleAddTempMatch('round1', '0-0', 'Round 1')}
        matchRowProps={{ fixedSwissRecord: '0-0' }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatchSection
          title="Round 2 High"
          description="1-0 (BO3)"
          matches={filterMatches(pools.round2High)}
          teams={teams}
          tempMatches={getPoolTempMatches('round2High')}
          searchTerm={searchTerm}
          onUpdate={onUpdate}
          onDelete={onDeleteMatch}
          onAdd={onAddMatch}
          onCancel={(tempId) => cancelTempMatch('round2High', tempId)}
          loading={loading}
          onAddClick={() => handleAddTempMatch('round2High', '1-0', 'Round 2 High')}
          matchRowProps={{ fixedSwissRecord: '1-0' }}
        />
        <MatchSection
          title="Round 2 Low"
          description="0-1 (BO3)"
          matches={filterMatches(pools.round2Low)}
          teams={teams}
          tempMatches={getPoolTempMatches('round2Low')}
          searchTerm={searchTerm}
          onUpdate={onUpdate}
          onDelete={onDeleteMatch}
          onAdd={onAddMatch}
          onCancel={(tempId) => cancelTempMatch('round2Low', tempId)}
          loading={loading}
          onAddClick={() => handleAddTempMatch('round2Low', '0-1', 'Round 2 Low')}
          matchRowProps={{ fixedSwissRecord: '0-1' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatchSection
          title="Round 3 Mid"
          description="1-1 (BO3)"
          matches={filterMatches(pools.round3Mid)}
          teams={teams}
          tempMatches={getPoolTempMatches('round3Mid')}
          searchTerm={searchTerm}
          onUpdate={onUpdate}
          onDelete={onDeleteMatch}
          onAdd={onAddMatch}
          onCancel={(tempId) => cancelTempMatch('round3Mid', tempId)}
          loading={loading}
          onAddClick={() => handleAddTempMatch('round3Mid', '1-1', 'Round 3 Mid')}
          matchRowProps={{ fixedSwissRecord: '1-1' }}
        />
        <MatchSection
          title="Round 3 Low"
          description="0-2 (BO3 - 生死战)"
          matches={filterMatches(pools.round3Low)}
          teams={teams}
          tempMatches={getPoolTempMatches('round3Low')}
          searchTerm={searchTerm}
          onUpdate={onUpdate}
          onDelete={onDeleteMatch}
          onAdd={onAddMatch}
          onCancel={(tempId) => cancelTempMatch('round3Low', tempId)}
          loading={loading}
          onAddClick={() => handleAddTempMatch('round3Low', '0-2', 'Round 3 Low')}
          matchRowProps={{ fixedSwissRecord: '0-2' }}
        />
      </div>

      <MatchSection
        title="Round 4"
        description="1-2 (BO3 - 积分循环赛)"
        matches={filterMatches(pools.round4)}
        teams={teams}
        tempMatches={getPoolTempMatches('round4')}
        searchTerm={searchTerm}
        onUpdate={onUpdate}
        onDelete={onDeleteMatch}
        onAdd={onAddMatch}
        onCancel={(tempId) => cancelTempMatch('round4', tempId)}
        loading={loading}
        onAddClick={() => handleAddTempMatch('round4', '1-2', 'Round 4')}
        matchRowProps={{ fixedSwissRecord: '1-2' }}
      />
    </div>
  );
};

export default SwissStageEditor;
