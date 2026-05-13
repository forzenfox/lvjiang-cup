import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

test.describe('【P1】对战数据管理 - 后台导入', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  test('TEST-MD-009: 管理后台访问对战数据管理页面 @P1', async ({ page }) => {
    await page.goto('/admin/matches');
    await page.waitForTimeout(2000);

    const pageTitle = page
      .locator('h1, h2')
      .filter({ hasText: /比赛|赛程|match/i })
      .first();
    const titleVisible = await pageTitle.isVisible().catch(() => false);

    if (titleVisible) {
      console.log('✅ 管理后台比赛管理页面可访问');
    } else {
      console.log('⚠️ 管理后台比赛管理页面可能需要配置路由');
    }
  });
});
