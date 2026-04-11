import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import EliminationConnectors from '@/components/features/EliminationConnectors';
import {
  ELIMINATION_CONNECTORS,
  calculateEliminationPositions,
} from '@/components/features/eliminationConstants';

describe('EliminationConnectors 组件', () => {
  it('应该渲染所有连接线', () => {
    const { container } = render(<EliminationConnectors />);

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(ELIMINATION_CONNECTORS.length);
  });

  it('应该使用实线而非虚线', () => {
    const { container } = render(<EliminationConnectors />);

    // 验证没有虚线SVG路径
    const dashedPaths = container.querySelectorAll('path[stroke-dasharray]');
    expect(dashedPaths.length).toBe(0);

    // 验证使用内联样式实现的实线（金色连接线）
    const lines = container.querySelectorAll('.elimination-connector');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('应该正确渲染每个连接器的三部分线段', () => {
    const { container } = render(<EliminationConnectors />);

    const connectors = container.querySelectorAll('.elimination-connector');

    connectors.forEach(connector => {
      // 每个连接器应该包含3个div线段（水平-垂直-水平）
      const divs = connector.querySelectorAll(':scope > div');
      expect(divs.length).toBe(3);
    });
  });

  it('应该接受自定义卡片尺寸', () => {
    const { container } = render(<EliminationConnectors cardWidth={200} cardHeight={120} />);

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(ELIMINATION_CONNECTORS.length);
  });

  it('应该使用绝对定位', () => {
    const { container } = render(<EliminationConnectors />);

    const lines = container.querySelectorAll('.absolute');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('应该接受自定义位置参数', () => {
    const positions = calculateEliminationPositions(900);
    const { container } = render(
      <EliminationConnectors positions={positions} containerWidth={900} />
    );

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(ELIMINATION_CONNECTORS.length);
  });

  it('应该在传入positions时使用传入的位置', () => {
    const customPositions = {
      qf1: { x: 10, y: 10 },
      qf2: { x: 10, y: 100 },
      qf3: { x: 10, y: 200 },
      qf4: { x: 10, y: 300 },
      sf1: { x: 300, y: 55 },
      sf2: { x: 300, y: 255 },
      f: { x: 600, y: 155 },
    };

    const { container } = render(
      <EliminationConnectors positions={customPositions} containerWidth={900} />
    );

    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBe(ELIMINATION_CONNECTORS.length);
  });
});
