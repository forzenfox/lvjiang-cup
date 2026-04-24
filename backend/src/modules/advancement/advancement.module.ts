import { Module } from '@nestjs/common';
import { AdvancementController } from './advancement.controller';
import { AdvancementService } from './advancement.service';

@Module({
  controllers: [AdvancementController],
  providers: [AdvancementService],
  exports: [AdvancementService],
})
export class AdvancementModule {}
