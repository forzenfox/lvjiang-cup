import { uploadConfig } from '../../src/config/upload.config';

describe('uploadConfig', () => {
  describe('基础配置', () => {
    it('应该有正确的相对目录配置', () => {
      expect(uploadConfig.relativeDir).toBe('uploads');
    });

    it('应该有正确的子目录配置', () => {
      expect(uploadConfig.teamLogoDir).toBe('teams');
      expect(uploadConfig.memberAvatarDir).toBe('members');
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
    it('应该有正确的文件大小限制（5MB）', () => {
      expect(uploadConfig.maxFileSize).toBe(5 * 1024 * 1024);
      expect(uploadConfig.maxFileSize).toBe(5242880);
    });
  });

  describe('文件名配置', () => {
    it('应该有正确的 logo 文件名', () => {
      expect(uploadConfig.logoFileName).toBe('logo.png');
    });

    it('应该有正确的缩略图文件名', () => {
      expect(uploadConfig.thumbnailFileName).toBe('logo_thumbnail.png');
    });

    it('应该有正确的头像文件名', () => {
      expect(uploadConfig.avatarFileName).toBe('avatar.png');
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
