import { StreamersService, StreamerType } from '../../src/modules/streamers/streamers.service';

describe.skip('StreamersService Integration', () => {
  let service: StreamersService;

  const mockDatabaseService = {
    all: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    run: jest.fn().mockResolvedValue({}),
    deleteFileHashByPath: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
    has: jest.fn(),
    getOrSet: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StreamersService(mockDatabaseService as any, mockCacheService as any);
  });

  describe('Cache Integration', () => {
    it('should use cache for findAll', async () => {
      mockCacheService.getOrSet.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockCacheService.getOrSet).toHaveBeenCalled();
    });

    it('should clear cache after create', async () => {
      const createDto = {
        nickname: 'Test',
        posterUrl: '/poster.jpg',
        bio: 'Bio',
        liveUrl: 'https://live.com',
        streamerType: StreamerType.INTERNAL,
      };

      await service.create(createDto);

      expect(mockCacheService.del).toHaveBeenCalledWith('streamers:all');
    });
  });

  describe('Data Operations', () => {
    it('should handle empty database results', async () => {
      mockCacheService.getOrSet.mockImplementation(async (key, fetchFn) => {
        return await fetchFn();
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
