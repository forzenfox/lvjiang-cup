import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService, RunResult } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Stream } from './entities/stream.entity';

export interface StreamInfo {
  title: string;
  url: string;
  isLive: boolean;
}

@Injectable()
export class StreamsService {
  private readonly logger = new Logger(StreamsService.name);
  private readonly CACHE_KEY = 'stream:info';
  private readonly CACHE_KEY_ALL = 'streams:all';

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

  async findAll(): Promise<Stream[]> {
    // 尝试从缓存获取
    const cached = this.cacheService.get<Stream[]>(this.CACHE_KEY_ALL);
    if (cached) {
      return cached;
    }

    const results = await this.databaseService.all<any>('SELECT * FROM stream_info ORDER BY id');

    const streams: Stream[] = results.map((row) => ({
      id: String(row.id),
      title: row.title || '',
      url: row.url || '',
      isLive: row.is_live === 1,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));

    // 写入缓存
    this.cacheService.set(this.CACHE_KEY_ALL, streams);

    return streams;
  }

  async findById(id: string): Promise<Stream> {
    const result = await this.databaseService.get<any>('SELECT * FROM stream_info WHERE id = ?', [
      id,
    ]);

    if (!result) {
      throw new NotFoundException(`直播信息不存在: ${id}`);
    }

    return {
      id: String(result.id),
      title: result.title || '',
      url: result.url || '',
      isLive: result.is_live === 1,
      createdAt: result.created_at || new Date().toISOString(),
      updatedAt: result.updated_at || new Date().toISOString(),
    };
  }

  async findActive(): Promise<Stream> {
    // 获取ID为1的直播信息作为活跃直播
    return this.findById('1');
  }

  async create(createStreamDto: CreateStreamDto): Promise<Stream> {
    const result: RunResult = await this.databaseService.run(
      'INSERT INTO stream_info (title, url, is_live, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [createStreamDto.title, createStreamDto.url, createStreamDto.isLive ? 1 : 0],
    );

    this.logger.log(`Stream created with id: ${result.lastID}`);

    // 清除缓存
    this.cacheService.del(this.CACHE_KEY_ALL);

    return this.findById(String(result.lastID));
  }

  async update(id: string, updateStreamDto: UpdateStreamDto): Promise<Stream> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`直播信息不存在: ${id}`);
    }

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
      values.push(id);

      await this.databaseService.run(
        `UPDATE stream_info SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );
    }

    this.logger.log(`Stream info updated: ${id}`);

    // 清除缓存
    this.cacheService.del(this.CACHE_KEY);
    this.cacheService.del(this.CACHE_KEY_ALL);

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`直播信息不存在: ${id}`);
    }

    await this.databaseService.run('DELETE FROM stream_info WHERE id = ?', [id]);

    this.logger.log(`Stream deleted: ${id}`);

    // 清除缓存
    this.cacheService.del(this.CACHE_KEY);
    this.cacheService.del(this.CACHE_KEY_ALL);
  }
}
