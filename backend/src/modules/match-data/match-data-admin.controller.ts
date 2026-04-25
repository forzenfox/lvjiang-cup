import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { MatchDataService } from './match-data.service';
import { MatchDataImportService } from './services/match-data-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { ImportOptions } from '../utils/match-excel.util';

@ApiTags('对战数据管理')
@Controller('admin/matches')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
@ApiBearerAuth()
export class MatchDataAdminController {
  constructor(
    private readonly matchDataService: MatchDataService,
    private readonly matchDataImportService: MatchDataImportService,
  ) {}

  @Post(':matchId/games/import')
  @ApiOperation({ summary: '从Excel导入比赛数据（支持多Sheet）' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importMatchData(
    @Param('matchId') matchId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('dryRun') dryRun?: string,
    @Body('confirmWarnings') confirmWarnings?: string,
  ) {
    if (!file) {
      throw new Error('请上传Excel文件');
    }

    const options: ImportOptions = {
      dryRun: dryRun === 'true',
      confirmWarnings: confirmWarnings === 'true',
    };

    const adminId = 'admin';
    return this.matchDataService.importMatchData(matchId, file, adminId, options);
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

  @Delete(':matchId/games/:gameNumber')
  @ApiOperation({ summary: '删除比赛数据（整局）' })
  async deleteMatchGameData(
    @Param('matchId') matchId: string,
    @Param('gameNumber', ParseIntPipe) gameNumber: number,
  ) {
    const adminId = 'admin';
    return this.matchDataService.deleteMatchGameData(matchId, gameNumber, adminId);
  }

  @Get(':matchId/import/template')
  @ApiOperation({ summary: '下载对战数据导入模板（根据比分动态生成）' })
  async downloadTemplate(@Param('matchId') matchId: string, @Res() res: Response) {
    const buffer = await this.matchDataImportService.generateTemplate(matchId);

    // 查询对战信息用于生成文件名
    const match = await this.matchDataService.getMatchBasicInfo(matchId);
    const fileName = `驴酱杯对战信息_${match.teamAName}_vs_${match.teamBName}_${match.boFormat}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Post('import/error-report')
  @ApiOperation({ summary: '下载对战数据导入错误报告' })
  async downloadErrorReport(@Body() body: { errors: any[] }, @Res() res: Response) {
    const buffer = await this.matchDataImportService.generateErrorReport(body.errors);

    const fileName = `对战数据导入错误报告_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }
}
