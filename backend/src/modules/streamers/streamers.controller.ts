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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  StreamersService,
  CreateStreamerDto,
  UpdateStreamerDto,
  UpdateStreamerSortDto,
} from './streamers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('streamers')
@Controller('streamers')
export class StreamersController {
  constructor(private readonly streamersService: StreamersService) {}

  @Get()
  @ApiOperation({ summary: '获取所有主播列表' })
  async findAll() {
    return this.streamersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个主播详情' })
  async findOne(@Param('id') id: string) {
    return this.streamersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建主播（需认证）' })
  async create(@Body() createStreamerDto: CreateStreamerDto) {
    return this.streamersService.create(createStreamerDto);
  }

  @Patch('sort')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量更新主播排序（需认证）' })
  async updateSort(@Body() updateStreamerSortDto: UpdateStreamerSortDto) {
    return this.streamersService.updateSort(updateStreamerSortDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新主播（需认证）' })
  async update(@Param('id') id: string, @Body() updateStreamerDto: UpdateStreamerDto) {
    return this.streamersService.update(id, updateStreamerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除主播' })
  async remove(@Param('id') id: string) {
    return this.streamersService.remove(id);
  }
}
