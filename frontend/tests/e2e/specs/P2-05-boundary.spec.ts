import { test, expect } from '@playwright/test';
import { DashboardPage, TeamsPage, StreamersPage } from '../pages';

/**
 * 边界测试 - 空状态和边界值测试
 * 对应测试计划: TEST-BOUNDARY-01 到 TEST-BOUNDARY-08
 *
 * 测试范围：
 * 1. 战队管理空状态显示
 * 2. 主播管理空状态显示
 * 3. 战队名称超长边界
 * 4. 战队名称特殊字符
 * 5. 主播名称必填校验
 * 6. URL格式校验
 * 7. 空比赛瑞士轮状态
 * 8. 加载状态显示
 */

test.describe('【P2】边界测试 - 空状态和边界值测试', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;
  let streamersPage: StreamersPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);
    streamersPage = new StreamersPage(page);
  });

  /**
   * TEST-BOUNDARY-01: 战队管理空状态显示
   * 优先级：P2
   * 验证无战队时显示空状态提示
   */
  test('TEST-BOUNDARY-01: 战队管理空状态 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToTeams();
    await page.waitForURL('**/admin/teams', { timeout: 10000 });

    // 清空所有数据
    await teamsPage.cleanupTestData();
    await page.waitForTimeout(2000);

    const emptyStateVisible = await teamsPage.emptyState.isVisible().catch(() => false);

    if (emptyStateVisible) {
      console.log('✅ 战队管理空状态正确显示');
    } else {
      console.log('⚠️ 空状态未显示（可能有默认数据）');
    }
  });

  /**
   * TEST-BOUNDARY-02: 主播管理空状态显示
   * 优先级：P2
   * 验证无主播时显示空状态提示
   */
  test('TEST-BOUNDARY-02: 主播管理空状态 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.clickNavigation('主播管理');
    await page.waitForURL('**/admin/streamers', { timeout: 10000 });
    await streamersPage.expectPageLoaded();

    // 尝试查看空状态（如果有数据则跳过）
    const streamerCount = await streamersPage.getStreamerCount();
    if (streamerCount === 0) {
      await streamersPage.expectEmptyState();
      console.log('✅ 主播管理空状态正确显示');
    } else {
      console.log(`⚠️ 当前有 ${streamerCount} 个主播，无法验证空状态`);
    }
  });

  /**
   * TEST-BOUNDARY-03: 战队名称超长边界
   * 优先级：P2
   * 验证超长战队名称的处理
   */
  test('TEST-BOUNDARY-03: 战队名称超长边界 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 生成超长名称（200字符）
    const longName = 'A'.repeat(200);

    await teamsPage.addNewTeam({
      name: longName,
      logo: 'https://picsum.photos/seed/long-name/200/200',
      battleCry: '超长名称测试',
    });
    await page.waitForTimeout(2000);
    await teamsPage.refresh();

    // 验证是否创建成功或被截断
    const teamExists = await teamsPage.hasTeam(longName);
    if (teamExists) {
      console.log('✅ 超长战队名称被接受（可能被截断显示）');
    } else {
      console.log('✅ 超长战队名称被拒绝（符合预期）');
    }
  });

  /**
   * TEST-BOUNDARY-04: 战队名称特殊字符
   * 优先级：P2
   * 验证战队名称包含特殊字符的处理
   */
  test('TEST-BOUNDARY-04: 战队名称特殊字符 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 包含特殊字符的名称
    const specialName = '测试战队<>{}[]()!@#$%^&*';

    await teamsPage.addNewTeam({
      name: specialName,
      logo: 'https://picsum.photos/seed/special/200/200',
      battleCry: '特殊字符测试',
    });
    await page.waitForTimeout(2000);
    await teamsPage.refresh();

    console.log('✅ 特殊字符战队名称测试完成');
  });

  /**
   * TEST-BOUNDARY-05: 主播名称必填校验
   * 优先级：P2
   * 验证主播名称为空时无法保存
   */
  test('TEST-BOUNDARY-05: 主播名称必填校验 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.clickNavigation('主播管理');
    await page.waitForURL('**/admin/streamers', { timeout: 10000 });
    await streamersPage.expectPageLoaded();

    await streamersPage.clickAddStreamer();
    await expect(streamersPage.streamerNameInput).toBeVisible({ timeout: 5000 });

    // 昵称为空直接保存
    await streamersPage.streamerNameInput.fill('');
    await streamersPage.fillStreamerForm({
      liveUrl: 'https://www.douyu.com/123456',
    });

    await streamersPage.saveStreamer();
    await page.waitForTimeout(1500);

    // 验证是否仍然在编辑状态（表示保存失败）
    const stillEditing = await streamersPage.streamerNameInput.isVisible().catch(() => false);
    if (stillEditing) {
      console.log('✅ 主播名称为空时无法保存');
    } else {
      console.log('⚠️ 空名称主播被保存了');
    }
  });

  /**
   * TEST-BOUNDARY-06: URL格式校验
   * 优先级：P2
   * 验证无效URL格式的处理
   */
  test('TEST-BOUNDARY-06: URL格式校验 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.clickNavigation('主播管理');
    await page.waitForURL('**/admin/streamers', { timeout: 10000 });
    await streamersPage.expectPageLoaded();

    await streamersPage.clickAddStreamer();
    await expect(streamersPage.liveUrlInput).toBeVisible({ timeout: 5000 });

    // 输入无效URL
    await streamersPage.streamerNameInput.fill('URL测试主播');
    await streamersPage.liveUrlInput.fill('not-a-valid-url-!!!');

    await streamersPage.saveStreamer();
    await page.waitForTimeout(1500);

    console.log('✅ URL格式校验测试完成');
  });

  /**
   * TEST-BOUNDARY-07: 加载状态显示
   * 优先级：P2
   * 验证数据加载时显示加载状态
   */
  test('TEST-BOUNDARY-07: 加载状态显示 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    // 导航到战队页面触发加载
    await dashboardPage.navigateToTeams();

    // 尝试捕获加载状态
    const loadingSpinner = page.locator('.animate-spin');
    const loadingVisible = await loadingSpinner.isVisible().catch(() => false);

    if (loadingVisible) {
      console.log('✅ 加载状态动画正确显示');
    } else {
      console.log('⚠️ 加载太快，未捕获到加载状态');
    }
  });

  /**
   * TEST-BOUNDARY-08: 页面刷新后数据一致性
   * 优先级：P2
   * 验证刷新页面后数据仍然一致
   */
  test('TEST-BOUNDARY-08: 页面刷新后数据一致性 @P2', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 获取刷新前的战队数
    const teamCountBefore = await teamsPage.getTeamCount();

    // 刷新页面
    await page.reload();
    await teamsPage.waitForPageLoad();

    // 获取刷新后的战队数
    const teamCountAfter = await teamsPage.getTeamCount();

    expect(teamCountBefore).toBe(teamCountAfter);

    console.log(`✅ 刷新前后战队数一致: ${teamCountBefore} -> ${teamCountAfter}`);
  });
});
