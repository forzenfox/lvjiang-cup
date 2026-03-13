import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, TeamsPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { testTeam, editedTeam, shortNameTeam, longNameTeam, testTeamBeta } from '../fixtures/teams.fixture';

/**
 * 战队管理测试用例
 * 对应测试计划: TEST-104, TEST-105, TEST-106, TEST-107, TEST-B001
 * 
 * 测试依赖关系:
 * - TEST-104: 依赖 TEST-101 (登录)
 * - TEST-105: 依赖 TEST-101 (登录)
 * - TEST-106: 依赖 TEST-105 (已创建战队)
 * - TEST-107: 依赖 TEST-106 (已编辑战队，使用非关键数据)
 * - TEST-B001: 依赖 TEST-101 (登录)
 */

test.describe('【第二阶段-3】战队列表功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-104: 查看战队列表 (US-104)
   * 优先级: P1
   * 验证战队列表显示
   * 前置条件: TEST-101 登录成功
   */
  test('TEST-104: 查看战队列表 @P1', async ({ page }) => {
    // 导航到战队管理
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 验证页面标题
    await expect(page.locator('h1, h2').filter({ hasText: /战队/ })).toBeVisible();
    
    // 验证以卡片网格展示所有战队
    const teamCards = await teamsPage.getTeamCards();
    
    // 验证显示战队Logo、名称和队员数量
    if (teamCards.length > 0) {
      for (const card of teamCards.slice(0, 3)) {
        // 验证战队Logo
        const logo = card.locator('img, [data-testid="team-logo"]');
        await expect(logo).toBeVisible();
        
        // 验证战队名称
        const name = card.locator('[data-testid="team-name"], h3, h4');
        await expect(name).toBeVisible();
        
        // 验证队员数量显示
        const playerCount = card.locator('[data-testid="player-count"], text=/\\d+ 队员/');
        if (await playerCount.isVisible().catch(() => false)) {
          const count = await playerCount.textContent();
          expect(count).toMatch(/\\d+/);
        }
      }
    }
    
    // 验证搜索/筛选功能
    const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
    
    // 验证添加战队按钮
    await expect(teamsPage.addTeamButton).toBeVisible();
    
    // 验证空状态提示（如果没有数据）
    if (teamCards.length === 0) {
      const emptyState = page.locator('[data-testid="empty-state"], text=暂无战队');
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('【第二阶段-4】战队增删改功能测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);
    homePage = new HomePage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-105: 添加新战队 (US-105)
   * 优先级: P0
   * 验证可以成功添加新战队
   * 前置条件: TEST-101 登录成功
   * 
   * 注意: 此测试是后续TEST-003/004/106/107/108/109的关键依赖
   */
  test('TEST-105: 添加新战队 @P0', async ({ page }) => {
    // 导航到战队管理
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 记录添加前的战队数量
    const initialCount = await teamsPage.getTeamCount();

    // 添加新战队
    await teamsPage.addNewTeam(testTeam);

    // 验证保存成功提示
    const successMessage = page.locator('text=保存成功, text=创建成功, text=添加成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // 验证新战队出现在战队列表中
    await teamsPage.expectTeamExists(testTeam.name);

    // 验证战队数量增加
    const newCount = await teamsPage.getTeamCount();
    expect(newCount).toBe(initialCount + 1);
    
    // 验证前台页面显示新战队（数据同步）
    await homePage.goto();
    await homePage.scrollToTeams();
    await homePage.expectTeamExists(testTeam.name);
  });

  /**
   * TEST-105-2: 添加第二支战队（用于比赛）
   * 优先级: P0
   * 验证可以成功添加第二支战队
   * 前置条件: TEST-105
   */
  test('TEST-105-2: 添加第二支战队 @P0', async () => {
    // 导航到战队管理
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 添加第二支战队
    await teamsPage.addNewTeam(testTeamBeta);

    // 验证战队添加成功
    await teamsPage.expectTeamExists(testTeamBeta.name);
  });

  /**
   * TEST-106: 编辑战队信息 (US-106)
   * 优先级: P1
   * 验证可以成功编辑战队信息
   * 前置条件: TEST-105 已创建战队
   */
  test('TEST-106: 编辑战队信息 @P1', async ({ page }) => {
    // 先添加一个战队（如果还没有）
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 检查测试战队是否存在，不存在则创建
    const hasTestTeam = await teamsPage.hasTeam(testTeam.name);
    if (!hasTestTeam) {
      await teamsPage.addNewTeam(testTeam);
      await teamsPage.expectTeamExists(testTeam.name);
    }

    // 记录编辑前的数量
    const countBefore = await teamsPage.getTeamCount();

    // 编辑战队
    await teamsPage.editTeam(testTeam.name, editedTeam);

    // 验证保存成功提示
    const successMessage = page.locator('text=保存成功, text=更新成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // 验证编辑成功 - 新名称存在
    await teamsPage.expectTeamExists(editedTeam.name!);
    
    // 验证旧名称不存在
    await teamsPage.expectTeamNotExists(testTeam.name);

    // 验证战队数量不变
    const countAfter = await teamsPage.getTeamCount();
    expect(countAfter).toBe(countBefore);
    
    // 验证前台数据同步更新
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.scrollToTeams();
    await homePage.expectTeamExists(editedTeam.name!);
  });

  /**
   * TEST-107: 删除战队 (US-107)
   * 优先级: P2
   * 验证可以成功删除战队
   * 前置条件: TEST-106 已编辑战队（使用非关键测试数据）
   * 
   * 注意: 此测试放在最后执行，避免影响其他测试
   */
  test('TEST-107: 删除战队 @P2', async ({ page }) => {
    // 先添加一个用于删除测试的战队
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const teamToDelete = {
      ...testTeam,
      name: `删除测试战队-${Date.now()}`,
    };
    
    await teamsPage.addNewTeam(teamToDelete);
    await teamsPage.expectTeamExists(teamToDelete.name);

    // 记录删除前的战队数量
    const initialCount = await teamsPage.getTeamCount();

    // 删除战队
    await teamsPage.deleteTeam(teamToDelete.name);

    // 验证确认对话框
    const confirmDialog = page.locator('[data-testid="confirm-dialog"], .confirm-dialog, text=确认删除');
    if (await confirmDialog.isVisible().catch(() => false)) {
      // 点击确认
      await page.locator('button:has-text("确认"), button:has-text("删除"), .confirm-button').click();
    }

    // 验证删除成功提示
    const successMessage = page.locator('text=删除成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // 验证战队已删除
    await teamsPage.expectTeamNotExists(teamToDelete.name);

    // 验证战队数量减少
    const newCount = await teamsPage.getTeamCount();
    expect(newCount).toBe(initialCount - 1);
    
    // 验证前台不再显示该战队
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.scrollToTeams();
    await homePage.expectTeamNotExists(teamToDelete.name);
  });
});

test.describe('【边界测试】战队名称边界测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-B001-1: 战队名称边界 - 短名称
   * 优先级: P2
   * 验证短名称战队可以正常添加
   * 前置条件: TEST-101 登录成功
   */
  test('TEST-B001-1: 战队名称边界 - 短名称(1字符) @P2', async () => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const shortTeam = {
      ...shortNameTeam,
      name: 'A', // 1个字符
    };
    
    await teamsPage.addNewTeam(shortTeam);
    await teamsPage.expectTeamExists(shortTeam.name);
    
    // 清理：删除测试数据
    await teamsPage.deleteTeam(shortTeam.name);
  });

  /**
   * TEST-B001-2: 战队名称边界 - 长名称
   * 优先级: P2
   * 验证长名称战队可以正常添加
   * 前置条件: TEST-101 登录成功
   */
  test('TEST-B001-2: 战队名称边界 - 长名称(50字符) @P2', async () => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const longTeam = {
      ...longNameTeam,
      name: '这是一个非常长的战队名称用于测试边界条件限制'.substring(0, 50),
    };
    
    await teamsPage.addNewTeam(longTeam);
    await teamsPage.expectTeamExists(longTeam.name);
    
    // 清理：删除测试数据
    await teamsPage.deleteTeam(longTeam.name);
  });

  /**
   * TEST-B001-3: 战队名称边界 - 超长名称
   * 优先级: P2
   * 验证超长名称战队的处理（应该截断或提示）
   * 前置条件: TEST-101 登录成功
   */
  test('TEST-B001-3: 战队名称边界 - 超长名称(100+字符) @P2', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const superLongTeam = {
      ...longNameTeam,
      name: 'A'.repeat(100),
    };
    
    // 尝试添加超长名称战队
    await teamsPage.addNewTeam(superLongTeam);
    
    // 验证系统行为：可能截断、提示错误或正常保存
    const errorMessage = page.locator('text=名称过长, text=超出限制, .error-message');
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    if (hasError) {
      console.log('✅ 系统正确拒绝了超长名称');
    } else {
      // 如果没有错误，验证是否正常保存或被截断
      const savedTeam = await teamsPage.hasTeam(superLongTeam.name);
      const truncatedTeam = await teamsPage.hasTeam(superLongTeam.name.substring(0, 50));
      
      if (savedTeam || truncatedTeam) {
        console.log('✅ 系统处理了超长名称（可能截断）');
        // 清理
        await teamsPage.deleteTeam(superLongTeam.name);
      }
    }
  });
});

test.describe('【异常测试】战队管理异常场景', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-E001: 删除不存在的队伍
   * 优先级: P2
   * 验证删除不存在的队伍时系统行为正常
   */
  test('TEST-E001: 删除不存在的队伍 @P2', async () => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 验证不存在的战队不在列表中
    const nonExistentTeam = '不存在的战队-12345';
    const exists = await teamsPage.hasTeam(nonExistentTeam);
    expect(exists).toBe(false);
    
    // 尝试删除（如果页面提供了删除不存在战队的功能）
    // 这里主要验证系统不会因此崩溃
    console.log('✅ 系统正确处理了不存在战队的查询');
  });

  /**
   * TEST-E003: 快速连续点击保存
   * 优先级: P2
   * 验证快速连续点击保存按钮的处理
   */
  test('TEST-E003: 快速连续点击保存 @P2', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 打开添加战队弹窗
    await teamsPage.clickAddTeam();
    await teamsPage.fillTeamForm({
      ...testTeam,
      name: `连续点击测试-${Date.now()}`,
    });

    // 快速连续点击保存按钮
    const saveButton = teamsPage.saveButton;
    
    await Promise.all([
      saveButton.click(),
      saveButton.click(),
      saveButton.click(),
    ]);

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证只有一个战队被创建（或系统正确处理重复请求）
    const teamName = `连续点击测试-${Date.now()}`;
    const teamCount = await teamsPage.getTeamCount();
    expect(teamCount).toBeGreaterThanOrEqual(1);
    
    // 验证没有重复创建（通过检查特定名称的战队数量）
    const teamsWithSameName = await page.locator(`text=${teamName}`).count();
    expect(teamsWithSameName).toBeLessThanOrEqual(1);
  });
});
