/**
 * 上传配置文件
 * 配置上传文件的存储路径、文件类型限制等
 */

export const uploadConfig = {
  // 从环境变量读取上传基准目录，支持开发/生产环境切换
  // 开发环境: ./uploads (相对于项目根目录，会被 path.resolve 转为绝对路径)
  // 生产环境: /app/uploads (容器内绝对路径，Docker 挂载)
  baseDir: process.env.UPLOAD_BASE_DIR || './uploads',

  // 子目录
  teamLogoDir: 'teams',
  memberAvatarDir: 'members',

  // 允许的文件类型
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],

  // 文件大小限制（5MB）
  maxFileSize: 5 * 1024 * 1024,

  // 缩略图尺寸
  thumbnailSize: {
    width: 128,
    height: 128,
  },
};
