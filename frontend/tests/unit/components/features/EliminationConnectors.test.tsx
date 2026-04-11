import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import EliminationConnectors from '@/components/features/EliminationConnectors';
import { ELIMINATION_CONNECTORS } from '@/components/features/eliminationConstants';

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
});
