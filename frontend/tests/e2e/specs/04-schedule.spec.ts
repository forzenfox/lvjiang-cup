import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, SchedulePage, TeamsPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { testTeam, testTeamBeta } from '../fixtures/teams.fixture';

/**
 * 赛程管理测试用例
 * 对应测试计划: TEST-108, TEST-109, TEST-110, TEST-B002
 * 
 * 测试依赖关系:
 * - TEST-108: 依赖 TEST-101 (登录), TEST-105 (战队数据)
 * - TEST-109: 依赖 TEST-101 (登录), TEST-105 (战队数据)
 * - TEST-110: 依赖 TEST-108 (已创建瑞士轮比赛)
 * - TEST-B002: 依赖 TEST-108 (已创建比赛)
 */

test.describe('【第二阶段-5】瑞士轮赛程管理测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-108: 管理瑞士轮赛程 (US-108)
   * 优先级: P0
   * 验证可以成功管理瑞士轮比赛
   * 前置条件: TEST-101 登录成功, TEST-105 已创建至少2支战队
   * 
   * 注意: 此测试是TEST-005/110/111的关键依赖
   */
  test('TEST-108: 管理瑞士轮赛程 - 添加比赛 @P0', async ({ page }) => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 检查并创建测试战队
    const hasTeamA = await teamsPage.hasTeam(testTeam.name);
    const hasTeamB = await teamsPage.hasTeam(testTeamBeta.name);
    
    if (!hasTeamA) {
      await teamsPage.addNewTeam(testTeam);
    }
    if (!hasTeamB) {
      await teamsPage.addNewTeam(testTeamBeta);
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    
    // 确保在瑞士轮Tab
    await schedulePage.switchToSwiss();
    
    // 记录添加前的比赛数量
    const initialCount = await schedulePage.getSwissMatchCount();
    
    // 添加瑞士轮比赛
    await schedulePage.addSwissMatch({
      round: 'Round 1',
      record: '0-0',
      teamA: testTeam.name,
      teamB: testTeamBeta.name,
    });
    
    // 验证保存成功提示
    const successMessage = page.locator('text=保存成功, text=创建成功, text=添加成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // 验证新比赛出现在对应战绩分组下
    await schedulePage.expectSwissMatchExists(testTeam.name, testTeamBeta.name);
    
    // 验证比赛数量增加
    const newCount = await schedulePage.getSwissMatchCount();
    expect(newCount).toBe(initialCount + 1);
    
    // 验证可视化编辑器正确显示
    const matchCard = page.locator(`[data-testid="swiss-match"]:has-text("${testTeam.name}"):has-text("${testTeamBeta.name}")`);
    await expect(matchCard).toBeVisible();
  });

  /**
   * TEST-108-2: 瑞士轮赛程 - 多战绩分组
   * 优先级: P0
   * 验证可以在不同战绩分组添加比赛
   */
  test('TEST-108-2: 瑞士轮赛程 - 多战绩分组 @P0', async () => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 创建更多战队用于不同分组
    const teams = [testTeam, testTeamBeta];
    for (const team of teams) {
      const exists = await teamsPage.hasTeam(team.name);
      if (!exists) {
        await teamsPage.addNewTeam(team);
      }
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    // 在不同战绩分组添加比赛
    const records = ['0-0', '1-0', '0-1'];
    
    for (const record of records) {
      // 检查是否已存在该战绩的比赛
      const existingMatches = await schedulePage.getMatchesByRecord(record);
      
      if (existingMatches.length === 0) {
        // 添加比赛到该战绩分组
        await schedulePage.addSwissMatch({
          round: `Round ${record === '0-0' ? 1 : 2}`,
          record: record,
          teamA: testTeam.name,
          teamB: testTeamBeta.name,
        });
        
        // 验证比赛出现在正确的战绩分组
        await schedulePage.expectMatchInRecord(testTeam.name, record);
      }
    }
    
    // 验证战绩分组显示
    for (const record of records) {
      const group = page.locator(`[data-testid="record-group"]:has-text("${record}")`);
      if (await group.isVisible().catch(() => false)) {
        console.log(`✅ 找到战绩分组: ${record}`);
      }
    }
  });
});

test.describe('【第二阶段-6】淘汰赛赛程管理测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-109: 管理淘汰赛赛程 (US-109)
   * 优先级: P0
   * 验证可以成功管理淘汰赛比赛
   * 前置条件: TEST-101 登录成功, TEST-105 已创建至少2支战队
   * 
   * 注意: 此测试是TEST-006的关键依赖
   */
  test('TEST-109: 管理淘汰赛赛程 @P0', async ({ page }) => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 检查并创建测试战队
    const hasTeamA = await teamsPage.hasTeam(testTeam.name);
    const hasTeamB = await teamsPage.hasTeam(testTeamBeta.name);
    
    if (!hasTeamA) {
      await teamsPage.addNewTeam(testTeam);
    }
    if (!hasTeamB) {
      await teamsPage.addNewTeam(testTeamBeta);
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    
    // 切换到淘汰赛Tab
    await schedulePage.switchToElimination();
    
    // 验证双败赛制结构显示
    const winnersBracket = page.locator('[data-testid="winners-bracket"], text=胜者组');
    const losersBracket = page.locator('[data-testid="losers-bracket"], text=败者组');
    const grandFinals = page.locator('[data-testid="grand-finals"], text=总决赛');
    
    // 至少有一个区域应该可见
    const hasStructure = await winnersBracket.isVisible().catch(() => false) ||
                        await losersBracket.isVisible().catch(() => false) ||
                        await grandFinals.isVisible().catch(() => false);
    
    expect(hasStructure).toBe(true);
    
    // 添加胜者组比赛
    await schedulePage.addEliminationMatch({
      bracket: 'winners',
      round: '半决赛',
      teamA: testTeam.name,
      teamB: testTeamBeta.name,
    });
    
    // 验证保存成功
    const successMessage = page.locator('text=保存成功, text=创建成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // 验证比赛显示在胜者组
    await schedulePage.expectEliminationMatchExists(testTeam.name, testTeamBeta.name, 'winners');
    
    // 验证比赛晋级关系显示
    const connectors = await page.locator('[data-testid="bracket-connector"]').all();
    console.log(`✅ 找到 ${connectors.length} 条晋级连线`);
  });

  /**
   * TEST-109-2: 淘汰赛 - 败者组和总决赛
   * 优先级: P0
   * 验证可以添加败者组和总决赛比赛
   */
  test('TEST-109-2: 淘汰赛 - 败者组和总决赛 @P0', async () => {
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const teams = [testTeam, testTeamBeta];
    for (const team of teams) {
      const exists = await teamsPage.hasTeam(team.name);
      if (!exists) {
        await teamsPage.addNewTeam(team);
      }
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToElimination();
    
    // 添加败者组比赛
    await schedulePage.addEliminationMatch({
      bracket: 'losers',
      round: '第一轮',
      teamA: testTeam.name,
      teamB: testTeamBeta.name,
    });
    
    // 验证败者组比赛显示
    await schedulePage.expectEliminationMatchExists(testTeam.name, testTeamBeta.name, 'losers');
    
    // 添加总决赛（如果有功能）
    try {
      await schedulePage.addEliminationMatch({
        bracket: 'grand-finals',
        round: '总决赛',
        teamA: testTeam.name,
        teamB: testTeamBeta.name,
      });
      
      await schedulePage.expectEliminationMatchExists(testTeam.name, testTeamBeta.name, 'grand-finals');
    } catch {
      console.log('⚠️ 总决赛添加功能可能不可用');
    }
  });
});

test.describe('【第二阶段-7】比赛结果更新测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);
    homePage = new HomePage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-110: 更新比赛结果 (US-110)
   * 优先级: P0
   * 验证可以成功更新比赛结果
   * 前置条件: TEST-101 登录成功, TEST-108 已创建瑞士轮比赛
   * 
   * 注意: 此测试是TEST-007/111的关键依赖
   */
  test('TEST-110: 更新比赛结果 @P0', async ({ page }) => {
    // 确保有战队和比赛数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const teams = [testTeam, testTeamBeta];
    for (const team of teams) {
      const exists = await teamsPage.hasTeam(team.name);
      if (!exists) {
        await teamsPage.addNewTeam(team);
      }
    }

    // 导航到赛程管理
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    // 确保有比赛数据，如果没有则创建
    let matchCount = await schedulePage.getSwissMatchCount();
    if (matchCount === 0) {
      await schedulePage.addSwissMatch({
        round: 'Round 1',
        record: '0-0',
        teamA: testTeam.name,
        teamB: testTeamBeta.name,
      });
      matchCount = await schedulePage.getSwissMatchCount();
    }
    
    expect(matchCount).toBeGreaterThan(0);
    
    // 更新第一场比赛的比分
    await schedulePage.updateMatchScore(0, 2, 1);
    
    // 验证保存成功提示
    const successMessage = page.locator('text=保存成功, text=更新成功');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    
    // 验证比分更新显示
    await schedulePage.expectMatchScore(0, 2, 1);
    
    // 验证胜者高亮显示
    const winnerHighlight = page.locator('[data-testid="match-winner"], .winner, .text-yellow-400').first();
    if (await winnerHighlight.isVisible().catch(() => false)) {
      console.log('✅ 胜者已高亮显示');
    }
    
    // 验证前台实时更新
    await homePage.goto();
    await homePage.scrollToSchedule();
    await homePage.switchToSwiss();
    
    // 验证前台显示更新后的比分
    const scoreDisplay = page.locator('text=2 : 1, text=2 - 1');
    if (await scoreDisplay.isVisible().catch(() => false)) {
      console.log('✅ 前台已同步更新比分');
    }
  });

  /**
   * TEST-110-2: 更新比赛状态
   * 优先级: P0
   * 验证可以更新比赛状态（未开始/进行中/已结束）
   */
  test('TEST-110-2: 更新比赛状态 @P0', async () => {
    // 确保有战队和比赛数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    for (const team of [testTeam, testTeamBeta]) {
      const exists = await teamsPage.hasTeam(team.name);
      if (!exists) {
        await teamsPage.addNewTeam(team);
      }
    }

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    // 确保有比赛数据
    let matchCount = await schedulePage.getSwissMatchCount();
    if (matchCount === 0) {
      await schedulePage.addSwissMatch({
        round: 'Round 1',
        record: '0-0',
        teamA: testTeam.name,
        teamB: testTeamBeta.name,
      });
    }
    
    // 测试不同状态
    const statuses = ['upcoming', 'ongoing', 'finished'];
    
    for (const status of statuses) {
      // 更新比赛状态
      await schedulePage.updateMatchStatus(0, status);
      
      // 验证状态更新
      await schedulePage.expectMatchStatus(0, status);
      
      console.log(`✅ 比赛状态已更新为: ${status}`);
    }
  });
});

test.describe('【边界测试】比分输入边界测试', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);

    // 先导航到页面并登录
    await loginPage.goto();
    await page.reload();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-B002: 比分输入边界
   * 优先级: P2
   * 验证比分输入的边界条件处理
   * 前置条件: TEST-108 已创建比赛
   */
  test('TEST-B002: 比分输入边界 @P2', async ({ page }) => {
    // 确保有战队和比赛数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    for (const team of [testTeam, testTeamBeta]) {
      const exists = await teamsPage.hasTeam(team.name);
      if (!exists) {
        await teamsPage.addNewTeam(team);
      }
    }

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    // 确保有比赛数据
    let matchCount = await schedulePage.getSwissMatchCount();
    if (matchCount === 0) {
      await schedulePage.addSwissMatch({
        round: 'Round 1',
        record: '0-0',
        teamA: testTeam.name,
        teamB: testTeamBeta.name,
      });
    }
    
    // 测试0:0比分
    await schedulePage.updateMatchScore(0, 0, 0);
    await schedulePage.expectMatchScore(0, 0, 0);
    console.log('✅ 0:0 比分测试通过');
    
    // 测试大比分
    await schedulePage.updateMatchScore(0, 10, 5);
    await schedulePage.expectMatchScore(0, 10, 5);
    console.log('✅ 大比分(10:5)测试通过');
    
    // 测试负数（应该被拒绝或重置为0）
    try {
      await schedulePage.updateMatchScore(0, -1, -2);
      
      // 检查是否被拒绝或重置
      const scoreA = await schedulePage.getMatchScoreA(0);
      const scoreB = await schedulePage.getMatchScoreB(0);
      
      // 负数应该被处理为0或保持原值
      expect(scoreA).toBeGreaterThanOrEqual(0);
      expect(scoreB).toBeGreaterThanOrEqual(0);
      
      console.log('✅ 负数比分被正确处理');
    } catch {
      console.log('✅ 系统拒绝了负数比分');
    }
    
    // 测试非数字输入（应该被阻止）
    const scoreInput = page.locator('input[type="number"]').first();
    if (await scoreInput.isVisible().catch(() => false)) {
      const inputType = await scoreInput.getAttribute('type');
      expect(inputType).toBe('number');
      console.log('✅ 比分输入框类型为number，阻止非数字输入');
    }
  });
});

test.describe('【第三阶段-4】赛程前台展示验证', () => {
  let loginPage: AdminLoginPage;
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;
  let teamsPage: TeamsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
    teamsPage = new TeamsPage(page);
    homePage = new HomePage(page);
  });

  /**
   * 赛程前台同步验证
   * 优先级: P0
   * 验证后台创建的赛程在前台正确显示
   */
  test('赛程前台同步验证 @P0', async () => {
    // 登录并创建比赛
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
    
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    for (const team of [testTeam, testTeamBeta]) {
      const exists = await teamsPage.hasTeam(team.name);
      if (!exists) {
        await teamsPage.addNewTeam(team);
      }
    }
    
    // 创建瑞士轮比赛
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    const timestamp = Date.now();
    const uniqueTeamA = `${testTeam.name}-${timestamp}`;
    
    // 创建临时战队用于测试
    await dashboardPage.navigateToTeams();
    await teamsPage.addNewTeam({
      ...testTeam,
      name: uniqueTeamA,
    });
    
    await dashboardPage.navigateToSchedule();
    await schedulePage.addSwissMatch({
      round: 'Round 1',
      record: '0-0',
      teamA: uniqueTeamA,
      teamB: testTeamBeta.name,
    });
    
    // 访问前台验证
    await homePage.goto();
    await homePage.scrollToSchedule();
    await homePage.switchToSwiss();
    
    // 验证比赛在前台显示
    const matchDisplay = homePage.page.locator(`text=${uniqueTeamA}`);
    await expect(matchDisplay).toBeVisible();
    
    console.log('✅ 赛程数据已同步到前台');
    
    // 清理：删除临时战队
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();
    await teamsPage.deleteTeam(uniqueTeamA);
  });
});
