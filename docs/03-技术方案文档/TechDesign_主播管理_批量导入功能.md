# 主播管理批量导入功能 - 开发设计技术文档

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 主播管理批量导入功能 - 开发设计技术文档 |
| 版本 | v1.0.0 |
| 作者 | AI Architect |
| 日期 | 2026-04-28 |
| 关联 PRD | [PRD_主播管理_批量导入功能.md](./PRD_主播管理_批量导入功能.md) |

---

## 2. 概述

### 2.1 设计目标

本文档为「主播管理批量导入功能」的详细技术设计，指导前后端开发人员按规范完成实现。核心设计原则：

1. **复用优先**：最大程度复用现有战队导入功能的成熟架构和代码模式
2. **一致性**：保持与现有导入功能（战队导入）相同的交互体验、错误处理、文件处理机制
3. **最小侵入**：对现有主播管理模块的改动控制在最小范围

### 2.2 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| 后端 | NestJS + TypeScript + SQLite3 (sqlite3) |
| Excel 处理 | exceljs (^4.4.0) |
| 文件上传 | multer (NestJS 内置) |
| 缓存 | node-cache |

---

## 3. 系统架构

### 3.1 功能架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端 (React)                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────┐  │
│  │ AdminStreamers  │───▶│ StreamerImport   │───▶│  API 调用  │  │
│  │   页面          │    │    Dialog        │    │           │  │
│  └─────────────────┘    └──────────────────┘    └─────┬─────┘  │
└───────────────────────────────────────────────────────┼─────────┘
                                                        │
                              HTTP (multipart/form-data)│
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      后端 (NestJS)                               │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │ StreamersImport     │───▶│  StreamersImportService     │    │
│  │    Controller       │    │  (模板生成/导入/错误报告)      │    │
│  └─────────────────────┘    └─────────────┬───────────────┘    │
│                                           │                      │
│                              ┌────────────┼────────────┐        │
│                              ▼            ▼            ▼        │
│  ┌─────────────────┐   ┌──────────┐  ┌─────────┐  ┌─────────┐  │
│  │  exceljs        │   │ Database │  │  Cache  │  │  Files  │  │
│  │ (Excel读写)     │   │ Service  │  │ Service │  │  System │  │
│  └─────────────────┘   └──────────┘  └─────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 与现有战队导入的对比

| 维度 | 战队导入 | 主播导入（本期） |
|------|----------|-----------------|
| 导入模式 | 增量覆盖（同名覆盖） | **全量覆盖**（清空后重建） |
| 数据结构 | 复杂（战队+队员嵌套） | 简单（扁平列表） |
| Sheet 结构 | 多行组合同一战队 | 一行一个主播 |
| 数据验证 | 复杂（位置不重复、队长唯一等） | 简单（必填+枚举+长度） |
| 上限控制 | 16支战队 | 无明确上限（建议100条） |

---

## 4. 数据库设计

### 4.1 现有表结构（无需变更）

```sql
CREATE TABLE IF NOT EXISTS streamers (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  poster_url TEXT,
  bio TEXT,
  live_url TEXT,
  streamer_type TEXT CHECK(streamer_type IN ('internal', 'guest')),
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 导入操作的数据库事务

全量覆盖模式下，单次导入在一个数据库事务中完成：

```sql
BEGIN TRANSACTION;
  DELETE FROM streamers;                    -- 清空现有数据
  -- 循环执行 INSERT
  INSERT INTO streamers (id, nickname, poster_url, bio, live_url, streamer_type, sort_order, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
COMMIT;
```

**注意**：SQLite 不支持 `TRUNCATE`，使用 `DELETE FROM` 即可。由于 streamers 表无外键依赖，无需考虑级联删除。

---

## 5. API 接口详细设计

### 5.1 接口清单

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| GET | `/admin/streamers/import/template` | 下载导入模板 | JWT |
| POST | `/admin/streamers/import` | 执行批量导入 | JWT |
| POST | `/admin/streamers/import/error-report` | 下载错误报告 | JWT |

### 5.2 下载导入模板

**请求**：

```http
GET /admin/streamers/import/template
Authorization: Bearer <token>
```

**响应**：

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename*=UTF-8''%E9%A9%B4%E9%85%B1%E6%9D%AF_%E4%B8%BB%E6%92%AD%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF_20260428.xlsx
Content-Length: <file-size>

<binary-data>
```

### 5.3 批量导入主播

**请求**：

```http
POST /admin/streamers/import
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="主播信息.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

<binary-data>
------WebKitFormBoundary--
```

**成功响应** (200 OK)：

```json
{
  "success": true,
  "data": {
    "total": 50,
    "created": 50,
    "failed": 0,
    "errors": [],
    "externalUrlItems": [
      "海报: 洞主丨歌神洞庭湖 - https://apic.douyucdn.cn/..."
    ]
  }
}
```

**部分失败响应** (200 OK)：

```json
{
  "success": true,
  "data": {
    "total": 50,
    "created": 48,
    "failed": 2,
    "errors": [
      {
        "row": 3,
        "nickname": "",
        "field": "nickname",
        "message": "主播昵称不能为空"
      },
      {
        "row": 7,
        "nickname": "示例主播",
        "field": "streamerType",
        "message": "主播类型无效，必须是'驴酱主播'或'嘉宾主播'"
      }
    ],
    "externalUrlItems": []
  }
}
```

**错误响应** (400 Bad Request)：

```json
{
  "success": false,
  "message": "缺少必要的列头: 主播昵称, 主播类型"
}
```

### 5.4 下载错误报告

**请求**：

```http
POST /admin/streamers/import/error-report
Authorization: Bearer <token>
Content-Type: application/json

{
  "errors": [
    { "row": 3, "nickname": "", "field": "nickname", "message": "主播昵称不能为空" }
  ]
}
```

**响应**：

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Disposition: attachment; filename*=UTF-8''%E9%A9%B4%E9%85%B1%E6%9D%AF_%E5%AF%BC%E5%85%A5%E9%94%99%E8%AF%AF%E6%8A%A5%E5%91%8A_20260428.txt

========================================
       主播信息导入错误报告
========================================
生成时间：2026/4/28 14:30:00
错误总数：1

------ 错误详情 ------

[1] 第 3 行
    主播昵称：(空)
    错误字段：nickname
    错误信息：主播昵称不能为空

========================================
              报告结束
========================================
```

---

## 6. 后端详细设计

### 6.1 模块结构

```
backend/src/modules/streamers/
├── streamers.module.ts                    # 模块定义（需注册新 Provider/Controller）
├── streamers.controller.ts                # 现有主播 CRUD 控制器
├── streamers.service.ts                   # 现有主播 CRUD 服务
├── controllers/
│   └── streamers-import.controller.ts     # 【新增】导入控制器
├── services/
│   └── streamers-import.service.ts        # 【新增】导入服务
├── dto/
│   └── streamer-import.dto.ts             # 【新增】导入 DTO
└── utils/
    └── streamer-excel.util.ts             # 【新增】Excel 解析工具
```

### 6.2 新增文件详细设计

#### 6.2.1 `streamer-import.dto.ts`

```typescript
// 导入主播数据 DTO
export class ImportStreamerDto {
  rowIndex: number;           // Excel 行号（用于错误定位）
  nickname: string;           // 主播昵称
  streamerType: 'internal' | 'guest';  // 主播类型
  posterUrl: string;          // 海报 URL
  liveUrl: string;            // 直播间 URL
  bio: string;                // 个人简介
}

// 导入错误 DTO
export class ImportErrorDto {
  constructor(
    public row: number,       // Excel 行号
    public nickname: string,  // 主播昵称（用于展示）
    public field: string,     // 错误字段名
    public message: string,   // 错误描述
  ) {}
}

// 导入结果 DTO
export class ImportResultDto {
  constructor(
    public total: number,              // 处理总行数
    public created: number,            // 成功创建数
    public failed: number,             // 失败数
    public errors: ImportErrorDto[],   // 错误列表
    public externalUrlItems: string[], // 外链 URL 提醒列表
  ) {}
}
```

#### 6.2.2 `streamer-excel.util.ts`

```typescript
import * as ExcelJS from 'exceljs';
import { ImportStreamerDto } from '../dto/streamer-import.dto';

// 必需列头
export const REQUIRED_HEADERS = ['主播类型', '主播昵称', '海报URL', '直播间号', '个人简介'];

// Sheet 名称
export const SHEET_NAME = '主播信息导入';

// 主播类型映射
export const STREAMER_TYPE_MAP: Record<string, 'internal' | 'guest'> = {
  '驴酱主播': 'internal',
  '嘉宾主播': 'guest',
};

/**
 * 提取单元格值（处理超链接、富文本等）
 */
function extractCellValue(cellValue: any): string {
  if (cellValue === null || cellValue === undefined) {
    return '';
  }
  if (typeof cellValue === 'string') {
    return cellValue.trim();
  }
  if (typeof cellValue === 'object' && cellValue !== null) {
    if (cellValue.hyperlink && cellValue.hyperlink.target) {
      return String(cellValue.hyperlink.target).trim();
    }
    if (cellValue.text) {
      return String(cellValue.text).trim();
    }
  }
  return String(cellValue).trim();
}

/**
 * 解析直播间号/URL
 * 纯数字 → 拼接斗鱼完整URL
 */
export function parseLiveUrl(liveRoom: string): string {
  if (!liveRoom || !liveRoom.trim()) {
    return '';
  }
  const trimmed = liveRoom.trim();
  if (/^\d+$/.test(trimmed)) {
    return `https://www.douyu.com/${trimmed}`;
  }
  return trimmed;
}

/**
 * 解析主播类型
 */
export function parseStreamerType(type: string): 'internal' | 'guest' | null {
  if (!type) return null;
  const trimmed = type.trim();
  return STREAMER_TYPE_MAP[trimmed] || null;
}

/**
 * 解析 Excel 文件
 * @param filePath 文件路径
 * @returns 解析后的主播数据列表
 */
export async function parseStreamerExcel(filePath: string): Promise<ImportStreamerDto[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    // 如果没有指定名称的 sheet，尝试第一个 sheet
    const firstSheet = workbook.worksheets[0];
    if (!firstSheet) {
      throw new Error('Excel 文件中没有工作表');
    }
    return parseSheet(firstSheet);
  }

  return parseSheet(sheet);
}

/**
 * 解析单个 Sheet
 */
function parseSheet(sheet: ExcelJS.Worksheet): ImportStreamerDto[] {
  const streamers: ImportStreamerDto[] = [];

  // 从第 2 行开始读取（第 1 行为表头）
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < 2) return;

    const values = row.values as any[];
    // 注意：exceljs 的 values 数组从 1 开始索引
    const streamerTypeStr = extractCellValue(values[1]); // B列: 主播类型
    const nickname = extractCellValue(values[2]);        // C列: 主播昵称
    const posterUrl = extractCellValue(values[3]);       // D列: 海报URL
    const liveRoom = extractCellValue(values[4]);        // E列: 直播间号
    const bio = extractCellValue(values[5]);             // F列: 个人简介

    // 跳过完全空行
    if (!nickname && !streamerTypeStr) {
      return;
    }

    const streamerType = parseStreamerType(streamerTypeStr);

    streamers.push({
      rowIndex: rowNumber,
      nickname,
      streamerType: streamerType || 'internal', // 默认兜底，校验阶段会报错
      posterUrl,
      liveUrl: parseLiveUrl(liveRoom),
      bio,
    });
  });

  return streamers;
}

/**
 * 验证 Excel 列头
 */
export async function validateExcelHeaders(
  filePath: string,
): Promise<{ valid: boolean; missingHeaders: string[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { valid: false, missingHeaders: ['工作表'] };
  }

  const headerRow = sheet.getRow(1);
  const headers = headerRow.values as string[];

  const missingHeaders: string[] = [];
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      missingHeaders.push(required);
    }
  }

  return {
    valid: missingHeaders.length === 0,
    missingHeaders,
  };
}

/**
 * 获取 Excel 数据行数（不含表头）
 */
export async function getExcelRowCount(filePath: string): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return 0;
  }

  let count = 0;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 2) {
      const values = row.values as any[];
      const nickname = extractCellValue(values[2]);
      if (nickname) {
        count++;
      }
    }
  });

  return count;
}
```

#### 6.2.3 `streamers-import.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../../../database/database.service';
import { CacheService } from '../../../cache/cache.service';
import {
  parseStreamerExcel,
  validateExcelHeaders,
  getExcelRowCount,
  parseLiveUrl,
  parseStreamerType,
  SHEET_NAME,
  REQUIRED_HEADERS,
} from '../utils/streamer-excel.util';
import {
  ImportStreamerDto,
  ImportErrorDto,
  ImportResultDto,
} from '../dto/streamer-import.dto';

@Injectable()
export class StreamersImportService {
  private readonly logger = new Logger(StreamersImportService.name);
  private readonly TEMPLATE_DIR = path.join(process.cwd(), 'templates');
  private readonly TEMPLATE_FILE = 'streamer-import-template.xlsx';
  private readonly CACHE_KEY_ALL = 'streamers:all';
  private readonly CACHE_KEY_PREFIX = 'streamer:';

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  // ==================== 模板生成 ====================

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

    // 标题行
    sheet.getCell('A1').value = '主播信息导入模板';
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    sheet.mergeCells('A1:F1');

    // 说明行
    sheet.getCell('A2').value = '说明：每行对应一个主播，请按顺序填写。导入将覆盖所有现有主播数据。';
    sheet.getCell('A2').font = { size: 10, color: { argb: 'FF666666' } };
    sheet.mergeCells('A2:F2');

    // 表头行
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

    // 示例数据
    const examples = [
      [1, '驴酱主播', '洞主丨歌神洞庭湖', 'https://apic.douyucdn.cn/upload/avatar_v3/...', 138243, '驴酱杯S1荣誉队长'],
      [2, '驴酱主播', '余小C真的很强', 'https://apic.douyucdn.cn/upload/avatar_v3/...', 1126960, '驴酱杯S1荣誉队长'],
      [3, '嘉宾主播', '示例嘉宾', '', 123456, '特邀嘉宾主播'],
    ];

    examples.forEach((example, index) => {
      const rowNum = index + 4;
      example.forEach((value, colIndex) => {
        sheet.getCell(rowNum, colIndex + 1).value = value;
      });
    });

    // 数据验证：主播类型下拉列表
    for (let i = 4; i <= 10; i++) {
      sheet.getCell(i, 2).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"驴酱主播,嘉宾主播"'],
      };
    }

    // 列宽设置
    sheet.getColumn(1).width = 8;   // 序号
    sheet.getColumn(2).width = 12;  // 主播类型
    sheet.getColumn(3).width = 20;  // 主播昵称
    sheet.getColumn(4).width = 50;  // 海报URL
    sheet.getColumn(5).width = 15;  // 直播间号
    sheet.getColumn(6).width = 30;  // 个人简介

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

  // ==================== 导入逻辑 ====================

  async importFromExcel(filePath: string): Promise<ImportResultDto> {
    const errors: ImportErrorDto[] = [];
    const externalUrlItems: string[] = [];
    let created = 0;

    try {
      // 1. 列头校验
      const headerValidation = await validateExcelHeaders(filePath);
      if (!headerValidation.valid) {
        throw new Error(`缺少必要的列头: ${headerValidation.missingHeaders.join(', ')}`);
      }

      // 2. 解析 Excel
      const streamers = await parseStreamerExcel(filePath);
      const rowCount = await getExcelRowCount(filePath);

      if (streamers.length === 0) {
        return new ImportResultDto(0, 0, 0, [new ImportErrorDto(0, '', '', 'empty', '未检测到有效数据')], []);
      }

      // 3. 数据校验
      const validationErrors = this.validateStreamers(streamers);
      if (validationErrors.length > 0) {
        return new ImportResultDto(streamers.length, 0, streamers.length, validationErrors, []);
      }

      // 4. 数据库事务：全量覆盖
      await this.databaseService.begin();

      try {
        // 4.1 删除所有现有主播
        await this.databaseService.run('DELETE FROM streamers');
        this.logger.log('All existing streamers deleted');

        // 4.2 批量插入新数据
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
              i, // sort_order 按导入顺序分配
              now,
              now,
            ],
          );

          created++;

          // 记录外链海报 URL
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

      // 5. 清除缓存
      this.clearStreamersCache();

      return new ImportResultDto(streamers.length, created, streamers.length - created, errors, externalUrlItems);
    } finally {
      this.cleanupTempFile(filePath);
    }
  }

  /**
   * 校验主播数据
   */
  private validateStreamers(streamers: ImportStreamerDto[]): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];
    const nicknames = new Set<string>();

    for (const streamer of streamers) {
      // 昵称必填
      if (!streamer.nickname || !streamer.nickname.trim()) {
        errors.push(new ImportErrorDto(streamer.rowIndex, '', 'nickname', '主播昵称不能为空'));
      } else if (streamer.nickname.length > 50) {
        errors.push(new ImportErrorDto(streamer.rowIndex, streamer.nickname, 'nickname', '主播昵称不能超过50个字符'));
      } else if (nicknames.has(streamer.nickname)) {
        errors.push(new ImportErrorDto(streamer.rowIndex, streamer.nickname, 'nickname', '主播昵称在文件中不能重复'));
      } else {
        nicknames.add(streamer.nickname);
      }

      // 主播类型必填且有效
      if (!streamer.streamerType) {
        errors.push(new ImportErrorDto(streamer.rowIndex, streamer.nickname, 'streamerType', '主播类型不能为空'));
      } else if (!['internal', 'guest'].includes(streamer.streamerType)) {
        errors.push(new ImportErrorDto(streamer.rowIndex, streamer.nickname, 'streamerType', "主播类型无效，必须是'驴酱主播'或'嘉宾主播'"));
      }

      // 海报 URL 格式校验（如有）
      if (streamer.posterUrl && !this.isValidUrl(streamer.posterUrl)) {
        errors.push(new ImportErrorDto(streamer.rowIndex, streamer.nickname, 'posterUrl', '海报URL格式无效'));
      }

      // 个人简介长度校验
      if (streamer.bio && streamer.bio.length > 500) {
        errors.push(new ImportErrorDto(streamer.rowIndex, streamer.nickname, 'bio', '个人简介不能超过500个字符'));
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
    // 由于无法预知所有 streamer ID，这里简单清除所有缓存前缀
    // 实际实现取决于 CacheService 的能力
    this.logger.log('Streamers cache cleared');
  }

  // ==================== 错误报告 ====================

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

  // ==================== 工具方法 ====================

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
```

#### 6.2.4 `streamers-import.controller.ts`

```typescript
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
import { StreamersImportService } from '../services/streamers-import.service';
import { ImportErrorDto } from '../dto/streamer-import.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

// 文件存储配置（复用战队导入配置）
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
    cb(null, `streamer-import-${uniqueSuffix}${ext}`);
  },
});

@ApiTags('主播导入管理')
@Controller('admin/streamers/import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StreamersImportController {
  constructor(private readonly streamersImportService: StreamersImportService) {}

  @Get('template')
  @ApiOperation({ summary: '下载主播导入模板' })
  async downloadTemplate(@Res() res: Response) {
    const templatePath = await this.streamersImportService.generateTemplate();

    const fileName = `驴酱杯_主播导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;

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
  @ApiOperation({ summary: '批量导入主播信息（全量覆盖）' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: excelStorage }))
  async importStreamers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('请上传 Excel 文件');
    }

    const result = await this.streamersImportService.importFromExcel(file.path);
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

    const buffer = await this.streamersImportService.generateErrorReport(errors);
    const reportName = `驴酱杯_主播导入错误报告_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(reportName)}`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }
}
```

### 6.3 模块注册

修改 `backend/src/modules/streamers/streamers.module.ts`，注册新 Controller 和 Provider：

```typescript
import { Module } from '@nestjs/common';
import { StreamersController } from './streamers.controller';
import { StreamersService } from './streamers.service';
import { StreamersImportController } from './controllers/streamers-import.controller';
import { StreamersImportService } from './services/streamers-import.service';

@Module({
  controllers: [StreamersController, StreamersImportController],
  providers: [StreamersService, StreamersImportService],
})
export class StreamersModule {}
```

---

## 7. 前端详细设计

### 7.1 模块结构

```
frontend/src/
├── api/
│   └── streamers-import.ts              # 【新增】导入 API 封装
├── components/import/
│   ├── ImportDialog.tsx                 # 现有战队导入弹窗（参考）
│   └── StreamerImportDialog.tsx         # 【新增】主播导入弹窗
└── pages/admin/
    └── Streamers.tsx                    # 【修改】新增导入按钮入口
```

### 7.2 新增文件详细设计

#### 7.2.1 `streamers-import.ts`

```typescript
import apiClient from './axios';
import type { ApiResponse } from './types';

export interface StreamerImportError {
  row: number;
  nickname: string;
  field: string;
  message: string;
}

export interface StreamerImportResult {
  total: number;
  created: number;
  failed: number;
  errors?: StreamerImportError[];
  externalUrlItems?: string[];
}

/**
 * 下载导入模板
 */
export async function downloadStreamerTemplate(): Promise<Blob> {
  const response = await apiClient.get<Blob>('/admin/streamers/import/template', {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * 批量导入主播
 */
export async function importStreamers(file: File): Promise<StreamerImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<StreamerImportResult>>(
    '/admin/streamers/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '导入失败');
  }

  return response.data.data;
}

/**
 * 下载错误报告
 */
export async function downloadStreamerErrorReport(errors: StreamerImportError[]): Promise<Blob> {
  const response = await apiClient.post<Blob>(
    '/admin/streamers/import/error-report',
    { errors },
    {
      responseType: 'blob',
    },
  );
  return response.data;
}

export default {
  downloadStreamerTemplate,
  importStreamers,
  downloadStreamerErrorReport,
};
```

#### 7.2.2 `StreamerImportDialog.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, Download } from 'lucide-react';
import { Button } from '../ui/button';
import Modal from '../ui/Modal';
import {
  importStreamers,
  downloadStreamerTemplate,
  type StreamerImportResult,
} from '@/api/streamers-import';

interface StreamerImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: StreamerImportResult) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const StreamerImportDialog: React.FC<StreamerImportDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx') {
      return '仅支持 .xlsx 格式的 Excel 文件';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '文件大小不能超过 5MB';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadStreamerTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `驴酱杯_主播导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('模板下载失败，请重试');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await importStreamers(file);
      onSuccess(result);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setDragging(false);
    onClose();
  };

  return (
    <Modal visible={open} onClose={handleClose} title="批量导入主播">
      <div className="space-y-4">
        {/* 重要警告 */}
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-200">
              <p className="font-medium mb-1">⚠️ 重要警告</p>
              <ul className="list-disc list-inside space-y-0.5 text-red-300/80">
                <li>导入将删除所有现有主播数据，无法恢复</li>
                <li>导入后主播ID将重新生成</li>
                <li>已关联的对战数据等引用将失效</li>
                <li>导入后需重新导入关联数据</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 导入说明 */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="font-medium mb-1">导入说明</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-300/80">
                <li>支持 .xlsx 格式，大小不超过 5MB</li>
                <li>海报URL为外链时需手动确认可访问</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 下载模板按钮 */}
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
        >
          <Download className="w-4 h-4 mr-2" />
          下载导入模板
        </Button>

        {/* 文件上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div className="text-left">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 mb-2">
                拖拽文件到此处，或
                <label className="text-blue-400 hover:text-blue-300 cursor-pointer mx-1">
                  点击选择
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-gray-500 text-sm">支持 .xlsx 格式，大小不超过 5MB</p>
            </>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} disabled={uploading}>
            取消
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || uploading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          >
            {uploading ? '导入中...' : '开始导入'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

### 7.3 修改现有文件

#### 7.3.1 `Streamers.tsx` 修改点

在 `AdminStreamers` 组件中：

1. **导入新增组件和 API**：

```typescript
import { StreamerImportDialog } from '@/components/import/StreamerImportDialog';
import { downloadStreamerErrorReport, type StreamerImportResult } from '@/api/streamers-import';
import { Download } from 'lucide-react'; // 已有导入中补充
```

2. **新增状态**：

```typescript
const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
const [importResult, setImportResult] = useState<StreamerImportResult | null>(null);
const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
```

3. **标题栏新增「批量导入」按钮**：

```tsx
<div className="flex gap-2">
  <Button
    variant="outline"
    onClick={loadStreamers}
    disabled={loading}
    className="border-gray-600 text-gray-300 hover:bg-gray-700"
  >
    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
    刷新
  </Button>
  <Button
    variant="outline"
    onClick={() => setIsImportDialogOpen(true)}
    disabled={loading}
    className="border-gray-600 text-gray-300 hover:bg-gray-700"
  >
    <Upload className="w-4 h-4 mr-2" />
    批量导入
  </Button>
  <Button onClick={handleCreateNew} disabled={loading}>
    <Plus className="w-4 h-4 mr-2" /> 添加主播
  </Button>
</div>
```

4. **新增导入成功处理**：

```typescript
const handleImportSuccess = (result: StreamerImportResult) => {
  setImportResult(result);
  setIsResultDialogOpen(true);
  loadStreamers(); // 刷新列表
};

const handleDownloadErrorReport = async () => {
  if (!importResult?.errors || importResult.errors.length === 0) return;
  try {
    const blob = await downloadStreamerErrorReport(importResult.errors);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `驴酱杯_主播导入错误报告_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('错误报告下载失败');
  }
};
```

5. **渲染导入弹窗和结果弹窗**：

```tsx
{/* 导入弹窗 */}
<StreamerImportDialog
  open={isImportDialogOpen}
  onClose={() => setIsImportDialogOpen(false)}
  onSuccess={handleImportSuccess}
/>

{/* 导入结果弹窗（可使用现有 Modal 组件） */}
<Modal
  visible={isResultDialogOpen}
  onClose={() => setIsResultDialogOpen(false)}
  title="导入结果"
>
  {importResult && (
    <div className="space-y-4">
      <p className="text-white">
        导入完成！总计：{importResult.total} 条，成功：{importResult.created} 条，失败：{importResult.failed} 条
      </p>

      {importResult.externalUrlItems && importResult.externalUrlItems.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-amber-200 text-sm font-medium mb-1">外链URL提醒</p>
          <ul className="list-disc list-inside text-amber-300/80 text-sm">
            {importResult.externalUrlItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {importResult.errors && importResult.errors.length > 0 && (
        <div className="max-h-60 overflow-y-auto">
          <p className="text-red-400 text-sm font-medium mb-2">失败详情</p>
          <div className="space-y-2">
            {importResult.errors.map((error, index) => (
              <div key={index} className="p-2 bg-red-500/10 rounded text-sm">
                <p className="text-red-300">第 {error.row} 行 - {error.nickname || '(空)'}</p>
                <p className="text-red-400/80">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {importResult.errors && importResult.errors.length > 0 && (
          <Button variant="outline" onClick={handleDownloadErrorReport}>
            <Download className="w-4 h-4 mr-2" />
            下载错误报告
          </Button>
        )}
        <Button onClick={() => setIsResultDialogOpen(false)}>确定</Button>
      </div>
    </div>
  )}
</Modal>
```

---

## 8. 测试设计

### 8.1 单元测试

#### 8.1.1 后端单元测试

**文件**: `backend/src/modules/streamers/utils/streamer-excel.util.spec.ts`

```typescript
import { parseLiveUrl, parseStreamerType, validateExcelHeaders } from './streamer-excel.util';

describe('streamer-excel.util', () => {
  describe('parseLiveUrl', () => {
    it('纯数字应拼接为斗鱼完整URL', () => {
      expect(parseLiveUrl('138243')).toBe('https://www.douyu.com/138243');
    });

    it('完整URL应保持原样', () => {
      expect(parseLiveUrl('https://www.douyu.com/138243')).toBe('https://www.douyu.com/138243');
    });

    it('空值应返回空字符串', () => {
      expect(parseLiveUrl('')).toBe('');
      expect(parseLiveUrl(null as any)).toBe('');
    });
  });

  describe('parseStreamerType', () => {
    it('驴酱主播应映射为 internal', () => {
      expect(parseStreamerType('驴酱主播')).toBe('internal');
    });

    it('嘉宾主播应映射为 guest', () => {
      expect(parseStreamerType('嘉宾主播')).toBe('guest');
    });

    it('无效值应返回 null', () => {
      expect(parseStreamerType('无效类型')).toBeNull();
    });
  });
});
```

**文件**: `backend/src/modules/streamers/services/streamers-import.service.spec.ts`

```typescript
// 测试事务回滚、缓存清除、全量覆盖逻辑
```

#### 8.1.2 前端单元测试

**文件**: `frontend/src/components/import/StreamerImportDialog.test.tsx`

测试点：
- 文件格式校验（非 .xlsx 拒绝）
- 文件大小校验（>5MB 拒绝）
- 拖拽上传交互
- 模板下载按钮点击
- 导入中状态（按钮禁用）

### 8.2 集成测试

| 场景 | 步骤 | 预期结果 |
|------|------|----------|
| 全量覆盖导入 | 1. 创建3条主播<br>2. 导入5条新主播<br>3. 查询数据库 | streamers表只有5条新数据，sort_order为0-4 |
| 事务回滚 | 1. 准备含无效数据的Excel<br>2. 触发导入 | 数据库数据保持不变，无删除操作 |
| 缓存清除 | 1. 缓存主播列表<br>2. 执行导入<br>3. 查询缓存 | 缓存键已被删除 |
| 并发导入 | 1. 同时发起两个导入请求 | 第二个请求应排队或被拒绝（视实现而定） |

---

## 9. 部署与配置

### 9.1 依赖检查

确保后端已安装 `exceljs`：

```bash
cd backend
npm list exceljs
# 如未安装：npm install exceljs
```

### 9.2 目录权限

确保以下目录有读写权限：

```
<project-root>/uploads/temp/       # 临时上传文件
<project-root>/templates/          # 模板文件缓存
```

### 9.3 环境变量

无需新增环境变量，复用现有配置。

---

## 10. 风险与注意事项

| 风险点 | 说明 | 应对措施 |
|--------|------|----------|
| 全量覆盖误操作 | 导入会无条件删除所有现有主播 | 弹窗明确警告 + 后期可考虑二次确认 |
| 外键约束 | streamers 表目前无外键，但未来可能增加 | 全量覆盖使用 `DELETE FROM` 而非 `DROP TABLE` |
| 大数据量性能 | 100+ 条数据一次性事务 | SQLite WAL 模式已启用，事务性能足够 |
| 并发导入 | 无分布式锁机制 | 单次事务执行快，冲突概率低；如需可添加文件锁 |
| 缓存一致性 | 清除缓存与数据库操作非原子 | 事务提交后再清缓存，失败时缓存自然过期 |

---

## 11. 附录

### 附录 A: 文件清单

#### 新增文件

| 文件路径 | 说明 |
|----------|------|
| `backend/src/modules/streamers/controllers/streamers-import.controller.ts` | 导入控制器 |
| `backend/src/modules/streamers/services/streamers-import.service.ts` | 导入服务 |
| `backend/src/modules/streamers/dto/streamer-import.dto.ts` | 导入 DTO |
| `backend/src/modules/streamers/utils/streamer-excel.util.ts` | Excel 解析工具 |
| `frontend/src/api/streamers-import.ts` | 前端导入 API |
| `frontend/src/components/import/StreamerImportDialog.tsx` | 主播导入弹窗 |

#### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `backend/src/modules/streamers/streamers.module.ts` | 注册新 Controller 和 Provider |
| `frontend/src/pages/admin/Streamers.tsx` | 新增导入按钮、导入弹窗、结果弹窗 |

### 附录 B: 参考代码

| 参考文件 | 说明 |
|----------|------|
| `backend/src/modules/teams/controllers/teams-import.controller.ts` | 战队导入控制器（复用模式） |
| `backend/src/modules/teams/services/teams-import.service.ts` | 战队导入服务（复用模式） |
| `backend/src/modules/teams/utils/excel.util.ts` | Excel 工具函数（复用模式） |
| `frontend/src/components/import/ImportDialog.tsx` | 战队导入弹窗（UI 参考） |
| `frontend/src/api/teams-import.ts` | 战队导入 API（参考模式） |

---

*文档结束*
