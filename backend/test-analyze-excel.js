const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', '驴酱杯对战信息_驴酱_vs_PLG_BO5.xlsx');

console.log('========== 深度解析Excel文件，定位undefined[0]错误 ==========');
console.log('文件路径:', filePath, '\n');

const workbook = xlsx.read(filePath, { type: 'file' });

console.log('工作表数量:', workbook.SheetNames.length);
console.log('工作表名称:', workbook.SheetNames.join(', '), '\n');

workbook.SheetNames.forEach((sheetName, index) => {
  console.log('========== Sheet ' + (index + 1) + ': ' + sheetName + ' ==========');

  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

  console.log('总行数:', jsonData.length);

  // 检查每一行的长度
  jsonData.forEach((row, rowIndex) => {
    if (!row) {
      console.log(`第${rowIndex + 1}行: UNDEFINED! 这将导致 undefined[0] 错误!`);
    } else {
      console.log(
        `第${rowIndex + 1}行: 列数=${row.length}, 数据=${JSON.stringify(row).substring(0, 200)}`,
      );
    }
  });

  // 模拟 parseSheetData 的访问模式，检查是否会触发 undefined[0]
  console.log('\n模拟 parseSheetData 访问模式:');
  console.log('  sheetData[1] (MatchInfo行):', jsonData[1] ? '存在' : 'UNDEFINED!');
  console.log('  sheetData[3] (TeamStats行1):', jsonData[3] ? '存在' : 'UNDEFINED!');
  console.log('  sheetData[4] (TeamStats行2):', jsonData[4] ? '存在' : 'UNDEFINED!');

  for (let i = 6; i <= 15; i++) {
    if (!jsonData[i]) {
      console.log(
        `  sheetData[${i}] (PlayerStats行${i - 5}): UNDEFINED! 将导致 undefined[0] 错误!`,
      );
    }
  }

  console.log('  sheetData[16] (BAN headers):', jsonData[16] ? '存在' : 'UNDEFINED!');
  console.log('  sheetData[17] (BAN data):', jsonData[17] ? '存在' : 'UNDEFINED!');

  console.log('\n');
});
