/**
 * 路径工具函数
 * 处理上传文件路径相关逻辑
 * 支持开发环境（相对路径）和生产环境（绝对路径）
 */

import * as path from 'path';
import { uploadConfig } from '../../config/upload.config';

/**
 * 获取上传基准目录
 * - 生产环境 (/app/uploads): 绝对路径，容器内直接使用
 * - 开发环境 (./uploads): 相对路径，相对于 process.cwd()
 */
export function getUploadBaseDir(): string {
  const baseDir = uploadConfig.baseDir;

  if (path.isAbsolute(baseDir) || /^[a-zA-Z]:/.test(baseDir)) {
    return baseDir;
  }

  return path.resolve(process.cwd(), baseDir);
}

/**
 * 获取上传完整目录路径
 * @param subDir 子目录 ('teams' | 'members')
 */
export function getUploadDir(subDir: string): string {
  const baseDir = getUploadBaseDir();
  return path.join(baseDir, subDir);
}

/**
 * 获取战队 logo 存储路径 (磁盘)
 * @param filename UUID 文件名 (含扩展名)
 */
export function getTeamLogoPath(filename: string): string {
  return path.join(getUploadDir(uploadConfig.teamLogoDir), filename);
}

/**
 * 获取队员头像存储路径 (磁盘)
 * @param filename UUID 文件名 (含扩展名)
 */
export function getMemberAvatarPath(filename: string): string {
  return path.join(getUploadDir(uploadConfig.memberAvatarDir), filename);
}

/**
 * 获取战队 logo 访问 URL
 * @param filename UUID 文件名 (含扩展名)
 */
export function getTeamLogoUrl(filename: string): string {
  return `/api/uploads/${uploadConfig.teamLogoDir}/${filename}`;
}

/**
 * 获取战队 logo 缩略图访问 URL
 * @param filename UUID 文件名 (含扩展名)
 */
export function getTeamLogoThumbnailUrl(filename: string): string {
  const basename = filename.replace(/\.[^.]+$/, '');
  const ext = path.extname(filename) || '.png';
  return `/api/uploads/${uploadConfig.teamLogoDir}/${basename}_thumb${ext}`;
}

/**
 * 获取队员头像访问 URL
 * @param filename UUID 文件名 (含扩展名)
 */
export function getMemberAvatarUrl(filename: string): string {
  return `/api/uploads/${uploadConfig.memberAvatarDir}/${filename}`;
}

/**
 * 获取主播海报存储路径 (磁盘)
 * @param filename UUID 文件名 (含扩展名)
 */
export function getStreamerPosterPath(filename: string): string {
  return path.join(getUploadDir(uploadConfig.streamerPosterDir), filename);
}

/**
 * 获取主播海报访问 URL
 * @param filename UUID 文件名 (含扩展名)
 */
export function getStreamerPosterUrl(filename: string): string {
  return `/api/uploads/${uploadConfig.streamerPosterDir}/${filename}`;
}

/**
 * 获取战队 logo 缩略图存储路径 (磁盘)
 * @param filename UUID 文件名 (含扩展名)
 */
export function getTeamLogoThumbnailPath(filename: string): string {
  const basename = filename.replace(/\.[^.]+$/, '');
  const ext = path.extname(filename) || '.png';
  return path.join(getUploadDir(uploadConfig.teamLogoDir), `${basename}_thumb${ext}`);
}
