/**
 * Security Test Fixtures
 * Test payloads for XSS, SQL injection, special characters, and long input testing
 */

/**
 * XSS payloads - common cross-site scripting attack vectors
 */
export const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '"><svg onload=alert("XSS")>',
  'javascript:alert("XSS")',
  '<body onload=alert("XSS")>',
] as const;

/**
 * SQL injection payloads - common SQLi attack vectors
 */
export const sqlInjectionPayloads = [
  "'; DROP TABLE users;--",
  "1' OR '1'='1",
  "1; SELECT * FROM users",
  "' UNION SELECT null, null--",
] as const;

/**
 * Special character payloads - emoji, control characters, unicode
 */
export const specialCharPayloads = [
  '🎮🏆🔥💀⚔️', // emoji
  'test\u0000name', // null byte
  'line1\nline2\tindented', // newline and tab
  'test\x1b[31mcolored', // escape sequence
  '\u00A0\u200B\uFEFF', // unicode whitespace and BOM
  '日本語テスト', // unicode CJK
] as const;

/**
 * Long input payloads - strings of increasing length
 */
export const longPayloads = [
  'A'.repeat(100),
  'B'.repeat(500),
  'C'.repeat(1000),
  'D'.repeat(10000),
] as const;
