const https = require('https');
const http = require('http');

const BILIBILI_API_BASE = 'https://api.bilibili.com/x/web-interface/view';

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Origin': 'https://www.bilibili.com',
        ...headers,
      },
    };

    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ data, statusCode: res.statusCode, headers: res.headers, responseTime: Date.now() - startTime });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

async function testBilibiliAPI(bvid) {
  console.log(`\n🔍 Testing BVID: ${bvid}`);
  console.log(`   API URL: ${BILIBILI_API_BASE}?bvid=${bvid}`);

  try {
    const response = await httpGet(`${BILIBILI_API_BASE}?bvid=${bvid}`);
    const data = JSON.parse(response.data);

    console.log(`   ⏱️  Response Time: ${response.responseTime}ms`);
    console.log(`   📊 Response Code: ${data.code}`);
    console.log(`   📝 Message: ${data.message}`);

    if (data.code === 0 && data.data) {
      const v = data.data;
      console.log(`   ✅ Success!`);
      console.log(`   📺 Title: ${v.title}`);
      console.log(`   🖼️  Cover URL: ${v.pic}`);
      console.log(`   👤 Uploader: ${v.owner.name}`);
      console.log(`   🔗 Embedable: ${v.embedable === 1 ? 'Yes' : 'No'}`);
      console.log(`   📁 Pages: ${v.pages?.length || 1}`);

      return { success: true, bvid: v.bvid, title: v.title, coverUrl: v.pic, embedable: v.embedable === 1, responseTime: response.responseTime };
    } else {
      console.log(`   ❌ API Error: ${data.message}`);
      return { success: false, bvid, error: data.message, responseTime: response.responseTime };
    }
  } catch (error) {
    console.log(`   ❌ Request Failed: ${error.message}`);
    return { success: false, bvid, error: error.message };
  }
}

async function testCoverCORS(coverUrl) {
  console.log(`\n🌐 Testing Cover: ${coverUrl}`);
  try {
    const response = await httpGet(coverUrl);
    console.log(`   ✅ Accessible`);
    console.log(`   📦 Content-Type: ${response.headers['content-type']}`);
    console.log(`   📏 Content-Length: ${response.headers['content-length'] || 'unknown'}`);
    return { url: coverUrl, accessible: true, contentType: response.headers['content-type'] };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { url: coverUrl, accessible: false, error: error.message };
  }
}

function extractBvid(url) {
  const patterns = [
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)\?p=(\d+)/,
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)\//,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return { bvid: match[1], page: match[2] ? parseInt(match[2]) : 1 };
  }
  return { bvid: null, page: 1 };
}

async function runTests() {
  console.log('========================================');
  console.log('   B站API元信息获取可行性调研');
  console.log('========================================');
  console.log(`\n🕐 Time: ${new Date().toLocaleString()}`);

  const testBvids = ['BV1xx411c7mD', 'BV1GJ411x7h7', 'BV1uu4y1i7AM'];
  const testUrls = [
    'https://www.bilibili.com/video/BV1xx411c7mD',
    'https://www.bilibili.com/video/BV1GJ411x7h7?p=2',
    'https://www.bilibili.com/video/BV1uu4y1i7AM/',
  ];

  console.log('\n========================================');
  console.log('   Part 1: 直接BV号测试');
  console.log('========================================');

  const apiResults = [];
  for (const bvid of testBvids) {
    const result = await testBilibiliAPI(bvid);
    apiResults.push(result);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n========================================');
  console.log('   Part 2: URL提取测试');
  console.log('========================================');

  for (const url of testUrls) {
    const { bvid, page } = extractBvid(url);
    console.log(`\n🔗 URL: ${url}`);
    console.log(`   📌 Extracted BVID: ${bvid || 'None'}, Page: ${page}`);
  }

  console.log('\n========================================');
  console.log('   Part 3: 封面CORS测试');
  console.log('========================================');

  const coverResults = [];
  for (const result of apiResults.filter(r => r.success && r.coverUrl)) {
    const coverResult = await testCoverCORS(result.coverUrl);
    coverResults.push(coverResult);
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n========================================');
  console.log('   结果汇总');
  console.log('========================================');

  const successCount = apiResults.filter(r => r.success).length;
  const embedableCount = apiResults.filter(r => r.success && r.embedable).length;
  const avgTime = apiResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / apiResults.length;
  const coverAccessible = coverResults.filter(r => r.accessible).length;

  console.log(`\n📊 API测试: ${successCount}/${apiResults.length} 成功, ${embedableCount} 可嵌入, 平均${avgTime.toFixed(0)}ms`);
  console.log(`📊 封面测试: ${coverAccessible}/${coverResults.length} 可访问`);

  console.log('\n📋 详细:');
  apiResults.forEach((r, i) => {
    const status = r.success ? `✅ [嵌入:${r.embedable ? '是' : '否'}] ${r.title}` : `❌ ${r.error}`;
    console.log(`   ${i+1}. ${r.bvid} - ${status}`);
  });

  console.log('\n========================================');
  console.log('   结论');
  console.log('========================================');

  if (successCount === apiResults.length) {
    console.log('\n✅ B站API完全可行');
    console.log('   - 可获取标题、封面、UP主信息');
    console.log('   - embedable字段可判断是否可嵌入');
  }

  console.log('\n💡 建议:');
  console.log('   1. 添加缓存（1小时）');
  console.log('   2. 封面跨域通过后端代理解决');
  console.log('   3. 保留手动输入标题/封面的降级方案');
}

runTests().catch(console.error);
