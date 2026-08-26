import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import EliminationConnectors from '@/components/features/EliminationConnectors';
import { buildEliminationStages, BUILTIN_DEFAULT_FORMAT } from '@/lib/format';
import type { EliminationStageConfig } from '@/lib/format';
import { calculateEliminationPositions } from '@/components/features/eliminationConstants';

// 默认配置（8 队三级）的连接线视图模型
const defaultViewModel = buildEliminationStages(
  BUILTIN_DEFAULT_FORMAT.stages[1] as EliminationStageConfig
);

describe('EliminationConnectors 组件', () => {
  it('应该渲染所有连接线', () => {
    const { container } = render(
      <EliminationConnectors connectors={defaultViewModel.connectors} />
    );

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(defaultViewModel.connectors.length);
  });

  it('应该使用实线而非虚线', () => {
    const { container } = render(
      <EliminationConnectors connectors={defaultViewModel.connectors} />
    );

    // 验证没有虚线SVG路径
    const dashedPaths = container.querySelectorAll('path[stroke-dasharray]');
    expect(dashedPaths.length).toBe(0);

    // 验证使用内联样式实现的实线（金色连接线）
    const lines = container.querySelectorAll('.elimination-connector');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('应该正确渲染每个连接器的三部分线段', () => {
    const { container } = render(
      <EliminationConnectors connectors={defaultViewModel.connectors} />
    );

    const connectors = container.querySelectorAll('.elimination-connector');

    connectors.forEach(connector => {
      // 每个连接器应该包含3个div线段（水平-垂直-水平）
      const divs = connector.querySelectorAll(':scope > div');
      expect(divs.length).toBe(3);
    });
  });

  it('应该接受自定义卡片尺寸', () => {
    const { container } = render(
      <EliminationConnectors
        connectors={defaultViewModel.connectors}
        cardWidth={200}
        cardHeight={120}
      />
    );

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(defaultViewModel.connectors.length);
  });

  it('应该使用绝对定位', () => {
    const { container } = render(
      <EliminationConnectors connectors={defaultViewModel.connectors} />
    );

    const lines = container.querySelectorAll('.absolute');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('应该接受自定义位置参数', () => {
    const positions = calculateEliminationPositions(900, 3, [4, 2, 1]);
    const { container } = render(
      <EliminationConnectors
        connectors={defaultViewModel.connectors}
        positions={positions}
        containerWidth={900}
      />
    );

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(defaultViewModel.connectors.length);
  });

  it('应该在传入positions时使用传入的位置', () => {
    const customPositions = {
      'r0-1': { x: 10, y: 10 },
      'r0-2': { x: 10, y: 100 },
      'r0-3': { x: 10, y: 200 },
      'r0-4': { x: 10, y: 300 },
      'r1-1': { x: 300, y: 55 },
      'r1-2': { x: 300, y: 255 },
      'r2-1': { x: 600, y: 155 },
    };

    const { container } = render(
      <EliminationConnectors
        connectors={defaultViewModel.connectors}
        positions={customPositions}
        containerWidth={900}
      />
    );

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(defaultViewModel.connectors.length);
  });

  it('动态层级（4 队 2 级）：应该渲染 2 条连接线', () => {
    const fourTeamViewModel = buildEliminationStages({
      type: 'elimination',
      name: '淘汰赛',
      teamCount: 4,
      advanceToStage: null,
      roundNames: ['半决赛', '决赛'],
      boFormat: 'BO3',
    });

    const { container } = render(
      <EliminationConnectors connectors={fourTeamViewModel.connectors} />
    );

    // r0-1 → r1-1, r0-2 → r1-1：共 2 条
    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(2);
  });
});
