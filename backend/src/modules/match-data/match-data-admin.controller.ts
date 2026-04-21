import {
  Controller,
  Get,
  Post,
  Put,
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
import * as fs from 'fs';
import { MatchDataService } from './match-data.service';
import { MatchDataImportService } from './services/match-data-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';

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

  @Get('import/template')
  @ApiOperation({ summary: '下载对战数据导入模板' })
  async downloadTemplate(@Res() res: Response) {
    const templatePath = await this.matchDataImportService.generateTemplate();

    const fileName = `驴酱杯_对战数据导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    res.setHeader('Content-Length', fs.statSync(templatePath).size.toString());

    const fileStream = fs.createReadStream(templatePath);
    fileStream.pipe(res);
  }

  @Get('import/template/refresh')
  @ApiOperation({ summary: '刷新对战数据导入模板（删除旧模板并重新生成）' })
  async refreshTemplate(@Res() res: Response) {
    const templatePath = await this.matchDataImportService.refreshTemplate();

    const fileName = `驴酱杯_对战数据导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    res.setHeader('Content-Length', fs.statSync(templatePath).size.toString());

    const fileStream = fs.createReadStream(templatePath);
    fileStream.pipe(res);
  }
}
