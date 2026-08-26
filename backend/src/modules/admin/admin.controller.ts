import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchesService } from '../matches/matches.service';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { FormatsService } from '../formats/formats.service';

@ApiTags('管理操作')
@Controller('admin')
export class AdminController {
  constructor(
    private matchesService: MatchesService,
    private databaseService: DatabaseService,
    private cacheService: CacheService,
    private formatsService: FormatsService,
  ) {}

  @Post('init-slots')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '初始化比赛槽位（按生效赛制配置生成，保留路径兼容旧前端）' })
  async initSlots(): Promise<{ message: string; created: number; skipped: number; total: number }> {
    const result = await this.matchesService.generateSlots();

    return {
      message: 'Match slots initialized successfully',
      created: result.created,
      skipped: result.skipped,
      total: result.total,
    };
  }

  @Post('slots/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '按赛制配置生成比赛槽位（幂等，不覆盖已存在数据）' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        formatId: { type: 'string', description: '赛制配置ID（可选，省略时按生效配置）' },
      },
    },
  })
  async generateSlots(
    @Body() body: { formatId?: string },
  ): Promise<{ message: string; created: number; skipped: number; total: number }> {
    const result = await this.matchesService.generateSlots(body?.formatId);

    return {
      message: 'Match slots generated successfully',
      created: result.created,
      skipped: result.skipped,
      total: result.total,
    };
  }

  @Post('reset-slots')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '重置槽位（清空战队和比分，保留槽位结构）' })
  async resetSlots(): Promise<{ message: string }> {
    await this.databaseService.resetMatchSlots();
    this.cacheService.flush();

    return {
      message: 'Match slots reset successfully',
    };
  }

  @Delete('data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '完全清空所有数据' })
  async clearAllData(): Promise<{ message: string }> {
    await this.databaseService.clearAllData();
    this.cacheService.flush();

    return {
      message: 'All data cleared successfully',
    };
  }
}
