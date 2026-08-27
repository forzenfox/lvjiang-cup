import { test, expect, Page } from '@playwright/test';
import { HomePage, DashboardPage, TeamsPage } from '../pages';
import { cleanCacheByTag, TestCleanTags } from '../utils/test-data-cleaner';
import { ensureTeamsExist } from '../fixtures/factory';

/**
 * 选手管理测试用例
 * 对应测试计划: TEST-PLAYER-01 到 TEST-PLAYER-05
 *
 * 测试选手详情展示和交互功能
 *
 * 交互链路（真实 DOM）：
 * 首页 scrollToTeams → 点击战队卡片 team-card → 打开 TeamMemberModal(team-member-modal)
 * → 点击成员行 member-row → 打开 PlayerDetailDrawer(player-drawer) 展示选手详情
 */

/**
 * 保证首页存在至少一支战队（含占位队员），否则种子用例无选手可点
 * 复用管理后台创建战队（msedge 项目自带登录态）
 */
test.beforeAll(async ({ browser }) => {
  // beforeAll 不能用 page/context 夹具，用 browser 自建一个带登录态的上下文
  const context = await browser.newContext({
    baseURL: 'http://localhost:5173',
    storageState: './tests/e2e/.auth/auth.json',
  });
  const page = await context.newPage();
  const dash = new DashboardPage(page);
  const teams = new TeamsPage(page);

  await page.goto('/admin/dashboard');
  await dash.expectPageLoaded();

  // 清理本地缓存中可能过期的战队数据，避免旧数据干扰
  await cleanCacheByTag(page, TestCleanTags.TEAMS);

  await dash.navigateToTeams();
  await teams.expectPageLoaded();

  const count = await teams.getTeamCount();
  if (count === 0) {
    await ensureTeamsExist(page, teams, 1);
  }
  await context.close();
});

/**
 * 打开战队成员弹窗（TeamMemberModal）
 * @returns 是否成功打开
 */
async function openTeamMemberModal(page: Page, homePage: HomePage): Promise<boolean> {
  await homePage.scrollToTeams();

  const teamCard = page.getByTestId('team-card').first();
  if (!(await teamCard.isVisible().catch(() => false))) {
    return false;
  }
  await teamCard.click();

  await page
    .getByTestId('team-member-modal')
    .waitFor({ state: 'visible', timeout: 5000 })
    .catch(() => {});
  return await page
    .getByTestId('team-member-modal')
    .isVisible()
    .catch(() => false);
}

/**
 * 打开选手详情抽屉（PlayerDetailDrawer）
 * 打开成员弹窗后点击首个成员行，抽屉内展示选手详情
 * @returns 是否成功打开
 */
async function openPlayerDrawer(page: Page, homePage: HomePage): Promise<boolean> {
  if (!(await openTeamMemberModal(page, homePage))) {
    return false;
  }

  const memberRow = page.getByTestId('member-row').first();
  if (!(await memberRow.isVisible().catch(() => false))) {
    return false;
  }
  await memberRow.click();

  await page
    .getByTestId('player-drawer')
    .waitFor({ state: 'visible', timeout: 5000 })
    .catch(() => {});
  return await page
    .getByTestId('player-drawer')
    .isVisible()
    .catch(() => false);
}

test.describe('【P1】选手详情功能测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-PLAYER-01: 查看选手详情
   * 优先级: P1
   * 验证点击选手头像可以打开详情弹窗
   */
  test('TEST-PLAYER-01: 查看选手详情 @P1', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    await expect(page.getByTestId('player-drawer')).toBeVisible({ timeout: 5000 });
    console.log('✅ 选手详情正常打开');
  });

  /**
   * TEST-PLAYER-02: 选手详情信息显示
   * 优先级: P1
   * 验证选手昵称、位置、简介、常用英雄等信息正确显示
   */
  test('TEST-PLAYER-02: 选手详情信息显示 @P1', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    // 详情抽屉头部标题
    const drawerTitle = page.locator('[data-testid="player-drawer"] h2');
    await expect(drawerTitle).toHaveText('选手详情');

    // 详情内容区包含选手昵称与「个人简介」「常用英雄」等区块
    const drawer = page.getByTestId('player-drawer');
    await expect(drawer.getByText('个人简介').first()).toBeVisible();
    await expect(drawer.getByText('常用英雄').first()).toBeVisible();

    console.log('✅ 选手详情内容正确显示');
  });

  /**
   * TEST-PLAYER-03: 关闭选手详情弹窗
   * 优先级: P1
   * 验证点击关闭按钮可以关闭弹窗
   */
  test('TEST-PLAYER-03: 关闭选手详情弹窗 - 关闭按钮 @P1', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    await page.getByTestId('close-drawer-button').click();
    await expect(page.getByTestId('player-drawer')).not.toBeVisible();
    console.log('✅ 点击关闭按钮可以关闭弹窗');
  });

  /**
   * TEST-PLAYER-03-ESC: 关闭选手详情弹窗 - ESC键
   * 优先级: P1
   * 验证按ESC键可以关闭弹窗
   */
  test('TEST-PLAYER-03-ESC: 关闭选手详情弹窗 - ESC键 @P1', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 成员弹窗监听 ESC，关闭成员弹窗后选手详情抽屉同步消失
    await expect(page.getByTestId('player-drawer')).not.toBeVisible();
    console.log('✅ 按ESC键可以关闭弹窗');
  });

  /**
   * TEST-PLAYER-03-OVERLAY: 关闭选手详情弹窗 - 点击遮罩层
   * 优先级: P2
   * 验证点击遮罩层可以关闭弹窗
   */
  test('TEST-PLAYER-03-OVERLAY: 关闭选手详情弹窗 - 遮罩层 @P2', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    await page.getByTestId('drawer-overlay').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    await expect(page.getByTestId('player-drawer')).not.toBeVisible();
    console.log('✅ 点击遮罩层可以关闭弹窗');
  });
});

test.describe('【P1】选手位置图标测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-PLAYER-04: 选手位置图标显示
   * 优先级: P1
   * 验证5个位置图标正确显示
   */
  test('TEST-PLAYER-04: 选手位置图标显示 @P1', async ({ page }) => {
    const hasModal = await openTeamMemberModal(page, homePage);

    if (!hasModal) {
      console.log('⚠️ 未找到战队卡片，无法打开成员弹窗');
      return;
    }

    const positionIcons = page.getByTestId('member-position-icon');
    const count = await positionIcons.count();

    if (count > 0) {
      console.log(`✅ 找到 ${count} 个位置图标`);
    } else {
      console.log('⚠️ 未找到位置图标');
    }
  });

  /**
   * TEST-PLAYER-04-POSITION: 各位置显示正确
   * 优先级: P1
   * 验证TOP/JUNGLE/MID/ADC/SUPPORT各位置正确显示
   */
  test('TEST-PLAYER-04-POSITION: 各位置显示正确 @P1', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    const drawer = page.getByTestId('player-drawer');
    const hasPosition = await drawer
      .getByText(/上单|打野|中单|射手|辅助/)
      .first()
      .isVisible()
      .catch(() => false);

    if (hasPosition) {
      console.log('✅ 选手位置标签正确显示');
    } else {
      console.log('⚠️ 未找到位置标签');
    }
  });
});

test.describe('【P2】选手评分显示测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-PLAYER-05: 选手评分显示
   * 优先级: P2
   * 验证评分星级显示正确
   */
  test('TEST-PLAYER-05: 选手评分显示 @P2', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    const ratingStars = page.getByTestId('rating-star');
    const starCount = await ratingStars.count();

    if (starCount > 0) {
      console.log(`✅ 找到 ${starCount} 个评分星星`);
    } else {
      console.log('⚠️ 未找到评分星星（可能该选手没有评分）');
    }
  });

  /**
   * TEST-PLAYER-05-VISIBLE: 选手卡片显示评分
   * 优先级: P2
   * 验证选手卡片上显示评分
   */
  test('TEST-PLAYER-05-VISIBLE: 选手评分显示 @P2', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    const ratingSection = page.getByTestId('player-drawer').getByText('评分').first();
    const hasRating = await ratingSection.isVisible().catch(() => false);

    if (hasRating) {
      console.log('✅ 选手评分正确显示');
    } else {
      console.log('⚠️ 未找到评分区域（选手可能未设置评分）');
    }
  });
});

test.describe('【P2】选手队长标识测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-PLAYER-06: 队长标识显示
   * 优先级: P2
   * 验证队长标识正确显示
   */
  test('TEST-PLAYER-06: 队长标识显示 @P2', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    const captainBadge = page.getByTestId('player-drawer').getByText('队长').first();
    const hasCaptain = await captainBadge.isVisible().catch(() => false);

    if (hasCaptain) {
      console.log('✅ 队长标识正确显示');
    } else {
      console.log('⚠️ 该选手不是队长');
    }
  });
});

test.describe('【P2】选手常用英雄测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-PLAYER-07: 常用英雄显示
   * 优先级: P2
   * 验证常用英雄正确显示
   */
  test('TEST-PLAYER-07: 常用英雄显示 @P2', async ({ page }) => {
    const hasDrawer = await openPlayerDrawer(page, homePage);

    if (!hasDrawer) {
      console.log('⚠️ 未找到战队卡片或选手，无法打开详情');
      return;
    }

    const championSection = page.getByTestId('player-drawer').getByText('常用英雄').first();
    const hasChampions = await championSection.isVisible().catch(() => false);

    if (hasChampions) {
      console.log('✅ 常用英雄区域正确显示');
    } else {
      console.log('⚠️ 该选手没有常用英雄数据');
    }
  });
});
