import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError } from 'axios';
import {
  AppError,
  ErrorType,
  HttpStatusCode,
  parseAxiosError,
  isNetworkError,
  isTimeoutError,
  getHttpErrorMessage,
  handleError,
  safeExecute,
} from '@/utils/error-handler';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', ErrorType.NETWORK, 500);

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should check error type correctly', () => {
      const error = new AppError('Test error', ErrorType.AUTH);

      expect(error.isType(ErrorType.AUTH)).toBe(true);
      expect(error.isType(ErrorType.NETWORK)).toBe(false);
    });

    it('should check status code correctly', () => {
      const error = new AppError('Test error', ErrorType.SERVER, 404);

      expect(error.isStatus(404)).toBe(true);
      expect(error.isStatus(500)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network errors', () => {
      const error = new AxiosError('Network Error');
      error.code = 'ERR_NETWORK';

      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new AxiosError('Server Error');
      error.response = { status: 500, statusText: 'Internal Server Error', data: {}, headers: {}, config: {} as any };

      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for non-Axios errors', () => {
      expect(isNetworkError(new Error('Test'))).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('should return true for timeout errors', () => {
      const error = new AxiosError('Timeout');
      error.code = 'ECONNABORTED';

      expect(isTimeoutError(error)).toBe(true);
    });

    it('should return false for non-timeout errors', () => {
      const error = new AxiosError('Server Error');

      expect(isTimeoutError(error)).toBe(false);
    });
  });

  describe('getHttpErrorMessage', () => {
    it('should return correct message for known status codes', () => {
      expect(getHttpErrorMessage(HttpStatusCode.BAD_REQUEST)).toBe('请求参数错误，请检查输入');
      expect(getHttpErrorMessage(HttpStatusCode.UNAUTHORIZED)).toBe('登录已过期，请重新登录');
      expect(getHttpErrorMessage(HttpStatusCode.NOT_FOUND)).toBe('请求的资源不存在');
      expect(getHttpErrorMessage(HttpStatusCode.INTERNAL_SERVER_ERROR)).toBe('服务器内部错误，请稍后再试');
    });

    it('should return generic message for unknown status codes', () => {
      expect(getHttpErrorMessage(999)).toBe('请求失败 (999)');
    });
  });

  describe('parseAxiosError', () => {
    it('should parse network error correctly', () => {
      const error = new AxiosError('Network Error');
      error.code = 'ERR_NETWORK';

      const appError = parseAxiosError(error);

      expect(appError.type).toBe(ErrorType.NETWORK);
      expect(appError.message).toBe('网络连接失败，请检查网络设置');
    });

    it('should parse timeout error correctly', () => {
      const error = new AxiosError('Timeout');
      error.code = 'ECONNABORTED';

      const appError = parseAxiosError(error);

      expect(appError.type).toBe(ErrorType.TIMEOUT);
      expect(appError.message).toBe('请求超时，请稍后再试');
    });

    it('should parse 401 error correctly', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: { message: 'Unauthorized' },
        headers: {},
        config: {} as any,
      };

      const appError = parseAxiosError(error);

      expect(appError.type).toBe(ErrorType.AUTH);
      expect(appError.statusCode).toBe(401);
    });

    it('should parse 500 error correctly', () => {
      const error = new AxiosError('Server Error');
      error.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Internal Server Error' },
        headers: {},
        config: {} as any,
      };

      const appError = parseAxiosError(error);

      expect(appError.type).toBe(ErrorType.SERVER);
      expect(appError.statusCode).toBe(500);
    });
  });

  describe('safeExecute', () => {
    it('should return data on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await safeExecute(fn);

      expect(result).toBe('success');
    });

    it('should return null on error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Test error'));

      const result = await safeExecute(fn);

      expect(result).toBeNull();
    });

    it('should call onError callback on error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Test error'));
      const onError = vi.fn();

      await safeExecute(fn, { onError, showToast: false });

      expect(onError).toHaveBeenCalled();
    });
  });
});
