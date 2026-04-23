import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { TrackingService, TrackingEvent } from './tracking.service';

/**
 * 跟踪事件请求体 DTO
 */
class TrackingEventDto {
  @IsNotEmpty()
  @IsString()
  event: string;

  @IsNotEmpty()
  @IsString()
  timestamp: string;

  [key: string]: unknown;
}

@ApiTags('数据跟踪')
@Controller('track')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  @ApiOperation({ summary: '接收前端跟踪事件' })
  handleTrackingEvent(@Body() event: TrackingEventDto): { success: boolean } {
    // 记录接收到的事件
    this.logger.debug(`Received tracking event: ${event.event}`);

    // 转发给服务层处理
    this.trackingService.logEvent(event as TrackingEvent);

    // 始终返回成功，避免前端重试
    return { success: true };
  }
}
