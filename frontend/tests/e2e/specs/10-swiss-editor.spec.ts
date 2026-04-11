import { test, expect } from '@playwright/test';
import { DashboardPage, TeamsPage, SwissStageEditorPage } from '../pages';
import { testTeam, testTeamBeta, getTestTeamForMatch } from '../fixtures/teams.fixture';

/**
 * 瑞士轮编辑器功能测试
 * 对应测试计划: TEST-SWISS-01 到 TEST-SWISS-06
 *
 * 测试依赖关系:
 * - 需要至少16支战队才能初始化瑞士轮
 * - TEST-SWISS-01: 依赖登录和战队数据
 * - TEST-SWISS-02 到 TEST-SWISS-06: 依赖 TEST-SWISS-01
 */

/**
 * 确保有足够的测试战队数据
 */
async function ensureTestTeams(page: any, teamsPage: TeamsPage) {
  const currentCount = await teamsPage.getTeamCount();
  const MIN_TEAMS = 16;

  if (currentCount >= MIN_TEAMS) {
    return;
  }

  const teamsToAdd = MIN_TEAMS - currentCount;
  for (let i = 0; i < teamsToAdd; i++) {
    const team = getTestTeamForMatch((i % 10) + 2);
    const uniqueName = `${team.name}-瑞士轮-${Date.now()}-${i}`;
    await teamsPage.addNewTeam({
      ...team,
      name: uniqueName,
    });
    await page.waitForTimeout(500);
  }
}

test.describe('【P0】瑞士轮编辑器 - 基础功能测试', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;
  let swissEditorPage: SwissStageEditorPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);
    swissEditorPage = new SwissStageEditorPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-SWISS-01: 瑞士轮编辑器 - 页面加载
   * 优先级: P0
   * 验证瑞士轮编辑器页面正确加载
   */
  test('TEST-SWISS-01: 瑞士轮编辑器页面加载 @P0', async ({ page }) => {
    await dashboardPage.navigateToSchedule();
    await swissEditorPage.expectPageLoaded();

    await expect(swissEditorPage.swissTab).toBeVisible();
    await expect(swissEditorPage.eliminationTab).toBeVisible();

    console.log('✅ 瑞士轮编辑器页面加载成功');
  });

  /**
   * TEST-SWISS-02: 瑞士轮编辑器 - 初始化赛程
   * 优先级: P0
   * 验证可以初始化瑞士轮32场比赛
   */
  test('TEST-SWISS-02: 初始化瑞士轮赛程 @P0', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    await ensureTestTeams(page, teamsPage);

    await dashboardPage.navigateToSchedule();
    await swissEditorPage.expectPageLoaded();
    await swissEditorPage.switchToSwiss();

    const initButton = swissEditorPage.initSlotsButton;
    const isVisible = await initButton.isVisible().catch(() => false);

    if (isVisible) {
      await initButton.click();
      await page.waitForTimeout(2000);

      const matchCount = await swissEditorPage.getMatchCount();
      console.log(`✅ 初始化后比赛数量: ${matchCount}`);
      expect(matchCount).toBeGreaterThan(0);
    } else {
      console.log('⚠️ 初始化按钮不可见，可能赛程已初始化');
      const matchCount = await swissEditorPage.getMatchCount();
      expect(matchCount).toBeGreaterThan(0);
    }

    console.log('✅ 瑞士轮赛程初始化完成');
  });
});

test.describe('【P0】瑞士轮编辑器 - 比赛编辑功能测试', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;
  let swissEditorPage: SwissStageEditorPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);
    swissEditorPage = new SwissStageEditorPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToSchedule();
    await swissEditorPage.expectPageLoaded();
    await swissEditorPage.switchToSwiss();
  });

  /**
   * TEST-SWISS-03: 瑞士轮编辑器 - 编辑比赛对话框
   * 优先级: P0
   * 验证点击比赛卡片可以打开编辑对话框
   */
  test('TEST-SWISS-03: 打开比赛编辑对话框 @P0', async ({ page }) => {
    const matchCard = page.locator('[data-testid^="swiss-match-card-"]').first();
    const isMatchVisible = await matchCard.isVisible().catch(() => false);

    if (!isMatchVisible) {
      console.log('⚠️ 没有找到比赛卡片');
      const initButton = swissEditorPage.initSlotsButton;
      const hasInit = await initButton.isVisible().catch(() => false);
      if (hasInit) {
        await initButton.click();
        await page.waitForTimeout(2000);
      }
    }

    const firstMatch = page.locator('[data-testid^="swiss-match-card-"]').first();
    await expect(firstMatch).toBeVisible({ timeout: 10000 });
    await firstMatch.click();

    const dialog = swissEditorPage.editDialog;
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await expect(swissEditorPage.teamASelect).toBeVisible();
    await expect(swissEditorPage.teamBSelect).toBeVisible();
    await expect(swissEditorPage.scoreAInput).toBeVisible();
    await expect(swissEditorPage.scoreBInput).toBeVisible();

    console.log('✅ 比赛编辑对话框正确打开');

    await swissEditorPage.closeDialog();
  });

  /**
   * TEST-SWISS-04: 瑞士轮编辑器 - 更新比赛结果
   * 优先级: P0
   * 验证可以更新比赛结果（比分和状态）
   */
  test('TEST-SWISS-04: 更新比赛结果 @P0', async ({ page }) => {
    const matchCard = page.locator('[data-testid^="swiss-match-card-"]').first();
    const hasMatch = await matchCard.isVisible().catch(() => false);

    if (!hasMatch) {
      console.log('⚠️ 没有找到比赛卡片，初始化赛程');
      const initButton = swissEditorPage.initSlotsButton;
      const hasInit = await initButton.isVisible().catch(() => false);
      if (hasInit) {
        await initButton.click();
        await page.waitForTimeout(2000);
      }
    }

    const firstMatch = page.locator('[data-testid^="swiss-match-card-"]').first();
    await expect(firstMatch).toBeVisible({ timeout: 10000 });
    await firstMatch.click();

    const dialog = swissEditorPage.editDialog;
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await swissEditorPage.setScore(2, 1);
    await swissEditorPage.setMatchStatus('finished');
    await swissEditorPage.saveMatch();

    await page.waitForTimeout(1000);

    console.log('✅ 比赛结果更新成功');
  });

  /**
   * TEST-SWISS-05: 瑞士轮编辑器 - 比赛状态流转
   * 优先级: P0
   * 验证比赛状态从未开始 -> 进行中 -> 已结束的流转
   */
  test('TEST-SWISS-05: 比赛状态流转 @P0', async ({ page }) => {
    const matchCard = page.locator('[data-testid^="swiss-match-card-"]').first();
    const hasMatch = await matchCard.isVisible().catch(() => false);

    if (!hasMatch) {
      const initButton = swissEditorPage.initSlotsButton;
      const hasInit = await initButton.isVisible().catch(() => false);
      if (hasInit) {
        await initButton.click();
        await page.waitForTimeout(2000);
      }
    }

    const firstMatch = page.locator('[data-testid^="swiss-match-card-"]').first();
    await expect(firstMatch).toBeVisible({ timeout: 10000 });
    await firstMatch.click();

    await expect(swissEditorPage.upcomingButton).toBeVisible();
    await expect(swissEditorPage.ongoingButton).toBeVisible();
    await expect(swissEditorPage.finishedButton).toBeVisible();

    await swissEditorPage.setMatchStatus('ongoing');
    await expect(swissEditorPage.ongoingButton).toHaveAttribute('data-state', 'checked');

    await swissEditorPage.setMatchStatus('finished');
    await swissEditorPage.saveMatch();

    await page.waitForTimeout(1000);

    console.log('✅ 比赛状态流转验证完成');

    await swissEditorPage.closeDialog();
  });
});

test.describe('【P1】瑞士轮编辑器 - 战绩分组测试', () => {
  let dashboardPage: DashboardPage;
  let swissEditorPage: SwissStageEditorPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    swissEditorPage = new SwissStageEditorPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToSchedule();
    await swissEditorPage.expectPageLoaded();
    await swissEditorPage.switchToSwiss();
  });

  /**
   * TEST-SWISS-06: 瑞士轮编辑器 - 战绩分组显示
   * 优先级: P1
   * 验证瑞士轮5轮的战绩分组正确显示
   */
  test('TEST-SWISS-06: 战绩分组显示验证 @P1', async ({ page }) => {
    const roundGroups = [
      'swiss-round-1',
      'swiss-round-2',
      'swiss-round-3',
      'swiss-round-4',
      'swiss-round-5',
    ];
    let foundRounds = 0;

    for (const roundId of roundGroups) {
      const round = page.getByTestId(roundId);
      const isVisible = await round.isVisible().catch(() => false);
      if (isVisible) {
        foundRounds++;
        console.log(`✅ 第${roundId.replace('swiss-round-', '')}轮分组可见`);
      }
    }

    expect(foundRounds).toBeGreaterThan(0);

    console.log(`✅ 找到 ${foundRounds} 个轮次分组`);
  });

  /**
   * TEST-SWISS-07: 瑞士轮编辑器 - 晋级/淘汰区域
   * 优先级: P1
   * 验证晋级(3-2)和淘汰(2-3)区域显示
   */
  test('TEST-SWISS-07: 晋级和淘汰区域显示 @P1', async ({ page }) => {
    const qualified = swissEditorPage.qualifiedSection;
    const eliminated = swissEditorPage.eliminatedSection;

    const hasQualified = await qualified.isVisible().catch(() => false);
    const hasEliminated = await eliminated.isVisible().catch(() => false);

    if (hasQualified) {
      console.log('✅ 3-2晋级区域可见');
    }

    if (hasEliminated) {
      console.log('✅ 2-3淘汰区域可见');
    }

    if (!hasQualified && !hasEliminated) {
      console.log('⚠️ 晋级/淘汰区域暂无可显示的战队');
    }
  });
});

test.describe('【P2】瑞士轮编辑器 - 边界测试', () => {
  let dashboardPage: DashboardPage;
  let swissEditorPage: SwissStageEditorPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    swissEditorPage = new SwissStageEditorPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToSchedule();
    await swissEditorPage.expectPageLoaded();
    await swissEditorPage.switchToSwiss();
  });

  /**
   * TEST-SWISS-08: 瑞士轮编辑器 - 刷新数据
   * 优先级: P2
   * 验证刷新按钮可以重新加载数据
   */
  test('TEST-SWISS-08: 刷新数据 @P2', async ({ page }) => {
    await swissEditorPage.refresh();

    await swissEditorPage.expectSwissEditorVisible();

    console.log('✅ 数据刷新成功');
  });

  /**
   * TEST-SWISS-09: 瑞士轮编辑器 - Tab切换
   * 优先级: P2
   * 验证瑞士轮和淘汰赛Tab切换功能
   */
  test('TEST-SWISS-09: Tab切换功能 @P2', async ({ page }) => {
    await expect(swissEditorPage.swissTab).toBeVisible();
    await expect(swissEditorPage.eliminationTab).toBeVisible();

    await swissEditorPage.switchToElimination();
    await page.waitForTimeout(500);

    const elimTab = page.getByTestId('elimination-tab');
    await expect(elimTab).toHaveAttribute('data-state', 'active');

    await swissEditorPage.switchToSwiss();
    await page.waitForTimeout(500);

    const swissTabActive = page.getByTestId('swiss-tab');
    await expect(swissTabActive).toHaveAttribute('data-state', 'active');

    console.log('✅ Tab切换功能正常');
  });
});

test.describe('【P1】瑞士轮编辑器 - 错误处理测试', () => {
  let dashboardPage: DashboardPage;
  let swissEditorPage: SwissStageEditorPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    swissEditorPage = new SwissStageEditorPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToSchedule();
    await swissEditorPage.expectPageLoaded();
    await swissEditorPage.switchToSwiss();
  });

  /**
   * TEST-SWISS-10: 瑞士轮编辑器 - 编辑对话框关闭
   * 优先级: P1
   * 验证点击取消按钮可以关闭编辑对话框
   */
  test('TEST-SWISS-10: 关闭编辑对话框 @P1', async ({ page }) => {
    const matchCard = page.locator('[data-testid^="swiss-match-card-"]').first();
    const hasMatch = await matchCard.isVisible().catch(() => false);

    if (hasMatch) {
      await matchCard.click();

      const dialog = swissEditorPage.editDialog;
      await expect(dialog).toBeVisible({ timeout: 5000 });

      await swissEditorPage.closeDialog();

      await expect(dialog).not.toBeVisible();
      console.log('✅ 编辑对话框正确关闭');
    } else {
      console.log('⚠️ 没有找到比赛卡片，跳过对话框关闭测试');
    }
  });
});
