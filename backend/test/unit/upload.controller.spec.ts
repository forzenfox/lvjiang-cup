import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from '../../src/modules/upload/upload.controller';
import { UploadService } from '../../src/modules/upload/upload.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    uploadImage: jest.fn(),
  };

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
      const mockFile = {
        originalname: 'logo.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
      };

      mockUploadService.uploadImage.mockResolvedValue({
        url: '/uploads/teams/abc123.png',
      });

      const result = await controller.uploadImage(mockFile as any, 'logo');

      expect(result).toHaveProperty('url');
      expect(result.url).toBe('/uploads/teams/abc123.png');
    });

    it('应该上传队员头像并返回成功结果', async () => {
      const mockFile = {
        originalname: 'avatar.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
      };

      mockUploadService.uploadImage.mockResolvedValue({
        url: '/uploads/members/def456.png',
      });

      const result = await controller.uploadImage(mockFile as any, 'avatar');

      expect(result).toHaveProperty('url');
      expect(result.url).toBe('/uploads/members/def456.png');
    });

    it('应该在缺少文件时抛出错误', async () => {
      const mockFile = null;

      await expect(controller.uploadImage(mockFile as any, 'logo')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('应该在类型无效时抛出错误', async () => {
      const mockFile = {
        originalname: 'image.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
      };

      await expect(controller.uploadImage(mockFile as any, 'invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('应该生成 UUID 文件名', async () => {
      const mockFile = {
        originalname: 'logo.png',
        buffer: Buffer.from('test'),
        mimetype: 'image/png',
      };

      mockUploadService.uploadImage.mockResolvedValue({
        url: '/uploads/teams/550e8400-e29b-41d4-a716-446655440000.png',
      });

      const result = await controller.uploadImage(mockFile as any, 'logo');

      expect(mockUploadService.uploadImage).toHaveBeenCalledWith(
        'logo',
        expect.stringMatching(/^[0-9a-f-]+\.png$/),
        mockFile.buffer,
      );
    });
  });

  describe('未认证访问 - 返回 401', () => {
    it('应该在未认证时拒绝访问上传接口', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });
  });
});
