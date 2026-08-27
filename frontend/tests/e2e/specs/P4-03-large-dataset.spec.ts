import { test, expect } from '@playwright/test';
import { HomePage, DashboardPage, TeamsPage } from '../pages';

/**
 * 大数据集性能测试 - Task 4.3
 * 测试在大数据量场景下的页面加载性能
 */

test.describe('【性能测试】大数据集加载性能', () => {
  test('TEST-PERF-01: 大数据量战队列表渲染性能', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const teamsPage = new TeamsPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    const startTime = Date.now();

    await dashboardPage.navigateToTeams();
    await teamsPage.waitForPageLoad();

    const teamCount = await teamsPage.getTeamCount();
    console.log(`✅ 战队列表加载完成，共加载 ${teamCount} 支战队`);

    const elapsed = Date.now() - startTime;
    console.log(`⏱️ 战队列表加载耗时: ${elapsed}ms`);

    expect(elapsed).toBeLessThan(10000);
    console.log('✅ TEST-PERF-01: 战队列表渲染性能通过');
  });

  test('TEST-PERF-02: 首页大数据量加载性能', async ({ page }) => {
    const homePage = new HomePage(page);

    const startTime = Date.now();

    await homePage.goto();
    await homePage.expectPageLoaded();

    const teamCount = await homePage.getTeamCount();
    console.log(`✅ 首页加载完成，共加载 ${teamCount} 支战队`);

    const elapsed = Date.now() - startTime;
    console.log(`⏱️ 首页加载耗时: ${elapsed}ms`);

    // 首页加载包含退出 StartBox 封面动画（900ms）与懒加载滚动，CI 环境下放宽阈值以兼容波动
    expect(elapsed).toBeLessThan(15000);
    console.log('✅ TEST-PERF-02: 首页加载性能通过');
  });
});
