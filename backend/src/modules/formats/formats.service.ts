import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { FormatConfig, BUILTIN_DEFAULT_FORMAT } from './format.types';
import { validateFormat } from './format-validator';

/** 赛制配置记录（数据库行的对象映射） */
export interface FormatRecord {
  id: string;
  name: string;
  config: FormatConfig;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** 生效配置解析结果 */
export interface ActiveFormat {
  source: 'builtin' | 'config';
  id: string | null;
  config: FormatConfig;
}

/** 数据库行结构 */
interface FormatRow {
  id: string;
  name: string;
  config_json: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

/** 将数据库行映射为 FormatRecord（config_json 反序列化） */
function toRecord(row: FormatRow): FormatRecord {
  return {
    id: row.id,
    name: row.name,
    config: JSON.parse(row.config_json) as FormatConfig,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 赛制配置服务
 * - 生效配置解析（激活配置优先，无激活配置时内置默认兜底）
 * - 配置 CRUD（保存前校验合法性）
 * - 激活/停用指针管理（切换后清缓存）
 */
@Injectable()
export class FormatsService {
  private readonly logger = new Logger(FormatsService.name);

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  /** 获取当前生效配置：查 format_configs 中 is_active=1 的记录，无则返回内置默认 */
  async getActiveFormat(): Promise<ActiveFormat> {
    const row = await this.databaseService.get<FormatRow>(
      'SELECT * FROM format_configs WHERE is_active = 1 LIMIT 1',
    );
    if (!row) {
      return { source: 'builtin', id: null, config: BUILTIN_DEFAULT_FORMAT };
    }
    return { source: 'config', id: row.id, config: JSON.parse(row.config_json) as FormatConfig };
  }

  /** 配置列表 */
  async listFormats(): Promise<FormatRecord[]> {
    const rows = await this.databaseService.all<FormatRow>(
      'SELECT * FROM format_configs ORDER BY created_at DESC',
    );
    return rows.map(toRecord);
  }

  /** 按主键查询配置（不存在返回 null） */
  async findById(id: string): Promise<FormatRecord | null> {
    const row = await this.databaseService.get<FormatRow>(
      'SELECT * FROM format_configs WHERE id = ?',
      [id],
    );
    return row ? toRecord(row) : null;
  }

  /** 保存新配置（不自动生成槽位；非法配置抛 BadRequest） */
  async createFormat(config: FormatConfig, name?: string): Promise<FormatRecord> {
    const errors = validateFormat(config);
    if (errors.length > 0) {
      throw new BadRequestException({ message: '赛制配置不合法', errors });
    }

    const id = uuidv4();
    const configName = name ?? config.name;
    await this.databaseService.run(
      `INSERT INTO format_configs (id, name, config_json, is_active) VALUES (?, ?, ?, 0)`,
      [id, configName, JSON.stringify(config)],
    );
    this.logger.log(`Format config created: ${id}`);

    return { id, name: configName, config, isActive: false };
  }

  /** 编辑配置（不影响已生成槽位，仅影响后续新增生成） */
  async updateFormat(id: string, config: FormatConfig): Promise<FormatRecord> {
    const errors = validateFormat(config);
    if (errors.length > 0) {
      throw new BadRequestException({ message: '赛制配置不合法', errors });
    }

    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException(`Format config with id ${id} not found`);
    }

    await this.databaseService.run(
      `UPDATE format_configs SET name = ?, config_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [config.name, JSON.stringify(config), id],
    );
    this.logger.log(`Format config updated: ${id}`);

    return { ...existing, name: config.name, config };
  }

  /** 删除配置（已激活配置拒绝删除，需先停用） */
  async deleteFormat(id: string): Promise<void> {
    const row = await this.databaseService.get<{ id: string; is_active: number }>(
      'SELECT id, is_active FROM format_configs WHERE id = ?',
      [id],
    );
    if (!row) {
      throw new NotFoundException(`Format config with id ${id} not found`);
    }
    if (row.is_active === 1) {
      throw new BadRequestException('该配置当前已激活，请先停用（切回默认配置）后再删除');
    }

    await this.databaseService.run('DELETE FROM format_configs WHERE id = ?', [id]);
    this.logger.log(`Format config deleted: ${id}`);
  }

  /** 激活配置（单配置模式：清除其他激活指针后置目标为 1，随后清缓存） */
  async activateFormat(id: string): Promise<void> {
    const row = await this.databaseService.get<{ id: string; is_active: number }>(
      'SELECT id, is_active FROM format_configs WHERE id = ?',
      [id],
    );
    if (!row) {
      throw new NotFoundException(`Format config with id ${id} not found`);
    }

    await this.databaseService.run('UPDATE format_configs SET is_active = 0');
    await this.databaseService.run(
      `UPDATE format_configs SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id],
    );
    this.logger.log(`Format config activated: ${id}`);

    this.cacheService.flush();
  }

  /** 停用全部配置（切回内置默认，随后清缓存） */
  async deactivateFormat(): Promise<void> {
    await this.databaseService.run('UPDATE format_configs SET is_active = 0');
    this.logger.log('Format configs deactivated, fallback to builtin default');

    this.cacheService.flush();
  }
}
