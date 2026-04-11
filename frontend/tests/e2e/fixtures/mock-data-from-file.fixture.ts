import { test as base, Page } from '@playwright/test';
import { initialTeams, swissMatches, eliminationMatches, swissAdvancement } from '../../src/mock/data';

/**
 * 模拟数据 fixture
 * 用于 E2E 测试时快速加载预定义数据
 */
export interface MockDataFixtures {
  mockData: {
    teams: typeof initialTeams;
    swissMatches: typeof swissMatches;
    eliminationMatches: typeof eliminationMatches;
    swissAdvancement: typeof swissAdvancement;
  };
  loadMockData: (page: Page) => Promise<void>;
}

export const mockDataFixtures = base.extend<MockDataFixtures>({
  mockData: {
    teams: initialTeams,
    swissMatches,
    eliminationMatches,
    swissAdvancement,
  },

  loadMockData: async ({ page }, use) => {
    const loadFn = async (page: Page) => {
      // 尝试通过 API 加载模拟数据
      // 注意：这里需要后端支持批量创建或重置数据
      // 如果后端不支持，可以使用 localStorage 模拟数据
      const baseURL = process.env.BASE_URL || 'http://localhost:5173';

      // 方案1：通过 localStorage 注入数据
      await page.goto(baseURL);

      // 注入模拟数据到 localStorage
      await page.evaluate(
        ({ teams, swissMatches, eliminationMatches, swissAdvancement }) => {
          // 存储到 localStorage
          localStorage.setItem('mock-teams', JSON.stringify(teams));
          localStorage.setItem('mock-swiss-matches', JSON.stringify(swissMatches));
          localStorage.setItem(
            'mock-elimination-matches',
            JSON.stringify(eliminationMatches)
          );
          localStorage.setItem(
            'mock-swiss-advancement',
            JSON.stringify(swissAdvancement)
          );
          localStorage.setItem('use-mock-data', 'true');
        },
        {
          teams: initialTeams,
          swissMatches,
          eliminationMatches,
          swissAdvancement,
        }
      );

      console.log('Mock data loaded into localStorage');
    };

    await use(loadFn);
  },
});

/**
 * 获取模拟战队数据的辅助函数
 */
export function getMockTeamById(teamId: string) {
  return initialTeams.find((t) => t.id === teamId);
}

/**
 * 获取模拟战队名称
 */
export function getMockTeamName(teamId: string): string {
  const team = getMockTeamById(teamId);
  return team?.name || teamId;
}

/**
 * 获取所有模拟战队 ID
 */
export function getAllMockTeamIds(): string[] {
  return initialTeams.map((t) => t.id);
}

/**
 * 获取指定战绩的战队
 */
export function getTeamsByRecord(record: string): string[] {
  const rankings = swissAdvancement.rankings.filter((r) => r.record === record);
  return rankings.map((r) => r.teamId);
}
