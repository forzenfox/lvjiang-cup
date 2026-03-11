import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { TeamsModule } from './modules/teams/teams.module';
import { MatchesModule } from './modules/matches/matches.module';
import { StreamsModule } from './modules/streams/streams.module';
import { AdvancementModule } from './modules/advancement/advancement.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DatabaseModule,
    CacheModule,
    TeamsModule,
    MatchesModule,
    StreamsModule,
    AdvancementModule,
    AuthModule,
    AdminModule,
  ],
})
export class AppModule {}
