import { describe, it, expect } from 'vitest';
import {
  BOARD_HEIGHT,
  BOARD_MIN_WIDTH,
  ELIMINATION_POSITIONS,
  ELIMINATION_CONNECTORS,
  createPlaceholderMatch,
  getPositionByGameKey,
  GAME_KEYS,
  calculateEliminationPositions,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_TIME_HEIGHT,
  STAGE_CONFIG,
  ELIMINATION_STAGES,
  GAME_NUMBER_TO_STAGE,
} from '@/components/features/eliminationConstants';

describe('eliminationConstants', () => {
  describe('BOARD_HEIGHT 和 BOARD_MIN_WIDTH', () => {
    it('应该定义正确的画布尺寸常量', () => {
      expect(BOARD_HEIGHT).toBe(700);
      expect(BOARD_MIN_WIDTH).toBe(1200);
    });
  });

  describe('卡片尺寸常量', () => {
    it('应该定义正确的卡片尺寸', () => {
      expect(CARD_WIDTH).toBe(320);
      expect(CARD_HEIGHT).toBe(110);
      expect(CARD_TIME_HEIGHT).toBe(28);
    });
  });

  describe('STAGE_CONFIG', () => {
    it('应该包含三个阶段配置', () => {
      expect(STAGE_CONFIG.quarterfinals).toBeDefined();
      expect(STAGE_CONFIG.semifinals).toBeDefined();
      expect(STAGE_CONFIG.finals).toBeDefined();
    });

    it('四分之一决赛应该有4场比赛', () => {
      expect(STAGE_CONFIG.quarterfinals.matchCount).toBe(4);
      expect(STAGE_CONFIG.quarterfinals.colIndex).toBe(0);
    });

    it('半决赛应该有2场比赛', () => {
      expect(STAGE_CONFIG.semifinals.matchCount).toBe(2);
      expect(STAGE_CONFIG.semifinals.colIndex).toBe(1);
    });

    it('决赛应该有1场比赛', () => {
      expect(STAGE_CONFIG.finals.matchCount).toBe(1);
      expect(STAGE_CONFIG.finals.colIndex).toBe(2);
    });
  });

  describe('calculateEliminationPositions', () => {
    it('应该计算7个比赛位置（4个QF + 2个SF + 1个F）', () => {
      const positions = calculateEliminationPositions(1200);
      expect(Object.keys(positions)).toHaveLength(7);
    });

    it('应该包含所有正确的游戏键', () => {
      const positions = calculateEliminationPositions(1200);
      expect(positions).toHaveProperty('qf1');
      expect(positions).toHaveProperty('qf2');
      expect(positions).toHaveProperty('qf3');
      expect(positions).toHaveProperty('qf4');
      expect(positions).toHaveProperty('sf1');
      expect(positions).toHaveProperty('sf2');
      expect(positions).toHaveProperty('f');
    });

    it('每个位置应该包含x和y坐标', () => {
      const positions = calculateEliminationPositions(1200);
      Object.values(positions).forEach(pos => {
        expect(pos).toHaveProperty('x');
        expect(pos).toHaveProperty('y');
        expect(typeof pos.x).toBe('number');
        expect(typeof pos.y).toBe('number');
      });
    });

    it('应该根据容器宽度计算位置', () => {
      const positions1200 = calculateEliminationPositions(1200);
      const positions1400 = calculateEliminationPositions(1400);

      // 更宽的容器应该有更大的x坐标
      expect(positions1400.qf1.x).toBeGreaterThan(positions1200.qf1.x);
      expect(positions1400.sf1.x).toBeGreaterThan(positions1200.sf1.x);
      expect(positions1400.f.x).toBeGreaterThan(positions1200.f.x);
    });

    it('四分之一决赛应该在第一列', () => {
      const positions = calculateEliminationPositions(1200);
      const colWidth = 1200 / 3;

      // QF应该在第一列范围内
      expect(positions.qf1.x).toBeGreaterThanOrEqual(0);
      expect(positions.qf1.x).toBeLessThan(colWidth);
      expect(positions.qf4.x).toBeGreaterThanOrEqual(0);
      expect(positions.qf4.x).toBeLessThan(colWidth);
    });

    it('半决赛应该在第二列', () => {
      const positions = calculateEliminationPositions(1200);
      const colWidth = 1200 / 3;

      // SF应该在第二列范围内
      expect(positions.sf1.x).toBeGreaterThanOrEqual(colWidth);
      expect(positions.sf1.x).toBeLessThan(colWidth * 2);
    });

    it('决赛应该在第三列', () => {
      const positions = calculateEliminationPositions(1200);
      const colWidth = 1200 / 3;

      // F应该在第三列范围内
      expect(positions.f.x).toBeGreaterThanOrEqual(colWidth * 2);
    });

    it('同一阶段的比赛应该在同一x坐标', () => {
      const positions = calculateEliminationPositions(1200);

      // QF应该在同一列
      expect(positions.qf1.x).toBe(positions.qf2.x);
      expect(positions.qf2.x).toBe(positions.qf3.x);
      expect(positions.qf3.x).toBe(positions.qf4.x);

      // SF应该在同一列
      expect(positions.sf1.x).toBe(positions.sf2.x);
    });

    it('QF比赛应该垂直平均分布', () => {
      const positions = calculateEliminationPositions(1200);

      // QF的y坐标应该递增
      expect(positions.qf1.y).toBeLessThan(positions.qf2.y);
      expect(positions.qf2.y).toBeLessThan(positions.qf3.y);
      expect(positions.qf3.y).toBeLessThan(positions.qf4.y);
    });

    it('SF比赛应该垂直平均分布', () => {
      const positions = calculateEliminationPositions(1200);

      // SF的y坐标应该递增
      expect(positions.sf1.y).toBeLessThan(positions.sf2.y);
    });

    it('决赛应该垂直居中', () => {
      const positions = calculateEliminationPositions(1200);
      const availableHeight = BOARD_HEIGHT - 120;
      const topOffset = 70;
      const expectedY = topOffset + (availableHeight - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2;

      expect(positions.f.y).toBe(expectedY);
    });
  });

  describe('ELIMINATION_POSITIONS（向后兼容）', () => {
    it('应该包含7个比赛位置', () => {
      expect(Object.keys(ELIMINATION_POSITIONS)).toHaveLength(7);
    });

    it('应该包含所有正确的游戏键', () => {
      expect(ELIMINATION_POSITIONS).toHaveProperty('qf1');
      expect(ELIMINATION_POSITIONS).toHaveProperty('qf2');
      expect(ELIMINATION_POSITIONS).toHaveProperty('qf3');
      expect(ELIMINATION_POSITIONS).toHaveProperty('qf4');
      expect(ELIMINATION_POSITIONS).toHaveProperty('sf1');
      expect(ELIMINATION_POSITIONS).toHaveProperty('sf2');
      expect(ELIMINATION_POSITIONS).toHaveProperty('f');
    });
  });

  describe('ELIMINATION_CONNECTORS', () => {
    it('应该包含6条连接线（4个QF->2个SF->1个F）', () => {
      expect(ELIMINATION_CONNECTORS).toHaveLength(6);
    });

    it('每条连接线应该包含from和to属性', () => {
      ELIMINATION_CONNECTORS.forEach(conn => {
        expect(conn).toHaveProperty('from');
        expect(conn).toHaveProperty('to');
        expect(typeof conn.from).toBe('string');
        expect(typeof conn.to).toBe('string');
      });
    });

    it('应该包含正确的连接关系', () => {
      const expectedConnections = [
        { from: 'qf1', to: 'sf1' },
        { from: 'qf2', to: 'sf1' },
        { from: 'qf3', to: 'sf2' },
        { from: 'qf4', to: 'sf2' },
        { from: 'sf1', to: 'f' },
        { from: 'sf2', to: 'f' },
      ];

      expectedConnections.forEach(expected => {
        const found = ELIMINATION_CONNECTORS.some(
          conn => conn.from === expected.from && conn.to === expected.to
        );
        expect(found).toBe(true);
      });
    });
  });

  describe('createPlaceholderMatch', () => {
    it('应该创建有效的占位比赛数据', () => {
      const match = createPlaceholderMatch(1);

      expect(match.id).toBe('placeholder-1');
      expect(match.teamAId).toBe('');
      expect(match.teamBId).toBe('');
      expect(match.scoreA).toBe(0);
      expect(match.scoreB).toBe(0);
      expect(match.winnerId).toBeNull();
      expect(match.status).toBe('upcoming');
      expect(match.stage).toBe('elimination');
      expect(match.eliminationGameNumber).toBe(1);
    });

    it('应该处理未提供游戏编号的情况', () => {
      const match = createPlaceholderMatch();

      expect(match.id).toBe('placeholder-na');
      expect(match.eliminationGameNumber).toBeUndefined();
    });
  });

  describe('getPositionByGameKey', () => {
    it('应该根据游戏键返回正确的位置', () => {
      const pos = getPositionByGameKey('qf1');
      expect(pos).toBeDefined();
      expect(pos).toHaveProperty('x');
      expect(pos).toHaveProperty('y');
    });

    it('应该返回所有有效的游戏键位置', () => {
      GAME_KEYS.forEach(key => {
        const pos = getPositionByGameKey(key);
        expect(pos).toBeDefined();
        expect(pos).toHaveProperty('x');
        expect(pos).toHaveProperty('y');
      });
    });

    it('应该支持自定义容器宽度', () => {
      const pos1200 = getPositionByGameKey('qf1', 1200);
      const pos1400 = getPositionByGameKey('qf1', 1400);

      expect(pos1400.x).toBeGreaterThan(pos1200.x);
    });
  });

  describe('GAME_KEYS', () => {
    it('应该包含7个游戏键', () => {
      expect(GAME_KEYS).toHaveLength(7);
    });

    it('应该包含正确的游戏键顺序', () => {
      expect(GAME_KEYS).toEqual(['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'f']);
    });
  });

  describe('ELIMINATION_STAGES', () => {
    it('应该包含3个阶段', () => {
      expect(ELIMINATION_STAGES).toHaveLength(3);
    });

    it('应该包含正确的阶段名称', () => {
      expect(ELIMINATION_STAGES[0].name).toBe('四分之一决赛');
      expect(ELIMINATION_STAGES[1].name).toBe('半决赛');
      expect(ELIMINATION_STAGES[2].name).toBe('决赛');
    });

    it('应该有正确的列索引', () => {
      expect(ELIMINATION_STAGES[0].colIndex).toBe(0);
      expect(ELIMINATION_STAGES[1].colIndex).toBe(1);
      expect(ELIMINATION_STAGES[2].colIndex).toBe(2);
    });
  });

  describe('GAME_NUMBER_TO_STAGE', () => {
    it('应该包含7个游戏编号映射', () => {
      expect(Object.keys(GAME_NUMBER_TO_STAGE)).toHaveLength(7);
    });

    it('应该正确映射QF比赛', () => {
      expect(GAME_NUMBER_TO_STAGE[1]).toEqual({ stage: 'quarterfinals', index: 1 });
      expect(GAME_NUMBER_TO_STAGE[2]).toEqual({ stage: 'quarterfinals', index: 2 });
      expect(GAME_NUMBER_TO_STAGE[3]).toEqual({ stage: 'quarterfinals', index: 3 });
      expect(GAME_NUMBER_TO_STAGE[4]).toEqual({ stage: 'quarterfinals', index: 4 });
    });

    it('应该正确映射SF比赛', () => {
      expect(GAME_NUMBER_TO_STAGE[5]).toEqual({ stage: 'semifinals', index: 1 });
      expect(GAME_NUMBER_TO_STAGE[6]).toEqual({ stage: 'semifinals', index: 2 });
    });

    it('应该正确映射决赛', () => {
      expect(GAME_NUMBER_TO_STAGE[7]).toEqual({ stage: 'finals', index: 1 });
    });
  });
});
