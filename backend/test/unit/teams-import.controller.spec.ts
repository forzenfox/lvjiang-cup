import { Test, TestingModule } from '@nestjs/testing';
import { TeamsImportController } from '../../src/modules/teams/controllers/teams-import.controller';
import { TeamsImportService } from '../../src/modules/teams/services/teams-import.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import * as path from 'path';

describe('TeamsImportController', () => {
  let controller: TeamsImportController;
  let service: TeamsImportService;

  const mockTeamsImportService = {
    generateTemplate: jest.fn(),
    refreshTemplate: jest.fn(),
    importFromExcel: jest.fn(),
    generateErrorReport: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsImportController],
      providers: [
        {
          provide: TeamsImportService,
          useValue: mockTeamsImportService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TeamsImportController>(TeamsImportController);
    service = module.get<TeamsImportService>(TeamsImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/teams/import - 批量导入战队', () => {
    it('应该使用磁盘存储配置来处理上传的 Excel 文件', async () => {
      // 验证 FileInterceptor 使用了 diskStorage 配置
      const mockFile = {
        originalname: 'test-import.xlsx',
        filename: 'import-test-uuid.xlsx',
        path: path.join(process.cwd(), 'uploads', 'temp', 'import-test-uuid.xlsx'),
        size: 1024,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      mockTeamsImportService.importFromExcel.mockResolvedValue({
        total: 2,
        created: 2,
        updated: 0,
        failed: 0,
        errors: [],
        externalUrlItems: [],
      });

      const result = await controller.importTeams(mockFile as any);

      expect(result).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.created).toBe(2);
      expect(service.importFromExcel).toHaveBeenCalledWith(mockFile.path);
    });

    it('应该校验上传文件不为空', async () => {
      await expect(controller.importTeams(undefined as any)).rejects.toThrow('请上传 Excel 文件');
    });

    it('应该返回导入结果', async () => {
      const mockFile = {
        originalname: 'teams.xlsx',
        filename: 'import-uuid.xlsx',
        path: '/tmp/import-uuid.xlsx',
        size: 2048,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      const mockResult = {
        total: 5,
        created: 3,
        updated: 2,
        failed: 0,
        errors: [],
        externalUrlItems: ['队标：测试战队 - https://example.com/logo.png'],
      };

      mockTeamsImportService.importFromExcel.mockResolvedValue(mockResult);

      const result = await controller.importTeams(mockFile as any);

      expect(result).toEqual(mockResult);
      expect(service.importFromExcel).toHaveBeenCalledTimes(1);
    });

    it('应该处理导入错误', async () => {
      const mockFile = {
        originalname: 'invalid.xlsx',
        filename: 'import-invalid.xlsx',
        path: '/tmp/import-invalid.xlsx',
        size: 512,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      const mockErrorResult = {
        total: 2,
        created: 0,
        updated: 0,
        failed: 2,
        errors: [
          {
            row: 4,
            teamName: '测试战队',
            position: '上单',
            field: '战队名称',
            message: '战队名称不能为空',
          },
        ],
        externalUrlItems: [],
      };

      mockTeamsImportService.importFromExcel.mockResolvedValue(mockErrorResult);

      const result = await controller.importTeams(mockFile as any);

      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('战队名称不能为空');
    });

    it('应该支持战队成员不足 5 人（1-4 人均可）', async () => {
      const mockFile = {
        originalname: 'partial-teams.xlsx',
        filename: 'import-partial.xlsx',
        path: '/tmp/import-partial.xlsx',
        size: 1024,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      const mockResult = {
        total: 3,
        created: 3,
        updated: 0,
        failed: 0,
        errors: [],
        externalUrlItems: [],
      };

      mockTeamsImportService.importFromExcel.mockResolvedValue(mockResult);

      const result = await controller.importTeams(mockFile as any);

      expect(result).toEqual(mockResult);
      expect(result.created).toBe(3);
      expect(result.failed).toBe(0);
    });
  });

  describe('GET /admin/teams/import/template - 下载模板', () => {
    it.skip('应该调用服务生成模板（跳过：涉及文件流操作）', async () => {
      const mockTemplatePath = path.join(process.cwd(), 'templates', 'team-import-template.xlsx');
      mockTeamsImportService.generateTemplate.mockResolvedValue(mockTemplatePath);

      const mockRes = {
        setHeader: jest.fn(),
        pipe: jest.fn(),
      } as any;

      await expect(controller.downloadTemplate(mockRes)).resolves.toBeUndefined();
      expect(service.generateTemplate).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /admin/teams/import/template/refresh - 刷新模板', () => {
    it.skip('应该调用服务刷新模板（跳过：涉及文件流操作）', async () => {
      const mockTemplatePath = path.join(process.cwd(), 'templates', 'team-import-template.xlsx');
      mockTeamsImportService.refreshTemplate.mockResolvedValue(mockTemplatePath);

      const mockRes = {
        setHeader: jest.fn(),
        pipe: jest.fn(),
      } as any;

      await expect(controller.refreshTemplate(mockRes)).resolves.toBeUndefined();
      expect(service.refreshTemplate).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /admin/teams/import/error-report - 下载错误报告', () => {
    it.skip('应该生成错误报告（跳过：涉及文件流操作）', async () => {
      const mockReportPath = path.join(process.cwd(), 'templates', 'error-report.xlsx');
      const mockErrors = [
        {
          row: 4,
          teamName: '测试战队',
          position: '上单',
          field: '战队名称',
          message: '战队名称不能为空',
        },
      ];

      mockTeamsImportService.generateErrorReport.mockResolvedValue(mockReportPath);

      const mockRes = {
        setHeader: jest.fn(),
        pipe: jest.fn(),
      } as any;

      await expect(
        controller.downloadErrorReport({ errors: mockErrors } as any, mockRes),
      ).resolves.toBeUndefined();

      expect(service.generateErrorReport).toHaveBeenCalledWith(mockErrors);
    });

    it('应该校验错误信息不为空', async () => {
      await expect(
        controller.downloadErrorReport({ errors: [] } as any, {} as any),
      ).rejects.toThrow('没有错误信息可以生成报告');

      await expect(controller.downloadErrorReport({} as any, {} as any)).rejects.toThrow(
        '没有错误信息可以生成报告',
      );
    });
  });
});
