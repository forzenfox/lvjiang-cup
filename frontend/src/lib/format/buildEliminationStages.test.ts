import { describe, it, expect } from 'vitest';
import { buildEliminationStages } from './buildEliminationStages';
import { BUILTIN_DEFAULT_FORMAT } from './defaultFormat';
import type { EliminationStageConfig } from './types';

const defaultEliminationStage = BUILTIN_DEFAULT_FORMAT.stages[1] as EliminationStageConfig;

describe('buildEliminationStages', () => {
  describe('默认配置：8 队单败（四分之一决赛/半决赛/决赛，BO5）', () => {
    const viewModel = buildEliminationStages(defaultEliminationStage);

    it('levels = 3，生成 3 个层级', () => {
      expect(viewModel.levels).toBe(3);
      expect(viewModel.stages).toHaveLength(3);
    });

    it('层级结构：四分之一决赛 4 场 / 半决赛 2 场 / 决赛 1 场', () => {
      expect(viewModel.stages).toEqual([
        { key: 'r0', name: '四分之一决赛', colIndex: 0, matchCount: 4 },
        { key: 'r1', name: '半决赛', colIndex: 1, matchCount: 2 },
        { key: 'r2', name: '决赛', colIndex: 2, matchCount: 1 },
      ]);
    });

    it('比赛按级别顺序连续编号 1-7', () => {
      expect(viewModel.games).toHaveLength(7);
      expect(viewModel.games.map(g => g.gameNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(viewModel.games.map(g => g.key)).toEqual([
        'r0-1',
        'r0-2',
        'r0-3',
        'r0-4',
        'r1-1',
        'r1-2',
        'r2-1',
      ]);
    });

    it('gameNumberToStage 映射 1-7 全部正确', () => {
      expect(viewModel.gameNumberToStage).toEqual({
        1: { level: 0, indexInLevel: 1, key: 'r0-1' },
        2: { level: 0, indexInLevel: 2, key: 'r0-2' },
        3: { level: 0, indexInLevel: 3, key: 'r0-3' },
        4: { level: 0, indexInLevel: 4, key: 'r0-4' },
        5: { level: 1, indexInLevel: 1, key: 'r1-1' },
        6: { level: 1, indexInLevel: 2, key: 'r1-2' },
        7: { level: 2, indexInLevel: 1, key: 'r2-1' },
      });
    });

    it('连接线 6 条：第 i 级第 k 场 → 第 i+1 级第 ceil(k/2) 场', () => {
      expect(viewModel.connectors).toEqual([
        { from: 'r0-1', to: 'r1-1' },
        { from: 'r0-2', to: 'r1-1' },
        { from: 'r0-3', to: 'r1-2' },
        { from: 'r0-4', to: 'r1-2' },
        { from: 'r1-1', to: 'r2-1' },
        { from: 'r1-2', to: 'r2-1' },
      ]);
    });

    it('boFormat 透传配置值 BO5', () => {
      expect(viewModel.boFormat).toBe('BO5');
    });
  });

  describe('4 队单败（半决赛/决赛，BO3）', () => {
    const stage: EliminationStageConfig = {
      type: 'elimination',
      name: '淘汰赛',
      teamCount: 4,
      advanceToStage: null,
      roundNames: ['半决赛', '决赛'],
      boFormat: 'BO3',
    };
    const viewModel = buildEliminationStages(stage);

    it('levels = 2，生成 2 个层级', () => {
      expect(viewModel.levels).toBe(2);
      expect(viewModel.stages).toEqual([
        { key: 'r0', name: '半决赛', colIndex: 0, matchCount: 2 },
        { key: 'r1', name: '决赛', colIndex: 1, matchCount: 1 },
      ]);
    });

    it('比赛共 3 场，连续编号 1-3', () => {
      expect(viewModel.games.map(g => g.key)).toEqual(['r0-1', 'r0-2', 'r1-1']);
      expect(viewModel.gameNumberToStage).toEqual({
        1: { level: 0, indexInLevel: 1, key: 'r0-1' },
        2: { level: 0, indexInLevel: 2, key: 'r0-2' },
        3: { level: 1, indexInLevel: 1, key: 'r1-1' },
      });
    });

    it('连接线 2 条', () => {
      expect(viewModel.connectors).toEqual([
        { from: 'r0-1', to: 'r1-1' },
        { from: 'r0-2', to: 'r1-1' },
      ]);
    });
  });
});
