import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Performance Utils - Conditional Reporting', () => {
  let mockConfig: any;
  let mockMetric: any;

  beforeEach(async () => {
    // Mock window.location
    vi.stubGlobal('location', {
      hostname: 'example.com',
      search: '',
      href: 'https://example.com',
      pathname: '/',
    });

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    });

    // Mock sessionStorage
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    });

    // Mock window._hmt
    vi.stubGlobal('_hmt', {
      push: vi.fn(),
    });

    // 默认配置：生产环境，已启用（仅百度统计）
    mockConfig = {
      enabled: true,
      sampleRate: 0.1,
      baiduTongjiId: 'test_id',
      isDev: false,
    };

    // 默认指标
    mockMetric = {
      name: 'LCP',
      value: 2500,
      rating: 'needs-improvement',
      delta: 500,
      navigationType: 'navigate',
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isInternalUser', () => {
    it('应该排除 localhost', async () => {
      vi.stubGlobal('location', { ...window.location, hostname: 'localhost' });
      const { isInternalUser } = await import('@/utils/performance');
      expect(isInternalUser()).toBe(true);
    });

    it('应该排除 127.0.0.1', async () => {
      vi.stubGlobal('location', { ...window.location, hostname: '127.0.0.1' });
      const { isInternalUser } = await import('@/utils/performance');
      expect(isInternalUser()).toBe(true);
    });

    it('应该排除 test=true 参数', async () => {
      vi.stubGlobal('location', { ...window.location, search: '?test=true' });
      const { isInternalUser } = await import('@/utils/performance');
      expect(isInternalUser()).toBe(true);
    });

    it('应该排除 debug=true 参数', async () => {
      vi.stubGlobal('location', { ...window.location, search: '?debug=true' });
      const { isInternalUser } = await import('@/utils/performance');
      expect(isInternalUser()).toBe(true);
    });

    it('应该排除 localStorage user_type=internal', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('internal');
      const { isInternalUser } = await import('@/utils/performance');
      expect(isInternalUser()).toBe(true);
    });

    it('应该排除正常用户返回 false', async () => {
      const { isInternalUser } = await import('@/utils/performance');
      expect(isInternalUser()).toBe(false);
    });
  });

  describe('shouldReportMetric', () => {
    it('开发环境应该不上报', async () => {
      const config = { ...mockConfig, isDev: true };
      const { shouldReportMetric } = await import('@/utils/performance');
      expect(shouldReportMetric(mockMetric, config)).toBe(false);
    });

    it('配置禁用应该不上报', async () => {
      const config = { ...mockConfig, enabled: false };
      const { shouldReportMetric } = await import('@/utils/performance');
      expect(shouldReportMetric(mockMetric, config)).toBe(false);
    });

    it('内部用户应该不上报', async () => {
      vi.stubGlobal('location', { ...window.location, hostname: 'localhost' });
      const { shouldReportMetric } = await import('@/utils/performance');
      expect(shouldReportMetric(mockMetric, mockConfig)).toBe(false);
    });

    it('poor 指标应该 100% 上报', async () => {
      const metric = { ...mockMetric, rating: 'poor' };
      const { shouldReportMetric } = await import('@/utils/performance');
      expect(shouldReportMetric(metric, mockConfig)).toBe(true);
    });

    it('needs-improvement 指标应该 100% 上报', async () => {
      const { shouldReportMetric } = await import('@/utils/performance');
      expect(shouldReportMetric(mockMetric, mockConfig)).toBe(true);
    });

    it('good 指标应该根据采样率上报', async () => {
      const metric = { ...mockMetric, rating: 'good' };
      const { shouldReportMetric } = await import('@/utils/performance');

      // mock Math.random() 使采样行为可预测
      // 采样率 10%，random() < 0.1 时上报
      const originalRandom = Math.random;

      // 第一次：random = 0.05 < 0.1，应该上报
      Math.random = vi.fn(() => 0.05);
      expect(shouldReportMetric(metric, mockConfig)).toBe(true);

      // 第二次：random = 0.5 >= 0.1，不应该上报
      Math.random = vi.fn(() => 0.5);
      expect(shouldReportMetric(metric, mockConfig)).toBe(false);

      // 第三次：random = 0.09 < 0.1，应该上报
      Math.random = vi.fn(() => 0.09);
      expect(shouldReportMetric(metric, mockConfig)).toBe(true);

      // 第四次：random = 0.1 >= 0.1，不应该上报（边界值）
      Math.random = vi.fn(() => 0.1);
      expect(shouldReportMetric(metric, mockConfig)).toBe(false);

      // 恢复原始 Math.random
      Math.random = originalRandom;
    });
  });

  describe('reportToBaidu', () => {
    it('应该调用百度统计的 _hmt.push', async () => {
      const { reportToBaidu } = await import('@/utils/performance');
      reportToBaidu(mockMetric);

      expect(window._hmt.push).toHaveBeenCalledWith([
        '_trackEvent',
        'web_vitals',
        'LCP',
        '2500',
        'needs-improvement',
      ]);
    });

    it('_hmt 未定义时应该警告', async () => {
      vi.stubGlobal('_hmt', undefined);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { reportToBaidu } = await import('@/utils/performance');
      reportToBaidu(mockMetric);

      expect(consoleSpy).toHaveBeenCalledWith('[Web Vitals] 百度统计未加载');
    });
  });
});
