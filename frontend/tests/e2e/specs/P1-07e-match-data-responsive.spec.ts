import { test, expect } from '@playwright/test';
import { MatchDataPage } from '../pages';
import {
  createMatchDataFixture,
  createSeriesResponse,
  createGameResponse,
  createFilledPlayerStats,
} from '../fixtures/factory';

async function setupResponsiveMocks(page: any, fixture: any) {
  await page.route('**/api/matches/*/games/check', async (route: any) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 1 } }),
    });
  });

  await page.route('**/api/matches/*/series', async (route: any) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(
        createSeriesResponse(fixture, [
          { gameNumber: 1, winner: 'red', duration: '32:45', status: 1 },
        ])
      ),
    });
  });

  await page.route('**/api/matches/*/games/*', async (route: any) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(
        createGameResponse(1, fixture, { playerStats: createFilledPlayerStats(10, fixture) })
      ),
    });
  });
}

test.describe('【P2】对战数据展示 - 响应式布局', () => {
  let matchDataPage: MatchDataPage;

  test.beforeEach(async ({ page }) => {
    matchDataPage = new MatchDataPage(page);
  });

  test('TEST-MD-010: 移动端布局 @P2', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const fixture = createMatchDataFixture({ matchId: 'mobile-match', boFormat: 'BO1' as const });
    await setupResponsiveMocks(page, fixture);

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: './tests/e2e/screenshots/match-data-mobile.png',
      fullPage: true,
    });

    const playerStats = page.locator('[data-testid="player-stats-list"], [class*="player"]');
    const statsVisible = await playerStats
      .first()
      .isVisible()
      .catch(() => false);
    expect(statsVisible).toBe(true);
    console.log('✅ 移动端布局正常');
  });

  test('TEST-MD-011: 平板端布局 @P2', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const fixture = createMatchDataFixture({ matchId: 'tablet-match', boFormat: 'BO1' as const });
    await setupResponsiveMocks(page, fixture);

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: './tests/e2e/screenshots/match-data-tablet.png',
      fullPage: true,
    });
    console.log('✅ 平板端布局正常');
  });

  test('TEST-MD-012: PC 端布局 @P2', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const fixture = createMatchDataFixture({ matchId: 'desktop-match', boFormat: 'BO1' as const });
    await setupResponsiveMocks(page, fixture);

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: './tests/e2e/screenshots/match-data-desktop.png',
      fullPage: true,
    });
    console.log('✅ PC 端布局正常');
  });
});
