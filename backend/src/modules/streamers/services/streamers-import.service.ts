import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../../../database/database.service';
import { CacheService } from '../../../cache/cache.service';
import { parseStreamerExcel, validateExcelHeaders, SHEET_NAME } from '../utils/streamer-excel.util';
import { ImportStreamerDto, ImportErrorDto, ImportResultDto } from '../dto/streamer-import.dto';

@Injectable()
export class StreamersImportService {
  private readonly logger = new Logger(StreamersImportService.name);
  private readonly TEMPLATE_DIR = path.join(process.cwd(), 'templates');
  private readonly TEMPLATE_FILE = 'streamer-import-template.xlsx';
  private readonly CACHE_KEY_ALL = 'streamers:all';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  async generateTemplate(): Promise<string> {
    const templatePath = path.join(this.TEMPLATE_DIR, this.TEMPLATE_FILE);

    if (fs.existsSync(templatePath)) {
      this.logger.log(`Using cached template: ${templatePath}`);
      return templatePath;
    }

    this.logger.log(`Generating new template: ${templatePath}`);
    await this.ensureTemplateDir();

    const workbook = new ExcelJS.Workbook();
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(SHEET_NAME);

    sheet.getCell('A1').value = '主播信息导入模板';
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    sheet.mergeCells('A1:F1');

    sheet.getCell('A2').value =
      '说明：每行对应一个主播，请按顺序填写。导入将覆盖所有现有主播数据。';
    sheet.getCell('A2').font = { size: 10, color: { argb: 'FF666666' } };
    sheet.mergeCells('A2:F2');

    const headers = ['序号', '主播类型', '主播昵称', '海报URL', '直播间号', '个人简介'];
    headers.forEach((header, index) => {
      sheet.getCell(3, index + 1).value = header;
    });

    const headerRow = sheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCE5FF' },
    };

    const examples = [
      [
        1,
        '驴酱主播',
        '洞主丨歌神洞庭湖',
        'https://apic.douyucdn.cn/upload/avatar_v3/...',
        138243,
        '驴酱杯S1荣誉队长',
      ],
      [
        2,
        '驴酱主播',
        '余小C真的很强',
        'https://apic.douyucdn.cn/upload/avatar_v3/...',
        1126960,
        '驴酱杯S1荣誉队长',
      ],
      [3, '嘉宾主播', '示例嘉宾', '', 123456, '特邀嘉宾主播'],
    ];

    examples.forEach((example, index) => {
      const rowNum = index + 4;
      example.forEach((value, colIndex) => {
        sheet.getCell(rowNum, colIndex + 1).value = value;
      });
    });

    for (let i = 4; i <= 10; i++) {
      sheet.getCell(i, 2).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"驴酱主播,嘉宾主播"'],
      } as any;
    }

    sheet.getColumn(1).width = 8;
    sheet.getColumn(2).width = 12;
    sheet.getColumn(3).width = 20;
    sheet.getColumn(4).width = 50;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 30;

    await workbook.xlsx.writeFile(templatePath);
    this.logger.log(`Template generated successfully: ${templatePath}`);

    return templatePath;
  }

  async refreshTemplate(): Promise<string> {
    const templatePath = path.join(this.TEMPLATE_DIR, this.TEMPLATE_FILE);
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
      this.logger.log(`Old template deleted: ${templatePath}`);
    }
    return this.generateTemplate();
  }

  private async ensureTemplateDir(): Promise<void> {
    if (!fs.existsSync(this.TEMPLATE_DIR)) {
      fs.mkdirSync(this.TEMPLATE_DIR, { recursive: true });
    }
  }

  async importFromExcel(filePath: string): Promise<ImportResultDto> {
    const errors: ImportErrorDto[] = [];
    const externalUrlItems: string[] = [];
    let created = 0;

    try {
      const headerValidation = await validateExcelHeaders(filePath);
      if (!headerValidation.valid) {
        throw new Error(`缺少必要的列头: ${headerValidation.missingHeaders.join(', ')}`);
      }

      const streamers = await parseStreamerExcel(filePath);

      if (streamers.length === 0) {
        return new ImportResultDto(
          0,
          0,
          0,
          [new ImportErrorDto(0, '', 'empty', '未检测到有效数据')],
          [],
        );
      }

      const validationErrors = this.validateStreamers(streamers);
      if (validationErrors.length > 0) {
        return new ImportResultDto(streamers.length, 0, streamers.length, validationErrors, []);
      }

      await this.databaseService.begin();

      try {
        await this.databaseService.run('DELETE FROM streamers', []);
        this.logger.log('All existing streamers deleted');

        for (let i = 0; i < streamers.length; i++) {
          const streamer = streamers[i];
          const id = `streamer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();

          await this.databaseService.run(
            `INSERT INTO streamers (id, nickname, poster_url, bio, live_url, streamer_type, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              streamer.nickname,
              streamer.posterUrl || null,
              streamer.bio || null,
              streamer.liveUrl || null,
              streamer.streamerType,
              i,
              now,
              now,
            ],
          );

          created++;

          if (streamer.posterUrl && streamer.posterUrl.startsWith('http')) {
            externalUrlItems.push(`海报: ${streamer.nickname} - ${streamer.posterUrl}`);
          }
        }

        await this.databaseService.commit();
        this.logger.log(`Import completed: ${created} streamers created`);
      } catch (err) {
        await this.databaseService.rollback();
        throw err;
      }

      this.clearStreamersCache();

      return new ImportResultDto(
        streamers.length,
        created,
        streamers.length - created,
        errors,
        externalUrlItems,
      );
    } finally {
      this.cleanupTempFile(filePath);
    }
  }

  private validateStreamers(streamers: ImportStreamerDto[]): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];
    const nicknames = new Set<string>();

    for (const streamer of streamers) {
      if (!streamer.nickname || !streamer.nickname.trim()) {
        errors.push(new ImportErrorDto(streamer.rowIndex, '', 'nickname', '主播昵称不能为空'));
      } else if (streamer.nickname.length > 50) {
        errors.push(
          new ImportErrorDto(
            streamer.rowIndex,
            streamer.nickname,
            'nickname',
            '主播昵称不能超过50个字符',
          ),
        );
      } else if (nicknames.has(streamer.nickname)) {
        errors.push(
          new ImportErrorDto(
            streamer.rowIndex,
            streamer.nickname,
            'nickname',
            '主播昵称在文件中不能重复',
          ),
        );
      } else {
        nicknames.add(streamer.nickname);
      }

      if (!streamer.streamerType) {
        errors.push(
          new ImportErrorDto(
            streamer.rowIndex,
            streamer.nickname,
            'streamerType',
            '主播类型不能为空',
          ),
        );
      } else if (!['internal', 'guest'].includes(streamer.streamerType)) {
        errors.push(
          new ImportErrorDto(
            streamer.rowIndex,
            streamer.nickname,
            'streamerType',
            "主播类型无效，必须是'驴酱主播'或'嘉宾主播'",
          ),
        );
      }

      if (streamer.posterUrl && !this.isValidUrl(streamer.posterUrl)) {
        errors.push(
          new ImportErrorDto(streamer.rowIndex, streamer.nickname, 'posterUrl', '海报URL格式无效'),
        );
      }

      if (streamer.bio && streamer.bio.length > 500) {
        errors.push(
          new ImportErrorDto(
            streamer.rowIndex,
            streamer.nickname,
            'bio',
            '个人简介不能超过500个字符',
          ),
        );
      }
    }

    return errors;
  }

  private isValidUrl(url: string): boolean {
    if (!url) return true;
    return /^https?:\/\/.+/i.test(url);
  }

  private clearStreamersCache(): void {
    this.cacheService.del(this.CACHE_KEY_ALL);
    this.logger.log('Streamers cache cleared');
  }

  async generateErrorReport(errors: ImportErrorDto[]): Promise<Buffer> {
    const lines: string[] = [];

    lines.push('========================================');
    lines.push('       主播信息导入错误报告');
    lines.push('========================================');
    lines.push(`生成时间：${new Date().toLocaleString('zh-CN')}`);
    lines.push(`错误总数：${errors.length}`);
    lines.push('');
    lines.push('------ 错误详情 ------');
    lines.push('');

    errors.forEach((error, index) => {
      lines.push(`[${index + 1}] 第 ${error.row} 行`);
      lines.push(`    主播昵称：${error.nickname || '(空)'}`);
      lines.push(`    错误字段：${error.field || '未知'}`);
      lines.push(`    错误信息：${error.message}`);
      lines.push('');
    });

    lines.push('========================================');
    lines.push('              报告结束');
    lines.push('========================================');

    return Buffer.from(lines.join('\n'), 'utf-8');
  }

  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Temp file cleaned up: ${filePath}`);
      }
    } catch (err) {
      this.logger.warn(`Failed to cleanup temp file: ${filePath}`, err);
    }
  }
}
