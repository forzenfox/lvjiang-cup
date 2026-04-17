const ExcelJS = require('exceljs');

const POSITION_MAP = {
  '上单': 'TOP',
  '打野': 'JUNGLE',
  '中单': 'MID',
  'ADC': 'ADC',
  '辅助': 'SUPPORT',
};

function parsePosition(position) {
  const normalized = position?.trim();
  return POSITION_MAP[normalized] || null;
}

async function debug() {
  const filePath = 'D:/File/workSpace/AI-test/lvjiang-cup-test/frontend/tests/e2e/fixtures/test-import.xlsx';
  
  console.log('=== 解析 Excel 数据 ===\n');
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const sheet = workbook.getWorksheet('战队与队员信息导入');
  
  console.log(`Sheet 名称: ${sheet.name}`);
  console.log(`总行数: ${sheet.rowCount}\n`);
  
  console.log('前 10 行数据:');
  console.log('─'.repeat(80));
  
  for (let row = 4; row <= Math.min(13, sheet.rowCount); row++) {
    const rowData = [];
    for (let col = 1; col <= 13; col++) {
      const cell = sheet.getCell(row, col);
      rowData.push(cell.value || '');
    }
    
    const teamName = rowData[0];
    const position = rowData[3];
    const parsedPosition = parsePosition(position);
    const isCaptain = rowData[8];
    const championPool = rowData[10];
    
    console.log(`行 ${row}:`);
    console.log(`  战队名: "${teamName}"`);
    console.log(`  位置: "${position}" -> 解析为: "${parsedPosition}"`);
    console.log(`  队长: "${isCaptain}" -> 类型: ${typeof isCaptain}`);
    console.log(`  英雄: "${championPool}"`);
    console.log('');
  }
  
  console.log('=== 校验逻辑测试 ===\n');
  
  const validPositions = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const testPositions = ['上单', '打野', 'TOP', 'JUNGLE'];
  
  testPositions.forEach(pos => {
    const parsed = parsePosition(pos);
    const isValid = parsed && validPositions.includes(parsed);
    console.log(`"${pos}" -> 解析: "${parsed}" -> 校验: ${isValid ? '✅ 通过' : '❌ 失败'}`);
  });
}

debug().catch(err => {
  console.error('调试失败:', err.message);
  console.error(err.stack);
});
