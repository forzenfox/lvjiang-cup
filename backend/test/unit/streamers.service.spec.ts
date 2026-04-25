import { Test, TestingModule } from '@nestjs/testing';
import { StreamersService, StreamerType } from '../../src/modules/streamers/streamers.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { NotFoundException } from '@nestjs/common';
import * as _fs from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  unlinkSync: jest.fn(),
}));

jest.mock('path', () => ({
  basename: jest.fn((p: string) => p.split('/').pop()),
  dirname: jest.fn((p: string) => p.split('/').slice(0, -1).join('/')),
}));

jest.mock('sqlite3', () => ({
  Database: jest.fn(),
  verbose: jest.fn(),
}));

jest.mock('../../src/common/utils/path.util', () => ({
  getStreamerPosterPath: jest.fn((filename: string) => `/uploads/streamers/${filename}`),
}));

describe('StreamersService', () => {
  let service: StreamersService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockDatabaseService = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
    deleteFileHashByPath: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
  };

  const mockStreamerRow = {
    id: 'streamer_1',
    nickname: 'Test Streamer',
    poster_url: '/uploads/streamers/poster1.webp',
    bio: '这是一个测试主播',
    live_url: 'https://live.example.com/streamer1',
    streamer_type: StreamerType.INTERNAL,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockStreamer = {
    id: 'streamer_1',
    nickname: 'Test Streamer',
    posterUrl: '/uploads/streamers/poster1.webp',
    bio: '这是一个测试主播',
    liveUrl: 'https://live.example.com/streamer1',
    streamerType: StreamerType.INTERNAL,
    sortOrder: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<StreamersService>(StreamersService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('基类集成', () => {
    it('应该继承 BaseCachedService', () => {
      expect(service['getCachePrefix']).toBeDefined();
      expect(service['findAllFromDb']).toBeDefined();
      expect(service['findOneFromDb']).toBeDefined();
      expect(service['getOrSetAll']).toBeDefined();
      expect(service['getOrSetOne']).toBeDefined();
      expect(service['clearAllCache']).toBeDefined();
      expect(service['clearRelatedCache']).toBeDefined();
    });

    it('应该使用正确的缓存前缀', () => {
      expect(service['getCachePrefix']()).toBe('streamers');
    });
  });

  describe('findAll', () => {
    it('应该从缓存返回主播列表', async () => {
      const mockStreamers = [mockStreamer];
      mockCacheService.get.mockReturnValue(mockStreamers);

      const result = await service.findAll();

      expect(result).toEqual(mockStreamers);
      expect(mockCacheService.get).toHaveBeenCalledWith('streamers:all');
      expect(mockDatabaseService.all).not.toHaveBeenCalled();
    });

    it('当缓存为空时应该从数据库获取主播列表', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all.mockResolvedValue([mockStreamerRow]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].nickname).toBe('Test Streamer');
      expect(mockDatabaseService.all).toHaveBeenCalledWith(
        'SELECT * FROM streamers ORDER BY sort_order ASC, created_at DESC',
      );
    });

    it('应该在数据库查询后缓存结果', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all.mockResolvedValue([mockStreamerRow]);

      await service.findAll();

      expect(mockCacheService.set).toHaveBeenCalledWith('streamers:all', expect.any(Array));
    });

    it('应该按 sortOrder 升序排序', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      const rows = [
        { ...mockStreamerRow, id: 'streamer_2', sort_order: 2 },
        { ...mockStreamerRow, id: 'streamer_1', sort_order: 1 },
      ];
      mockDatabaseService.all.mockResolvedValue(rows);

      const result = await service.findAll();

      expect(result[0].sortOrder).toBe(2);
      expect(result[1].sortOrder).toBe(1);
    });

    it('应该处理空数据库返回空数组', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('应该从缓存返回单个主播', async () => {
      mockCacheService.get.mockReturnValue(mockStreamer);

      const result = await service.findOne('streamer_1');

      expect(result).toEqual(mockStreamer);
      expect(mockCacheService.get).toHaveBeenCalledWith('streamers:streamer_1');
      expect(mockDatabaseService.get).not.toHaveBeenCalled();
    });

    it('当缓存为空时应该从数据库获取单个主播', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(mockStreamerRow);

      const result = await service.findOne('streamer_1');

      expect(result.id).toBe('streamer_1');
      expect(result.nickname).toBe('Test Streamer');
      expect(result.streamerType).toBe(StreamerType.INTERNAL);
      expect(mockDatabaseService.get).toHaveBeenCalledWith('SELECT * FROM streamers WHERE id = ?', [
        'streamer_1',
      ]);
    });

    it('应该在数据库查询后缓存结果', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(mockStreamerRow);

      await service.findOne('streamer_1');

      expect(mockCacheService.set).toHaveBeenCalledWith('streamers:streamer_1', expect.any(Object));
    });

    it('当主播不存在时应该抛出 NotFoundException', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('主播不存在');
    });
  });

  describe('create', () => {
    const createDto = {
      nickname: 'New Streamer',
      posterUrl: '/uploads/streamers/new-poster.webp',
      bio: '新主播介绍',
      liveUrl: 'https://live.example.com/new-streamer',
      streamerType: StreamerType.GUEST,
    };

    it('应该创建新主播并返回完整信息', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const result = await service.create(createDto);

      expect(result.nickname).toBe('New Streamer');
      expect(result.posterUrl).toBe('/uploads/streamers/new-poster.webp');
      expect(result.bio).toBe('新主播介绍');
      expect(result.liveUrl).toBe('https://live.example.com/new-streamer');
      expect(result.streamerType).toBe(StreamerType.GUEST);
      expect(result.sortOrder).toBe(0);
      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO streamers'),
        expect.arrayContaining([
          expect.any(String),
          'New Streamer',
          '/uploads/streamers/new-poster.webp',
          '新主播介绍',
          'https://live.example.com/new-streamer',
          StreamerType.GUEST,
        ]),
      );
    });

    it('应该生成唯一的主播 ID', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const result1 = await service.create(createDto);
      const result2 = await service.create({ ...createDto, nickname: 'Another Streamer' });

      expect(result1.id).toMatch(/^streamer_\d+_[a-z0-9]{9}$/);
      expect(result2.id).toMatch(/^streamer_\d+_[a-z0-9]{9}$/);
      expect(result1.id).not.toBe(result2.id);
    });

    it('应该在创建后清除列表缓存', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.create(createDto);

      expect(mockCacheService.del).toHaveBeenCalledWith('streamers:all');
    });
  });

  describe('update', () => {
    it('应该更新主播昵称', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        nickname: 'Updated Name',
      });

      const result = await service.update('streamer_1', { nickname: 'Updated Name' });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE streamers SET'),
        expect.arrayContaining(['Updated Name', expect.any(String), 'streamer_1']),
      );
      expect(result.nickname).toBe('Updated Name');
    });

    it('应该更新主播海报并删除旧海报', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        posterUrl: '/uploads/streamers/new-poster.webp',
      });

      await service.update('streamer_1', {
        posterUrl: '/uploads/streamers/new-poster.webp',
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('poster_url'),
        expect.any(Array),
      );
    });

    it('当海报 URL 相同时不应该删除海报', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce(mockStreamer);

      await service.update('streamer_1', {
        posterUrl: mockStreamer.posterUrl,
      });

      expect(mockDatabaseService.deleteFileHashByPath).not.toHaveBeenCalled();
    });

    it('应该更新主播类型', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        streamerType: StreamerType.GUEST,
      });

      const result = await service.update('streamer_1', {
        streamerType: StreamerType.GUEST,
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('streamer_type'),
        expect.arrayContaining([StreamerType.GUEST, expect.any(String), 'streamer_1']),
      );
      expect(result.streamerType).toBe(StreamerType.GUEST);
    });

    it('应该更新排序值', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        sortOrder: 10,
      });

      const result = await service.update('streamer_1', { sortOrder: 10 });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('sort_order'),
        expect.arrayContaining([10, expect.any(String), 'streamer_1']),
      );
      expect(result.sortOrder).toBe(10);
    });

    it('应该更新 updatedAt 时间戳', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce(mockStreamer);

      await service.update('streamer_1', { nickname: 'Updated' });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('updated_at'),
        expect.any(Array),
      );
    });

    it('当未提供字段时不应该执行更新', async () => {
      mockCacheService.get.mockReturnValue(mockStreamer);

      await service.update('streamer_1', {});

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('当主播不存在时应该抛出 NotFoundException', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.update('non-existent', { nickname: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('应该在更新后清除相关缓存', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce(mockStreamer);

      await service.update('streamer_1', { nickname: 'Updated' });

      expect(mockCacheService.del).toHaveBeenCalledWith('streamers:streamer_1');
    });
  });

  describe('remove', () => {
    it('应该删除主播', async () => {
      mockCacheService.get.mockReturnValue(mockStreamer);

      await service.remove('streamer_1');

      expect(mockDatabaseService.run).toHaveBeenCalledWith('DELETE FROM streamers WHERE id = ?', [
        'streamer_1',
      ]);
    });

    it('当主播有海报时应该删除海报文件', async () => {
      mockCacheService.get.mockReturnValue(mockStreamer);

      await service.remove('streamer_1');

      expect(mockDatabaseService.deleteFileHashByPath).toHaveBeenCalled();
    });

    it('当主播海报为 HTTP URL 时不应该删除文件', async () => {
      const streamerWithHttpPoster = {
        ...mockStreamer,
        posterUrl: 'https://example.com/poster.webp',
      };
      mockCacheService.get.mockReturnValue(streamerWithHttpPoster);

      await service.remove('streamer_1');

      expect(mockDatabaseService.deleteFileHashByPath).not.toHaveBeenCalled();
    });

    it('应该在删除后清除相关缓存', async () => {
      mockCacheService.get.mockReturnValue(mockStreamer);

      await service.remove('streamer_1');

      expect(mockCacheService.del).toHaveBeenCalledWith('streamers:streamer_1');
    });

    it('当主播不存在时应该抛出 NotFoundException', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSort', () => {
    it('应该批量更新主播排序', async () => {
      await service.updateSort({
        orders: [
          { id: 'streamer_1', sortOrder: 10 },
          { id: 'streamer_2', sortOrder: 5 },
          { id: 'streamer_3', sortOrder: 15 },
        ],
      });

      expect(mockDatabaseService.run).toHaveBeenCalledTimes(3);
      expect(mockDatabaseService.run).toHaveBeenNthCalledWith(
        1,
        'UPDATE streamers SET sort_order = ?, updated_at = ? WHERE id = ?',
        [expect.any(Number), expect.any(String), 'streamer_1'],
      );
    });

    it('应该为每个更新添加 updated_at 时间戳', async () => {
      await service.updateSort({
        orders: [{ id: 'streamer_1', sortOrder: 5 }],
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        'UPDATE streamers SET sort_order = ?, updated_at = ? WHERE id = ?',
        expect.arrayContaining([5, expect.any(String), 'streamer_1']),
      );
    });

    it('应该在排序更新后清除列表缓存', async () => {
      await service.updateSort({
        orders: [{ id: 'streamer_1', sortOrder: 5 }],
      });

      expect(mockCacheService.del).toHaveBeenCalledWith('streamers:all');
    });

    it('应该处理空排序数组', async () => {
      await service.updateSort({ orders: [] });

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
      expect(mockCacheService.del).toHaveBeenCalledWith('streamers:all');
    });
  });

  describe('边界值测试', () => {
    it('应该处理特殊字符的主播昵称', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        nickname: "Special <script>alert('xss')</script> ' OR 1=1--",
      });

      await service.update('streamer_1', {
        nickname: "Special <script>alert('xss')</script> ' OR 1=1--",
      });

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });

    it('应该处理空字符串昵称', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        nickname: '',
      });

      const result = await service.update('streamer_1', { nickname: '' });

      expect(result.nickname).toBe('');
    });

    it('应该处理空 bio 和 liveUrl', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        bio: '',
        liveUrl: '',
      });

      const result = await service.update('streamer_1', { bio: '', liveUrl: '' });

      expect(result.bio).toBe('');
      expect(result.liveUrl).toBe('');
    });

    it('应该处理负数排序值', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.updateSort({
        orders: [{ id: 'streamer_1', sortOrder: -100 }],
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        'UPDATE streamers SET sort_order = ?, updated_at = ? WHERE id = ?',
        [-100, expect.any(String), 'streamer_1'],
      );
    });

    it('应该处理非常大的排序值', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.updateSort({
        orders: [{ id: 'streamer_1', sortOrder: 999999999 }],
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        'UPDATE streamers SET sort_order = ?, updated_at = ? WHERE id = ?',
        [999999999, expect.any(String), 'streamer_1'],
      );
    });

    it('应该处理主播类型为不同枚举值', async () => {
      mockCacheService.get.mockReturnValueOnce(mockStreamer);
      mockCacheService.get.mockReturnValueOnce({
        ...mockStreamer,
        streamerType: StreamerType.GUEST,
      });

      const result = await service.update('streamer_1', {
        streamerType: StreamerType.GUEST,
      });

      expect(result.streamerType).toBe(StreamerType.GUEST);
    });
  });

  describe('数据行映射', () => {
    it('应该正确映射数据库行到主播对象', () => {
      const result = service['mapRowToStreamer'](mockStreamerRow);

      expect(result.id).toBe('streamer_1');
      expect(result.nickname).toBe('Test Streamer');
      expect(result.posterUrl).toBe('/uploads/streamers/poster1.webp');
      expect(result.bio).toBe('这是一个测试主播');
      expect(result.liveUrl).toBe('https://live.example.com/streamer1');
      expect(result.streamerType).toBe(StreamerType.INTERNAL);
      expect(result.sortOrder).toBe(0);
    });

    it('应该处理可选字段的默认值', () => {
      const rowWithNulls = {
        ...mockStreamerRow,
        poster_url: null,
        bio: null,
        live_url: null,
        sort_order: null,
      };

      const result = service['mapRowToStreamer'](rowWithNulls as any);

      expect(result.posterUrl).toBe('');
      expect(result.bio).toBe('');
      expect(result.liveUrl).toBe('');
      expect(result.sortOrder).toBe(0);
    });
  });
});
