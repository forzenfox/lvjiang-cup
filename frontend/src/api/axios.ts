import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { handleError, ErrorHandlerConfig } from '@/utils/error-handler';

// 从环境变量读取基础 URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TIMEOUT = 10000; // 10 秒超时

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
