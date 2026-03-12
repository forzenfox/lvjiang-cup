import { test, expect } from '@playwright/test';

test.describe('晋级名单管理下拉框交互', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/swiss');
    await page.waitForSelector('text=晋级名单管理');
  });

  test('点击分类标签后下拉框应正确显示和关闭', async ({ page }) => {
    const badge2_0 = page.locator('text=2-0 晋级 (胜者组)');
    await badge2_0.click();

    const dropdown = page.locator('select');
    await expect(dropdown).toBeVisible();

    await page.locator('text=晋级名单管理').click();

    await expect(dropdown).not.toBeVisible();
  });

  test('选择队伍后下拉框应关闭并添加队伍', async ({ page }) => {
    const badge2_1 = page.locator('text=2-1 晋级 (胜者组)');
    await badge2_1.click();

    const dropdown = page.locator('select');
    await dropdown.selectOption({ index: 1 });
    await page.locator('text=晋级名单管理').click();

    await expect(dropdown).not.toBeVisible();

    const teamList = page.locator('.flex.flex-col.gap-1\.5.mt-2');
    await expect(teamList).toBeVisible();
  });

  test('快速切换不同分类标签应正确显示对应下拉框', async ({ page }) => {
    await page.locator('text=2-0 晋级 (胜者组)').click();
    await page.locator('text=2-1 晋级 (胜者组)').click();

    const dropdowns = page.locator('select');
    await expect(dropdowns).toHaveCount(1);
  });

  test('从列表移除队伍后应可以重新添加', async ({ page }) => {
    await page.locator('text=0-3 淘汰').click();
    const dropdown = page.locator('select');
    await dropdown.selectOption({ index: 1 });
    await page.locator('text=晋级名单管理').click();

    const removeButton = page.locator('button:has-text("×")').first();
    await removeButton.click();

    await page.locator('text=0-3 淘汰').click();
    await expect(dropdown).toBeVisible();
  });
});
