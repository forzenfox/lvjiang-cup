import { Module } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { StreamersController } from './streamers.controller';
import { StreamersService } from './streamers.service';
import { StreamersImportController } from './controllers/streamers-import.controller';
import { StreamersImportService } from './services/streamers-import.service';

@Module({
  controllers: [StreamersController, StreamersImportController],
  providers: [DatabaseService, CacheService, StreamersService, StreamersImportService],
  exports: [StreamersService],
})
export class StreamersModule {}
