import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MatchesService, Match } from './matches.service';
import { UpdateMatchDto } from './dto/update-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('比赛管理')
@Controller()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('matches')
  @ApiOperation({ summary: '获取所有比赛列表' })
  @ApiQuery({ name: 'stage', required: false, description: '按阶段筛选 (swiss/elimination)' })
  async findAll(@Query('stage') stage?: string): Promise<Match[]> {
    return this.matchesService.findAll(stage);
  }

  @Get('matches/:id')
  @ApiOperation({ summary: '获取单个比赛详情' })
  @ApiParam({ name: 'id', description: '比赛ID' })
  async findOne(@Param('id') id: string): Promise<Match> {
    return this.matchesService.findOne(id);
  }

  @Put('admin/matches/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新比赛（需认证）' })
  @ApiParam({ name: 'id', description: '比赛ID' })
  async update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto): Promise<Match> {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete('admin/matches/:id/scores')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '清空比赛比分（需认证）' })
  @ApiParam({ name: 'id', description: '比赛ID' })
  async clearScores(@Param('id') id: string): Promise<Match> {
    return this.matchesService.clearScores(id);
  }
}
