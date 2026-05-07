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

    await expect(page).toHaveURL(/.*localhost:5173\/?$/, { timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  /**
   * TEST-RESP-02: 首页平板布局
   * 优先级: P2
   * 验证首页在平板视口下正确显示
   */
  test('TEST-RESP-02: 首页平板布局 (768px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    const heroTitle = page.locator('text=驴酱杯').first();
    await expect(heroTitle).toBeVisible({ timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  /**
   * TEST-RESP-03: 首页桌面布局
   * 优先级: P2
   * 验证首页在桌面视口下正确显示
   */
  test('TEST-RESP-03: 首页桌面布局 (1280px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    const heroTitle = page.locator('text=驴酱杯').first();
    await expect(heroTitle).toBeVisible({ timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  /**
   * TEST-RESP-04: 首页大屏布局
   * 优先级: P2
   * 验证首页在大屏视口下正确显示
   */
  test('TEST-RESP-04: 首页大屏布局 (1920px) @P2', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    const heroTitle = page.locator('text=驴酱杯').first();
    await expect(heroTitle).toBeVisible({ timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});

test.describe('【P1】管理后台响应式布局测试', () => {
  let dashboardPage: DashboardPage;

  test('TEST-RESP-05: 管理后台移动端布局 (375px) @P1', async ({ page }) => {
    test.skip(true, '需要后端服务和管理员认证');

    dashboardPage = new DashboardPage(page);
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const dashboardTitle = page.locator('text=仪表盘');
    await expect(dashboardTitle).toBeVisible({ timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  /**
   * TEST-RESP-06: 管理后台桌面布局
   * 优先级: P2
   * 验证管理后台在桌面视口下的显示
   */
  test('TEST-RESP-06: 管理后台桌面布局 (1280px) @P2', async ({ page }) => {
    test.skip(true, '需要后端服务和管理员认证');

    dashboardPage = new DashboardPage(page);
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    await dashboardPage.expectPageLoaded();

    const teamCountCard = page.locator('[data-testid="team-count-card"]');
    await expect(teamCountCard).toBeVisible({ timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
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
    test.skip(true, '需要后端服务加载赛程数据');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    const swissTab = page.getByTestId('home-swiss-tab');
    const elimTab = page.getByTestId('home-elimination-tab');

    await expect(swissTab).toBeVisible({ timeout: 5000 });
    await swissTab.click();
    await page.waitForTimeout(300);

    await expect(elimTab).toBeVisible({ timeout: 5000 });
    await elimTab.click();
    await page.waitForTimeout(300);
    await expect(elimTab).toBeVisible({ timeout: 5000 });
  });

  /**
   * TEST-RESP-08: 战队卡片移动端布局
   * 优先级: P2
   * 验证战队卡片在移动端下的布局
   */
  test('TEST-RESP-08: 战队卡片移动端布局 (375px) @P2', async ({ page }) => {
    test.skip(true, '需要后端服务加载战队数据');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await homePage.scrollToTeams();

    const teamCards = page.locator('[data-testid^="team-card-"]');
    await expect(teamCards.first()).toBeVisible({ timeout: 5000 });

    const cardCount = await teamCards.count();
    expect(cardCount).toBeGreaterThan(0);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
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

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    }
  });
});
