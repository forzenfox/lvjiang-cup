import { test, expect, Page } from '@playwright/test';
import { prepareHome } from '../utils/test-helpers';

/**
 * 打开页脚抽屉
 * Footer 为抽屉式组件，默认收起，需要先 hover 到底部触发条（data-testid="footer-trigger"）
 * 展开后才能访问其中的社交链接 / 备案号 / 邮箱等内容。
 */
async function openFooter(page: Page) {
  // 底部提示条（「鼠标移到底部查看页脚」）与 footer-trigger 同处底部且层级更高，
  // 会拦截对 footer-trigger 的 hover；而提示条本身的 onMouseEnter 也会展开页脚，
  // 故优先 hover 提示条，提示条不可见（已交互过）时再强制 hover 触发条。
  const hint = page.locator('text=鼠标移到底部查看页脚');
  if (await hint.isVisible().catch(() => false)) {
    await hint.hover();
  } else {
    await page.locator('[data-testid="footer-trigger"]').hover({ force: true });
  }
  await page.locator('[data-testid="footer"]').waitFor({ state: 'visible', timeout: 5000 });
}

test.describe('页脚 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 退出 StartBox 全屏封面并滚动激活懒加载，
    // 否则封面（fixed inset-0 + 高 zIndex）会拦截底部触发条的 hover/点击。
    await prepareHome(page);
  });

  test('社交媒体链接正确跳转', async ({ page }) => {
    await openFooter(page);

    const bilibiliLink = page.getByRole('link', { name: '胡凯利_洞主' }).first();
    // 断言 <a> 的 href 属性即可，避免真正跳转外部站点导致外部资源不可达而 flaky。
    await expect(bilibiliLink).toHaveAttribute('href', 'https://space.bilibili.com/393671271');
  });

  test('微信公众号悬停显示二维码', async ({ page }) => {
    await openFooter(page);

    const wechatText = page.getByText('微信公众号：驴驴电竞');

    await expect(page.getByAltText('微信公众号二维码')).not.toBeVisible();

    await wechatText.hover();
    await expect(page.getByAltText('微信公众号二维码')).toBeVisible();
  });

  test('移动端不显示页脚', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    await expect(page.getByRole('contentinfo')).not.toBeVisible();
  });

  test('页脚显示正确的备案号', async ({ page }) => {
    await openFooter(page);
    await expect(page.getByText('鄂 ICP 备 2026017374 号 -1')).toBeVisible();
  });

  test('页脚显示正确的邮箱', async ({ page }) => {
    await openFooter(page);
    await expect(page.getByText(/lvjiangshangwu@163.com/)).toBeVisible();
  });
});
