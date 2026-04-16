import * as fs from 'fs';
import * as path from 'path';

export interface ChampionData {
  id: string;
  name: string;
  title: string;
  tags: string[];
}

export interface ChampionMap {
  [key: string]: ChampionData;
}

let championCache: ChampionMap | null = null;

export function loadChampionMap(): ChampionMap {
  if (championCache) {
    return championCache;
  }

  const dataPath = path.resolve(process.cwd(), 'data', 'lol-champion-map.json');

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Champion map file not found at ${dataPath}`);
  }

  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  championCache = JSON.parse(fileContent) as ChampionMap;

  return championCache;
}

export function findChampionId(inputName: string): string | null {
  const championMap = loadChampionMap();
  const normalizedInput = inputName.trim();

  for (const champion of Object.values(championMap)) {
    if (champion.name === normalizedInput || champion.title === normalizedInput) {
      return champion.id;
    }
  }

  return null;
}

export function parseChampionPool(poolStr: string): string[] {
  if (!poolStr || typeof poolStr !== 'string') {
    return [];
  }

  const names = poolStr.split(/[,，]/).map(n => n.trim()).filter(n => n.length > 0);
  const result: string[] = [];

  for (const name of names) {
    const championId = findChampionId(name);
    if (championId) {
      result.push(championId);
    }
  }

  return result;
}

export function validateChampionPool(poolStr: string): { valid: boolean; validChampions: string[]; invalidNames: string[] } {
  if (!poolStr || typeof poolStr !== 'string') {
    return { valid: true, validChampions: [], invalidNames: [] };
  }

  const names = poolStr.split(/[,，]/).map(n => n.trim()).filter(n => n.length > 0);
  const championMap = loadChampionMap();
  const validChampions: string[] = [];
  const invalidNames: string[] = [];

  for (const name of names) {
    let found = false;
    for (const champion of Object.values(championMap)) {
      if (champion.name === name || champion.title === name) {
        validChampions.push(champion.id);
        found = true;
        break;
      }
    }
    if (!found) {
      invalidNames.push(name);
    }
  }

  return {
    valid: invalidNames.length === 0,
    validChampions,
    invalidNames
  };
}

export function clearChampionCache(): void {
  championCache = null;
}
