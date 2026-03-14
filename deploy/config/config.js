/**
 * 前端运行时配置文件
 * 
 * 此文件在运行时被加载，允许在不重新构建镜像的情况下修改配置
 * 适用于 Docker 部署场景
 * 
 * 使用方法：
 * 1. 在 docker-compose.yml 中外挂此文件
 * 2. 修改此文件中的配置
 * 3. 刷新浏览器即可生效（无需重启容器）
 */

window.APP_CONFIG = {
  // API 基础地址
  // 同机部署使用相对路径: '/api'
  // 分离部署使用完整地址: 'https://api.your-domain.com/api'
  API_BASE_URL: '/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',

  // 其他运行时配置...
};

console.log('[Config] 运行时配置已加载:', window.APP_CONFIG);
