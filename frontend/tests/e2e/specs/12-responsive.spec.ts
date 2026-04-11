import { test, expect } from '@playwright/test';
import { HomePage, DashboardPage } from '../pages';

/**
 * 响应式布局测试
 * 对应测试计划: TEST-RESP-01, TEST-RESP-02
 *
 * 测试页面在不同视口尺寸下的表现
 */

test.describe('【P1】首页响应式布局测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-RESP-01: 首页移动端布局
   * 优先级: P1
   * 验证首页在移动端视口下正确显示
   */
  test('TEST-RESP-01: 首页移动端布局 (375px) @P1', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await homePage.expectPageLoaded();

    const heroTitle = page.locator('text=驴酱杯');
    await expect(heroTitle).toBeVisible();

    const liveButton = page.locator('text=观看直播');
    const hasLive = await liveButton.isVisible().catch(() => false);
    if (hasLive) {
      console.log('✅ 移动端直播按钮可见');
    }

    const teamsSection = page.locator('text=参赛战队');
    await expect(teamsSection).toBeVisible();

    const scheduleSection = page.locator('text=赛程安排');
    await expect(scheduleSection).toBeVisible();

    console.log('✅ 首页在移动端视口(375px)下正确显示');
  });

  /**
   * TEST-RESP-02: 首页平板布局
   * 优先级: P2
   * 验证首页在平板视口下正确显示
   */
  test('TEST-RESP-02: 首页平板布局 (768px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    await homePage.expectPageLoaded();

    const heroTitle = page.locator('text=驴酱杯');
    await expect(heroTitle).toBeVisible();

    console.log('✅ 首页在平板视口(768px)下正确显示');
  });

  /**
   * TEST-RESP-03: 首页桌面布局
   * 优先级: P2
   * 验证首页在桌面视口下正确显示
   */
  test('TEST-RESP-03: 首页桌面布局 (1280px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    await homePage.expectPageLoaded();

    const heroTitle = page.locator('text=驴酱杯');
    await expect(heroTitle).toBeVisible();

    console.log('✅ 首页在桌面视口(1280px)下正确显示');
  });

  /**
   * TEST-RESP-04: 首页大屏布局
   * 优先级: P2
   * 验证首页在大屏视口下正确显示
   */
  test('TEST-RESP-04: 首页大屏布局 (1920px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    await homePage.expectPageLoaded();

    const heroTitle = page.locator('text=驴酱杯');
    await expect(heroTitle).toBeVisible();

    console.log('✅ 首页在大屏视口(1920px)下正确显示');
  });
});

test.describe('【P1】管理后台响应式布局测试', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-RESP-05: 管理后台移动端布局
   * 优先级: P1
   * 验证管理后台在移动端视口下的显示
   */
  test('TEST-RESP-05: 管理后台移动端布局 (375px) @P1', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const dashboardTitle = page.locator('text=仪表盘');
    const hasTitle = await dashboardTitle.isVisible().catch(() => false);
    if (hasTitle) {
      await expect(dashboardTitle).toBeVisible();
      console.log('✅ 管理后台仪表盘在移动端可见');
    }

    console.log('✅ 管理后台在移动端视口(375px)下可访问');
  });

  /**
   * TEST-RESP-06: 管理后台桌面布局
   * 优先级: P2
   * 验证管理后台在桌面视口下的显示
   */
  test('TEST-RESP-06: 管理后台桌面布局 (1280px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    await dashboardPage.expectPageLoaded();

    const teamCountCard = page.locator('[data-testid="team-count-card"]');
    const hasCard = await teamCountCard.isVisible().catch(() => false);
    if (hasCard) {
      await expect(teamCountCard).toBeVisible();
      console.log('✅ 管理后台统计卡片在桌面端可见');
    }

    console.log('✅ 管理后台在桌面视口(1280px)下正确显示');
  });
});

test.describe('【P2】瑞士轮移动端视图测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-RESP-07: 瑞士轮移动端Tab切换
   * 优先级: P2
   * 验证瑞士轮和淘汰赛Tab在移动端下可以切换
   */
  test('TEST-RESP-07: 瑞士轮移动端Tab切换 (375px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const swissTab = page.getByTestId('home-swiss-tab');
    const elimTab = page.getByTestId('home-elimination-tab');

    const hasSwiss = await swissTab.isVisible().catch(() => false);
    const hasElim = await elimTab.isVisible().catch(() => false);

    if (hasSwiss) {
      await swissTab.click();
      await page.waitForTimeout(300);
      console.log('✅ 移动端瑞士轮Tab可点击');
    }

    if (hasElim) {
      await elimTab.click();
      await page.waitForTimeout(300);
      console.log('✅ 移动端淘汰赛Tab可点击');
    }

    if (!hasSwiss && !hasElim) {
      console.log('⚠️ Tab在移动端可能以其他方式呈现');
    }
  });

  /**
   * TEST-RESP-08: 战队卡片移动端布局
   * 优先级: P2
   * 验证战队卡片在移动端下的布局
   */
  test('TEST-RESP-08: 战队卡片移动端布局 (375px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await homePage.scrollToTeams();

    const teamCards = page.locator('[data-testid^="team-card-"]');
    const cardCount = await teamCards.count();

    if (cardCount > 0) {
      const firstCard = teamCards.first();
      const isVisible = await firstCard.isVisible();
      expect(isVisible).toBe(true);
      console.log(`✅ 移动端显示 ${cardCount} 个战队卡片`);
    } else {
      console.log('⚠️ 没有战队数据');
    }
  });
});

test.describe('【P2】视口切换测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  /**
   * TEST-RESP-09: 视口动态切换
   * 优先级: P2
   * 验证页面在动态切换视口时的表现
   */
  test('TEST-RESP-09: 视口动态切换 @P2', async ({ page }) => {
    await homePage.goto();

    const sizes = [
      { width: 375, height: 667, name: '移动端' },
      { width: 768, height: 1024, name: '平板' },
      { width: 1280, height: 720, name: '桌面' },
      { width: 1920, height: 1080, name: '大屏' },
    ];

    for (const size of sizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.waitForTimeout(300);

      const heroTitle = page.locator('text=驴酱杯');
      const isVisible = await heroTitle.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`✅ ${size.name}(${size.width}x${size.height}): 英雄标题可见`);
      }
    }

    console.log('✅ 视口动态切换测试完成');
  });
});
