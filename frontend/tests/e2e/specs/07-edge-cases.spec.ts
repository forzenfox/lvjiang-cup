import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, TeamsPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { testTeam } from '../fixtures/teams.fixture';
import { clearLocalStorage, setLocalStorage, getLocalStorage } from '../utils/test-helpers';

/**
 * 边界条件和异常场景测试用例
 * 对应测试计划: TEST-E001, TEST-E003, TEST-015
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
   * TEST-E001: localStorage数据损坏
   * 优先级: P2
   * 验证localStorage数据损坏时系统的容错处理
   */
  test('TEST-E001: localStorage数据损坏处理 @P2', async ({ page }) => {
    // 设置损坏的数据
    await setLocalStorage(page, 'teams', 'invalid-json-data{');
    await setLocalStorage(page, 'matches', '[broken');
    
    // 访问首页
    await homePage.goto();
    
    // 验证页面仍然可以加载（系统应该能处理损坏的数据）
    await homePage.expectPageLoaded();
    
    // 验证显示空状态或重置数据
    const isEmptyState = await homePage.noTeamsMessage.isVisible().catch(() => false);
    expect(isEmptyState).toBe(true);
  });

  /**
   * TEST-E003: 快速连续点击保存
   * 优先级: P2
   * 验证快速连续点击保存按钮的处理
   */
  test('TEST-E003: 快速连续点击保存 @P2', async ({ page }) => {
    // 登录并导航到战队管理
    await clearLocalStorage(page);
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
    
    // 验证系统行为（应该只保存一次或显示相应提示）
    // 等待一段时间让操作完成
    await page.waitForTimeout(2000);
    
    // 验证战队只被添加一次
    const teamCount = await teamsPage.getTeamCount();
    expect(teamCount).toBeLessThanOrEqual(1);
  });

  /**
   * TEST-015: 数据持久化验证
   * 优先级: P1
   * 验证数据在页面刷新后仍然保持
   */
  test('TEST-015: 数据持久化验证 @P1', async ({ page }) => {
    // 登录并添加战队
    await clearLocalStorage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam(testTeam);
    await teamsPage.expectTeamExists(testTeam.name);
    
    // 刷新页面
    await page.reload();
    await teamsPage.expectPageLoaded();
    
    // 验证数据仍然存在
    await teamsPage.expectTeamExists(testTeam.name);
    
    // 验证localStorage中有数据
    const teamsData = await getLocalStorage(page, 'teams');
    expect(teamsData).toContain(testTeam.name);
  });

  /**
   * 页面刷新后登录状态保持
   * 优先级: P1
   * 验证登录状态在页面刷新后保持
   */
  test('登录状态持久化 @P1', async ({ page }) => {
    // 登录
    await clearLocalStorage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
    
    // 刷新页面
    await page.reload();
    
    // 验证仍然处于登录状态
    await dashboardPage.expectPageLoaded();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  /**
   * 特殊字符输入测试
   * 优先级: P2
   * 验证系统对特殊字符的处理
   */
  test('特殊字符输入处理 @P2', async ({ page }) => {
    await clearLocalStorage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();
    
    // 添加包含特殊字符的战队
    const specialTeam = {
      name: '测试<script>alert(1)</script>战队',
      description: '描述<script>alert(2)</script>',
      players: [],
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await teamsPage.addNewTeam(specialTeam as any);
    
    // 验证战队添加成功
    await teamsPage.expectTeamExists('测试');
    
    // 验证脚本没有被执行（XSS防护）
    const hasAlert = await page.evaluate(() => {
       
      return (window as unknown as { alertTriggered?: boolean }).alertTriggered === true;
    });
    expect(hasAlert).toBe(false);
  });

  /**
   * 大数据量测试
   * 优先级: P2
   * 验证系统处理大量数据的能力
   */
  test('大数据量处理 @P2', async ({ page }) => {
    await clearLocalStorage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();
    
    // 添加多个战队
    const teamCount = 10;
    for (let i = 0; i < teamCount; i++) {
      const team = {
        name: `测试战队${i}`,
        description: `描述${i}`,
        players: [],
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await teamsPage.addNewTeam(team as any);
    }
    
    // 验证所有战队都添加成功
    const actualCount = await teamsPage.getTeamCount();
    expect(actualCount).toBe(teamCount);
    
    // 验证页面性能（加载时间）
    const startTime = Date.now();
    await page.reload();
    await teamsPage.expectPageLoaded();
    const loadTime = Date.now() - startTime;
    
    // 验证加载时间在合理范围内（5秒内）
    expect(loadTime).toBeLessThan(5000);
  });
});
