import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';

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
  isStar: boolean;
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
  isStar: boolean;
}

export interface UpdateStreamerDto {
  nickname?: string;
  posterUrl?: string;
  bio?: string;
  liveUrl?: string;
  streamerType?: StreamerType;
  isStar?: boolean;
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
  is_star: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class StreamersService {
  private readonly logger = new Logger(StreamersService.name);
  private readonly CACHE_KEY_ALL = 'streamers:all';
  private readonly CACHE_KEY_PREFIX = 'streamer:';
  private readonly TABLE_NAME = 'streamers';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  private mapRowToStreamer(row: StreamerRow): Streamer {
    return {
      id: row.id,
      nickname: row.nickname,
      posterUrl: row.poster_url,
      bio: row.bio,
      liveUrl: row.live_url,
      streamerType: row.streamer_type as StreamerType,
      isStar: Boolean(row.is_star),
      sortOrder: row.sort_order ?? 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async findAll(): Promise<Streamer[]> {
    const cached = this.cacheService.get<Streamer[]>(this.CACHE_KEY_ALL);
    if (cached) {
      return cached;
    }

    const rows = await this.databaseService.all<StreamerRow>(
      'SELECT * FROM streamers ORDER BY sort_order ASC, created_at DESC',
    );

    const streamers = rows.map(row => this.mapRowToStreamer(row));
    this.cacheService.set(this.CACHE_KEY_ALL, streamers);
    return streamers;
  }

  async findOne(id: string): Promise<Streamer> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    const cached = this.cacheService.get<Streamer>(cacheKey);
    if (cached) {
      return cached;
    }

    const row = await this.databaseService.get<StreamerRow>(
      'SELECT * FROM streamers WHERE id = ?',
      [id],
    );

    if (!row) {
      throw new NotFoundException(`主播不存在: ${id}`);
    }

    const streamer = this.mapRowToStreamer(row);
    this.cacheService.set(cacheKey, streamer);
    return streamer;
  }

  async create(createStreamerDto: CreateStreamerDto): Promise<Streamer> {
    const id = `streamer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.databaseService.run(
      `INSERT INTO streamers (id, nickname, poster_url, bio, live_url, streamer_type, is_star, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        createStreamerDto.nickname,
        createStreamerDto.posterUrl,
        createStreamerDto.bio,
        createStreamerDto.liveUrl,
        createStreamerDto.streamerType,
        createStreamerDto.isStar ? 1 : 0,
        now,
        now,
      ],
    );

    this.invalidateCache();

    return {
      id,
      ...createStreamerDto,
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
    if (updateStreamerDto.isStar !== undefined) {
      updates.push('is_star = ?');
      params.push(updateStreamerDto.isStar ? 1 : 0);
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

    this.invalidateCache(id);

    return {
      ...existing,
      ...updateStreamerDto,
      updatedAt: new Date(),
    };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.databaseService.run('DELETE FROM streamers WHERE id = ?', [id]);
    this.invalidateCache(id);
  }

  async updateSort(updateStreamerSortDto: UpdateStreamerSortDto): Promise<void> {
    const { orders } = updateStreamerSortDto;

    for (const order of orders) {
      await this.databaseService.run(
        'UPDATE streamers SET sort_order = ?, updated_at = ? WHERE id = ?',
        [order.sortOrder, new Date().toISOString(), order.id],
      );
    }

    this.invalidateCache();
  }

  private invalidateCache(id?: string): void {
    this.cacheService.del(this.CACHE_KEY_ALL);
    if (id) {
      this.cacheService.del(`${this.CACHE_KEY_PREFIX}${id}`);
    }
  }
}