import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { User } from '../fixtures/users.fixture';

/**
 * 管理员登录页面 - Page Object
 */
export class AdminLoginPage extends BasePage {
  // 登录表单元素
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  
  // 错误提示元素
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    this.loginForm = page.locator('form');
    this.usernameInput = page.locator('input[name="username"], input[placeholder*="用户名"], input[type="text"]').first();
    this.passwordInput = page.locator('input[name="password"], input[placeholder*="密码"], input[type="password"]').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("登录")');
    this.title = page.locator('h3:has-text("管理员登录"), h1:has-text("管理员登录")');
    this.subtitle = page.locator('text=请输入用户名和密码');
    this.errorMessage = page.locator('.text-red-400, .text-red-500, [role="alert"]');
  }

  /**
   * 导航到登录页面
   */
  async goto() {
    await super.goto('/admin');
    await this.waitForLoad();
  }

  /**
   * 验证登录页面加载成功
   */
  async expectPageLoaded() {
    // 等待表单元素可见（使用更宽松的定位器）
    await expect(this.page.locator('input[name="username"], input[type="text"]')).toBeVisible({ timeout: 10000 });
    await expect(this.usernameInput).toBeVisible({ timeout: 10000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 10000 });
    await expect(this.loginButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * 填写用户名
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * 填写密码
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * 点击登录按钮
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * 执行登录操作
   */
  async login(user: User) {
    await this.fillUsername(user.username);
    await this.fillPassword(user.password);
    await this.clickLogin();
  }

  /**
   * 验证登录成功
   */
  async expectLoginSuccess() {
    // 登录成功后应跳转到管理后台仪表盘（支持hash路由）
    await this.page.waitForURL(/.*admin\/dashboard.*/, { timeout: 10000 });
    // 验证仪表盘内容显示
    await expect(this.page.locator('text=管理仪表盘').first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * 验证登录失败
   */
  async expectLoginFailed() {
    // 应显示错误提示
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * 验证错误提示内容
   */
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  /**
   * 清空表单
   */
  async clearForm() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }
}
