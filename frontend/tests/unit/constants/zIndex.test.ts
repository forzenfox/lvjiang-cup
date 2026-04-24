import { describe, it, expect } from 'vitest';
import { ZIndexLayers } from '../../../src/constants/zIndex';

describe('ZIndexLayers', () => {
  it('应该导出所有层级常量', () => {
    expect(ZIndexLayers.HIDDEN).toBe(-1);
    expect(ZIndexLayers.BASE).toBe(0);
    expect(ZIndexLayers.ABSOLUTE).toBe(10);
    expect(ZIndexLayers.STICKY).toBe(50);
    expect(ZIndexLayers.DROPDOWN).toBe(60);
    expect(ZIndexLayers.TOAST).toBe(70);
    expect(ZIndexLayers.COVER).toBe(80);
    expect(ZIndexLayers.CONFIRM_DIALOG).toBe(90);
    expect(ZIndexLayers.MODAL_OVERLAY).toBe(100);
    expect(ZIndexLayers.MODAL).toBe(110);
    expect(ZIndexLayers.NESTED_MODAL).toBe(120);
    expect(ZIndexLayers.DRAGGING).toBe(1000);
  });

  it('层级应该按正确顺序排列', () => {
    const layers = [
      ZIndexLayers.HIDDEN,
      ZIndexLayers.BASE,
      ZIndexLayers.ABSOLUTE,
      ZIndexLayers.STICKY,
      ZIndexLayers.DROPDOWN,
      ZIndexLayers.TOAST,
      ZIndexLayers.COVER,
      ZIndexLayers.CONFIRM_DIALOG,
      ZIndexLayers.MODAL_OVERLAY,
      ZIndexLayers.MODAL,
      ZIndexLayers.NESTED_MODAL,
      ZIndexLayers.DRAGGING,
    ];

    // 验证每个层级都大于前一个
    for (let i = 1; i < layers.length; i++) {
      expect(layers[i]).toBeGreaterThan(layers[i - 1]);
    }
  });

  it('关键层级关系应该正确', () => {
    // Modal 应该覆盖封面
    expect(ZIndexLayers.MODAL).toBeGreaterThan(ZIndexLayers.COVER);

    // 封面应该覆盖 Toast
    expect(ZIndexLayers.COVER).toBeGreaterThan(ZIndexLayers.TOAST);

    // Toast 应该覆盖导航栏
    expect(ZIndexLayers.TOAST).toBeGreaterThan(ZIndexLayers.STICKY);

    // 拖拽元素应该始终在最顶层
    expect(ZIndexLayers.DRAGGING).toBeGreaterThan(ZIndexLayers.MODAL);
    expect(ZIndexLayers.DRAGGING).toBeGreaterThan(ZIndexLayers.NESTED_MODAL);

    // 确认对话框应该在封面和 Modal 之间
    expect(ZIndexLayers.CONFIRM_DIALOG).toBeGreaterThan(ZIndexLayers.COVER);
    expect(ZIndexLayers.CONFIRM_DIALOG).toBeLessThan(ZIndexLayers.MODAL_OVERLAY);
  });

  it('层级间隔应该便于插入新层级', () => {
    // 主要层级之间至少有 10 的间隔
    expect(ZIndexLayers.STICKY - ZIndexLayers.ABSOLUTE).toBeGreaterThanOrEqual(10);
    expect(ZIndexLayers.DROPDOWN - ZIndexLayers.STICKY).toBeGreaterThanOrEqual(10);
    expect(ZIndexLayers.TOAST - ZIndexLayers.DROPDOWN).toBeGreaterThanOrEqual(10);
    expect(ZIndexLayers.COVER - ZIndexLayers.TOAST).toBeGreaterThanOrEqual(10);
    expect(ZIndexLayers.CONFIRM_DIALOG - ZIndexLayers.COVER).toBeGreaterThanOrEqual(10);
    expect(ZIndexLayers.MODAL_OVERLAY - ZIndexLayers.CONFIRM_DIALOG).toBeGreaterThanOrEqual(10);
  });
});
