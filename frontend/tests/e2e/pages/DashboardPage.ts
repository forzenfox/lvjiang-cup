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
  
  // 统计数据卡片
  readonly teamCountCard: Locator;
  readonly matchCountCard: Locator;
  readonly streamStatusCard: Locator;
  readonly systemStatusCard: Locator;
  
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
    
    // 统计数据卡片 - 使用更精确的定位器
    this.teamCountCard = page.locator('div').filter({ has: page.locator('text=参赛战队') }).filter({ has: page.locator('text=已注册战队总数') }).first();
    this.matchCountCard = page.locator('div').filter({ has: page.locator('text=比赛总数') }).filter({ has: page.locator('text=未开始') }).first();
    this.streamStatusCard = page.locator('div').filter({ has: page.locator('text=直播状态') }).filter({ has: page.locator('text=暂无直播') }).first();
    this.systemStatusCard = page.locator('div').filter({ has: page.locator('text=系统状态') }).filter({ has: page.locator('text=所有服务运行正常') }).first();
    
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
    // 验证页面标题包含"管理仪表盘"
    await expect(this.page.getByRole('heading', { name: '管理仪表盘' })).toBeVisible({ timeout: 10000 });
    // 验证侧边栏导航存在
    await expect(this.page.getByRole('complementary')).toBeVisible({ timeout: 10000 });
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
   * 退出登录
   */
  async logout() {
    // 查找退出按钮，通常在用户菜单或侧边栏底部
    const logoutButton = this.page.locator('button:has-text("退出"), button:has-text("退出登录"), a:has-text("退出"), [role="button"]:has-text("退出")').first();
    await logoutButton.click();
    // 等待重定向到登录页面
    await this.page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  }

  /**
   * 验证统计数据存在
   */
  async expectStatsVisible() {
    await expect(this.teamCount).toBeVisible();
  }

  /**
   * 获取战队数量
   */
  async getTeamCount(): Promise<number> {
    const card = this.page.locator('div').filter({ has: this.page.locator('text=参赛战队') }).filter({ has: this.page.locator('text=已注册战队总数') }).first();
    const countText = await card.locator('p').nth(1).textContent({ timeout: 5000 });
    return parseInt(countText || '0', 10);
  }

  /**
   * 获取比赛统计
   */
  async getMatchStats(): Promise<{ total: number; upcoming: number; ongoing: number; finished: number }> {
    const card = this.page.locator('div').filter({ has: this.page.locator('text=比赛总数') }).filter({ has: this.page.locator('text=未开始') }).first();
    const statsText = await card.locator('p').nth(2).textContent({ timeout: 5000 });
    // 格式: "0 未开始 / 0 进行中 / 0 已结束"
    const match = statsText?.match(/(\d+)\s*未开始\s*\/\s*(\d+)\s*进行中\s*\/\s*(\d+)\s*已结束/);
    if (match) {
      return {
        total: parseInt(match[1]) + parseInt(match[2]) + parseInt(match[3]),
        upcoming: parseInt(match[1]),
        ongoing: parseInt(match[2]),
        finished: parseInt(match[3])
      };
    }
    return { total: 0, upcoming: 0, ongoing: 0, finished: 0 };
  }

  /**
   * 获取直播状态
   */
  async getStreamStatus(): Promise<string> {
    const card = this.page.locator('div').filter({ has: this.page.locator('text=直播状态') }).filter({ has: this.page.locator('text=暂无直播') }).first();
    const status = await card.locator('p').nth(1).textContent({ timeout: 5000 });
    return status || '未直播';
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus(): Promise<string> {
    const card = this.page.locator('div').filter({ has: this.page.locator('text=系统状态') }).filter({ has: this.page.locator('text=所有服务运行正常') }).first();
    const status = await card.locator('p').nth(1).textContent({ timeout: 5000 });
    return status || '正常';
  }
}
