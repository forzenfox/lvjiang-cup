/**
 * 前端运行时配置文件（生产环境）
 *
 * 此文件用于 Docker 生产环境部署
 * 构建时直接打包到 dist 目录
 *
 * 使用方法：
 * 1. 根据实际情况修改 API_BASE_URL
 * 2. 重新构建前端镜像
 * 3. 部署新镜像
 */

window.APP_CONFIG = {
  // API 基础地址
  // - 使用 Nginx Proxy Manager 代理时，使用相对路径：'/api'
  // - 分离部署（前后端不同域名）时，使用完整地址：'https://api.your-domain.com/api'
  API_BASE_URL: 'http://localhost:3000/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',

  // GitHub CDN 基础地址 (用于加载 assets/ 目录下的图片资源)
  // 默认使用 JSDMirror (国内加速)，可随时切换为其他 CDN 源
  GITHUB_CDN_BASE: 'https://cdn.jsdmirror.com/gh/forzenfox/lvjiang-cup@main',
};

console.log('[Config] 开发环境配置已加载:', window.APP_CONFIG);
