/**
 * 页脚配置文件
 * 集中管理页脚所有可配置项
 */

export interface SocialLinkConfig {
  platform: 'bilibili' | 'douyin' | 'wechat' | 'custom';
  name: string;
  url: string;
  icon: string;
}

export interface ContactConfig {
  email: string;
  isLink: boolean;
}

export interface WeChatConfig {
  name: string;
  qrCode: string;
  size: number;
}

export interface ICPConfig {
  number: string;
  isLink: boolean;
}

export interface LayoutConfig {
  maxWidth: string;
  paddingX: string;
  paddingY: string;
  gap: string;
}

export interface FooterConfig {
  socialLinks: SocialLinkConfig[];
  contact: ContactConfig;
  wechat: WeChatConfig;
  icp: ICPConfig;
  layout: LayoutConfig;
}

// 获取 CDN 基础地址（与封面图片一致）
const DEFAULT_GITHUB_CDN_BASE = 'https://cdn.jsdmirror.com/gh/forzenfox/lvjiang-cup@main';
const GITHUB_CDN_BASE =
  typeof window !== 'undefined' && window.APP_CONFIG?.GITHUB_CDN_BASE
    ? window.APP_CONFIG.GITHUB_CDN_BASE
    : DEFAULT_GITHUB_CDN_BASE;

export const FOOTER_CONFIG: FooterConfig = {
  socialLinks: [
    {
      platform: 'bilibili',
      name: '胡凯利_洞主',
      url: 'https://space.bilibili.com/393671271',
      icon: 'https://ts3.tc.mm.bing.net/th/id/ODF.HcIfqnk4n-lbffGcaqDC2w?w=32&h=32&qlt=98&pcl=fffffa&o=6&pid=1.2',
    },
    {
      platform: 'douyin',
      name: '凯菇来啦',
      url: 'https://v.douyin.com/JKo-Lq5r86I/',
      icon: 'https://ts2.tc.mm.bing.net/th/id/ODF.6ZkCjv2hR5s6SR35yaulqQ?w=32&h=32&qlt=95&pcl=fffffa&o=6&pid=1.2',
    },
    {
      platform: 'douyin',
      name: '胡凯利_洞主',
      url: 'https://v.douyin.com/hErnCiyHPbg/',
      icon: 'https://ts2.tc.mm.bing.net/th/id/ODF.6ZkCjv2hR5s6SR35yaulqQ?w=32&h=32&qlt=95&pcl=fffffa&o=6&pid=1.2',
    },
  ],
  contact: {
    email: 'lvjiangshangwu@163.com',
    isLink: false,
  },
  wechat: {
    name: '驴驴电竞',
    // 使用 CDN 地址，组件内部会自动降级到本地
    qrCode: `${GITHUB_CDN_BASE}/assets/lvlvdianjing.webp`,
    size: 120,
  },
  icp: {
    number: '鄂 ICP 备 2026017374 号 -1',
    isLink: false,
  },
  layout: {
    maxWidth: '1400px',
    paddingX: '48px',
    paddingY: '48px',
    gap: '32px',
  },
};
