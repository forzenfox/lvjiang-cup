import { Module } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { StreamersController } from './streamers.controller';
import { StreamersService } from './streamers.service';

@Module({
  controllers: [StreamersController],
  providers: [DatabaseService, CacheService, StreamersService],
  exports: [StreamersService],
})
export class StreamersModule {}
