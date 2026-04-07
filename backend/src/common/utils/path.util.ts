/**
 * 路径工具函数
 * 处理上传文件路径相关逻辑
 */

import * as path from 'path';
import { uploadConfig } from '../../config/upload.config';

/**
 * 获取上传基准目录
 * 生产环境：app 运行目录（process.cwd()）
 * 开发环境：项目根目录
 */
export function getUploadBaseDir(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction
    ? process.cwd()  // 生产环境：app 运行目录
    : path.join(process.cwd(), '..', '..');  // 开发环境：项目根目录
}

/**
 * 获取上传完整目录路径
 * @param subDir 子目录（如 'teams', 'members'）
 * @param id 关联 ID（如 teamId, memberId）
 */
export function getUploadDir(subDir: string, id?: string): string {
  const baseDir = getUploadBaseDir();
  const relativePath = path.join(uploadConfig.relativeDir, subDir, id || '');
  return path.join(baseDir, relativePath);
}

/**
 * 获取战队 logo 路径
 */
export function getTeamLogoPath(teamId: string): string {
  return getUploadDir(uploadConfig.teamLogoDir, teamId);
}

/**
 * 获取队员头像路径
 */
export function getMemberAvatarPath(memberId: string): string {
  return getUploadDir(uploadConfig.memberAvatarDir, memberId);
}

/**
 * 获取上传访问 URL 前缀
 */
export function getUploadUrlPrefix(): string {
  return `/${uploadConfig.relativeDir}`;
}

/**
 * 获取战队 logo URL
 */
export function getTeamLogoUrl(teamId: string): string {
  return `${getUploadUrlPrefix()}/${uploadConfig.teamLogoDir}/${teamId}/${uploadConfig.logoFileName}`;
}

/**
 * 获取战队 logo 缩略图 URL
 */
export function getTeamLogoThumbnailUrl(teamId: string): string {
  return `${getUploadUrlPrefix()}/${uploadConfig.teamLogoDir}/${teamId}/${uploadConfig.thumbnailFileName}`;
}

/**
 * 获取队员头像 URL
 */
export function getMemberAvatarUrl(memberId: string): string {
  return `${getUploadUrlPrefix()}/${uploadConfig.memberAvatarDir}/${memberId}/${uploadConfig.avatarFileName}`;
}
