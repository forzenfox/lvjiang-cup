import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');

  /**
   * 上传战队图标
   * @param teamId 战队ID
   * @param file 文件 buffer
   * @param thumbnail 缩略图 buffer (128x128)
   */
  async uploadTeamLogo(teamId: string, file: Buffer, thumbnail?: Buffer): Promise<UploadResult> {
    const teamDir = path.join(this.UPLOAD_DIR, 'teams', teamId);
    await this.ensureDir(teamDir);

    // 保存原始 logo
    const logoPath = path.join(teamDir, 'logo.png');
    await fs.promises.writeFile(logoPath, file);

    // 保存缩略图
    let thumbnailUrl: string | undefined;
    if (thumbnail) {
      const thumbnailPath = path.join(teamDir, 'logo_thumbnail.png');
      await fs.promises.writeFile(thumbnailPath, thumbnail);
      thumbnailUrl = `/uploads/teams/${teamId}/logo_thumbnail.png`;
    }

    const url = `/uploads/teams/${teamId}/logo.png`;

    this.logger.log(`Team logo uploaded: ${teamId}`);

    return { url, thumbnailUrl };
  }

  /**
   * 上传队员头像
   * @param memberId 队员ID
   * @param file 文件 buffer
   */
  async uploadMemberAvatar(memberId: string, file: Buffer): Promise<UploadResult> {
    const memberDir = path.join(this.UPLOAD_DIR, 'members', memberId);
    await this.ensureDir(memberDir);

    // 保存头像
    const avatarPath = path.join(memberDir, 'avatar.png');
    await fs.promises.writeFile(avatarPath, file);

    const url = `/uploads/members/${memberId}/avatar.png`;

    this.logger.log(`Member avatar uploaded: ${memberId}`);

    return { url };
  }

  /**
   * 处理图片上传
   * @param type 上传类型: avatar, logo
   * @param id 关联的 ID (teamId or memberId)
   * @param file 文件 buffer
   * @param thumbnail 可选的缩略图 buffer
   */
  async uploadImage(
    type: 'avatar' | 'logo',
    id: string,
    file: Buffer,
    thumbnail?: Buffer,
  ): Promise<UploadResult> {
    if (!['avatar', 'logo'].includes(type)) {
      throw new BadRequestException('Invalid upload type. Must be "avatar" or "logo"');
    }

    if (type === 'logo') {
      return this.uploadTeamLogo(id, file, thumbnail);
    } else {
      return this.uploadMemberAvatar(id, file);
    }
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