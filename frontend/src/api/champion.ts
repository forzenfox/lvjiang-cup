const CDN_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';
const API_VERSION_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';

const CACHE_KEY = 'lol_champion_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface ChampionCache {
  version: string;
  lastUpdated: number;
  champions: Record<string, string>;
}

interface ChampionData {
  id: string;
  name: string;
  title: string;
  tags: string[];
}

export async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(API_VERSION_URL);
    if (!res.ok) throw new Error('Failed to fetch versions');
    const versions = await res.json();
    return versions[0] || null;
  } catch (err) {
    console.error('获取版本失败:', err);
    return null;
  }
}

export async function fetchChampions(version: string): Promise<Record<string, ChampionData>> {
  const url = `${CDN_BASE_URL}/${version}/data/zh_CN/champion.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch champions');
  const data = await res.json();
  return data.data || {};
}

function getCache(): ChampionCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as ChampionCache;
  } catch {
    return null;
  }
}

function setCache(cache: ChampionCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.error('设置缓存失败:', err);
  }
}

function createChampionMap(champions: Record<string, ChampionData>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const enName in champions) {
    const champion = champions[enName];
    map[enName] = champion.name;
  }
  return map;
}

export async function getChampionList(): Promise<{
  version: string;
  champions: Record<string, string>;
}> {
  const cached = getCache();
  const latestVersion = await fetchLatestVersion();

  if (cached && latestVersion) {
    if (cached.version === latestVersion) {
      const isExpired = Date.now() - cached.lastUpdated > CACHE_TTL;
      if (!isExpired) {
        return { version: cached.version, champions: cached.champions };
      }
    }
  }

  if (latestVersion) {
    try {
      const champions = await fetchChampions(latestVersion);
      const championMap = createChampionMap(champions);

      const newCache: ChampionCache = {
        version: latestVersion,
        lastUpdated: Date.now(),
        champions: championMap,
      };
      setCache(newCache);

      return { version: latestVersion, champions: championMap };
    } catch (err) {
      console.error('获取英雄数据失败:', err);
    }
  }

  if (cached) {
    return { version: cached.version, champions: cached.champions };
  }

  return { version: 'unknown', champions: {} };
}

export function getChampionIcon(enName: string, version: string): string {
  if (!enName || !version) return '';
  return `${CDN_BASE_URL}/${version}/img/champion/${enName}.png`;
}

export function getChampionNameByEn(enName: string, championMap: Record<string, string>): string {
  return championMap[enName] || enName;
}

export async function getChampionNameToEn(): Promise<Record<string, string>> {
  const { champions } = await getChampionList();
  const map: Record<string, string> = {};
  for (const enName in champions) {
    map[champions[enName]] = enName;
  }
  return map;
}

export function clearChampionCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
