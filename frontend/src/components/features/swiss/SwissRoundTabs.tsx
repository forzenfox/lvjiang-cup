import React from 'react';
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

  // 移动端显示6个标签：前5轮 + 最终结果
  const tabs = showFinalResult
    ? [...rounds, { round: 6, label: '最终结果', records: [], boFormat: 'BO3' as const }]
    : rounds;

  return (
    <div className={`relative ${className}`} data-testid={testId}>
      {/* 渐变遮罩 - 左侧 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      {/* 可滑动的标签容器 */}
      <div
        className="flex overflow-x-auto gap-2 px-4 py-1 -mx-4 scrollbar-hide"
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
              flex-shrink-0 px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-all duration-200
              ${
                selectedRound === round.round
                  ? 'bg-[#1E3A8A] text-white shadow-lg shadow-blue-500/20 border-b-2 border-[#F59E0B]'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }
            `}
            style={{ scrollSnapAlign: 'start' }}
            data-testid={`${testId}-tab-${round.round}`}
            data-selected={selectedRound === round.round}
          >
            {round.label}
          </button>
        ))}
      </div>

      {/* 渐变遮罩 - 右侧 */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default SwissRoundTabs;
