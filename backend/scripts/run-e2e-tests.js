const { execSync } = require('child_process');

// 设置编码（Windows 专用
if (process.platform === 'win32') {
  try {
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch (e) {
    // 忽略错误
  }
}

// 运行 Jest
const args = process.argv.slice(2).join(' ');
const command = `npx jest --config ./test/jest-e2e.json ${args}`;

console.log('🎯 运行 E2E 测试...\n');

try {
  execSync(command, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-warnings'
    }
  });
} catch (error) {
  process.exit(1);
}
