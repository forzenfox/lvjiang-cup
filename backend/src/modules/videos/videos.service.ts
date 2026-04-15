import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, RunResult } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoPaginationDto, PaginatedResult } from './dto/pagination.dto';
import { Video } from './entities/video.entity';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { uploadConfig } from '../../config/upload.config';
import { getVideoCoverPath, getVideoCoverUrl } from '../../common/utils/path.util';

export interface SortItem {
  id: string;
  order: number;
}

interface BilibiliApiResponse {
  code: number;
  message: string;
  ttl: number;
  data?: {
    bvid: string;
    title: string;
    pic: string;
    aid: number;
    duration: number;
    embedable: number;
    pages: Array<{
      cid: number;
      page: number;
      part: string;
    }>;
  };
}

interface BilibiliMeta {
  title: string;
  coverUrl: string;
  embedable: boolean;
}

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);
  private readonly CACHE_KEY_ALL = 'videos:all';
  private readonly CACHE_KEY_LIST = 'videos:list';
  private readonly MAX_VIDEOS = 10;
  private readonly BILIBILI_API_BASE = 'https://api.bilibili.com/x/web-interface/view';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  private httpGet(url: string): Promise<{ data: string; statusCode: number }> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com/',
        },
        timeout: 10000,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ data, statusCode: res.statusCode || 0 }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('Request timeout')); });
    });
  }

  async fetchBilibiliMeta(bvid: string): Promise<BilibiliMeta> {
    try {
      const response = await this.httpGet(`${this.BILIBILI_API_BASE}?bvid=${bvid}`);
      const data: BilibiliApiResponse = JSON.parse(response.data);

      if (data.code !== 0 || !data.data) {
        throw new BadRequestException(`B站视频不存在或已下架: ${data.message}`);
      }

      return {
        title: data.data.title,
        coverUrl: data.data.pic,
        embedable: data.data.embedable === 1,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to fetch Bilibili meta for ${bvid}: ${error.message}`);
      throw new BadRequestException(`获取B站视频信息失败: ${error.message}`);
    }
  }

  private async downloadImage(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(destPath);

      protocol.get(url, {
        headers: {
          'Referer': 'https://www.bilibili.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }, (response) => {
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
  }

  private async ensureCoverDir(): Promise<string> {
    const coverDir = path.dirname(getVideoCoverPath('placeholder'));
    if (!fs.existsSync(coverDir)) {
      fs.mkdirSync(coverDir, { recursive: true });
    }
    return coverDir;
  }

  async fetchAndSaveCover(bvid: string): Promise<string> {
    const meta = await this.fetchBilibiliMeta(bvid);

    await this.ensureCoverDir();

    const filename = `${crypto.randomUUID()}.jpg`;
    const coverPath = getVideoCoverPath(filename);

    await this.downloadImage(meta.coverUrl, coverPath);

    this.logger.log(`Cover downloaded for ${bvid}: ${filename}`);

    return filename;
  }

  private async deleteCover(coverFilename: string): Promise<void> {
    if (!coverFilename) return;

    try {
      const coverPath = getVideoCoverPath(coverFilename);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
        this.logger.log(`Cover deleted: ${coverFilename}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete cover ${coverFilename}: ${error.message}`);
    }
  }

  extractBvidFromUrl(url: string): { bvid: string } {
    const patterns = [
      /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
      /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)\?p=(\d+)/,
      /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)\//,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { bvid: match[1] };
      }
    }

    const directBvidRegex = /^([Bb][Vv][a-zA-Z0-9]{10})$/;
    const directMatch = url.trim().match(directBvidRegex);
    if (directMatch) {
      return { bvid: directMatch[1] };
    }

    throw new BadRequestException('无效的B站视频链接或BV号');
  }

  validateBvid(bvid: string): boolean {
    return /^BV[A-Za-z0-9]{10}$/.test(bvid);
  }

  private rowToVideo(row: any): Video {
    const bilibiliTitle = row.bilibili_title || '';
    const customTitle = row.custom_title || '';
    const displayTitle = customTitle || bilibiliTitle || '未命名视频';
    const coverFilename = row.cover_url || '';

    return {
      id: String(row.id),
      bvid: row.bvid || '',
      bilibiliTitle: bilibiliTitle || undefined,
      customTitle: customTitle || undefined,
      title: displayTitle,
      coverUrl: coverFilename ? getVideoCoverUrl(coverFilename) : '',
      order: row.order || 0,
      status: row.status || 'enabled',
      isEnabled: row.status === 'enabled',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      createdBy: row.created_by || '',
    };
  }

  async findAll(includeDisabled = false): Promise<Video[]> {
    const cacheKey = includeDisabled ? `${this.CACHE_KEY_ALL}:all` : this.CACHE_KEY_LIST;
    const cached = this.cacheService.get<Video[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const sql = includeDisabled
      ? 'SELECT * FROM videos ORDER BY "order" ASC'
      : 'SELECT * FROM videos WHERE status = \'enabled\' ORDER BY "order" ASC';

    const results = await this.databaseService.all<any>(sql);
    const videos = results.map((row) => this.rowToVideo(row));

    this.cacheService.set(cacheKey, videos);
    return videos;
  }

  async findAllAdmin(): Promise<Video[]> {
    return this.findAll(true);
  }

  async findAllAdminPaginated(paginationDto: VideoPaginationDto): Promise<PaginatedResult<Video>> {
    const { page = 1, pageSize = 10, sortBy = 'order', sortOrder = 'asc', search, isEnabled } = paginationDto;

    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(bilibili_title LIKE ? OR custom_title LIKE ? OR bvid LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (isEnabled !== undefined) {
      conditions.push('status = ?');
      params.push(isEnabled ? 'enabled' : 'disabled');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM videos ${whereClause}`;
    const countResult = await this.databaseService.get<{ total: number }>(countSql, params);
    const total = countResult?.total || 0;

    const validSortFields = ['order', 'created_at', 'updated_at', 'bilibili_title', 'custom_title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'order';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const offset = (page - 1) * pageSize;
    const dataSql = `SELECT * FROM videos ${whereClause} ORDER BY "${sortField}" ${order} LIMIT ? OFFSET ?`;
    const dataParams = [...params, pageSize, offset];

    const results = await this.databaseService.all<any>(dataSql, dataParams);
    const list = results.map((row) => this.rowToVideo(row));

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async findById(id: string): Promise<Video> {
    const result = await this.databaseService.get<any>('SELECT * FROM videos WHERE id = ?', [id]);

    if (!result) {
      throw new NotFoundException(`视频不存在: ${id}`);
    }

    return this.rowToVideo(result);
  }

  async create(createVideoDto: CreateVideoDto, createdBy?: string): Promise<Video> {
    const { url, customTitle, status } = createVideoDto;

    const { bvid } = this.extractBvidFromUrl(url);

    if (!this.validateBvid(bvid)) {
      throw new BadRequestException('无效的B站视频BV号');
    }

    const countResult = await this.databaseService.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM videos',
    );
    if (countResult && countResult.count >= this.MAX_VIDEOS) {
      throw new BadRequestException(`最多只能添加${this.MAX_VIDEOS}个视频`);
    }

    const existing = await this.databaseService.get<any>(
      'SELECT * FROM videos WHERE bvid = ?',
      [bvid],
    );
    if (existing) {
      throw new BadRequestException(`B站视频 ${bvid} 已存在`);
    }

    const bilibiliMeta = await this.fetchBilibiliMeta(bvid);
    const coverFilename = await this.fetchAndSaveCover(bvid);

    // 自动计算 order 值：取当前最大 order + 1，如果没有则设为 0
    const maxOrderResult = await this.databaseService.get<{ maxOrder: number }>(
      'SELECT MAX("order") as maxOrder FROM videos',
    );
    const newOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

    const id = crypto.randomUUID();
    await this.databaseService.run(
      `INSERT INTO videos (id, bvid, bilibili_title, custom_title, cover_url, "order", status, created_at, updated_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`,
      [
        id,
        bvid,
        bilibiliMeta.title,
        customTitle || null,
        coverFilename,
        newOrder,
        status || 'enabled',
        createdBy || '',
      ],
    );

    this.logger.log(`Video created with id: ${id}, bvid: ${bvid}, order: ${newOrder}`);

    this.clearCache();

    return this.findById(id);
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`视频不存在: ${id}`);
    }

    let bvid = existing.bvid;
    let needRefetchMeta = false;

    if (updateVideoDto.url !== undefined) {
      const extracted = this.extractBvidFromUrl(updateVideoDto.url);
      bvid = extracted.bvid;

      if (bvid !== existing.bvid) {
        const existingVideo = await this.databaseService.get<any>(
          'SELECT * FROM videos WHERE bvid = ? AND id != ?',
          [bvid, id],
        );
        if (existingVideo) {
          throw new BadRequestException(`B站视频 ${bvid} 已存在`);
        }
        needRefetchMeta = true;
      }
    }

    if (needRefetchMeta) {
      const bilibiliMeta = await this.fetchBilibiliMeta(bvid);
      existing.bilibiliTitle = bilibiliMeta.title;
      existing.coverUrl = bilibiliMeta.coverUrl;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let newCoverFilename: string | null = null;
    let oldCoverFilename: string | null = null;

    if (updateVideoDto.url !== undefined) {
      updates.push('bvid = ?');
      values.push(bvid);

      if (needRefetchMeta) {
        oldCoverFilename = existing.coverUrl ? path.basename(existing.coverUrl) : null;
        newCoverFilename = await this.fetchAndSaveCover(bvid);
        updates.push('cover_url = ?');
        values.push(newCoverFilename);
      }
    }

    if (updateVideoDto.customTitle !== undefined) {
      updates.push('custom_title = ?');
      values.push(updateVideoDto.customTitle || null);
    }

    if (updateVideoDto.order !== undefined) {
      updates.push('"order" = ?');
      values.push(updateVideoDto.order);
    }

    if (updateVideoDto.status !== undefined) {
      updates.push('status = ?');
      values.push(updateVideoDto.status);
    }

    if (updateVideoDto.isEnabled !== undefined) {
      updates.push('status = ?');
      values.push(updateVideoDto.isEnabled ? 'enabled' : 'disabled');
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await this.databaseService.run(
        `UPDATE videos SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );

      if (oldCoverFilename && newCoverFilename) {
        this.deleteCover(oldCoverFilename);
      }

      this.logger.log(`Video updated: ${id}`);
    }

    this.clearCache();

    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`视频不存在: ${id}`);
    }

    const coverFilename = existing.coverUrl ? path.basename(existing.coverUrl) : null;

    await this.databaseService.run('DELETE FROM videos WHERE id = ?', [id]);

    if (coverFilename) {
      this.deleteCover(coverFilename);
    }

    this.logger.log(`Video deleted: ${id}`);

    this.clearCache();
  }

  async sort(sortItems: SortItem[]): Promise<Video[]> {
    for (const item of sortItems) {
      await this.databaseService.run(
        'UPDATE videos SET "order" = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [item.order, item.id],
      );
    }

    this.logger.log(`Videos sorted: ${sortItems.length} items`);

    this.clearCache();

    return this.findAllAdmin();
  }

  private clearCache(): void {
    this.cacheService.del(this.CACHE_KEY_ALL);
    this.cacheService.del(`${this.CACHE_KEY_ALL}:all`);
    this.cacheService.del(this.CACHE_KEY_LIST);
  }
}
