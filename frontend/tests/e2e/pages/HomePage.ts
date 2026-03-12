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
    this.heroTitle = page.locator('h1:has-text("驴酱杯")');
    this.heroSubtitle = page.locator('text=驴酱公会终极对决');
    this.liveButton = page.locator('button:has-text("观看直播"), a:has-text("观看直播")');
    this.adminLink = page.locator('a[href="/admin"], text=管理');
    
    // 战队区域
    this.teamsSection = page.locator('section:has(h2:has-text("参赛战队"))');
    this.teamsTitle = page.locator('h2:has-text("参赛战队")');
    this.teamCards = page.locator('[data-testid="team-card"]');
    this.noTeamsMessage = page.locator('text=暂无战队数据');
    
    // 赛程区域
    this.scheduleSection = page.locator('section:has(h2:has-text("赛程安排"))');
    this.scheduleTitle = page.locator('h2:has-text("赛程安排")');
    this.swissTab = page.locator('role=tab[name="瑞士轮"]');
    this.eliminationTab = page.locator('role=tab[name="淘汰赛"]');
    this.noScheduleMessage = page.locator('text=暂无瑞士轮数据');
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
    await expect(this.noTeamsMessage).toBeVisible();
    await expect(this.noScheduleMessage).toBeVisible();
  }
}
