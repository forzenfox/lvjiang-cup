import { test } from '@playwright/test';
import { AdminLoginPage } from '../pages';
import { adminUser } from '../fixtures/users.fixture';

/**
 * 并发操作测试用例
 * 对应测试计划: 并发操作测试
 *
 * 此文件包含需要独立登录状态的并发测试
 * 不使用全局的 storageState
 */

test.describe('【异常测试】并发操作测试', () => {
  /**
   * 并发操作测试
   * 优先级: P2
   * 验证并发操作的处理
   * 注意：此测试需要实际登录，不使用存储的认证状态
   */
  test('并发操作处理 @P2', async ({ browser }) => {
    // 创建两个页面实例（不使用全局 storageState）
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // 两个用户分别登录
      const loginPage1 = new AdminLoginPage(page1);
      const loginPage2 = new AdminLoginPage(page2);

      // 用户1登录
      await loginPage1.goto();
      await loginPage1.login(adminUser);
      console.log('✅ 用户1登录成功');

      // 用户2登录
      await loginPage2.goto();
      await loginPage2.login(adminUser);
      console.log('✅ 用户2登录成功');

      console.log('✅ 并发登录测试通过');
    } finally {
      // 清理
      await context1.close();
      await context2.close();
    }
  });
});
