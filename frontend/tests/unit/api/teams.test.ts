import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadTeamLogo } from '@/api/teams';
import apiClient from '@/api/axios';

// 模拟 axios
vi.mock('@/api/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('teams API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadTeamLogo - 上传战队图标', () => {
    it('应该正确构造 FormData 并发送请求', async () => {
      // Arrange
      const teamId = 'team1';
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });
      const mockResponse = {
        data: {
          success: true,
          data: {
            url: '/uploads/teams/team1/logo.png',
            thumbnailUrl: '/uploads/teams/team1/logo_thumbnail.png',
          },
        },
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await uploadTeamLogo(teamId, mockFile);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith(
        '/admin/upload/image',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
        }),
      );
      expect(result.url).toBe('/uploads/teams/team1/logo.png');
      expect(result.thumbnailUrl).toBe('/uploads/teams/team1/logo_thumbnail.png');
    });

    it('应该在请求失败时抛出错误', async () => {
      // Arrange
      const teamId = 'team1';
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          success: false,
          message: '上传失败',
        },
      });

      // Act & Assert
      await expect(uploadTeamLogo(teamId, mockFile)).rejects.toThrow('上传失败');
    });

    it('应该正确设置 type 和 id 参数', async () => {
      // Arrange
      const teamId = 'team123';
      const mockFile = new File(['test'], 'logo.png', { type: 'image/png' });
      const mockResponse = {
        data: {
          success: true,
          data: {
            url: '/uploads/teams/team123/logo.png',
          },
        },
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      await uploadTeamLogo(teamId, mockFile);

      // Assert
      const formDataCall = (apiClient.post as ReturnType<typeof vi.fn>).mock.calls[0];
      const formData = formDataCall[1] as FormData;

      expect(formData.get('type')).toBe('logo');
      expect(formData.get('id')).toBe(teamId);
      expect(formData.get('file')).toBe(mockFile);
    });
  });
});
