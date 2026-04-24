import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<boolean> {
    const adminUsername = this.configService.get<string>('admin.username');
    const adminPassword = this.configService.get<string>('admin.password');

    if (username !== adminUsername) {
      return false;
    }

    // 检查密码是否是 bcrypt 格式
    if (adminPassword.startsWith('$2')) {
      return bcrypt.compare(password, adminPassword);
    }

    // 明文密码比较（仅用于开发环境）
    return password === adminPassword;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; token_type: string }> {
    const isValid = await this.validateUser(loginDto.username, loginDto.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: loginDto.username, sub: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${loginDto.username}`);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
    };
  }

  // 生成 bcrypt 密码哈希（用于初始化）
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
