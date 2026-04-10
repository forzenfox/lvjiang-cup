import React, { useRef, useEffect } from 'react';
import { Match, Team } from '@/types';
import SwissRoundColumn from './SwissRoundColumn';
import SwissRecordGroup from './SwissRecordGroup';
import { SWISS_STAGE_CONFIG } from '@/constants/swissStageConfig';
import { SWISS_THEME } from '@/constants/swissTheme';

interface SwissStageUnifiedProps {
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

const SwissStageUnified: React.FC<SwissStageUnifiedProps> = ({
  matches,
  teams,
  activeTab,
  onTabChange,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-stage-unified',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 计算BO1和BO3的分界点
  const bo1Rounds = SWISS_STAGE_CONFIG.rounds.filter(r =>
    SWISS_STAGE_CONFIG.bo1Rounds.includes(r.round as 1 | 2 | 3)
  );
  const bo3Rounds = SWISS_STAGE_CONFIG.rounds.filter(r =>
    SWISS_STAGE_CONFIG.bo3Rounds.includes(r.round as 4 | 5)
  );

  // 计算滚动位置
  const scrollToTab = (tab: 'bo1' | 'bo3') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    if (tab === 'bo1') {
      // 滚动到最左侧
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // 滚动到BO3区域开始位置
      const bo1Width = bo1Rounds.reduce((total, round) => {
        return total + round.records.length * (SWISS_THEME.columnWidth + 24); // 24px gap
      }, 0);
      container.scrollTo({ left: bo1Width, behavior: 'smooth' });
    }
  };

  // 当activeTab变化时，自动滚动
  useEffect(() => {
    scrollToTab(activeTab);
  }, [activeTab]);

  // 按战绩分组比赛
  const matchesByRecord = React.useMemo(() => {
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

  const qualifiedTeams = React.useMemo(() => {
    if (!advancement?.top8) return [];
    return teams.filter(t => advancement.top8.includes(t.id));
  }, [teams, advancement]);

  const eliminatedTeams = React.useMemo(() => {
    if (!advancement?.eliminated) return [];
    return teams.filter(t => advancement.eliminated.includes(t.id));
  }, [teams, advancement]);

  // 渲染单个轮次
  const renderRound = (roundConfig: typeof SWISS_STAGE_CONFIG.rounds[0]) => {
    return (
      <div key={roundConfig.round} className="flex gap-4">
        {roundConfig.records.map((record) => {
          const recordMatches = matchesByRecord[record] || [];
          const isQualifiedGroup = 
            (roundConfig.round === 3 && record === '2-0') ||
            (roundConfig.round === 4 && record === '3-1') ||
            (roundConfig.round === 5 && record === '3-2');
          const isEliminatedGroup = 
            (roundConfig.round === 3 && record === '0-2') ||
            (roundConfig.round === 4 && record === '1-3') ||
            (roundConfig.round === 5 && record === '2-3');

          if (isQualifiedGroup) {
            return (
              <SwissRecordGroup
                key={record}
                type="qualified"
                title="晋级"
                teams={qualifiedTeams}
              />
            );
          }

          if (isEliminatedGroup) {
            return (
              <SwissRecordGroup
                key={record}
                type="eliminated"
                title="淘汰"
                teams={eliminatedTeams}
              />
            );
          }

          return (
            <SwissRoundColumn
              key={record}
              title={roundConfig.label}
              record={record}
              matches={recordMatches}
              teams={teams}
              onMatchClick={onMatchClick}
            />
          );
        })}
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

      {/* 指示器线条 */}
      <div
        className="relative mb-4"
        style={{
          height: '2px',
          backgroundColor: SWISS_THEME.tabBorder,
          marginTop: '-2px',
        }}
      >
        <div
          className="absolute top-0 h-full transition-all duration-300"
          style={{
            width: '200px',
            backgroundColor: SWISS_THEME.tabIndicator,
            left: activeTab === 'bo1' ? 'calc(50% - 200px)' : '50%',
            transform: activeTab === 'bo1' ? 'translateX(50%)' : 'translateX(-50%)',
          }}
        />
      </div>

      {/* 统一的内容区域 - 水平滚动容器 */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-hidden"
        style={{
          width: '100%',
          minHeight: '500px',
        }}
        data-testid={`${testId}-content`}
      >
        <div className="flex gap-6">
          {/* BO1 区域 */}
          <div className="flex gap-6">
            {bo1Rounds.map(renderRound)}
          </div>
          
          {/* BO3 区域 */}
          <div className="flex gap-6">
            {bo3Rounds.map(renderRound)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwissStageUnified;
