import { describe, it, expect } from 'vitest';
import { calculateAdvancement } from './advancementStore';

/** 构造一场已完赛的瑞士轮比赛（teamAId 为胜者） */
const finishedMatch = (winnerId: string, loserId: string) => ({
  stage: 'swiss',
  status: 'finished',
  winnerId,
  teamAId: winnerId,
  teamBId: loserId,
});

const rules2 = { winThreshold: 2, lossThreshold: 2 };
const rules3 = { winThreshold: 3, lossThreshold: 3 };

describe('calculateAdvancement', () => {
  describe('2 胜制判定（rules: 2/2）', () => {
    it('达到 2 胜的队伍晋级', () => {
      const result = calculateAdvancement(
        [finishedMatch('a', 'b'), finishedMatch('a', 'c')],
        [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        rules2
      );
      expect(result.top8).toEqual(['a']);
      expect(result.eliminated).toEqual([]);
    });

    it('达到 2 败的队伍淘汰', () => {
      const result = calculateAdvancement(
        [finishedMatch('b', 'a'), finishedMatch('c', 'a')],
        [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        rules2
      );
      expect(result.top8).toEqual([]);
      expect(result.eliminated).toEqual(['a']);
    });

    it('1-1 战绩不晋级也不淘汰', () => {
      const result = calculateAdvancement(
        [finishedMatch('a', 'b')],
        [{ id: 'a' }, { id: 'b' }],
        rules2
      );
      expect(result.top8).toEqual([]);
      expect(result.eliminated).toEqual([]);
    });

    it('2 胜制下 3 胜 0 败仍按晋级处理（wins >= 阈值判定）', () => {
      const result = calculateAdvancement(
        [finishedMatch('a', 'b'), finishedMatch('a', 'c'), finishedMatch('a', 'd')],
        [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
        rules2
      );
      expect(result.top8).toEqual(['a']);
    });
  });

  describe('3 胜制回归（rules: 3/3，行为与改造前一致）', () => {
    it('达到 3 胜晋级、达到 3 败淘汰、1-1 未定', () => {
      const result = calculateAdvancement(
        [
          finishedMatch('a', 'b'),
          finishedMatch('a', 'b'),
          finishedMatch('a', 'b'),
          finishedMatch('c', 'd'),
          finishedMatch('d', 'c'),
        ],
        [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
        rules3
      );
      expect(result.top8).toEqual(['a']);
      expect(result.eliminated).toEqual(['b']);
    });

    it('排序：晋级区败场少者在前，淘汰区胜场少者在前，rankings 连续编号', () => {
      // x 3-0、y 3-1 晋级；p 0-3、q 1-3 淘汰；r 1-2、z 1-0 未定
      const matches = [
        finishedMatch('x', 'y'),
        finishedMatch('x', 'p'),
        finishedMatch('x', 'q'),
        finishedMatch('y', 'p'),
        finishedMatch('y', 'q'),
        finishedMatch('y', 'r'),
        finishedMatch('r', 'p'),
        finishedMatch('q', 'r'),
        finishedMatch('z', 'q'),
      ];
      const teams = [{ id: 'x' }, { id: 'y' }, { id: 'r' }, { id: 'z' }, { id: 'p' }, { id: 'q' }];
      const result = calculateAdvancement(matches, teams, rules3);

      expect(result.top8).toEqual(['x', 'y']);
      expect(result.eliminated).toEqual(['p', 'q']);
      expect(result.rankings).toEqual([
        { teamId: 'x', record: '3-0', rank: 1 },
        { teamId: 'y', record: '3-1', rank: 2 },
        { teamId: 'p', record: '0-3', rank: 3 },
        { teamId: 'q', record: '1-3', rank: 4 },
      ]);
    });
  });

  describe('输入过滤（保持现状行为）', () => {
    it('未完赛或缺少胜者的比赛不计入战绩', () => {
      const matches = [
        { stage: 'swiss', status: 'upcoming', winnerId: null, teamAId: 'a', teamBId: 'b' },
        { stage: 'swiss', status: 'finished', winnerId: null, teamAId: 'a', teamBId: 'b' },
        { stage: 'swiss', status: 'finished', winnerId: 'a', teamAId: 'a' },
      ];
      const result = calculateAdvancement(matches, [{ id: 'a' }, { id: 'b' }], rules2);
      expect(result.top8).toEqual([]);
      expect(result.eliminated).toEqual([]);
    });

    it('非瑞士轮比赛不计入战绩', () => {
      const result = calculateAdvancement(
        [{ stage: 'elimination', status: 'finished', winnerId: 'a', teamAId: 'a', teamBId: 'b' }],
        [{ id: 'a' }, { id: 'b' }],
        rules2
      );
      expect(result.top8).toEqual([]);
      expect(result.eliminated).toEqual([]);
    });

    it('未在 teams 中的队伍战绩被忽略', () => {
      const result = calculateAdvancement(
        [finishedMatch('ghost', 'a'), finishedMatch('ghost', 'a')],
        [{ id: 'a' }],
        rules2
      );
      expect(result.top8).toEqual([]);
      expect(result.eliminated).toEqual(['a']);
    });
  });
});
