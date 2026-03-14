import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始全局设置...');
  
  try {
    await clearBackendData();
    
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const baseURL = config.webServer?.url || 'http://localhost:5173';
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    
    await page.evaluate(() => {
      const keysToClear = [
        'lvjiang-cup-cache',
        'token',
        'user',
        'auth-token',
        'teams',
        'matches',
        'streams',
        'advancement',
        'test-data',
        'e2e-data'
      ];
      
      keysToClear.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('test-') || key.startsWith('e2e-')) {
          localStorage.removeItem(key);
        }
      });
      
      sessionStorage.clear();
    });
    
    await context.clearCookies();
    await browser.close();
    
    console.log('✅ 全局设置完成');
  } catch (error) {
    console.error('❌ 全局设置失败:', error);
  }
}

async function clearBackendData() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  try {
    const loginResponse = await fetch(`${backendUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUsername, password: adminPassword }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`登录失败：${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data?.access_token;
    
    if (!token) {
      throw new Error('未获取到 access_token');
    }
    
    const clearResponse = await fetch(`${backendUrl}/api/admin/data`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (clearResponse.ok) {
      console.log('✅ 后端数据库数据已清空');
    } else if (clearResponse.status === 404) {
      console.log('⚠️ 清空数据 API 不存在');
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        console.error('🔴 无法连接到后端服务');
      } else {
        console.error('❌ 清空后端数据失败:', error.message);
      }
    }
  }
}

export default globalSetup;
