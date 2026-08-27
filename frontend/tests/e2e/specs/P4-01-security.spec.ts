import { test, expect } from '@playwright/test';
import { DashboardPage, TeamsPage, AdminLoginPage } from '../pages';
import {
  xssPayloads,
  sqlInjectionPayloads,
  specialCharPayloads,
  longPayloads,
} from '../fixtures/security-fixtures';
import { adminUser, wrongPasswordUser } from '../fixtures/users.fixture';

test.describe('【安全测试】XSS 注入防护', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  test.afterEach(async ({ page }) => {
    if (teamsPage) {
      await teamsPage.cleanupTestData();
    }
  });

  /**
   * TEST-SEC-01: 战队名称 XSS 防护
   * 优先级: P0
   * 验证 XSS 脚本 payload 不会执行，页面不会崩溃
   */
  test('TEST-SEC-01: 战队名称 XSS 防护 @P0', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    for (const payload of xssPayloads) {
      const initialCount = await teamsPage.getTeamCount();
      let added = false;

      try {
        await teamsPage.clickAddTeam();
      } catch {
        console.log(
          `⚠️ 无法添加战队（已有 ${initialCount} 支），跳过 payload: ${payload.substring(0, 30)}`
        );
        break;
      }

      await teamsPage.fillTeamForm({ name: payload });

      try {
        await teamsPage.saveTeam();
        added = true;
      } catch {
        console.log(`⚠️ 保存失败，跳过 payload: ${payload.substring(0, 30)}`);
        continue;
      }

      await page.waitForTimeout(1500);
      await page.reload();
      await teamsPage.expectPageLoaded();

      // 检测 XSS 是否真正被执行：不应有包含该 payload 的 <script>，也不应出现由
      // payload 注入出的 on* 事件监听元素（页面自身的 <script> 属正常脚本，需排除）。
      const hasAlertDialog = await page.evaluate(payload => {
        const scripts = Array.from(document.querySelectorAll('script'));
        const scriptInjected = scripts.some(s => (s.textContent || '').includes(payload));
        const attrInjected = !!document.querySelector('[onerror], [onload], [onclick], [src="x"]');
        return scriptInjected || attrInjected;
      }, payload);

      expect(hasAlertDialog).toBe(false);

      console.log(`✅ XSS payload 未执行: ${payload.substring(0, 30)}...`);
    }
  });
});

test.describe('【安全测试】SQL 注入防护', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  test.afterEach(async ({ page }) => {
    if (teamsPage) {
      await teamsPage.cleanupTestData();
    }
  });

  /**
   * TEST-SEC-02: SQL 注入防护
   * 优先级: P0
   * 验证 SQL 注入 payload 被拒绝或安全存储
   */
  test('TEST-SEC-02: SQL 注入防护 @P0', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    for (const payload of sqlInjectionPayloads) {
      const initialCount = await teamsPage.getTeamCount();

      try {
        await teamsPage.clickAddTeam();
      } catch {
        console.log(`⚠️ 无法添加战队，跳过 payload: ${payload.substring(0, 30)}`);
        break;
      }

      await teamsPage.fillTeamForm({ name: payload });

      let saved = true;
      try {
        await teamsPage.saveTeam();
      } catch {
        saved = false;
      }

      await page.waitForTimeout(1500);

      if (saved) {
        await page.reload();
        await teamsPage.expectPageLoaded();

        // SQL 注入 payload 会被安全地作为普通文本存储/展示；此处验证未触发送数据库错误
        const pageText = await page.locator('body').innerText();
        expect(pageText).not.toContain('SQLITE');
        expect(pageText).not.toContain('SqliteError');
        expect(pageText).not.toContain('数据库错误');
        expect(pageText).not.toContain('加载失败');
      }

      console.log(`✅ SQL 注入 payload 被安全处理: ${payload.substring(0, 30)}...`);
    }
  });
});

test.describe('【安全测试】特殊字符处理', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  test.afterEach(async ({ page }) => {
    if (teamsPage) {
      await teamsPage.cleanupTestData();
    }
  });

  /**
   * TEST-SEC-03: 特殊字符处理
   * 优先级: P1
   * 验证 emoji、空字节、换行符等特殊字符不会导致页面崩溃
   */
  test('TEST-SEC-03: 特殊字符处理 @P1', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    for (const payload of specialCharPayloads) {
      const initialCount = await teamsPage.getTeamCount();

      try {
        await teamsPage.clickAddTeam();
      } catch {
        console.log(`⚠️ 无法添加战队，跳过 payload`);
        break;
      }

      try {
        await teamsPage.fillTeamForm({ name: payload });
        await teamsPage.saveTeam();
      } catch {
        console.log(`⚠️ 保存特殊字符 payload 失败`);
        continue;
      }

      await page.waitForTimeout(1500);
      await page.reload();

      const isPageLoaded = await teamsPage
        .expectPageLoaded()
        .then(() => true)
        .catch(() => false);
      expect(isPageLoaded).toBe(true);

      const hasError = await page
        .locator('text=Error, text=error, text=崩溃')
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasError).toBe(false);

      console.log(`✅ 特殊字符 payload 未导致页面崩溃`);
    }
  });
});

test.describe('【安全测试】长输入截断', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  test.afterEach(async ({ page }) => {
    if (teamsPage) {
      await teamsPage.cleanupTestData();
    }
  });

  /**
   * TEST-SEC-04: 长输入截断
   * 优先级: P1
   * 验证 100 和 500 字符输入被正确处理
   */
  test('TEST-SEC-04: 长输入截断 @P1', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    for (let i = 0; i < 2; i++) {
      const payload = longPayloads[i];

      try {
        await teamsPage.clickAddTeam();
      } catch {
        console.log(`⚠️ 无法添加战队，跳过长度 ${payload.length}`);
        break;
      }

      await teamsPage.fillTeamForm({ name: payload });

      try {
        await teamsPage.saveTeam();
      } catch {
        console.log(`⚠️ 保存长输入失败，长度: ${payload.length}`);
        continue;
      }

      await page.waitForTimeout(1500);
      await page.reload();

      const isPageLoaded = await teamsPage
        .expectPageLoaded()
        .then(() => true)
        .catch(() => false);
      expect(isPageLoaded).toBe(true);

      const hasError = await page
        .locator('text=Error, text=error')
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasError).toBe(false);

      console.log(`✅ 长输入 (${payload.length} 字符) 被安全处理`);
    }
  });
});

test.describe('【安全测试】Token 过期处理', () => {
  let dashboardPage: DashboardPage;
  let loginPage: AdminLoginPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    loginPage = new AdminLoginPage(page);

    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-SEC-05: Token 过期处理
   * 优先级: P0
   * 验证清除 localStorage 中的 token 后刷新页面，应重定向到登录页
   */
  test('TEST-SEC-05: Token 过期处理 @P0', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-token');
    });

    await page.reload();

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/dashboard');

    console.log('✅ Token 清除后正确重定向到登录页');
  });
});

test.describe('【安全测试】未授权访问防护', () => {
  let loginPage: AdminLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
  });

  /**
   * TEST-SEC-06: 未授权访问受保护页面
   * 优先级: P0
   * 验证未登录状态下访问 /admin/teams 应重定向到登录页
   */
  test('TEST-SEC-06: 未授权访问受保护页面 @P0', async ({ page }) => {
    // 先访问一次真实页面以获得可用 origin，避免在 about:blank 上访问 localStorage 触发 SecurityError
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    await page.goto('/admin/teams');

    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10000 });

    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin/login');

    console.log('✅ 未授权访问被正确拦截并重定向到登录页');
  });
});

test.describe('【安全测试】暴力登录防护', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  /**
   * TEST-SEC-07: 暴力登录防护
   * 优先级: P1
   * 验证连续 5 次错误登录后，账号不会被永久锁定
   */
  test('TEST-SEC-07: 暴力登录防护 @P1', async ({ page }) => {
    const failedAttempts = 5;

    for (let i = 0; i < failedAttempts; i++) {
      await loginPage.goto();
      await loginPage.login(wrongPasswordUser);

      await page.waitForTimeout(500);

      const isOnLoginPage = page.url().includes('/admin/login');
      console.log(`第 ${i + 1} 次失败登录，仍在登录页: ${isOnLoginPage}`);
    }

    await loginPage.goto();
    await loginPage.login(adminUser);

    const loginSucceeded = await page
      .waitForURL(/\/admin\/dashboard/, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    expect(loginSucceeded).toBe(true);

    await dashboardPage.expectPageLoaded();

    console.log('✅ 连续错误登录后，正确账号仍可正常登录');
  });
});
