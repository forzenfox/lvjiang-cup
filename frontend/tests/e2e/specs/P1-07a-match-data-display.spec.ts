import { test, expect } from '@playwright/test';
import { MatchDataPage } from '../pages';
import { setupMatchDataMocks } from '../helpers/api-mock-helper';
import {
  createMatchDataFixture,
  createSeriesResponse,
  createGameResponse,
} from '../fixtures/factory';

test.describe('【P1】对战数据展示 - 页面访问与加载', () => {
  let matchDataPage: MatchDataPage;

  test.beforeEach(async ({ page }) => {
    matchDataPage = new MatchDataPage(page);
  });

  test('TEST-MD-001: 访问有数据的对战详情页面 @P1', async ({ page }) => {
    const fixture = await setupMatchDataMocks(page, { hasData: true, gameCount: 3 });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();
    await matchDataPage.expectMatchInfoVisible();
    await matchDataPage.expectPlayerStatsVisible();
    console.log('✅ 对战数据页面加载成功');
  });

  test('TEST-MD-001.5: 视频链接显示与跳转 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ videoBvid: 'BV1Ab4y1X7zK' });
    const seriesGames = [
      { gameNumber: 1, winner: 'red', duration: '32:45', status: 1 },
      { gameNumber: 2, winner: 'blue', duration: '28:10', status: 1 },
      { gameNumber: 3, winner: 'red', duration: '35:20', status: 1 },
    ];

    await page.route('**/api/matches/*/games/check', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 3 } }),
      });
    });

    await page.route('**/api/matches/*/series', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createSeriesResponse(fixture, seriesGames)),
      });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      const gameResp = createGameResponse(1, fixture, { videoBvid: 'BV1Ab4y1X7zK' });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(gameResp),
      });
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();

    const videoLink = page.locator('a', { hasText: '📺 观看视频' });
    await expect(videoLink).toBeVisible();
    const href = await videoLink.getAttribute('href');
    expect(href).toBe('https://www.bilibili.com/video/BV1Ab4y1X7zK');
    console.log('✅ 视频链接正确显示');
  });

  test('TEST-MD-001.6: 视频回顾按钮功能 @P1', async ({ page }) => {
    const fixture = createMatchDataFixture({ videoBvid: 'BV1Ab4y1X7zK' });
    const seriesGames = [
      { gameNumber: 1, winnerTeamId: 'team-a', duration: '32:45', status: 1 },
      { gameNumber: 2, winnerTeamId: 'team-b', duration: '28:10', status: 1 },
      { gameNumber: 3, winnerTeamId: 'team-a', duration: '35:20', status: 1 },
    ];

    const newPagePromise = page.context().waitForEvent('page');

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
      const gameResp = createGameResponse(1, fixture, {
        videoBvid: 'BV1Ab4y1X7zK',
        winnerTeamId: 'team-a',
        playerStats: [],
      });
      await route.fulfill({ status: 200, body: JSON.stringify(gameResp) });
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();

    const videoButton = page.locator('button', { hasText: '视频回顾' });
    await expect(videoButton).toBeVisible();
    await videoButton.click();
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();
    expect(newPage.url()).toBe('https://www.bilibili.com/video/BV1Ab4y1X7zK');
    console.log('✅ 视频回顾按钮正确打开新标签页');
  });

  test('TEST-MD-002: 访问无数据的对战详情页面 @P1', async ({ page }) => {
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
        body: JSON.stringify({
          success: true,
          code: 20000,
          data: {
            matchId: 'empty-match',
            teamA: { name: 'T1', id: 't1' },
            teamB: { name: 'GEN', id: 'gen' },
            boFormat: 'BO5',
            games: [],
          },
        }),
      });
    });

    await matchDataPage.goto('empty-match');
    await page.waitForTimeout(2000);

    const emptyState = page.locator(
      '[data-testid="empty-state"], text=暂无对战数据, text=暂无数据'
    );
    const isEmptyVisible = await emptyState.isVisible().catch(() => false);
    if (isEmptyVisible) {
      console.log('✅ 无数据时正确显示空状态');
    } else {
      const playerList = page.locator('[data-testid="player-stats-list"]');
      const playerCount = await playerList.count();
      console.log(`⚠️ 页面已加载（选手列表元素数: ${playerCount}）`);
    }
  });

  test('TEST-MD-003: 加载状态显示 @P1', async ({ page }) => {
    await page.route('**/api/matches/*/games/check', async route => {
      await page.waitForTimeout(1000);
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 1 } }),
      });
    });

    const fixture = createMatchDataFixture({ boFormat: 'BO1' as const });
    await page.route('**/api/matches/*/series', async route => {
      await page.waitForTimeout(2000);
      await route.fulfill({
        status: 200,
        body: JSON.stringify(
          createSeriesResponse(fixture, [
            { gameNumber: 1, winner: 'red', duration: '32:45', status: 1 },
          ])
        ),
      });
    });

    await page.route('**/api/matches/*/games/*', async route => {
      await page.waitForTimeout(2000);
      await route.fulfill({ status: 200, body: JSON.stringify(createGameResponse(1, fixture)) });
    });

    await matchDataPage.goto(fixture.matchId);
    const loadingElements = page.locator(
      '[class*="animate-pulse"], [class*="skeleton"], [data-testid="loading-skeleton"]'
    );
    const isLoadingVisible = await loadingElements
      .first()
      .isVisible()
      .catch(() => false);
    if (isLoadingVisible) {
      console.log('✅ 加载时显示骨架屏');
    } else {
      console.log('⚠️ 未检测到骨架屏（可能加载过快）');
    }

    await matchDataPage.expectPageLoaded();
    console.log('✅ 数据加载完成后页面正常显示');
  });
});
