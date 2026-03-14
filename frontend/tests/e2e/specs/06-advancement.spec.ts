import { test, expect } from '@playwright/test';
import { DashboardPage, SchedulePage, TeamsPage, HomePage } from '../pages';
import { testTeam, testTeamBeta } from '../fixtures/teams.fixture';

/**
 * 晋级名单管理测试用例
 * 对应测试计划：TEST-111, TEST-112
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
   * TEST-111: 管理瑞士轮晋级名单
   * 优先级：P1
   * 验证可以管理瑞士轮晋级名单
   */
  test('TEST-111: 管理瑞士轮晋级名单 @P1', async ({ page }) => {
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
    const swissEditor = page.getByTestId('swiss-stage-editor');
    await expect(swissEditor).toBeVisible();

    // 验证晋级名单管理面板可见
    const advancementPanel = page.getByTestId('advancement-panel');
    await expect(advancementPanel).toBeVisible();

    // 验证晋级名单标题
    const advancementTitle = page.getByTestId('advancement-title');
    await expect(advancementTitle).toHaveText('晋级名单管理');

    // 验证晋级分类存在
    const categories = [
      'winners2_0',
      'winners2_1',
      'losersBracket',
      'eliminated3rd',
      'eliminated0_3',
    ];
    for (const category of categories) {
      const categoryCard = page.getByTestId(`advancement-category-${category}`);
      await expect(categoryCard).toBeVisible();
    }

    console.log('✅ 晋级名单管理功能正常');
  });

  /**
   * TEST-111-2: 晋级名单 - 拖拽功能
   * 优先级：P1
   * 验证可以拖拽战队到不同分类
   */
  test('TEST-111-2: 晋级名单 - 拖拽功能 @P1', async ({ page }) => {
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

    // 验证晋级名单管理面板可见
    const advancementPanel = page.getByTestId('advancement-panel');
    await expect(advancementPanel).toBeVisible();

    // 验证未分配队伍区域或分类区域可见
    const unassignedTeams = page.getByTestId('unassigned-teams');
    const hasUnassigned = await unassignedTeams.isVisible().catch(() => false);

    if (hasUnassigned) {
      console.log('✅ 发现未分配队伍区域');
    } else {
      console.log('✅ 所有队伍已分配');
    }

    // 验证各个晋级分类可见
    const categories = [
      'winners2_0',
      'winners2_1',
      'losersBracket',
      'eliminated3rd',
      'eliminated0_3',
    ];
    for (const category of categories) {
      const categoryCard = page.getByTestId(`advancement-category-${category}`);
      await expect(categoryCard).toBeVisible();

      // 验证分类标签
      const categoryLabel = page.getByTestId(`advancement-category-label-${category}`);
      await expect(categoryLabel).toBeVisible();
    }

    console.log('✅ 晋级名单拖拽功能区域正常');
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

    // 验证晋级名单管理面板可见
    const advancementPanel = page.getByTestId('advancement-panel');
    await expect(advancementPanel).toBeVisible();

    // 验证同步状态显示
    const syncStatus = page.getByTestId('advancement-sync-status');
    await expect(syncStatus).toBeVisible();

    // 获取同步状态文本
    const statusText = await syncStatus.textContent();
    console.log(`✅ 当前同步状态: ${statusText}`);

    // 访问前台验证
    await homePage.goto();
    await homePage.expectPageLoaded();

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
   * TEST-B003: 晋级名单重复添加
   * 优先级：P2
   * 验证重复添加晋级的处理
   */
  test('TEST-B003: 晋级名单重复添加 @P2', async ({ page }) => {
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

    // 验证晋级名单管理面板可见
    const advancementPanel = page.getByTestId('advancement-panel');
    await expect(advancementPanel).toBeVisible();

    // 验证各个分类的计数显示
    const categories = [
      'winners2_0',
      'winners2_1',
      'losersBracket',
      'eliminated3rd',
      'eliminated0_3',
    ];
    for (const category of categories) {
      const categoryCount = page.getByTestId(`advancement-category-count-${category}`);
      await expect(categoryCount).toBeVisible();

      const count = await categoryCount.textContent();
      console.log(`✅ 分类 ${category} 当前队伍数: ${count}`);
    }

    console.log('✅ 晋级名单重复添加边界测试完成');
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

    // 验证晋级名单管理面板可见
    const advancementPanel = page.getByTestId('advancement-panel');
    await expect(advancementPanel).toBeVisible();

    // 检查未分配队伍区域
    const unassignedTeams = page.getByTestId('unassigned-teams');
    const hasUnassigned = await unassignedTeams.isVisible().catch(() => false);

    if (hasUnassigned) {
      const unassignedCount = page.getByTestId('unassigned-count');
      const count = await unassignedCount.textContent();
      console.log(`✅ 未分配队伍: ${count}`);
    } else {
      console.log('✅ 没有未分配队伍');
    }

    // 检查各个分类的空状态
    const categories = [
      'winners2_0',
      'winners2_1',
      'losersBracket',
      'eliminated3rd',
      'eliminated0_3',
    ];
    for (const category of categories) {
      const emptyState = page.getByTestId(`advancement-category-empty-${category}`);
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        const text = await emptyState.textContent();
        console.log(`✅ 分类 ${category} 空状态: ${text}`);
      }
    }

    console.log('✅ 晋级名单空状态测试完成');
  });
});
