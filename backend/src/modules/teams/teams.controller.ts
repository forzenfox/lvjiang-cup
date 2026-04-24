import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TeamsService, Team, TeamMember } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('战队管理')
@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('teams')
  @ApiOperation({ summary: '获取所有战队列表' })
  async findAll(): Promise<Team[]> {
    return this.teamsService.findAll();
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

  // ==================== 队员管理路由 ====================

  @Get('teams/:id/members')
  @ApiOperation({ summary: '获取战队队员列表' })
  @ApiParam({ name: 'id', description: '战队ID' })
  async findMembers(@Param('id') id: string): Promise<TeamMember[]> {
    return this.teamsService.findMembersByTeamId(id);
  }

  @Post('teams/:id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加队员（需认证）' })
  @ApiParam({ name: 'id', description: '战队ID' })
  async createMember(
    @Param('id') teamId: string,
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<TeamMember> {
    return this.teamsService.createMember(teamId, createMemberDto);
  }

  @Put('admin/members/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新队员（需认证）' })
  @ApiParam({ name: 'id', description: '队员ID' })
  async updateMember(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<TeamMember> {
    return this.teamsService.updateMember(id, updateMemberDto);
  }

  @Delete('admin/members/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除队员（需认证）' })
  @ApiParam({ name: 'id', description: '队员ID' })
  async removeMember(@Param('id') id: string): Promise<{ message: string }> {
    await this.teamsService.removeMember(id);
    return { message: 'Member deleted successfully' };
  }
}
