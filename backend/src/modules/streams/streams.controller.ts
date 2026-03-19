import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { StreamsService, StreamInfo } from './streams.service';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Stream } from './entities/stream.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('直播管理')
@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get('active')
  @ApiOperation({ summary: '获取当前活跃直播' })
  async findActive(): Promise<Stream> {
    return this.streamsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定直播' })
  @ApiParam({ name: 'id', description: '直播ID' })
  async findById(@Param('id') id: string): Promise<Stream> {
    return this.streamsService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有直播列表' })
  async findAll(): Promise<Stream[]> {
    return this.streamsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建直播（需认证）' })
  async create(@Body() createStreamDto: CreateStreamDto): Promise<Stream> {
    return this.streamsService.create(createStreamDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新直播（需认证）' })
  @ApiParam({ name: 'id', description: '直播ID' })
  async update(@Param('id') id: string, @Body() updateStreamDto: UpdateStreamDto): Promise<Stream> {
    return this.streamsService.update(id, updateStreamDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除直播（需认证）' })
  @ApiParam({ name: 'id', description: '直播ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.streamsService.remove(id);
  }

  // 保留旧接口以兼容
  @Get('stream')
  @ApiOperation({ summary: '获取直播信息（兼容旧接口）' })
  async findOne(): Promise<StreamInfo> {
    return this.streamsService.findOne();
  }
}
