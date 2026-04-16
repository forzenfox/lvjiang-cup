import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { TeamsImportService } from '../services/teams-import.service';
import { ImportErrorDto } from '../dto/import';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('战队导入管理')
@Controller('admin/teams/import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsImportController {
  constructor(private readonly teamsImportService: TeamsImportService) {}

  @Get('template')
  @ApiOperation({ summary: '下载战队导入模板' })
  async downloadTemplate(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const templatePath = await this.teamsImportService.generateTemplate();

    const fileName = `驴酱杯_战队导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
    const fileStream = fs.createReadStream(templatePath);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });

    return new StreamableFile(fileStream);
  }

  @Get('template/refresh')
  @ApiOperation({ summary: '刷新战队导入模板（删除旧模板并重新生成）' })
  async refreshTemplate(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const templatePath = await this.teamsImportService.refreshTemplate();

    const fileName = `驴酱杯_战队导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
    const fileStream = fs.createReadStream(templatePath);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });

    return new StreamableFile(fileStream);
  }

  @Post()
  @ApiOperation({ summary: '批量导入战队和队员信息' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importTeams(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('请上传 Excel 文件');
    }

    const result = await this.teamsImportService.importFromExcel(file.path);
    return result;
  }

  @Post('error-report')
  @ApiOperation({ summary: '下载导入错误报告' })
  async downloadErrorReport(
    @Body() errorReport: { errors: ImportErrorDto[] },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { errors } = errorReport;

    if (!errors || !Array.isArray(errors) || errors.length === 0) {
      throw new Error('没有错误信息可以生成报告');
    }

    const reportPath = await this.teamsImportService.generateErrorReport(errors);
    const fileStream = fs.createReadStream(reportPath);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment',
    });

    return new StreamableFile(fileStream);
  }
}
