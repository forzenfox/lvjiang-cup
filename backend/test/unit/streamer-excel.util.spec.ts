import {
  parseLiveUrl,
  parseStreamerType,
  extractCellValue,
  validateExcelHeaders,
  getExcelRowCount,
  STREAMER_TYPE_MAP,
  SHEET_NAME,
  HEADER_ROW_NUMBER,
  DATA_START_ROW_NUMBER,
} from '../../src/modules/streamers/utils/streamer-excel.util';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as os from 'os';

describe('streamer-excel.util', () => {
  describe('parseLiveUrl', () => {
    it('纯数字应拼接为斗鱼完整URL', () => {
      expect(parseLiveUrl('138243')).toBe('https://www.douyu.com/138243');
      expect(parseLiveUrl('1126960')).toBe('https://www.douyu.com/1126960');
    });

    it('已包含协议头的完整URL应保持原样', () => {
      expect(parseLiveUrl('https://www.douyu.com/138243')).toBe('https://www.douyu.com/138243');
      expect(parseLiveUrl('http://www.douyu.com/138243')).toBe('http://www.douyu.com/138243');
    });

    it('以 www.douyu.com/ 开头的URL应保持原样', () => {
      expect(parseLiveUrl('www.douyu.com/138243')).toBe('www.douyu.com/138243');
    });

    it('空值或null应返回空字符串', () => {
      expect(parseLiveUrl('')).toBe('');
      expect(parseLiveUrl(null as any)).toBe('');
      expect(parseLiveUrl(undefined as any)).toBe('');
    });

    it('其他格式应保持原样', () => {
      expect(parseLiveUrl('some-random-string')).toBe('some-random-string');
    });
  });

  describe('parseStreamerType', () => {
    it('驴酱主播应映射为 internal', () => {
      expect(parseStreamerType('驴酱主播')).toBe('internal');
    });

    it('嘉宾主播应映射为 guest', () => {
      expect(parseStreamerType('嘉宾主播')).toBe('guest');
    });

    it('包含空格的值应能正确映射', () => {
      expect(parseStreamerType(' 驴酱主播 ')).toBe('internal');
      expect(parseStreamerType(' 嘉宾主播 ')).toBe('guest');
    });

    it('无效值应返回 null', () => {
      expect(parseStreamerType('无效类型')).toBeNull();
      expect(parseStreamerType('')).toBeNull();
      expect(parseStreamerType(null as any)).toBeNull();
    });
  });

  describe('extractCellValue', () => {
    it('应处理字符串值', () => {
      expect(extractCellValue('test')).toBe('test');
      expect(extractCellValue(' test ')).toBe('test');
    });

    it('应处理超链接对象', () => {
      expect(extractCellValue({ hyperlink: { target: 'https://example.com' } })).toBe(
        'https://example.com',
      );
    });

    it('应处理富文本对象', () => {
      expect(extractCellValue({ text: 'rich text' })).toBe('rich text');
    });

    it('应处理数字值', () => {
      expect(extractCellValue(123)).toBe('123');
    });

    it('null和undefined应返回空字符串', () => {
      expect(extractCellValue(null)).toBe('');
      expect(extractCellValue(undefined)).toBe('');
    });
  });

  describe('validateExcelHeaders', () => {
    let testFilePath: string;

    beforeEach(() => {
      testFilePath = path.join(os.tmpdir(), `test-streamer-headers-${Date.now()}.xlsx`);
    });

    afterEach(async () => {
      try {
        const fs = await import('fs');
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      } catch {}
    });

    it('正确列头应返回 valid=true', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(SHEET_NAME);
      // 模拟真实模板结构：第1行标题，第2行说明，第3行表头（含序号列）
      sheet.getCell(1, 1).value = '主播信息导入模板';
      sheet.getCell(2, 1).value = '说明：每行对应一个主播，请按顺序填写。';
      // 表头：序号、主播类型、主播昵称、海报URL、直播间号、个人简介
      sheet.getCell(HEADER_ROW_NUMBER, 1).value = '序号';
      sheet.getCell(HEADER_ROW_NUMBER, 2).value = '主播类型';
      sheet.getCell(HEADER_ROW_NUMBER, 3).value = '主播昵称';
      sheet.getCell(HEADER_ROW_NUMBER, 4).value = '海报URL';
      sheet.getCell(HEADER_ROW_NUMBER, 5).value = '直播间号';
      sheet.getCell(HEADER_ROW_NUMBER, 6).value = '个人简介';
      await workbook.xlsx.writeFile(testFilePath);

      const result = await validateExcelHeaders(testFilePath);
      expect(result.valid).toBe(true);
      expect(result.missingHeaders).toHaveLength(0);
    });

    it('缺少列头应返回 valid=false 和缺失列表', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(SHEET_NAME);
      // 模拟真实模板结构：第1行标题，第2行说明，第3行表头（缺少部分列）
      sheet.getCell(1, 1).value = '主播信息导入模板';
      sheet.getCell(2, 1).value = '说明：每行对应一个主播，请按顺序填写。';
      sheet.getCell(HEADER_ROW_NUMBER, 1).value = '序号';
      sheet.getCell(HEADER_ROW_NUMBER, 2).value = '主播类型';
      sheet.getCell(HEADER_ROW_NUMBER, 3).value = '主播昵称';
      await workbook.xlsx.writeFile(testFilePath);

      const result = await validateExcelHeaders(testFilePath);
      expect(result.valid).toBe(false);
      expect(result.missingHeaders).toContain('海报URL');
      expect(result.missingHeaders).toContain('直播间号');
      expect(result.missingHeaders).toContain('个人简介');
    });

    it('无工作表应返回 valid=false', async () => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.writeFile(testFilePath);

      const result = await validateExcelHeaders(testFilePath);
      expect(result.valid).toBe(false);
      expect(result.missingHeaders).toContain('工作表');
    });
  });

  describe('getExcelRowCount', () => {
    let testFilePath: string;

    beforeEach(() => {
      testFilePath = path.join(os.tmpdir(), `test-streamer-rowcount-${Date.now()}.xlsx`);
    });

    afterEach(async () => {
      try {
        const fs = await import('fs');
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      } catch {}
    });

    it('应返回有效数据行数（不含表头）', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(SHEET_NAME);
      // 模拟真实模板结构：第1行标题，第2行说明，第3行表头，第4行起数据
      // 列结构：序号、主播类型、主播昵称、海报URL、直播间号、个人简介
      sheet.getCell(1, 1).value = '主播信息导入模板';
      sheet.getCell(2, 1).value = '说明：每行对应一个主播，请按顺序填写。';
      sheet.getCell(HEADER_ROW_NUMBER, 1).value = '序号';
      sheet.getCell(HEADER_ROW_NUMBER, 2).value = '主播类型';
      sheet.getCell(HEADER_ROW_NUMBER, 3).value = '主播昵称';
      sheet.getCell(HEADER_ROW_NUMBER, 4).value = '海报URL';
      sheet.getCell(HEADER_ROW_NUMBER, 5).value = '直播间号';
      sheet.getCell(HEADER_ROW_NUMBER, 6).value = '个人简介';
      // 数据行
      sheet.getCell(DATA_START_ROW_NUMBER, 1).value = 1;
      sheet.getCell(DATA_START_ROW_NUMBER, 2).value = '驴酱主播';
      sheet.getCell(DATA_START_ROW_NUMBER, 3).value = '主播1';
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 1).value = 2;
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 2).value = '嘉宾主播';
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 3).value = '主播2';
      await workbook.xlsx.writeFile(testFilePath);

      const count = await getExcelRowCount(testFilePath);
      expect(count).toBe(2);
    });

    it('空文件应返回0', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(SHEET_NAME);
      // 模拟真实模板结构：第1行标题，第2行说明，第3行表头
      sheet.getCell(1, 1).value = '主播信息导入模板';
      sheet.getCell(2, 1).value = '说明：每行对应一个主播，请按顺序填写。';
      sheet.getCell(HEADER_ROW_NUMBER, 1).value = '序号';
      sheet.getCell(HEADER_ROW_NUMBER, 2).value = '主播类型';
      sheet.getCell(HEADER_ROW_NUMBER, 3).value = '主播昵称';
      sheet.getCell(HEADER_ROW_NUMBER, 4).value = '海报URL';
      sheet.getCell(HEADER_ROW_NUMBER, 5).value = '直播间号';
      sheet.getCell(HEADER_ROW_NUMBER, 6).value = '个人简介';
      await workbook.xlsx.writeFile(testFilePath);

      const count = await getExcelRowCount(testFilePath);
      expect(count).toBe(0);
    });
  });

  describe('STREAMER_TYPE_MAP', () => {
    it('应包含正确的映射关系', () => {
      expect(STREAMER_TYPE_MAP['驴酱主播']).toBe('internal');
      expect(STREAMER_TYPE_MAP['嘉宾主播']).toBe('guest');
    });
  });
});
