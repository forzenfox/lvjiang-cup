/**
 * 对战数据展示组件统一导出
 *
 * @module MatchData
 * @description 包含对战数据详情页面的所有组件
 */

// 页面组件
export { default as MatchDataPage } from './MatchDataPage';
export { default as MatchDataEditPage } from './MatchDataEditPage';

// 布局组件
export { default as MatchDataHeader } from './MatchDataHeader';

// 信息展示组件
export { default as MatchInfoCard } from './MatchInfoCard';
export { default as MatchInfoCardSkeleton } from './MatchInfoCardSkeleton';

// 对局切换组件
export { default as GameSwitcher } from './GameSwitcher';
export { default as GameSwitcherSkeleton } from './GameSwitcherSkeleton';

// 战队数据组件
export { default as TeamStatsBar } from './TeamStatsBar';
export { default as TeamStatsBarEdit } from './TeamStatsBarEdit';
export { default as TeamStatsBarSkeleton } from './TeamStatsBarSkeleton';

// 选手数据组件
export { default as PlayerStatsRow } from './PlayerStatsRow';
export { default as PlayerStatsRowEdit } from './PlayerStatsRowEdit';
export { default as PlayerStatsRowSkeleton } from './PlayerStatsRowSkeleton';
export { default as PlayerStatsList } from './PlayerStatsList';

// 雷达图组件
export { default as RadarChart } from './RadarChart';

// 状态组件
export { default as MatchDataSkeleton } from './MatchDataSkeleton';
export { default as MatchDataEmptyState } from './MatchDataEmptyState';
export { default as MatchDataError } from './MatchDataError';
