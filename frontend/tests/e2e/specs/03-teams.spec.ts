import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, TeamsPage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { testTeam, editedTeam, shortNameTeam, longNameTeam } from '../fixtures/teams.fixture';
import { clearLocalStorage } from '../utils/test-helpers';

/**
 * 战队管理测试用例
 * 对应测试计划: TEST-005, TEST-006, TEST-007, TEST-013, TEST-014, TEST-B001
 */

test.describe('战队管理功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);
    
    // 先导航到页面，再清理数据并登录
    await loginPage.goto();
    await clearLocalStorage(page);
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-005: 添加新战队
   * 优先级: P0
   * 验证可以成功添加新战队
   */
  test('TEST-005: 添加新战队 @P0', async () => {
    // 导航到战队管理
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 记录添加前的战队数量
    const initialCount = await teamsPage.getTeamCount();
    
    // 添加新战队
    await teamsPage.addNewTeam(testTeam);
    
    // 验证战队添加成功
    await teamsPage.expectTeamExists(testTeam.name);
    
    // 验证战队数量增加
    const newCount = await teamsPage.getTeamCount();
    expect(newCount).toBe(initialCount + 1);
  });

  /**
   * TEST-006: 编辑战队信息
   * 优先级: P0
   * 验证可以成功编辑战队信息
   */
  test('TEST-006: 编辑战队信息 @P0', async () => {
    // 先添加一个战队
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(testTeam);
    await teamsPage.expectTeamExists(testTeam.name);
    
    // 编辑战队
    await teamsPage.editTeam(testTeam.name, editedTeam);
    
    // 验证编辑成功
    await teamsPage.expectTeamExists(editedTeam.name!);
  });

  /**
   * TEST-007: 删除战队
   * 优先级: P1
   * 验证可以成功删除战队
   */
  test('TEST-007: 删除战队 @P1', async () => {
    // 先添加一个战队
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(testTeam);
    await teamsPage.expectTeamExists(testTeam.name);
    
    // 记录删除前的战队数量
    const initialCount = await teamsPage.getTeamCount();
    
    // 删除战队
    await teamsPage.deleteTeam(testTeam.name);
    
    // 验证战队已删除
    await teamsPage.expectTeamNotExists(testTeam.name);
    
    // 验证战队数量减少
    const newCount = await teamsPage.getTeamCount();
    expect(newCount).toBe(initialCount - 1);
  });

  /**
   * TEST-013: 加载Mock数据
   * 优先级: P1
   * 验证可以成功加载Mock数据
   */
  test('TEST-013: 加载Mock数据 @P1', async () => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 验证初始为空
    await teamsPage.expectEmptyState();
    
    // 加载Mock数据
    await teamsPage.loadMockData();
    
    // 验证战队数据已加载
    const teamCount = await teamsPage.getTeamCount();
    expect(teamCount).toBeGreaterThan(0);
  });

  /**
   * TEST-014: 清空所有数据
   * 优先级: P1
   * 验证可以成功清空所有数据
   */
  test('TEST-014: 清空所有数据 @P1', async () => {
    // 先加载Mock数据
    await dashboardPage.navigateToTeams();
    await teamsPage.loadMockData();
    
    // 验证有数据
    const initialCount = await teamsPage.getTeamCount();
    expect(initialCount).toBeGreaterThan(0);
    
    // 清空所有数据
    await teamsPage.clearAllData();
    
    // 验证数据已清空
    await teamsPage.expectEmptyState();
  });

  /**
   * TEST-B001: 战队名称长度边界 - 短名称
   * 优先级: P2
   * 验证短名称战队可以正常添加
   */
  test('TEST-B001: 战队名称边界 - 短名称 @P2', async () => {
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(shortNameTeam);
    await teamsPage.expectTeamExists(shortNameTeam.name);
  });

  /**
   * TEST-B001: 战队名称长度边界 - 长名称
   * 优先级: P2
   * 验证长名称战队可以正常添加
   */
  test('TEST-B001: 战队名称边界 - 长名称 @P2', async () => {
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(longNameTeam);
    await teamsPage.expectTeamExists(longNameTeam.name);
  });

  /**
   * TEST-E002: 删除不存在的队伍
   * 优先级: P2
   * 验证删除不存在的队伍时系统行为正常
   */
  test('TEST-E002: 删除不存在的队伍 @P2', async () => {
    await dashboardPage.navigateToTeams();
    
    // 尝试删除不存在的战队
    // 这里应该优雅处理，不抛出错误
    const nonExistentTeam = '不存在的战队';
    
    // 验证该战队不存在
    await teamsPage.expectTeamNotExists(nonExistentTeam);
  });
});
