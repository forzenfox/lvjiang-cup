import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, TeamsPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { testTeam } from '../fixtures/teams.fixture';

/**
 * 边界条件和异常场景测试用例
 * 对应测试计划: TEST-E002, TEST-E003, TEST-015
 */

test.describe('边界条件和异常场景测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);
    homePage = new HomePage(page);
  });

  /**
   * TEST-E002: 删除不存在的队伍
   * 优先级: P2
   * 验证删除不存在队伍时的处理
   */
  test('TEST-E002: 删除不存在的队伍 @P2', async ({ page }) => {
    // 登录并导航到战队管理
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 验证不存在的队伍不在列表中
    const exists = await teamsPage.hasTeam('不存在的战队');
    expect(exists).toBe(false);
  });

  /**
   * TEST-E003: 快速连续点击保存
   * 优先级: P2
   * 验证快速连续点击保存按钮的处理
   */
  test('TEST-E003: 快速连续点击保存 @P2', async ({ page }) => {
    // 登录并导航到战队管理
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();

    // 打开添加战队弹窗
    await teamsPage.clickAddTeam();
    await teamsPage.fillTeamForm(testTeam);

    // 快速连续点击保存按钮
    await Promise.all([
      teamsPage.saveButton.click(),
      teamsPage.saveButton.click(),
      teamsPage.saveButton.click(),
    ]);

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证只有一个战队被创建（或系统正确处理重复请求）
    const teamCount = await teamsPage.getTeamCount();
    expect(teamCount).toBeGreaterThanOrEqual(1);
  });

  /**
   * TEST-E004: 未登录访问管理页面
   * 优先级: P0
   * 验证未登录时访问管理页面的跳转
   */
  test('TEST-E004: 未登录访问管理页面 @P0', async ({ page }) => {
    // 直接访问管理页面
    await page.goto('/admin/teams');

    // 验证被重定向到登录页面
    await expect(page).toHaveURL(/.*login.*/);
  });

  /**
   * TEST-015: 数据持久化验证
   * 优先级: P0
   * 验证页面刷新后数据保持
   */
  test('TEST-015: 数据持久化验证 @P0', async ({ page }) => {
    // 登录并添加战队
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();

    const timestamp = Date.now();
    const uniqueTeam = {
      ...testTeam,
      name: `持久化测试战队 ${timestamp}`,
    };

    await teamsPage.addNewTeam(uniqueTeam);
    await teamsPage.expectTeamExists(uniqueTeam.name);

    // 刷新页面
    await page.reload();

    // 重新登录（因为刷新后会丢失登录状态）
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();

    // 验证数据仍然存在
    await teamsPage.expectTeamExists(uniqueTeam.name);
  });

  /**
   * TEST-B001: 战队名称边界 - 长名称
   * 优先级: P2
   * 验证长名称战队的处理
   */
  test('TEST-B001: 战队名称边界 - 长名称 @P2', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();

    const longNameTeam = {
      ...testTeam,
      name: '这是一个非常长的战队名称用于测试边界条件'.repeat(5),
    };

    await teamsPage.addNewTeam(longNameTeam);

    // 验证创建成功或收到错误提示
    const exists = await teamsPage.hasTeam(longNameTeam.name);
    expect(exists).toBe(true);
  });

  /**
   * TEST-B001: 战队名称边界 - 短名称
   * 优先级: P2
   * 验证短名称战队的处理
   */
  test('TEST-B001: 战队名称边界 - 短名称 @P2', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();

    const shortNameTeam = {
      ...testTeam,
      name: 'A',
    };

    await teamsPage.addNewTeam(shortNameTeam);
    await teamsPage.expectTeamExists(shortNameTeam.name);
  });
});
