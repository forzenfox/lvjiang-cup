import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

/**
 * 管理仪表盘功能测试
 * 对应测试计划: TEST-102
 * 
 * 测试依赖关系:
 * - TEST-102: 依赖 TEST-101 (登录，已通过全局设置完成)
 */

test.describe('【第二阶段-2】管理仪表盘功能测试', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    
    // 直接导航到管理后台（已有登录状态）
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-102: 查看管理仪表盘 (US-102)
   * 优先级: P0
   * 验证仪表盘显示系统概览
   * 前置条件: TEST-101 登录成功（已通过全局设置完成）
   */
  test('TEST-102: 查看管理仪表盘 @P0', async ({ page }) => {
    // 验证统计卡片显示
    await expect(dashboardPage.teamCountCard).toBeVisible();
    await expect(dashboardPage.matchCountCard).toBeVisible();
    await expect(dashboardPage.streamStatusCard).toBeVisible();
    await expect(dashboardPage.systemStatusCard).toBeVisible();

    // 验证刷新统计按钮
    await expect(page.getByRole('button', { name: '刷新统计' })).toBeVisible();

    // 验证快捷入口到各管理模块
    await expect(page.getByRole('heading', { name: '直播管理' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '战队管理' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '赛程管理' })).toBeVisible();

    // 验证导航菜单
    await expect(page.getByRole('link', { name: '战队管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: '赛程管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: '直播配置' })).toBeVisible();
  });
});
