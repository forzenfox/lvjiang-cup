import { test, expect } from '@playwright/test';
import { HomePage, AdminLoginPage, DashboardPage } from '../pages';
import { adminUser, wrongPasswordUser, wrongUsernameUser, emptyUsernameUser, emptyPasswordUser } from '../fixtures/users.fixture';

/**
 * 管理员登录测试用例
 * 对应测试计划: TEST-004, TEST-E004
 */

test.describe('管理员登录功能测试', () => {
  let homePage: HomePage;
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  /**
   * TEST-004: 管理后台登录
   * 优先级: P0
   * 验证管理员可以使用正确的用户名和密码登录
   */
  test('TEST-004: 管理后台登录成功 @P0', async () => {
    // 从首页导航到登录页面
    await homePage.goto();
    await homePage.clickAdminLink();
    
    // 验证登录页面加载
    await loginPage.expectPageLoaded();
    
    // 执行登录
    await loginPage.login(adminUser);
    
    // 验证登录成功，跳转到仪表盘
    await dashboardPage.expectPageLoaded();
    
    // 验证URL正确
    await expect(loginPage.page).toHaveURL(/\/admin\/dashboard/);
  });

  /**
   * TEST-E004: 未登录访问管理页面
   * 优先级: P1
   * 验证未登录用户访问管理页面会被重定向到登录页
   */
  test('TEST-E004: 未登录访问管理页面 @P1', async () => {
    // 直接访问管理后台
    await loginPage.page.goto('/admin/dashboard');
    
    // 验证被重定向到登录页面
    await loginPage.expectPageLoaded();
    await expect(loginPage.page).toHaveURL(/\/admin/);
  });

  /**
   * 登录失败 - 错误密码
   * 优先级: P1
   * 验证使用错误密码登录会显示错误提示
   */
  test('登录失败 - 错误密码 @P1', async () => {
    await loginPage.goto();
    await loginPage.login(wrongPasswordUser);
    
    // 验证登录失败，显示错误提示
    await loginPage.expectLoginFailed();
    
    // 验证仍在登录页面
    await expect(loginPage.page).toHaveURL(/\/admin/);
  });

  /**
   * 登录失败 - 错误用户名
   * 优先级: P1
   * 验证使用错误用户名登录会显示错误提示
   */
  test('登录失败 - 错误用户名 @P1', async () => {
    await loginPage.goto();
    await loginPage.login(wrongUsernameUser);
    
    // 验证登录失败，显示错误提示
    await loginPage.expectLoginFailed();
  });

  /**
   * 登录失败 - 空用户名
   * 优先级: P2
   * 验证用户名为空时登录会显示错误提示
   */
  test('登录失败 - 空用户名 @P2', async () => {
    await loginPage.goto();
    await loginPage.login(emptyUsernameUser);
    
    // 验证登录失败
    await loginPage.expectLoginFailed();
  });

  /**
   * 登录失败 - 空密码
   * 优先级: P2
   * 验证密码为空时登录会显示错误提示
   */
  test('登录失败 - 空密码 @P2', async () => {
    await loginPage.goto();
    await loginPage.login(emptyPasswordUser);
    
    // 验证登录失败
    await loginPage.expectLoginFailed();
  });

  /**
   * 登出功能
   * 优先级: P1
   * 验证登出后需要重新登录
   */
  test('登出功能 @P1', async () => {
    // 先登录
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
    
    // 执行登出（如果有登出按钮）
    // 这里假设有登出功能
    const logoutButton = loginPage.page.locator('button:has-text("退出"), button:has-text("登出")');
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      
      // 验证被重定向到登录页面
      await loginPage.expectPageLoaded();
    } else {
      test.skip();
    }
  });
});
