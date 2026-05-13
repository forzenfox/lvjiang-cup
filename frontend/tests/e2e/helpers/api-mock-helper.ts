import { Page } from '@playwright/test';
import {
  createGameCheckResponse,
  createSeriesResponse,
  createGameResponse,
  createFilledPlayerStats,
  createMatchDataFixture,
  type MatchDataFixture,
  type SeriesGame,
} from '../fixtures/factory';

export interface MatchMockOptions {
  hasData?: boolean;
  gameCount?: number;
  matchData?: MatchDataFixture;
  games?: SeriesGame[];
  gameResponses?: Record<number, Parameters<typeof createGameResponse>[2]>;
  delayMs?: number;
  dynamicGameResponse?: (gameNumber: number) => Parameters<typeof createGameResponse>[2];
}

export async function setupMatchDataMocks(page: Page, options: MatchMockOptions = {}) {
  const {
    hasData = true,
    gameCount = 1,
    matchData = createMatchDataFixture(),
    games,
    gameResponses = {},
    delayMs = 0,
    dynamicGameResponse,
  } = options;

  const checkResponse = createGameCheckResponse(hasData, gameCount);
  await page.route('**/api/matches/*/games/check', async route => {
    if (delayMs > 0) await page.waitForTimeout(delayMs);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(checkResponse),
    });
  });

  const seriesResponse = createSeriesResponse(matchData, games);
  await page.route('**/api/matches/*/series', async route => {
    if (delayMs > 0) await page.waitForTimeout(delayMs);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(seriesResponse),
    });
  });

  await page.route('**/api/matches/*/games/*', async route => {
    if (delayMs > 0) await page.waitForTimeout(delayMs);

    const url = route.request().url();
    const gameNumStr = url.split('/').pop();
    const gameNum = gameNumStr ? parseInt(gameNumStr, 10) : 1;

    if (isNaN(gameNum)) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, code: 40400, message: 'Not found' }),
      });
      return;
    }

    const overrides = dynamicGameResponse ? dynamicGameResponse(gameNum) : gameResponses[gameNum];

    const gameResponse = createGameResponse(gameNum, matchData, overrides);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(gameResponse),
    });
  });

  return matchData;
}

export async function setupEmptyMatchMocks(page: Page) {
  const emptyMatchData = createMatchDataFixture({
    matchId: 'empty-match',
    teamAName: 'T1',
    teamBName: 'GEN',
    boFormat: 'BO5',
    gameNumber: 1,
  });

  const checkResponse = createGameCheckResponse(false, 0);
  await page.route('**/api/matches/*/games/check', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(checkResponse),
    });
  });

  const seriesResponse = createSeriesResponse(emptyMatchData, []);
  await page.route('**/api/matches/*/series', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(seriesResponse),
    });
  });

  await page.route('**/api/matches/*/games/*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, code: 20000, data: null }),
    });
  });

  return emptyMatchData;
}

export async function setupErrorMocks(page: Page, status: number = 500) {
  const errorBody = JSON.stringify({
    success: false,
    code: status * 100,
    message: status === 500 ? '服务器错误' : status === 404 ? '未找到' : '请求失败',
  });

  await page.route('**/api/matches/*/games/check', async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: errorBody,
    });
  });

  await page.route('**/api/matches/*/series', async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: errorBody,
    });
  });

  await page.route('**/api/matches/*/games/*', async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: errorBody,
    });
  });
}
