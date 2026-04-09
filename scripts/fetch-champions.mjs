/**
 * 英雄数据获取脚本
 * 从 Riot Data Dragon API 获取最新英雄数据并输出为 JSON 文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION_API = 'https://ddragon.leagueoflegends.com/api/versions.json';
const CHAMPION_API_TEMPLATE = 'https://ddragon.leagueoflegends.com/cdn/{version}/data/zh_CN/champion.json';

const OUTPUT_PATH = path.resolve(__dirname, './lol-champion-map.json');

async function fetchLatestVersion() {
  console.log('📡 获取最新版本号...');
  const res = await fetch(VERSION_API);
  if (!res.ok) throw new Error(`获取版本失败: ${res.status}`);
  const versions = await res.json();
  return versions[0];
}

async function fetchChampions(version) {
  console.log(`📡 获取英雄数据 (版本: ${version})...`);
  const url = CHAMPION_API_TEMPLATE.replace('{version}', version);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`获取英雄数据失败: ${res.status}`);
  return res.json();
}

function transformData(data, version) {
  console.log('🔄 转换数据格式...');
  const champions = {};

  for (const [enName, champ] of Object.entries(data.data)) {
    champions[enName] = {
      enName: champ.id,
      cnName: champ.name,
      title: champ.title,
      tags: champ.tags || [],
      version
    };
  }

  return champions;
}

function writeOutput(champions) {
  console.log(`💾 写入文件: ${OUTPUT_PATH}`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(champions, null, 2));
  console.log(`✅ 成功写入 ${Object.keys(champions).length} 个英雄数据`);
}

async function main() {
  try {
    console.log('🚀 开始获取英雄数据...\n');

    const version = await fetchLatestVersion();
    console.log(`   最新版本: ${version}\n`);

    const data = await fetchChampions(version);
    const champions = transformData(data, version);

    writeOutput(champions);

    console.log('\n✨ 完成!');
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

main();
