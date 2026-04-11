export const SWISS_THEME = {
  // 背景色
  background: 'transparent',
  
  // 卡片背景 - 使用更协调的深灰色
  cardBackground: 'rgb(45, 46, 48)',
  border: 'rgb(100, 100, 100)',

  // 晋级区域 - 使用渐变蓝色
  qualified: {
    bg: 'linear-gradient(135deg, #1e5dc8, #2d7dd2)',
    contentBg: 'rgb(35, 36, 38)',
    border: '#3d8fe8',
  },

  // 淘汰区域 - 使用暗红色调
  eliminated: {
    bg: 'linear-gradient(135deg, #8b4545, #6b3535)',
    contentBg: 'rgb(45, 46, 48)',
    border: '#a05050',
  },

  // 获胜方高亮 - 使用金色
  winner: 'rgb(200, 170, 110)',
  winnerText: 'rgb(255, 255, 255)',
  loserText: 'rgb(150, 150, 150)',

  // 比分颜色
  scoreDefault: 'rgb(120, 120, 120)',
  scoreActive: 'rgb(200, 170, 110)',

  // 连接线
  connector: 'rgb(200, 170, 110)',

  // 标题栏 - 使用深灰色
  titleBg: 'rgb(55, 56, 58)',
  titleText: 'rgb(255, 255, 255)',
  titleBorder: 'rgb(30, 30, 30)',

  // 比赛卡片
  matchBg: 'rgb(45, 46, 48)',
  matchBorder: 'rgb(80, 80, 80)',

  // Tab切换 - 使用更协调的颜色
  tabActive: 'rgb(200, 170, 110)',     // 金色
  tabInactive: 'rgb(150, 150, 150)',   // 灰色
  tabBorder: 'rgb(60, 60, 60)',       // 深灰
  tabIndicator: 'rgb(200, 170, 110)', // 金色
  tabGlow: '0 0 8px rgba(200, 170, 110, 0.5)', // 下划线发光效果

  // 文字颜色 - 提高对比度
  textMuted: 'rgb(160, 160, 160)',
  textDefault: 'rgb(255, 255, 255)',
  textSecondary: 'rgb(140, 140, 140)',

  // 尺寸 - 优化后的尺寸
  columnWidth: 220,         // 列宽度
  teamLogoSize: 32,         // 队伍Logo大小
  scoreFontSize: 22,        // 比分字体大小
  titleFontSize: 14,        // 标题字体大小
  teamNameFontSize: 13,     // 队伍名字体大小
  matchCardHeight: 50,      // 比赛卡片高度
  headerHeight: 36,         // 标题栏高度
  gap: 60,                  // 列间距 - 增大到60px，为SVG连线留出空间

  // 动画配置
  transitionDuration: '400ms',
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export type SwissTheme = typeof SWISS_THEME;
