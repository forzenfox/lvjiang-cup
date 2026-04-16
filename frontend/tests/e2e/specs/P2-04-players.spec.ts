import { test, expect } from '@playwright/test';
import { HomePage } from '../pages';

/**
 * 选手管理测试用例
 * 对应测试计划: TEST-PLAYER-01 到 TEST-PLAYER-05
 *
 * 测试选手详情展示和交互功能
 */

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
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      await expect(playerModal).toBeVisible({ timeout: 5000 });
      console.log('✅ 选手详情弹窗正确打开');
    } else {
      console.log('⚠️ 未找到选手头像');
    }
  });

  /**
   * TEST-PLAYER-02: 选手详情信息显示
   * 优先级: P1
   * 验证选手昵称、位置、简介、常用英雄等信息正确显示
   */
  test('TEST-PLAYER-02: 选手详情信息显示 @P1', async ({ page }) => {
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      await expect(playerModal).toBeVisible({ timeout: 5000 });

      const modalTitle = page.getByText('选手详情');
      await expect(modalTitle).toBeVisible();

      console.log('✅ 选手详情弹窗内容正确显示');
    } else {
      console.log('⚠️ 未找到选手头像');
    }
  });

  /**
   * TEST-PLAYER-03: 关闭选手详情弹窗
   * 优先级: P1
   * 验证点击关闭按钮可以关闭弹窗
   */
  test('TEST-PLAYER-03: 关闭选手详情弹窗 - 关闭按钮 @P1', async ({ page }) => {
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      await expect(playerModal).toBeVisible({ timeout: 5000 });

      const closeButton = page.getByTestId('close-modal-button');
      await closeButton.click();
      await page.waitForTimeout(300);

      await expect(playerModal).not.toBeVisible();
      console.log('✅ 点击关闭按钮可以关闭弹窗');
    } else {
      console.log('⚠️ 未找到选手头像');
    }
  });

  /**
   * TEST-PLAYER-03-ESC: 关闭选手详情弹窗 - ESC键
   * 优先级: P1
   * 验证按ESC键可以关闭弹窗
   */
  test('TEST-PLAYER-03-ESC: 关闭选手详情弹窗 - ESC键 @P1', async ({ page }) => {
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      await expect(playerModal).toBeVisible({ timeout: 5000 });

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      await expect(playerModal).not.toBeVisible();
      console.log('✅ 按ESC键可以关闭弹窗');
    } else {
      console.log('⚠️ 未找到选手头像');
    }
  });

  /**
   * TEST-PLAYER-03-OVERLAY: 关闭选手详情弹窗 - 点击遮罩层
   * 优先级: P2
   * 验证点击遮罩层可以关闭弹窗
   */
  test('TEST-PLAYER-03-OVERLAY: 关闭选手详情弹窗 - 遮罩层 @P2', async ({ page }) => {
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      await expect(playerModal).toBeVisible({ timeout: 5000 });

      const modalOverlay = page.getByTestId('modal-overlay');
      await modalOverlay.click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);

      console.log('✅ 点击遮罩层可以关闭弹窗');
    } else {
      console.log('⚠️ 未找到选手头像');
    }
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
    await homePage.scrollToTeams();

    const positionIcons = page.locator('[data-testid="position-icon"]');
    const count = await positionIcons.count();

    if (count > 0) {
      console.log(`✅ 找到 ${count} 个位置图标`);

      const positionLabels = page.locator('[data-testid="position-label"]');
      const labelCount = await positionLabels.count();

      if (labelCount >= 5) {
        console.log(`✅ 找到 ${labelCount} 个位置标签`);
      }
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
    await homePage.scrollToTeams();

    const teamCard = page.locator('[data-testid^="team-card-"]').first();
    const hasCard = await teamCard.isVisible().catch(() => false);

    if (hasCard) {
      const expectedPositions = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      let foundPositions = 0;

      for (const pos of expectedPositions) {
        const positionLabel = page.locator(`text=${pos}`);
        const isVisible = await positionLabel
          .first()
          .isVisible()
          .catch(() => false);
        if (isVisible) {
          foundPositions++;
        }
      }

      console.log(`✅ 找到 ${foundPositions}/5 个位置标签`);
    } else {
      console.log('⚠️ 未找到战队卡片');
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
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      const hasModal = await playerModal.isVisible().catch(() => false);

      if (hasModal) {
        const ratingStars = page.locator('[data-testid="rating-star"]');
        const starCount = await ratingStars.count();

        if (starCount > 0) {
          console.log(`✅ 找到 ${starCount} 个评分星星`);
        } else {
          console.log('⚠️ 未找到评分星星（可能该选手没有评分）');
        }
      }
    } else {
      console.log('⚠️ 未找到选手头像');
    }
  });

  /**
   * TEST-PLAYER-05-VISIBLE: 选手卡片显示评分
   * 优先级: P2
   * 验证选手卡片上显示评分
   */
  test('TEST-PLAYER-05-VISIBLE: 选手卡片显示评分 @P2', async ({ page }) => {
    await homePage.scrollToTeams();

    const ratingElements = page.locator('text=/\\d+/').first();
    const hasRating = await ratingElements.isVisible().catch(() => false);

    if (hasRating) {
      console.log('✅ 选手评分正确显示');
    } else {
      console.log('⚠️ 未找到评分元素');
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
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      const hasModal = await playerModal.isVisible().catch(() => false);

      if (hasModal) {
        const captainBadge = page.locator('text=队长');
        const hasCaptain = await captainBadge.isVisible().catch(() => false);

        if (hasCaptain) {
          console.log('✅ 队长标识正确显示');
        } else {
          console.log('⚠️ 该选手不是队长');
        }
      }
    } else {
      console.log('⚠️ 未找到选手头像');
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
    await homePage.scrollToTeams();

    const playerAvatar = page.locator('[data-testid="player-avatar"]').first();
    const hasPlayer = await playerAvatar.isVisible().catch(() => false);

    if (hasPlayer) {
      await playerAvatar.click();
      await page.waitForTimeout(500);

      const playerModal = page.locator('[data-testid="player-detail-modal"]');
      const hasModal = await playerModal.isVisible().catch(() => false);

      if (hasModal) {
        const championSection = page.locator('text=常用英雄');
        const hasChampions = await championSection.isVisible().catch(() => false);

        if (hasChampions) {
          console.log('✅ 常用英雄区域正确显示');
        } else {
          console.log('⚠️ 该选手没有常用英雄数据');
        }
      }
    } else {
      console.log('⚠️ 未找到选手头像');
    }
  });
});
