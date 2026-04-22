import React from 'react';

interface PlayerStatsRowSkeletonProps {
  count?: number;
}

const PlayerStatsRowSkeleton: React.FC<PlayerStatsRowSkeletonProps> = ({ count = 5 }) => {
  const rows = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="max-w-5xl mx-auto mt-4 space-y-2">
      {rows.map(index => (
        <div key={index} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-700" />
                  <div className="h-4 w-16 bg-slate-700 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-20 bg-slate-700 rounded" />
                  <div className="h-3 w-12 bg-slate-700/50 rounded" />
                  <div className="h-3 w-10 bg-slate-700/50 rounded" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 px-4">
              <div className="h-4 w-8 bg-slate-700 rounded" />
              <div className="h-4 w-5 h-5 bg-slate-700 rounded-full" />
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-slate-700 rounded" />
                  <div className="w-8 h-8 rounded bg-slate-700" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-10 bg-slate-700/50 rounded" />
                  <div className="h-3 w-12 bg-slate-700/50 rounded" />
                  <div className="h-4 w-20 bg-slate-700 rounded" />
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerStatsRowSkeleton;
