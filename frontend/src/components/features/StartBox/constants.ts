declare global {
  interface Window {
    APP_CONFIG?: {
      API_BASE_URL?: string;
      APP_NAME?: string;
      VERSION?: string;
      GITHUB_CDN_BASE?: string;
    };
  }
}

const DEFAULT_GITHUB_CDN_BASE = 'https://cdn.jsdmirror.com/gh/forzenfox/lvjiang-cup@main';

const GITHUB_CDN_BASE = window.APP_CONFIG?.GITHUB_CDN_BASE || DEFAULT_GITHUB_CDN_BASE;

export const COVER_BACKGROUNDS = {
  pc: [
    `${GITHUB_CDN_BASE}/assets/驴酱杯封面.webp`,
  ],
  mobile: [
    `${GITHUB_CDN_BASE}/assets/驴酱杯封面.webp`,
  ],
} as const;

export const SCROLL_TIP_IMAGE = '/glide-tip.png';

export const ANIMATION_CONFIG = {
  carouselInterval: 3000,
  exitDuration: 900,
  touchThreshold: 50,
} as const;
