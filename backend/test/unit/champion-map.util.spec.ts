import { loadChampionMap, findChampionId, parseChampionPool, validateChampionPool, clearChampionCache } from '../../src/modules/teams/utils/champion-map.util';
import * as fs from 'fs';
import * as path from 'path';

describe('ChampionMapUtil', () => {
  beforeEach(() => {
    clearChampionCache();
  });

  describe('loadChampionMap', () => {
    it('should load champion map from file', () => {
      const championMap = loadChampionMap();
      expect(championMap).toBeDefined();
      expect(Object.keys(championMap).length).toBeGreaterThan(0);
    });

    it('should cache champion map after first load', () => {
      const championMap1 = loadChampionMap();
      const championMap2 = loadChampionMap();
      expect(championMap1).toBe(championMap2);
    });

    it('should contain Yasuo champion', () => {
      const championMap = loadChampionMap();
      expect(championMap['Yasuo']).toBeDefined();
      expect(championMap['Yasuo'].name).toBe('疾风剑豪');
      expect(championMap['Yasuo'].title).toBe('亚索');
    });

    it('should contain LeeSin champion', () => {
      const championMap = loadChampionMap();
      expect(championMap['LeeSin']).toBeDefined();
      expect(championMap['LeeSin'].name).toBe('盲僧');
      expect(championMap['LeeSin'].title).toBe('李青');
    });
  });

  describe('findChampionId', () => {
    it('should find champion by Chinese name', () => {
      expect(findChampionId('亚索')).toBe('Yasuo');
      expect(findChampionId('盲僧')).toBe('LeeSin');
      expect(findChampionId('九尾妖狐')).toBe('Ahri');
    });

    it('should find champion by Chinese title', () => {
      expect(findChampionId('疾风剑豪')).toBe('Yasuo');
      expect(findChampionId('李青')).toBe('LeeSin');
      expect(findChampionId('阿狸')).toBe('Ahri');
    });

    it('should return null for unknown champion', () => {
      expect(findChampionId('未知英雄')).toBeNull();
      expect(findChampionId('')).toBeNull();
    });

    it('should trim whitespace before matching', () => {
      expect(findChampionId('  亚索  ')).toBe('Yasuo');
    });

    it('should be case sensitive for Chinese characters', () => {
      expect(findChampionId('亚索')).toBe('Yasuo');
      expect(findChampionId('亚索 ')).toBe('Yasuo');
    });
  });

  describe('parseChampionPool', () => {
    it('should parse single champion name', () => {
      const result = parseChampionPool('亚索');
      expect(result).toEqual(['Yasuo']);
    });

    it('should parse multiple champion names separated by comma', () => {
      const result = parseChampionPool('亚索,盲僧,九尾妖狐');
      expect(result).toEqual(['Yasuo', 'LeeSin', 'Ahri']);
    });

    it('should parse multiple champion names separated by Chinese comma', () => {
      const result = parseChampionPool('亚索，盲僧，九尾妖狐');
      expect(result).toEqual(['Yasuo', 'LeeSin', 'Ahri']);
    });

    it('should return empty array for empty string', () => {
      expect(parseChampionPool('')).toEqual([]);
      expect(parseChampionPool(null as any)).toEqual([]);
      expect(parseChampionPool(undefined as any)).toEqual([]);
    });

    it('should skip invalid champion names', () => {
      const result = parseChampionPool('亚索,未知英雄,盲僧');
      expect(result).toEqual(['Yasuo', 'LeeSin']);
    });

    it('should handle whitespace in champion names', () => {
      const result = parseChampionPool('  亚索  ,  盲僧  ');
      expect(result).toEqual(['Yasuo', 'LeeSin']);
    });

    it('should handle champion with mixed Chinese name and title', () => {
      const result = parseChampionPool('疾风剑豪,李青');
      expect(result).toEqual(['Yasuo', 'LeeSin']);
    });
  });

  describe('validateChampionPool', () => {
    it('should validate correct champion pool', () => {
      const result = validateChampionPool('亚索,盲僧');
      expect(result.valid).toBe(true);
      expect(result.validChampions).toEqual(['Yasuo', 'LeeSin']);
      expect(result.invalidNames).toEqual([]);
    });

    it('should detect invalid champion names', () => {
      const result = validateChampionPool('亚索,未知英雄');
      expect(result.valid).toBe(false);
      expect(result.validChampions).toEqual(['Yasuo']);
      expect(result.invalidNames).toEqual(['未知英雄']);
    });

    it('should return valid for empty string', () => {
      const result = validateChampionPool('');
      expect(result.valid).toBe(true);
      expect(result.validChampions).toEqual([]);
      expect(result.invalidNames).toEqual([]);
    });

    it('should return valid for null/undefined', () => {
      expect(validateChampionPool(null as any).valid).toBe(true);
      expect(validateChampionPool(undefined as any).valid).toBe(true);
    });

    it('should handle multiple invalid names', () => {
      const result = validateChampionPool('未知1,亚索,未知2');
      expect(result.valid).toBe(false);
      expect(result.validChampions).toEqual(['Yasuo']);
      expect(result.invalidNames).toEqual(['未知1', '未知2']);
    });
  });
});
