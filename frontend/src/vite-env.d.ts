/// <reference types="vite/client" />

/**
 * 运行时配置接口
 * 用于 Docker 部署场景下的动态配置
 */
interface Window {
  APP_CONFIG?: {
    API_BASE_URL?: string;
    APP_NAME?: string;
    VERSION?: string;
    [key: string]: any;
  };
}
