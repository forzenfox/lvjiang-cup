import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue(':memory:'), // Use in-memory database for testing
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('数据库连接', () => {
    it('应该从配置中读取数据库路径', async () => {
      // 调用 onModuleInit 来触发配置读取
      await service.onModuleInit();
      expect(mockConfigService.get).toHaveBeenCalledWith('database.path');
    });
  });

  describe('数据库操作', () => {
    it('应该提供 get 方法', () => {
      expect(service.get).toBeDefined();
      expect(typeof service.get).toBe('function');
    });

    it('应该提供 all 方法', () => {
      expect(service.all).toBeDefined();
      expect(typeof service.all).toBe('function');
    });

    it('应该提供 run 方法', () => {
      expect(service.run).toBeDefined();
      expect(typeof service.run).toBe('function');
    });

    it('应该提供 getDatabase 方法', () => {
      expect(service.getDatabase).toBeDefined();
      expect(typeof service.getDatabase).toBe('function');
    });
  });

  describe('数据清理', () => {
    it('应该提供 clearAllData 方法', () => {
      expect(service.clearAllData).toBeDefined();
      expect(typeof service.clearAllData).toBe('function');
    });

    it('应该提供 resetMatchSlots 方法', () => {
      expect(service.resetMatchSlots).toBeDefined();
      expect(typeof service.resetMatchSlots).toBe('function');
    });
  });

  describe('生命周期', () => {
    it('应该有 onModuleInit 方法', () => {
      expect(service.onModuleInit).toBeDefined();
      expect(typeof service.onModuleInit).toBe('function');
    });

    it('应该有 onModuleDestroy 方法', () => {
      expect(service.onModuleDestroy).toBeDefined();
      expect(typeof service.onModuleDestroy).toBe('function');
    });
  });
});
