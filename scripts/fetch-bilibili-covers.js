const fs = require('fs');
const path = require('path');
const https = require('https');

const VIDEOS_PATH = path.resolve(__dirname, '..', 'frontend', 'src', 'data', 's2-videos.json');
const IMAGES_DIR = path.resolve(__dirname, '..', 'frontend', 'public', 'images', 'video-covers');
const BILIBILI_API = 'https://api.bilibili.com/x/web-interface/view?bvid=';

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function fetchCover(bvid) {
  const url = `${BILIBILI_API}${bvid}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.bilibili.com/',
    },
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (data.code !== 0 || !data.data?.pic) return null;
  return data.data.pic;
}

async function main() {
  if (!fs.existsSync(VIDEOS_PATH)) {
    console.error('❌ 视频数据文件不存在:', VIDEOS_PATH);
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const videos = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf-8'));
  console.log(`共 ${videos.length} 个视频，开始获取封面...\n`);

  let success = 0;
  for (const video of videos) {
    // 从 cover_url 提取文件名
    const filename = path.basename(video.cover_url);
    const localPath = path.join(IMAGES_DIR, filename);

    if (fs.existsSync(localPath)) {
      console.log(`  ⏭️  ${filename} 已存在，跳过`);
      success++;
      continue;
    }

    const coverUrl = await fetchCover(video.bvid);
    if (!coverUrl) {
      console.error(`  ❌ ${video.bvid}: 获取封面失败`);
      continue;
    }

    // 使用 HTTPS 版本
    const httpsUrl = coverUrl.replace('http://', 'https://');
    try {
      await downloadImage(httpsUrl, localPath);
      console.log(`  ✅ ${filename} 已下载`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${filename}: 下载失败 - ${err.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n完成！成功下载 ${success}/${videos.length} 个封面`);
  console.log(`  图片存放路径: ${IMAGES_DIR}`);
}

main().catch(console.error);