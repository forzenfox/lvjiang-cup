import { describe, it, expect } from 'vitest';
import { COVER_IMAGES, ANIMATION_CONFIG } from '@/components/features/StartBox/constants';

describe('StartBox constants', () => {
  describe('COVER_IMAGES', () => {
    it('应该包含 PC 端图片资源', () => {
      expect(COVER_IMAGES.pc).toBeDefined();
      expect(COVER_IMAGES.pc.background1).toBeDefined();
      expect(COVER_IMAGES.pc.background2).toBeDefined();
      expect(COVER_IMAGES.pc.slogan).toBeDefined();
      expect(COVER_IMAGES.pc.logo).toBeDefined();
      expect(COVER_IMAGES.pc.scrollTip).toBeDefined();
    });

    it('应该包含移动端图片资源', () => {
      expect(COVER_IMAGES.mobile).toBeDefined();
      expect(COVER_IMAGES.mobile.slogan).toBeDefined();
      expect(COVER_IMAGES.mobile.logo).toBeDefined();
    });

    it('PC 和移动端的 slogan、logo 应该是不同的资源', () => {
      expect(COVER_IMAGES.pc.slogan).not.toBe(COVER_IMAGES.mobile.slogan);
      expect(COVER_IMAGES.pc.logo).not.toBe(COVER_IMAGES.mobile.logo);
    });
  });

  describe('ANIMATION_CONFIG', () => {
    it('轮播间隔应该是 3000ms', () => {
      expect(ANIMATION_CONFIG.carouselInterval).toBe(3000);
    });

    it('退出动画时长应该是 900ms', () => {
      expect(ANIMATION_CONFIG.exitDuration).toBe(900);
    });

    it('滚动提示弹跳周期应该是 1.6s', () => {
      expect(ANIMATION_CONFIG.scrollTipBounceDuration).toBe(1.6);
    });

    it('触摸阈值应该是 50px', () => {
      expect(ANIMATION_CONFIG.touchThreshold).toBe(50);
    });
  });
});
