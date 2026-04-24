import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [MatchesModule],
  controllers: [AdminController],
})
export class AdminModule {}
