import { describe, it, expect } from 'vitest';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  ELIMINATION_POSITIONS,
  ELIMINATION_CONNECTORS,
  createPlaceholderMatch,
  getPositionByGameKey,
  GAME_KEYS,
} from '@/components/features/eliminationConstants';

describe('eliminationConstants', () => {
  describe('BOARD_WIDTH 和 BOARD_HEIGHT', () => {
    it('应该定义正确的画布尺寸', () => {
      expect(BOARD_WIDTH).toBe(900);
      expect(BOARD_HEIGHT).toBe(450);
    });
  });

  describe('ELIMINATION_POSITIONS', () => {
    it('应该包含7个比赛位置（4个QF + 2个SF + 1个F）', () => {
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

    it('每个位置应该包含x和y坐标', () => {
      Object.values(ELIMINATION_POSITIONS).forEach(pos => {
        expect(pos).toHaveProperty('x');
        expect(pos).toHaveProperty('y');
        expect(typeof pos.x).toBe('number');
        expect(typeof pos.y).toBe('number');
      });
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
      expect(pos).toEqual({ x: 20, y: 30 });
    });

    it('应该返回所有有效的游戏键位置', () => {
      GAME_KEYS.forEach(key => {
        const pos = getPositionByGameKey(key);
        expect(pos).toBeDefined();
        expect(pos).toHaveProperty('x');
        expect(pos).toHaveProperty('y');
      });
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
});