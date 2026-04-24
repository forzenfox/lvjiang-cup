import { describe, it, expect } from 'vitest';
import { isTokenValid, getTokenRemainingTime } from '@/utils/tokenUtils';

function createTestToken(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const signature = 'test-signature';
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

describe('tokenUtils', () => {
  describe('isTokenValid', () => {
    it('应该拒绝已过期的 token', () => {
      const expiredPayload = {
        sub: 'admin',
        username: 'admin',
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const expiredToken = createTestToken(expiredPayload);

      expect(isTokenValid(expiredToken)).toBe(false);
    });

    it('应该接受有效的 token（未过期）', () => {
      const validPayload = {
        sub: 'admin',
        username: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const validToken = createTestToken(validPayload);

      expect(isTokenValid(validToken)).toBe(true);
    });

    it('应该拒绝格式错误的 token', () => {
      expect(isTokenValid('invalid-token-string')).toBe(false);
    });

    it('应该拒绝空字符串 token', () => {
      expect(isTokenValid('')).toBe(false);
    });

    it('应该拒绝无效 base64 的 token', () => {
      expect(isTokenValid('not-a-valid-base64!!!')).toBe(false);
    });

    it('应该接受没有 exp 字段的 token（视为永久有效）', () => {
      const payloadWithoutExp = {
        sub: 'admin',
        username: 'admin',
      };
      const tokenWithoutExp = createTestToken(payloadWithoutExp);

      expect(isTokenValid(tokenWithoutExp)).toBe(true);
    });

    it('应该正确处理边界情况：刚好过期的 token', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const justExpiredPayload = {
        sub: 'admin',
        username: 'admin',
        exp: currentTime - 1,
      };
      const justExpiredToken = createTestToken(justExpiredPayload);

      expect(isTokenValid(justExpiredToken)).toBe(false);
    });

    it('应该正确处理边界情况：刚有效的 token', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const justValidPayload = {
        sub: 'admin',
        username: 'admin',
        exp: currentTime + 1,
      };
      const justValidToken = createTestToken(justValidPayload);

      expect(isTokenValid(justValidToken)).toBe(true);
    });
  });

  describe('getTokenRemainingTime', () => {
    it('应该返回负数表示已过期的 token', () => {
      const expiredPayload = {
        sub: 'admin',
        username: 'admin',
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const expiredToken = createTestToken(expiredPayload);

      const remaining = getTokenRemainingTime(expiredToken);
      expect(remaining).toBeLessThan(0);
    });

    it('应该返回正数表示有效的 token', () => {
      const validPayload = {
        sub: 'admin',
        username: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const validToken = createTestToken(validPayload);

      const remaining = getTokenRemainingTime(validToken);
      expect(remaining).toBeGreaterThan(0);
    });

    it('应该返回 0 表示格式错误的 token', () => {
      expect(getTokenRemainingTime('invalid-token')).toBe(0);
    });

    it('应该返回 MAX_SAFE_INTEGER 表示没有 exp 的 token', () => {
      const payloadWithoutExp = {
        sub: 'admin',
        username: 'admin',
      };
      const tokenWithoutExp = createTestToken(payloadWithoutExp);

      expect(getTokenRemainingTime(tokenWithoutExp)).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('应该正确计算剩余时间（秒）', () => {
      const expectedRemaining = 7200;
      const payload = {
        sub: 'admin',
        username: 'admin',
        exp: Math.floor(Date.now() / 1000) + expectedRemaining,
      };
      const token = createTestToken(payload);

      const remaining = getTokenRemainingTime(token);
      expect(remaining).toBeGreaterThanOrEqual(expectedRemaining - 5);
      expect(remaining).toBeLessThanOrEqual(expectedRemaining + 5);
    });
  });
});
