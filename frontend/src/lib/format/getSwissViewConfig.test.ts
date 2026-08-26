import { describe, it, expect } from 'vitest';
import { getSwissViewConfig } from './getSwissViewConfig';
import { buildSwissColumns } from './buildSwissColumns';
import { BUILTIN_DEFAULT_FORMAT } from './defaultFormat';
import type { SwissStageConfig } from './types';

const defaultSwissStage = BUILTIN_DEFAULT_FORMAT.stages[0] as SwissStageConfig;

describe('getSwissViewConfig', () => {
  describe('默认配置：16队 3胜3败（对齐现状 SWISS_VIEW_CONFIG 与 SwissRoundTree 高亮常量）', () => {
    const columns = buildSwissColumns(defaultSwissStage);
    const view = getSwissViewConfig(columns, defaultSwissStage);

    it('bo1 视窗取前 4 列（0 起索引，对应现状列号 [1,2,3,4]）', () => {
      expect(view.bo1.columns).toEqual([0, 1, 2, 3]);
    });

    it('bo3 视窗取后 4 列（0 起索引，对应现状列号 [3,4,5,6]）', () => {
      expect(view.bo3.columns).toEqual([2, 3, 4, 5]);
    });

    it('bo1 高亮记录与 SwissRoundTree.tsx 现状 bo1Records 完全一致', () => {
      expect(view.bo1.records).toEqual(['0-0', '1-0', '0-1', '1-1']);
    });

    it('bo3 高亮记录与 SwissRoundTree.tsx 现状 bo3Records 完全一致', () => {
      expect(view.bo3.records).toEqual(['2-0', '0-2', '2-1', '1-2', '2-2']);
    });
  });

  describe('8队 2胜2败', () => {
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
    const view = getSwissViewConfig(columns, stage);

    it('4 列时 bo1 与 bo3 视窗均为全部 4 列', () => {
      expect(view.bo1.columns).toEqual([0, 1, 2, 3]);
      expect(view.bo3.columns).toEqual([0, 1, 2, 3]);
    });

    it('bo1 高亮记录仅 0-0（第 2 轮起均为决定性比赛）', () => {
      expect(view.bo1.records).toEqual(['0-0']);
    });

    it('bo3 高亮记录为 1-0 / 0-1 / 1-1', () => {
      expect(view.bo3.records).toEqual(['1-0', '0-1', '1-1']);
    });
  });

  describe('BO 覆盖规则（boRule）', () => {
    it('all-bo1：所有比赛记录归入 bo1 高亮', () => {
      const stage: SwissStageConfig = {
        ...defaultSwissStage,
        boRule: 'all-bo1',
      };
      const view = getSwissViewConfig(buildSwissColumns(stage), stage);
      expect(view.bo1.records).toEqual([
        '0-0',
        '1-0',
        '0-1',
        '2-0',
        '1-1',
        '0-2',
        '2-1',
        '1-2',
        '2-2',
      ]);
      expect(view.bo3.records).toEqual([]);
    });

    it('all-bo3：所有比赛记录归入 bo3 高亮', () => {
      const stage: SwissStageConfig = {
        ...defaultSwissStage,
        boRule: 'all-bo3',
      };
      const view = getSwissViewConfig(buildSwissColumns(stage), stage);
      expect(view.bo1.records).toEqual([]);
      expect(view.bo3.records).toEqual([
        '0-0',
        '1-0',
        '0-1',
        '2-0',
        '1-1',
        '0-2',
        '2-1',
        '1-2',
        '2-2',
      ]);
    });
  });
});
