import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getChampionList, getChampionIcon, clearChampionCache } from '@/api/champion';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

describe('champion API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getChampionList', () => {
    it('应该从 API 获取英雄列表', async () => {
      const mockVersions = ['16.7.1', '16.6.1'];
      const mockChampions = {
        data: {
          Yasuo: { id: 'Yasuo', name: '亚索', title: '疾风剑豪', tags: ['Fighter'] },
          Ahri: {
            id: 'Ahri',
            name: '九尾妖狐·阿狸',
            title: '九尾妖狐',
            tags: ['Mage', 'Assassin'],
          },
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVersions,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChampions,
        });

      const result = await getChampionList();

      expect(result.version).toBe('16.7.1');
      expect(result.champions.Yasuo.name).toBe('亚索');
      expect(result.champions.Yasuo.title).toBe('疾风剑豪');
      expect(result.champions.Yasuo.tags).toEqual(['Fighter']);
      expect(result.champions.Ahri.name).toBe('九尾妖狐·阿狸');
    });

    it('应该使用缓存的版本', async () => {
      const cachedData = {
        version: '16.7.1',
        lastUpdated: Date.now(),
        champions: {
          Yasuo: { id: 'Yasuo', name: '亚索', title: '疾风剑豪', tags: ['Fighter'] },
        },
      };
      localStorage.setItem('lol_champion_cache', JSON.stringify(cachedData));

      const mockVersions = ['16.8.1'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVersions,
      });

      const result = await getChampionList();

      expect(result.version).toBe('16.7.1');
      expect(result.champions.Yasuo.name).toBe('亚索');
    });
  });

  describe('getChampionIcon', () => {
    it('应该返回正确的头像 URL', () => {
      const url = getChampionIcon('Yasuo', '16.7.1');

      expect(url).toBe('https://ddragon.leagueoflegends.com/cdn/16.7.1/img/champion/Yasuo.png');
    });

    it('应该在参数为空时返回空字符串', () => {
      expect(getChampionIcon('', '16.7.1')).toBe('');
      expect(getChampionIcon('Yasuo', '')).toBe('');
    });
  });

  describe('clearChampionCache', () => {
    it('应该清除本地存储的缓存', () => {
      const cachedData = {
        version: '16.7.1',
        lastUpdated: Date.now(),
        champions: {
          Yasuo: { id: 'Yasuo', name: '亚索', title: '疾风剑豪', tags: ['Fighter'] },
        },
      };
      localStorage.setItem('lol_champion_cache', JSON.stringify(cachedData));

      clearChampionCache();

      expect(localStorage.getItem('lol_champion_cache')).toBeNull();
    });
  });
});
