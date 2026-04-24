import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdvancementService, Advancement } from './advancement.service';
import { UpdateAdvancementDto } from './dto/update-advancement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('晋级名单管理')
@Controller()
export class AdvancementController {
  constructor(private readonly advancementService: AdvancementService) {}

  @Get('advancement')
  @ApiOperation({ summary: '获取晋级名单' })
  async findOne(): Promise<Advancement> {
    return this.advancementService.findOne();
  }

  @Put('admin/advancement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新晋级名单（需认证）' })
  async update(@Body() updateAdvancementDto: UpdateAdvancementDto): Promise<Advancement> {
    return this.advancementService.update(updateAdvancementDto);
  }
}
