/**
 * 前端运行时配置文件（生产环境模板）
 *
 * 此文件用于 Docker 生产环境部署
 * 通过 volume 挂载到前端容器中，覆盖默认的本地开发配置
 *
 * 使用方法：
 * 1. 复制此文件到部署目录：cp config.js /opt/lvjiang-cup/config/config.js
 * 2. 根据实际情况修改 API_BASE_URL
 * 3. docker-compose.yml 中已配置 volume 挂载
 * 4. 修改后执行 docker-compose restart frontend 生效
 */

window.APP_CONFIG = {
  // API 基础地址
  // - 使用 Nginx Proxy Manager 代理时，使用相对路径: '/api'
  // - 分离部署（前后端不同域名）时，使用完整地址: 'https://api.your-domain.com/api'
  API_BASE_URL: '/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',
};

console.log('[Config] 生产环境配置已加载:', window.APP_CONFIG);
