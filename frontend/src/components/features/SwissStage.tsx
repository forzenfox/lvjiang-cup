import React from 'react';
import { Match, Team } from '@/types';
import { useAdvancementStore } from '@/store/advancementStore';
import { SwissMatchCard, SwissStatusBadge, SwissTeamList } from './swiss';

interface SwissStageProps {
  matches: Match[];
  teams: Team[];
  advancement?: {
    winners2_0: string[];
    winners2_1: string[];
    losersBracket: string[];
    eliminated3rd: string[];
    eliminated0_3: string[];
  };
}

const RoundColumn: React.FC<{
  roundName: string;
  isBo3: boolean;
  matches: Match[];
  teams: Team[];
  className?: string;
}> = ({ roundName, isBo3, matches, teams, className }) => {
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
          matches.map(match => <SwissMatchCard key={match.id} match={match} teams={teams} />)
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
  const advancement = propAdvancement || storeAdvancement;

  // Group matches by Record
  const round1Matches = matches.filter(m => m.swissRecord === '0-0');
  const round2High = matches.filter(m => m.swissRecord === '1-0');
  const round2Low = matches.filter(m => m.swissRecord === '0-1');
  const round3Mid = matches.filter(m => m.swissRecord === '1-1');
  const round3Low = matches.filter(m => m.swissRecord === '0-2');
  const round4Last = matches.filter(m => m.swissRecord === '1-2');

  return (
    <div className="w-full overflow-x-auto" data-testid="swiss-stage">
      <div className="flex gap-8 min-w-[1000px] p-4" data-testid="swiss-container">
        {/* Round 1 (0-0) */}
        <div className="flex flex-col gap-4 w-64" data-testid="swiss-round-1">
          <RoundColumn roundName="Round 1" isBo3={false} matches={round1Matches} teams={teams} />
        </div>

        {/* Round 2 (1-0 & 0-1) */}
        <div className="flex flex-col gap-8 w-64 mt-8" data-testid="swiss-round-2">
          <RoundColumn roundName="Round 2 High" isBo3={true} matches={round2High} teams={teams} />
          <RoundColumn roundName="Round 2 Low" isBo3={true} matches={round2Low} teams={teams} />
        </div>

        {/* Round 3 (1-1 & 0-2) + 2-0 Advancement */}
        <div className="flex flex-col gap-8 w-64" data-testid="swiss-round-3">
          {/* 2-0 Qualified */}
          <div className="flex flex-col gap-2" data-testid="swiss-record-group-2-0">
            <SwissStatusBadge type="qualified">2-0 晋级 (胜者组)</SwissStatusBadge>
            <SwissTeamList teams={teams} ids={advancement.winners2_0} />
          </div>

          <RoundColumn roundName="Round 3 Mid" isBo3={true} matches={round3Mid} teams={teams} />

          <div className="mt-4">
            <RoundColumn roundName="Round 3 Low" isBo3={true} matches={round3Low} teams={teams} />
            <div className="mt-2" data-testid="swiss-record-group-0-3">
              <SwissStatusBadge type="eliminated">0-3 淘汰</SwissStatusBadge>
              <SwissTeamList teams={teams} ids={advancement.eliminated0_3} />
            </div>
          </div>
        </div>

        {/* Round 4 (1-2) + Advancement */}
        <div className="flex flex-col gap-8 w-64 mt-16" data-testid="swiss-round-4">
          <div className="flex flex-col gap-2" data-testid="swiss-record-group-2-1">
            <SwissStatusBadge type="qualified">2-1 晋级 (胜者组)</SwissStatusBadge>
            <SwissTeamList teams={teams} ids={advancement.winners2_1} />
          </div>

          <RoundColumn roundName="Last Chance" isBo3={true} matches={round4Last} teams={teams} />

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2" data-testid="swiss-record-group-losers">
              <SwissStatusBadge type="danger">晋级败者组</SwissStatusBadge>
              <SwissTeamList teams={teams} ids={advancement.losersBracket} />
            </div>
            <div className="flex flex-col gap-2" data-testid="swiss-record-group-eliminated">
              <SwissStatusBadge type="eliminated">积分第三淘汰</SwissStatusBadge>
              <SwissTeamList teams={teams} ids={advancement.eliminated3rd} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwissStage;
