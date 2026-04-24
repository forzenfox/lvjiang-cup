import {
  parsePosition,
  parseRating,
  parseIsCaptain,
  parseLevel,
  parseLiveUrl,
  POSITION_MAP,
} from '../../src/modules/teams/utils/excel.util';

describe('ExcelUtil', () => {
  describe('parsePosition', () => {
    it('should parse Chinese position to enum', () => {
      expect(parsePosition('上单')).toBe('TOP');
      expect(parsePosition('打野')).toBe('JUNGLE');
      expect(parsePosition('中单')).toBe('MID');
      expect(parsePosition('ADC')).toBe('ADC');
      expect(parsePosition('辅助')).toBe('SUPPORT');
    });

    it('should return null for invalid position', () => {
      expect(parsePosition('无效')).toBeNull();
      expect(parsePosition('')).toBeNull();
      expect(parsePosition(null as any)).toBeNull();
    });

    it('should trim whitespace', () => {
      expect(parsePosition('  上单  ')).toBe('TOP');
    });

    it('should handle case sensitivity', () => {
      expect(parsePosition('上单')).toBe('TOP');
    });
  });

  describe('parseRating', () => {
    it('should return default 60 for empty values', () => {
      expect(parseRating(null)).toBe(60);
      expect(parseRating(undefined)).toBe(60);
      expect(parseRating('')).toBe(60);
    });

    it('should parse valid number', () => {
      expect(parseRating(85)).toBe(85);
      expect(parseRating(0)).toBe(0);
      expect(parseRating(100)).toBe(100);
    });

    it('should round decimal numbers', () => {
      expect(parseRating(85.4)).toBe(85);
      expect(parseRating(85.5)).toBe(86);
    });

    it('should parse string numbers', () => {
      expect(parseRating('85')).toBe(85);
      expect(parseRating('85.6')).toBe(86);
    });

    it('should return default for invalid string', () => {
      expect(parseRating('invalid')).toBe(60);
    });
  });

  describe('parseIsCaptain', () => {
    it('should return true for 是', () => {
      expect(parseIsCaptain('是')).toBe(true);
    });

    it('should return false for 否', () => {
      expect(parseIsCaptain('否')).toBe(false);
    });

    it('should return false for empty values', () => {
      expect(parseIsCaptain(null)).toBe(false);
      expect(parseIsCaptain(undefined)).toBe(false);
      expect(parseIsCaptain('')).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(parseIsCaptain('  是  ')).toBe(true);
    });
  });

  describe('parseLevel', () => {
    it('should parse valid levels', () => {
      expect(parseLevel('S')).toBe('S');
      expect(parseLevel('A')).toBe('A');
      expect(parseLevel('B')).toBe('B');
      expect(parseLevel('C')).toBe('C');
      expect(parseLevel('D')).toBe('D');
    });

    it('should handle lowercase', () => {
      expect(parseLevel('s')).toBe('S');
      expect(parseLevel('a')).toBe('A');
    });

    it('should return null for invalid levels', () => {
      expect(parseLevel('E')).toBeNull();
      expect(parseLevel('')).toBeNull();
      expect(parseLevel(null)).toBeNull();
    });
  });

  describe('parseLiveUrl', () => {
    it('should return empty string for empty input', () => {
      expect(parseLiveUrl('')).toBe('');
      expect(parseLiveUrl(null as any)).toBe('');
      expect(parseLiveUrl(undefined as any)).toBe('');
    });

    it('should add douyu prefix for pure number', () => {
      expect(parseLiveUrl('123456')).toBe('https://www.douyu.com/123456');
      expect(parseLiveUrl('999888')).toBe('https://www.douyu.com/999888');
    });

    it('should keep existing URL if already complete', () => {
      expect(parseLiveUrl('https://www.douyu.com/123456')).toBe('https://www.douyu.com/123456');
      expect(parseLiveUrl('http://example.com/live')).toBe('http://example.com/live');
    });

    it('should trim whitespace', () => {
      expect(parseLiveUrl('  123456  ')).toBe('https://www.douyu.com/123456');
    });
  });

  describe('POSITION_MAP', () => {
    it('should contain all 5 positions', () => {
      expect(POSITION_MAP['上单']).toBe('TOP');
      expect(POSITION_MAP['打野']).toBe('JUNGLE');
      expect(POSITION_MAP['中单']).toBe('MID');
      expect(POSITION_MAP['ADC']).toBe('ADC');
      expect(POSITION_MAP['辅助']).toBe('SUPPORT');
    });

    it('should have 5 entries', () => {
      expect(Object.keys(POSITION_MAP)).toHaveLength(5);
    });
  });
});
