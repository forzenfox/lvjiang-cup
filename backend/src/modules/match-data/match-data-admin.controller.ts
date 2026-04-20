import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MatchDataService } from './match-data.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';

@ApiTags('对战数据管理')
@Controller('admin/matches')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@ApiBearerAuth()
export class MatchDataAdminController {
  constructor(private readonly matchDataService: MatchDataService) {}

  @Post(':matchId/games/import')
  @ApiOperation({ summary: '从Excel导入比赛数据' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importMatchData(
    @Param('matchId') matchId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('请上传Excel文件');
    }

    const adminId = 'admin';
    return this.matchDataService.importMatchData(matchId, file, adminId);
  }

  @Put(':matchId/games/:gameId')
  @ApiOperation({ summary: '通过JSON更新比赛数据' })
  async updateMatchGameData(
    @Param('matchId') matchId: string,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() data: any,
  ) {
    const adminId = 'admin';
    return this.matchDataService.updateMatchGameData(matchId, gameId, data, adminId);
  }
}
