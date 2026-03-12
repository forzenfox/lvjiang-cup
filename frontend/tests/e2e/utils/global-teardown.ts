// import { FullConfig } from '@playwright/test';

/**
 * 全局清理 - 测试结束后执行
 * 用于清理测试数据、关闭资源等
 */
async function globalTeardown() {
  console.log('🧹 开始全局清理...');
  
  // 可以在这里执行全局清理操作
  // 例如：清理测试数据、关闭数据库连接等
  
  console.log('✅ 全局清理完成');
}

export default globalTeardown;
