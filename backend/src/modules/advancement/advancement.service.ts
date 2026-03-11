import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { UpdateAdvancementDto } from './dto/update-advancement.dto';

export interface Advancement {
  winners2_0: string[];
  winners2_1: string[];
  losersBracket: string[];
  eliminated3rd: string[];
  eliminated0_3: string[];
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

  async update(updateAdvancementDto: UpdateAdvancementDto): Promise<Advancement> {
    const updates: string[] = [];
    const values: any[] = [];

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
      values.push(1); // id = 1
      
      await this.databaseService.run(
        `UPDATE advancement SET ${updates.join(', ')} WHERE id = ?`,
        values,
      );
    }

    this.logger.log('Advancement info updated');
    
    // 清除缓存
    this.cacheService.del(this.CACHE_KEY);

    return this.findOne();
  }
}
