import * as path from 'path';
import {
  getUploadBaseDir,
  getUploadDir,
  getTeamLogoPath,
  getMemberAvatarPath,
  getUploadUrlPrefix,
  getTeamLogoUrl,
  getTeamLogoThumbnailUrl,
  getMemberAvatarUrl,
} from '../../src/common/utils/path.util';

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args: string[]) => args.join('/').replace(/\/+/g, '/')),
}));

describe('path.util - 路径工具函数', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('getUploadBaseDir - 获取上传基准目录', () => {
    it('开发环境下应返回项目根目录（向上两级）', () => {
      process.env.NODE_ENV = 'development';
      const result = getUploadBaseDir();
      expect(result).toContain('..');
    });

    it('生产环境下应返回 process.cwd()', () => {
      process.env.NODE_ENV = 'production';
      const result = getUploadBaseDir();
      expect(result).toBe(process.cwd());
    });

    it('默认环境下应返回项目根目录', () => {
      delete process.env.NODE_ENV;
      const result = getUploadBaseDir();
      expect(result).toContain('..');
    });
  });

  describe('getUploadDir - 获取上传完整目录路径', () => {
    it('应该正确拼接子目录', () => {
      const result = getUploadDir('teams');
      expect(result).toContain('uploads');
      expect(result).toContain('teams');
    });

    it('应该包含 ID 参数', () => {
      const result = getUploadDir('teams', 'team123');
      expect(result).toContain('team123');
    });

    it('ID 为空时应只包含子目录', () => {
      const result = getUploadDir('teams');
      expect(result).toContain('uploads');
      expect(result).toContain('teams');
    });
  });

  describe('getTeamLogoPath - 获取战队 logo 路径', () => {
    it('应该返回正确的战队 logo 路径', () => {
      const result = getTeamLogoPath('team1');
      expect(result).toContain('uploads');
      expect(result).toContain('teams');
      expect(result).toContain('team1');
    });
  });

  describe('getMemberAvatarPath - 获取队员头像路径', () => {
    it('应该返回正确的队员头像路径', () => {
      const result = getMemberAvatarPath('member1');
      expect(result).toContain('uploads');
      expect(result).toContain('members');
      expect(result).toContain('member1');
    });
  });

  describe('getUploadUrlPrefix - 获取上传访问 URL 前缀', () => {
    it('应该返回 /uploads', () => {
      const result = getUploadUrlPrefix();
      expect(result).toBe('/uploads');
    });
  });

  describe('getTeamLogoUrl - 获取战队 logo URL', () => {
    it('应该返回正确的 logo URL', () => {
      const result = getTeamLogoUrl('team1');
      expect(result).toBe('/uploads/teams/team1/logo.png');
    });
  });

  describe('getTeamLogoThumbnailUrl - 获取战队 logo 缩略图 URL', () => {
    it('应该返回正确的缩略图 URL', () => {
      const result = getTeamLogoThumbnailUrl('team1');
      expect(result).toBe('/uploads/teams/team1/logo_thumbnail.png');
    });
  });

  describe('getMemberAvatarUrl - 获取队员头像 URL', () => {
    it('应该返回正确的头像 URL', () => {
      const result = getMemberAvatarUrl('member1');
      expect(result).toBe('/uploads/members/member1/avatar.png');
    });
  });
});
