import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { TeamsImportService } from '../services/teams-import.service';
import { ImportErrorDto } from '../dto/import';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const excelStorage = diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `import-${uniqueSuffix}${ext}`);
  },
});

@ApiTags('战队导入管理')
@Controller('admin/teams/import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsImportController {
  constructor(private readonly teamsImportService: TeamsImportService) {}

  @Get('template')
  @ApiOperation({ summary: '下载战队导入模板' })
  async downloadTemplate(@Res() res: Response) {
    const templatePath = await this.teamsImportService.generateTemplate();

    const fileName = `驴酱杯_战队导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;

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

  @Get('template/refresh')
  @ApiOperation({ summary: '刷新战队导入模板（删除旧模板并重新生成）' })
  async refreshTemplate(@Res() res: Response) {
    const templatePath = await this.teamsImportService.refreshTemplate();

    const fileName = `驴酱杯_战队导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;

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

  @Post()
  @ApiOperation({ summary: '批量导入战队和队员信息' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: excelStorage }))
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
    @Res() res: Response,
  ) {
    const { errors } = errorReport;

    if (!errors || !Array.isArray(errors) || errors.length === 0) {
      throw new Error('没有错误信息可以生成报告');
    }

    const buffer = await this.teamsImportService.generateErrorReport(errors);
    const reportName = `驴酱杯_导入错误报告_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;

    res.setHeader(
      'Content-Type',
      'text/plain; charset=utf-8',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(reportName)}`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }
}
