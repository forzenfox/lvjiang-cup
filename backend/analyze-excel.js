const ExcelJS = require('exceljs');
const path = require('path');

(async () => {
  const filePath = path.join('d:\\File\\workSpace\\AI-test\\lvjiang-cup-test', '驴酱杯_主播导入.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  console.log('工作表数量:', workbook.worksheets.length);

  workbook.worksheets.forEach((sheet, idx) => {
    console.log(`\n工作表 ${idx + 1}: ${sheet.name}`);
    console.log('前10行内容:');
    for (let row = 1; row <= 10; row++) {
      const rowValues = sheet.getRow(row).values;
      console.log(`  第${row}行:`, JSON.stringify(rowValues));
    }
  });
})();
