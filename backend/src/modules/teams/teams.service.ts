import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  position: '上单' | '打野' | '中单' | 'AD' | '辅助';
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  players: Player[];
}

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  private readonly CACHE_KEY_ALL = 'teams:all';
  private readonly CACHE_KEY_PREFIX = 'team:';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async findAll(): Promise<Team[]> {
    // 尝试从缓存获取
    const cached = this.cacheService.get<Team[]>(this.CACHE_KEY_ALL);
    if (cached) {
      return cached;
    }

    // 获取所有战队
    const teams = await this.databaseService.all<any>('SELECT * FROM teams ORDER BY created_at DESC');

    // 获取所有队员
    const players = await this.databaseService.all<any>('SELECT * FROM players');

    // 组装数据
    const result: Team[] = teams.map((team) => ({
      id: team.id,
      name: team.name,
      logo: team.logo,
      description: team.description,
      players: players
        .filter((p) => p.team_id === team.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          position: p.position,
          teamId: p.team_id,
        })),
    }));

    // 写入缓存
    this.cacheService.set(this.CACHE_KEY_ALL, result);

    return result;
  }

  async findOne(id: string): Promise<Team> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    
    // 尝试从缓存获取
    const cached = this.cacheService.get<Team>(cacheKey);
    if (cached) {
      return cached;
    }

    // 获取战队
    const team = await this.databaseService.get<any>('SELECT * FROM teams WHERE id = ?', [id]);

    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    // 获取队员
    const players = await this.databaseService.all<any>('SELECT * FROM players WHERE team_id = ?', [id]);

    const result: Team = {
      id: team.id,
      name: team.name,
      logo: team.logo,
      description: team.description,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        position: p.position,
        teamId: p.team_id,
      })),
    };

    // 写入缓存
    this.cacheService.set(cacheKey, result);

    return result;
  }

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // 插入战队
    await this.databaseService.run(
      `INSERT INTO teams (id, name, logo, description) VALUES (?, ?, ?, ?)`,
      [
        createTeamDto.id,
        createTeamDto.name,
        createTeamDto.logo || null,
        createTeamDto.description || null,
      ],
    );

    // 插入队员
    if (createTeamDto.players && createTeamDto.players.length > 0) {
      for (const player of createTeamDto.players) {
        await this.databaseService.run(
          `INSERT INTO players (id, name, avatar, position, team_id) VALUES (?, ?, ?, ?, ?)`,
          [
            player.id,
            player.name,
            player.avatar || null,
            player.position,
            createTeamDto.id,
          ],
        );
      }
    }

    this.logger.log(`Team created: ${createTeamDto.id}`);
    
    // 清除缓存
    this.cacheService.del(this.CACHE_KEY_ALL);

    return this.findOne(createTeamDto.id);
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    // 检查战队是否存在
    const existing = await this.databaseService.get<any>('SELECT id FROM teams WHERE id = ?', [id]);
    if (!existing) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    // 更新战队信息
    const updates: string[] = [];
    const values: any[] = [];

    if (updateTeamDto.name !== undefined) {
      updates.push('name = ?');
      values.push(updateTeamDto.name);
    }
    if (updateTeamDto.logo !== undefined) {
      updates.push('logo = ?');
      values.push(updateTeamDto.logo);
    }
    if (updateTeamDto.description !== undefined) {
      updates.push('description = ?');
      values.push(updateTeamDto.description);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      await this.databaseService.run(
        `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );
    }

    // 更新队员（如果提供了队员列表）
    if (updateTeamDto.players !== undefined) {
      // 删除现有队员
      await this.databaseService.run('DELETE FROM players WHERE team_id = ?', [id]);

      // 插入新队员
      if (updateTeamDto.players.length > 0) {
        for (const player of updateTeamDto.players) {
          await this.databaseService.run(
            `INSERT INTO players (id, name, avatar, position, team_id) VALUES (?, ?, ?, ?, ?)`,
            [
              player.id || `${id}_${player.position}`,
              player.name,
              player.avatar || null,
              player.position,
              id,
            ],
          );
        }
      }
    }

    this.logger.log(`Team updated: ${id}`);
    
    // 清除缓存
    this.cacheService.del(this.CACHE_KEY_ALL);
    this.cacheService.del(`${this.CACHE_KEY_PREFIX}${id}`);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    // 检查战队是否存在
    const existing = await this.databaseService.get<any>('SELECT id FROM teams WHERE id = ?', [id]);
    if (!existing) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }

    // 删除战队（级联删除队员）
    await this.databaseService.run('DELETE FROM teams WHERE id = ?', [id]);

    this.logger.log(`Team deleted: ${id}`);
    
    // 清除缓存
    this.cacheService.del(this.CACHE_KEY_ALL);
    this.cacheService.del(`${this.CACHE_KEY_PREFIX}${id}`);
  }
}
