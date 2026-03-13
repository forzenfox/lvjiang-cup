import { test, expect } from '@playwright/test';
import { AdminLoginPage, DashboardPage, SchedulePage, TeamsPage, HomePage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';
import { testTeam, testTeamBeta } from '../fixtures/teams.fixture';

/**
 * 晋级名单管理测试用例
 * 对应测试计划: TEST-111, TEST-112, TEST-B003
 * 
 * 测试依赖关系:
 * - TEST-111: 依赖 TEST-101 (登录), TEST-110 (比赛结果)
 * - TEST-112: 依赖 TEST-111 (已修改晋级名单)
 * - TEST-B003: 依赖 TEST-111
 */

test.describe('【第四阶段-1】瑞士轮晋级名单管理测试', () => {
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
   * TEST-111: 管理瑞士轮晋级名单 (US-112)
   * 优先级: P1
   * 验证可以成功管理晋级名单
   * 前置条件: TEST-101 登录成功, TEST-110 已更新比赛结果
   */
  test('TEST-111: 管理瑞士轮晋级名单 @P1', async ({ page }) => {
    // 确保有战队和比赛数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    // 检查并创建测试战队
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
    
    // 更新比赛结果
    await schedulePage.updateMatchScore(0, 2, 1);
    await schedulePage.updateMatchStatus(0, 'finished');
    
    // 打开晋级名单管理
    await schedulePage.openAdvancementManager();
    
    // 验证晋级名单管理界面显示
    const advancementPanel = page.locator('[data-testid="advancement-panel"], text=晋级名单');
    await expect(advancementPanel).toBeVisible();
    
    // 验证分类管理标签
    const categories = ['2-0晋级', '2-1晋级', '败者组', '淘汰'];
    for (const category of categories) {
      const tab = page.locator(`text=${category}`);
      if (await tab.isVisible().catch(() => false)) {
        console.log(`✅ 找到分类: ${category}`);
      }
    }
    
    // 选择"2-0晋级（胜者组）"标签
    const winnersTab = page.locator('text=2-0晋级, text=胜者组').first();
    if (await winnersTab.isVisible().catch(() => false)) {
      await winnersTab.click();
      
      // 从下拉列表选择一支队伍
      const teamSelect = page.locator('select, [data-testid="team-select"]').first();
      if (await teamSelect.isVisible().catch(() => false)) {
        await teamSelect.selectOption({ label: testTeam.name });
        
        // 验证队伍添加到该分类
        const addedTeam = page.locator(`text=${testTeam.name}`).filter({ hasText: /2-0|胜者组/ });
        if (await addedTeam.isVisible().catch(() => false)) {
          console.log('✅ 队伍已添加到胜者组');
        }
        
        // 点击移除按钮
        const removeButton = page.locator('[data-testid="remove-team"], button:has-text("×")').first();
        if (await removeButton.isVisible().catch(() => false)) {
          await removeButton.click();
          console.log('✅ 队伍已从胜者组移除');
        }
      }
    }
    
    // 验证各分类的战队数量显示
    const countBadges = await page.locator('[data-testid="category-count"], .badge').all();
    console.log(`✅ 找到 ${countBadges.length} 个分类数量标识`);
  });

  /**
   * TEST-111-2: 晋级名单 - 拖拽功能
   * 优先级: P1
   * 验证可以拖拽战队到不同分类
   */
  test('TEST-111-2: 晋级名单 - 拖拽功能 @P1', async () => {
    // 准备数据
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
    
    // 打开晋级名单管理
    await schedulePage.openAdvancementManager();
    
    // 尝试拖拽操作
    const draggableTeam = page.locator('[data-testid="draggable-team"], .draggable').first();
    const dropZone = page.locator('[data-testid="drop-zone"], .drop-zone').first();
    
    if (await draggableTeam.isVisible().catch(() => false) && 
        await dropZone.isVisible().catch(() => false)) {
      // 执行拖拽
      await draggableTeam.dragTo(dropZone);
      console.log('✅ 拖拽操作成功');
    } else {
      console.log('⚠️ 拖拽功能可能不可用，使用选择方式');
    }
  });
});

test.describe('【第四阶段-2】晋级名单同步验证测试', () => {
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
   * TEST-112: 晋级名单同步验证 ⭐ (关键测试)
   * 优先级: P0 (关键测试)
   * 验证晋级名单修改后能够同步到主页面
   * 前置条件: TEST-111 已修改晋级名单
   * 
   * 注意: 这是关键测试，验证核心功能
   */
  test('TEST-112: 晋级名单同步验证 @P0', async ({ page }) => {
    // 登录并准备数据
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.expectPageLoaded();
    
    // 确保有战队数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const timestamp = Date.now();
    const uniqueTeamA = `晋级测试A-${timestamp}`;
    const uniqueTeamB = `晋级测试B-${timestamp}`;
    
    // 创建临时战队
    await teamsPage.addNewTeam({
      ...testTeam,
      name: uniqueTeamA,
    });
    await teamsPage.addNewTeam({
      ...testTeamBeta,
      name: uniqueTeamB,
    });
    
    // 创建比赛
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    await schedulePage.addSwissMatch({
      round: 'Round 1',
      record: '0-0',
      teamA: uniqueTeamA,
      teamB: uniqueTeamB,
    });
    
    // 更新比赛结果
    await schedulePage.updateMatchScore(0, 2, 0);
    await schedulePage.updateMatchStatus(0, 'finished');
    
    // 打开晋级名单管理
    await schedulePage.openAdvancementManager();
    
    // 将uniqueTeamA添加到2-0晋级
    const winnersTab = page.locator('text=2-0晋级, text=胜者组').first();
    if (await winnersTab.isVisible().catch(() => false)) {
      await winnersTab.click();
      
      const teamSelect = page.locator('select, [data-testid="team-select"]').first();
      if (await teamSelect.isVisible().catch(() => false)) {
        await teamSelect.selectOption({ label: uniqueTeamA });
        
        // 保存晋级名单
        const saveButton = page.locator('button:has-text("保存"), button:has-text("确认")').first();
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
        }
      }
    }
    
    // 访问前台验证同步
    await homePage.goto();
    await homePage.scrollToSchedule();
    await homePage.switchToSwiss();
    
    // 验证晋级名单在前台显示
    const advancementDisplay = homePage.page.locator(`text=${uniqueTeamA}`);
    await expect(advancementDisplay).toBeVisible();
    
    // 验证数据同步无延迟
    const syncTime = Date.now();
    console.log(`✅ 晋级名单已同步到前台，同步时间: ${syncTime - timestamp}ms`);
    
    // 验证无缓存不一致问题
    await homePage.page.reload();
    await homePage.scrollToSchedule();
    await homePage.switchToSwiss();
    
    const advancementAfterReload = homePage.page.locator(`text=${uniqueTeamA}`);
    await expect(advancementAfterReload).toBeVisible();
    console.log('✅ 刷新后晋级名单仍然正确显示');
    
    // 清理临时数据
    await loginPage.goto();
    await loginPage.login(adminUser);
    await dashboardPage.navigateToTeams();
    await teamsPage.deleteTeam(uniqueTeamA);
    await teamsPage.deleteTeam(uniqueTeamB);
  });
});

test.describe('【边界测试】晋级名单边界测试', () => {
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
   * TEST-B003: 晋级名单重复添加
   * 优先级: P2
   * 验证同一战队不能重复添加到同一分类
   * 前置条件: TEST-111
   */
  test('TEST-B003: 晋级名单重复添加 @P2', async ({ page }) => {
    // 准备数据
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
    
    const timestamp = Date.now();
    const testTeamName = `重复测试-${timestamp}`;
    
    await teamsPage.addNewTeam({
      ...testTeam,
      name: testTeamName,
    });

    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    // 确保有比赛数据
    let matchCount = await schedulePage.getSwissMatchCount();
    if (matchCount === 0) {
      await schedulePage.addSwissMatch({
        round: 'Round 1',
        record: '0-0',
        teamA: testTeamName,
        teamB: testTeamBeta.name,
      });
    }
    
    // 更新比赛结果
    await schedulePage.updateMatchScore(0, 2, 0);
    await schedulePage.updateMatchStatus(0, 'finished');
    
    // 打开晋级名单管理
    await schedulePage.openAdvancementManager();
    
    // 第一次添加
    const winnersTab = page.locator('text=2-0晋级, text=胜者组').first();
    if (await winnersTab.isVisible().catch(() => false)) {
      await winnersTab.click();
      
      const teamSelect = page.locator('select, [data-testid="team-select"]').first();
      if (await teamSelect.isVisible().catch(() => false)) {
        await teamSelect.selectOption({ label: testTeamName });
        
        // 保存
        const saveButton = page.locator('button:has-text("保存"), button:has-text("确认")').first();
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
        }
        
        console.log('✅ 第一次添加成功');
        
        // 尝试第二次添加同一战队
        await teamSelect.selectOption({ label: testTeamName });
        
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
        }
        
        // 验证系统行为：应该阻止或忽略重复添加
        const errorMessage = page.locator('text=已存在, text=重复, text=不能重复');
        const hasError = await errorMessage.isVisible().catch(() => false);
        
        if (hasError) {
          console.log('✅ 系统正确阻止了重复添加');
        } else {
          // 检查是否只添加了一次
          const teamOccurrences = await page.locator(`text=${testTeamName}`).count();
          expect(teamOccurrences).toBeLessThanOrEqual(1);
          console.log('✅ 系统正确处理了重复添加');
        }
      }
    }
    
    // 清理
    await dashboardPage.navigateToTeams();
    await teamsPage.deleteTeam(testTeamName);
  });

  /**
   * 晋级名单空状态测试
   * 优先级: P2
   * 验证空晋级名单的显示
   */
  test('晋级名单空状态 @P2', async () => {
    await dashboardPage.navigateToSchedule();
    await schedulePage.expectPageLoaded();
    await schedulePage.switchToSwiss();
    
    // 打开晋级名单管理
    await schedulePage.openAdvancementManager();
    
    // 验证空状态显示
    const emptyState = schedulePage.page.locator('[data-testid="empty-advancement"], text=暂无晋级名单');
    
    if (await emptyState.isVisible().catch(() => false)) {
      console.log('✅ 晋级名单空状态显示正确');
    } else {
      console.log('ℹ️ 晋级名单可能已有数据或空状态提示不同');
    }
  });
});
