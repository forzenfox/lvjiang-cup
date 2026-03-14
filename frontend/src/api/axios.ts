import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { handleError, ErrorHandlerConfig } from '@/utils/error-handler';

/**
 * 获取 API 基础 URL
 * 优先从运行时配置读取，其次从环境变量读取，最后使用默认值
 */
const getBaseUrl = (): string => {
  // 1. 尝试从运行时配置读取（Docker 部署场景）
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL) {
    return window.APP_CONFIG.API_BASE_URL;
  }

  // 2. 尝试从环境变量读取（开发环境）
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 3. 默认使用相对路径
  return '/api';
};

const BASE_URL = getBaseUrl();
const TIMEOUT = 10000; // 10 秒超时

console.log('[API] 使用 API 基础地址:', BASE_URL);

/**
 * 创建 Axios 实例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器 - 自动注入 Token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 Token
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 错误处理、401 自动跳转
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 使用新的错误处理系统
    handleError(error, {
      showToast: true,
      redirectToLogin: true,
    });
    
    return Promise.reject(error);
  }
);

/**
 * 带错误处理的请求方法
 */
export async function request<T>(
  config: AxiosRequestConfig,
  errorConfig?: ErrorHandlerConfig
): Promise<T> {
  try {
    const response = await apiClient(config);
    return response.data as T;
  } catch (error) {
    handleError(error, { showToast: true, ...errorConfig });
    throw error;
  }
}

/**
 * GET 请求
 */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
  errorConfig?: ErrorHandlerConfig
): Promise<T> {
  return request<T>({ ...config, method: 'GET', url }, errorConfig);
}

/**
 * POST 请求
 */
export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  errorConfig?: ErrorHandlerConfig
): Promise<T> {
  return request<T>({ ...config, method: 'POST', url, data }, errorConfig);
}

/**
 * PUT 请求
 */
export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  errorConfig?: ErrorHandlerConfig
): Promise<T> {
  return request<T>({ ...config, method: 'PUT', url, data }, errorConfig);
}

/**
 * PATCH 请求
 */
export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  errorConfig?: ErrorHandlerConfig
): Promise<T> {
  return request<T>({ ...config, method: 'PATCH', url, data }, errorConfig);
}

/**
 * DELETE 请求
 */
export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
  errorConfig?: ErrorHandlerConfig
): Promise<T> {
  return request<T>({ ...config, method: 'DELETE', url }, errorConfig);
}

/**
 * 导出配置好的 Axios 实例
 */
export default apiClient;

/**
 * 导出类型
 */
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
