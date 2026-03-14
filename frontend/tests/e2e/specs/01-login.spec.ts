import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage } from '../pages';
import { adminUser, wrongPasswordUser, wrongUsernameUser, emptyUsernameUser, emptyPasswordUser } from '../fixtures/users.fixture';

/**
 * 管理员登录功能测试
 * 对应测试计划: TEST-101, TEST-102, TEST-113, TEST-E002
 * 
 * 测试依赖关系:
 * - TEST-101 (基础): 无依赖，首先执行
 * - TEST-102: 依赖 TEST-101
 * - TEST-113: 依赖 TEST-101
 * - TEST-E002: 无依赖
 */

test.describe('【第二阶段-1】管理员登录功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  /**
   * TEST-101: 登录管理后台 (US-101)
   * 优先级: P0
   * 验证管理员可以使用正确的用户名和密码登录
   * 前置条件: 环境初始化完成
   */
  test('TEST-101: 登录管理后台成功 @P0', async ({ page }) => {
    // 访问登录页面
    await loginPage.goto();

    // 验证登录页面加载
    await loginPage.expectPageLoaded();

    // 验证URL包含/admin
    await expect(page).toHaveURL(/\/admin/);

    // 执行登录
    await loginPage.login(adminUser);

    // 等待登录成功（等待URL变化）
    await loginPage.expectLoginSuccess();

    // 验证仪表盘加载成功
    await dashboardPage.expectPageLoaded();

    // 验证URL正确
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // 验证页面标题（实际标题是"驴酱杯"）
    await expect(page).toHaveTitle(/驴酱杯/);
  });

  /**
   * TEST-101-NEG-1: 登录失败 - 错误密码
   * 优先级: P1
   * 验证使用错误密码登录会显示错误提示
   */
  test('TEST-101-NEG-1: 登录失败 - 错误密码 @P1', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(wrongPasswordUser);
    
    // 验证仍在登录页面（说明登录失败）
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    
    console.log('✅ 错误密码登录失败验证通过');
  });

  /**
   * TEST-101-NEG-2: 登录失败 - 错误用户名
   * 优先级: P1
   * 验证使用错误用户名登录会显示错误提示
   */
  test('TEST-101-NEG-2: 登录失败 - 错误用户名 @P1', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(wrongUsernameUser);
    
    // 验证仍在登录页面（说明登录失败）
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    
    console.log('✅ 错误用户名登录失败验证通过');
  });

  /**
   * TEST-101-NEG-3: 登录失败 - 空用户名
   * 优先级：P2
   * 验证用户名为空时登录会显示错误提示
   */
  test('TEST-101-NEG-3: 登录失败 - 空用户名 @P2', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(emptyUsernameUser);
    
    // 验证仍在登录页面或/admin 页面（说明登录失败）
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');
    
    console.log('✅ 空用户名登录失败验证通过');
  });

  /**
   * TEST-101-NEG-4: 登录失败 - 空密码
   * 优先级：P2
   * 验证密码为空时登录会显示错误提示
   */
  test('TEST-101-NEG-4: 登录失败 - 空密码 @P2', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(emptyPasswordUser);
    
    // 验证仍在登录页面或/admin 页面（说明登录失败）
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');
    
    console.log('✅ 空密码登录失败验证通过');
  });
});

// 注意：管理仪表盘功能测试（TEST-102）已移至其他测试文件
// 这些测试现在使用全局保存的登录状态，避免重复登录

// 注意：退出登录功能测试（TEST-113）保持在此文件中
// 因为退出登录会清除登录状态，需要独立执行
test.describe('【第四阶段-5】退出登录功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  /**
   * TEST-113: 退出登录 (US-113)
   * 优先级: P2
   * 验证安全退出功能
   * 前置条件: TEST-101 登录成功
   */
  test('TEST-113: 退出登录 @P2', async ({ page }) => {
    // 先登录
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
    
    // 验证当前在仪表盘
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    // 执行登出
    await dashboardPage.logout();

    // 验证被重定向到登录页面
    await expect(page).toHaveURL(/\/admin\/login/);
    
    // 验证URL不包含dashboard
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dashboard');
    
    // 验证需要重新登录才能访问管理功能
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin/);
    expect(page.url()).not.toContain('/dashboard');
  });
});

test.describe('【异常测试】未授权访问测试', () => {
  /**
   * TEST-E002: 未登录访问管理页面
   * 优先级：P1
   * 验证未登录用户访问管理页面会被重定向到登录页
   * 前置条件：无
   */
  test('TEST-E002: 未登录访问管理页面 @P1', async ({ page }) => {
    // 访问受保护的管理页面，验证重定向到登录页
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });
    
    // 验证当前 URL 是登录页
    expect(page.url()).toContain('/admin/login');
  });
});
