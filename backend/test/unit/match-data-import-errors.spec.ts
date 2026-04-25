import { describe, it, expect } from '@jest/globals';
import {
  NoValidSheetException,
  DuplicateGameNumberException,
  GameNumberExceedFormatException,
  GameNumberMismatchWarning,
  MatchNotFinishedException,
  InvalidScoreException,
} from '../../src/modules/match-data/errors/match-data-import.errors';

describe('match-data-import.errors', () => {
  describe('NoValidSheetException', () => {
    it('应该创建带有正确错误码和消息的异常', () => {
      const exception = new NoValidSheetException();

      expect(exception).toBeInstanceOf(NoValidSheetException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.getResponse()).toEqual({
        code: 40013,
        message: '未找到有效的Sheet，Sheet名称须为"第X局"格式',
      });
    });

    it('响应中不应包含 errors 和 data 字段', () => {
      const exception = new NoValidSheetException();
      const response = exception.getResponse() as Record<string, unknown>;

      expect(response).not.toHaveProperty('errors');
      expect(response).not.toHaveProperty('data');
    });
  });

  describe('DuplicateGameNumberException', () => {
    it('应该创建带有 errors 数组的异常', () => {
      const errors = ['第1局重复', '第3局重复'];
      const exception = new DuplicateGameNumberException(errors);

      expect(exception).toBeInstanceOf(DuplicateGameNumberException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.getResponse()).toEqual({
        code: 40012,
        message: '局数重复',
        errors: ['第1局重复', '第3局重复'],
      });
    });

    it('应该支持空 errors 数组', () => {
      const exception = new DuplicateGameNumberException([]);

      const response = exception.getResponse() as Record<string, unknown>;
      expect(response.code).toBe(40012);
      expect(response.errors).toEqual([]);
    });
  });

  describe('GameNumberExceedFormatException', () => {
    it('应该创建带有 errors 数组的异常', () => {
      const errors = ['第6局超出BO5限制', '第7局超出BO5限制'];
      const exception = new GameNumberExceedFormatException(errors);

      expect(exception).toBeInstanceOf(GameNumberExceedFormatException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.getResponse()).toEqual({
        code: 40011,
        message: '局数超出赛制限制',
        errors: ['第6局超出BO5限制', '第7局超出BO5限制'],
      });
    });

    it('应该支持单个错误信息', () => {
      const exception = new GameNumberExceedFormatException(['第4局超出BO3限制']);

      const response = exception.getResponse() as Record<string, unknown>;
      expect(response.code).toBe(40011);
      expect(response.errors).toEqual(['第4局超出BO3限制']);
    });
  });

  describe('GameNumberMismatchWarning', () => {
    it('应该创建带有 warnings 数组的告警，HTTP状态码为200', () => {
      const warnings = [
        {
          sheetName: '第1局',
          sheetGameNumber: 1,
          excelGameNumber: 2,
          resolvedGameNumber: 1,
          message: 'Sheet局数与Excel局数不一致',
        },
      ];
      const exception = new GameNumberMismatchWarning(warnings);

      expect(exception).toBeInstanceOf(GameNumberMismatchWarning);
      expect(exception.getStatus()).toBe(200);
      expect(exception.getResponse()).toEqual({
        code: 40010,
        message: '局数不一致，请确认是否继续导入',
        data: warnings,
      });
    });

    it('应该支持多个 warnings', () => {
      const warnings = [
        {
          sheetName: '第1局',
          sheetGameNumber: 1,
          excelGameNumber: 2,
          resolvedGameNumber: 1,
          message: 'Sheet局数与Excel局数不一致',
        },
        {
          sheetName: '第3局',
          sheetGameNumber: 3,
          excelGameNumber: 4,
          resolvedGameNumber: 3,
          message: 'Sheet局数与Excel局数不一致',
        },
      ];
      const exception = new GameNumberMismatchWarning(warnings);

      const response = exception.getResponse() as Record<string, unknown>;
      expect(response.code).toBe(40010);
      expect((response.data as unknown[]).length).toBe(2);
    });

    it('应该支持空 warnings 数组', () => {
      const exception = new GameNumberMismatchWarning([]);

      const response = exception.getResponse() as Record<string, unknown>;
      expect(response.code).toBe(40010);
      expect(response.data).toEqual([]);
    });

    it('warnings 数据应包含完整的字段结构', () => {
      const warning = {
        sheetName: '第2局',
        sheetGameNumber: 2,
        excelGameNumber: 3,
        resolvedGameNumber: 2,
        message: '局数不匹配',
      };
      const exception = new GameNumberMismatchWarning([warning]);

      const response = exception.getResponse() as { data: unknown[] };
      const data = response.data[0] as typeof warning;
      expect(data.sheetName).toBe('第2局');
      expect(data.sheetGameNumber).toBe(2);
      expect(data.excelGameNumber).toBe(3);
      expect(data.resolvedGameNumber).toBe(2);
      expect(data.message).toBe('局数不匹配');
    });
  });

  describe('MatchNotFinishedException', () => {
    it('应该创建带有正确错误码和消息的异常', () => {
      const exception = new MatchNotFinishedException();

      expect(exception).toBeInstanceOf(MatchNotFinishedException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.getResponse()).toEqual({
        code: 40020,
        message: '对战尚未结束，无法下载模板',
      });
    });

    it('响应中不应包含 errors 和 data 字段', () => {
      const exception = new MatchNotFinishedException();
      const response = exception.getResponse() as Record<string, unknown>;

      expect(response).not.toHaveProperty('errors');
      expect(response).not.toHaveProperty('data');
    });
  });

  describe('InvalidScoreException', () => {
    it('应该创建带有 errors 数组的异常', () => {
      const errors = ['红方比分不能为负数', '蓝方比分不能为负数'];
      const exception = new InvalidScoreException(errors);

      expect(exception).toBeInstanceOf(InvalidScoreException);
      expect(exception.getStatus()).toBe(400);
      expect(exception.getResponse()).toEqual({
        code: 40021,
        message: '对战比分无效',
        errors: ['红方比分不能为负数', '蓝方比分不能为负数'],
      });
    });

    it('应该支持单个错误信息', () => {
      const exception = new InvalidScoreException(['比分之和必须为奇数']);

      const response = exception.getResponse() as Record<string, unknown>;
      expect(response.code).toBe(40021);
      expect(response.errors).toEqual(['比分之和必须为奇数']);
    });
  });

  describe('所有异常类的继承关系', () => {
    it('所有异常类都应继承自 HttpException', () => {
      const { HttpException } = require('@nestjs/common');

      expect(new NoValidSheetException()).toBeInstanceOf(HttpException);
      expect(new DuplicateGameNumberException([])).toBeInstanceOf(HttpException);
      expect(new GameNumberExceedFormatException([])).toBeInstanceOf(HttpException);
      expect(new GameNumberMismatchWarning([])).toBeInstanceOf(HttpException);
      expect(new MatchNotFinishedException()).toBeInstanceOf(HttpException);
      expect(new InvalidScoreException([])).toBeInstanceOf(HttpException);
    });
  });

  describe('响应格式统一性', () => {
    it('所有异常响应都应包含 code 和 message 字段', () => {
      const exceptions = [
        new NoValidSheetException(),
        new DuplicateGameNumberException([]),
        new GameNumberExceedFormatException([]),
        new GameNumberMismatchWarning([]),
        new MatchNotFinishedException(),
        new InvalidScoreException([]),
      ];

      exceptions.forEach((exception) => {
        const response = exception.getResponse() as Record<string, unknown>;
        expect(response).toHaveProperty('code');
        expect(response).toHaveProperty('message');
        expect(typeof response.code).toBe('number');
        expect(typeof response.message).toBe('string');
      });
    });
  });
});
