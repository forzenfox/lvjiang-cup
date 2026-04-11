import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { UpdateAdvancementDto } from './dto/update-advancement.dto';

export interface Advancement {
  top8: string[];
  eliminated: string[];
  winners2_0: string[];
  winners2_1: string[];
  losersBracket: string[];
  eliminated3rd: string[];
  eliminated0_3: string[];
  rankings?: { teamId: string; record: string; rank: number }[];
}

export interface Match {
  id: string;
  teamAId?: string;
  teamBId?: string;
  winnerId?: string;
  stage: 'swiss' | 'elimination';
  status: 'upcoming' | 'ongoing' | 'finished';
}

@Injectable()
export class AdvancementService {
  private readonly logger = new Logger(AdvancementService.name);
  private readonly CACHE_KEY = 'advancement:info';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async findOne(): Promise<Advancement> {
    // 尝试从缓存获取
    const cached = this.cacheService.get<Advancement>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    const result = await this.databaseService.get<any>('SELECT * FROM advancement WHERE id = 1');

    const advancement: Advancement = {
      top8: JSON.parse(result?.top8 || '[]'),
      eliminated: JSON.parse(result?.eliminated || '[]'),
      winners2_0: JSON.parse(result?.winners2_0 || '[]'),
      winners2_1: JSON.parse(result?.winners2_1 || '[]'),
      losersBracket: JSON.parse(result?.losers_bracket || '[]'),
      eliminated3rd: JSON.parse(result?.eliminated_3rd || '[]'),
      eliminated0_3: JSON.parse(result?.eliminated_0_3 || '[]'),
    };

    // 写入缓存
    this.cacheService.set(this.CACHE_KEY, advancement);

    return advancement;
  }

  async calculateFromMatches(matches: Match[]): Promise<Advancement> {
    const teamRecords = new Map<string, { wins: number; losses: number }>();
    matches
      .filter((m) => m.stage === 'swiss' && m.status === 'finished')
      .forEach((match) => {
        if (match.winnerId) {
          const winnerRecord = teamRecords.get(match.winnerId) || { wins: 0, losses: 0 };
          winnerRecord.wins++;
          teamRecords.set(match.winnerId, winnerRecord);
          const loserId = match.teamAId === match.winnerId ? match.teamBId : match.teamAId;
          const loserRecord = teamRecords.get(loserId) || { wins: 0, losses: 0 };
          loserRecord.losses++;
          teamRecords.set(loserId, loserRecord);
        }
      });
    const sortedTeams = [...teamRecords.entries()]
      .map(([teamId, record]) => ({ teamId, record: `${record.wins}-${record.losses}` }))
      .sort((a, b) => {
        const [aWins, aLosses] = a.record.split('-').map(Number);
        const [bWins, bLosses] = b.record.split('-').map(Number);
        if (aWins !== bWins) return bWins - aWins;
        return bLosses - aLosses;
      });
    return {
      top8: sortedTeams.slice(0, 8).map((t) => t.teamId),
      eliminated: sortedTeams.slice(8).map((t) => t.teamId),
      winners2_0: [],
      winners2_1: [],
      losersBracket: [],
      eliminated3rd: [],
      eliminated0_3: [],
      rankings: sortedTeams.map((t, index) => ({ ...t, rank: index + 1 })),
    };
  }

  async update(updateAdvancementDto: UpdateAdvancementDto): Promise<Advancement> {
    const updates: string[] = [];
    const values: any[] = [];

    if (updateAdvancementDto.top8 !== undefined) {
      updates.push('top8 = ?');
      values.push(JSON.stringify(updateAdvancementDto.top8));
    }
    if (updateAdvancementDto.eliminated !== undefined) {
      updates.push('eliminated = ?');
      values.push(JSON.stringify(updateAdvancementDto.eliminated));
    }
    if (updateAdvancementDto.winners2_0 !== undefined) {
      updates.push('winners2_0 = ?');
      values.push(JSON.stringify(updateAdvancementDto.winners2_0));
    }
    if (updateAdvancementDto.winners2_1 !== undefined) {
      updates.push('winners2_1 = ?');
      values.push(JSON.stringify(updateAdvancementDto.winners2_1));
    }
    if (updateAdvancementDto.losersBracket !== undefined) {
      updates.push('losers_bracket = ?');
      values.push(JSON.stringify(updateAdvancementDto.losersBracket));
    }
    if (updateAdvancementDto.eliminated3rd !== undefined) {
      updates.push('eliminated_3rd = ?');
      values.push(JSON.stringify(updateAdvancementDto.eliminated3rd));
    }
    if (updateAdvancementDto.eliminated0_3 !== undefined) {
      updates.push('eliminated_0_3 = ?');
      values.push(JSON.stringify(updateAdvancementDto.eliminated0_3));
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(1);

      await this.databaseService.run(
        `UPDATE advancement SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );
    }

    this.logger.log('Advancement info updated');

    this.cacheService.del(this.CACHE_KEY);

    return this.findOne();
  }
}
