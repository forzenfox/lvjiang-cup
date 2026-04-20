import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MatchDataService } from './match-data.service';

@ApiTags('对战数据')
@Controller('matches')
export class MatchDataController {
  constructor(private readonly matchDataService: MatchDataService) {}

  @Get(':matchId/games/check')
  @ApiOperation({ summary: '检查比赛是否有对战数据' })
  async checkMatchDataExists(@Param('matchId') matchId: string) {
    return this.matchDataService.checkMatchDataExists(matchId);
  }

  @Get(':matchId/series')
  @ApiOperation({ summary: '获取系列赛信息（包括所有对局概要）' })
  async getMatchSeries(@Param('matchId') matchId: string) {
    return this.matchDataService.getMatchSeries(matchId);
  }

  @Get(':matchId/games/:gameNumber')
  @ApiOperation({ summary: '获取具体某一局的完整数据' })
  async getMatchGameData(
    @Param('matchId') matchId: string,
    @Param('gameNumber', ParseIntPipe) gameNumber: number,
  ) {
    return this.matchDataService.getMatchGameData(matchId, gameNumber);
  }
}
