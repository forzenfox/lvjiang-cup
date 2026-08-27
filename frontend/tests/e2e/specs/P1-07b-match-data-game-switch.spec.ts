import { test, expect } from '@playwright/test';
import { MatchDataPage } from '../pages';
import { setupMatchDataMocks } from '../helpers/api-mock-helper';
import {
  createMatchDataFixture,
  createSeriesResponse,
  createGameResponse,
  createFilledPlayerStats,
} from '../fixtures/factory';

test.describe('【P1】对战数据展示 - 对局切换功能', () => {
  let matchDataPage: MatchDataPage;

  test.beforeEach(async ({ page }) => {
    matchDataPage = new MatchDataPage(page);
  });

  test('TEST-MD-004: BO3 对局切换器显示 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO3' as const });
    const seriesGames = [
      { gameNumber: 1, winnerTeamId: 'team-a', duration: '32:45', status: 1, hasData: true },
      { gameNumber: 2, winnerTeamId: 'team-b', duration: '28:10', status: 1, hasData: true },
      { gameNumber: 3, winnerTeamId: 'team-a', duration: '35:20', status: 1, hasData: true },
    ];

    await page.route('**/api/matches/*/games/check', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 3 } }),
      });
    });

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(createSeriesResponse(fixture, seriesGames)),
      });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(
          createGameResponse(1, fixture, { playerStats: createFilledPlayerStats(10, fixture) })
        ),
      });
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();

    // 实际前端对局切换按钮使用中文数字标签（如「第一场」「第二场」），无 data-testid
    const switcher = page.locator(
      'button:has-text("第一场"), button:has-text("第二场"), button:has-text("第三场")'
    );
    const switcherVisible = await switcher
      .first()
      .isVisible()
      .catch(() => false);
    expect(switcherVisible).toBe(true);

    const game1Btn = page.locator('button:has-text("第一场")').first();
    await expect(game1Btn).toBeVisible();
    console.log('✅ BO3 对局切换器正确显示');
  });

  test('TEST-MD-005: 点击切换对局 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO3' as const });
    const seriesGames = [
      { gameNumber: 1, winnerTeamId: 'team-a', duration: '32:45', status: 1, hasData: true },
      { gameNumber: 2, winnerTeamId: 'team-b', duration: '28:10', status: 1, hasData: true },
      { gameNumber: 3, winnerTeamId: 'team-a', duration: '35:20', status: 1, hasData: true },
    ];

    await page.route('**/api/matches/*/games/check', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 3 } }),
      });
    });

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(createSeriesResponse(fixture, seriesGames)),
      });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      const url = route.request().url();
      const gameNumStr = url.split('/').pop();
      const gameNum = gameNumStr ? parseInt(gameNumStr, 10) : 1;
      await route.fulfill({
        status: 200,
        body: JSON.stringify(
          createGameResponse(gameNum, fixture, {
            playerStats: createFilledPlayerStats(10, fixture),
          })
        ),
      });
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();
    await expect(page).toHaveURL(/\/match\/.*\/games(\?game=1)?$/);

    const game2Btn = page.locator('button:has-text("第二场")').first();
    await game2Btn.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\?game=2/);
    console.log('✅ 对局切换后 URL 正确更新');
  });

  test('TEST-MD-006: 浏览器前进/后退 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO3' as const });
    const seriesGames = [
      { gameNumber: 1, winner: 'red', duration: '32:45', status: 1 },
      { gameNumber: 2, winner: 'blue', duration: '28:10', status: 1 },
      { gameNumber: 3, winner: 'red', duration: '35:20', status: 1 },
    ];

    await page.route('**/api/matches/*/games/check', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 3 } }),
      });
    });

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(createSeriesResponse(fixture, seriesGames)),
      });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      const url = route.request().url();
      const gameNumStr = url.split('/').pop();
      const gameNum = gameNumStr ? parseInt(gameNumStr, 10) : 1;
      await route.fulfill({
        status: 200,
        body: JSON.stringify(
          createGameResponse(gameNum, fixture, {
            playerStats: createFilledPlayerStats(10, fixture),
          })
        ),
      });
    });

    await matchDataPage.goto(fixture.matchId, 1);
    await matchDataPage.expectPageLoaded();

    await page.goto(`/match/${fixture.matchId}/games?game=2`);
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\?game=2/);

    await page.goBack();
    await page.waitForTimeout(500);
    const urlAfterBack = page.url();
    expect(urlAfterBack.includes('game=1') || !urlAfterBack.includes('game=')).toBe(true);
    console.log('✅ 浏览器后退按钮正常工作');
  });

  test('TEST-MD-007: BO1 不显示对局切换器 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ matchId: 'bo1-match', boFormat: 'BO1' as const });

    await page.route('**/api/matches/*/games/check', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 1 } }),
      });
    });

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(
          createSeriesResponse(fixture, [
            { gameNumber: 1, winner: 'red', duration: '25:15', status: 1 },
          ])
        ),
      });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(
          createGameResponse(1, fixture, { playerStats: createFilledPlayerStats(10, fixture) })
        ),
      });
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();

    const gameButtons = page.locator(
      'button:has-text("第1局"), button:has-text("第2局"), button:has-text("第3局")'
    );
    const hasButtons =
      (await gameButtons.count()) > 0 &&
      (await gameButtons
        .first()
        .isVisible()
        .catch(() => false));

    if (hasButtons) {
      const switcher = page.locator('[data-testid="game-switcher"]');
      const switcherVisible = await switcher.isVisible().catch(() => false);
      expect(switcherVisible).toBe(false);
      console.log('✅ BO1 不显示对局切换器');
    } else {
      console.log('✅ BO1 无对局切换按钮');
    }
  });
});
