import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should be defined', () => {
      expect(guard.canActivate).toBeDefined();
    });

    it('should extend AuthGuard', () => {
      expect(guard).toBeInstanceOf(AuthGuard('jwt'));
    });
  });

  describe('handleRequest', () => {
    it('should be defined', () => {
      expect(guard.handleRequest).toBeDefined();
    });

    it('should return user when valid', () => {
      const mockUser = { username: 'admin', sub: 'admin' };
      
      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when info is provided without error', () => {
      const mockInfo = { message: 'Token expired' };
      
      expect(() => guard.handleRequest(null, null, mockInfo)).toThrow(UnauthorizedException);
    });
  });
});
