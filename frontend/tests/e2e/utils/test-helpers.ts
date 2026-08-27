import { Page, expect } from '@playwright/test';

// Re-export all assertion utilities from assertions.ts
export {
  expectVisible,
  expectExists,
  expectTextContains,
  expectIfPresent,
  expectCount,
  expectCountInRange,
  expectUrlContains,
  expectState,
} from './assertions';

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
    fullPage: true,
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

/**
 * 退出首页 StartBox 全屏封面
 *
 * StartBox（`fixed inset-0` + `zIndex COVER`）只在 wheel/触摸/点击/按键时退出。
 * Playwright 点击/悬停会被遮罩拦截，因此所有需要与首页交互的用例在操作前必须先退出封面。
 * 通过派发 wheel 事件触发 window 上的退出监听，无需穿透遮罩。
 * @param page  Playwright Page 实例
 * @param force 即使检测不到封面也强制派发一次 wheel（用于封面已隐藏但仍需滚动的场景）
 */
export async function dismissStartBox(page: Page, force = false): Promise<void> {
  const cover = page.locator('.start-box-cover').first();

  if (force || (await cover.isVisible().catch(() => false))) {
    // 派发 wheel（deltaY>0）触发 StartBox 的退出逻辑
    await page.mouse.wheel(0, 120);
    await page.mouse.wheel(0, 120);
    // 等待退出动画结束（ANIMATION_CONFIG.exitDuration = 900ms）
    await cover.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}

/**
 * 滚动首页以触发懒加载区块渲染
 *
 * 首页各分区由 IntersectionObserver 懒加载，未滚动到视口前（如「参赛战队」「赛程安排」）
 * 不会渲染到 DOM。此函数先返回顶部，再逐段向下滚动，确保懒加载区块被激活后回到顶部。
 * @param page Playwright Page 实例
 */
export async function activateLazySections(page: Page): Promise<void> {
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    const height = document.body.scrollHeight;
    const step = Math.max(200, Math.floor(height / 4));
    for (let y = 0; y <= height; y += step) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 150));
  });
}

/**
 * 准备首页（退出 StartBox 封面 + 滚动激活懒加载区块）
 * @param page Playwright Page 实例
 */
export async function prepareHome(page: Page): Promise<void> {
  await dismissStartBox(page);
  await activateLazySections(page);
}

/**
 * 清除当前上下文的认证状态（localStorage + cookies）
 * 用于「未授权访问」「未登录访问 API」等需要未登录态的用例，
 * 即使所在套件在 msedge 项目下携带了 storageState 也能正确模拟未登录。
 * @param page Playwright Page 实例
 */
export async function clearAuthState(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}
