import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@ApiTags('认证管理')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/auth/login')
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}
