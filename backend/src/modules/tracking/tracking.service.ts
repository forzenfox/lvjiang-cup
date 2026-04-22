import { Injectable, Logger } from '@nestjs/common';

/**
 * 跟踪事件数据接口
 */
export interface TrackingEvent {
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * 跟踪服务 - 用于接收和记录前端发送的跟踪事件
 *
 * 当前实现：仅日志记录，不持久化存储
 */
@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  /**
   * 记录跟踪事件
   *
   * @param event - 跟踪事件数据
   */
  logEvent(event: TrackingEvent): void {
    // 记录事件日志，便于开发和调试
    this.logger.log(`Tracking Event: ${event.event} | ${JSON.stringify(event)}`);

    // 当前仅记录到控制台，未来可扩展为：
    // - 写入数据库
    // - 发送到外部分析服务
    // - 写入日志文件等
  }
}
