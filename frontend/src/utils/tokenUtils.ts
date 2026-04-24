import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  username: string;
  exp?: number;
  iat?: number;
}

export function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<TokenPayload>(token);

    if (!decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

export function getTokenRemainingTime(token: string): number {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    if (!decoded.exp) {
      return Number.MAX_SAFE_INTEGER;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - currentTime;
  } catch {
    return 0;
  }
}
