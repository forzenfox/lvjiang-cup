import React from 'react';

interface GameSwitcherSkeletonProps {
  gameCount?: number;
}

const GameSwitcherSkeleton: React.FC<GameSwitcherSkeletonProps> = ({ gameCount = 3 }) => {
  const games = Array.from({ length: gameCount }, (_, i) => i);

  return (
    <div className="bg-[#181818] border-b border-[#505050] max-w-5xl mx-auto mt-6 animate-pulse">
      <div className="flex">
        {games.map(index => (
          <div key={index} className="px-6 py-4 border-t-3 border-slate-700">
            <div className="h-5 w-12 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameSwitcherSkeleton;
