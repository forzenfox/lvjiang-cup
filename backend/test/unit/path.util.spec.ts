import * as path from 'path';
import {
  getUploadBaseDir,
  getUploadDir,
  getTeamLogoPath,
  getMemberAvatarPath,
  getTeamLogoUrl,
  getTeamLogoThumbnailUrl,
  getMemberAvatarUrl,
} from '../../src/common/utils/path.util';

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args: string[]) => args.join('/').replace(/\/+/g, '/')),
}));

describe('path.util - 路径工具函数', () => {
  describe('getUploadBaseDir - 获取上传基准目录', () => {
    it('应该返回上传基准目录', () => {
      const result = getUploadBaseDir();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('相对路径应该被解析为绝对路径', () => {
      const result = getUploadBaseDir();
      if (!path.isAbsolute(result)) {
        expect(result).toContain('/');
      }
    });
  });

  describe('getUploadDir - 获取上传完整目录路径', () => {
    it('应该正确拼接子目录', () => {
      const result = getUploadDir('teams');
      expect(result).toContain('teams');
    });

    it('应该包含上传基准目录', () => {
      const result = getUploadDir('teams');
      expect(result).toContain('uploads');
    });
  });

  describe('getTeamLogoPath - 获取战队 logo 路径', () => {
    it('应该返回正确的战队 logo 路径', () => {
      const filename = 'test-uuid.png';
      const result = getTeamLogoPath(filename);
      expect(result).toContain('teams');
      expect(result).toContain(filename);
    });
  });

  describe('getMemberAvatarPath - 获取队员头像路径', () => {
    it('应该返回正确的队员头像路径', () => {
      const filename = 'test-uuid.png';
      const result = getMemberAvatarPath(filename);
      expect(result).toContain('members');
      expect(result).toContain(filename);
    });
  });

  describe('getTeamLogoUrl - 获取战队 logo URL', () => {
    it('应该返回正确的 logo URL', () => {
      const filename = 'test-uuid.png';
      const result = getTeamLogoUrl(filename);
      expect(result).toBe(`/uploads/teams/${filename}`);
    });
  });

  describe('getTeamLogoThumbnailUrl - 获取战队 logo 缩略图 URL', () => {
    it('应该返回正确的缩略图 URL', () => {
      const filename = 'test-uuid.png';
      const result = getTeamLogoThumbnailUrl(filename);
      expect(result).toContain('/uploads/teams/');
      expect(result).toContain('_thumb');
    });
  });

  describe('getMemberAvatarUrl - 获取队员头像 URL', () => {
    it('应该返回正确的头像 URL', () => {
      const filename = 'test-uuid.png';
      const result = getMemberAvatarUrl(filename);
      expect(result).toBe(`/uploads/members/${filename}`);
    });
  });
});
