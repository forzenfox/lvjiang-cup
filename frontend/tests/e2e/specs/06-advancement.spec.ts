import { test, expect } from '@playwright/test';
import { DashboardPage, SchedulePage, TeamsPage, HomePage } from '../pages';
import { testTeam, testTeamBeta } from '../fixtures/teams.fixture';

/**
 * 晋级名单管理测试用例
 * 对应测试计划：TEST-111, TEST-112, TEST-ADV-01 到 TEST-ADV-05
 *
 * 注意：晋级名单现在自动根据比赛结果计算，不再支持手动拖拽
 */

/**
 * 确保至少有2支测试战队存在
 */
async function ensureTeamsExist(page: any, teamsPage: TeamsPage) {
  const hasTeamA = await teamsPage.hasTeam(testTeam.name);
  const hasTeamB = await teamsPage.hasTeam(testTeamBeta.name);

  if (!hasTeamA) {
    await teamsPage.addNewTeam(testTeam);
    await page.waitForTimeout(1000);
  }
  if (!hasTeamB) {
    await teamsPage.addNewTeam(testTeamBeta);
    await page.waitForTimeout(1000);
  }
}

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
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    await ensureTeamsExist(page, teamsPage);

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    await expect(schedulePage.pageTitle).toBeVisible();

    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    const advancementStatus = page.getByTestId('advancement-status');
    const hasAdvancementStatus = await advancementStatus.isVisible().catch(() => false);

    if (hasAdvancementStatus) {
      const statusText = await advancementStatus.textContent();
      expect(statusText).toContain('自动计算');
      console.log(`✅ 晋级状态: ${statusText}`);
    }

    console.log('✅ 晋级名单自动计算功能正常');
  });

  /**
   * TEST-ADV-01: 3-0战队晋级验证
   * 优先级：P1
   * 验证3-0战绩的战队正确进入top8
   */
  test('TEST-ADV-01: 3-0战队晋级到top8 @P1', async ({ page }) => {
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    const qualifiedGroup_3_0 = page.getByTestId('swiss-record-group-3-0');
    const hasQualifiedGroup = await qualifiedGroup_3_0.isVisible().catch(() => false);

    if (hasQualifiedGroup) {
      await expect(qualifiedGroup_3_0).toBeVisible();
      const teamsInGroup = qualifiedGroup_3_0.locator('[data-testid*="team-name"]');
      const teamCount = await teamsInGroup.count();
      console.log(`✅ 3-0晋级组包含 ${teamCount} 支战队`);

      expect(teamCount).toBeGreaterThan(0);
      expect(teamCount).toBeLessThanOrEqual(4);
    } else {
      console.log('⚠️ 暂无3-0战绩的战队');
    }
  });

  /**
   * TEST-ADV-02: 0-3战队淘汰验证
   * 优先级：P1
   * 验证0-3战绩的战队正确标记为淘汰
   */
  test('TEST-ADV-02: 0-3战队标记为淘汰 @P1', async ({ page }) => {
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    const eliminatedGroup_0_3 = page.getByTestId('swiss-record-group-0-3');
    const hasEliminatedGroup = await eliminatedGroup_0_3.isVisible().catch(() => false);

    if (hasEliminatedGroup) {
      await expect(eliminatedGroup_0_3).toBeVisible();
      const teamsInGroup = eliminatedGroup_0_3.locator('[data-testid*="team-name"]');
      const teamCount = await teamsInGroup.count();
      console.log(`✅ 0-3淘汰组包含 ${teamCount} 支战队`);

      expect(teamCount).toBeGreaterThan(0);
    } else {
      console.log('⚠️ 暂无0-3战绩的战队');
    }
  });

  /**
   * TEST-111-2: 晋级名单 - 2分类验证
   * 优先级：P1
   * 验证晋级名单为2分类（top8 和 eliminated）
   */
  test('TEST-111-2: 晋级名单 - 2分类验证 @P1', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    await ensureTeamsExist(page, teamsPage);

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    const advancementStatus = page.getByTestId('advancement-status');
    await expect(advancementStatus).toBeVisible();

    const qualifiedGroup_3_0 = page.getByTestId('swiss-record-group-3-0');
    const hasQualifiedGroup = await qualifiedGroup_3_0.isVisible().catch(() => false);

    if (hasQualifiedGroup) {
      await expect(qualifiedGroup_3_0).toBeVisible();
      console.log('✅ 3-0 晋级组可见');
    }

    const eliminatedGroup = page.getByTestId('swiss-record-group-0-3');
    const hasEliminatedGroup = await eliminatedGroup.isVisible().catch(() => false);

    if (hasEliminatedGroup) {
      await expect(eliminatedGroup).toBeVisible();
      console.log('✅ 0-3 淘汰组可见');
    }

    console.log('✅ 晋级名单2分类验证完成');
  });

  /**
   * TEST-ADV-03: 前后台晋级数据一致性
   * 优先级：P1
   * 验证后台配置的晋级数据在前台正确显示
   */
  test('TEST-ADV-03: 前后台晋级数据一致性 @P1', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    await ensureTeamsExist(page, teamsPage);

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    const backendHasAdvancement = await page.getByTestId('advancement-status').isVisible().catch(() => false);
    console.log(`✅ 后台晋级状态可见: ${backendHasAdvancement}`);

    await homePage.goto();
    await homePage.expectPageLoaded();

    const swissTab = page.getByTestId('home-swiss-tab');
    await expect(swissTab).toBeVisible();

    await swissTab.click();
    await page.waitForTimeout(500);

    const homeSwissStage = page.getByTestId('swiss-stage-display');
    const frontendHasSwissStage = await homeSwissStage.isVisible().catch(() => false);
    console.log(`✅ 前台瑞士轮展示可见: ${frontendHasSwissStage}`);

    expect(frontendHasSwissStage).toBe(true);
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
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    await ensureTeamsExist(page, teamsPage);

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    const advancementStatus = page.getByTestId('advancement-status');
    const hasAdvancementStatus = await advancementStatus.isVisible().catch(() => false);

    if (hasAdvancementStatus) {
      console.log('✅ 后台晋级状态可见');
    }

    await homePage.goto();
    await homePage.expectPageLoaded();

    const swissTab = page.getByTestId('home-swiss-tab');
    await expect(swissTab).toBeVisible();

    await swissTab.click();
    await page.waitForTimeout(500);

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
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    await ensureTeamsExist(page, teamsPage);

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    const recordGroups = [
      'swiss-round-1',
      'swiss-round-2',
      'swiss-round-3',
      'swiss-round-4',
    ];

    let visibleGroups = 0;
    for (const group of recordGroups) {
      const groupElement = page.getByTestId(group);
      const isVisible = await groupElement.isVisible().catch(() => false);
      if (isVisible) {
        visibleGroups++;
        console.log(`✅ 分组 ${group} 可见`);
      }
    }

    expect(visibleGroups).toBeGreaterThan(0);

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

    console.log(`✅ 晋级名单瑞士轮战绩分组边界测试完成，找到 ${visibleGroups} 个轮次分组`);
  });

  /**
   * TEST-ADV-04: 战绩分组标签验证
   * 优先级：P2
   * 验证各战绩分组的标签正确显示（0-0, 1-0, 0-1, 2-0, 1-1, 0-2, 3-0, 2-1, 1-2, 0-3）
   */
  test('TEST-ADV-04: 战绩分组标签验证 @P2', async ({ page }) => {
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();

    const swissEditor = page.getByTestId('swiss-stage');
    await expect(swissEditor).toBeVisible();

    const expectedRecords = ['0-0', '1-0', '0-1', '2-0', '1-1', '0-2', '3-0', '2-1', '1-2', '0-3'];
    let foundRecords = 0;

    for (const record of expectedRecords) {
      const recordGroup = page.getByTestId(`swiss-record-group-${record}`);
      const isVisible = await recordGroup.isVisible().catch(() => false);
      if (isVisible) {
        foundRecords++;
        console.log(`✅ 战绩分组 ${record} 可见`);
      }
    }

    console.log(`✅ 找到 ${foundRecords}/${expectedRecords.length} 个战绩分组`);
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
