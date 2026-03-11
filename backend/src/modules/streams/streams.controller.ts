import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StreamsService, StreamInfo } from './streams.service';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('直播管理')
@Controller()
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get('stream')
  @ApiOperation({ summary: '获取直播信息' })
  async findOne(): Promise<StreamInfo> {
    return this.streamsService.findOne();
  }

  @Put('admin/stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新直播信息（需认证）' })
  async update(@Body() updateStreamDto: UpdateStreamDto): Promise<StreamInfo> {
    return this.streamsService.update(updateStreamDto);
  }
}
