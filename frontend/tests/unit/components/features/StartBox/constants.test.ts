import { describe, it, expect } from 'vitest';
import {
  COVER_IMAGES,
  COVER_BACKGROUNDS,
  SCROLL_TIP_IMAGE,
  ANIMATION_CONFIG,
} from '@/components/features/StartBox/constants';

describe('StartBox constants', () => {
  describe('COVER_IMAGES', () => {
    it('PC 端应该包含 4 张封面图片', () => {
      expect(COVER_IMAGES.pc.length).toBe(4);
    });

    it('移动端应该包含 1 张封面图片', () => {
      expect(COVER_IMAGES.mobile.length).toBe(1);
    });

    it('每张图片都应该有 cdn 和 local 两个路径', () => {
      COVER_IMAGES.pc.forEach(img => {
        expect(img).toHaveProperty('cdn');
        expect(img).toHaveProperty('local');
        expect(img.cdn).toContain('assets/cover_');
        expect(img.local).toContain('/assets/cover_');
      });

      COVER_IMAGES.mobile.forEach(img => {
        expect(img).toHaveProperty('cdn');
        expect(img).toHaveProperty('local');
        expect(img.cdn).toContain('assets/mobile_cover_');
        expect(img.local).toContain('/assets/mobile_cover_');
      });
    });

    it('PC 端封面图片编号应该为 01-04', () => {
      const pcFileNames = COVER_IMAGES.pc.map(img => {
        const match = img.cdn.match(/cover_(\d+)\.webp$/);
        return match ? match[1] : null;
      });
      expect(pcFileNames).toEqual(['01', '02', '03', '04']);
    });
  });

  describe('COVER_BACKGROUNDS', () => {
    it('应该包含 PC 端背景图数组', () => {
      expect(COVER_BACKGROUNDS.pc).toBeDefined();
      expect(Array.isArray(COVER_BACKGROUNDS.pc)).toBe(true);
      expect(COVER_BACKGROUNDS.pc.length).toBe(4);
    });

    it('应该包含移动端背景图数组', () => {
      expect(COVER_BACKGROUNDS.mobile).toBeDefined();
      expect(Array.isArray(COVER_BACKGROUNDS.mobile)).toBe(true);
      expect(COVER_BACKGROUNDS.mobile.length).toBe(1);
    });

    it('PC 端应该包含 CDN 外链地址', () => {
      COVER_BACKGROUNDS.pc.forEach(url => {
        expect(url).toMatch(/^https?:\/\//);
        expect(url).toContain('assets/cover_');
      });
    });

    it('移动端应该包含 CDN 外链地址', () => {
      COVER_BACKGROUNDS.mobile.forEach(url => {
        expect(url).toMatch(/^https?:\/\//);
        expect(url).toContain('assets/mobile_cover_');
      });
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
