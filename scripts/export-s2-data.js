/**
 * S2 赛季数据导出脚本
 * 从 SQLite 数据库导出所有赛季相关数据为 JSON 文件
 * 使用方法: node scripts/export-s2-data.js
 */

const path = require('path');
const fs = require('fs');

// 数据库路径（相对于项目根目录）
const DB_PATH = path.resolve(__dirname, '..', 'backend', 'data', 'lvjiang-dev.db');
// 输出目录（相对于项目根目录）
const OUTPUT_DIR = path.resolve(__dirname, '..', 'frontend', 'src', 'data');

// 定义要导出的表及其对应的文件名映射
const TABLE_CONFIG = [
  { name: 'teams', filename: 's2-teams.json' },
  { name: 'team_members', filename: 's2-team-members.json' },
  { name: 'matches', filename: 's2-matches.json' },
  { name: 'match_games', filename: 's2-match-games.json' },
  { name: 'player_match_stats', filename: 's2-player-stats.json' },
  { name: 'stream_info', filename: 's2-stream.json' },
  { name: 'streamers', filename: 's2-streamers.json' },
  { name: 'videos', filename: 's2-videos.json' },
];

function main() {
  // 检查数据库文件是否存在
  if (!fs.existsSync(DB_PATH)) {
    console.error(`错误: 数据库文件不存在: ${DB_PATH}`);
    process.exit(1);
  }

  // 确保输出目录存在，不存在则自动创建
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`已创建输出目录: ${OUTPUT_DIR}`);
  }

  let db;
  try {
    // 连接 SQLite 数据库
    const Database = require('better-sqlite3');
    db = new Database(DB_PATH, { readonly: true });

    console.log(`成功连接数据库: ${DB_PATH}\n`);

    // 记录统计信息
    const stats = {};

    // 遍历导出每张表
    for (const config of TABLE_CONFIG) {
      const { name: tableName, filename } = config;
      const outputPath = path.join(OUTPUT_DIR, filename);

      // 查询所有数据
      const rows = db.prepare(`SELECT * FROM \`${tableName}\``).all();
      const count = rows.length;

      // 写入 JSON 文件
      fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf-8');

      stats[tableName] = count;
      console.log(`  ✓ ${filename} (${count} 条记录)`);
    }

    // 打印统计信息
    console.log('\n导出完成！统计信息：');
    console.log('━'.repeat(40));
    for (const [table, count] of Object.entries(stats)) {
      const label = table.padEnd(20);
      console.log(`  ${label} ${count} 条`);
    }
    console.log('━'.repeat(40));

    const total = Object.values(stats).reduce((sum, c) => sum + c, 0);
    console.log(`  总计                 ${total} 条`);
  } catch (err) {
    console.error(`错误: 导出过程中发生异常 - ${err.message}`);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

main();