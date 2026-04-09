import { UploadResult } from '../../src/modules/upload/upload.service';

const mockFs = {
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue([]),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
};

jest.mock('fs', () => mockFs);

jest.mock('../../src/database/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    all: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(undefined),
    run: jest.fn().mockResolvedValue({ changes: 0, lastID: 0 }),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from '../../src/modules/upload/upload.service';
import { DatabaseService } from '../../src/database/database.service';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: DatabaseService,
          useValue: {
            all: jest.fn().mockResolvedValue([]),
            get: jest.fn().mockResolvedValue(undefined),
            run: jest.fn().mockResolvedValue({ changes: 0, lastID: 0 }),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadTeamLogo - 上传战队图标', () => {
    it('应该正确上传战队图标并返回 URL', async () => {
      const filename = '550e8400-e29b-41d4-a716-446655440000.png';
      const fileBuffer = Buffer.from('test logo content');

      const result: UploadResult = await service.uploadTeamLogo(filename, fileBuffer);

      expect(result).toHaveProperty('url');
      expect(result.url).toBe(`/uploads/teams/${filename}`);
    });

    it('应该在目录不存在时创建目录', async () => {
      const filename = 'test-logo.png';
      const fileBuffer = Buffer.from('test logo content');

      mockFs.existsSync.mockReturnValue(false);

      await service.uploadTeamLogo(filename, fileBuffer);

      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('uploadMemberAvatar - 上传队员头像', () => {
    it('应该正确上传队员头像并返回 URL', async () => {
      const filename = 'member-avatar.png';
      const fileBuffer = Buffer.from('test avatar content');

      const result: UploadResult = await service.uploadMemberAvatar(filename, fileBuffer);

      expect(result).toHaveProperty('url');
      expect(result.url).toBe(`/uploads/members/${filename}`);
    });
  });

  describe('uploadImage - 通用图片上传', () => {
    it('logo 类型应该调用 uploadTeamLogo', async () => {
      const filename = 'team-logo.png';
      const fileBuffer = Buffer.from('test content');

      const result: UploadResult = await service.uploadImage('logo', filename, fileBuffer);

      expect(result.url).toContain('/uploads/teams/');
    });

    it('avatar 类型应该调用 uploadMemberAvatar', async () => {
      const filename = 'member-avatar.png';
      const fileBuffer = Buffer.from('test content');

      const result: UploadResult = await service.uploadImage('avatar', filename, fileBuffer);

      expect(result.url).toContain('/uploads/members/');
    });
  });

  describe('cleanupOrphanedFiles - 清理孤立文件', () => {
    it('应该扫描并识别孤立文件', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.promises.readdir.mockResolvedValue(['used-file.png', 'orphaned-file.png']);
      mockFs.promises.unlink.mockResolvedValue(undefined);

      const result = await service.cleanupOrphanedFiles();

      expect(result.scannedFiles).toBe(4);
    });
  });
});
