import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FormatsService } from './formats.service';
import { CreateFormatDto } from './dto/create-format.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('赛制配置')
@Controller()
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get('format/active')
  @ApiOperation({ summary: '获取当前生效配置（公开接口，无激活配置时返回内置默认）' })
  async getActiveFormat() {
    return this.formatsService.getActiveFormat();
  }

  @Get('admin/formats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取赛制配置列表（需认证）' })
  async listFormats() {
    return this.formatsService.listFormats();
  }

  @Post('admin/formats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '保存新赛制配置（需认证，校验后落库，不自动生成槽位）' })
  async createFormat(@Body() dto: CreateFormatDto) {
    return this.formatsService.createFormat(dto.config, dto.name);
  }

  @Put('admin/formats/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiOperation({ summary: '编辑赛制配置（需认证，不影响已生成槽位）' })
  async updateFormat(@Param('id') id: string, @Body() dto: CreateFormatDto) {
    return this.formatsService.updateFormat(id, dto.config);
  }

  @Delete('admin/formats/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiOperation({ summary: '删除赛制配置（需认证，已激活配置需先停用）' })
  async deleteFormat(@Param('id') id: string) {
    await this.formatsService.deleteFormat(id);
    return { message: 'Format config deleted successfully' };
  }

  @Post('admin/formats/:id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '配置ID' })
  @ApiOperation({ summary: '激活赛制配置（需认证，单配置模式，切换激活指针）' })
  async activateFormat(@Param('id') id: string) {
    await this.formatsService.activateFormat(id);
    return { message: 'Format config activated successfully' };
  }

  @Post('admin/format/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '清除激活指针，切回内置默认配置（需认证）' })
  async deactivateFormat() {
    await this.formatsService.deactivateFormat();
    return { message: '已切回内置默认赛制配置' };
  }
}
