import { uploadConfig } from '../../src/config/upload.config';

describe('uploadConfig', () => {
  describe('基础配置', () => {
    it('应该有正确的基准目录配置', () => {
      expect(uploadConfig.baseDir).toBeDefined();
      expect(typeof uploadConfig.baseDir).toBe('string');
    });

    it('应该有正确的子目录配置', () => {
      expect(uploadConfig.teamLogoDir).toBe('teams');
      expect(uploadConfig.memberAvatarDir).toBe('members');
      expect(uploadConfig.videoCoverDir).toBe('covers');
    });
  });

  describe('文件类型配置', () => {
    it('应该允许 PNG 格式', () => {
      expect(uploadConfig.allowedMimeTypes).toContain('image/png');
    });

    it('应该允许 JPEG 格式', () => {
      expect(uploadConfig.allowedMimeTypes).toContain('image/jpeg');
      expect(uploadConfig.allowedMimeTypes).toContain('image/jpg');
    });

    it('应该允许 GIF 格式', () => {
      expect(uploadConfig.allowedMimeTypes).toContain('image/gif');
    });

    it('应该允许 WebP 格式', () => {
      expect(uploadConfig.allowedMimeTypes).toContain('image/webp');
    });

    it('应该包含 5 种允许的文件类型', () => {
      expect(uploadConfig.allowedMimeTypes).toHaveLength(5);
    });
  });

  describe('文件大小限制', () => {
    it('应该有正确的 logo 文件大小限制（5MB）', () => {
      expect(uploadConfig.maxFileSize.logo).toBe(5 * 1024 * 1024);
      expect(uploadConfig.maxFileSize.logo).toBe(5242880);
    });

    it('应该有正确的 avatar 文件大小限制（5MB）', () => {
      expect(uploadConfig.maxFileSize.avatar).toBe(5 * 1024 * 1024);
    });

    it('应该有正确的 poster 文件大小限制（20MB）', () => {
      expect(uploadConfig.maxFileSize.poster).toBe(20 * 1024 * 1024);
    });

    it('应该有正确的 cover 文件大小限制（20MB）', () => {
      expect(uploadConfig.maxFileSize.cover).toBe(20 * 1024 * 1024);
    });

    it('应该有正确的默认文件大小限制（5MB）', () => {
      expect(uploadConfig.defaultMaxFileSize).toBe(5 * 1024 * 1024);
    });
  });

  describe('缩略图尺寸配置', () => {
    it('应该有正确的缩略图尺寸', () => {
      expect(uploadConfig.thumbnailSize).toEqual({
        width: 128,
        height: 128,
      });
    });
  });
});
