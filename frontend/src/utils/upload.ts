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

  const baseUrl = typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL
    ? window.APP_CONFIG.API_BASE_URL
    : 'http://localhost:3000';

  // 移除 URL 开头的 /api 前缀，避免与 baseUrl 重复拼接
  const normalizedUrl = url.startsWith('/api/') ? url.slice(4) : url;

  return `${baseUrl}${normalizedUrl.startsWith('/') ? '' : '/'}${normalizedUrl}`;
}
