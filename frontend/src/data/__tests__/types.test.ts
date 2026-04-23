import { describe, it, expect } from 'vitest';
import type { SponsorConfig, StaffConfig, ThanksData } from '../types';
import thanksData from '../thanks-data.json';

describe('类型定义测试', () => {
  describe('SponsorConfig 接口', () => {
    it('应该包含必需的字段', () => {
      const sponsor: SponsorConfig = {
        id: 1,
        sponsorName: '测试赞助人',
        sponsorContent: '1K',
      };

      expect(sponsor.id).toBe(1);
      expect(sponsor.sponsorName).toBe('测试赞助人');
      expect(sponsor.sponsorContent).toBe('1K');
      expect(sponsor.specialAward).toBeUndefined();
    });

    it('应该支持 specialAward 可选字段', () => {
      const sponsor: SponsorConfig = {
        id: 2,
        sponsorName: '测试赞助人',
        sponsorContent: '2K',
        specialAward: '特殊奖项说明',
      };

      expect(sponsor.specialAward).toBe('特殊奖项说明');
    });
  });

  describe('StaffConfig 接口', () => {
    it('应该包含所有必需的字段', () => {
      const staff: StaffConfig = {
        id: 1,
        name: '张三',
        role: '赛事策划',
      };

      expect(staff.id).toBe(1);
      expect(staff.name).toBe('张三');
      expect(staff.role).toBe('赛事策划');
    });
  });

  describe('ThanksData 接口', () => {
    it('应该包含 sponsors 和 staff 数组', () => {
      const data: ThanksData = {
        sponsors: [],
        staff: [],
      };

      expect(Array.isArray(data.sponsors)).toBe(true);
      expect(Array.isArray(data.staff)).toBe(true);
    });

    it('应该能包含完整的赞助和工作人员数据', () => {
      const data: ThanksData = {
        sponsors: [
          { id: 1, sponsorName: '赞助人1', sponsorContent: '1K' },
          { id: 2, sponsorName: '赞助人2', sponsorContent: '2K', specialAward: '奖项' },
        ],
        staff: [
          { id: 1, name: '张三', role: '策划' },
          { id: 2, name: '李四', role: '技术' },
        ],
      };

      expect(data.sponsors).toHaveLength(2);
      expect(data.staff).toHaveLength(2);
    });
  });
});

describe('thanks-data.json 数据验证', () => {
  it('应该包含 sponsors 数组', () => {
    expect(Array.isArray(thanksData.sponsors)).toBe(true);
    expect(thanksData.sponsors.length).toBeGreaterThan(0);
  });

  it('应该包含 staff 数组', () => {
    expect(Array.isArray(thanksData.staff)).toBe(true);
  });

  it('每个赞助商应该有正确的字段类型', () => {
    thanksData.sponsors.forEach((sponsor) => {
      expect(typeof sponsor.id).toBe('number');
      expect(typeof sponsor.sponsorName).toBe('string');
      expect(typeof sponsor.sponsorContent).toBe('string');
      if (sponsor.specialAward !== undefined) {
        expect(typeof sponsor.specialAward).toBe('string');
      }
    });
  });

  it('每个工作人员应该有正确的字段类型', () => {
    thanksData.staff.forEach((staff) => {
      expect(typeof staff.id).toBe('number');
      expect(typeof staff.name).toBe('string');
      expect(typeof staff.role).toBe('string');
    });
  });

  it('赞助商 ID 应该是唯一的', () => {
    const ids = thanksData.sponsors.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('工作人员 ID 应该是唯一的', () => {
    const ids = thanksData.staff.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('应该有 20 条赞助数据', () => {
    expect(thanksData.sponsors).toHaveLength(20);
  });

  it('部分赞助商应该有 specialAward 字段', () => {
    const sponsorsWithAward = thanksData.sponsors.filter((s) => s.specialAward);
    expect(sponsorsWithAward.length).toBeGreaterThan(0);
  });
});
