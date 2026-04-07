import { Test, TestingModule } from '@nestjs/testing';
import { UploadService, UploadResult } from '../../src/modules/upload/upload.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

// 模拟 fs 模块
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
  },
}));

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadTeamLogo - 上传战队图标', () => {
    it('应该正确上传战队图标并返回 URL', async () => {
      // Arrange
      const teamId = 'team1';
      const fileBuffer = Buffer.from('test logo content');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result: UploadResult = await service.uploadTeamLogo(teamId, fileBuffer);

      // Assert
      expect(result).toHaveProperty('url');
      expect(result.url).toContain('/uploads/teams/team1/logo.png');
    });

    it('应该同时保存缩略图', async () => {
      // Arrange
      const teamId = 'team1';
      const fileBuffer = Buffer.from('test logo content');
      const thumbnailBuffer = Buffer.from('test thumbnail content');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result: UploadResult = await service.uploadTeamLogo(teamId, fileBuffer, thumbnailBuffer);

      // Assert
      expect(result).toHaveProperty('thumbnailUrl');
      expect(result.thumbnailUrl).toContain('/uploads/teams/team1/logo_thumbnail.png');
      expect(fs.promises.writeFile).toHaveBeenCalledTimes(2);
    });

    it('应该在目录不存在时创建目录', async () => {
      // Arrange
      const teamId = 'team1';
      const fileBuffer = Buffer.from('test logo content');

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // Act
      await service.uploadTeamLogo(teamId, fileBuffer);

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('uploadMemberAvatar - 上传队员头像', () => {
    it('应该正确上传队员头像并返回 URL', async () => {
      // Arrange
      const memberId = 'member1';
      const fileBuffer = Buffer.from('test avatar content');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result: UploadResult = await service.uploadMemberAvatar(memberId, fileBuffer);

      // Assert
      expect(result).toHaveProperty('url');
      expect(result.url).toContain('/uploads/members/member1/avatar.png');
    });

    it('不应该包含 thumbnailUrl', async () => {
      // Arrange
      const memberId = 'member1';
      const fileBuffer = Buffer.from('test avatar content');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result: UploadResult = await service.uploadMemberAvatar(memberId, fileBuffer);

      // Assert
      expect(result).not.toHaveProperty('thumbnailUrl');
    });
  });

  describe('uploadImage - 通用图片上传', () => {
    it('logo 类型应该调用 uploadTeamLogo', async () => {
      // Arrange
      const id = 'team1';
      const fileBuffer = Buffer.from('test content');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result: UploadResult = await service.uploadImage('logo', id, fileBuffer);

      // Assert
      expect(result.url).toContain('/uploads/teams/team1/logo.png');
    });

    it('avatar 类型应该调用 uploadMemberAvatar', async () => {
      // Arrange
      const id = 'member1';
      const fileBuffer = Buffer.from('test content');

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result: UploadResult = await service.uploadImage('avatar', id, fileBuffer);

      // Assert
      expect(result.url).toContain('/uploads/members/member1/avatar.png');
    });

    it('无效类型应该抛出错误', async () => {
      // Arrange
      const id = 'someId';
      const fileBuffer = Buffer.from('test content');

      // Act & Assert
      await expect(service.uploadImage('invalid' as any, id, fileBuffer)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
