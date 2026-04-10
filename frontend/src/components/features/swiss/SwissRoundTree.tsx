import React, { useMemo } from 'react';
import { Match, Team } from '@/types';
import SwissRecordSection from './SwissRecordSection';
import { SWISS_THEME } from '@/constants/swissTheme';
import {
  SWISS_COLUMNS,
  getIndicatorRatio,
  type SwissColumnConfig,
} from '@/constants/swissTreeConfig';

interface SwissRoundTreeProps {
  matches: Match[];
  teams: Team[];
  activeTab: 'bo1' | 'bo3';
  onTabChange: (tab: 'bo1' | 'bo3') => void;
  advancement?: {
    top8: string[];
    eliminated: string[];
  };
  onMatchClick?: (match: Match) => void;
  className?: string;
  'data-testid'?: string;
}

const SwissRoundTree: React.FC<SwissRoundTreeProps> = ({
  matches,
  teams,
  activeTab,
  onTabChange,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-round-tree',
}) => {
  // 按战绩分组比赛
  const matchesByRecord = useMemo(() => {
    const result: Record<string, Match[]> = {};
    for (const match of matches) {
      const record = match.swissRecord || '0-0';
      if (!result[record]) {
        result[record] = [];
      }
      result[record].push(match);
    }
    return result;
  }, [matches]);

  // 晋级队伍
  const promotionTeams = useMemo(() => {
    if (!advancement?.top8) return [];
    return teams.filter(t => advancement.top8.includes(t.id));
  }, [teams, advancement]);

  // 淘汰队伍
  const eliminationTeams = useMemo(() => {
    if (!advancement?.eliminated) return [];
    return teams.filter(t => advancement.eliminated.includes(t.id));
  }, [teams, advancement]);

  // 获取下划线指示器比例
  const indicatorRatio = useMemo(() => getIndicatorRatio(activeTab), [activeTab]);

  // 计算滑动偏移量
  // BO1: 显示第1-4列 (索引0-3)，偏移0
  // BO3: 显示第3-6列 (索引2-5)，需要向左滑动2列的宽度
  const slideOffset = activeTab === 'bo1' 
    ? 0 
    : -2 * (SWISS_THEME.columnWidth + SWISS_THEME.gap);

  // 计算容器宽度（4列可见）
  const visibleWidth = 4 * SWISS_THEME.columnWidth + 3 * SWISS_THEME.gap;

  // 渲染单列
  const renderColumn = (column: SwissColumnConfig) => {
    return (
      <div
        key={column.id}
        className="flex flex-col gap-2 flex-shrink-0 transition-all duration-300"
        style={{ 
          width: `${SWISS_THEME.columnWidth}px`,
          opacity: 0.9,
        }}
        data-testid={`${testId}-column-${column.id}`}
      >
        {/* 列标题 */}
        <div
          className="flex items-center justify-center px-3"
          style={{
            backgroundColor: SWISS_THEME.titleBg,
            height: `${SWISS_THEME.headerHeight}px`,
            borderBottom: `4px solid ${SWISS_THEME.titleBorder}`,
          }}
        >
          <span
            style={{
              color: SWISS_THEME.titleText,
              fontSize: `${SWISS_THEME.titleFontSize}px`,
              fontWeight: 'bold',
            }}
          >
            {column.name}
          </span>
        </div>

        {/* 战绩分组 */}
        <div className="flex flex-col gap-2">
          {column.records.map((recordConfig) => (
            <SwissRecordSection
              key={recordConfig.record}
              config={recordConfig}
              matches={matchesByRecord[recordConfig.record] || []}
              teams={teams}
              promotionTeams={recordConfig.type === 'promotion' ? promotionTeams : undefined}
              eliminationTeams={recordConfig.type === 'elimination' ? eliminationTeams : undefined}
              onMatchClick={onMatchClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={className} data-testid={testId}>
      {/* BO1/BO3 切换标签 */}
      <div
        className="flex justify-center mb-4"
        style={{
          borderBottom: `2px solid ${SWISS_THEME.tabBorder}`,
        }}
      >
        <div className="flex" style={{ width: '400px' }}>
          <button
            onClick={() => onTabChange('bo1')}
            className="flex-1 py-3 text-2xl font-bold transition-colors duration-300"
            style={{
              color: activeTab === 'bo1' ? SWISS_THEME.tabActive : SWISS_THEME.tabInactive,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'dinbold, sans-serif',
            }}
          >
            BO1
          </button>
          <button
            onClick={() => onTabChange('bo3')}
            className="flex-1 py-3 text-2xl font-bold transition-colors duration-300"
            style={{
              color: activeTab === 'bo3' ? SWISS_THEME.tabActive : SWISS_THEME.tabInactive,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'dinbold, sans-serif',
            }}
          >
            BO3
          </button>
        </div>
      </div>

      {/* 下划线指示器 - 单行显示，带发光效果 */}
      <div
        className="relative mb-4 mx-auto"
        style={{
          width: '400px',
          height: '3px',
          backgroundColor: SWISS_THEME.tabBorder,
          marginTop: '-2px',
        }}
      >
        {/* 单个下划线，根据activeTab移动位置和改变宽度 */}
        <div
          className="absolute top-0 h-full transition-all duration-500"
          style={{
            width: `${indicatorRatio[activeTab] * 400}px`,
            backgroundColor: SWISS_THEME.tabIndicator,
            left: activeTab === 'bo1' ? '0px' : `${(1 - indicatorRatio.bo3) * 400}px`,
            boxShadow: SWISS_THEME.tabGlow,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* 赛程区域 - 6列容器，带滑动动画 */}
      <div
        className="overflow-hidden mx-auto"
        style={{
          width: `${visibleWidth}px`,
          minHeight: '500px',
        }}
        data-testid={`${testId}-content`}
      >
        {/* 6列容器，通过transform实现滑动 */}
        <div
          className="flex gap-4 transition-transform"
          style={{
            transform: `translateX(${slideOffset}px)`,
            width: `${6 * SWISS_THEME.columnWidth + 5 * SWISS_THEME.gap}px`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {SWISS_COLUMNS.map(renderColumn)}
        </div>
      </div>
    </div>
  );
};

export default SwissRoundTree;
