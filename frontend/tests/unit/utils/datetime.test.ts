import { describe, it, expect } from 'vitest';
import {
  formatDateTime,
  formatShortDate,
  formatFullDateTime,
  toDateTimeLocal,
  fromDateTimeLocal,
} from '@/utils/datetime';

describe('datetime 工具函数', () => {
  describe('formatDateTime', () => {
    it('应该正确格式化日期时间', () => {
      const result = formatDateTime('2025-11-13T18:00:00Z');
      // 北京时间 UTC+8
      expect(result).toContain('11月');
      expect(result).toContain('日');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('应该处理空字符串', () => {
      expect(formatDateTime('')).toBe('');
    });

    it('应该处理无效日期字符串', () => {
      const invalidDate = 'invalid-date';
      const result = formatDateTime(invalidDate);
      // 无效日期会返回原字符串或 "Invalid Date"
      expect(result === invalidDate || result === 'Invalid Date').toBe(true);
    });

    it('应该处理 null 值', () => {
      expect(formatDateTime(null as unknown as string)).toBe('');
    });

    it('应该处理 undefined 值', () => {
      expect(formatDateTime(undefined as unknown as string)).toBe('');
    });

    it('应该正确格式化跨年日期', () => {
      const result = formatDateTime('2024-01-01T00:00:00Z');
      expect(result).toContain('1月');
      expect(result).toContain('日');
    });

    it('应该正确格式化月末日期', () => {
      const result = formatDateTime('2025-12-31T12:00:00Z');
      // 考虑时区转换，可能是 12月31日 或 1月1日
      expect(result).toMatch(/(12月|1月)/);
      expect(result).toContain('日');
    });
  });

  describe('formatShortDate', () => {
    it('应该正确格式化短日期', () => {
      const result = formatShortDate('2025-11-13T18:00:00Z');
      expect(result).toContain('11月');
      expect(result).toContain('日');
      expect(result).not.toMatch(/\d{2}:\d{2}/); // 不应该包含时间
    });

    it('应该处理空字符串', () => {
      expect(formatShortDate('')).toBe('');
    });

    it('应该处理无效日期字符串', () => {
      const invalidDate = 'invalid-date';
      const result = formatShortDate(invalidDate);
      expect(result === invalidDate || result === 'Invalid Date').toBe(true);
    });

    it('应该处理 null 值', () => {
      expect(formatShortDate(null as unknown as string)).toBe('');
    });

    it('应该处理 undefined 值', () => {
      expect(formatShortDate(undefined as unknown as string)).toBe('');
    });
  });

  describe('formatFullDateTime', () => {
    it('应该正确格式化完整日期时间', () => {
      const result = formatFullDateTime('2025-11-13T18:00:00Z');
      expect(result).toContain('2025');
      expect(result).toContain('年');
      expect(result).toContain('11月');
      expect(result).toContain('日');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('应该处理空字符串', () => {
      expect(formatFullDateTime('')).toBe('');
    });

    it('应该处理无效日期字符串', () => {
      const invalidDate = 'invalid-date';
      const result = formatFullDateTime(invalidDate);
      expect(result === invalidDate || result === 'Invalid Date').toBe(true);
    });

    it('应该处理 null 值', () => {
      expect(formatFullDateTime(null as unknown as string)).toBe('');
    });

    it('应该处理 undefined 值', () => {
      expect(formatFullDateTime(undefined as unknown as string)).toBe('');
    });
  });

  describe('toDateTimeLocal', () => {
    it('应该正确转换为 datetime-local 格式', () => {
      const result = toDateTimeLocal('2025-11-13T18:00:00Z');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('应该处理空字符串', () => {
      expect(toDateTimeLocal('')).toBe('');
    });

    it('应该处理无效日期字符串', () => {
      const invalidDate = 'invalid-date';
      const result = toDateTimeLocal(invalidDate);
      // 无效日期会返回原字符串或包含 NaN 的字符串
      expect(result === invalidDate || result.includes('NaN')).toBe(true);
    });

    it('应该处理 null 值', () => {
      expect(toDateTimeLocal(null as unknown as string)).toBe('');
    });

    it('应该处理 undefined 值', () => {
      expect(toDateTimeLocal(undefined as unknown as string)).toBe('');
    });

    it('应该正确处理跨年日期', () => {
      const result = toDateTimeLocal('2024-01-01T00:00:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('01-01');
    });

    it('应该正确处理月末日期', () => {
      const result = toDateTimeLocal('2025-12-31T12:00:00Z');
      // 考虑时区转换
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });

  describe('fromDateTimeLocal', () => {
    it('应该正确转换为 ISO 格式', () => {
      const result = fromDateTimeLocal('2025-11-13T18:00');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('应该处理空字符串', () => {
      expect(fromDateTimeLocal('')).toBe('');
    });

    it('应该处理无效日期字符串', () => {
      const invalidDate = 'invalid-date';
      expect(fromDateTimeLocal(invalidDate)).toBe(invalidDate);
    });

    it('应该处理 null 值', () => {
      expect(fromDateTimeLocal(null as unknown as string)).toBe('');
    });

    it('应该处理 undefined 值', () => {
      expect(fromDateTimeLocal(undefined as unknown as string)).toBe('');
    });

    it('应该正确处理跨年日期', () => {
      const result = fromDateTimeLocal('2024-01-01T00:00');
      // 转换为 ISO 格式，可能因时区不同而显示为 2023 或 2024
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
