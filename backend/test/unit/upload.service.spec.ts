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

const mockSharp = jest.fn().mockReturnValue({
  resize: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  png: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed')),
});

jest.mock('sharp', () => mockSharp);

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
  let mockDatabaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.promises.readdir.mockResolvedValue([]);
    mockSharp.mockReturnValue({
      resize: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      png: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed')),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: DatabaseService,
          useValue: {
            all: jest.fn().mockResolvedValue([]),
            get: jest.fn().mockResolvedValue(undefined),
            run: jest.fn().mockResolvedValue({ changes: 0, lastID: 0 }),
            findFileByHash: jest.fn().mockResolvedValue(undefined),
            recordFileHash: jest.fn().mockResolvedValue(undefined),
            deleteFileHash: jest.fn().mockResolvedValue(undefined),
            deleteFileHashByPath: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    mockDatabaseService = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadTeamLogo - 上传战队图标', () => {
    it('应该正确上传战队图标并返回 URL', async () => {
      const filename = '550e8400-e29b-41d4-a716-446655440000.png';
      const fileBuffer = Buffer.from('test logo content');

      const result = await service.uploadTeamLogo(filename, fileBuffer);

      expect(result).toHaveProperty('url');
      expect(result.url).toBe('/api/uploads/teams/550e8400-e29b-41d4-a716-446655440000.webp');
    });

    it('应该在目录不存在时创建目录', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await service.uploadTeamLogo('test-logo.png', Buffer.from('content'));

      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });

    it('应该使用 sharp 压缩图片', async () => {
      const filename = 'test-logo.png';
      const fileBuffer = Buffer.from('test content');

      await service.uploadTeamLogo(filename, fileBuffer);

      expect(mockSharp).toHaveBeenCalledWith(fileBuffer);
    });

    it('应该生成缩略图', async () => {
      const filename = 'test-logo.png';
      const fileBuffer = Buffer.from('test content');

      const result = await service.uploadTeamLogo(filename, fileBuffer);

      expect(result.thumbnailUrl).toBeDefined();
    });
  });

  describe('uploadMemberAvatar - 上传队员头像', () => {
    it('应该正确上传队员头像并返回 URL', async () => {
      const filename = 'member-avatar.png';
      const fileBuffer = Buffer.from('test avatar content');

      const result = await service.uploadMemberAvatar(filename, fileBuffer);

      expect(result).toHaveProperty('url');
      expect(result.url).toBe('/api/uploads/members/member-avatar.webp');
    });

    it('应该生成头像缩略图', async () => {
      const filename = 'avatar.png';
      const fileBuffer = Buffer.from('content');

      const result = await service.uploadMemberAvatar(filename, fileBuffer);

      expect(result.thumbnailUrl).toBeDefined();
    });
  });

  describe('uploadStreamerPoster - 上传主播海报', () => {
    it('应该正确上传海报并返回 URL', async () => {
      const filename = 'poster.png';
      const fileBuffer = Buffer.from('poster content');

      const result = await service.uploadStreamerPoster(filename, fileBuffer);

      expect(result).toHaveProperty('url');
      expect(result.url).toBe('/api/uploads/streamers/poster.webp');
    });

    it('海报不应该生成缩略图', async () => {
      const filename = 'poster.png';
      const fileBuffer = Buffer.from('poster content');

      const result = await service.uploadStreamerPoster(filename, fileBuffer);

      expect(result.thumbnailUrl).toBeUndefined();
    });
  });

  describe('uploadImage - 通用图片上传', () => {
    it('logo 类型应该调用 uploadTeamLogo', async () => {
      const result = await service.uploadImage('logo', 'team-logo.png', Buffer.from('content'));

      expect(result.url).toContain('/uploads/teams/');
    });

    it('avatar 类型应该调用 uploadMemberAvatar', async () => {
      const result = await service.uploadImage(
        'avatar',
        'member-avatar.png',
        Buffer.from('content'),
      );

      expect(result.url).toContain('/uploads/members/');
    });

    it('poster 类型应该调用 uploadStreamerPoster', async () => {
      const result = await service.uploadImage('poster', 'poster.png', Buffer.from('content'));

      expect(result.url).toContain('/uploads/streamers/');
    });
  });

  describe('去重逻辑', () => {
    it('应该检测重复文件并复用', async () => {
      mockDatabaseService.findFileByHash.mockResolvedValueOnce({
        hash: 'abc123',
        file_path: '/path/to/existing.webp',
        file_type: 'logo',
      });

      const result = await service.uploadTeamLogo('new-file.png', Buffer.from('content'));

      expect(result.reused).toBe(true);
      expect(result.url).toContain('/uploads/teams/');
      expect(mockFs.promises.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('cleanupOrphanedFiles - 清理孤立文件', () => {
    beforeEach(() => {
      mockFs.existsSync.mockImplementation((dirPath: string) => {
        return dirPath.includes('teams') || dirPath.includes('members');
      });
    });

    it('应该删除孤立文件并保留正在使用的文件', async () => {
      mockFs.promises.readdir
        .mockResolvedValueOnce(['used-logo.png', 'orphaned-logo.png'])
        .mockResolvedValueOnce([]);
      mockDatabaseService.all
        .mockResolvedValueOnce([{ logo_url: '/api/uploads/teams/used-logo.png' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.cleanupOrphanedFiles();

      expect(result.scannedFiles).toBe(2);
      expect(result.orphanedFiles).toBe(1);
      expect(result.deletedFiles).toContain('/api/uploads/teams/orphaned-logo.png');
      expect(result.deletedFiles).not.toContain('/api/uploads/teams/used-logo.png');
    });

    it('应该处理数据库查询错误', async () => {
      mockFs.promises.readdir.mockResolvedValue(['file.png']);
      mockDatabaseService.all.mockRejectedValue(new Error('Database error'));

      const result = await service.cleanupOrphanedFiles();

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Database error');
    });

    it('应该处理文件删除错误', async () => {
      mockFs.promises.readdir.mockResolvedValue(['locked-file.png']);
      mockDatabaseService.all.mockResolvedValue([]);
      mockFs.promises.unlink.mockRejectedValue(new Error('File is locked'));

      const result = await service.cleanupOrphanedFiles();

      expect(result.errors.length).toBe(2);
      expect(result.errors.some((e: string) => e.includes('locked-file.png'))).toBe(true);
      expect(result.errors.some((e: string) => e.includes('File is locked'))).toBe(true);
    });

    it('应该跳过不存在的目录', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await service.cleanupOrphanedFiles();

      expect(result.scannedFiles).toBe(0);
      expect(mockFs.promises.readdir).not.toHaveBeenCalled();
    });

    it('应该记录清理耗时', async () => {
      mockFs.promises.readdir.mockResolvedValue([]);
      mockDatabaseService.all.mockResolvedValue([]);

      const result = await service.cleanupOrphanedFiles();

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('错误场景测试', () => {
    it('应该处理 writeFile 失败', async () => {
      mockFs.promises.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(service.uploadTeamLogo('test.png', Buffer.from('content'))).rejects.toThrow(
        'Disk full',
      );
    });

    it('应该处理 mkdirSync 失败', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(service.uploadTeamLogo('test.png', Buffer.from('content'))).rejects.toThrow(
        'Permission denied',
      );
    });
  });
});
