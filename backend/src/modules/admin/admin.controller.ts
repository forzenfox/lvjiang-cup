import { Controller, Post, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchesService } from '../matches/matches.service';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';

@ApiTags('管理操作')
@Controller('admin')
export class AdminController {
  constructor(
    private matchesService: MatchesService,
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  @Post('init-slots')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '初始化比赛槽位（瑞士轮+淘汰赛）' })
  async initSlots(): Promise<{ message: string; count: number }> {
    await this.matchesService.initSlots();
    const result = await this.databaseService.get<{ count: number }>('SELECT COUNT(*) as count FROM matches');
    
    return {
      message: 'Match slots initialized successfully',
      count: result.count,
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
