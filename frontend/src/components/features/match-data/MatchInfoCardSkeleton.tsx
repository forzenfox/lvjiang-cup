import React from 'react';

interface MatchInfoCardSkeletonProps {
  isBO3?: boolean;
}

const MatchInfoCardSkeleton: React.FC<MatchInfoCardSkeletonProps> = ({ isBO3: _isBO3 = true }) => {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6 max-w-5xl mx-auto mt-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-3 min-w-[120px]">
          <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600" />
          <div className="h-6 w-20 bg-slate-700 rounded" />
          <div className="h-4 w-12 bg-slate-700/50 rounded-full" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-20 bg-slate-700 rounded" />
          <div className="h-8 w-16 bg-slate-700 rounded" />
          <div className="h-4 w-24 bg-slate-700/50 rounded" />
        </div>

        <div className="flex flex-col items-center gap-3 min-w-[120px]">
          <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600" />
          <div className="h-6 w-20 bg-slate-700 rounded" />
          <div className="h-4 w-12 bg-slate-700/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default MatchInfoCardSkeleton;
