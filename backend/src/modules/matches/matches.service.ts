import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { BaseCachedService } from '../../common/services/base-cached.service';
import { UpdateMatchDto, MatchStatus } from './dto/update-match.dto';
import { Team } from '../teams/teams.service';
import { FormatsService } from '../formats/formats.service';
import { FormatConfig } from '../formats/format.types';
import { generateAllSlots } from '../formats/generators/generator.registry';

export interface Match {
  id: string;
  teamAId?: string;
  teamBId?: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  round: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  startTime?: string;
  stage: 'swiss' | 'elimination';
  swissRecord?: string;
  swissRound?: number;
  boFormat?: 'BO1' | 'BO3' | 'BO5';
  eliminationBracket?: 'quarterfinals' | 'semifinals' | 'finals';
  eliminationGameNumber?: number;
  /** 归属赛制配置 id（NULL=内置默认配置） */
  formatId?: string | null;
}

/** generateSlots 返回的统计结果 */
export interface GenerateSlotsResult {
  created: number;
  skipped: number;
  total: number;
}

@Injectable()
export class MatchesService extends BaseCachedService<Match, string> {
  private readonly matchLogger = new Logger(MatchesService.name);

  constructor(
    databaseService: DatabaseService,
    cacheService: CacheService,
    private readonly formatsService: FormatsService,
  ) {
    super(databaseService, cacheService, 'MatchesService');
  }

  protected getCachePrefix(): string {
    return 'matches';
  }

  protected async findAllFromDb(): Promise<Match[]> {
    const matches = await this.databaseService.all<any>(
      'SELECT * FROM matches ORDER BY created_at ASC',
    );

    // 获取所有战队信息用于关联
    const teams = await this.databaseService.all<any>('SELECT id, name, logo FROM teams');
    const teamsMap = new Map(teams.map((t) => [t.id, t]));

    return matches.map((match) => ({
      id: match.id,
      teamAId: match.team_a_id,
      teamBId: match.team_b_id,
      teamA: match.team_a_id ? teamsMap.get(match.team_a_id) : undefined,
      teamB: match.team_b_id ? teamsMap.get(match.team_b_id) : undefined,
      scoreA: match.score_a,
      scoreB: match.score_b,
      winnerId: match.winner_id,
      round: match.round,
      status: match.status,
      startTime: match.start_time,
      stage: match.stage,
      swissRecord: match.swiss_record,
      swissRound: match.swiss_round,
      boFormat: match.bo_format,
      eliminationBracket: match.elimination_bracket,
      eliminationGameNumber: match.elimination_game_number,
      formatId: match.format_id,
    }));
  }

  protected async findOneFromDb(id: string): Promise<Match | undefined> {
    const match = await this.databaseService.get<any>('SELECT * FROM matches WHERE id = ?', [id]);

    if (!match) {
      return undefined;
    }

    // 获取战队信息
    let teamA, teamB;
    if (match.team_a_id) {
      teamA = await this.databaseService.get<any>('SELECT id, name, logo FROM teams WHERE id = ?', [
        match.team_a_id,
      ]);
    }
    if (match.team_b_id) {
      teamB = await this.databaseService.get<any>('SELECT id, name, logo FROM teams WHERE id = ?', [
        match.team_b_id,
      ]);
    }

    return {
      id: match.id,
      teamAId: match.team_a_id,
      teamBId: match.team_b_id,
      teamA,
      teamB,
      scoreA: match.score_a,
      scoreB: match.score_b,
      winnerId: match.winner_id,
      round: match.round,
      status: match.status,
      startTime: match.start_time,
      stage: match.stage,
      swissRecord: match.swiss_record,
      swissRound: match.swiss_round,
      boFormat: match.bo_format,
      eliminationBracket: match.elimination_bracket,
      eliminationGameNumber: match.elimination_game_number,
      formatId: match.format_id,
    };
  }

  /**
   * 查询比赛列表（可按 stage 与 formatId 过滤）
   * formatId 省略时按生效配置解析查询 scope：
   * - 无激活配置（builtin）→ 过滤 format_id IS NULL（内置默认配置槽位）
   * - 存在激活配置 → 过滤 format_id = 激活配置 id
   * 显式传 formatId 时直接按该 id 过滤
   */
  async findAll(stage?: string, formatId?: string): Promise<Match[]> {
    // 解析查询 scope
    let scope: string | null;
    if (formatId !== undefined && formatId !== null && formatId !== '') {
      scope = formatId;
    } else {
      const active = await this.formatsService.getActiveFormat();
      scope = active.source === 'config' ? active.id : null;
    }

    // 缓存变体键含 scope（builtin 沿用原键 matches:all 保持兼容）
    const scopeKey =
      scope === null ? this.getAllCacheKey() : `${this.getAllCacheKey()}:fmt:${scope}`;

    if (stage) {
      // stage 过滤叠加 scope 缓存变体
      const cacheKey = `${scopeKey}:${stage}`;
      const cached = this.cacheService.get<Match[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const allMatches = await this.getOrSetAllForScope(scope, scopeKey);
      const filtered = allMatches.filter((match) => match.stage === stage);
      this.cacheService.set(cacheKey, filtered);
      return filtered;
    }

    return this.getOrSetAllForScope(scope, scopeKey);
  }

  /** 按 scope 获取（或设置）缓存的全量比赛：内存过滤 format_id 归属 */
  private async getOrSetAllForScope(scope: string | null, scopeKey: string): Promise<Match[]> {
    const cached = this.cacheService.get<Match[]>(scopeKey);
    if (cached) {
      return cached;
    }

    const data = await this.findAllFromDb();
    // formatId 为 null 或 undefined（旧行无该列值）均归属内置默认配置
    const filtered = data.filter((match) =>
      scope === null
        ? match.formatId === null || match.formatId === undefined
        : match.formatId === scope,
    );
    this.cacheService.set(scopeKey, filtered);
    return filtered;
  }

  async findOne(id: string): Promise<Match> {
    try {
      return await this.getOrSetOne(id);
    } catch (error) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    // 检查比赛是否存在
    const existing = await this.databaseService.get<any>('SELECT id FROM matches WHERE id = ?', [
      id,
    ]);
    if (!existing) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }

    // 构建更新语句
    const updates: string[] = [];
    const values: any[] = [];

    if (updateMatchDto.teamAId !== undefined) {
      updates.push('team_a_id = ?');
      values.push(updateMatchDto.teamAId);
    }
    if (updateMatchDto.teamBId !== undefined) {
      updates.push('team_b_id = ?');
      values.push(updateMatchDto.teamBId);
    }
    if (updateMatchDto.scoreA !== undefined) {
      updates.push('score_a = ?');
      values.push(updateMatchDto.scoreA);
    }
    if (updateMatchDto.scoreB !== undefined) {
      updates.push('score_b = ?');
      values.push(updateMatchDto.scoreB);
    }

    // 获取当前比赛状态（用于判断是否需要自动修正 winner_id）
    const currentMatch = await this.databaseService.get<any>(
      'SELECT status FROM matches WHERE id = ?',
      [id],
    );
    const isFinished =
      updateMatchDto.status === MatchStatus.FINISHED ||
      (!updateMatchDto.status && currentMatch?.status === 'finished');

    if (updateMatchDto.winnerId !== undefined) {
      updates.push('winner_id = ?');
      values.push(updateMatchDto.winnerId);
    } else if (
      isFinished &&
      (updateMatchDto.scoreA !== undefined || updateMatchDto.scoreB !== undefined)
    ) {
      // 已结束状态且修改了比分，但没有显式传递 winnerId：
      // 需要查询当前比分，自动计算 winner_id
      const matchScores = await this.databaseService.get<any>(
        'SELECT score_a, score_b, team_a_id, team_b_id FROM matches WHERE id = ?',
        [id],
      );
      const finalScoreA =
        updateMatchDto.scoreA !== undefined ? updateMatchDto.scoreA : (matchScores?.score_a ?? 0);
      const finalScoreB =
        updateMatchDto.scoreB !== undefined ? updateMatchDto.scoreB : (matchScores?.score_b ?? 0);
      const teamAId =
        updateMatchDto.teamAId !== undefined ? updateMatchDto.teamAId : matchScores?.team_a_id;
      const teamBId =
        updateMatchDto.teamBId !== undefined ? updateMatchDto.teamBId : matchScores?.team_b_id;

      if (finalScoreA > finalScoreB && teamAId) {
        updates.push('winner_id = ?');
        values.push(teamAId);
      } else if (finalScoreB > finalScoreA && teamBId) {
        updates.push('winner_id = ?');
        values.push(teamBId);
      } else if (finalScoreA === finalScoreB) {
        updates.push('winner_id = NULL');
      }
    }

    if (updateMatchDto.status !== undefined) {
      updates.push('status = ?');
      values.push(updateMatchDto.status);

      // 防御性：如果状态不是 'finished'，自动清空 winner_id
      if (updateMatchDto.status !== MatchStatus.FINISHED) {
        updates.push('winner_id = NULL');
      }
    }
    if (updateMatchDto.startTime !== undefined) {
      updates.push('start_time = ?');
      values.push(updateMatchDto.startTime);
    }
    if (updateMatchDto.swissRound !== undefined) {
      updates.push('swiss_round = ?');
      values.push(updateMatchDto.swissRound);
    }
    if (updateMatchDto.boFormat !== undefined) {
      updates.push('bo_format = ?');
      values.push(updateMatchDto.boFormat);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await this.databaseService.run(
        `UPDATE matches SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );
    }

    this.matchLogger.log(`Match updated: ${id}`);

    // 清除缓存
    this.clearRelatedCache(id);

    return this.findOne(id);
  }

  async clearScores(id: string): Promise<Match> {
    // 检查比赛是否存在
    const existing = await this.databaseService.get<any>('SELECT id FROM matches WHERE id = ?', [
      id,
    ]);
    if (!existing) {
      throw new NotFoundException(`Match with id ${id} not found`);
    }

    // 清空比分
    await this.databaseService.run(
      `UPDATE matches SET score_a = 0, score_b = 0, winner_id = NULL, status = 'upcoming', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id],
    );

    this.matchLogger.log(`Match scores cleared: ${id}`);

    // 清除缓存
    this.clearRelatedCache(id);

    return this.findOne(id);
  }

  /**
   * 按赛制配置生成比赛槽位（替代原硬编码 initSlots）
   *
   * 幂等策略（自然键缺口补齐）：
   * - 瑞士轮按 (swiss_round, swiss_record) 统计 scope 内现有数量，与推导期望比对只补差额
   * - 淘汰赛按 elimination_game_number 比对补差额
   * - 已存在行绝不 UPDATE/DELETE（保护赛果）
   *
   * 新增槽位 id 规则：
   * - builtin scope（format_id=NULL）：生成器默认 id（swiss-r{轮}-{序号} / elim-r{级}-{序号}）
   * - 显式配置 scope：id 加前缀 `{formatId}::{生成器id}`，保证不同配置互不冲突
   */
  async generateSlots(formatId?: string): Promise<GenerateSlotsResult> {
    // 解析生成 scope 与配置
    let scope: string | null;
    let config: FormatConfig;
    if (formatId !== undefined && formatId !== null && formatId !== '') {
      const record = await this.formatsService.findById(formatId);
      if (!record) {
        throw new NotFoundException(`Format config with id ${formatId} not found`);
      }
      scope = formatId;
      config = record.config;
    } else {
      const active = await this.formatsService.getActiveFormat();
      scope = active.source === 'config' ? active.id : null;
      config = active.config;
    }

    // 推导期望槽位清单
    const slots = generateAllSlots(config);
    const total = slots.length;

    // 查询 scope 内现有槽位（自然键 + id），用于缺口比对
    const existingRows = await this.databaseService.all<any>(
      scope === null
        ? 'SELECT id, stage, swiss_round, swiss_record, elimination_game_number FROM matches WHERE format_id IS NULL'
        : 'SELECT id, stage, swiss_round, swiss_record, elimination_game_number FROM matches WHERE format_id = ?',
      scope === null ? [] : [scope],
    );

    // 自然键 → 现有数量（瑞士轮按轮次+战绩组；淘汰赛按连续场次编号）
    const existingCount = new Map<string, number>();
    const existingIds = new Set<string>();
    for (const row of existingRows) {
      existingIds.add(row.id);
      const key =
        row.stage === 'swiss'
          ? `swiss:${row.swiss_round}:${row.swiss_record}`
          : `elim:${row.elimination_game_number}`;
      existingCount.set(key, (existingCount.get(key) || 0) + 1);
    }

    let created = 0;
    let skipped = 0;
    const seenCount = new Map<string, number>();

    for (const slot of slots) {
      const key =
        slot.stage === 'swiss'
          ? `swiss:${slot.swissRound}:${slot.swissRecord}`
          : `elim:${slot.eliminationGameNumber}`;
      const seen = (seenCount.get(key) || 0) + 1;
      seenCount.set(key, seen);

      // 该自然键的"前 existingCount 个"槽位视为已存在 → 跳过（不触碰）
      if (seen <= (existingCount.get(key) || 0)) {
        skipped += 1;
        continue;
      }

      // 新增槽位 id：builtin 用生成器默认 id；显式配置加前缀
      const slotId = scope === null ? slot.id : `${scope}::${slot.id}`;
      // id 已被占用 → 跳过（绝不覆盖）
      if (existingIds.has(slotId)) {
        skipped += 1;
        continue;
      }

      await this.databaseService.run(
        `INSERT INTO matches (id, round, stage, status, format_id, swiss_record, swiss_round, bo_format, elimination_bracket, elimination_game_number) VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?, ?)`,
        [
          slotId,
          slot.round,
          slot.stage,
          scope,
          slot.swissRecord ?? null,
          slot.swissRound ?? null,
          slot.boFormat,
          slot.eliminationBracket ?? null,
          slot.eliminationGameNumber ?? null,
        ],
      );
      existingIds.add(slotId);
      created += 1;
    }

    this.matchLogger.log(
      `Generated match slots: created=${created}, skipped=${skipped}, total=${total} (scope=${scope ?? 'builtin'})`,
    );

    // 生成后清缓存（含 scope 变体键）
    this.cacheService.flush();

    return { created, skipped, total };
  }
}
