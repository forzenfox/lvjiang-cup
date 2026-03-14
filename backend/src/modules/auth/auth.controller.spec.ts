import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('POST /admin/auth/login - 登录成功', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const loginResponse = {
        access_token: 'mock-jwt-token',
        username: 'admin',
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(loginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('POST /admin/auth/login - 登录失败（错误密码）', async () => {
      const loginDto = {
        username: 'admin',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('POST /admin/auth/login - 登录失败（错误用户名）', async () => {
      const loginDto = {
        username: 'wronguser',
        password: 'admin123',
      };

      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('POST /admin/auth/login - 登录失败（缺少参数）', async () => {
      const loginDto = {
        username: '',
        password: '',
      };

      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Username and password are required'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('POST /admin/auth/login - 响应格式验证', async () => {
      const loginDto = {
        username: 'admin',
        password: 'admin123',
      };

      const loginResponse = {
        access_token: 'mock-jwt-token',
        token_type: 'Bearer',
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('token_type');
      expect(typeof result.access_token).toBe('string');
      expect(typeof result.token_type).toBe('string');
    });

    it('POST /admin/auth/login - 请求格式错误', async () => {
      const invalidLoginDto = {
        username: 123, // 应该是字符串
        password: null,
      };

      mockAuthService.login.mockRejectedValue(new BadRequestException('Invalid request format'));

      await expect(controller.login(invalidLoginDto as any)).rejects.toThrow(BadRequestException);
    });
  });
});
