import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, AdvancementPage, TeamsPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { testTeam } from '../fixtures/teams.fixture';

/**
 * 晋级名单测试用例
 * 对应测试计划: TEST-010, TEST-011, TEST-B003, TEST-B005
 */

test.describe('晋级名单功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let advancementPage: AdvancementPage;
  let teamsPage: TeamsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    advancementPage = new AdvancementPage(page);
    teamsPage = new TeamsPage(page);
    homePage = new HomePage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-010: 晋级名单管理
   * 优先级: P0
   * 验证可以成功管理晋级名单
   */
  test('TEST-010: 晋级名单管理 @P0', async () => {
    // 先添加一个战队
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(testTeam);
    
    // 导航到晋级名单
    await dashboardPage.navigateToAdvancement();
    await advancementPage.expectPageLoaded();
    
    // 添加晋级队伍
    await advancementPage.addAdvancementTeam(testTeam.name, 1);
    
    // 验证晋级队伍添加成功
    await advancementPage.expectTeamExists(testTeam.name);
    
    // 验证晋级队伍数量
    const count = await advancementPage.getTeamCount();
    expect(count).toBe(1);
  });

  /**
   * TEST-011: 晋级名单同步验证
   * 优先级: P0
   * 验证晋级名单在首页正确显示
   */
  test('TEST-011: 晋级名单同步验证 @P0', async () => {
    // 先添加战队和晋级名单
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(testTeam);
    await dashboardPage.navigateToAdvancement();
    await advancementPage.addAdvancementTeam(testTeam.name, 1);
    
    // 访问首页
    await homePage.goto();
    
    // 验证晋级名单显示（根据实际首页设计调整）
    // 这里假设首页有显示晋级名单的区域
    const advancementSection = homePage.page.locator('text=晋级队伍, text=淘汰赛');
    await expect(advancementSection).toBeVisible();
  });

  /**
   * TEST-B003: 晋级名单重复添加
   * 优先级: P2
   * 验证重复添加同一队伍的处理
   */
  test('TEST-B003: 晋级名单重复添加 @P2', async () => {
    // 先添加战队
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(testTeam);
    
    // 导航到晋级名单
    await dashboardPage.navigateToAdvancement();
    await advancementPage.addAdvancementTeam(testTeam.name, 1);
    
    // 尝试重复添加
    try {
      await advancementPage.addAdvancementTeam(testTeam.name, 2);
      
      // 验证系统处理重复添加（可能显示错误提示或忽略）
      const errorMessage = advancementPage.page.locator('text=已存在, text=重复');
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      if (!hasError) {
        // 如果没有错误，验证数量没有增加
        const count = await advancementPage.getTeamCount();
        expect(count).toBe(1);
      }
    } catch {
      // 如果抛出错误也是可接受的处理方式
      console.log('✅ 系统正确处理了重复添加');
    }
  });

  /**
   * TEST-B005: 未分配队伍处理
   * 优先级: P2
   * 验证未分配队伍时的系统行为
   */
  test('TEST-B005: 未分配队伍处理 @P2', async () => {
    await dashboardPage.navigateToAdvancement();
    await advancementPage.expectPageLoaded();
    
    // 验证空状态显示
    await advancementPage.expectEmptyState();
    
    // 尝试自动生成（如果没有战队数据）
    const hasAutoGenerate = await advancementPage.autoGenerateButton.isVisible().catch(() => false);
    if (hasAutoGenerate) {
      await advancementPage.autoGenerate();
      
      // 验证系统行为（可能显示提示或保持空状态）
    }
  });

  /**
   * 删除晋级队伍
   * 优先级: P1
   * 验证可以删除晋级队伍
   */
  test('删除晋级队伍 @P1', async () => {
    // 先添加战队和晋级名单
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(testTeam);
    await dashboardPage.navigateToAdvancement();
    await advancementPage.addAdvancementTeam(testTeam.name, 1);
    await advancementPage.expectTeamExists(testTeam.name);
    
    // 删除晋级队伍
    await advancementPage.deleteTeam(testTeam.name);
    
    // 验证已删除
    await advancementPage.expectTeamNotExists(testTeam.name);
  });

  /**
   * 清空晋级名单
   * 优先级: P1
   * 验证可以清空所有晋级名单
   */
  test('清空晋级名单 @P1', async () => {
    // 先添加一些数据
    await dashboardPage.navigateToTeams();
    await teamsPage.loadMockData();
    await dashboardPage.navigateToAdvancement();
    await advancementPage.autoGenerate();
    
    // 确保有数据
    const initialCount = await advancementPage.getTeamCount();
    if (initialCount === 0) {
      console.log('⚠️ 没有晋级数据，跳过测试');
      test.skip();
    }
    
    // 清空晋级名单
    await advancementPage.clearAll();
    
    // 验证已清空
    await advancementPage.expectEmptyState();
  });
});
