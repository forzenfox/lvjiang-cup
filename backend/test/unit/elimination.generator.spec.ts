import { generateEliminationSlots } from '../../src/modules/formats/generators/elimination.generator';
import { EliminationStageConfig } from '../../src/modules/formats/format.types';

/** 构造淘汰赛赛段配置的辅助函数 */
function makeElimStage(overrides: Partial<EliminationStageConfig> = {}): EliminationStageConfig {
  return {
    type: 'elimination',
    name: '淘汰赛',
    teamCount: 8,
    advanceToStage: null,
    roundNames: ['四分之一决赛', '半决赛', '决赛'],
    boFormat: 'BO5',
    ...overrides,
  };
}

describe('EliminationGenerator - generateEliminationSlots', () => {
  describe('8队（3级）', () => {
    const slots = generateEliminationSlots(makeElimStage());

    it('应生成 7 场比赛', () => {
      expect(slots).toHaveLength(7);
    });

    it('级别分布：quarterfinals 4 场 / semifinals 2 场 / finals 1 场', () => {
      expect(slots.filter((s) => s.eliminationBracket === 'quarterfinals')).toHaveLength(4);
      expect(slots.filter((s) => s.eliminationBracket === 'semifinals')).toHaveLength(2);
      expect(slots.filter((s) => s.eliminationBracket === 'finals')).toHaveLength(1);
    });

    it('eliminationGameNumber 全程连续 1..7（按级别顺序）', () => {
      expect(slots.map((s) => s.eliminationGameNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('各级 round 名称取自 roundNames 配置', () => {
      expect(slots.slice(0, 4).every((s) => s.round === '四分之一决赛')).toBe(true);
      expect(slots.slice(4, 6).every((s) => s.round === '半决赛')).toBe(true);
      expect(slots[6].round).toBe('决赛');
    });

    it('boFormat 取配置值 BO5', () => {
      expect(slots.every((s) => s.boFormat === 'BO5')).toBe(true);
    });

    it('槽位 id 按 elim-r{级}-{级内序号} 命名', () => {
      expect(slots.map((s) => s.id)).toEqual([
        'elim-r0-1',
        'elim-r0-2',
        'elim-r0-3',
        'elim-r0-4',
        'elim-r1-1',
        'elim-r1-2',
        'elim-r2-1',
      ]);
    });

    it('所有槽位 stage 为 elimination、status 为 upcoming', () => {
      expect(slots.every((s) => s.stage === 'elimination')).toBe(true);
      expect(slots.every((s) => s.status === 'upcoming')).toBe(true);
    });
  });

  describe('4队（2级）', () => {
    it('应生成 3 场：首轮 quarterfinals 2 场 + 次轮 finals 1 场', () => {
      const slots = generateEliminationSlots(
        makeElimStage({ teamCount: 4, roundNames: ['半决赛', '决赛'] }),
      );
      expect(slots).toHaveLength(3);
      expect(slots.filter((s) => s.eliminationBracket === 'quarterfinals')).toHaveLength(2);
      expect(slots.filter((s) => s.eliminationBracket === 'finals')).toHaveLength(1);
      expect(slots.map((s) => s.eliminationGameNumber)).toEqual([1, 2, 3]);
      expect(slots[0].round).toBe('半决赛');
      expect(slots[2].round).toBe('决赛');
    });
  });

  describe('2队（1级）', () => {
    it('应生成 1 场决赛', () => {
      const slots = generateEliminationSlots(makeElimStage({ teamCount: 2, roundNames: ['决赛'] }));
      expect(slots).toHaveLength(1);
      expect(slots[0].eliminationBracket).toBe('finals');
      expect(slots[0].eliminationGameNumber).toBe(1);
      expect(slots[0].round).toBe('决赛');
      expect(slots[0].id).toBe('elim-r0-1');
    });
  });

  describe('16队（4级）bracket 映射策略', () => {
    it('应生成 15 场：前三级 quarterfinals、末级 finals', () => {
      const slots = generateEliminationSlots(
        makeElimStage({
          teamCount: 16,
          roundNames: ['十六分之一决赛', '八分之一决赛', '四分之一决赛', '决赛'],
        }),
      );
      expect(slots).toHaveLength(15);
      expect(slots.filter((s) => s.eliminationBracket === 'quarterfinals')).toHaveLength(14);
      expect(slots.filter((s) => s.eliminationBracket === 'finals')).toHaveLength(1);
      expect(slots.map((s) => s.eliminationGameNumber)).toEqual(
        Array.from({ length: 15 }, (_, i) => i + 1),
      );
    });
  });
});
