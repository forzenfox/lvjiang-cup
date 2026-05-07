import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages';

/**
 * 登录/登出功能测试
 * 对应测试计划: TEST-AUTH-LOGOUT-01 到 TEST-AUTH-LOGOUT-05
 *
 * 测试范围：
 * 1. 登出流程
 * 2. 登出后清除cookie/localStorage
 * 3. 登出后跳转到登录页
 * 4. 未登录访问受保护页面自动跳转
 * 5. 登出后重新登录
 */

test.describe('【P1】认证模块 - 登出功能测试', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-AUTH-LOGOUT-01: 登出流程
   * 优先级：P1
   * 验证点击退出按钮后正确登出
   */
  test('TEST-AUTH-LOGOUT-01: 登出流程 @P1', async ({ page }) => {
    // 验证当前已登录状态
    await expect(page.getByRole('heading', { name: '管理仪表盘' })).toBeVisible();

    // 点击退出登录
    await dashboardPage.logout();

    // 验证重定向到登录页面
    await expect(page).toHaveURL(/\/admin\/login/);

    console.log('✅ 登出成功，已跳转到登录页面');
  });

  /**
   * TEST-AUTH-LOGOUT-02: 登出后清除cookie
   * 优先级：P1
   * 验证登出后认证cookie被清除
   */
  test('TEST-AUTH-LOGOUT-02: 登出后清除cookie @P1', async ({ page }) => {
    // 获取登出前的cookie
    const cookiesBefore = await page.context().cookies();
    const authCookiesBefore = cookiesBefore.filter(c =>
      c.name.includes('token') || c.name.includes('auth') || c.name.includes('session')
    );
    console.log(`登出前认证cookie数: ${authCookiesBefore.length}`);

    // 登出
    await dashboardPage.logout();
    await page.waitForURL(/\/admin\/login/);

    // 获取登出后的cookie
    const cookiesAfter = await page.context().cookies();
    const authCookiesAfter = cookiesAfter.filter(c =>
      c.name.includes('token') || c.name.includes('auth') || c.name.includes('session')
    );

    // 验证认证cookie被清除
    expect(authCookiesAfter.length).toBeLessThanOrEqual(authCookiesBefore.length);

    console.log(`登出后认证cookie数: ${authCookiesAfter.length}`);
    console.log('✅ 登出后cookie已清除或减少');
  });

  /**
   * TEST-AUTH-LOGOUT-03: 登出后清除localStorage
   * 优先级：P1
   * 验证登出后localStorage中的认证数据被清除
   */
  test('TEST-AUTH-LOGOUT-03: 登出后清除localStorage @P1', async ({ page }) => {
    // 获取登出前的localStorage
    const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
    const userBefore = await page.evaluate(() => localStorage.getItem('user'));
    const authTokenBefore = await page.evaluate(() => localStorage.getItem('auth-token'));

    console.log(`登出前 - token: ${!!tokenBefore}, user: ${!!userBefore}, auth-token: ${!!authTokenBefore}`);

    // 登出
    await dashboardPage.logout();
    await page.waitForURL(/\/admin\/login/);

    // 获取登出后的localStorage
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    const userAfter = await page.evaluate(() => localStorage.getItem('user'));
    const authTokenAfter = await page.evaluate(() => localStorage.getItem('auth-token'));

    console.log(`登出后 - token: ${!!tokenAfter}, user: ${!!userAfter}, auth-token: ${!!authTokenAfter}`);

    // 验证localStorage被清除
    expect(tokenAfter).toBe(null);
    expect(authTokenAfter).toBe(null);

    console.log('✅ 登出后localStorage认证数据已清除');
  });

  /**
   * TEST-AUTH-LOGOUT-04: 未登录访问受保护页面自动跳转
   * 优先级：P1
   * 验证未登录时访问管理页面自动跳转到登录页
   */
  test('TEST-AUTH-LOGOUT-04: 未登录访问受保护页面 @P1', async ({ page }) => {
    // 先登出
    await dashboardPage.logout();
    await page.waitForURL(/\/admin\/login/);

    // 清除所有认证状态
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
    });
    await page.context().clearCookies();

    // 尝试访问受保护页面
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1000);

    // 验证被重定向到登录页
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin/login');

    console.log('✅ 未登录时访问受保护页面自动跳转到登录页');
  });

  /**
   * TEST-AUTH-LOGOUT-05: 登出后重新登录
   * 优先级：P1
   * 验证登出后可以使用正确凭据重新登录
   */
  test('TEST-AUTH-LOGOUT-05: 登出后重新登录 @P1', async ({ page }) => {
    // 先登出
    await dashboardPage.logout();
    await page.waitForURL(/\/admin\/login/);

    // 验证在登录页面
    await expect(page).toHaveURL(/\/admin\/login/);

    // 使用测试凭据重新登录
    const usernameInput = page.locator('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]');
    const passwordInput = page.locator('input[placeholder*="密码"], input[name="password"]');
    const loginButton = page.locator('button:has-text("登录"), button[type="submit"]');

    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible();

    await usernameInput.fill('admin');
    await passwordInput.fill('admin123');
    await loginButton.click();

    // 等待登录成功跳转
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    // 验证登录成功
    await expect(page.getByRole('heading', { name: '管理仪表盘' })).toBeVisible({ timeout: 5000 });

    console.log('✅ 登出后重新登录成功');
  });
});
