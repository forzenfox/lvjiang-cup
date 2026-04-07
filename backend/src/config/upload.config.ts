/**
 * 上传配置文件
 * 配置上传文件的存储路径、文件类型限制等
 */

export const uploadConfig = {
  // 上传文件存放的相对目录（相对于基准目录）
  relativeDir: 'uploads',

  // 战队图标子目录
  teamLogoDir: 'teams',

  // 队员头像子目录
  memberAvatarDir: 'members',

  // 允许的文件类型
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],

  // 文件大小限制（5MB）
  maxFileSize: 5 * 1024 * 1024,

  // 战队 logo 文件名
  logoFileName: 'logo.png',

  // 缩略图文件名
  thumbnailFileName: 'logo_thumbnail.png',

  // 队员头像文件名
  avatarFileName: 'avatar.png',

  // 缩略图尺寸
  thumbnailSize: {
    width: 128,
    height: 128,
  },
};
