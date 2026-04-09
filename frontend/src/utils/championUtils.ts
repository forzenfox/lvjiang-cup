import staticChampionMap from '../data/lol-champion-map.json';

const RIOT_CDN_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';
const STATIC_CDN_BASE_URL = 'https://game.gtimg.cn/images/lol/act/img/champion';

const CACHE_KEY = 'lol_champion_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface ChampionCache {
  version: string;
  lastUpdated: number;
  champions: Record<string, string>;
}

const staticEnToCnMap: Record<string, string> = staticChampionMap as Record<string, string>;
const staticCnToEnMap: Record<string, string> = Object.entries(staticEnToCnMap).reduce(
  (acc, [en, cn]) => {
    acc[cn] = en;
    return acc;
  },
  {} as Record<string, string>
);

let cachedChampionMap: Record<string, string> | null = null;
let currentVersion: string | null = null;

function getCache(): ChampionCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached) as ChampionCache;
  } catch {
    return null;
  }
}

async function fetchFromRiot(): Promise<{ version: string; champions: Record<string, string> } | null> {
  try {
    const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!versionRes.ok) throw new Error('Failed to fetch versions');
    const versions = await versionRes.json();
    const latestVersion = versions[0];
    if (!latestVersion) throw new Error('No version found');

    const championRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/zh_CN/champion.json`
    );
    if (!championRes.ok) throw new Error('Failed to fetch champions');
    const data = await championRes.json();

    const championMap: Record<string, string> = {};
    for (const enName in data.data) {
      championMap[enName] = data.data[enName].name;
    }

    const cache: ChampionCache = {
      version: latestVersion,
      lastUpdated: Date.now(),
      champions: championMap,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

    return { version: latestVersion, champions: championMap };
  } catch (err) {
    console.error('从 Riot API 获取英雄数据失败:', err);
    return null;
  }
}

async function getChampionData(): Promise<{
  version: string;
  champions: Record<string, string>;
}> {
  const cached = getCache();
  const now = Date.now();

  if (cached) {
    const isExpired = now - cached.lastUpdated > CACHE_TTL;
    if (!isExpired) {
      currentVersion = cached.version;
      return { version: cached.version, champions: cached.champions };
    }
  }

  const riotData = await fetchFromRiot();
  if (riotData) {
    currentVersion = riotData.version;
    return riotData;
  }

  if (cached) {
    currentVersion = cached.version;
    return { version: cached.version, champions: cached.champions };
  }

  currentVersion = 'static';
  return { version: 'static', champions: staticEnToCnMap };
}

export async function initChampionMap(): Promise<void> {
  const data = await getChampionData();
  cachedChampionMap = data.champions;
}

export function getChampionNameByEn(enName: string): string {
  if (cachedChampionMap) {
    return cachedChampionMap[enName] || enName;
  }
  return staticEnToCnMap[enName] || enName;
}

export function getChampionNameToEn(): Record<string, string> {
  if (cachedChampionMap) {
    const map: Record<string, string> = {};
    for (const enName in cachedChampionMap) {
      map[cachedChampionMap[enName]] = enName;
    }
    return map;
  }
  return staticCnToEnMap;
}

export function getChampionIconUrl(cnName: string): string {
  const enName = getChampionNameToEn()[cnName];
  if (!enName) return '';
  if (currentVersion && currentVersion !== 'static') {
    return `${RIOT_CDN_BASE_URL}/${currentVersion}/img/champion/${enName}.png`;
  }
  return `${STATIC_CDN_BASE_URL}/${enName}.png`;
}

export function getChampionIconByEn(enName: string): string {
  if (!enName) return '';
  if (currentVersion && currentVersion !== 'static') {
    return `${RIOT_CDN_BASE_URL}/${currentVersion}/img/champion/${enName}.png`;
  }
  return `${STATIC_CDN_BASE_URL}/${enName}.png`;
}

export function getCurrentVersion(): string | null {
  return currentVersion;
}

export function clearChampionCache(): void {
  localStorage.removeItem(CACHE_KEY);
  cachedChampionMap = null;
  currentVersion = null;
}
