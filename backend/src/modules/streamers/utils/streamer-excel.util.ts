import * as ExcelJS from 'exceljs';

export const REQUIRED_HEADERS = ['序号', '主播类型', '主播昵称', '海报URL', '直播间号', '个人简介'];

export const SHEET_NAME = '主播信息导入';

// 模板结构：第1行标题，第2行说明，第3行表头，第4行起数据
// 列结构：A列=序号，B列=主播类型，C列=主播昵称，D列=海报URL，E列=直播间号，F列=个人简介
export const HEADER_ROW_NUMBER = 3;
export const DATA_START_ROW_NUMBER = 4;

// 列索引（ExcelJS的row.values返回的数组索引，索引0为null占位）
export const COLUMN_INDEX = {
  SEQUENCE: 1,       // 序号
  STREAMER_TYPE: 2,  // 主播类型
  NICKNAME: 3,       // 主播昵称
  POSTER_URL: 4,     // 海报URL
  LIVE_ROOM: 5,      // 直播间号
  BIO: 6,            // 个人简介
};

export const STREAMER_TYPE_MAP: Record<string, 'internal' | 'guest'> = {
  驴酱主播: 'internal',
  嘉宾主播: 'guest',
};

export function extractCellValue(cellValue: any): string {
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

export function parseLiveUrl(liveRoom: string | null | undefined): string {
  if (!liveRoom) {
    return '';
  }
  const trimmed = liveRoom.trim();
  if (/^\d+$/.test(trimmed)) {
    return `https://www.douyu.com/${trimmed}`;
  }
  return trimmed;
}

export function parseStreamerType(type: string | null | undefined): 'internal' | 'guest' | null {
  if (!type) return null;
  const trimmed = type.trim();
  return STREAMER_TYPE_MAP[trimmed] || null;
}

export async function parseStreamerExcel(filePath: string): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet(SHEET_NAME);
  if (!sheet) {
    const firstSheet = workbook.worksheets[0];
    if (!firstSheet) {
      throw new Error('Excel 文件中没有工作表');
    }
    return parseSheet(firstSheet);
  }

  return parseSheet(sheet);
}

function parseSheet(sheet: ExcelJS.Worksheet): any[] {
  const streamers: any[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < DATA_START_ROW_NUMBER) return;

    const values = row.values as any[];
    const streamerTypeStr = extractCellValue(values[COLUMN_INDEX.STREAMER_TYPE]);
    const nickname = extractCellValue(values[COLUMN_INDEX.NICKNAME]);
    const posterUrl = extractCellValue(values[COLUMN_INDEX.POSTER_URL]);
    const liveRoom = extractCellValue(values[COLUMN_INDEX.LIVE_ROOM]);
    const bio = extractCellValue(values[COLUMN_INDEX.BIO]);

    if (!nickname && !streamerTypeStr) {
      return;
    }

    const streamerType = parseStreamerType(streamerTypeStr);

    streamers.push({
      rowIndex: rowNumber,
      nickname,
      streamerType: streamerType || 'internal',
      posterUrl,
      liveUrl: parseLiveUrl(liveRoom),
      bio,
    });
  });

  return streamers;
}

export async function validateExcelHeaders(
  filePath: string,
): Promise<{ valid: boolean; missingHeaders: string[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { valid: false, missingHeaders: ['工作表'] };
  }

  const headerRow = sheet.getRow(HEADER_ROW_NUMBER);
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

export async function getExcelRowCount(filePath: string): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return 0;
  }

  let count = 0;
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber >= DATA_START_ROW_NUMBER) {
      const values = row.values as any[];
      const nickname = extractCellValue(values[COLUMN_INDEX.NICKNAME]);
      if (nickname) {
        count++;
      }
    }
  });

  return count;
}
