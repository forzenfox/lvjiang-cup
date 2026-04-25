import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { handleError, ErrorHandlerConfig } from '@/utils/error-handler';

const TIMEOUT = 10000;

/**
 * 扩展 AxiosRequestConfig，支持自定义配置
 */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  /** 错误处理配置 */
  errorConfig?: ErrorHandlerConfig;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器 - 动态获取 baseURL 并注入 Token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL) {
      config.baseURL = window.APP_CONFIG.API_BASE_URL;
    }

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
    // 获取请求配置中的自定义错误处理配置
    const config = error.config as ExtendedAxiosRequestConfig | undefined;
    const errorConfig = config?.errorConfig;

    // 使用新的错误处理系统
    handleError(error, {
      showToast: errorConfig?.showToast ?? true,
      redirectToLogin: errorConfig?.redirectToLogin ?? true,
      onError: errorConfig?.onError,
      onUnauthorized: errorConfig?.onUnauthorized,
      onForbidden: errorConfig?.onForbidden,
      onNotFound: errorConfig?.onNotFound,
      onServerError: errorConfig?.onServerError,
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
  const response = await apiClient({
    ...config,
    errorConfig,
  } as ExtendedAxiosRequestConfig);
  return response.data as T;
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
