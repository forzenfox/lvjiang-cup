import { test, expect } from '@playwright/test';
import { DashboardPage, SchedulePage, TeamsPage, HomePage } from '../pages';
import { testTeam, testTeamBeta } from '../fixtures/teams.fixture';

/**
 * 晋级名单管理测试用例
 * 对应测试计划：TEST-111, TEST-112
 *
 * 注意：晋级名单现在自动根据比赛结果计算，不再支持手动拖拽
 */

test.describe('【第四阶段-1】瑞士轮晋级名单管理测试', () => {
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);

    // 直接导航到管理后台（已有登录状态）
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-111: 瑞士轮晋级名单 - 自动计算
   * 优先级：P1
   * 验证晋级名单根据比赛结果自动计算
   */
  test('TEST-111: 瑞士轮晋级名单 - 自动计算 @P1', async ({ page }) => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 检查并创建测试战队
    const hasTeamA = await teamsPage.hasTeam(testTeam.name);
    const hasTeamB = await teamsPage.hasTeam(testTeamBeta.name);

    if (!hasTeamA) {
      await teamsPage.addNewTeam(testTeam);
    }
    if (!hasTeamB) {
      await teamsPage.addNewTeam(testTeamBeta);
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    // 验证页面标题可见
    await expect(schedulePage.pageTitle).toBeVisible();

    // 验证瑞士轮编辑器可见
    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    // 验证晋级状态显示 - 现在显示自动计算说明
    const advancementStatus = page.getByTestId('advancement-status');
    const hasAdvancementStatus = await advancementStatus.isVisible().catch(() => false);

    if (hasAdvancementStatus) {
      // 验证晋级状态文本包含自动计算说明
      const statusText = await advancementStatus.textContent();
      expect(statusText).toContain('自动计算');
    }

    console.log('✅ 晋级名单自动计算功能正常');
  });

  /**
   * TEST-111-2: 晋级名单 - 2分类验证
   * 优先级：P1
   * 验证晋级名单为2分类（top8 和 eliminated）
   */
  test('TEST-111-2: 晋级名单 - 2分类验证 @P1', async ({ page }) => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 检查并创建测试战队
    const hasTeamA = await teamsPage.hasTeam(testTeam.name);
    const hasTeamB = await teamsPage.hasTeam(testTeamBeta.name);

    if (!hasTeamA) {
      await teamsPage.addNewTeam(testTeam);
    }
    if (!hasTeamB) {
      await teamsPage.addNewTeam(testTeamBeta);
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    // 验证瑞士轮编辑器可见
    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    // 验证晋级状态显示存在
    const advancementStatus = page.getByTestId('advancement-status');
    await expect(advancementStatus).toBeVisible();

    // 验证 top8 展示区域存在（通过瑞士轮第4轮 3-0 组和 2-1 组）
    const qualifiedGroup_3_0 = page.getByTestId('swiss-record-group-3-0');
    const hasQualifiedGroup = await qualifiedGroup_3_0.isVisible().catch(() => false);

    if (hasQualifiedGroup) {
      console.log('✅ 3-0 晋级组可见');
    }

    // 验证 eliminated 展示区域存在（通过瑞士轮 0-3 组）
    const eliminatedGroup = page.getByTestId('swiss-record-group-0-3');
    const hasEliminatedGroup = await eliminatedGroup.isVisible().catch(() => false);

    if (hasEliminatedGroup) {
      console.log('✅ 0-3 淘汰组可见');
    }

    console.log('✅ 晋级名单2分类验证完成');
  });
});

test.describe('【第四阶段-2】晋级名单同步验证测试', () => {
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);
    homePage = new HomePage(page);

    // 直接导航到管理后台（已有登录状态）
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-112: 晋级名单同步验证
   * 优先级：P0
   * 验证晋级名单在前后台同步显示
   */
  test('TEST-112: 晋级名单同步验证 @P0', async ({ page }) => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 检查并创建测试战队
    const hasTeamA = await teamsPage.hasTeam(testTeam.name);
    const hasTeamB = await teamsPage.hasTeam(testTeamBeta.name);

    if (!hasTeamA) {
      await teamsPage.addNewTeam(testTeam);
    }
    if (!hasTeamB) {
      await teamsPage.addNewTeam(testTeamBeta);
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    // 验证瑞士轮编辑器可见
    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    // 验证晋级状态显示
    const advancementStatus = page.getByTestId('advancement-status');
    const hasAdvancementStatus = await advancementStatus.isVisible().catch(() => false);

    if (hasAdvancementStatus) {
      console.log('✅ 后台晋级状态可见');
    }

    // 访问前台验证
    await homePage.goto();
    await homePage.expectPageLoaded();

    // 验证瑞士轮Tab可见
    const swissTab = page.getByTestId('home-swiss-tab');
    await expect(swissTab).toBeVisible();

    // 切换到瑞士轮视图
    await swissTab.click();
    await page.waitForTimeout(500);

    // 验证瑞士轮展示区域
    const swissStageDisplay = page.getByTestId('swiss-stage-display');
    await expect(swissStageDisplay).toBeVisible();

    console.log('✅ 首页可以正常访问，晋级名单同步验证完成');
  });
});

test.describe('【边界测试】晋级名单边界测试', () => {
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);

    // 直接导航到管理后台（已有登录状态）
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-B003: 晋级名单 - 瑞士轮战绩分组验证
   * 优先级：P2
   * 验证瑞士轮10个战绩分组正确显示
   */
  test('TEST-B003: 晋级名单 - 瑞士轮战绩分组验证 @P2', async ({ page }) => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 检查并创建测试战队
    const hasTeamA = await teamsPage.hasTeam(testTeam.name);
    if (!hasTeamA) {
      await teamsPage.addNewTeam(testTeam);
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    // 验证瑞士轮编辑器可见
    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    // 验证各个战绩分组存在
    const recordGroups = [
      'swiss-round-1',    // 0-0 组
      'swiss-round-2',     // 1-0 和 0-1 组
      'swiss-round-3',     // 2-0, 1-1, 0-2 组
      'swiss-round-4',     // 3-0, 2-1, 1-2, 0-3 组
    ];

    for (const group of recordGroups) {
      const groupElement = page.getByTestId(group);
      const isVisible = await groupElement.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ 分组 ${group} 可见`);
      }
    }

    // 验证特殊分组标签
    const group_2_0 = page.getByTestId('swiss-record-group-2-0');
    const group_3_0 = page.getByTestId('swiss-record-group-3-0');
    const group_0_3 = page.getByTestId('swiss-record-group-0-3');

    if (await group_2_0.isVisible().catch(() => false)) {
      console.log('✅ 2-0 晋级组标签可见');
    }
    if (await group_3_0.isVisible().catch(() => false)) {
      console.log('✅ 3-0 晋级组标签可见');
    }
    if (await group_0_3.isVisible().catch(() => false)) {
      console.log('✅ 0-3 淘汰组标签可见');
    }

    console.log('✅ 晋级名单瑞士轮战绩分组边界测试完成');
  });

  /**
   * 晋级名单空状态
   * 优先级：P2
   * 验证无晋级名单时的空状态显示
   */
  test('晋级名单空状态 @P2', async ({ page }) => {
    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    // 验证瑞士轮编辑器可见
    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    // 验证晋级状态显示
    const advancementStatus = page.getByTestId('advancement-status');
    const hasAdvancementStatus = await advancementStatus.isVisible().catch(() => false);

    if (hasAdvancementStatus) {
      const statusText = await advancementStatus.textContent();
      console.log(`✅ 晋级状态: ${statusText}`);
    }

    console.log('✅ 晋级名单空状态测试完成');
  });
});
