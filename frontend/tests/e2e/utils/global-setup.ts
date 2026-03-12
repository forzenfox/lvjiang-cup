// import type { FullConfig } from '@playwright/test';

/**
 * 全局设置 - 测试开始前执行
 * 用于准备测试环境、初始化数据等
 */
async function globalSetup() {
  console.log('🚀 开始全局设置...');
  
  // 可以在这里执行全局初始化操作
  // 例如：清理测试数据、准备测试账号等
  
  console.log('✅ 全局设置完成');
}

export default globalSetup;
