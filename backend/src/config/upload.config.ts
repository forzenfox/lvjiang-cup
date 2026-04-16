/**
 * 上传配置文件
 * 配置上传文件的存储路径、文件类型限制等
 */

export interface CompressionConfig {
  width: number;
  height: number;
  fit: 'cover' | 'contain' | 'inside' | 'outside';
  format: 'webp' | 'jpeg' | 'png';
  quality: number;
}

export const uploadConfig = {
  // 从环境变量读取上传基准目录，支持开发/生产环境切换
  // 开发环境: ./uploads (相对于项目根目录，会被 path.resolve 转为绝对路径)
  // 生产环境: /app/uploads (容器内绝对路径，Docker 挂载)
  baseDir: process.env.UPLOAD_BASE_DIR || './uploads',

  // 子目录
  teamLogoDir: 'teams',
  memberAvatarDir: 'members',
  streamerPosterDir: 'streamers',
  videoCoverDir: 'covers',

  // 允许的文件类型
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],

  // 类型特定的文件大小限制
  maxFileSize: {
    logo: 5 * 1024 * 1024, // 5MB
    avatar: 5 * 1024 * 1024, // 5MB
    poster: 20 * 1024 * 1024, // 20MB
    cover: 20 * 1024 * 1024, // 20MB
  },

  // 默认文件大小限制（用于向后兼容）
  defaultMaxFileSize: 5 * 1024 * 1024,

  // 缩略图尺寸
  thumbnailSize: {
    width: 128,
    height: 128,
  },

  // 图片压缩配置
  compression: {
    enabled: true,
    logo: { width: 512, height: 512, fit: 'inside', format: 'webp', quality: 80 },
    avatar: { width: 256, height: 256, fit: 'cover', format: 'webp', quality: 80 },
    poster: { width: 1920, height: 1920, fit: 'inside', format: 'webp', quality: 85 },
    cover: { width: 1920, height: 1920, fit: 'inside', format: 'webp', quality: 85 },
  },
};
