import { Page } from '@playwright/test';

/**
 * 基础页面类 - Page Object Model
 * 所有页面类的基类
 */
export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * 导航到指定URL
   */
  async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * 等待页面加载完成
   */
  async waitForLoad() {
    try {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(500);
    } catch {
      // 如果 domcontentloaded 失败，忽略错误继续
    }
  }

  /**
   * 截图并保存
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `./tests/e2e/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * 获取页面标题
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * 获取当前URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * 等待元素可见
   */
  async waitForVisible(selector: string, timeout = 10000) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * 检查元素是否存在
   */
  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page
      .locator(selector)
      .isVisible()
      .catch(() => false);
  }

  /**
   * 点击元素
   */
  async click(selector: string) {
    await this.page.locator(selector).click();
  }

  /**
   * 填充输入框
   */
  async fill(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  /**
   * 获取元素文本
   */
  async getText(selector: string): Promise<string> {
    return (await this.page.locator(selector).textContent()) || '';
  }

  /**
   * 刷新页面
   */
  async reload() {
    await this.page.reload();
    await this.waitForLoad();
  }
}
