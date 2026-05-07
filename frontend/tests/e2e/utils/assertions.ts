import { Page, expect } from '@playwright/test';

/**
 * E2E 测试断言工具库
 *
 * 设计目标：替代测试代码中广泛使用的 console.log + catch(() => false) 反模式，
 * 提供语义化、可组合、带有清晰错误信息的断言函数。
 *
 * 替代的反模式示例：
 *   const hasBtn = await page.locator('button').isVisible().catch(() => false);
 *   if (hasBtn) { await expect(...).toBeVisible(); }
 *   else { console.log('button not found'); test.skip(); }
 *
 * 使用本库后：
 *   await expectVisible(page, 'button', '操作按钮');
 */

// ---------------------------------------------------------------------------
// expectVisible
// ---------------------------------------------------------------------------

/**
 * 断言选择器对应的元素在当前视口中可见（visible = true, not hidden/collapsed）。
 *
 * 替代的反模式：
 *   const ok = await page.locator(sel).isVisible().catch(() => false);
 *   console.log(ok ? 'ok' : 'not found');
 *
 * @param page    Playwright Page 实例
 * @param selector CSS / data-testid 等选择器
 * @param message 可选的人类可读描述，会附加到断言错误信息中
 */
export async function expectVisible(
  page: Page,
  selector: string,
  message?: string,
): Promise<void> {
  const locator = page.locator(selector);
  const hint = message ? ` — ${message}` : '';
  await expect(locator.first(), `期望元素可见: ${selector}${hint}`).toBeVisible();
}

// ---------------------------------------------------------------------------
// expectExists
// ---------------------------------------------------------------------------

/**
 * 断言元素存在于 DOM 中（不要求可见，仅要求 attached）。
 * 适用于验证元素已被渲染但可能被 CSS 隐藏的场景。
 *
 * 替代的反模式：
 *   const count = await page.locator(sel).count();
 *   if (count === 0) console.log('element missing');
 *
 * @param page    Playwright Page 实例
 * @param selector CSS / data-testid 等选择器
 * @param message 可选的人类可读描述
 */
export async function expectExists(
  page: Page,
  selector: string,
  message?: string,
): Promise<void> {
  const locator = page.locator(selector);
  const hint = message ? ` — ${message}` : '';
  await expect(locator.first(), `期望元素存在于 DOM: ${selector}${hint}`).toBeAttached();
}

// ---------------------------------------------------------------------------
// expectTextContains
// ---------------------------------------------------------------------------

/**
 * 断言元素的文本内容包含指定字符串或匹配正则表达式。
 *
 * 替代的反模式：
 *   const text = await page.locator(sel).textContent();
 *   console.log(text?.includes('expected') ? 'ok' : 'mismatch');
 *
 * @param page    Playwright Page 实例
 * @param selector CSS / data-testid 等选择器
 * @param expected 期望包含的字符串或正则
 * @param message 可选的人类可读描述
 */
export async function expectTextContains(
  page: Page,
  selector: string,
  expected: string | RegExp,
  message?: string,
): Promise<void> {
  const locator = page.locator(selector);
  const hint = message ? ` — ${message}` : '';
  await expect(locator.first(), `期望文本包含 "${expected}": ${selector}${hint}`).toContainText(expected);
}

// ---------------------------------------------------------------------------
// expectIfPresent
// ---------------------------------------------------------------------------

/**
 * 条件断言：如果选择器对应的元素存在，则执行传入的 assertion 回调；
 * 否则返回 false（不会抛出错误）。适用于可选元素的验证场景。
 *
 * 替代的反模式：
 *   const found = await page.locator(sel).count().catch(() => 0);
 *   if (found > 0) { /* manual assertions *\/ }
 *   else { console.log('optional element not present, skipping'); }
 *
 * @param page          Playwright Page 实例
 * @param selector      CSS / data-testid 等选择器
 * @param assertion     当元素存在时执行的断言回调，接收 locator 参数
 * @param fallbackMessage 元素不存在时输出到控制台的信息（可选）
 * @returns assertion 回调的返回值；元素不存在时返回 false
 */
export async function expectIfPresent<T>(
  page: Page,
  selector: string,
  assertion: (locator: ReturnType<Page['locator']>) => Promise<T>,
  fallbackMessage?: string,
): Promise<boolean> {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count === 0) {
    if (fallbackMessage) {
      console.log(`⚠️ [expectIfPresent] ${fallbackMessage}`);
    }
    return false;
  }
  await assertion(locator);
  return true;
}

// ---------------------------------------------------------------------------
// expectCount
// ---------------------------------------------------------------------------

/**
 * 断言匹配选择器的元素数量等于期望值。
 *
 * 替代的反模式：
 *   const count = await page.locator(sel).count();
 *   console.log(count === expected ? 'ok' : `expected ${expected}, got ${count}`);
 *
 * @param page     Playwright Page 实例
 * @param selector CSS / data-testid 等选择器
 * @param expected 期望的元素数量
 * @param message  可选的人类可读描述
 */
export async function expectCount(
  page: Page,
  selector: string,
  expected: number,
  message?: string,
): Promise<void> {
  const locator = page.locator(selector);
  const hint = message ? ` — ${message}` : '';
  await expect(locator, `期望元素数量为 ${expected}: ${selector}${hint}`).toHaveCount(expected);
}

// ---------------------------------------------------------------------------
// expectCountInRange
// ---------------------------------------------------------------------------

/**
 * 断言匹配选择器的元素数量在 [min, max] 范围内（含边界）。
 * 适用于动态列表场景（如列表数量不固定但有上限/下限）。
 *
 * 替代的反模式：
 *   const count = await page.locator(sel).count();
 *   if (count >= min && count <= max) console.log('ok');
 *   else console.log(`count ${count} out of range [${min}, ${max}]`);
 *
 * @param page     Playwright Page 实例
 * @param selector CSS / data-testid 等选择器
 * @param min      最小数量（含）
 * @param max      最大数量（含）
 * @param message  可选的人类可读描述
 */
export async function expectCountInRange(
  page: Page,
  selector: string,
  min: number,
  max: number,
  message?: string,
): Promise<void> {
  const locator = page.locator(selector);
  const count = await locator.count();
  const hint = message ? ` — ${message}` : '';
  expect(
    count,
    `期望元素数量在 [${min}, ${max}] 范围内: ${selector}, 实际为 ${count}${hint}`,
  ).toBeGreaterThanOrEqual(min);
  expect(
    count,
    `期望元素数量在 [${min}, ${max}] 范围内: ${selector}, 实际为 ${count}${hint}`,
  ).toBeLessThanOrEqual(max);
}

// ---------------------------------------------------------------------------
// expectUrlContains
// ---------------------------------------------------------------------------

/**
 * 断言当前页面 URL 包含指定路径片段或匹配正则表达式。
 *
 * 替代的反模式：
 *   const url = page.url();
 *   console.log(url.includes(path) ? 'on correct page' : 'wrong page');
 *
 * @param page    Playwright Page 实例
 * @param path    期望包含的路径字符串或正则
 * @param message 可选的人类可读描述
 */
export async function expectUrlContains(
  page: Page,
  path: string | RegExp,
  message?: string,
): Promise<void> {
  const hint = message ? ` — ${message}` : '';
  if (typeof path === 'string') {
    await expect(
      page,
      `期望 URL 包含 "${path}"${hint}`,
    ).toHaveURL(new RegExp(path));
  } else {
    await expect(
      page,
      `期望 URL 匹配正则 ${path}${hint}`,
    ).toHaveURL(path);
  }
}

// ---------------------------------------------------------------------------
// expectState
// ---------------------------------------------------------------------------

/**
 * 断言元素处于指定状态（可见/隐藏/勾选/未勾选/启用/禁用）。
 *
 * 替代的反模式：
 *   const disabled = await page.locator(sel).isDisabled().catch(() => true);
 *   console.log(disabled ? 'disabled' : 'enabled');
 *
 * @param page     Playwright Page 实例
 * @param selector CSS / data-testid 等选择器
 * @param state    期望的状态: 'visible' | 'hidden' | 'checked' | 'unchecked' | 'enabled' | 'disabled'
 * @param message  可选的人类可读描述
 */
export async function expectState(
  page: Page,
  selector: string,
  state: 'visible' | 'hidden' | 'checked' | 'unchecked' | 'enabled' | 'disabled',
  message?: string,
): Promise<void> {
  const locator = page.locator(selector);
  const hint = message ? ` — ${message}` : '';
  switch (state) {
    case 'visible':
      await expect(locator.first(), `期望元素可见: ${selector}${hint}`).toBeVisible();
      break;
    case 'hidden':
      await expect(locator.first(), `期望元素隐藏: ${selector}${hint}`).toBeHidden();
      break;
    case 'checked':
      await expect(locator.first(), `期望元素勾选: ${selector}${hint}`).toBeChecked();
      break;
    case 'unchecked':
      await expect(locator.first(), `期望元素未勾选: ${selector}${hint}`).not.toBeChecked();
      break;
    case 'enabled':
      await expect(locator.first(), `期望元素启用: ${selector}${hint}`).toBeEnabled();
      break;
    case 'disabled':
      await expect(locator.first(), `期望元素禁用: ${selector}${hint}`).toBeDisabled();
      break;
    default:
      throw new Error(`[expectState] 未知状态: "${state}"${hint}`);
  }
}
