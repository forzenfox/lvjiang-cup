import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import type { ThanksData } from '@/data/types';

// ==========================================
// 全局 Mocks (vi.mock 自动提升到文件顶部)
// ==========================================

// 全局 Mock echarts
const mockEchartsInstance = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('echarts/core', () => ({
  __esModule: true,
  default: {
    use: vi.fn(),
    init: vi.fn(() => mockEchartsInstance),
  },
  use: vi.fn(),
  init: vi.fn(() => mockEchartsInstance),
}));

vi.mock('echarts/charts', () => ({
  __esModule: true,
  default: {},
  RadarChart: {},
}));

vi.mock('echarts/components', () => ({
  __esModule: true,
  default: {},
  TooltipComponent: {},
  GridComponent: {},
}));

vi.mock('echarts/renderers', () => ({
  __esModule: true,
  default: {},
  CanvasRenderer: {},
}));

// 全局 Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
      img: ({ ...props }: any) => <img {...props} />,
      li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
      ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
      a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
      section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
      header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
      nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
      footer: ({ children, ...props }: any) => <footer {...props}>{children}</footer>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    animate: vi.fn((motionValue, target, options) => {
      if (motionValue && typeof motionValue.set === 'function') {
        motionValue.set(target);
      }
      return { stop: vi.fn() };
    }),
  };
});

// 全局 Mock championUtils
vi.mock('@/utils/championUtils', () => {
  // 英文到中文的英雄名称映射
  const championNameMap: Record<string, string> = {
    'Yasuo': '亚索',
    'Irelia': '艾瑞莉娅',
    'Yone': '永恩',
    'Ahri': '阿狸',
    'Zed': '劫',
    'Gwen': '格温',
    'Sion': '赛恩',
    'Jinx': '金克丝',
    'Thresh': '锤石',
    'LeeSin': '李青',
    'Garen': '盖伦',
  };
  
  return {
    initChampionMap: vi.fn(),
    getChampionIconByEn: vi.fn(() => '/mock-icon.png'),
    getChampionTitleByEn: vi.fn((name: string) => championNameMap[name] || name),
    getChampionNameToEn: vi.fn(() => ({})),
  };
});

// 全局 Mock upload utils
vi.mock('@/utils/upload', () => ({
  getUploadUrl: vi.fn((url: string) => url),
}));

// 全局 Mock tracking (防止 fetch 请求导致测试失败)
vi.mock('@/utils/tracking', () => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  trackMatchDataPageView: vi.fn(),
  trackGameSwitch: vi.fn(),
  trackPlayerRowClick: vi.fn(),
  trackRadarChartExpand: vi.fn(),
  trackRadarChartCollapse: vi.fn(),
  trackAdminImportStart: vi.fn(),
  trackAdminImportSuccess: vi.fn(),
  trackAdminEditOpen: vi.fn(),
  trackAdminEditSave: vi.fn(),
}));

// 全局 Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// ==========================================
// 全局配置 (hoisted 确保在测试运行前执行)
// ==========================================
vi.hoisted(() => {
  const mockThanksData: ThanksData = {
    sponsors: [
      { id: 1, sponsorName: '斗鱼官方', sponsorContent: '7W' },
      { id: 2, sponsorName: '神秘老板', sponsorContent: '5K' },
      { id: 3, sponsorName: '秀木老板', sponsorContent: '2W' },
      { id: 4, sponsorName: '玩一下鼓励员老板', sponsorContent: '2K' },
      { id: 5, sponsorName: '洞庭湖里的平头老板', sponsorContent: '3K' },
      { id: 6, sponsorName: '尊师hkl', sponsorContent: '2K' },
      { id: 7, sponsorName: '为何如此衰', sponsorContent: '8K', specialAward: '8强每个队伍1K' },
      {
        id: 8,
        sponsorName: '董B登',
        sponsorContent: '1K',
        specialAward: '冠军每人750g蓝莓果干+250g参片',
      },
      { id: 9, sponsorName: '只会打炉石的SteveD', sponsorContent: '1K' },
      { id: 10, sponsorName: '深红', sponsorContent: '2K' },
      { id: 11, sponsorName: 'MT', sponsorContent: '2K', specialAward: '4强每人一份贡菜千层肚' },
      {
        id: 12,
        sponsorName: '不减到75kg不改名',
        sponsorContent: '1K',
        specialAward: '最佳C/D级（参赛选手评）',
      },
      {
        id: 13,
        sponsorName: '你真的是厉害（天谎星）',
        sponsorContent: '500',
        specialAward: '爆种奖',
      },
      {
        id: 14,
        sponsorName: '直播间最漂亮的寡妇',
        sponsorContent: '1K',
        specialAward: '最拉辅助和最强辅助，一人一半',
      },
      { id: 15, sponsorName: '热心市民小曹', sponsorContent: '2K' },
      { id: 16, sponsorName: '斗驴启动', sponsorContent: '1K', specialAward: '亚军SVP' },
      { id: 17, sponsorName: '小金拉黑属实不行', sponsorContent: '500', specialAward: '爆种奖' },
      {
        id: 18,
        sponsorName: '苏唐',
        sponsorContent: '1K',
        specialAward: '瑞士轮第一个淘汰的队伍5人平分',
      },
      {
        id: 19,
        sponsorName: 'c酱的骚刚',
        sponsorContent: '600',
        specialAward: '弹幕票选表现最差A/S，300R/人',
      },
      { id: 20, sponsorName: '人生梦想', sponsorContent: '1K', specialAward: '冠军打野' },
    ],
    staff: [
      { id: 1, name: '帅小伙山月', role: '大总管' },
      { id: 2, name: 'MidOuOri', role: '数据分析' },
      { id: 3, name: '刘补树', role: '数据分析' },
      { id: 4, name: '古文灬', role: '技术支持' },
      { id: 5, name: 'YangATree', role: '技术支持' },
      { id: 6, name: '梅怡阁诗人', role: '技术支持' },
    ],
  };
  Object.defineProperty(window, 'THANKS_DATA', {
    value: mockThanksData,
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    APP_NAME: '驴酱杯赛事',
    VERSION: '1.0.0',
    GITHUB_CDN_BASE: 'https://cdn.jsdmirror.com/gh/forzenfox/lvjiang-cup@main',
  };

  // Mock matchMedia for prefers-reduced-motion
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
});
