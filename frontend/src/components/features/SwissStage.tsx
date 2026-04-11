import React from 'react';
import { Match, Team } from '@/types';
import { useAdvancementStore } from '@/store/advancementStore';
import { SwissStatusBadge, SwissTeamList, SwissRoundColumn } from './swiss';

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
          <SwissRoundColumn
            title={RECORD_GROUPS[0].label}
            matches={matchesByRecord['0-0']}
            teams={teams}
            record="0-0"
          />
        </div>

        {/* 第二轮：1-0 & 0-1 */}
        <div className="flex flex-col gap-8 w-64 mt-8" data-testid="swiss-round-2">
          <SwissRoundColumn
            title={RECORD_GROUPS[1].label}
            matches={matchesByRecord['1-0']}
            teams={teams}
            record="1-0"
          />
          <SwissRoundColumn
            title={RECORD_GROUPS[2].label}
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

          <SwissRoundColumn
            title={RECORD_GROUPS[4].label}
            matches={matchesByRecord['1-1']}
            teams={teams}
            record="1-1"
          />

          <div className="mt-4">
            <SwissRoundColumn
              title={RECORD_GROUPS[5].label}
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

          <SwissRoundColumn
            title={RECORD_GROUPS[7].label}
            matches={matchesByRecord['2-1']}
            teams={teams}
            record="2-1"
          />

          <SwissRoundColumn
            title={RECORD_GROUPS[8].label}
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