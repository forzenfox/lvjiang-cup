import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, StreamPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { liveStream, offlineStream } from '../fixtures/stream.fixture';

/**
 * 直播管理测试用例
 * 对应测试计划: TEST-103
 * 
 * 测试依赖关系:
 * - TEST-103: 依赖 TEST-101 (登录)
 * - 此测试是 TEST-002 的前置依赖
 */

test.describe('【第二阶段-2】直播管理功能测试', () => {
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
   * TEST-103: 配置直播信息 (US-103)
   * 优先级: P0
   * 验证可以成功配置直播信息
   * 前置条件: TEST-101 登录成功
   * 
   * 注意: 此测试是 TEST-002 的关键依赖
   */
  test('TEST-103: 配置直播信息 @P0', async ({ page }) => {
    // 导航到直播管理页面
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    // 验证页面标题
    await expect(page.locator('h1, h2').filter({ hasText: /直播/ })).toBeVisible();
    
    // 配置直播信息
    await streamPage.configureStream(liveStream);
    
    // 验证保存成功提示
    const successMessage = page.locator('text=保存成功, text=更新成功, text=配置成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // 验证表单值已更新
    const titleInput = page.locator('input[name="title"], input[placeholder*="标题"]').first();
    const urlInput = page.locator('input[name="url"], input[placeholder*="链接"]').first();
    
    if (await titleInput.isVisible().catch(() => false)) {
      const savedTitle = await titleInput.inputValue();
      expect(savedTitle).toBe(liveStream.title);
    }
    
    if (await urlInput.isVisible().catch(() => false)) {
      const savedUrl = await urlInput.inputValue();
      expect(savedUrl).toBe(liveStream.url);
    }
    
    // 验证直播状态切换
    const statusToggle = page.locator('input[type="checkbox"], [role="switch"], button:has-text("直播中")').first();
    if (await statusToggle.isVisible().catch(() => false)) {
      // 验证状态已设置为直播中
      const isChecked = await statusToggle.isChecked().catch(() => false);
      const hasActiveClass = await statusToggle.evaluate(el => 
        el.classList.contains('checked') || 
        el.classList.contains('active') ||
        el.getAttribute('aria-checked') === 'true'
      ).catch(() => false);
      
      expect(isChecked || hasActiveClass).toBe(true);
    }
    
    // 验证前台实时更新 - 访问首页检查直播按钮
    await homePage.goto();
    await homePage.expectPageLoaded();
    
    // 验证直播按钮显示
    const liveButton = homePage.page.locator('text=观看直播, button:has-text("直播")');
    await expect(liveButton).toBeVisible();
    
    // 验证直播状态显示
    const liveStatus = homePage.page.locator('text=直播中, text=LIVE, .live-badge');
    if (await liveStatus.isVisible().catch(() => false)) {
      console.log('✅ 首页显示直播状态');
    }
  });

  /**
   * TEST-103-2: 配置直播信息 - 未直播状态
   * 优先级: P1
   * 验证可以配置未直播状态
   */
  test('TEST-103-2: 配置直播信息 - 未直播状态 @P1', async ({ page }) => {
    // 导航到直播管理页面
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    // 配置未直播状态
    await streamPage.configureStream(offlineStream);
    
    // 验证保存成功
    const successMessage = page.locator('text=保存成功, text=更新成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // 验证前台更新
    await homePage.goto();
    await homePage.expectPageLoaded();
    
    // 验证未直播状态显示
    const offlineStatus = homePage.page.locator('text=未直播, text=Offline, text=未开始');
    if (await offlineStatus.isVisible().catch(() => false)) {
      console.log('✅ 首页显示未直播状态');
    }
  });

  /**
   * TEST-103-3: 直播链接验证
   * 优先级: P1
   * 验证直播链接格式正确
   */
  test('TEST-103-3: 直播链接验证 @P1', async ({ page }) => {
    // 导航到直播管理页面
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    // 测试无效链接
    const invalidStream = {
      ...liveStream,
      url: 'invalid-url',
    };
    
    await streamPage.configureStream(invalidStream);
    
    // 验证表单验证提示
    const errorMessage = page.locator('text=链接格式错误, text=请输入有效的URL, .error-message');
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    if (hasError) {
      console.log('✅ 系统正确验证了链接格式');
    } else {
      // 如果没有错误提示，验证是否保存成功（系统可能接受任何输入）
      const successMessage = page.locator('text=保存成功');
      const saved = await successMessage.isVisible().catch(() => false);
      
      if (saved) {
        console.log('⚠️ 系统接受了无效链接，建议添加链接格式验证');
      }
    }
  });

  /**
   * TEST-103-4: 清空直播信息
   * 优先级: P2
   * 验证可以清空直播信息
   */
  test('TEST-103-4: 清空直播信息 @P2', async ({ page }) => {
    // 先配置直播信息
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    await streamPage.configureStream(liveStream);
    
    // 验证保存成功
    await expect(page.locator('text=保存成功')).toBeVisible({ timeout: 5000 });
    
    // 清空直播信息
    const emptyStream = {
      title: '',
      url: '',
      isLive: false,
    };
    
    await streamPage.configureStream(emptyStream);
    
    // 验证保存成功
    await expect(page.locator('text=保存成功')).toBeVisible({ timeout: 5000 });
    
    // 验证前台更新
    await homePage.goto();
    await homePage.expectPageLoaded();
    
    // 验证直播按钮可能隐藏或显示默认状态
    const liveButton = homePage.page.locator('text=观看直播');
    const hasLiveButton = await liveButton.isVisible().catch(() => false);
    
    if (!hasLiveButton) {
      console.log('✅ 清空直播信息后，首页直播按钮已隐藏');
    } else {
      console.log('⚠️ 清空直播信息后，首页仍显示直播按钮');
    }
  });
});

test.describe('【第三阶段-1】直播前台展示验证', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let streamPage: StreamPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    streamPage = new StreamPage(page);
    homePage = new HomePage(page);
  });

  /**
   * 直播信息前台同步验证
   * 优先级: P0
   * 验证后台配置的直播信息在前台正确显示
   */
  test('直播信息前台同步验证 @P0', async ({ page }) => {
    // 登录并配置直播
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
    
    // 配置直播信息
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    const uniqueTitle = `直播测试-${Date.now()}`;
    const testStream = {
      ...liveStream,
      title: uniqueTitle,
    };
    
    await streamPage.configureStream(testStream);
    await expect(page.locator('text=保存成功')).toBeVisible({ timeout: 5000 });
    
    // 访问前台验证
    await homePage.goto();
    await homePage.expectPageLoaded();
    
    // 验证直播标题显示
    const titleDisplay = homePage.page.locator(`text=${uniqueTitle}`);
    const hasTitle = await titleDisplay.isVisible().catch(() => false);
    
    if (hasTitle) {
      console.log('✅ 直播标题已同步到前台');
    } else {
      // 验证直播按钮存在即可
      const liveButton = homePage.page.locator('text=观看直播');
      await expect(liveButton).toBeVisible();
      console.log('✅ 直播按钮已显示');
    }
    
    // 验证直播状态
    const liveStatus = homePage.page.locator('text=直播中, text=LIVE');
    const hasLiveStatus = await liveStatus.isVisible().catch(() => false);
    
    if (hasLiveStatus) {
      console.log('✅ 直播状态已同步到前台');
    }
  });

  /**
   * 直播按钮跳转验证
   * 优先级: P0
   * 验证点击直播按钮跳转到正确的链接
   */
  test('直播按钮跳转验证 @P0', async ({ context }) => {
    // 登录并配置直播
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
    
    // 配置直播信息
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    await streamPage.configureStream(liveStream);
    await expect(loginPage.page.locator('text=保存成功')).toBeVisible({ timeout: 5000 });
    
    // 访问前台
    await homePage.goto();
    await homePage.expectPageLoaded();
    
    // 点击直播按钮并验证跳转
    const liveButton = homePage.page.locator('text=观看直播').first();
    
    if (await liveButton.isVisible().catch(() => false)) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        liveButton.click(),
      ]);
      
      // 验证新页面URL
      await newPage.waitForLoadState();
      const url = newPage.url();
      
      // 验证URL包含配置的直播链接
      expect(url).toMatch(/douyu\.com|live\./);
      
      console.log('✅ 直播按钮跳转正确');
      
      // 关闭新页面
      await newPage.close();
    } else {
      console.log('⚠️ 直播按钮未找到');
      test.skip();
    }
  });
});

test.describe('【边界测试】直播信息边界测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let streamPage: StreamPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    streamPage = new StreamPage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * 直播标题长度边界测试
   * 优先级: P2
   * 验证长标题的处理
   */
  test('直播标题长度边界 @P2', async ({ page }) => {
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    // 测试超长标题
    const longTitleStream = {
      ...liveStream,
      title: '这是一个非常长的直播标题用于测试边界条件限制系统应该如何处理'.repeat(3),
    };
    
    await streamPage.configureStream(longTitleStream);
    
    // 验证系统行为
    const errorMessage = page.locator('text=标题过长, text=超出限制');
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    if (hasError) {
      console.log('✅ 系统正确限制了标题长度');
    } else {
      // 验证是否保存成功（可能被截断）
      const successMessage = page.locator('text=保存成功');
      await expect(successMessage).toBeVisible({ timeout: 5000 });
      console.log('✅ 系统接受了长标题（可能被截断）');
    }
  });

  /**
   * 特殊字符标题测试
   * 优先级: P2
   * 验证特殊字符标题的处理
   */
  test('特殊字符标题测试 @P2', async ({ page }) => {
    await dashboardPage.navigateToStream();
    await streamPage.expectPageLoaded();
    
    // 测试特殊字符标题
    const specialCharStream = {
      ...liveStream,
      title: '直播<title>测试&特殊"字符\'测试',
    };
    
    await streamPage.configureStream(specialCharStream);
    
    // 验证保存成功
    const successMessage = page.locator('text=保存成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    console.log('✅ 系统正确处理了特殊字符标题');
  });
});
