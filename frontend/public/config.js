/**
 * 前端运行时配置文件（本地开发环境）
 *
 * 此文件用于本地开发调试，配置为直接访问本地后端服务
 *
 * 部署说明：
 * - 生产环境请通过 volume 挂载覆盖此文件
 * - 参考 deploy/config.js 作为生产环境配置模板
 */

window.APP_CONFIG = {
  // API 基础地址（本地开发使用 localhost）
  API_BASE_URL: 'http://localhost:3000/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',
};

console.log('[Config] 本地开发配置已加载:', window.APP_CONFIG);
