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
      expect(BOARD_WIDTH).toBe(1200);
      expect(BOARD_HEIGHT).toBe(650);
    });
  });

  describe('ELIMINATION_POSITIONS', () => {
    it('应该包含8个比赛位置', () => {
      expect(Object.keys(ELIMINATION_POSITIONS)).toHaveLength(8);
    });

    it('应该包含所有游戏键', () => {
      expect(ELIMINATION_POSITIONS).toHaveProperty('g1');
      expect(ELIMINATION_POSITIONS).toHaveProperty('g2');
      expect(ELIMINATION_POSITIONS).toHaveProperty('g3');
      expect(ELIMINATION_POSITIONS).toHaveProperty('g4');
      expect(ELIMINATION_POSITIONS).toHaveProperty('g5');
      expect(ELIMINATION_POSITIONS).toHaveProperty('g6');
      expect(ELIMINATION_POSITIONS).toHaveProperty('g7');
      expect(ELIMINATION_POSITIONS).toHaveProperty('g8');
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
    it('应该包含7条连接线', () => {
      expect(ELIMINATION_CONNECTORS).toHaveLength(7);
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
        { from: 'g1', to: 'g5' },
        { from: 'g2', to: 'g5' },
        { from: 'g3', to: 'g6' },
        { from: 'g4', to: 'g6' },
        { from: 'g5', to: 'g8' },
        { from: 'g6', to: 'g7' },
        { from: 'g7', to: 'g8' },
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
      const pos = getPositionByGameKey('g1');
      expect(pos).toEqual({ x: 20, y: 20 });
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
    it('应该包含8个游戏键', () => {
      expect(GAME_KEYS).toHaveLength(8);
    });

    it('应该包含正确的游戏键顺序', () => {
      expect(GAME_KEYS).toEqual(['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8']);
    });
  });
});
