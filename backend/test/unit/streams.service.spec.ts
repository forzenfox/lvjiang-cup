import { Test, TestingModule } from '@nestjs/testing';
import { StreamsService } from '../../src/modules/streams/streams.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { NotFoundException } from '@nestjs/common';

describe('StreamsService', () => {
  let service: StreamsService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockDatabaseService = {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamsService,
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

    service = module.get<StreamsService>(StreamsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('应该从缓存获取直播信息', async () => {
      const cachedStreamInfo = {
        title: 'Test Stream',
        url: 'http://example.com',
        isLive: true,
      };
      mockCacheService.get.mockReturnValue(cachedStreamInfo);

      const result = await service.findOne();

      expect(result).toEqual(cachedStreamInfo);
      expect(mockCacheService.get).toHaveBeenCalledWith('stream:info');
      expect(mockDatabaseService.get).not.toHaveBeenCalled();
    });

    it('应该从数据库获取直播信息（缓存未命中）', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        title: 'Test Stream',
        url: 'http://example.com',
        is_live: 1,
      });

      const result = await service.findOne();

      expect(result).toEqual({
        title: 'Test Stream',
        url: 'http://example.com',
        isLive: true,
      });
      expect(mockDatabaseService.get).toHaveBeenCalledWith(
        'SELECT * FROM stream_info WHERE id = 1',
      );
      expect(mockCacheService.set).toHaveBeenCalledWith('stream:info', expect.any(Object));
    });

    it('应该处理数据库返回空值的情况', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(null);

      const result = await service.findOne();

      expect(result).toEqual({
        title: '',
        url: '',
        isLive: false,
      });
    });

    it('应该正确转换 is_live 字段', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        title: 'Test',
        url: 'http://test.com',
        is_live: 0,
      });

      const result = await service.findOne();

      expect(result.isLive).toBe(false);
    });
  });

  describe('findAll', () => {
    it('应该从缓存获取所有直播', async () => {
      const cachedStreams = [
        {
          id: '1',
          title: 'Stream 1',
          url: 'http://1.com',
          isLive: true,
          createdAt: '',
          updatedAt: '',
        },
      ];
      mockCacheService.get.mockReturnValue(cachedStreams);

      const result = await service.findAll();

      expect(result).toEqual(cachedStreams);
      expect(mockCacheService.get).toHaveBeenCalledWith('streams:all');
      expect(mockDatabaseService.all).not.toHaveBeenCalled();
    });

    it('应该从数据库获取所有直播（缓存未命中）', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all.mockResolvedValue([
        {
          id: 1,
          title: 'Stream 1',
          url: 'http://1.com',
          is_live: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(mockDatabaseService.all).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith('streams:all', expect.any(Array));
    });
  });

  describe('findById', () => {
    it('应该返回指定ID的直播', async () => {
      mockDatabaseService.get.mockResolvedValue({
        id: 1,
        title: 'Test Stream',
        url: 'http://test.com',
        is_live: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const result = await service.findById('1');

      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Stream');
    });

    it('应该在直播不存在时抛出NotFoundException', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findActive', () => {
    it('应该返回活跃直播（ID为1）', async () => {
      mockDatabaseService.get.mockResolvedValue({
        id: 1,
        title: 'Active Stream',
        url: 'http://active.com',
        is_live: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const result = await service.findActive();

      expect(result.id).toBe('1');
      expect(result.title).toBe('Active Stream');
    });
  });

  describe('create', () => {
    it('应该创建新直播', async () => {
      mockDatabaseService.run.mockResolvedValue({ lastID: 2 });
      mockDatabaseService.get.mockResolvedValue({
        id: 2,
        title: 'New Stream',
        url: 'http://new.com',
        is_live: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      const result = await service.create({
        title: 'New Stream',
        url: 'http://new.com',
        isLive: true,
      });

      expect(result.id).toBe('2');
      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO stream_info'),
        expect.arrayContaining(['New Stream', 'http://new.com', 1]),
      );
      expect(mockCacheService.del).toHaveBeenCalledWith('streams:all');
    });
  });

  describe('update', () => {
    it('应该更新直播标题', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'Old Title',
        url: 'http://old.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'New Title',
        url: 'http://old.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      await service.update('1', { title: 'New Title' });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE stream_info SET'),
        expect.arrayContaining(['New Title']),
      );
      expect(mockCacheService.del).toHaveBeenCalledWith('stream:info');
    });

    it('应该更新直播URL', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'Test',
        url: 'http://old.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'Test',
        url: 'http://new.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      await service.update('1', { url: 'http://new.com' });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE stream_info SET'),
        expect.arrayContaining(['http://new.com']),
      );
    });

    it('应该更新直播状态', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'Test',
        url: 'http://test.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'Test',
        url: 'http://test.com',
        is_live: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      await service.update('1', { isLive: true });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE stream_info SET'),
        expect.arrayContaining([1]),
      );
    });

    it('应该同时更新多个字段', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'Old',
        url: 'http://old.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'New Title',
        url: 'http://new.com',
        is_live: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      await service.update('1', {
        title: 'New Title',
        url: 'http://new.com',
        isLive: true,
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('title = ?'),
        expect.any(Array),
      );
    });

    it('应该在更新后返回最新的直播信息', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 1,
        title: 'Old',
        url: 'http://old.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      const updatedStreamInfo = {
        id: 1,
        title: 'Updated Stream',
        url: 'http://updated.com',
        is_live: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValueOnce(updatedStreamInfo);

      const result = await service.update('1', { title: 'Updated Stream' });

      expect(result).toEqual({
        id: '1',
        title: 'Updated Stream',
        url: 'http://updated.com',
        isLive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });
    });

    it('应该在没有提供任何字段时不执行更新', async () => {
      mockDatabaseService.get.mockResolvedValue({
        id: 1,
        title: 'Test',
        url: 'http://test.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

      await service.update('1', {});

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('应该在直播不存在时抛出NotFoundException', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.update('999', { title: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('应该删除指定直播', async () => {
      mockDatabaseService.get.mockResolvedValue({
        id: 1,
        title: 'Test',
        url: 'http://test.com',
        is_live: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });
      mockDatabaseService.run.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockDatabaseService.run).toHaveBeenCalledWith('DELETE FROM stream_info WHERE id = ?', [
        '1',
      ]);
      expect(mockCacheService.del).toHaveBeenCalledWith('stream:info');
    });

    it('应该在直播不存在时抛出NotFoundException', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
