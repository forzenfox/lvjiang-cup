import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TeamsService, Team } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PaginationDto, PaginatedResult } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('战队管理')
@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('teams')
  @ApiOperation({ summary: '获取所有战队列表' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Team>> {
    const allTeams = await this.teamsService.findAll();
    const page = paginationDto.page || 1;
    const pageSize = paginationDto.pageSize || 100;

    // 计算分页
    const total = allTeams.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = allTeams.slice(start, end);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
    };
  }

  @Get('teams/:id')
  @ApiOperation({ summary: '获取单个战队详情' })
  @ApiParam({ name: 'id', description: '战队ID' })
  async findOne(@Param('id') id: string): Promise<Team> {
    return this.teamsService.findOne(id);
  }

  @Post('admin/teams')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建战队（需认证）' })
  async create(@Body() createTeamDto: CreateTeamDto): Promise<Team> {
    return this.teamsService.create(createTeamDto);
  }

  @Put('admin/teams/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新战队（需认证）' })
  @ApiParam({ name: 'id', description: '战队ID' })
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto): Promise<Team> {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete('admin/teams/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除战队（需认证）' })
  @ApiParam({ name: 'id', description: '战队ID' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.teamsService.remove(id);
    return { message: 'Team deleted successfully' };
  }
}
