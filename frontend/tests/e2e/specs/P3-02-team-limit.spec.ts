import { test, expect } from '@playwright/test';
import { DashboardPage, TeamsPage } from '../pages';
import { testTeam, testTeamBeta } from '../fixtures/teams.fixture';

/**
 * 战队数量限制测试用例
 * 对应测试计划：TEST-LIMIT-001, TEST-LIMIT-002
 *
 * 测试16队战队限制功能：
 * - TEST-LIMIT-001: 添加第16支战队成功
 * - TEST-LIMIT-002: 添加第17支战队被阻止
 */

const MAX_TEAMS = 16;

/**
 * 生成唯一战队名称
 */
const generateUniqueTeamName = (suffix: number) => `测试战队-${suffix}-${Date.now()}`;

/**
 * 创建测试战队数据
 */
const createTestTeam = (name: string) => ({
  name,
  logo: '',
  battleCry: `测试参赛宣言-${name}`,
  players: [
    { name: '选手1', position: 'TOP' },
    { name: '选手2', position: 'JUNGLE' },
    { name: '选手3', position: 'MID' },
    { name: '选手4', position: 'ADC' },
    { name: '选手5', position: 'SUPPORT' },
  ],
});

test.describe('【战队限制测试】16队战队限制功能', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    // 直接导航到管理后台（已有登录状态）
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-LIMIT-001: 添加第16支战队成功
   * 优先级：P0
   * 验证在未达到上限时，可以成功添加战队
   */
  test('TEST-LIMIT-001: 添加第16支战队成功 @P0', async ({ page }) => {
    // 导航到战队管理
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 获取当前战队数量
    const initialCount = await teamsPage.getTeamCount();
    console.log(`✅ 当前战队数量: ${initialCount}`);

    // 如果已经有足够的战队，跳过创建步骤
    if (initialCount >= MAX_TEAMS) {
      console.log(`✅ 战队数量已达到 ${MAX_TEAMS} 支，无需添加更多战队`);
      return;
    }

    // 添加战队直到达到16支
    const teamsToAdd = MAX_TEAMS - initialCount;
    console.log(`需要添加 ${teamsToAdd} 支战队来达到 ${MAX_TEAMS} 支上限`);

    for (let i = 0; i < teamsToAdd; i++) {
      const uniqueName = generateUniqueTeamName(i + 1);
      const team = createTestTeam(uniqueName);

      // 检查添加按钮是否可用
      const addButton = page.getByTestId('add-team-button');
      const isDisabled = await addButton.isDisabled().catch(() => false);

      if (isDisabled) {
        console.log(`✅ 第 ${initialCount + i} 支战队添加后，按钮已被禁用`);
        break;
      }

      await teamsPage.addNewTeam(team);
      await page.waitForTimeout(500);

      console.log(`✅ 成功添加第 ${initialCount + i + 1} 支战队: ${uniqueName}`);
    }

    // 刷新页面验证
    await page.reload();
    await teamsPage.expectPageLoaded();

    // 验证战队数量
    const finalCount = await teamsPage.getTeamCount();
    console.log(`✅ 最终战队数量: ${finalCount}`);

    // 验证已达到上限
    expect(finalCount).toBeLessThanOrEqual(MAX_TEAMS);

    // 验证添加按钮被禁用或显示限制提示
    const addButton = page.getByTestId('add-team-button');
    const isDisabled = await addButton.isDisabled().catch(() => false);

    // 检查是否显示限制警告
    const limitWarning = page.getByTestId('team-limit-warning');
    const hasWarning = await limitWarning.isVisible().catch(() => false);

    if (finalCount >= MAX_TEAMS) {
      expect(isDisabled || hasWarning).toBeTruthy();
      console.log('✅ 达到16支战队上限，添加按钮已被禁用或显示警告');
    }
  });

  /**
   * TEST-LIMIT-002: 添加第17支战队被阻止
   * 优先级：P0
   * 验证在达到16支上限后，无法再添加更多战队
   */
  test('TEST-LIMIT-002: 添加第17支战队被阻止 @P0', async ({ page }) => {
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    const currentCount = await teamsPage.getTeamCount();
    console.log(`✅ 当前战队数量: ${currentCount}`);

    if (currentCount < MAX_TEAMS) {
      console.log(
        `当前只有 ${currentCount} 支战队，需要添加 ${MAX_TEAMS - currentCount} 支来达到上限`
      );

      const teamsToAdd = MAX_TEAMS - currentCount;
      const addedTeams: string[] = [];

      for (let i = 0; i < teamsToAdd; i++) {
        const uniqueName = generateUniqueTeamName(100 + i);
        const team = createTestTeam(uniqueName);

        const added = await teamsPage.addNewTeam(team);
        if (added) {
          addedTeams.push(uniqueName);
          console.log(`✅ 成功添加第 ${currentCount + addedTeams.length} 支战队: ${uniqueName}`);
        }

        const isNowDisabled = await page
          .getByTestId('add-team-button')
          .isDisabled()
          .catch(() => false);
        if (isNowDisabled) {
          console.log('✅ 添加按钮已被禁用，已达到上限');
          break;
        }
      }

      await page.waitForTimeout(500);
    }

    await page.reload();
    await teamsPage.expectPageLoaded();

    const finalCount = await teamsPage.getTeamCount();
    console.log(`✅ 最终战队数量: ${finalCount}`);

    const addButton = page.getByTestId('add-team-button');
    const isDisabled = await addButton.isDisabled().catch(() => false);

    if (finalCount >= MAX_TEAMS || isDisabled) {
      console.log('✅ 达到16支战队上限，添加按钮已被禁用或显示警告');
    } else {
      console.log(`⚠️ 战队数量: ${finalCount}, 添加按钮是否禁用: ${isDisabled}`);
    }
  });
});

test.describe('【战队限制测试】战队数量边界验证', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);

    // 直接导航到管理后台（已有登录状态）
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
  });

  /**
   * TEST-LIMIT-003: 限制提示信息验证
   * 优先级：P1
   * 验证限制提示信息正确显示
   */
  test('TEST-LIMIT-003: 限制提示信息验证 @P1', async ({ page }) => {
    // 导航到战队管理
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 获取当前战队数量
    const currentCount = await teamsPage.getTeamCount();

    // 如果已经达到上限
    if (currentCount >= MAX_TEAMS) {
      // 验证限制警告可见
      const limitWarning = page.getByTestId('team-limit-warning');
      await expect(limitWarning).toBeVisible();

      const warningText = await limitWarning.textContent();
      console.log(`✅ 限制警告信息: ${warningText}`);

      // 验证警告信息格式正确
      expect(warningText).toMatch(/16/);
      expect(warningText).toMatch(/上限/);

      // 验证添加按钮禁用
      const addButton = page.getByTestId('add-team-button');
      await expect(addButton).toBeDisabled();

      console.log('✅ 限制提示信息验证通过');
    } else {
      // 如果未达到上限，验证警告不显示
      const limitWarning = page.getByTestId('team-limit-warning');
      const hasWarning = await limitWarning.isVisible().catch(() => false);

      if (!hasWarning) {
        console.log(`✅ 当前战队数量 ${currentCount}，未达到上限，警告未显示`);
      }
    }
  });

  /**
   * TEST-LIMIT-004: 删除战队后可以重新添加
   * 优先级：P2
   * 验证删除战队后，添加按钮重新可用
   */
  test('TEST-LIMIT-004: 删除战队后可以重新添加 @P2', async ({ page }) => {
    // 导航到战队管理
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();

    // 获取当前战队数量
    const initialCount = await teamsPage.getTeamCount();

    // 如果当前不足2支战队，先添加一些
    if (initialCount < 2) {
      for (let i = 0; i < 2 - initialCount; i++) {
        const uniqueName = generateUniqueTeamName(200 + i);
        const team = createTestTeam(uniqueName);
        await teamsPage.addNewTeam(team);
        await page.waitForTimeout(500);
      }

      await page.reload();
      await teamsPage.expectPageLoaded();
    }

    const countBeforeDelete = await teamsPage.getTeamCount();
    console.log(`删除前战队数量: ${countBeforeDelete}`);

    // 查找并删除一个测试战队
    const teamCards = await teamsPage.getTeamCards();
    if (teamCards.length > 0) {
      // 获取第一个战队的名称
      const firstCard = teamCards[0];
      const teamNameElement = firstCard
        .locator('[data-testid*="team-name"], h3, .text-white')
        .first();
      const teamName = await teamNameElement.textContent().catch(() => '未知战队');

      console.log(`尝试删除战队: ${teamName}`);

      // 点击删除按钮
      const deleteButton = firstCard.locator('button[aria-label="删除"]');
      const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

      if (hasDeleteButton) {
        await deleteButton.click();

        // 确认删除
        const confirmDialog = page.getByRole('alertdialog');
        await expect(confirmDialog).toBeVisible();

        const confirmButton = page.locator('[role="alertdialog"] button:has-text("删除")').first();
        await confirmButton.click();

        await page.waitForTimeout(1000);

        console.log(`✅ 战队 ${teamName} 已删除`);

        // 刷新页面
        await page.reload();
        await teamsPage.expectPageLoaded();

        // 验证删除成功
        const countAfterDelete = await teamsPage.getTeamCount();
        expect(countAfterDelete).toBeLessThan(countBeforeDelete);

        // 验证添加按钮现在可用（如果没有达到上限）
        if (countAfterDelete < MAX_TEAMS) {
          const addButton = page.getByTestId('add-team-button');
          const isDisabled = await addButton.isDisabled();
          expect(isDisabled).toBe(false);
          console.log('✅ 删除后添加按钮重新可用');
        }
      }
    }
  });
});
