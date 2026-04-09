/**
 * 获取完整的上传文件访问地址
 * @param url 相对路径，如 /uploads/teams/xxx.png
 * @returns 完整 URL，如 http://localhost:3000/uploads/teams/xxx.png
 */
export function getUploadUrl(url: string | undefined | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL
    ? window.APP_CONFIG.API_BASE_URL
    : 'http://localhost:3000';

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
