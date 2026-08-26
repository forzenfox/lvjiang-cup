import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MatchesModule } from '../matches/matches.module';
import { FormatsModule } from '../formats/formats.module';

@Module({
  imports: [MatchesModule, FormatsModule],
  controllers: [AdminController],
})
export class AdminModule {}
