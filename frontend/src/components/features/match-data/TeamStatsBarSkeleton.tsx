import React from 'react';

const TeamStatsBarSkeleton: React.FC = () => {
  return (
    <div className="bg-[#2d2d2d] rounded-lg p-4 max-w-5xl mx-auto mt-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-4">
          <div className="h-5 w-12 bg-slate-700 rounded" />
          <div className="h-10 w-16 bg-slate-700 rounded" />
          <div className="h-3 w-8 bg-slate-700/50 rounded" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-8 w-8 bg-slate-700 rounded" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="h-5 w-12 bg-slate-700 rounded" />
          <div className="h-10 w-16 bg-slate-700 rounded" />
          <div className="h-3 w-8 bg-slate-700/50 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-3 w-8 bg-slate-700/50 rounded" />
            <div className="flex items-center gap-1 mt-1">
              <div className="h-5 w-8 bg-slate-700 rounded" />
              <div className="h-4 w-4 bg-slate-600 rounded" />
              <div className="h-5 w-8 bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamStatsBarSkeleton;
