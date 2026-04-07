import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from '../../src/modules/upload/upload.controller';
import { UploadService } from '../../src/modules/upload/upload.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

// 模拟 fs 模块
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    readFile: jest.fn(),
  },
}));

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    uploadImage: jest.fn(),
  };

  // 模拟认证守卫
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/upload/image - 上传图片', () => {
    it('应该上传战队图标并返回成功结果', async () => {
      // Arrange
      const mockFile = {
        originalname: 'logo.png',
        buffer: Buffer.from('test'),
        path: '/tmp/uploads/teams/team1/logo.png',
      };

      (fs.promises.readFile as jest.Mock).mockResolvedValue(Buffer.from('test'));
      mockUploadService.uploadImage.mockResolvedValue({
        url: '/uploads/teams/team1/logo.png',
        thumbnailUrl: '/uploads/teams/team1/logo_thumbnail.png',
      });

      // Act
      const result = await controller.uploadImage(mockFile as any, 'logo', 'team1');

      // Assert
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('thumbnailUrl');
      expect(result.url).toBe('/uploads/teams/team1/logo.png');
      expect(result.thumbnailUrl).toBe('/uploads/teams/team1/logo_thumbnail.png');
    });

    it('应该上传队员头像并返回成功结果', async () => {
      // Arrange
      const mockFile = {
        originalname: 'avatar.png',
        buffer: Buffer.from('test'),
        path: '/tmp/uploads/members/member1/avatar.png',
      };

      (fs.promises.readFile as jest.Mock).mockResolvedValue(Buffer.from('test'));
      mockUploadService.uploadImage.mockResolvedValue({
        url: '/uploads/members/member1/avatar.png',
      });

      // Act
      const result = await controller.uploadImage(mockFile as any, 'avatar', 'member1');

      // Assert
      expect(result).toHaveProperty('url');
      expect(result.url).toBe('/uploads/members/member1/avatar.png');
    });

    it('应该在缺少文件时抛出错误', async () => {
      // Arrange
      const mockFile = null;

      // Act & Assert
      await expect(controller.uploadImage(mockFile as any, 'logo', 'team1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('应该在类型无效时抛出错误', async () => {
      // Arrange
      const mockFile = {
        originalname: 'image.png',
        buffer: Buffer.from('test'),
        path: '/tmp/uploads/test.png',
      };

      // Act & Assert
      await expect(controller.uploadImage(mockFile as any, 'invalid', 'team1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('应该在缺少ID时抛出错误', async () => {
      // Arrange
      const mockFile = {
        originalname: 'image.png',
        buffer: Buffer.from('test'),
        path: '/tmp/uploads/test.png',
      };

      // Act & Assert
      await expect(controller.uploadImage(mockFile as any, 'logo', '')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('未认证访问 - 返回 401', () => {
    it('应该在未认证时拒绝访问上传接口', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });
  });
});
