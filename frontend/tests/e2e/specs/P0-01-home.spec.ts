import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { mockTeamNames } from '../fixtures/mock-data.fixture';

/**
 * 首页功能测试 - 游客功能验证
 * 对应测试计划: TEST-001 到 TEST-008
 *
 * 测试依赖关系:
 * - TEST-001 (基础): 无依赖，首先执行
 * - TEST-002: 依赖 TEST-103 (直播配置)
 * - TEST-003: 依赖 TEST-105 (战队数据)
 * - TEST-004: 依赖 TEST-003
 * - TEST-005: 依赖 TEST-108 (瑞士轮比赛)
 * - TEST-006: 依赖 TEST-109 (淘汰赛比赛)
 * - TEST-007: 依赖 TEST-005, TEST-110 (比赛结果)
 * - TEST-008: 依赖 TEST-001
 * - TEST-B004: 依赖 空数据状态
 */

test.describe('【第一阶段】首页基础功能测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await page.reload();
  });

  /**
   * TEST-001: 访问赛事首页 (US-001)
   * 优先级: P0
   * 验证首页正确加载并显示所有关键元素
   * 前置条件: 环境初始化完成
   */
  test('TEST-001: 访问赛事首页 @P0', async ({ page }) => {
    // 验证页面标题包含"驴酱杯"
    await expect(page).toHaveTitle(/驴酱杯/);

    // 验证英雄区域元素
    await homePage.expectPageLoaded();

    // 验证战队区域可见
    await homePage.expectTeamsVisible();

    // 验证赛程区域可见
    await homePage.expectScheduleVisible();

    // 验证导航链接存在
    await expect(homePage.adminLink).toBeVisible();

    // 验证页面加载性能（不超过5秒，考虑到CI/CD环境可能较慢）
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    expect(loadTime).toBeLessThan(5000);
  });

  /**
   * TEST-008: 刷新页面数据 (US-008)
   * 优先级: P1
   * 验证手动刷新功能
   * 前置条件: TEST-001
   */
  test('TEST-008: 刷新页面数据 @P1', async ({ page }) => {
    await page.reload();
    await homePage.expectPageLoaded();
    await expect(page).toHaveTitle(/驴酱杯/);
  });
});

test.describe('【第三阶段-1】首页直播功能测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-002: 观看赛事直播 (US-002)
   * 优先级: P0
   * 验证"观看直播"按钮能够正确跳转
   * 前置条件: TEST-001, TEST-103 (直播配置)
   *
   * 注意: 此测试需要在管理员配置直播信息后执行
   */
  test('TEST-002: 观看赛事直播 @P0', async ({ context }) => {
    const hasLiveButton = await homePage.liveButton.isVisible().catch(() => false);
    test.skip(!hasLiveButton, '直播信息未配置，跳过此测试');

    const [newPage] = await Promise.all([context.waitForEvent('page'), homePage.clickLiveButton()]);

    await newPage.waitForLoadState();

    const url = newPage.url();
    expect(url).toMatch(/douyu\.com|live\./);

    await newPage.close();
  });
});

test.describe('【第三阶段-2】首页战队功能测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-003: 浏览参赛战队 (US-003)
   * 优先级: P0
   * 验证战队展示功能
   * 前置条件: TEST-001, TEST-105 (战队数据)
   *
   * 注意: 此测试需要在管理员添加战队后执行
   */
  test('TEST-003: 浏览参赛战队 @P0', async ({ page }) => {
    await homePage.scrollToTeams();

    const teamCards = await page.locator('[data-testid^="team-card-"]').all();
    const teamCount = teamCards.length;

    if (teamCount === 0) {
      const emptyState = page.locator('[data-testid="teams-empty"], text=暂无战队');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      expect(hasEmptyState, '无战队数据时应显示空状态提示').toBeTruthy();
    } else {
      await expect(teamCards.length).toBeGreaterThan(0);

      const expectedTeamName = mockTeamNames[0];
      const teamExists = await page
        .locator(`text=${expectedTeamName}`)
        .first()
        .isVisible()
        .catch(() => false);
      expect(teamExists, `应能找到模拟战队: ${expectedTeamName}`).toBeTruthy();

      for (const card of teamCards.slice(0, Math.min(3, teamCount))) {
        const teamName = await card.locator('[data-testid="team-name"]').textContent();
        expect(teamName).toBeTruthy();

        const positionIcons = await card.locator('[data-testid="position-icon"]').all();
        expect(positionIcons.length).toBe(5);
      }

      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);

      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      await page.setViewportSize({ width: 1280, height: 720 });
    }
  });

  /**
   * TEST-004: 查看战队详情 (US-004)
   * 优先级: P0
   * 验证战队详细信息显示
   * 前置条件: TEST-003
   */
  test('TEST-004: 查看战队详情 @P0', async ({ page }) => {
    await homePage.scrollToTeams();

    const teamCards = page.locator('[data-testid^="team-card-"]');
    const teamCount = await teamCards.count();

    if (teamCount === 0) {
      const emptyState = page.locator('[data-testid="teams-empty"], text=暂无战队');
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      expect(hasEmpty, '无战队数据时应显示空状态提示').toBeTruthy();
      return;
    }

    const firstCard = teamCards.first();
    const teamLogo = firstCard.locator('[data-testid="team-logo"]');
    const teamName = firstCard.locator('[data-testid="team-name"]');

    await expect(teamLogo).toBeVisible();
    await expect(teamName).toBeVisible();

    const playerAvatars = await firstCard.locator('[data-testid="player-avatar"]').all();
    expect(playerAvatars.length).toBe(5);

    const positionLabels = await firstCard.locator('[data-testid="position-label"]').all();
    const expectedPositions = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

    for (let i = 0; i < positionLabels.length && i < 5; i++) {
      const text = await positionLabels[i].textContent();
      expect(expectedPositions).toContain(text?.toLowerCase());
    }

    const description = firstCard.locator('[data-testid="team-description"]');
    if (await description.isVisible().catch(() => false)) {
      const descText = await description.textContent();
      expect(descText).toBeTruthy();
    }
  });
});

test.describe('【第三阶段-3】首页赛程功能测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-005: 查看瑞士轮赛程 (US-005)
   * 优先级: P0
   * 验证瑞士轮赛程展示
   * 前置条件: TEST-001, TEST-108 (瑞士轮比赛)
   *
   * 注意: 此测试需要在管理员创建瑞士轮比赛后执行
   */
  test('TEST-005: 查看瑞士轮赛程 @P0', async ({ page }) => {
    await homePage.switchToSwiss();

    const swissStage = page.getByTestId('swiss-stage-display');
    await expect(swissStage).toBeVisible({ timeout: 10000 });

    const matches = await page.locator('[data-testid^="swiss-match-card-"]').all();

    if (matches.length === 0) {
      const emptyState = page.locator('[data-testid="swiss-empty"], text=暂无比赛');
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      expect(hasEmpty, '瑞士轮无比赛时应显示空状态提示').toBeTruthy();
    } else {
      expect(matches.length).toBeGreaterThan(0);

      for (const match of matches.slice(0, Math.min(3, matches.length))) {
        const teamAName = await match
          .locator('[data-testid="team-a-name"]')
          .textContent()
          .catch(() => null);
        const teamBName = await match
          .locator('[data-testid="team-b-name"]')
          .textContent()
          .catch(() => null);
        expect(teamAName && teamBName, '每场比赛应有两个战队名称').toBeTruthy();

        const status = await match
          .locator('[data-testid="match-status"]')
          .textContent()
          .catch(() => null);
        if (status) {
          expect(['未开始', '进行中', '已结束']).toContain(status);
        }
      }
    }
  });

  /**
   * TEST-006: 查看淘汰赛赛程 (US-006)
   * 优先级: P0
   * 验证淘汰赛赛程展示
   * 前置条件: TEST-001, TEST-109 (淘汰赛比赛)
   *
   * 注意: 此测试需要在管理员创建淘汰赛比赛后执行
   */
  test('TEST-006: 查看淘汰赛赛程 @P0', async ({ page }) => {
    await homePage.switchToElimination();

    const eliminationStage = page.getByTestId('elimination-stage-display');
    await expect(eliminationStage).toBeVisible({ timeout: 10000 });

    const matches = await page.locator('[data-testid^="elimination-match-card-"]').all();

    if (matches.length === 0) {
      const emptyState = page.locator('[data-testid="elimination-empty"], text=暂无淘汰赛');
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      expect(hasEmpty, '淘汰赛无数据时应显示空状态提示').toBeTruthy();
    } else {
      expect(matches.length).toBeGreaterThan(0);

      for (const match of matches.slice(0, Math.min(3, matches.length))) {
        const teamAName = await match
          .locator('[data-testid="team-a-name"]')
          .textContent()
          .catch(() => null);
        const teamBName = await match
          .locator('[data-testid="team-b-name"]')
          .textContent()
          .catch(() => null);
        expect(teamAName && teamBName, '每场比赛应有两个战队名称').toBeTruthy();

        const status = await match
          .locator('[data-testid="match-status"]')
          .textContent()
          .catch(() => null);
        if (status) {
          expect(['未开始', '进行中', '已结束']).toContain(status);
        }
      }
    }
  });

  /**
   * TEST-007: 追踪比赛状态 (US-007)
   * 优先级: P0
   * 验证比赛状态显示
   * 前置条件: TEST-005, TEST-110 (比赛结果)
   *
   * 注意: 此测试需要在管理员更新比赛结果后执行
   */
  test('TEST-007: 追踪比赛状态 @P0', async ({ page }) => {
    await homePage.switchToSwiss();

    const matches = await page.locator('[data-testid^="swiss-match-card-"]').all();

    if (matches.length === 0) {
      const emptyState = page.locator('[data-testid="swiss-empty"], text=暂无比赛');
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      expect(hasEmpty, '无比赛数据时应显示空状态提示').toBeTruthy();
      return;
    }

    let foundUpcoming = false;
    let foundOngoing = false;
    let foundFinished = false;

    for (const match of matches) {
      const statusElement = match.locator('[data-testid="match-status"]');
      const status = await statusElement.textContent().catch(() => null);

      if (!status) continue;

      if (status.includes('未开始')) {
        foundUpcoming = true;
      } else if (status.includes('进行中')) {
        foundOngoing = true;
      } else if (status.includes('已结束')) {
        foundFinished = true;
      }
    }

    expect(foundUpcoming || foundOngoing || foundFinished, '至少应找到一种比赛状态').toBeTruthy();
  });
});

test.describe('【边界测试】首页空数据状态', () => {
  /**
   * TEST-B004: 空数据状态
   * 优先级: P1
   * 验证空数据时显示正确的提示信息
   * 前置条件: 清空所有数据
   */
  test('TEST-B004: 空数据状态 @P1', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 验证英雄区域正常显示（不受数据影响）
    await homePage.expectPageLoaded();

    // 验证战队区域空状态
    await homePage.scrollToTeams();
    const teamEmptyState = page.locator('[data-testid="teams-empty"], text=暂无战队');
    const hasTeams = (await page.locator('[data-testid="team-card"]').count()) > 0;

    if (!hasTeams) {
      const hasEmptyState = await teamEmptyState.isVisible().catch(() => false);
      expect(hasEmptyState, '无战队数据时应显示空状态提示').toBeTruthy();
    }

    // 验证赛程区域空状态
    await homePage.scrollToSchedule();
    const scheduleEmptyState = page.locator('[data-testid="schedule-empty"], text=暂无赛程');
    const hasMatches = (await page.locator('[data-testid="swiss-match"]').count()) > 0;

    if (!hasMatches) {
      const hasEmptyState = await scheduleEmptyState.isVisible().catch(() => false);
      expect(hasEmptyState, '无赛程数据时应显示空状态提示').toBeTruthy();
    }
  });
});
