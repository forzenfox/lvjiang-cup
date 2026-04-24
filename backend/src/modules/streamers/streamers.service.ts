import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { BaseCachedService } from '../../common/services/base-cached.service';
import * as fs from 'fs';
import * as path from 'path';
import { getStreamerPosterPath } from '../../common/utils/path.util';

export enum StreamerType {
  INTERNAL = 'internal',
  GUEST = 'guest',
}

export interface Streamer {
  id: string;
  nickname: string;
  posterUrl: string;
  bio: string;
  liveUrl: string;
  streamerType: StreamerType;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStreamerDto {
  nickname: string;
  posterUrl: string;
  bio: string;
  liveUrl: string;
  streamerType: StreamerType;
}

export interface UpdateStreamerDto {
  nickname?: string;
  posterUrl?: string;
  bio?: string;
  liveUrl?: string;
  streamerType?: StreamerType;
  sortOrder?: number;
}

export interface UpdateStreamerSortDto {
  orders: { id: string; sortOrder: number }[];
}

interface StreamerRow {
  id: string;
  nickname: string;
  poster_url: string;
  bio: string;
  live_url: string;
  streamer_type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class StreamersService extends BaseCachedService<Streamer, string> {
  private readonly streamerLogger = new Logger(StreamersService.name);
  private readonly TABLE_NAME = 'streamers';

  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService, 'StreamersService');
  }

  protected getCachePrefix(): string {
    return 'streamers';
  }

  private mapRowToStreamer(row: StreamerRow): Streamer {
    return {
      id: row.id,
      nickname: row.nickname,
      posterUrl: row.poster_url || '',
      bio: row.bio || '',
      liveUrl: row.live_url || '',
      streamerType: row.streamer_type as StreamerType,
      sortOrder: row.sort_order ?? 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  protected async findAllFromDb(): Promise<Streamer[]> {
    const rows = await this.databaseService.all<StreamerRow>(
      'SELECT * FROM streamers ORDER BY sort_order ASC, created_at DESC',
    );
    return rows.map((row) => this.mapRowToStreamer(row));
  }

  protected async findOneFromDb(id: string): Promise<Streamer | undefined> {
    const row = await this.databaseService.get<StreamerRow>(
      'SELECT * FROM streamers WHERE id = ?',
      [id],
    );
    return row ? this.mapRowToStreamer(row) : undefined;
  }

  async findAll(): Promise<Streamer[]> {
    return this.getOrSetAll();
  }

  async findOne(id: string): Promise<Streamer> {
    try {
      return await this.getOrSetOne(id);
    } catch (error) {
      throw new NotFoundException(`主播不存在: ${id}`);
    }
  }

  async create(createStreamerDto: CreateStreamerDto): Promise<Streamer> {
    const id = `streamer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.databaseService.run(
      `INSERT INTO streamers (id, nickname, poster_url, bio, live_url, streamer_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createStreamerDto.nickname,
        createStreamerDto.posterUrl,
        createStreamerDto.bio,
        createStreamerDto.liveUrl,
        createStreamerDto.streamerType,
        now,
        now,
      ],
    );

    this.clearAllCache();

    return {
      id,
      ...createStreamerDto,
      sortOrder: 0,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async update(id: string, updateStreamerDto: UpdateStreamerDto): Promise<Streamer> {
    const existing = await this.findOne(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (updateStreamerDto.nickname !== undefined) {
      updates.push('nickname = ?');
      params.push(updateStreamerDto.nickname);
    }
    if (updateStreamerDto.posterUrl !== undefined) {
      if (existing.posterUrl && existing.posterUrl !== updateStreamerDto.posterUrl) {
        await this.deletePoster(existing.posterUrl);
      }
      updates.push('poster_url = ?');
      params.push(updateStreamerDto.posterUrl);
    }
    if (updateStreamerDto.bio !== undefined) {
      updates.push('bio = ?');
      params.push(updateStreamerDto.bio);
    }
    if (updateStreamerDto.liveUrl !== undefined) {
      updates.push('live_url = ?');
      params.push(updateStreamerDto.liveUrl);
    }
    if (updateStreamerDto.streamerType !== undefined) {
      updates.push('streamer_type = ?');
      params.push(updateStreamerDto.streamerType);
    }
    if (updateStreamerDto.sortOrder !== undefined) {
      updates.push('sort_order = ?');
      params.push(updateStreamerDto.sortOrder);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await this.databaseService.run(
        `UPDATE streamers SET ${updates.join(', ')} WHERE id = ?`,
        params,
      );
    }

    this.clearRelatedCache(id);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.databaseService.run('DELETE FROM streamers WHERE id = ?', [id]);

    if (existing.posterUrl) {
      await this.deletePoster(existing.posterUrl);
    }

    this.clearRelatedCache(id);
  }

  private async deletePoster(posterUrl: string): Promise<void> {
    if (!posterUrl) return;
    if (posterUrl.startsWith('http')) return;
    try {
      const filename = path.basename(posterUrl);
      const posterPath = getStreamerPosterPath(filename);
      if (fs.existsSync(posterPath)) {
        fs.unlinkSync(posterPath);
        await this.databaseService.deleteFileHashByPath(posterPath);
        this.streamerLogger.log(`Poster deleted: ${posterPath}`);
      }
    } catch (error) {
      this.streamerLogger.error(`Failed to delete poster ${posterUrl}: ${error.message}`);
    }
  }

  async updateSort(updateStreamerSortDto: UpdateStreamerSortDto): Promise<void> {
    const { orders } = updateStreamerSortDto;

    for (const order of orders) {
      await this.databaseService.run(
        'UPDATE streamers SET sort_order = ?, updated_at = ? WHERE id = ?',
        [order.sortOrder, new Date().toISOString(), order.id],
      );
    }

    this.clearAllCache();
  }
}
