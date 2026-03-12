import { Page, expect } from '@playwright/test';

/**
 * 测试辅助函数
 */

/**
 * 等待页面加载完成
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * 模拟网络延迟
 */
export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 截图并保存
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `./tests/e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  });
}

/**
 * 检查元素是否存在
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = await page.locator(selector).first();
  return await element.isVisible().catch(() => false);
}

/**
 * 安全点击（等待元素可见后点击）
 */
export async function safeClick(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  await element.click();
}

/**
 * 安全填充（等待元素可见后填充）
 */
export async function safeFill(page: Page, selector: string, value: string) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  await element.fill(value);
}

/**
 * 验证Toast消息
 */
export async function expectToast(page: Page, message: string) {
  const toast = page.locator('[role="alert"]').filter({ hasText: message });
  await expect(toast).toBeVisible();
}
