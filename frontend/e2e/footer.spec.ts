import { test, expect } from '@playwright/test';

test.describe('页脚 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('社交媒体链接正确跳转', async ({ page }) => {
    const bilibiliLink = page.getByText('胡凯利_洞主').first();

    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      bilibiliLink.click(),
    ]);

    await expect(newPage).toHaveURL('https://space.bilibili.com/393671271');
  });

  test('微信公众号悬停显示二维码', async ({ page }) => {
    const wechatText = page.getByText('微信公众号：驴驴电竞');

    // 默认不显示
    await expect(page.getByAltText('微信公众号二维码')).not.toBeVisible();

    // 悬停显示
    await wechatText.hover();
    await expect(page.getByAltText('微信公众号二维码')).toBeVisible();
  });

  test('移动端不显示页脚', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    await expect(page.getByRole('contentinfo')).not.toBeVisible();
  });

  test('页脚显示正确的备案号', async ({ page }) => {
    await expect(page.getByText('鄂 ICP 备 2026017374 号 -1')).toBeVisible();
  });

  test('页脚显示正确的邮箱', async ({ page }) => {
    await expect(page.getByText(/lvjiangshangwu@163.com/)).toBeVisible();
  });
});
