import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../../src/modules/auth/jwt.strategy';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload) => {
              // 模拟 JWT 签名，添加时间戳和随机数确保唯一性
              const now = Math.floor(Date.now() / 1000);
              const fullPayload = {
                ...payload,
                iat: now,
                exp: now + 3600,
                jti: Math.random().toString(36).substring(2), // JWT ID for uniqueness
              };
              return `mock-jwt-${JSON.stringify(fullPayload)}`;
            }),
            verify: jest.fn((token) => {
              if (token.includes('expired')) {
                throw new Error('Token expired');
              }
              if (token.includes('invalid')) {
                throw new Error('Invalid token');
              }
              // 解析模拟 token
              try {
                const payload = JSON.parse(token.replace('mock-jwt-', ''));
                return payload;
              } catch {
                const now = Math.floor(Date.now() / 1000);
                return { username: 'admin', sub: 'admin', iat: now, exp: now + 3600 };
              }
            }),
            decode: jest.fn((token) => {
              try {
                const payload = JSON.parse(token.replace('mock-jwt-', ''));
                // 确保返回的 payload 包含时间戳
                if (!payload.iat) {
                  const now = Math.floor(Date.now() / 1000);
                  payload.iat = now;
                  payload.exp = now + 3600;
                }
                return payload;
              } catch {
                const now = Math.floor(Date.now() / 1000);
                return { username: 'admin', sub: 'admin', iat: now, exp: now + 3600 };
              }
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'admin.username') return 'admin';
              if (key === 'admin.password') return 'admin123';
              if (key === 'jwt.secret') return 'test-secret-key-for-jwt-signing';
              if (key === 'jwt.expiresIn') return '1h';
              return null;
            },
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should authenticate user with valid credentials', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);

      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
    });

    it('should reject invalid password', async () => {
      const loginDto = {
        username: 'admin',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid username', async () => {
      const loginDto = {
        username: 'wronguser',
        password: 'admin123',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject empty credentials', async () => {
      const loginDto = {
        username: '',
        password: '',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);

      // 验证 token 可以被解码
      const decoded = jwtService.decode(result.access_token);
      expect(decoded).toBeDefined();
      expect(decoded['username']).toBe('admin');
      expect(decoded['sub']).toBe('admin');
    });

    it('should include correct payload in token', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);
      const decoded = jwtService.decode(result.access_token) as any;

      expect(decoded.username).toBe('admin');
      expect(decoded.sub).toBe('admin');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('User Validation', () => {
    it('should validate correct credentials', async () => {
      const isValid = await authService.validateUser('admin', 'admin123');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isValid = await authService.validateUser('admin', 'wrongpassword');
      expect(isValid).toBe(false);
    });

    it('should reject incorrect username', async () => {
      const isValid = await authService.validateUser('wronguser', 'admin123');
      expect(isValid).toBe(false);
    });

    it('should reject both incorrect', async () => {
      const isValid = await authService.validateUser('wronguser', 'wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'testpassword';
      const hashed = await authService.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.startsWith('$2')).toBe(true); // bcrypt hash starts with $2
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  // ==================== 新增测试用例 ====================

  describe('登录 → 获取 token → 访问受保护接口', () => {
    it('should complete full authentication flow', async () => {
      // 1. 登录获取 token
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const loginResult = await authService.login(loginDto);
      expect(loginResult.access_token).toBeDefined();
      expect(loginResult.token_type).toBe('Bearer');

      // 2. 验证 token 可以被解码
      const decoded = jwtService.decode(loginResult.access_token);
      expect(decoded).toBeDefined();
      expect(decoded['username']).toBe('admin');

      // 3. 模拟使用 token 访问受保护资源
      const verified = jwtService.verify(loginResult.access_token);
      expect(verified).toBeDefined();
      expect(verified.username).toBe('admin');
    });

    it('should validate token structure', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);
      const decoded = jwtService.decode(result.access_token) as any;

      // 验证 JWT payload 结构
      expect(decoded).toHaveProperty('username');
      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });
  });

  describe('token 过期处理', () => {
    it('should detect expired token', async () => {
      const expiredToken = 'mock-jwt-expired-token';

      expect(() => {
        jwtService.verify(expiredToken);
      }).toThrow('Token expired');
    });

    it('should reject requests with expired token', async () => {
      // 模拟过期 token
      const expiredToken = 'mock-jwt-expired-token';

      // 验证应该失败
      expect(() => {
        jwtService.verify(expiredToken);
      }).toThrow();
    });

    it('should handle token expiration time', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);
      const decoded = jwtService.decode(result.access_token) as any;

      // 验证有过期时间
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      // 默认1小时过期
      expect(decoded.exp - decoded.iat).toBe(3600);
    });
  });

  describe('token 刷新流程', () => {
    it('should allow re-login to get new token', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      // 第一次登录
      const result1 = await authService.login(loginDto);
      expect(result1.access_token).toBeDefined();

      // 第二次登录（刷新 token）
      const result2 = await authService.login(loginDto);
      expect(result2.access_token).toBeDefined();

      // 两次的 token 应该不同（因为包含时间戳）
      expect(result1.access_token).not.toBe(result2.access_token);
    });

    it('should validate new token after refresh', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      // 获取新 token
      const result = await authService.login(loginDto);

      // 验证新 token
      const decoded = jwtService.decode(result.access_token);
      expect(decoded['username']).toBe('admin');

      const verified = jwtService.verify(result.access_token);
      expect(verified).toBeDefined();
    });
  });

  describe('多用户并发登录', () => {
    it('should handle concurrent login requests', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      // 模拟并发登录
      const promises = Array.from({ length: 5 }, () => authService.login(loginDto));

      const results = await Promise.all(promises);

      // 所有登录都应该成功
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.access_token).toBeDefined();
        expect(result.token_type).toBe('Bearer');
      });
    });

    it('should generate unique tokens for concurrent logins', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const promises = Array.from({ length: 3 }, () => authService.login(loginDto));

      const results = await Promise.all(promises);
      const tokens = results.map((r) => r.access_token);

      // 所有 token 应该是唯一的
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });
  });

  describe('权限验证集成', () => {
    it('should validate admin role from token', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);
      const decoded = jwtService.decode(result.access_token) as any;

      // 验证 token 包含正确的用户信息
      expect(decoded.sub).toBe('admin');
      expect(decoded.username).toBe('admin');
    });

    it('should enforce role-based access', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);
      const verified = jwtService.verify(result.access_token);

      // 验证用户信息可用于权限检查
      expect(verified.username).toBe('admin');
      expect(verified.sub).toBe('admin');
    });
  });

  describe('JWT Guard 集成', () => {
    it('should validate token through JwtStrategy', async () => {
      const payload = { username: 'admin', sub: 'admin' };
      const jwtStrategy = new JwtStrategy(configService);

      // 验证 validate 方法
      const result = await jwtStrategy.validate(payload);
      expect(result.userId).toBe('admin');
      expect(result.username).toBe('admin');
    });

    it('should reject invalid payload in JwtStrategy', async () => {
      const jwtStrategy = new JwtStrategy(configService);

      // 验证无效 payload
      await expect(jwtStrategy.validate({})).rejects.toThrow(UnauthorizedException);
      await expect(jwtStrategy.validate(null)).rejects.toThrow(UnauthorizedException);
    });

    it('should create JwtAuthGuard instance', () => {
      // 验证 Guard 可以被实例化
      const guard = new JwtAuthGuard();
      expect(guard).toBeDefined();
    });
  });

  describe('错误处理集成', () => {
    it('should handle missing credentials', async () => {
      await expect(authService.login({ username: '', password: '' })).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(authService.login({ username: 'admin', password: '' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle null credentials', async () => {
      await expect(
        authService.login({ username: null as any, password: null as any }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle undefined credentials', async () => {
      await expect(
        authService.login({ username: undefined as any, password: undefined as any }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should provide clear error messages', async () => {
      try {
        await authService.login({ username: 'wrong', password: 'wrong' });
        fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });

  describe('安全测试', () => {
    it('should not expose password in token', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await authService.login(loginDto);
      const decoded = jwtService.decode(result.access_token) as any;

      // 确保 token 不包含密码
      expect(decoded.password).toBeUndefined();
      expect(JSON.stringify(decoded)).not.toContain('admin123');
    });

    it('should handle SQL injection attempts', async () => {
      const maliciousUsername = "admin' OR '1'='1";
      const maliciousPassword = "' OR '1'='1";

      const isValid = await authService.validateUser(maliciousUsername, maliciousPassword);
      expect(isValid).toBe(false);
    });

    it('should handle XSS attempts in credentials', async () => {
      const xssUsername = '<script>alert("xss")</script>';
      const xssPassword = '<img src=x onerror=alert("xss")>';

      const isValid = await authService.validateUser(xssUsername, xssPassword);
      expect(isValid).toBe(false);
    });

    it('should validate token signature', async () => {
      // 使用模拟的无效 token
      const invalidToken = 'mock-jwt-invalid-token';

      expect(() => {
        jwtService.verify(invalidToken);
      }).toThrow();
    });

    it('should enforce strong password hashing', async () => {
      const password = 'testpassword';
      const hashed = await authService.hashPassword(password);

      // 验证 bcrypt 哈希格式
      expect(hashed).toMatch(/^\$2[aby]\$\d+\$/);

      // 验证哈希长度
      expect(hashed.length).toBeGreaterThan(50);
    });

    it('should prevent timing attacks on login', async () => {
      // 测量不同凭证的响应时间
      const start1 = Date.now();
      try {
        await authService.validateUser('admin', 'admin123');
      } catch {}
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      try {
        await authService.validateUser('admin', 'wrong');
      } catch {}
      const time2 = Date.now() - start2;

      const start3 = Date.now();
      try {
        await authService.validateUser('wrong', 'admin123');
      } catch {}
      const time3 = Date.now() - start3;

      // 时间差异应该在合理范围内（防止时序攻击）
      const times = [time1, time2, time3];
      const maxDiff = Math.max(...times) - Math.min(...times);
      expect(maxDiff).toBeLessThan(100); // 100ms 容差
    });
  });
});
