import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'admin.username') return 'admin';
      if (key === 'admin.password') return 'admin123';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return true for valid credentials', async () => {
      const username = 'admin';
      const password = 'admin123';

      const result = await service.validateUser(username, password);

      expect(result).toBe(true);
    });

    it('should return false for invalid username', async () => {
      const username = 'wronguser';
      const password = 'admin123';

      const result = await service.validateUser(username, password);

      expect(result).toBe(false);
    });

    it('should return false for invalid password', async () => {
      const username = 'admin';
      const password = 'wrongpassword';

      const result = await service.validateUser(username, password);

      expect(result).toBe(false);
    });

    it('should handle bcrypt comparison', async () => {
      // 临时修改 mock 返回值
      const originalMock = mockConfigService.get;
      mockConfigService.get = jest.fn((key: string) => {
        if (key === 'admin.username') return 'admin';
        if (key === 'admin.password') return '$2b$10$hashedpassword';
        return null;
      }) as any;

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('admin', 'password');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', '$2b$10$hashedpassword');

      // 恢复原始 mock
      mockConfigService.get = originalMock;
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = { username: 'admin', password: 'admin123' };

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        token_type: 'Bearer',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'admin', sub: 'admin' }),
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { username: 'admin', password: 'wrongpassword' };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      const loginDto = { username: 'wronguser', password: 'admin123' };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
