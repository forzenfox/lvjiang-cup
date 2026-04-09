import type { PlayerLevel } from '@/api/types';

/**
 * 玩家徽章颜色配置
 * 包含：实力等级徽章(S/A/B/C/D) 和 队长身份徽章
 * 用于统一整个项目中玩家相关徽章的样式
 */
export const LEVEL_COLORS: Record<PlayerLevel, string> = {
  S: 'bg-amber-500/40 text-amber-300 border-amber-500/50 shadow-amber-500/20',
  A: 'bg-purple-500/40 text-purple-300 border-purple-500/50 shadow-purple-500/20',
  B: 'bg-blue-500/40 text-blue-300 border-blue-500/50 shadow-blue-500/20',
  C: 'bg-green-500/40 text-green-300 border-green-500/50 shadow-green-500/20',
  D: 'bg-gray-500/40 text-gray-300 border-gray-500/50 shadow-gray-500/20',
};

/**
 * 获取等级徽章的完整样式类名
 * @param level - 玩家等级
 * @param additionalClasses - 额外的样式类名
 * @returns 完整的样式类名字符串
 */
export function getLevelBadgeClasses(level: PlayerLevel | undefined, additionalClasses: string = ''): string {
  if (!level) return additionalClasses;
  
  const baseClasses = 'px-2 py-1 text-xs font-bold rounded border shadow-sm';
  return `${baseClasses} ${LEVEL_COLORS[level]} ${additionalClasses}`.trim();
}

/**
 * 获取等级徽章的基础样式（不含等级特定颜色）
 * 用于内联样式或需要动态构建样式的场景
 */
export const LEVEL_BADGE_BASE_CLASSES = 'px-2 py-1 text-xs font-bold rounded border shadow-sm';

/**
 * 队长标识颜色配置
 * 使用红色系与实力等级区分
 */
export const CAPTAIN_BADGE_CLASSES = 'bg-red-500/40 text-red-300 border-red-500/50 shadow-red-500/20';

/**
 * 获取队长标识的完整样式类名
 * @param additionalClasses - 额外的样式类名
 * @returns 完整的样式类名字符串
 */
export function getCaptainBadgeClasses(additionalClasses: string = ''): string {
  const baseClasses = 'px-2 py-1 text-xs font-bold rounded border shadow-sm';
  return `${baseClasses} ${CAPTAIN_BADGE_CLASSES} ${additionalClasses}`.trim();
}
