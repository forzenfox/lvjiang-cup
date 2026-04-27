import React, { useState, useEffect, useRef } from 'react';
import { StarBurst, TrophyIcon } from './DecorativeIcons';
import { useStaggeredAnimation } from './useScrollAnimation';
import type { SponsorConfig } from '@/data/types';

interface SpecialAwardsProps {
  sponsors: SponsorConfig[];
}

export const SpecialAwards: React.FC<SpecialAwardsProps> = ({ sponsors }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // 筛选有特殊奖项的赞助商
  const awards = sponsors.filter(s => s.specialAward);

  // 显示全部奖项（已支持滚动效果）
  const displayAwards = awards;

  // 检测内容是否溢出，需要滚动
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current && scrollContentRef.current) {
        const containerHeight = scrollContainerRef.current.clientHeight;
        const contentHeight = scrollContentRef.current.scrollHeight;
        const needsScroll = contentHeight > containerHeight;
        setShouldScroll(needsScroll);
      }
    };

    // 使用 setTimeout 确保在 DOM 完全渲染后检测
    const timer = setTimeout(() => {
      checkOverflow();
    }, 100);

    window.addEventListener('resize', checkOverflow);

    // 监听图片等资源加载完成
    window.addEventListener('load', checkOverflow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
      window.removeEventListener('load', checkOverflow);
    };
  }, [sponsors]);

  // Hook 必须在条件判断之前调用
  const { containerRef, visibleItems } = useStaggeredAnimation(displayAwards.length, 100);

  // 如果没有特殊奖项，返回 null（在 Hook 调用之后）
  if (awards.length === 0) return null;

  const awardItems = displayAwards.map((award, index) => (
    <li
      key={award.id}
      className={`flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-pink-500/30 hover:bg-pink-900/10 transition-all duration-300 group/item min-h-[72px] ${
        visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <TrophyIcon className="flex-shrink-0 w-6 h-6 text-amber-400 mt-0.5" />
      <div className="flex-1 min-w-0">
        <strong
          className="text-pink-400 font-semibold text-sm md:text-base block mb-1"
          style={{ fontFamily: 'Chakra Petch, sans-serif' }}
        >
          {award.sponsorName}
        </strong>
        <p className="text-gray-200 text-xs md:text-sm leading-relaxed">{award.specialAward}</p>
      </div>
    </li>
  ));

  return (
    <div
      data-testid="special-awards-container"
      ref={containerRef}
      className="relative mt-8 md:mt-12 p-5 md:p-6 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-900/20 via-black/50 to-amber-900/20 backdrop-blur-md overflow-hidden group flex flex-col w-full"
    >
      {/* 定义 scroll-up 关键帧动画 */}
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
      {/* CRT 扫描线效果 */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="w-full h-full"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(219, 39, 119, 0.03) 2px, rgba(219, 39, 119, 0.03) 4px)',
          }}
        />
      </div>

      {/* 霓虹光晕边框 */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(219, 39, 119, 0.1), 0 0 40px rgba(219, 39, 119, 0.1)',
        }}
      />

      {/* 标题区域 */}
      <div className="relative flex items-center gap-3 mb-4 md:mb-5">
        <div className="w-1 h-6 md:h-7 bg-gradient-to-b from-pink-500 to-amber-500 rounded-full" />
        <h3
          data-testid="special-awards-title"
          className="text-lg md:text-xl font-bold tracking-wide flex items-center gap-2"
          style={{
            fontFamily: 'Chakra Petch, sans-serif',
            background: 'linear-gradient(135deg, #F472B6 0%, #FBBF24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          <StarBurst
            size={18}
            className="text-pink-400 flex-shrink-0"
            style={{ WebkitTextFillColor: 'initial' }}
          />
          特殊奖项
          <StarBurst
            size={18}
            className="text-amber-400 flex-shrink-0"
            style={{ WebkitTextFillColor: 'initial' }}
          />
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-pink-500/50 via-amber-500/30 to-transparent" />
      </div>

      {/* 奖项列表 - 带滚动效果，flex-1 确保填充剩余空间 */}
      <div
        ref={scrollContainerRef}
        className="relative overflow-hidden flex-1"
        style={{ maxHeight: '280px', minHeight: '200px' }}
      >
        <div
          ref={scrollContentRef}
          className="space-y-3"
          style={
            shouldScroll
              ? {
                  animation: 'scroll-up 20s linear infinite',
                  width: '100%',
                }
              : undefined
          }
        >
          {awardItems}
          {/* 复制一份内容用于无缝循环滚动 */}
          {shouldScroll && awardItems}
        </div>
      </div>


    </div>
  );
};
