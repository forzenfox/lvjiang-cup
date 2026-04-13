import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { uploadConfig } from '../../config/upload.config';
import { DatabaseService } from '../../database/database.service';
import {
  getUploadDir,
  getTeamLogoPath,
  getTeamLogoUrl,
  getTeamLogoThumbnailPath,
  getTeamLogoThumbnailUrl,
  getMemberAvatarPath,
  getMemberAvatarUrl,
  getStreamerPosterPath,
  getStreamerPosterUrl,
} from '../../common/utils/path.util';

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
}

export interface CleanupResult {
  scannedFiles: number;
  orphanedFiles: number;
  deletedFiles: string[];
  errors: string[];
  duration: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * 上传战队图标
   * @param filename UUID 文件名 (含扩展名)
   * @param buffer 文件内容
   */
  async uploadTeamLogo(filename: string, buffer: Buffer): Promise<UploadResult> {
    const logoPath = getTeamLogoPath(filename);
    await this.ensureDir(path.dirname(logoPath));
    await fs.promises.writeFile(logoPath, buffer);

    this.logger.log(`Team logo uploaded: ${filename}`);

    return { url: getTeamLogoUrl(filename) };
  }

  /**
   * 上传队员头像
   * @param filename UUID 文件名 (含扩展名)
   * @param buffer 文件内容
   */
  async uploadMemberAvatar(filename: string, buffer: Buffer): Promise<UploadResult> {
    const avatarPath = getMemberAvatarPath(filename);
    await this.ensureDir(path.dirname(avatarPath));
    await fs.promises.writeFile(avatarPath, buffer);

    this.logger.log(`Member avatar uploaded: ${filename}`);

    return { url: getMemberAvatarUrl(filename) };
  }

  /**
   * 上传主播海报
   * @param filename UUID 文件名 (含扩展名)
   * @param buffer 文件内容
   */
  async uploadStreamerPoster(filename: string, buffer: Buffer): Promise<UploadResult> {
    const posterPath = getStreamerPosterPath(filename);
    await this.ensureDir(path.dirname(posterPath));
    await fs.promises.writeFile(posterPath, buffer);

    this.logger.log(`Streamer poster uploaded: ${filename}`);

    return { url: getStreamerPosterUrl(filename) };
  }

  /**
   * 统一上传入口
   * @param type 上传类型: avatar, logo, poster
   * @param filename UUID 文件名 (含扩展名)
   * @param buffer 文件内容
   */
  async uploadImage(
    type: 'avatar' | 'logo' | 'poster',
    filename: string,
    buffer: Buffer,
  ): Promise<UploadResult> {
    if (type === 'logo') {
      return this.uploadTeamLogo(filename, buffer);
    }
    if (type === 'poster') {
      return this.uploadStreamerPoster(filename, buffer);
    }
    return this.uploadMemberAvatar(filename, buffer);
  }

  /**
   * 清理未被数据库引用的孤立文件
   */
  async cleanupOrphanedFiles(): Promise<CleanupResult> {
    const startTime = Date.now();
    const result: CleanupResult = {
      scannedFiles: 0,
      orphanedFiles: 0,
      deletedFiles: [],
      errors: [],
      duration: 0,
    };

    try {
      const usedUrls = await this.getAllUsedFileUrls();

      const dirs = [
        getUploadDir(uploadConfig.teamLogoDir),
        getUploadDir(uploadConfig.memberAvatarDir),
        getUploadDir(uploadConfig.streamerPosterDir),
      ];

      for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;

        const files = await fs.promises.readdir(dir);
        for (const file of files) {
          result.scannedFiles++;
          const fileUrl = `/api/uploads/${path.basename(dir)}/${file}`;

          if (!usedUrls.has(fileUrl)) {
            const filePath = path.join(dir, file);
            try {
              await fs.promises.unlink(filePath);
              result.deletedFiles.push(fileUrl);
              result.orphanedFiles++;
              this.logger.log(`Deleted orphaned file: ${fileUrl}`);
            } catch (err) {
              result.errors.push(`Failed to delete ${fileUrl}: ${err.message}`);
            }
          }
        }
      }
    } catch (err) {
      result.errors.push(`Cleanup failed: ${err.message}`);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * 获取数据库中所有使用的文件 URL
   */
  private async getAllUsedFileUrls(): Promise<Set<string>> {
    const urls = new Set<string>();

    const teams = await this.databaseService.all<any>('SELECT logo_url FROM teams');
    teams.forEach((t) => {
      if (t.logo_url) urls.add(t.logo_url);
    });

    const teams2 = await this.databaseService.all<any>('SELECT logo_thumbnail_url FROM teams');
    teams2.forEach((t) => {
      if (t.logo_thumbnail_url) urls.add(t.logo_thumbnail_url);
    });

    const members = await this.databaseService.all<any>('SELECT avatar_url FROM team_members');
    members.forEach((m) => {
      if (m.avatar_url) urls.add(m.avatar_url);
    });

    const streamers = await this.databaseService.all<any>('SELECT poster_url FROM streamers');
    streamers.forEach((s) => {
      if (s.poster_url) urls.add(s.poster_url);
    });

    return urls;
  }

  /**
   * 确保目录存在
   */
  private async ensureDir(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
