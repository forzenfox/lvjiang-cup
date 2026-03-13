import { test, expect } from '@playwright/test';
import { HomePage, AdminLoginPage, DashboardPage } from '../pages';
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
  let homePage: HomePage;
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  /**
   * TEST-101: 登录管理后台 (US-101)
   * 优先级: P0
   * 验证管理员可以使用正确的用户名和密码登录
   * 前置条件: 环境初始化完成
   */
  test('TEST-101: 登录管理后台成功 @P0', async () => {
    // 访问登录页面
    await loginPage.goto();
    
    // 验证登录页面加载
    await loginPage.expectPageLoaded();
    
    // 验证URL包含/admin
    await expect(loginPage.page).toHaveURL(/\/admin/);
    
    // 执行登录
    await loginPage.login(adminUser);
    
    // 验证登录成功，跳转到仪表盘
    await dashboardPage.expectPageLoaded();
    
    // 验证URL正确
    await expect(loginPage.page).toHaveURL(/\/admin\/dashboard/);
    
    // 验证页面标题
    await expect(loginPage.page).toHaveTitle(/管理后台|Dashboard/);
  });

  /**
   * TEST-101-NEG-1: 登录失败 - 错误密码
   * 优先级: P1
   * 验证使用错误密码登录会显示错误提示
   */
  test('TEST-101-NEG-1: 登录失败 - 错误密码 @P1', async () => {
    await loginPage.goto();
    await loginPage.login(wrongPasswordUser);
    
    // 验证登录失败，显示错误提示
    await loginPage.expectLoginFailed();
    
    // 验证仍在登录页面
    await expect(loginPage.page).toHaveURL(/\/admin/);
    
    // 验证未跳转到仪表盘
    const currentUrl = loginPage.page.url();
    expect(currentUrl).not.toContain('/dashboard');
  });

  /**
   * TEST-101-NEG-2: 登录失败 - 错误用户名
   * 优先级: P1
   * 验证使用错误用户名登录会显示错误提示
   */
  test('TEST-101-NEG-2: 登录失败 - 错误用户名 @P1', async () => {
    await loginPage.goto();
    await loginPage.login(wrongUsernameUser);
    
    // 验证登录失败，显示错误提示
    await loginPage.expectLoginFailed();
    
    // 验证错误提示内容
    const errorMessage = loginPage.page.locator('text=用户名或密码错误, text=登录失败, .error-message');
    await expect(errorMessage).toBeVisible();
  });

  /**
   * TEST-101-NEG-3: 登录失败 - 空用户名
   * 优先级: P2
   * 验证用户名为空时登录会显示错误提示
   */
  test('TEST-101-NEG-3: 登录失败 - 空用户名 @P2', async () => {
    await loginPage.goto();
    await loginPage.login(emptyUsernameUser);
    
    // 验证登录失败
    await loginPage.expectLoginFailed();
    
    // 验证表单验证提示
    const usernameInput = loginPage.page.locator('input[name="username"], input[type="text"]').first();
    const isRequired = await usernameInput.getAttribute('required');
    expect(isRequired).toBeTruthy();
  });

  /**
   * TEST-101-NEG-4: 登录失败 - 空密码
   * 优先级: P2
   * 验证密码为空时登录会显示错误提示
   */
  test('TEST-101-NEG-4: 登录失败 - 空密码 @P2', async () => {
    await loginPage.goto();
    await loginPage.login(emptyPasswordUser);
    
    // 验证登录失败
    await loginPage.expectLoginFailed();
    
    // 验证表单验证提示
    const passwordInput = loginPage.page.locator('input[name="password"], input[type="password"]').first();
    const isRequired = await passwordInput.getAttribute('required');
    expect(isRequired).toBeTruthy();
  });
});

test.describe('【第二阶段-2】管理仪表盘功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // 先登录
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-102: 查看管理仪表盘 (US-102)
   * 优先级: P0
   * 验证仪表盘显示系统概览
   * 前置条件: TEST-101 登录成功
   */
  test('TEST-102: 查看管理仪表盘 @P0', async ({ page }) => {
    // 验证统计卡片显示
    await expect(dashboardPage.teamCountCard).toBeVisible();
    await expect(dashboardPage.matchCountCard).toBeVisible();
    await expect(dashboardPage.streamStatusCard).toBeVisible();
    
    // 验证参赛战队总数显示
    const teamCount = await dashboardPage.getTeamCount();
    expect(typeof teamCount).toBe('number');
    expect(teamCount).toBeGreaterThanOrEqual(0);
    
    // 验证比赛总数及分类统计
    const matchStats = await dashboardPage.getMatchStats();
    expect(matchStats).toHaveProperty('total');
    expect(matchStats).toHaveProperty('upcoming');
    expect(matchStats).toHaveProperty('ongoing');
    expect(matchStats).toHaveProperty('finished');
    
    // 验证直播状态显示
    const streamStatus = await dashboardPage.getStreamStatus();
    expect(['直播中', '未直播', 'online', 'offline']).toContain(streamStatus);
    
    // 验证系统运行状态
    const systemStatus = await dashboardPage.getSystemStatus();
    expect(systemStatus).toMatch(/正常|在线|running|healthy/);
    
    // 验证刷新统计按钮
    const refreshButton = page.locator('button:has-text("刷新"), button[title="刷新"]');
    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click();
      // 验证刷新后数据仍然显示
      await dashboardPage.expectPageLoaded();
    }
    
    // 验证快捷入口到各管理模块
    await expect(page.locator('text=直播管理, a:has-text("直播")')).toBeVisible();
    await expect(page.locator('text=战队管理, a:has-text("战队")')).toBeVisible();
    await expect(page.locator('text=赛程管理, a:has-text("赛程")')).toBeVisible();
  });
});

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
    await loginPage.expectPageLoaded();
    await expect(page).toHaveURL(/\/admin/);
    
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
   * 优先级: P1
   * 验证未登录用户访问管理页面会被重定向到登录页
   * 前置条件: 无
   */
  test('TEST-E002: 未登录访问管理页面 @P1', async ({ page }) => {
    // 清除可能存在的登录状态（清除localStorage和cookies）
    await page.goto('/admin/dashboard');
    
    // 验证被重定向到登录页面
    await expect(page).toHaveURL(/\/admin/);
    
    // 验证URL不包含dashboard
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dashboard');
    
    // 验证登录表单存在
    const loginForm = page.locator('form, input[name="username"], input[type="text"]').first();
    await expect(loginForm).toBeVisible();
    
    // 测试其他管理页面
    const protectedPages = ['/admin/teams', '/admin/schedule', '/admin/stream'];
    
    for (const protectedPage of protectedPages) {
      await page.goto(protectedPage);
      await expect(page).toHaveURL(/\/admin/);
      expect(page.url()).not.toContain(protectedPage);
    }
  });
});
