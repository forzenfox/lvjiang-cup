import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 首页 - Page Object
 */
export class HomePage extends BasePage {
  // 英雄区域元素
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly liveButton: Locator;
  readonly adminLink: Locator;
  
  // 战队区域元素
  readonly teamsSection: Locator;
  readonly teamsTitle: Locator;
  readonly teamCards: Locator;
  readonly noTeamsMessage: Locator;
  
  // 赛程区域元素
  readonly scheduleSection: Locator;
  readonly scheduleTitle: Locator;
  readonly swissTab: Locator;
  readonly eliminationTab: Locator;
  readonly noScheduleMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // 英雄区域
    this.heroTitle = page.getByRole('heading', { name: /驴酱杯/ });
    this.heroSubtitle = page.getByText('驴酱公会终极对决');
    this.liveButton = page.getByRole('button', { name: /观看直播/ });
    this.adminLink = page.getByRole('link', { name: /管理/ });
    
    // 战队区域
    this.teamsSection = page.locator('section').filter({ has: page.getByRole('heading', { name: '参赛战队' }) });
    this.teamsTitle = page.getByRole('heading', { name: '参赛战队' });
    this.teamCards = page.getByTestId('team-card');
    this.noTeamsMessage = page.getByText(/暂无战队|还没有战队/);
    
    // 赛程区域
    this.scheduleSection = page.locator('section').filter({ has: page.getByRole('heading', { name: '赛程安排' }) });
    this.scheduleTitle = page.getByRole('heading', { name: '赛程安排' });
    this.swissTab = page.getByRole('tab', { name: '瑞士轮' });
    this.eliminationTab = page.getByRole('tab', { name: '淘汰赛' });
    this.noScheduleMessage = page.getByText(/暂无.*赛程|还没有.*赛程/);
  }

  /**
   * 导航到首页
   */
  async goto() {
    await super.goto('/');
    await this.waitForLoad();
  }

  /**
   * 验证首页加载成功
   */
  async expectPageLoaded() {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.teamsTitle).toBeVisible();
    await expect(this.scheduleTitle).toBeVisible();
  }

  /**
   * 点击管理后台链接
   */
  async clickAdminLink() {
    await this.adminLink.click();
  }

  /**
   * 检查直播按钮是否可见
   */
  async isLiveButtonVisible(): Promise<boolean> {
    return await this.liveButton.isVisible().catch(() => false);
  }

  /**
   * 点击观看直播按钮
   */
  async clickLiveButton() {
    await this.liveButton.click();
  }

  /**
   * 切换到淘汰赛Tab
   */
  async switchToElimination() {
    await this.eliminationTab.click();
  }

  /**
   * 切换到瑞士轮Tab
   */
  async switchToSwiss() {
    await this.swissTab.click();
  }

  /**
   * 验证战队列表显示
   */
  async expectTeamsVisible() {
    await expect(this.teamsSection).toBeVisible();
  }

  /**
   * 验证赛程区域显示
   */
  async expectScheduleVisible() {
    await expect(this.scheduleSection).toBeVisible();
  }

  /**
   * 获取战队数量
   */
  async getTeamCount(): Promise<number> {
    return await this.teamCards.count();
  }

  /**
   * 验证空状态显示
   */
  async expectEmptyState() {
    // 检查是否有战队卡片或空状态消息
    const hasTeamCards = await this.teamCards.count() > 0;
    const hasEmptyMessage = await this.noTeamsMessage.isVisible().catch(() => false);
    
    expect(hasTeamCards || hasEmptyMessage).toBeTruthy();
  }

  /**
   * 等待战队数据加载完成
   */
  async waitForTeamsLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // 等待战队数据加载完成（有卡片或空状态）
    await this.page.waitForSelector('[data-testid="team-card"], [data-testid="empty-teams"]', { timeout: 10000 });
  }
}
