import { Test, TestingModule } from '@nestjs/testing';
import { StreamersImportController } from '../../src/modules/streamers/controllers/streamers-import.controller';
import { StreamersImportService } from '../../src/modules/streamers/services/streamers-import.service';
import {
  ImportResultDto,
  ImportErrorDto,
} from '../../src/modules/streamers/dto/streamer-import.dto';
import { Response } from 'express';
import * as fs from 'fs';

describe('StreamersImportController', () => {
  let controller: StreamersImportController;
  let service: jest.Mocked<StreamersImportService>;

  beforeEach(async () => {
    service = {
      generateTemplate: jest.fn().mockResolvedValue('/templates/streamer-import-template.xlsx'),
      refreshTemplate: jest.fn().mockResolvedValue('/templates/streamer-import-template.xlsx'),
      importFromExcel: jest.fn().mockResolvedValue(new ImportResultDto(10, 10, 0, [], [])),
      generateErrorReport: jest.fn().mockResolvedValue(Buffer.from('test report')),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamersImportController],
      providers: [{ provide: StreamersImportService, useValue: service }],
    }).compile();

    controller = module.get<StreamersImportController>(StreamersImportController);
  });

  describe('downloadTemplate', () => {
    it('应返回正确的Content-Type和文件名', async () => {
      const res = {
        setHeader: jest.fn(),
        pipe: jest.fn(),
      } as unknown as Response;

      jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1024 } as fs.Stats);
      jest.spyOn(fs, 'createReadStream').mockReturnValue({
        pipe: jest.fn(),
      } as any);

      await controller.downloadTemplate(res);

      expect(service.generateTemplate).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('%E9%A9%B4%E9%85%B1%E6%9D%AF'),
      );
    });
  });

  describe('importStreamers', () => {
    it('应调用service.importFromExcel并返回结果', async () => {
      const mockFile = {
        path: '/uploads/test.xlsx',
        originalname: 'test.xlsx',
      } as Express.Multer.File;

      const result = await controller.importStreamers(mockFile);

      expect(service.importFromExcel).toHaveBeenCalledWith('/uploads/test.xlsx');
      expect(result).toEqual({
        success: true,
        data: new ImportResultDto(10, 10, 0, [], []),
      });
    });

    it('无文件时应抛出错误', async () => {
      await expect(controller.importStreamers(null as any)).rejects.toThrow('请上传 Excel 文件');
    });
  });

  describe('downloadErrorReport', () => {
    it('应生成错误报告并返回', async () => {
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      const errors = [new ImportErrorDto(3, '', 'nickname', '主播昵称不能为空')];

      await controller.downloadErrorReport({ errors }, res);

      expect(service.generateErrorReport).toHaveBeenCalledWith(errors);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain; charset=utf-8');
      expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('无错误时应抛出错误', async () => {
      const res = {} as Response;

      await expect(controller.downloadErrorReport({ errors: [] }, res)).rejects.toThrow(
        '没有错误信息可以生成报告',
      );
    });

    it('errors为null时应抛出错误', async () => {
      const res = {} as Response;

      await expect(controller.downloadErrorReport({ errors: null as any }, res)).rejects.toThrow(
        '没有错误信息可以生成报告',
      );
    });
  });
});
