/**
 * S2 赛季数据导出脚本
 * 从 SQLite 数据库导出所有赛季相关数据为 JSON 文件
 * 使用方法：node scripts/export-s2-data.js
 */

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// 数据库路径（相对于项目根目录）
const DB_PATH = path.resolve(__dirname, "..", "backend", "data", "lvjiang.db");
// 输出目录（相对于项目根目录）
const OUTPUT_DIR = path.resolve(__dirname, "..", "frontend", "src", "data");
// sqlite3.exe 缓存目录（避免重复下载）
const SQLITE_DIR = path.resolve(__dirname, "..", ".sqlite-tools");
const SQLITE_EXE = path.join(SQLITE_DIR, "sqlite3.exe");
const SQLITE_TOOLS_URL =
  "https://www.sqlite.org/2026/sqlite-tools-win-x64-3530200.zip";

// 定义要导出的表及其对应的文件名映射
const TABLE_CONFIG = [
  { name: "teams", filename: "s2-teams.json" },
  { name: "team_members", filename: "s2-team-members.json" },
  { name: "matches", filename: "s2-matches.json" },
  { name: "match_games", filename: "s2-match-games.json" },
  { name: "player_match_stats", filename: "s2-player-stats.json" },
  { name: "stream_info", filename: "s2-stream.json" },
  { name: "streamers", filename: "s2-streamers.json" },
  { name: "videos", filename: "s2-videos.json" },
];

/**
 * 从 URL 下载文件
 * 使用 curl.exe（Windows 10/11 内置）以绕过代理/TLS 问题
 * @param {string} url - 下载 URL
 * @param {string} dest - 保存路径
 * @returns {Promise<void>}
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    try {
      execSync(`curl.exe -sL -o "${dest}" "${url}"`, {
        stdio: "inherit",
        timeout: 60000,
      });
      resolve();
    } catch (err) {
      reject(new Error(`下载失败：${err.message}`));
    }
  });
}

/**
 * 下载并解压 sqlite3.exe（如未缓存）
 */
async function ensureSqlite3() {
  if (fs.existsSync(SQLITE_EXE)) {
    console.log(`  ✓ 使用缓存的 sqlite3.exe`);
    return;
  }

  console.log(`  → 正在下载 sqlite3 命令行工具...`);
  if (!fs.existsSync(SQLITE_DIR)) {
    fs.mkdirSync(SQLITE_DIR, { recursive: true });
  }

  const zipPath = path.join(SQLITE_DIR, "sqlite-tools.zip");
  await downloadFile(SQLITE_TOOLS_URL, zipPath);

  // 使用 PowerShell 的 Expand-Archive 解压 zip
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${SQLITE_DIR}' -Force"`,
    { stdio: "inherit" },
  );

  // 解压后 sqlite3.exe 在子目录中，移到上层
  const extractedDir = fs
    .readdirSync(SQLITE_DIR)
    .find((f) => f.startsWith("sqlite-tools"));
  if (extractedDir) {
    const exeInSubdir = path.join(SQLITE_DIR, extractedDir, "sqlite3.exe");
    if (fs.existsSync(exeInSubdir)) {
      fs.renameSync(exeInSubdir, SQLITE_EXE);
    }
    // 清理
    fs.rmSync(path.join(SQLITE_DIR, extractedDir), { recursive: true });
  }

  // 清理 zip 文件
  try {
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  } catch {
    // 忽略清理错误
  }

  if (!fs.existsSync(SQLITE_EXE)) {
    throw new Error("sqlite3.exe 解压失败");
  }
  console.log(`  ✓ sqlite3.exe 下载完成`);
}

/**
 * 检查并执行 WAL checkpoint，确保数据完整
 */
async function checkpointWal() {
  const walPath = DB_PATH + "-wal";
  const shmPath = DB_PATH + "-shm";

  if (!fs.existsSync(walPath)) {
    // 没有 WAL 文件，无需 checkpoint
    return;
  }

  const walSize = fs.statSync(walPath).size;
  if (walSize === 0) {
    // WAL 文件为空
    return;
  }

  console.log(
    `\n检测到 WAL 文件 (${(walSize / 1024).toFixed(1)} KB)，执行 checkpoint...`,
  );

  await ensureSqlite3();

  // 执行 WAL checkpoint
  execSync(`"${SQLITE_EXE}" "${DB_PATH}" "PRAGMA wal_checkpoint(TRUNCATE);"`, {
    stdio: "inherit",
    timeout: 30000,
  });

  // 验证 checkpoint 是否成功
  const walSizeAfter = fs.existsSync(walPath) ? fs.statSync(walPath).size : 0;
  console.log(`  ✓ WAL checkpoint 完成 (WAL 大小: ${walSizeAfter} 字节)`);

  // 如果 WAL 已被截断，清理残留文件
  if (walSizeAfter === 0) {
    try {
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
    } catch {
      // 忽略清理错误
    }
  }
}

async function main() {
  // 检查数据库文件是否存在
  if (!fs.existsSync(DB_PATH)) {
    console.error(`错误：数据库文件不存在：${DB_PATH}`);
    process.exit(1);
  }

  // 确保输出目录存在，不存在则自动创建
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`已创建输出目录：${OUTPUT_DIR}`);
  }

  let db;
  try {
    // 先执行 WAL checkpoint，确保数据完整
    await checkpointWal();

    // 使用 sql.js 连接 SQLite 数据库
    const initSqlJs = require("sql.js");
    const SQL = await initSqlJs();
    const fs = require("fs");

    // 读取数据库文件
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);

    console.log(`成功连接数据库：${DB_PATH}\n`);

    // 记录统计信息
    const stats = {};

    // 遍历导出每张表
    for (const config of TABLE_CONFIG) {
      const { name: tableName, filename } = config;
      const outputPath = path.join(OUTPUT_DIR, filename);

      // 查询所有数据
      const stmt = db.prepare(`SELECT * FROM \`${tableName}\``);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      const count = rows.length;

      // 写入 JSON 文件
      fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), "utf-8");

      stats[tableName] = count;
      console.log(`  ✓ ${filename} (${count} 条记录)`);
    }

    // 打印统计信息
    console.log("\n导出完成！统计信息：");
    console.log("━".repeat(40));
    for (const [table, count] of Object.entries(stats)) {
      const label = table.padEnd(20);
      console.log(`  ${label} ${count} 条`);
    }
    console.log("━".repeat(40));

    const total = Object.values(stats).reduce((sum, c) => sum + c, 0);
    console.log(`  总计                 ${total} 条`);
  } catch (err) {
    console.error(`错误：导出过程中发生异常 - ${err.message}`);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

main();
