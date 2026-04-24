import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { BaseCachedService } from '../../common/services/base-cached.service';
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
  boFormat?: 'BO1' | 'BO3' | 'BO5';
  eliminationBracket?: 'quarterfinals' | 'semifinals' | 'finals';
  eliminationGameNumber?: number;
}

@Injectable()
export class MatchesService extends BaseCachedService<Match, string> {
  private readonly matchLogger = new Logger(MatchesService.name);

  constructor(databaseService: DatabaseService, cacheService: CacheService) {
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
    };
  }

  async findAll(stage?: string): Promise<Match[]> {
    if (stage) {
      // 如果有 stage 参数，需要特殊处理缓存键
      const cacheKey = `${this.getAllCacheKey()}:${stage}`;
      const cached = this.cacheService.get<Match[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const allMatches = await this.getOrSetAll();
      const filtered = allMatches.filter((match) => match.stage === stage);
      this.cacheService.set(cacheKey, filtered);
      return filtered;
    }

    return this.getOrSetAll();
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

  // 初始化比赛槽位
  async initSlots(): Promise<void> {
    const result = await this.databaseService.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM matches',
    );

    if (result.count > 0) {
      this.matchLogger.log('Match slots already initialized');
      return;
    }

    // 瑞士轮槽位（36场）- 16队5轮赛制，参照LOL S赛规则
    const swissSlots = [
      // 第一轮：0-0，8场 BO1
      {
        id: 'swiss-r1-1',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r1-2',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r1-3',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r1-4',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r1-5',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r1-6',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r1-7',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r1-8',
        round: 'Round 1',
        stage: 'swiss',
        swissRecord: '0-0',
        swissRound: 1,
        boFormat: 'BO1',
      },
      // 第二轮：1-0，4场 BO1（胜者组）
      {
        id: 'swiss-r2-h1',
        round: 'Round 2 High',
        stage: 'swiss',
        swissRecord: '1-0',
        swissRound: 2,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r2-h2',
        round: 'Round 2 High',
        stage: 'swiss',
        swissRecord: '1-0',
        swissRound: 2,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r2-h3',
        round: 'Round 2 High',
        stage: 'swiss',
        swissRecord: '1-0',
        swissRound: 2,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r2-h4',
        round: 'Round 2 High',
        stage: 'swiss',
        swissRecord: '1-0',
        swissRound: 2,
        boFormat: 'BO1',
      },
      // 第二轮：0-1，4场 BO1（败者组）
      {
        id: 'swiss-r2-l1',
        round: 'Round 2 Low',
        stage: 'swiss',
        swissRecord: '0-1',
        swissRound: 2,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r2-l2',
        round: 'Round 2 Low',
        stage: 'swiss',
        swissRecord: '0-1',
        swissRound: 2,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r2-l3',
        round: 'Round 2 Low',
        stage: 'swiss',
        swissRecord: '0-1',
        swissRound: 2,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r2-l4',
        round: 'Round 2 Low',
        stage: 'swiss',
        swissRecord: '0-1',
        swissRound: 2,
        boFormat: 'BO1',
      },
      // 第三轮：2-0，2场 BO3
      {
        id: 'swiss-r3-h1',
        round: 'Round 3 High',
        stage: 'swiss',
        swissRecord: '2-0',
        swissRound: 3,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r3-h2',
        round: 'Round 3 High',
        stage: 'swiss',
        swissRecord: '2-0',
        swissRound: 3,
        boFormat: 'BO3',
      },
      // 第三轮：1-1，4场 BO1（混合组）
      {
        id: 'swiss-r3-m1',
        round: 'Round 3 Mid',
        stage: 'swiss',
        swissRecord: '1-1',
        swissRound: 3,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r3-m2',
        round: 'Round 3 Mid',
        stage: 'swiss',
        swissRecord: '1-1',
        swissRound: 3,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r3-m3',
        round: 'Round 3 Mid',
        stage: 'swiss',
        swissRecord: '1-1',
        swissRound: 3,
        boFormat: 'BO1',
      },
      {
        id: 'swiss-r3-m4',
        round: 'Round 3 Mid',
        stage: 'swiss',
        swissRecord: '1-1',
        swissRound: 3,
        boFormat: 'BO1',
      },
      // 第三轮：0-2，2场 BO3
      {
        id: 'swiss-r3-l1',
        round: 'Round 3 Low',
        stage: 'swiss',
        swissRecord: '0-2',
        swissRound: 3,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r3-l2',
        round: 'Round 3 Low',
        stage: 'swiss',
        swissRecord: '0-2',
        swissRound: 3,
        boFormat: 'BO3',
      },
      // 第四轮：2-1，3场 BO3
      {
        id: 'swiss-r4-mh1',
        round: 'Round 4 Mid-High',
        stage: 'swiss',
        swissRecord: '2-1',
        swissRound: 4,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r4-mh2',
        round: 'Round 4 Mid-High',
        stage: 'swiss',
        swissRecord: '2-1',
        swissRound: 4,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r4-mh3',
        round: 'Round 4 Mid-High',
        stage: 'swiss',
        swissRecord: '2-1',
        swissRound: 4,
        boFormat: 'BO3',
      },
      // 第四轮：1-2，3场 BO3
      {
        id: 'swiss-r4-ml1',
        round: 'Round 4 Mid-Low',
        stage: 'swiss',
        swissRecord: '1-2',
        swissRound: 4,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r4-ml2',
        round: 'Round 4 Mid-Low',
        stage: 'swiss',
        swissRecord: '1-2',
        swissRound: 4,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r4-ml3',
        round: 'Round 4 Mid-Low',
        stage: 'swiss',
        swissRecord: '1-2',
        swissRound: 4,
        boFormat: 'BO3',
      },
      // 第五轮：2-2，3场 BO3（决出最后晋级名额）
      {
        id: 'swiss-r5-1',
        round: 'Round 5',
        stage: 'swiss',
        swissRecord: '2-2',
        swissRound: 5,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r5-2',
        round: 'Round 5',
        stage: 'swiss',
        swissRecord: '2-2',
        swissRound: 5,
        boFormat: 'BO3',
      },
      {
        id: 'swiss-r5-3',
        round: 'Round 5',
        stage: 'swiss',
        swissRecord: '2-2',
        swissRound: 5,
        boFormat: 'BO3',
      },
    ];

    // 淘汰赛槽位（7场）- 8队单败赛制
    const eliminationSlots = [
      // 四分之一决赛（4场）
      {
        id: 'elim-qf-1',
        round: '四分之一决赛',
        stage: 'elimination',
        eliminationBracket: 'quarterfinals',
        eliminationGameNumber: 1,
        boFormat: 'BO5',
      },
      {
        id: 'elim-qf-2',
        round: '四分之一决赛',
        stage: 'elimination',
        eliminationBracket: 'quarterfinals',
        eliminationGameNumber: 2,
        boFormat: 'BO5',
      },
      {
        id: 'elim-qf-3',
        round: '四分之一决赛',
        stage: 'elimination',
        eliminationBracket: 'quarterfinals',
        eliminationGameNumber: 3,
        boFormat: 'BO5',
      },
      {
        id: 'elim-qf-4',
        round: '四分之一决赛',
        stage: 'elimination',
        eliminationBracket: 'quarterfinals',
        eliminationGameNumber: 4,
        boFormat: 'BO5',
      },
      // 半决赛（2场）
      {
        id: 'elim-sf-1',
        round: '半决赛',
        stage: 'elimination',
        eliminationBracket: 'semifinals',
        eliminationGameNumber: 5,
        boFormat: 'BO5',
      },
      {
        id: 'elim-sf-2',
        round: '半决赛',
        stage: 'elimination',
        eliminationBracket: 'semifinals',
        eliminationGameNumber: 6,
        boFormat: 'BO5',
      },
      // 决赛（1场）
      {
        id: 'elim-f-1',
        round: '决赛',
        stage: 'elimination',
        eliminationBracket: 'finals',
        eliminationGameNumber: 7,
        boFormat: 'BO5',
      },
    ];

    // 插入瑞士轮槽位
    for (const slot of swissSlots) {
      await this.databaseService.run(
        `INSERT INTO matches (id, round, stage, status, swiss_record, swiss_round, bo_format, elimination_bracket, elimination_game_number) VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?)`,
        [
          slot.id,
          slot.round,
          slot.stage,
          slot.swissRecord,
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
        `INSERT INTO matches (id, round, stage, status, swiss_record, swiss_round, bo_format, elimination_bracket, elimination_game_number) VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?)`,
        [
          slot.id,
          slot.round,
          slot.stage,
          null,
          null,
          slot.boFormat,
          slot.eliminationBracket,
          slot.eliminationGameNumber,
        ],
      );
    }

    this.matchLogger.log(`Initialized ${swissSlots.length + eliminationSlots.length} match slots`);

    // 清除缓存
    this.clearAllCache();
  }
}
