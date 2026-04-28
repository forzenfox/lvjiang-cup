import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import {
  downloadStreamerTemplate,
  importStreamers,
  downloadStreamerErrorReport,
  type StreamerImportResult,
} from '../../../src/api/streamers-import';
import apiClient from '../../../src/api/axios';

vi.mock('../../../src/api/axios');

const mockedApiClient = apiClient as Mocked<typeof apiClient>;

describe('streamers-import API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('downloadStreamerTemplate', () => {
    it('应正确调用 GET /admin/streamers/import/template', async () => {
      const mockBlob = new Blob(['test'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockedApiClient.get.mockResolvedValueOnce({ data: mockBlob } as any);

      const result = await downloadStreamerTemplate();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/admin/streamers/import/template', {
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });
  });

  describe('importStreamers', () => {
    it('应正确构造 FormData 并调用 POST /admin/streamers/import', async () => {
      const mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const mockResult: StreamerImportResult = {
        total: 10,
        created: 10,
        failed: 0,
        errors: [],
        externalUrlItems: [],
      };
      mockedApiClient.post.mockResolvedValueOnce({
        data: { success: true, data: mockResult },
      } as any);

      const result = await importStreamers(mockFile);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/admin/streamers/import',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result).toEqual(mockResult);
    });

    it('API 返回 success=false 时应抛出错误', async () => {
      const mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockedApiClient.post.mockResolvedValueOnce({
        data: { success: false, message: '导入失败' },
      } as any);

      await expect(importStreamers(mockFile)).rejects.toThrow('导入失败');
    });

    it('API 返回 success=true 但 data 为空时应抛出错误', async () => {
      const mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      mockedApiClient.post.mockResolvedValueOnce({
        data: { success: true, data: null },
      } as any);

      await expect(importStreamers(mockFile)).rejects.toThrow('导入失败');
    });
  });

  describe('downloadStreamerErrorReport', () => {
    it('应正确调用 POST /admin/streamers/import/error-report', async () => {
      const mockBlob = new Blob(['error report'], { type: 'text/plain' });
      const errors = [{ row: 3, nickname: '', field: 'nickname', message: '主播昵称不能为空' }];
      mockedApiClient.post.mockResolvedValueOnce({ data: mockBlob } as any);

      const result = await downloadStreamerErrorReport(errors);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/admin/streamers/import/error-report',
        { errors },
        { responseType: 'blob' }
      );
      expect(result).toBe(mockBlob);
    });
  });
});
