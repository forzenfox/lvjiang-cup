import { test, expect } from '@playwright/test';
import { MatchDataPage } from '../pages';
import { createMatchDataFixture, createSeriesResponse, createGameResponse, createDefaultPlayerStats } from '../fixtures/factory';

test.describe('【P1】对战数据展示 - 编辑模式', () => {
  let matchDataPage: MatchDataPage;

  test.beforeEach(async ({ page }) => {
    matchDataPage = new MatchDataPage(page);
  });

  test('TEST-MD-013: 编辑模式路由跳转 @P1 @edit', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO3' as const });
    const seriesGames = [
      { gameNumber: 1, winnerTeamId: 'team-a', gameDuration: '32:45', hasData: true },
      { gameNumber: 2, winnerTeamId: 'team-b', gameDuration: '28:10', hasData: true },
      { gameNumber: 3, winnerTeamId: null, gameDuration: null, hasData: false },
    ];

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify(createSeriesResponse(fixture, seriesGames)) });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(createGameResponse(1, fixture, {
          winnerTeamId: 'team-a',
          playerStats: createDefaultPlayerStats(fixture, { useExtendedFormat: true }),
        })),
      });
    });

    await page.route('**/api/admin/matches/*/games/*', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, code: 20000, data: null }) });
      }
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();

    const editButton = page.getByRole('button', { name: '编辑' });
    await expect(editButton).toBeVisible();
    await editButton.click();
    await page.waitForTimeout(500);

    const currentUrl = page.url();
    expect(currentUrl).toContain('/edit');
    expect(currentUrl).toContain('games/1/edit');
    console.log('✅ 编辑模式路由跳转成功');
  });

  test('TEST-MD-014: 编辑模式保存功能 @P1 @edit', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO3' as const });
    const seriesGames = [
      { gameNumber: 1, winnerTeamId: 'team-a', gameDuration: '32:45', hasData: true },
    ];

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify(createSeriesResponse(fixture, seriesGames)) });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(createGameResponse(1, fixture, {
          winnerTeamId: 'team-a',
          playerStats: createDefaultPlayerStats(fixture, { useExtendedFormat: true }),
        })),
      });
    });

    let savedData: any = null;
    await page.route('**/api/admin/matches/**/games/**', async route => {
      if (route.request().method() === 'PUT') {
        savedData = route.request().postDataJSON();
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true, code: 20000, data: { message: '保存成功' } }) });
      }
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();

    const editButton = page.getByRole('button', { name: '编辑' });
    await expect(editButton).toBeVisible();
    await editButton.click();
    await page.waitForURL(/\/admin\/matches\/.*\/games\/.*\/edit/);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const saveButton = page.getByRole('button', { name: '保存' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();

    const toastMessage = page.getByText('保存成功');
    await expect(toastMessage).toBeVisible({ timeout: 10000 });

    expect(savedData).not.toBeNull();
    expect(savedData.blueTeam).toBeDefined();
    expect(savedData.redTeam).toBeDefined();
    expect(savedData.playerStats).toBeDefined();
    console.log('✅ 编辑模式保存功能正常');
  });
});
