import { Test, TestingModule } from '@nestjs/testing';
import { TeamsImportService } from '../../src/modules/teams/services/teams-import.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import * as fs from 'fs';
import * as path from 'path';

describe('TeamsImportService', () => {
  let service: TeamsImportService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockDatabaseService = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
  };

  const TEMPLATE_DIR = '/tmp/test-templates';
  const TEMPLATE_FILE = 'team-import-template.xlsx';

  beforeEach(async () => {
    if (!fs.existsSync(TEMPLATE_DIR)) {
      fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsImportService,
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

    service = module.get<TeamsImportService>(TeamsImportService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);

    (service as any).TEMPLATE_DIR = TEMPLATE_DIR;
    (service as any).TEMPLATE_FILE = TEMPLATE_FILE;

    jest.clearAllMocks();
  });

  afterEach(() => {
    const templatePath = path.join(TEMPLATE_DIR, TEMPLATE_FILE);
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
    }
  });

  describe('generateTemplate', () => {
    it('should generate a template file', async () => {
      const templatePath = await service.generateTemplate();
      expect(templatePath).toBeDefined();
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('should return cached template if exists', async () => {
      const templatePath1 = await service.generateTemplate();
      const templatePath2 = await service.generateTemplate();
      expect(templatePath1).toBe(templatePath2);
    });

    it('should create template with correct name', async () => {
      const templatePath = await service.generateTemplate();
      expect(templatePath).toContain(TEMPLATE_FILE);
    });
  });

  describe('refreshTemplate', () => {
    it('should delete old template and generate new one', async () => {
      const oldTemplatePath = await service.generateTemplate();
      expect(fs.existsSync(oldTemplatePath)).toBe(true);

      const newTemplatePath = await service.refreshTemplate();
      expect(fs.existsSync(newTemplatePath)).toBe(true);
    });
  });

  describe('importFromExcel validation', () => {
    it('should validate missing sheet name', async () => {
      const result = await service.importFromExcel('/nonexistent/file.xlsx');
      expect(result.total).toBe(0);
    });
  });

  describe('clearCache', () => {
    it('should clear all cache keys on import', async () => {
      mockDatabaseService.all.mockResolvedValue([]);
      mockDatabaseService.run.mockResolvedValue({});

      const templatePath = path.join(TEMPLATE_DIR, 'test.xlsx');
      const workbook = new (require('exceljs'))();
      workbook.addWorksheet('战队与队员信息导入');
      await workbook.xlsx.writeFile(templatePath);

      try {
        await service.importFromExcel(templatePath);
        expect(mockCacheService.del).toHaveBeenCalledWith('teams:all');
      } finally {
        if (fs.existsSync(templatePath)) {
          fs.unlinkSync(templatePath);
        }
      }
    });
  });
});
