import { Module } from '@nestjs/common';
import { FormatsController } from './formats.controller';
import { FormatsService } from './formats.service';

/**
 * 赛制配置模块
 * 注意：FormatsModule 不得 import MatchesModule（MatchesModule 已 import 本模块，避免循环依赖）
 */
@Module({
  controllers: [FormatsController],
  providers: [FormatsService],
  exports: [FormatsService],
})
export class FormatsModule {}
