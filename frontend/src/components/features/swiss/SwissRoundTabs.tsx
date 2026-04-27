import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { SWISS_STAGE_CONFIG } from '@/constants/swissStageConfig';

interface SwissRoundTabsProps {
  selectedRound: number;
  onRoundChange: (round: number) => void;
  className?: string;
  'data-testid'?: string;
  /**
   * 是否显示最终结果标签（移动端专用）
   */
  showFinalResult?: boolean;
}

const SwissRoundTabs: React.FC<SwissRoundTabsProps> = ({
  selectedRound,
  onRoundChange,
  className = '',
  'data-testid': testId = 'swiss-round-tabs',
  showFinalResult = false,
}) => {
  const rounds = SWISS_STAGE_CONFIG.rounds;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 移动端显示6个标签：前5轮 + 最终结果
  const tabs = showFinalResult
    ? [...rounds, { round: 6, label: '最终结果', records: [], boFormat: 'BO3' as const }]
    : rounds;

  // 检测是否可以向右滚动
  useEffect(() => {
    const checkScroll = () => {
      const el = scrollContainerRef.current;
      if (el) {
        const hasMore = el.scrollWidth > el.clientWidth + el.scrollLeft + 1;
        setCanScrollRight(hasMore);
      }
    };

    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div className={`relative ${className}`} data-testid={testId}>
      {/* 可滑动的标签容器 */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-2 px-2 py-1 scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tabs.map(round => (
          <button
            key={round.round}
            onClick={() => onRoundChange(round.round)}
            className={`
              flex-shrink-0 px-3 py-2 rounded font-medium whitespace-nowrap
              transition-all duration-200 min-h-[44px] min-w-[64px]
              text-xs sm:text-sm
              ${
                selectedRound === round.round
                  ? 'bg-[#1E3A8A] text-white shadow-lg shadow-blue-500/20 border-b-2 border-[#F59E0B] scale-[1.02]'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-transparent hover:border-gray-600'
              }
            `}
            style={{ scrollSnapAlign: 'start' }}
            data-testid={`${testId}-tab-${round.round}`}
            data-selected={selectedRound === round.round}
            title={round.label}
          >
            {round.label}
          </button>
        ))}
      </div>

      {/* 滚动指示器 */}
      {canScrollRight && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 animate-pulse pointer-events-none">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      )}
    </div>
  );
};

export default SwissRoundTabs;
