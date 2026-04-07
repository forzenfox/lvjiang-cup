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
  API_BASE_URL: '/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',
};

console.log('[Config] 生产环境配置已加载:', window.APP_CONFIG);
