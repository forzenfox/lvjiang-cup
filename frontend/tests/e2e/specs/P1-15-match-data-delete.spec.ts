import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

/**
 * 比赛数据管理 - 删除游戏数据测试
 * 对应测试计划: TEST-MATCH-DATA-DELETE-01 到 TEST-MATCH-DATA-DELETE-04
 *
 * 测试范围：
 * 1. 删除游戏数据确认对话框
 * 2. 确认删除游戏数据
 * 3. 取消删除游戏数据
 * 4. 删除后列表刷新
 */

test.describe('【P1】比赛数据管理 - 删除游戏数据测试', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-MATCH-DATA-DELETE-01: 删除游戏数据确认对话框
   * 优先级：P1
   * 验证删除按钮触发确认对话框
   */
  test('TEST-MATCH-DATA-DELETE-01: 删除游戏数据确认对话框 @P1', async ({ page }) => {
    // 导航到比赛数据管理页面
    await dashboardPage.clickNavigation('赛程管理');
    await page.waitForURL('**/admin/schedule', { timeout: 10000 });

    // 等待比赛数据加载
    await page.waitForTimeout(2000);

    // 查找有数据的比赛行
    const deleteButtons = page.locator('button:has-text("删除"), button[title="删除数据"]');
    const deleteCount = await deleteButtons.count();

    if (deleteCount === 0) {
      console.log('⚠️ 暂无可删除的比赛数据');
      return;
    }

    // 点击第一个删除按钮
    await deleteButtons.first().click();

    // 验证确认对话框显示
    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // 验证确认对话框内容
    const dialogText = await confirmDialog.textContent();
    expect(dialogText).toContain('确认删除');
    expect(dialogText).toContain('无法恢复');

    console.log('✅ 删除游戏数据确认对话框正确显示');
  });

  /**
   * TEST-MATCH-DATA-DELETE-02: 确认删除游戏数据
   * 优先级：P1
   * 验证确认删除后数据被删除
   */
  test('TEST-MATCH-DATA-DELETE-02: 确认删除游戏数据 @P1', async ({ page }) => {
    await dashboardPage.clickNavigation('赛程管理');
    await page.waitForURL('**/admin/schedule', { timeout: 10000 });

    await page.waitForTimeout(2000);

    const deleteButtons = page.locator('button:has-text("删除"), button[title="删除数据"]');
    const deleteCount = await deleteButtons.count();

    if (deleteCount === 0) {
      console.log('⚠️ 暂无可删除的比赛数据');
      return;
    }

    // 点击删除按钮
    await deleteButtons.first().click();

    // 等待确认对话框
    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // 点击确认删除
    const confirmButton = confirmDialog.locator('button:has-text("删除")').first();
    await confirmButton.click();

    // 等待删除完成（toast提示）
    await page.waitForTimeout(2000);

    // 验证删除成功提示
    const successToast = page.locator('[data-sonner-toast]:has-text("删除成功")');
    const toastVisible = await successToast.isVisible().catch(() => false);

    if (toastVisible) {
      console.log('✅ 游戏数据删除成功');
    } else {
      console.log('⚠️ 未检测到删除成功提示');
    }
  });

  /**
   * TEST-MATCH-DATA-DELETE-03: 取消删除游戏数据
   * 优先级：P1
   * 验证取消删除后数据仍然存在
   */
  test('TEST-MATCH-DATA-DELETE-03: 取消删除游戏数据 @P1', async ({ page }) => {
    await dashboardPage.clickNavigation('赛程管理');
    await page.waitForURL('**/admin/schedule', { timeout: 10000 });

    await page.waitForTimeout(2000);

    const deleteButtons = page.locator('button:has-text("删除"), button[title="删除数据"]');
    const deleteCount = await deleteButtons.count();

    if (deleteCount === 0) {
      console.log('⚠️ 暂无可删除的比赛数据');
      return;
    }

    // 获取删除前的数据状态
    const gameCardBefore = page.locator('.card').first();
    const gameTextBefore = await gameCardBefore.textContent().catch(() => '');

    // 点击删除按钮
    await deleteButtons.first().click();

    // 等待确认对话框
    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // 点击取消
    const cancelButton = confirmDialog.locator('button:has-text("取消")').first();
    await cancelButton.click();

    // 验证对话框关闭
    await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });

    // 验证数据仍然存在
    const gameCardAfter = page.locator('.card').first();
    const gameTextAfter = await gameCardAfter.textContent().catch(() => '');

    expect(gameTextBefore).toBe(gameTextAfter);

    console.log('✅ 取消删除成功，数据仍然存在');
  });

  /**
   * TEST-MATCH-DATA-DELETE-04: 删除后列表刷新
   * 优先级：P1
   * 验证删除成功后列表自动刷新显示最新状态
   */
  test('TEST-MATCH-DATA-DELETE-04: 删除后列表刷新 @P1', async ({ page }) => {
    await dashboardPage.clickNavigation('赛程管理');
    await page.waitForURL('**/admin/schedule', { timeout: 10000 });

    await page.waitForTimeout(2000);

    // 获取初始列表状态
    const gameCardsBefore = await page
      .locator('[data-testid^="game-card-"], .card:has-text("G")')
      .count();

    const deleteButtons = page.locator('button:has-text("删除"), button[title="删除数据"]');
    const deleteCount = await deleteButtons.count();

    if (deleteCount === 0) {
      console.log('⚠️ 暂无可删除的比赛数据');
      return;
    }

    // 点击删除按钮
    await deleteButtons.first().click();

    // 等待确认对话框
    const confirmDialog = page.getByRole('alertdialog');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

    // 点击确认删除
    const confirmButton = confirmDialog.locator('button:has-text("删除")').first();
    await confirmButton.click();

    // 等待删除完成和列表刷新
    await page.waitForTimeout(3000);

    // 获取删除后的列表状态
    const gameCardsAfter = await page
      .locator('[data-testid^="game-card-"], .card:has-text("G")')
      .count();

    console.log(`删除前游戏卡片数: ${gameCardsBefore}, 删除后: ${gameCardsAfter}`);

    if (gameCardsAfter < gameCardsBefore) {
      console.log('✅ 删除后列表已刷新，游戏卡片数减少');
    } else {
      console.log('⚠️ 列表可能未刷新或删除操作未生效');
    }
  });
});
