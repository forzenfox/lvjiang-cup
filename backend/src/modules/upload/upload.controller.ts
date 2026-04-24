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
import { memoryStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { UploadService, UploadResult } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { uploadConfig } from '../../config/upload.config';

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
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('仅支持 JPG/PNG/GIF/WebP 格式图片'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: uploadConfig.defaultMaxFileSize,
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!type || !['avatar', 'logo', 'poster'].includes(type)) {
      throw new BadRequestException('上传类型错误，必须是 "avatar"、"logo" 或 "poster"');
    }

    const maxSize = uploadConfig.maxFileSize[type as keyof typeof uploadConfig.maxFileSize];
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new BadRequestException(`文件大小不能超过 ${maxSizeMB}MB`);
    }

    const uuid = uuidv4();
    const ext = file.originalname ? file.originalname.split('.').pop() : 'png';
    const filename = `${uuid}.${ext}`;

    this.logger.log(
      `File uploaded: ${file.originalname}, type: ${type}, generated filename: ${filename}`,
    );

    return this.uploadService.uploadImage(
      type as 'avatar' | 'logo' | 'poster',
      filename,
      file.buffer,
    );
  }
}
