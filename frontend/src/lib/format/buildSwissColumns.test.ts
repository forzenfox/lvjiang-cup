import { describe, it, expect } from 'vitest';
import { buildSwissColumns } from './buildSwissColumns';
import { BUILTIN_DEFAULT_FORMAT } from './defaultFormat';
import type { SwissRecordConfig, SwissStageConfig } from './types';

/** 生成期望的 slotIds：r{轮}-{战绩}-{序号}（序号从 1 起） */
const expectedSlotIds = (round: number, record: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `r${round}-${record}-${i + 1}`);

/** 构造期望的比赛记录组 */
const matchesRecord = (round: number, record: string, count: number): SwissRecordConfig => ({
  record,
  label: record,
  matchCount: count,
  type: 'matches',
  slotIds: expectedSlotIds(round, record, count),
});

/** 构造期望的晋级/淘汰记录组（无比赛、无槽位） */
const outcomeRecord = (record: string, type: 'promotion' | 'elimination'): SwissRecordConfig => ({
  record,
  label: record,
  matchCount: 0,
  type,
  slotIds: [],
});

const defaultSwissStage = BUILTIN_DEFAULT_FORMAT.stages[0] as SwissStageConfig;

describe('buildSwissColumns', () => {
  describe('默认配置：16队 3胜3败（对齐现状 6 列结构）', () => {
    const columns = buildSwissColumns(defaultSwissStage);

    it('生成 6 列', () => {
      expect(columns).toHaveLength(6);
      expect(columns.map(c => c.name)).toEqual([
        '第一轮',
        '第二轮',
        '第三轮',
        '第四轮',
        '第五轮',
        '最终结果',
      ]);
    });

    it('列1：第一轮，仅 0-0 组 8 场', () => {
      expect(columns[0]).toEqual({
        id: 1,
        name: '第一轮',
        records: [matchesRecord(1, '0-0', 8)],
        hasPromotionList: false,
        hasEliminationList: false,
      });
    });

    it('列2：第二轮，1-0 与 0-1 各 4 场', () => {
      expect(columns[1]).toEqual({
        id: 2,
        name: '第二轮',
        records: [matchesRecord(2, '1-0', 4), matchesRecord(2, '0-1', 4)],
        hasPromotionList: false,
        hasEliminationList: false,
      });
    });

    it('列3：第三轮，2-0×2 / 1-1×4 / 0-2×2', () => {
      expect(columns[2]).toEqual({
        id: 3,
        name: '第三轮',
        records: [
          matchesRecord(3, '2-0', 2),
          matchesRecord(3, '1-1', 4),
          matchesRecord(3, '0-2', 2),
        ],
        hasPromotionList: false,
        hasEliminationList: false,
      });
    });

    it('列4：第四轮，3-0 晋级 + 2-1×3 / 1-2×3 + 0-3 淘汰', () => {
      expect(columns[3]).toEqual({
        id: 4,
        name: '第四轮',
        records: [
          outcomeRecord('3-0', 'promotion'),
          matchesRecord(4, '2-1', 3),
          matchesRecord(4, '1-2', 3),
          outcomeRecord('0-3', 'elimination'),
        ],
        hasPromotionList: true,
        hasEliminationList: true,
      });
    });

    it('列5：第五轮，3-1 晋级 + 2-2 组 3 场（修正现状漏配为 2 场的缺陷）+ 1-3 淘汰', () => {
      expect(columns[4]).toEqual({
        id: 5,
        name: '第五轮',
        records: [
          outcomeRecord('3-1', 'promotion'),
          matchesRecord(5, '2-2', 3),
          outcomeRecord('1-3', 'elimination'),
        ],
        hasPromotionList: true,
        hasEliminationList: true,
      });
    });

    it('列6：最终结果，3-2 晋级 + 2-3 淘汰', () => {
      expect(columns[5]).toEqual({
        id: 6,
        name: '最终结果',
        records: [outcomeRecord('3-2', 'promotion'), outcomeRecord('2-3', 'elimination')],
        hasPromotionList: true,
        hasEliminationList: true,
      });
    });

    it('全部 slotIds 唯一且总数为 33（与后端现状瑞士轮总场次一致）', () => {
      const all = columns.flatMap(c => c.records.flatMap(r => r.slotIds));
      expect(new Set(all).size).toBe(all.length);
      expect(all.length).toBe(33);
    });
  });

  describe('8队 2胜2败（PRD 附录 6.3）', () => {
    const stage: SwissStageConfig = {
      type: 'swiss',
      name: '瑞士轮',
      teamCount: 8,
      winThreshold: 2,
      lossThreshold: 2,
      boRule: 'auto',
      advanceToStage: 1,
    };
    const columns = buildSwissColumns(stage);

    it('生成 4 列', () => {
      expect(columns).toHaveLength(4);
      expect(columns.map(c => c.name)).toEqual(['第一轮', '第二轮', '第三轮', '最终结果']);
    });

    it('列1：第一轮，0-0 组 4 场', () => {
      expect(columns[0]).toEqual({
        id: 1,
        name: '第一轮',
        records: [matchesRecord(1, '0-0', 4)],
        hasPromotionList: false,
        hasEliminationList: false,
      });
    });

    it('列2：第二轮，1-0 与 0-1 各 2 场', () => {
      expect(columns[1]).toEqual({
        id: 2,
        name: '第二轮',
        records: [matchesRecord(2, '1-0', 2), matchesRecord(2, '0-1', 2)],
        hasPromotionList: false,
        hasEliminationList: false,
      });
    });

    it('列3：第三轮，2-0 晋级 + 1-1×2 + 0-2 淘汰', () => {
      expect(columns[2]).toEqual({
        id: 3,
        name: '第三轮',
        records: [
          outcomeRecord('2-0', 'promotion'),
          matchesRecord(3, '1-1', 2),
          outcomeRecord('0-2', 'elimination'),
        ],
        hasPromotionList: true,
        hasEliminationList: true,
      });
    });

    it('列4：最终结果，2-1 晋级 + 1-2 淘汰', () => {
      expect(columns[3]).toEqual({
        id: 4,
        name: '最终结果',
        records: [outcomeRecord('2-1', 'promotion'), outcomeRecord('1-2', 'elimination')],
        hasPromotionList: true,
        hasEliminationList: true,
      });
    });

    it('全部 slotIds 唯一且总数为 10（PRD：瑞士轮合计 10 场）', () => {
      const all = columns.flatMap(c => c.records.flatMap(r => r.slotIds));
      expect(new Set(all).size).toBe(all.length);
      expect(all.length).toBe(10);
    });
  });
});
