import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  StreamersService,
  CreateStreamerDto,
  UpdateStreamerDto,
  UpdateStreamerSortDto,
} from './streamers.service';

@ApiTags('streamers')
@Controller()
export class StreamersController {
  constructor(private readonly streamersService: StreamersService) {}

  @Get('streamers')
  @ApiOperation({ summary: '获取所有主播列表' })
  async findAll() {
    return this.streamersService.findAll();
  }

  @Get('streamers/:id')
  @ApiOperation({ summary: '获取单个主播详情' })
  async findOne(@Param('id') id: string) {
    return this.streamersService.findOne(id);
  }

  @Post('admin/streamers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建主播（需认证）' })
  async create(@Body() createStreamerDto: CreateStreamerDto) {
    return this.streamersService.create(createStreamerDto);
  }

  @Patch('admin/streamers/sort')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量更新主播排序（需认证）' })
  async updateSort(@Body() updateStreamerSortDto: UpdateStreamerSortDto) {
    return this.streamersService.updateSort(updateStreamerSortDto);
  }

  @Patch('admin/streamers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新主播（需认证）' })
  async update(@Param('id') id: string, @Body() updateStreamerDto: UpdateStreamerDto) {
    return this.streamersService.update(id, updateStreamerDto);
  }

  @Delete('admin/streamers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除主播（需认证）' })
  @ApiParam({ name: 'id', description: '主播ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.streamersService.remove(id);
  }
}
