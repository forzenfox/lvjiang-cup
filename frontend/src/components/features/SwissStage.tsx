import React from 'react';
import { Match, Team } from '@/types';
import { useAdvancementStore } from '@/store/advancementStore';
import { SwissMatchCard, SwissStatusBadge, SwissTeamList } from './swiss';

// 10个战绩分组的配置
const RECORD_GROUPS = [
  { record: '0-0', label: 'Round 1', isBo1: true },
  { record: '1-0', label: 'Round 2 High', isBo3: true },
  { record: '0-1', label: 'Round 2 Low', isBo3: true },
  { record: '2-0', label: '2-0 Group', isBo3: true, isQualified: true },
  { record: '1-1', label: 'Round 3 Mid', isBo3: true },
  { record: '0-2', label: 'Round 3 Low', isBo3: true },
  { record: '3-0', label: '3-0 Group', isBo3: true, isQualified: true },
  { record: '2-1', label: 'Round 4 High', isBo3: true, isQualified: true },
  { record: '1-2', label: 'Last Chance', isBo3: true },
  { record: '0-3', label: '0-3 Group', isBo3: true, isEliminated: true },
];

interface SwissStageProps {
  matches: Match[];
  teams: Team[];
  advancement?: {
    top8: string[];
    eliminated: string[];
  };
}

const RoundColumn: React.FC<{
  roundName: string;
  isBo3: boolean;
  matches: Match[];
  teams: Team[];
  className?: string;
  record?: string;
}> = ({ roundName, isBo3, matches, teams, className, record }) => {
  return (
    <div
      className={`flex flex-col gap-3 min-w-[200px] ${className}`}
      data-testid="swiss-round-column"
    >
      <div className="text-center pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{roundName}</h3>
        <div className="flex items-center justify-center mt-1">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isBo3 ? 'bg-blue-600/20 text-blue-400' : 'bg-green-600/20 text-green-400'
            }`}
          >
            {isBo3 ? 'BO3' : 'BO1'}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 min-h-[60px]" data-testid="swiss-match-list">
        {matches.length > 0 ? (
          matches.map((match, idx) => (
            <SwissMatchCard key={match.id} match={match} teams={teams} />
          ))
        ) : (
          <div
            className="flex items-center justify-center h-20 border border-dashed border-gray-800 rounded bg-gray-900/30 text-xs text-gray-600"
            data-testid="swiss-empty-slot"
          >
            等待对阵
          </div>
        )}
      </div>
    </div>
  );
};

const SwissStage: React.FC<SwissStageProps> = ({
  matches,
  teams,
  advancement: propAdvancement,
}) => {
  // 从 store 获取晋级名单（如果没有传入 props）
  const storeAdvancement = useAdvancementStore(state => state.advancement);
  const advancement = propAdvancement || {
    top8: storeAdvancement.top8,
    eliminated: storeAdvancement.eliminated,
  };

  // 按战绩分组
  const matchesByRecord = RECORD_GROUPS.reduce(
    (acc, group) => {
      acc[group.record] = matches.filter(m => m.swissRecord === group.record);
      return acc;
    },
    {} as Record<string, Match[]>
  );

  return (
    <div className="w-full" data-testid="swiss-stage">
      <div className="flex flex-wrap justify-center gap-8 p-4" data-testid="swiss-container">
        {/* 第一轮：0-0 */}
        <div className="flex flex-col gap-4 w-64" data-testid="swiss-round-1">
          <RoundColumn
            roundName={RECORD_GROUPS[0].label}
            isBo3={false}
            matches={matchesByRecord['0-0']}
            teams={teams}
            record="0-0"
          />
        </div>

        {/* 第二轮：1-0 & 0-1 */}
        <div className="flex flex-col gap-8 w-64 mt-8" data-testid="swiss-round-2">
          <RoundColumn
            roundName={RECORD_GROUPS[1].label}
            isBo3={true}
            matches={matchesByRecord['1-0']}
            teams={teams}
            record="1-0"
          />
          <RoundColumn
            roundName={RECORD_GROUPS[2].label}
            isBo3={true}
            matches={matchesByRecord['0-1']}
            teams={teams}
            record="0-1"
          />
        </div>

        {/* 第三轮：2-0, 1-1, 0-2 */}
        <div className="flex flex-col gap-8 w-64" data-testid="swiss-round-3">
          {/* 2-0 晋级 */}
          <div className="flex flex-col gap-2" data-testid="swiss-record-group-2-0">
            <SwissStatusBadge type="qualified">2-0 TOP 8</SwissStatusBadge>
            <SwissTeamList teams={teams} ids={advancement.top8.slice(0, 4)} />
          </div>

          <RoundColumn
            roundName={RECORD_GROUPS[4].label}
            isBo3={true}
            matches={matchesByRecord['1-1']}
            teams={teams}
            record="1-1"
          />

          <div className="mt-4">
            <RoundColumn
              roundName={RECORD_GROUPS[5].label}
              isBo3={true}
              matches={matchesByRecord['0-2']}
              teams={teams}
              record="0-2"
            />
          </div>
        </div>

        {/* 第四轮：3-0, 2-1, 1-2, 0-3 */}
        <div className="flex flex-col gap-8 w-64" data-testid="swiss-round-4">
          {/* 3-0 晋级 */}
          <div className="flex flex-col gap-2" data-testid="swiss-record-group-3-0">
            <SwissStatusBadge type="qualified">3-0 TOP 8</SwissStatusBadge>
            <SwissTeamList teams={teams} ids={advancement.top8.slice(4, 6)} />
          </div>

          <RoundColumn
            roundName={RECORD_GROUPS[7].label}
            isBo3={true}
            matches={matchesByRecord['2-1']}
            teams={teams}
            record="2-1"
          />

          <RoundColumn
            roundName={RECORD_GROUPS[8].label}
            isBo3={true}
            matches={matchesByRecord['1-2']}
            teams={teams}
            record="1-2"
          />

          {/* 0-3 淘汰 */}
          <div className="flex flex-col gap-2 mt-4" data-testid="swiss-record-group-0-3">
            <SwissStatusBadge type="eliminated">0-3 淘汰</SwissStatusBadge>
            <SwissTeamList teams={teams} ids={advancement.eliminated} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwissStage;