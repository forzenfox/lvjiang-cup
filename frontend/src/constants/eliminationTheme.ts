// 淘汰赛UI主题配置 - 参考官方UI
export const ELIMINATION_THEME = {
  // 背景色
  background: 'transparent',

  // 卡片背景 - 与官方一致
  cardBackground: 'rgb(45, 46, 48)',
  cardBorder: 'rgb(80, 80, 80)',

  // 获胜方高亮 - 使用蓝色（与官方一致）
  winner: 'rgb(0, 86, 179)',
  winnerText: 'rgb(255, 255, 255)',
  winnerBg: 'rgb(0, 86, 179)',
  loserText: 'rgb(150, 150, 150)',
  loserBg: 'rgb(60, 60, 60)',

  // 比分颜色
  scoreDefault: 'rgb(120, 120, 120)',
  scoreActive: 'rgb(255, 255, 255)',

  // 连接线
  connector: 'rgb(80, 80, 80)',

  // 阶段标签
  stageLabelBg: 'rgb(55, 56, 58)',
  stageLabelText: 'rgb(255, 255, 255)',
  stageLabelBorder: 'rgb(30, 30, 30)',

  // 状态徽章
  statusUpcoming: 'bg-blue-500 text-white',
  statusOngoing: 'bg-green-500 text-white animate-pulse',
  statusFinished: 'bg-gray-500 text-white',

  // 尺寸 - 参考官方设计
  cardWidth: 180,
  matchCardHeight: 73,  // 36px * 2 + 1px分隔线
  teamLogoSize: 20,
  scoreFontSize: 16,
  teamNameFontSize: 12,
  stageLabelHeight: 32,
  gap: 120,

  // 动画
  transitionDuration: '300ms',
} as const;

export type EliminationTheme = typeof ELIMINATION_THEME;
