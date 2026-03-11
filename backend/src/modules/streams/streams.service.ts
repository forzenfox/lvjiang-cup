import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { UpdateStreamDto } from './dto/update-stream.dto';

export interface StreamInfo {
  title: string;
  url: string;
  isLive: boolean;
}

@Injectable()
export class StreamsService {
  private readonly logger = new Logger(StreamsService.name);
  private readonly CACHE_KEY = 'stream:info';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async findOne(): Promise<StreamInfo> {
    // 尝试从缓存获取
    const cached = this.cacheService.get<StreamInfo>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    const result = await this.databaseService.get<any>('SELECT * FROM stream_info WHERE id = 1');

    const streamInfo: StreamInfo = {
      title: result?.title || '',
      url: result?.url || '',
      isLive: result?.is_live === 1,
    };

    // 写入缓存
    this.cacheService.set(this.CACHE_KEY, streamInfo);

    return streamInfo;
  }

  async update(updateStreamDto: UpdateStreamDto): Promise<StreamInfo> {
    const updates: string[] = [];
    const values: any[] = [];

    if (updateStreamDto.title !== undefined) {
      updates.push('title = ?');
      values.push(updateStreamDto.title);
    }
    if (updateStreamDto.url !== undefined) {
      updates.push('url = ?');
      values.push(updateStreamDto.url);
    }
    if (updateStreamDto.isLive !== undefined) {
      updates.push('is_live = ?');
      values.push(updateStreamDto.isLive ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(1); // id = 1
      
      await this.databaseService.run(
        `UPDATE stream_info SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );
    }

    this.logger.log('Stream info updated');
    
    // 清除缓存
    this.cacheService.del(this.CACHE_KEY);

    return this.findOne();
  }
}
