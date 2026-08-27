import { test, expect } from '@playwright/test';
import { MatchDataPage } from '../pages';
import {
  createMatchDataFixture,
  createSeriesResponse,
  createGameResponse,
  createDefaultPlayerStats,
} from '../fixtures/factory';

test.describe('【P1】对战数据展示 - 空状态与重试', () => {
  let matchDataPage: MatchDataPage;

  test.beforeEach(async ({ page }) => {
    matchDataPage = new MatchDataPage(page);
  });

  test('TEST-MD-015: 空状态显示 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO3' as const });
    const seriesGames = [
      { gameNumber: 1, winnerTeamId: null, gameDuration: null, hasData: false },
      { gameNumber: 2, winnerTeamId: null, gameDuration: null, hasData: false },
      { gameNumber: 3, winnerTeamId: null, gameDuration: null, hasData: false },
    ];

    await page.route('**/api/matches/*/games/check', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          code: 20000,
          data: { hasData: false, gameCount: 0 },
        }),
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
        body: JSON.stringify({ success: true, code: 20000, data: null }),
      });
    });

    await matchDataPage.goto(fixture.matchId);
    await page.waitForTimeout(1000);

    const emptyStateText = page.getByText('暂无对战数据');
    await expect(emptyStateText).toBeVisible({ timeout: 5000 });
    console.log('✅ 空状态显示正常');
  });

  test('TEST-MD-016: 加载失败后重试 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO3' as const });
    const seriesGames = [
      { gameNumber: 1, winnerTeamId: 'team-a', gameDuration: '32:45', hasData: true },
    ];
    let retryCount = 0;

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(createSeriesResponse(fixture, seriesGames)),
      });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      retryCount++;
      if (retryCount < 3) {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ success: false, code: 50000, message: '服务器错误' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(
            createGameResponse(1, fixture, {
              winnerTeamId: 'team-a',
              playerStats: createDefaultPlayerStats(fixture, { useExtendedFormat: true }),
            })
          ),
        });
      }
    });

    await matchDataPage.goto(fixture.matchId);
    await page.waitForTimeout(3000);
    await matchDataPage.expectPageLoaded();

    // 前两次游戏数据请求故意返回 500，组件应按 loadGameDataWithRetry 自动重试，
    // 第 3 次（retryCount >= 3）返回 200 成功渲染。此处断言最终数据成功渲染，
    // 并校验确实发生了至少 3 次请求（重试机制生效），避免因额外请求/加载时序导致
    // 对精确请求次数（retryCount === 3）的脆性断言失败。
    await expect(page.locator('[data-testid^="player-row"]').first()).toBeVisible({
      timeout: 10000,
    });
    expect(retryCount).toBeGreaterThanOrEqual(3);
    console.log('✅ 自动重试机制正常，第3次请求成功');
  });
});
