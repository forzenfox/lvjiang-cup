import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService, UploadResult } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsIn } from 'class-validator';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { Multer } from 'multer';

class UploadDto {
  @IsString()
  @IsIn(['avatar', 'logo'])
  type: 'avatar' | 'logo';
}

@ApiTags('文件上传')
@Controller()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  // 配置 multer 存储
  private getStorage(type: string) {
    return diskStorage({
      destination: (req, file, cb) => {
        const uploadType = req.body.type || type;
        let dest: string;
        
        if (uploadType === 'logo') {
          const teamId = req.params.teamId || req.body.id;
          dest = path.join(process.cwd(), 'uploads', 'teams', teamId || '');
        } else {
          const memberId = req.params.memberId || req.body.id;
          dest = path.join(process.cwd(), 'uploads', 'members', memberId || '');
        }

        // 确保目录存在
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const uploadType = req.body.type || type;
        let filename: string;
        
        if (uploadType === 'logo') {
          filename = 'logo.png';
        } else {
          filename = 'avatar.png';
        }
        
        cb(null, filename);
      },
    });
  }

  @Post('admin/upload/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传图片（需认证）' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const type = req.body.type;
        const id = req.body.id;
        
        let dest: string;
        if (type === 'logo') {
          dest = path.join(process.cwd(), 'uploads', 'teams', id || '');
        } else {
          dest = path.join(process.cwd(), 'uploads', 'members', id || '');
        }
        
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const type = req.body.type;
        let filename: string;
        
        if (type === 'logo') {
          filename = 'logo.png';
        } else {
          filename = 'avatar.png';
        }
        
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(png|jpeg|jpg|gif|webp)$/)) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadImage(
    @UploadedFile() file: any,
    @Body('type') type: string,
    @Body('id') id: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!type || !['avatar', 'logo'].includes(type)) {
      throw new BadRequestException('Invalid type. Must be "avatar" or "logo"');
    }

    if (!id) {
      throw new BadRequestException('id is required');
    }

    this.logger.log(`File uploaded: ${file.originalname}, type: ${type}, id: ${id}`);

    if (type === 'logo') {
      return {
        url: `/uploads/teams/${id}/logo.png`,
        thumbnailUrl: `/uploads/teams/${id}/logo_thumbnail.png`,
      };
    } else {
      return {
        url: `/uploads/members/${id}/avatar.png`,
      };
    }
  }
}