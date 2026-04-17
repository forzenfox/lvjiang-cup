const path = require('path');

async function debug() {
  const filePath = 'D:/File/workSpace/AI-test/lvjiang-cup-test/frontend/tests/e2e/fixtures/test-import.xlsx';
  
  const { parseExcel } = require('./src/modules/teams/utils/excel.util');
  const { validateImportData } = require('./src/modules/teams/utils/validate-import.util');
  
  console.log('=== 解析 Excel 数据 ===\n');
  
  try {
    const teams = await parseExcel(filePath);
    
    console.log(`解析到 ${teams.length} 支战队\n`);
    
    teams.forEach((team, idx) => {
      console.log(`战队 ${idx + 1}: ${team.name}`);
      console.log(`  队员数量: ${team.members.length}`);
      team.members.forEach((member, mIdx) => {
        console.log(`  队员 ${mIdx + 1}:`);
        console.log(`    position: ${member.position} (type: ${typeof member.position})`);
        console.log(`    isCaptainStr: ${member.isCaptainStr} (type: ${typeof member.isCaptainStr})`);
        console.log(`    isCaptain: ${member.isCaptain} (type: ${typeof member.isCaptain})`);
        console.log(`    championPoolStr: ${member.championPoolStr}`);
      });
      console.log('');
    });
    
    console.log('=== 校验数据 ===\n');
    
    const { getExcelRowCount } = require('./src/modules/teams/utils/excel.util');
    const rowCount = await getExcelRowCount(filePath);
    
    console.log(`总行数: ${rowCount}`);
    
    const validationResult = validateImportData(teams, rowCount);
    
    if (validationResult.valid) {
      console.log('✅ 校验通过');
    } else {
      console.log(`❌ 校验失败，共 ${validationResult.errors.length} 个错误:\n`);
      validationResult.errors.forEach((err, idx) => {
        console.log(`错误 ${idx + 1}:`);
        console.log(`  行号: ${err.row}`);
        console.log(`  战队: ${err.teamName}`);
        console.log(`  位置: ${err.position}`);
        console.log(`  字段: ${err.field}`);
        console.log(`  错误: ${err.message}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('调试失败:', error.message);
    console.error(error.stack);
  }
}

debug();
