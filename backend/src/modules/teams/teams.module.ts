import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TeamsImportController } from './controllers/teams-import.controller';
import { TeamsImportService } from './services/teams-import.service';
import { DatabaseModule } from '../../database/database.module';
import { CacheModule } from '../../cache/cache.module';

@Module({
  imports: [DatabaseModule, CacheModule],
  controllers: [TeamsController, TeamsImportController],
  providers: [TeamsService, TeamsImportService],
  exports: [TeamsService, TeamsImportService],
})
export class TeamsModule {}
