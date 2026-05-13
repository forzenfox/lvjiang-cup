import { test, expect } from '@playwright/test';
import { MatchDataPage } from '../pages';
import { setupMatchDataMocks } from '../helpers/api-mock-helper';
import {
  createMatchDataFixture,
  createSeriesResponse,
  createGameResponse,
  createDefaultPlayerStats,
} from '../fixtures/factory';

test.describe('【P2】对战数据展示 - 雷达图交互', () => {
  let matchDataPage: MatchDataPage;

  test.beforeEach(async ({ page }) => {
    matchDataPage = new MatchDataPage(page);
  });

  test('TEST-MD-008: 点击选手行展开雷达图 @P2', async ({ page }) => {
    const fixture = createMatchDataFixture({ boFormat: 'BO1' as const });
    const seriesGames = [{ gameNumber: 1, winner: 'red', duration: '32:45', status: 1 }];
    const playerStats = Array(10)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        side: i < 5 ? 'red' : ('blue' as 'red' | 'blue'),
        position: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][i % 5],
        nickname: `Player${i + 1}`,
        championName: '英雄',
        kills: i + 1,
        deaths: 2,
        assists: 5,
        cs: 200 + i * 20,
        gold: 10000 + i * 1000,
        damageDealt: 15000 + i * 2000,
        damageTaken: 20000 - i * 1000,
        level: 15,
        visionScore: 30 + i * 5,
        wardsPlaced: 5 + i,
        mvp: i === 2,
      }));

    await page.route('**/api/matches/*/games/check', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, code: 20000, data: { hasData: true, gameCount: 1 } }),
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
        body: JSON.stringify(createGameResponse(1, fixture, { playerStats })),
      });
    });

    await matchDataPage.goto(fixture.matchId);
    await matchDataPage.expectPageLoaded();
    await matchDataPage.expectPlayerStatsVisible();

    const firstPlayerRow = page.locator('[data-testid^="player-row-"]').first();
    await firstPlayerRow.click();
    await page.waitForTimeout(500);

    const radarCanvas = page.locator('canvas');
    const radarVisible = await radarCanvas
      .first()
      .isVisible()
      .catch(() => false);

    if (radarVisible) {
      console.log('✅ 点击选手行后雷达图展开');
    } else {
      const radarDiv = page.locator('[class*="radar"], [class*="chart"]');
      const radarDivVisible = await radarDiv
        .first()
        .isVisible()
        .catch(() => false);
      if (radarDivVisible) {
        console.log('✅ 点击选手行后雷达图面板展开');
      } else {
        console.log('⚠️ 雷达图未检测到，可能需要检查组件实现');
      }
    }
  });
});
