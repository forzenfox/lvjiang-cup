import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 管理后台仪表盘页面 - Page Object
 */
export class DashboardPage extends BasePage {
  // 导航菜单
  readonly dashboardNav: Locator;
  readonly teamsNav: Locator;
  readonly scheduleNav: Locator;
  readonly streamNav: Locator;
  readonly advancementNav: Locator;
  readonly settingsNav: Locator;
  
  // 页面标题
  readonly pageTitle: Locator;
  
  // 统计数据
  readonly teamCount: Locator;
  readonly matchCount: Locator;
  readonly advancementCount: Locator;
  
  // 快捷操作
  readonly addTeamButton: Locator;
  readonly addMatchButton: Locator;
  readonly loadMockDataButton: Locator;
  readonly clearDataButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // 导航菜单
    this.dashboardNav = page.locator('a:has-text("仪表盘"), [href="/admin/dashboard"]');
    this.teamsNav = page.locator('a:has-text("战队管理"), [href="/admin/teams"]');
    this.scheduleNav = page.locator('a:has-text("赛程管理"), [href="/admin/schedule"]');
    this.streamNav = page.locator('a:has-text("直播管理"), [href="/admin/stream"]');
    this.advancementNav = page.locator('a:has-text("晋级名单"), [href="/admin/advancement"]');
    this.settingsNav = page.locator('a:has-text("系统设置"), [href="/admin/settings"]');
    
    // 页面标题
    this.pageTitle = page.locator('h1:has-text("仪表盘"), h2:has-text("仪表盘")');
    
    // 统计数据
    this.teamCount = page.locator('[data-testid="team-count"], text=战队数量');
    this.matchCount = page.locator('[data-testid="match-count"], text=比赛数量');
    this.advancementCount = page.locator('[data-testid="advancement-count"], text=晋级队伍');
    
    // 快捷操作
    this.addTeamButton = page.locator('button:has-text("添加战队")');
    this.addMatchButton = page.locator('button:has-text("添加比赛")');
    this.loadMockDataButton = page.locator('button:has-text("加载Mock数据"), button:has-text("加载示例数据")');
    this.clearDataButton = page.locator('button:has-text("清空数据"), button:has-text("重置数据")');
  }

  /**
   * 导航到仪表盘页面
   */
  async goto() {
    await super.goto('/admin/dashboard');
    await this.waitForLoad();
  }

  /**
   * 验证仪表盘页面加载成功
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.dashboardNav).toBeVisible();
  }

  /**
   * 导航到战队管理
   */
  async navigateToTeams() {
    await this.teamsNav.click();
  }

  /**
   * 导航到赛程管理
   */
  async navigateToSchedule() {
    await this.scheduleNav.click();
  }

  /**
   * 导航到直播管理
   */
  async navigateToStream() {
    await this.streamNav.click();
  }

  /**
   * 导航到晋级名单
   */
  async navigateToAdvancement() {
    await this.advancementNav.click();
  }

  /**
   * 点击添加战队按钮
   */
  async clickAddTeam() {
    await this.addTeamButton.click();
  }

  /**
   * 点击添加比赛按钮
   */
  async clickAddMatch() {
    await this.addMatchButton.click();
  }

  /**
   * 点击加载Mock数据按钮
   */
  async clickLoadMockData() {
    await this.loadMockDataButton.click();
  }

  /**
   * 点击清空数据按钮
   */
  async clickClearData() {
    await this.clearDataButton.click();
  }

  /**
   * 验证统计数据存在
   */
  async expectStatsVisible() {
    await expect(this.teamCount).toBeVisible();
  }
}
