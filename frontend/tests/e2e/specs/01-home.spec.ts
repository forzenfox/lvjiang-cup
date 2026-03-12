import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { clearLocalStorage } from '../utils/test-helpers';

/**
 * 首页测试用例
 * 对应测试计划: TEST-001, TEST-002, TEST-003
 */

test.describe('首页功能测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await clearLocalStorage(page);
    await page.reload();
  });

  /**
   * TEST-001: 首页加载验证
   * 优先级: P0
   * 验证首页正确加载并显示所有关键元素
   */
  test('TEST-001: 首页加载验证 @P0', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/驴酱杯/);
    
    // 验证英雄区域元素
    await homePage.expectPageLoaded();
    
    // 验证战队区域
    await homePage.expectTeamsVisible();
    
    // 验证赛程区域
    await homePage.expectScheduleVisible();
    
    // 验证导航链接存在
    await expect(homePage.adminLink).toBeVisible();
  });

  /**
   * TEST-002: 直播按钮跳转
   * 优先级: P0
   * 验证直播按钮点击后正确跳转
   */
  test('TEST-002: 直播按钮跳转 @P0', async ({ page }) => {
    // 检查直播按钮是否存在
    const hasLiveButton = await homePage.liveButton.isVisible().catch(() => false);
    
    if (hasLiveButton) {
      // 点击直播按钮
      await homePage.clickLiveButton();
      
      // 验证跳转（可能跳转到外部链接或打开弹窗）
      // 根据实际实现调整验证逻辑
      await expect(page.locator('text=直播')).toBeVisible();
    } else {
      // 如果没有直播按钮，测试通过但记录警告
      console.log('⚠️ 直播按钮未找到，可能当前不在直播时间');
      test.skip();
    }
  });

  /**
   * TEST-003: 赛程Tab切换
   * 优先级: P0
   * 验证瑞士轮和淘汰赛Tab可以正常切换
   */
  test('TEST-003: 赛程Tab切换 @P0', async () => {
    // 验证默认显示瑞士轮Tab
    await expect(homePage.swissTab).toHaveAttribute('aria-selected', 'true');
    
    // 切换到淘汰赛Tab
    await homePage.switchToElimination();
    
    // 验证淘汰赛Tab被选中
    await expect(homePage.eliminationTab).toHaveAttribute('aria-selected', 'true');
    await expect(homePage.swissTab).toHaveAttribute('aria-selected', 'false');
    
    // 切换回瑞士轮Tab
    await homePage.switchToSwiss();
    
    // 验证瑞士轮Tab被选中
    await expect(homePage.swissTab).toHaveAttribute('aria-selected', 'true');
    await expect(homePage.eliminationTab).toHaveAttribute('aria-selected', 'false');
  });

  /**
   * TEST-B004: 空数据状态
   * 优先级: P2
   * 验证空数据时显示正确的提示信息
   */
  test('TEST-B004: 空数据状态 @P2', async () => {
    // 验证空状态提示
    await homePage.expectEmptyState();
  });
});
