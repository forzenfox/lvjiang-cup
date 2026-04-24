import React from 'react';
import MatchInfoCardSkeleton from './MatchInfoCardSkeleton';
import GameSwitcherSkeleton from './GameSwitcherSkeleton';
import TeamStatsBarSkeleton from './TeamStatsBarSkeleton';
import PlayerStatsRowSkeleton from './PlayerStatsRowSkeleton';

interface MatchDataSkeletonProps {
  isBO3?: boolean;
  gameCount?: number;
}

const MatchDataSkeleton: React.FC<MatchDataSkeletonProps> = ({ isBO3 = true, gameCount = 3 }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <MatchInfoCardSkeleton isBO3={isBO3} />
      <GameSwitcherSkeleton gameCount={gameCount} />
      <TeamStatsBarSkeleton />
      <PlayerStatsRowSkeleton count={5} />
    </div>
  );
};

export default MatchDataSkeleton;
