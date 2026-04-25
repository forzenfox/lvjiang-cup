import React from 'react';

const MatchSeriesHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-8 max-w-5xl mx-auto animate-pulse">
      <div className="flex items-center justify-between px-12">
        {/* 左侧：红色方 */}
        <div className="flex flex-col items-center gap-4 w-[160px]">
          <div className="w-24 h-24 bg-slate-700" />
          <div className="h-8 w-24 bg-slate-700 rounded" />
        </div>

        {/* 中间：比分和比赛信息 */}
        <div className="flex flex-col items-center gap-4 bg-[#2a2a3e] rounded-xl px-16 py-6 min-w-[320px]">
          <div className="flex items-center gap-8">
            <div className="h-20 w-16 bg-slate-700 rounded" />
            <div className="h-12 w-8 bg-slate-700 rounded" />
            <div className="h-20 w-16 bg-slate-700 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-slate-700 rounded" />
            <div className="h-6 w-16 bg-slate-700 rounded" />
          </div>
          <div className="h-8 w-20 bg-slate-700 rounded-full" />
        </div>

        {/* 右侧：蓝色方 */}
        <div className="flex flex-col items-center gap-4 w-[160px]">
          <div className="w-24 h-24 bg-slate-700" />
          <div className="h-8 w-24 bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
};

export default MatchSeriesHeaderSkeleton;
