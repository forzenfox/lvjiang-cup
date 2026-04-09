import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Team } from '../teams/teams.service';

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
  swissDay?: number;
  boFormat?: 'BO1' | 'BO3' | 'BO5';
  eliminationBracket?: 'quarterfinals' | 'semifinals' | 'finals';
  eliminationGameNumber?: number;
}

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);
  private readonly CACHE_KEY_ALL = 'matches:all';
  private readonly CACHE_KEY_PREFIX = 'match:';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async findAll(stage?: string): Promise<Match[]> {
    const cacheKey = stage ? `${this.CACHE_KEY_ALL}:${stage}` : this.CACHE_KEY_ALL;

    // 尝试从缓存获取
    const cached = this.cacheService.get<Match[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 构建查询
    let query = 'SELECT * FROM matches';
    const params: any[] = [];

    if (stage) {
      query += ' WHERE stage = ?';
      params.push(stage);
    }

    query += ' ORDER BY created_at ASC';

    const matches = await this.databaseService.all<any>(query, params);

    // 获取所有战队信息用于关联
    const teams = await this.databaseService.all<any>('SELECT id, name, logo FROM teams');
    const teamsMap = new Map(teams.map((t) => [t.id, t]));

    const result: Match[] = matches.map((match) => ({
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
      swissDay: match.swiss_day,
      eliminationBracket: match.elimination_bracket,
      eliminationGameNumber: match.elimination_game_number,
    }));

    // 写入缓存
    this.cacheService.set(cacheKey, result);

    return result;
  }

  async findOne(id: string): Promise<Match> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;

    // 尝试从缓存获取
    const cached = this.cacheService.get<Match>(cacheKey);
    if (cached) {
      return cached;
    }

    // 获取比赛
    const match = await this.databaseService.get<any>('SELECT * FROM matches WHERE id = ?', [id]);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} not found`);
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

    const result: Match = {
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
      swissDay: match.swiss_day,
      eliminationBracket: match.elimination_bracket,
      eliminationGameNumber: match.elimination_game_number,
    };

    // 写入缓存
    this.cacheService.set(cacheKey, result);

    return result;
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
    if (updateMatchDto.winnerId !== undefined) {
      updates.push('winner_id = ?');
      values.push(updateMatchDto.winnerId);
    }
    if (updateMatchDto.status !== undefined) {
      updates.push('status = ?');
      values.push(updateMatchDto.status);
    }
    if (updateMatchDto.startTime !== undefined) {
      updates.push('start_time = ?');
      values.push(updateMatchDto.startTime);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await this.databaseService.run(
        `UPDATE matches SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );
    }

    this.logger.log(`Match updated: ${id}`);

    // 清除缓存
    this.cacheService.del(this.CACHE_KEY_ALL);
    this.cacheService.del(`${this.CACHE_KEY_PREFIX}${id}`);

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

    this.logger.log(`Match scores cleared: ${id}`);

    // 清除缓存
    this.cacheService.del(this.CACHE_KEY_ALL);
    this.cacheService.del(`${this.CACHE_KEY_PREFIX}${id}`);

    return this.findOne(id);
  }

  // 初始化比赛槽位
  async initSlots(): Promise<void> {
    const result = await this.databaseService.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM matches',
    );

    if (result.count > 0) {
      this.logger.log('Match slots already initialized');
      return;
    }

    // 瑞士轮槽位（32场）- 16队4轮赛制
    const swissSlots = [
      // 第一轮：0-0，8场 BO1
      { id: 'swiss-r1-1', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      { id: 'swiss-r1-2', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      { id: 'swiss-r1-3', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      { id: 'swiss-r1-4', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      { id: 'swiss-r1-5', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      { id: 'swiss-r1-6', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      { id: 'swiss-r1-7', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      { id: 'swiss-r1-8', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
      // 第二轮：1-0，4场 BO3
      { id: 'swiss-r2-h1', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      { id: 'swiss-r2-h2', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      { id: 'swiss-r2-h3', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      { id: 'swiss-r2-h4', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      // 第二轮：0-1，4场 BO3
      { id: 'swiss-r2-l1', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      { id: 'swiss-r2-l2', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      { id: 'swiss-r2-l3', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      { id: 'swiss-r2-l4', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
      // 第三轮：2-0，2场 BO3
      { id: 'swiss-r3-h1', round: 'Round 3 High', stage: 'swiss', swissRecord: '2-0', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      { id: 'swiss-r3-h2', round: 'Round 3 High', stage: 'swiss', swissRecord: '2-0', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      // 第三轮：1-1，4场 BO3
      { id: 'swiss-r3-m1', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      { id: 'swiss-r3-m2', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      { id: 'swiss-r3-m3', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      { id: 'swiss-r3-m4', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      // 第三轮：0-2，2场 BO3
      { id: 'swiss-r3-l1', round: 'Round 3 Low', stage: 'swiss', swissRecord: '0-2', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      { id: 'swiss-r3-l2', round: 'Round 3 Low', stage: 'swiss', swissRecord: '0-2', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
      // 第四轮：3-0，1场 BO3
      { id: 'swiss-r4-h1', round: 'Round 4 High', stage: 'swiss', swissRecord: '3-0', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
      // 第四轮：2-1，3场 BO3
      { id: 'swiss-r4-mh1', round: 'Round 4 Mid-High', stage: 'swiss', swissRecord: '2-1', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
      { id: 'swiss-r4-mh2', round: 'Round 4 Mid-High', stage: 'swiss', swissRecord: '2-1', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
      { id: 'swiss-r4-mh3', round: 'Round 4 Mid-High', stage: 'swiss', swissRecord: '2-1', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
      // 第四轮：1-2，3场 BO3
      { id: 'swiss-r4-ml1', round: 'Round 4 Mid-Low', stage: 'swiss', swissRecord: '1-2', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
      { id: 'swiss-r4-ml2', round: 'Round 4 Mid-Low', stage: 'swiss', swissRecord: '1-2', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
      { id: 'swiss-r4-ml3', round: 'Round 4 Mid-Low', stage: 'swiss', swissRecord: '1-2', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
      // 第四轮：0-3，1场 BO3
      { id: 'swiss-r4-l1', round: 'Round 4 Low', stage: 'swiss', swissRecord: '0-3', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    ];

    // 淘汰赛槽位（7场）- 8队单败赛制
    const eliminationSlots = [
      // 四分之一决赛（4场）
      { id: 'elim-qf-1', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 1, boFormat: 'BO5' },
      { id: 'elim-qf-2', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 2, boFormat: 'BO5' },
      { id: 'elim-qf-3', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 3, boFormat: 'BO5' },
      { id: 'elim-qf-4', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 4, boFormat: 'BO5' },
      // 半决赛（2场）
      { id: 'elim-sf-1', round: '半决赛', stage: 'elimination', eliminationBracket: 'semifinals', eliminationGameNumber: 5, boFormat: 'BO5' },
      { id: 'elim-sf-2', round: '半决赛', stage: 'elimination', eliminationBracket: 'semifinals', eliminationGameNumber: 6, boFormat: 'BO5' },
      // 决赛（1场）
      { id: 'elim-f-1', round: '决赛', stage: 'elimination', eliminationBracket: 'finals', eliminationGameNumber: 7, boFormat: 'BO5' },
    ];

    // 插入瑞士轮槽位
    for (const slot of swissSlots) {
      await this.databaseService.run(
        `INSERT INTO matches (id, round, stage, status, swiss_record, swiss_day, swiss_round, bo_format, elimination_bracket, elimination_game_number) VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?, ?)`,
        [
          slot.id,
          slot.round,
          slot.stage,
          slot.swissRecord,
          slot.swissDay,
          slot.swissRound,
          slot.boFormat,
          null,
          null,
        ],
      );
    }

    // 插入淘汰赛槽位
    for (const slot of eliminationSlots) {
      await this.databaseService.run(
        `INSERT INTO matches (id, round, stage, status, swiss_record, swiss_day, swiss_round, bo_format, elimination_bracket, elimination_game_number) VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?, ?)`,
        [
          slot.id,
          slot.round,
          slot.stage,
          null,
          null,
          null,
          slot.boFormat,
          slot.eliminationBracket,
          slot.eliminationGameNumber,
        ],
      );
    }

    this.logger.log(`Initialized ${swissSlots.length + eliminationSlots.length} match slots`);

    // 清除缓存
    this.cacheService.del(this.CACHE_KEY_ALL);
  }
}
