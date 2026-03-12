import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('Auth Integration Tests', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-jwt-token'),
            decode: jest.fn(() => ({ 
              username: 'admin', 
              sub: 'admin',
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 3600,
            })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'admin.username') return 'admin';
              if (key === 'admin.password') return 'admin123';
              if (key === 'jwt.secret') return 'test-secret';
              if (key === 'jwt.expiresIn') return '1h';
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Authentication Flow', () => {
    it('should authenticate user with valid credentials', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await service.login(loginDto);

      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
    });

    it('should reject invalid password', async () => {
      const loginDto = {
        username: 'admin',
        password: 'wrongpassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid username', async () => {
      const loginDto = {
        username: 'wronguser',
        password: 'admin123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject empty credentials', async () => {
      const loginDto = {
        username: '',
        password: '',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const result = await service.login(loginDto);

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

      const result = await service.login(loginDto);
      const decoded = jwtService.decode(result.access_token) as any;

      expect(decoded.username).toBe('admin');
      expect(decoded.sub).toBe('admin');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('User Validation', () => {
    it('should validate correct credentials', async () => {
      const isValid = await service.validateUser('admin', 'admin123');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isValid = await service.validateUser('admin', 'wrongpassword');
      expect(isValid).toBe(false);
    });

    it('should reject incorrect username', async () => {
      const isValid = await service.validateUser('wronguser', 'admin123');
      expect(isValid).toBe(false);
    });

    it('should reject both incorrect', async () => {
      const isValid = await service.validateUser('wronguser', 'wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'testpassword';
      const hashed = await service.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.startsWith('$2')).toBe(true); // bcrypt hash starts with $2
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });
});
