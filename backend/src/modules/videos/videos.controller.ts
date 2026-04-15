import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VideosService, SortItem } from './videos.service';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { SortVideosDto } from './dto/sort-videos.dto';
import { VideoPaginationDto, PaginatedResult } from './dto/pagination.dto';
import { Video } from './entities/video.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('视频管理')
@Controller()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('videos')
  @ApiOperation({ summary: '获取前端视频列表' })
  async findAll(): Promise<Video[]> {
    return this.videosService.findAll(false);
  }

  @Get('admin/videos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取后台视频列表（需认证）' })
  async findAllAdmin(@Query() paginationDto: VideoPaginationDto): Promise<PaginatedResult<Video>> {
    return this.videosService.findAllAdminPaginated(paginationDto);
  }

  @Post('admin/videos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加视频（需认证）' })
  async create(@Body() createVideoDto: CreateVideoDto): Promise<Video> {
    return this.videosService.create(createVideoDto);
  }

  @Put('admin/videos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新视频（需认证）' })
  @ApiParam({ name: 'id', description: '视频ID' })
  async update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto): Promise<Video> {
    return this.videosService.update(id, updateVideoDto);
  }

  @Delete('admin/videos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除视频（需认证）' })
  @ApiParam({ name: 'id', description: '视频ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.videosService.remove(id);
  }

  @Put('admin/videos/sort')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量排序视频（需认证）' })
  async sort(@Body() sortDto: SortVideosDto): Promise<Video[]> {
    const sortItems: SortItem[] = sortDto.orderedIds.map((id, index) => ({
      id,
      order: index,
    }));
    return this.videosService.sort(sortItems);
  }
}