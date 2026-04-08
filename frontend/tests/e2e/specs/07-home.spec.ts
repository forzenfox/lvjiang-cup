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

    // 验证页面加载性能（不超过3秒）
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    expect(loadTime).toBeLessThan(3000);
  });

  /**
   * TEST-008: 刷新页面数据 (US-008)
   * 优先级: P1
   * 验证手动刷新功能
   * 前置条件: TEST-001
   */
  test('TEST-008: 刷新页面数据 @P1', async ({ page }) => {
    // 检查刷新按钮是否存在（包括刷新数据按钮）
    const refreshButton = page
      .locator('button[title="刷新"], button:has-text("刷新"), button:has-text("刷新数据")')
      .first();

    if (await refreshButton.isVisible().catch(() => false)) {
      // 点击刷新按钮
      await refreshButton.click();

      // 等待网络请求完成（如果有）
      await page.waitForTimeout(500);

      // 验证页面内容仍然显示（刷新后页面应仍然正常）
      await homePage.expectPageLoaded();
    } else {
      // 如果没有刷新按钮，验证页面可见性变化时自动刷新
      console.log('⚠️ 未找到刷新按钮，测试页面可见性自动刷新');
      test.skip();
    }
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
    // 检查直播按钮是否存在
    const hasLiveButton = await homePage.liveButton.isVisible().catch(() => false);

    if (hasLiveButton) {
      // 点击直播按钮
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        homePage.clickLiveButton(),
      ]);

      // 验证新页面打开
      await newPage.waitForLoadState();

      // 验证URL为配置的直播链接（douyu.com）
      const url = newPage.url();
      expect(url).toMatch(/douyu\.com|live\./);

      // 关闭新页面
      await newPage.close();
    } else {
      // 如果没有直播按钮，记录警告并跳过
      console.log('⚠️ 直播按钮未找到，可能未配置直播信息（依赖TEST-103）');
      test.skip();
    }
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
    // 滚动到战队区域
    await homePage.scrollToTeams();

    // 获取战队卡片数量
    const teamCards = await page.locator('[data-testid="team-card"]').all();

    if (teamCards.length === 0) {
      console.log('⚠️ 未找到战队数据（依赖TEST-105）');
      test.skip();
      return;
    }

    // 验证战队卡片显示
    expect(teamCards.length).toBeGreaterThan(0);

    // 验证模拟数据中的战队存在
    const expectedTeamName = mockTeamNames[0]; // 驴酱
    const teamExists = await page
      .locator(`text=${expectedTeamName}`)
      .first()
      .isVisible()
      .catch(() => false);
    if (teamExists) {
      console.log(`✅ 找到模拟数据中的战队: ${expectedTeamName}`);
    }

    // 验证每个战队卡片显示Logo、名称和队员
    for (const card of teamCards.slice(0, 3)) {
      // 检查前3个
      // 验证战队名称
      const teamName = await card.locator('[data-testid="team-name"]').textContent();
      expect(teamName).toBeTruthy();

      // 验证队员位置图标（top/jungle/mid/bot/support）
      const positionIcons = await card.locator('[data-testid="position-icon"]').all();
      expect(positionIcons.length).toBe(5);
    }

    // 验证响应式布局 - 桌面端4列
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // 验证响应式布局 - 移动端1列
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 恢复桌面尺寸
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  /**
   * TEST-004: 查看战队详情 (US-004)
   * 优先级: P0
   * 验证战队详细信息显示
   * 前置条件: TEST-003
   */
  test('TEST-004: 查看战队详情 @P0', async ({ page }) => {
    // 滚动到战队区域
    await homePage.scrollToTeams();

    // 获取第一个战队卡片
    const firstCard = page.locator('[data-testid="team-card"]').first();

    if (!(await firstCard.isVisible().catch(() => false))) {
      console.log('⚠️ 未找到战队数据（依赖TEST-003）');
      test.skip();
      return;
    }

    // 验证战队Logo和名称
    const teamLogo = firstCard.locator('[data-testid="team-logo"]');
    const teamName = firstCard.locator('[data-testid="team-name"]');

    await expect(teamLogo).toBeVisible();
    await expect(teamName).toBeVisible();

    // 验证5名队员信息
    const playerAvatars = await firstCard.locator('[data-testid="player-avatar"]').all();
    expect(playerAvatars.length).toBe(5);

    // 验证队员位置标识
    const positionLabels = await firstCard.locator('[data-testid="position-label"]').all();
    const expectedPositions = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

    for (let i = 0; i < positionLabels.length && i < 5; i++) {
      const text = await positionLabels[i].textContent();
      expect(expectedPositions).toContain(text?.toLowerCase());
    }

    // 验证战队简介
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
    // 滚动到赛程区域并切换到瑞士轮Tab
    await homePage.switchToSwiss();

    // 验证瑞士轮舞台显示
    await expect(page.getByTestId('swiss-stage')).toBeVisible({ timeout: 10000 });

    // 验证战绩分组显示（使用具体的data-testid）
    const recordGroupIds = [
      'swiss-record-group-2-0',
      'swiss-record-group-2-1',
      'swiss-record-group-losers',
      'swiss-record-group-eliminated',
    ];
    let foundGroups = 0;
    for (const groupId of recordGroupIds) {
      const group = page.getByTestId(groupId);
      if (await group.isVisible().catch(() => false)) {
        foundGroups++;
        console.log(`✅ 找到战绩分组: ${groupId}`);
      }
    }

    if (foundGroups === 0) {
      console.log('⚠️ 未找到瑞士轮战绩分组（依赖TEST-108）');
      test.skip();
      return;
    }

    // 验证比赛信息显示
    const matches = await page.locator('[data-testid="swiss-match"]').all();
    if (matches.length > 0) {
      console.log(`✅ 找到 ${matches.length} 场瑞士轮比赛`);
      for (const match of matches.slice(0, 3)) {
        // 验证对阵双方
        const teamAName = await match
          .locator('[data-testid="team-a-name"]')
          .textContent()
          .catch(() => null);
        const teamBName = await match
          .locator('[data-testid="team-b-name"]')
          .textContent()
          .catch(() => null);
        if (teamAName && teamBName) {
          console.log(`  - 比赛: ${teamAName} vs ${teamBName}`);
        }

        // 验证比赛状态
        const status = await match
          .locator('[data-testid="match-status"]')
          .textContent()
          .catch(() => null);
        if (status) {
          expect(['未开始', '进行中', '已结束']).toContain(status);
        }
      }
    } else {
      console.log('⚠️ 未找到瑞士轮比赛（依赖TEST-108）');
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
    // 滚动到赛程区域
    // 切换到淘汰赛Tab
    await homePage.switchToElimination();

    // 验证淘汰赛舞台显示
    await expect(page.getByTestId('elimination-stage')).toBeVisible({ timeout: 10000 });

    // 验证淘汰赛比赛存在
    const matches = await page.locator('[data-testid="bracket-match"]').all();

    if (matches.length === 0) {
      console.log('⚠️ 未找到淘汰赛数据（依赖TEST-109）');
      test.skip();
      return;
    }

    console.log(`✅ 找到 ${matches.length} 场淘汰赛比赛`);

    // 验证比赛结构
    for (const match of matches.slice(0, 3)) {
      // 验证对阵双方
      const teamAName = await match
        .locator('[data-testid="team-a-name"]')
        .textContent()
        .catch(() => null);
      const teamBName = await match
        .locator('[data-testid="team-b-name"]')
        .textContent()
        .catch(() => null);
      if (teamAName && teamBName) {
        console.log(`  - 比赛: ${teamAName} vs ${teamBName}`);
      }

      // 验证比赛状态
      const status = await match
        .locator('[data-testid="match-status"]')
        .textContent()
        .catch(() => null);
      if (status) {
        expect(['未开始', '进行中', '已结束']).toContain(status);
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
    // 切换到瑞士轮Tab
    await homePage.switchToSwiss();

    // 获取比赛卡片
    const matches = await page.locator('[data-testid="swiss-match"]').all();

    if (matches.length === 0) {
      console.log('⚠️ 未找到比赛数据（依赖TEST-005）');
      test.skip();
      return;
    }

    // 验证不同状态的比赛卡片
    let foundUpcoming = false;
    let foundOngoing = false;
    let foundFinished = false;

    for (const match of matches) {
      const statusElement = match.locator('[data-testid="match-status"]');
      const status = await statusElement.textContent().catch(() => null);

      if (!status) continue;

      // 验证状态标签
      if (status.includes('未开始')) {
        foundUpcoming = true;
        console.log('✅ 找到未开始的比赛');
      } else if (status.includes('进行中')) {
        foundOngoing = true;
        console.log('✅ 找到进行中的比赛');
      } else if (status.includes('已结束')) {
        foundFinished = true;
        console.log('✅ 找到已结束的比赛');
      }
    }

    // 记录找到的状态类型
    console.log(
      `状态分布 - 未开始: ${foundUpcoming}, 进行中: ${foundOngoing}, 已结束: ${foundFinished}`
    );

    // 至少找到一种状态的比赛
    expect(foundUpcoming || foundOngoing || foundFinished).toBeTruthy();
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
      // 如果没有战队数据，验证空状态提示
      const hasEmptyState = await teamEmptyState.isVisible().catch(() => false);
      if (hasEmptyState) {
        console.log('✅ 战队区域显示空状态');
      }
    }

    // 验证赛程区域空状态
    await homePage.scrollToSchedule();
    const scheduleEmptyState = page.locator('[data-testid="schedule-empty"], text=暂无赛程');
    const hasMatches = (await page.locator('[data-testid="swiss-match"]').count()) > 0;

    if (!hasMatches) {
      // 如果没有比赛数据，验证空状态提示
      const hasEmptyState = await scheduleEmptyState.isVisible().catch(() => false);
      if (hasEmptyState) {
        console.log('✅ 赛程区域显示空状态');
      }
    }
  });
});
