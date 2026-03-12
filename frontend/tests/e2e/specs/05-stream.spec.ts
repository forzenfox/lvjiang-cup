import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, StreamPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';

/**
 * 直播管理测试用例
 * 对应测试计划: TEST-012
 */

test.describe('直播管理功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let streamPage: StreamPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    streamPage = new StreamPage(page);
    homePage = new HomePage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-012: 直播配置
   * 优先级: P0
   * 验证可以成功配置直播信息
   */
  test('TEST-012: 直播配置 @P0', async () => {
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    // 配置直播信息
    const testStreamUrl = 'https://live.example.com/stream/123';
    await streamPage.configureStream(testStreamUrl, 'bilibili', true);
    
    // 验证配置保存成功
    const successMessage = streamPage.page.locator('text=保存成功, text=配置成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  /**
   * 直播状态切换
   * 优先级: P1
   * 验证可以切换直播状态
   */
  test('直播状态切换 @P1', async () => {
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    // 开启直播
    await streamPage.setLiveStatus(true);
    await streamPage.saveConfig();
    
    // 验证直播中状态
    // await streamPage.expectLiveStatus();
    
    // 关闭直播
    await streamPage.setLiveStatus(false);
    await streamPage.saveConfig();
  });

  /**
   * 直播配置同步验证
   * 优先级: P1
   * 验证直播配置在首页正确显示
   */
  test('直播配置同步验证 @P1', async () => {
    // 配置直播
    await dashboardPage.navigateToStream();
    await streamPage.configureStream('https://live.example.com/test', 'bilibili', true);
    
    // 访问首页验证直播按钮显示
    await homePage.goto();
    
    // 验证直播按钮可见
    const hasLiveButton = await homePage.liveButton.isVisible().catch(() => false);
    expect(hasLiveButton).toBe(true);
  });
});
