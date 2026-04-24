interface AppConfig {
  API_BASE_URL?: string;
  APP_NAME?: string;
  VERSION?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
}

/**
 * 获取完整的上传文件访问地址
 * @param url 相对路径，如 /api/uploads/teams/xxx.png 或 uploads/teams/xxx.png
 * @returns 完整 URL，如 http://localhost:3000/api/uploads/teams/xxx.png
 */
export function getUploadUrl(url: string | undefined | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = getBaseUrl();

  const normalizedUrl = url.startsWith('/api/') ? url.slice(4) : url;

  return `${baseUrl}${normalizedUrl.startsWith('/') ? '' : '/'}${normalizedUrl}`;
}

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  if (window.APP_CONFIG?.API_BASE_URL) {
    return window.APP_CONFIG.API_BASE_URL;
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }

  return 'http://localhost:3000';
}
