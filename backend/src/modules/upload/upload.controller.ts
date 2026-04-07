import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { UploadService, UploadResult } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { uploadConfig } from '../../config/upload.config';
import { getUploadDir } from '../../common/utils/path.util';

@ApiTags('文件上传')
@Controller()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('admin/upload/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传图片（需认证）' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = req.body.type;
          const id = req.body.id;

          if (!type || !['avatar', 'logo'].includes(type)) {
            return cb(new BadRequestException('Invalid type'), false);
          }

          if (!id) {
            return cb(new BadRequestException('id is required'), false);
          }

          const dest = getUploadDir(
            type === 'logo' ? uploadConfig.teamLogoDir : uploadConfig.memberAvatarDir,
            id
          );

          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }

          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const type = req.body.type;
          const filename = type === 'logo' ? uploadConfig.logoFileName : uploadConfig.avatarFileName;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('仅支持 JPG/PNG/GIF/WebP 格式图片'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: uploadConfig.maxFileSize,
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: any,
    @Body('type') type: string,
    @Body('id') id: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!type || !['avatar', 'logo'].includes(type)) {
      throw new BadRequestException('上传类型错误，必须是 "avatar" 或 "logo"');
    }

    if (!id) {
      throw new BadRequestException('缺少关联 ID');
    }

    this.logger.log(`File uploaded: ${file.originalname}, type: ${type}, id: ${id}`);

    // 调用 Service 处理上传（支持缩略图等高级功能）
    const fileBuffer = await fs.promises.readFile(file.path);
    return this.uploadService.uploadImage(type as 'avatar' | 'logo', id, fileBuffer);
  }
}
