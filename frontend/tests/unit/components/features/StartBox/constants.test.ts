import { describe, it, expect } from 'vitest';
import { COVER_BACKGROUNDS, SCROLL_TIP_IMAGE, ANIMATION_CONFIG } from '@/components/features/StartBox/constants';

describe('StartBox constants', () => {
  describe('COVER_BACKGROUNDS', () => {
    it('应该包含 PC 端背景图数组', () => {
      expect(COVER_BACKGROUNDS.pc).toBeDefined();
      expect(Array.isArray(COVER_BACKGROUNDS.pc)).toBe(true);
    });

    it('应该包含移动端背景图数组', () => {
      expect(COVER_BACKGROUNDS.mobile).toBeDefined();
      expect(Array.isArray(COVER_BACKGROUNDS.mobile)).toBe(true);
    });

    it('PC 端应该包含驴酱杯封面图片', () => {
      expect(COVER_BACKGROUNDS.pc).toContain('/驴酱杯封面.webp');
    });

    it('移动端应该包含驴酱杯封面图片', () => {
      expect(COVER_BACKGROUNDS.mobile).toContain('/驴酱杯封面.webp');
    });
  });

  describe('SCROLL_TIP_IMAGE', () => {
    it('应该定义滚动提示图片路径', () => {
      expect(SCROLL_TIP_IMAGE).toBeDefined();
      expect(SCROLL_TIP_IMAGE).toBe('/glide-tip.png');
    });
  });

  describe('ANIMATION_CONFIG', () => {
    it('轮播间隔应该是 3000ms', () => {
      expect(ANIMATION_CONFIG.carouselInterval).toBe(3000);
    });

    it('退出动画时长应该是 900ms', () => {
      expect(ANIMATION_CONFIG.exitDuration).toBe(900);
    });

    it('触摸阈值应该是 50px', () => {
      expect(ANIMATION_CONFIG.touchThreshold).toBe(50);
    });
  });
});
