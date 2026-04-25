import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
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
    it('应该验证正确的用户名和密码', async () => {
      const username = 'admin';
      const password = 'admin123';

      const result = await service.validateUser(username, password);

      expect(result).toBe(true);
    });

    it('应该拒绝错误的用户名', async () => {
      const username = 'wronguser';
      const password = 'admin123';

      const result = await service.validateUser(username, password);

      expect(result).toBe(false);
    });

    it('应该拒绝错误的密码', async () => {
      const username = 'admin';
      const password = 'wrongpassword';

      const result = await service.validateUser(username, password);

      expect(result).toBe(false);
    });

    it('应该使用 bcrypt 比较哈希密码', async () => {
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

      mockConfigService.get = originalMock;
    });
  });

  describe('login', () => {
    it('应该为有效凭据返回访问令牌', async () => {
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

    it('应该为无效凭据抛出 UnauthorizedException', async () => {
      const loginDto = { username: 'admin', password: 'wrongpassword' };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('应该为无效用户名抛出 UnauthorizedException', async () => {
      const loginDto = { username: 'wronguser', password: 'admin123' };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('生成的 JWT token 应该包含正确的 payload', async () => {
      const loginDto = { username: 'admin', password: 'admin123' };

      mockJwtService.sign.mockReturnValue('test-token');

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'admin',
          sub: 'admin',
        }),
      );
    });

    it('生成的响应应该包含 token_type 为 Bearer', async () => {
      const loginDto = { username: 'admin', password: 'admin123' };

      mockJwtService.sign.mockReturnValue('test-token');

      const result = await service.login(loginDto);

      expect(result.token_type).toBe('Bearer');
    });
  });

  describe('安全场景测试', () => {
    it('应该拒绝空用户名', async () => {
      const loginDto = { username: '', password: 'admin123' };

      const result = await service.validateUser('', 'admin123');

      expect(result).toBe(false);
    });

    it('应该拒绝空密码', async () => {
      const result = await service.validateUser('admin', '');

      expect(result).toBe(false);
    });

    it('应该拒绝空用户名和空密码', async () => {
      await expect(service.login({ username: '', password: '' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('错误用户名和密码应该返回统一错误（不暴露用户名是否存在）', async () => {
      const result1 = await service.validateUser('nonexistent', 'wrongpassword');
      const result2 = await service.validateUser('admin', 'wrongpassword');

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('应该处理特殊字符用户名', async () => {
      const username = "<script>alert('xss')</script>";
      const password = 'admin123';

      const result = await service.validateUser(username, password);

      expect(result).toBe(false);
    });

    it('应该处理 SQL 注入尝试', async () => {
      const username = "' OR 1=1 --";
      const password = 'anything';

      const result = await service.validateUser(username, password);

      expect(result).toBe(false);
    });
  });

  describe('边界值测试', () => {
    it('应该处理超长用户名', async () => {
      const longUsername = 'a'.repeat(1000);
      const result = await service.validateUser(longUsername, 'admin123');

      expect(result).toBe(false);
    });

    it('应该处理超长密码', async () => {
      const longPassword = 'a'.repeat(1000);
      const result = await service.validateUser('admin', longPassword);

      expect(result).toBe(false);
    });

    it('应该处理 Unicode 字符用户名', async () => {
      const unicodeUsername = '管理员';
      const result = await service.validateUser(unicodeUsername, 'admin123');

      expect(result).toBe(false);
    });

    it('应该处理带空格的用户名和密码', async () => {
      const result = await service.validateUser(' admin ', 'admin123 ');

      expect(result).toBe(false);
    });

    it('应该处理仅包含空格的用户名', async () => {
      const result = await service.validateUser('   ', 'admin123');

      expect(result).toBe(false);
    });

    it('应该处理仅包含空格的密码', async () => {
      const result = await service.validateUser('admin', '   ');

      expect(result).toBe(false);
    });

    it('多次登录尝试不应该泄露用户名信息', async () => {
      const wrongUserResult = await service.validateUser('wronguser', 'admin123');
      const wrongPassResult = await service.validateUser('admin', 'wrongpass');

      expect(wrongUserResult).toBe(false);
      expect(wrongPassResult).toBe(false);
    });
  });
});
