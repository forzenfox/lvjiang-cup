import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { dismissStartBox, activateLazySections, prepareHome } from '../utils/test-helpers';

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

  // 鸣谢区域元素
  readonly thanksSection: Locator;
  readonly thanksTitle: Locator;
  readonly marqueeContainer: Locator;
  readonly marqueeContent: Locator;

  constructor(page: Page) {
    super(page);

    // 英雄区域
    this.heroTitle = page.getByRole('heading', { name: /驴酱杯/ });
    this.heroSubtitle = page.getByText('驴酱公会终极对决');
    this.liveButton = page.getByRole('button', { name: /观看直播/ });
    // Layout 已移除页面内的管理后台链接（改用快捷键 Ctrl+Shift+A），故不在此断言
    this.adminLink = page.getByRole('link', { name: /管理/ });

    // 战队区域（TeamSection 渲染为 <section id="teams">，无「参赛战队」标题）
    this.teamsSection = page.locator('#teams');
    this.teamsTitle = page.locator('#teams [data-testid="teams-grid"]').first();
    this.teamCards = page.getByTestId('team-card');
    this.noTeamsMessage = page.getByText(/暂无战队/);

    // 赛程区域（ScheduleSection 渲染为 <section id="schedule">，无「赛程安排」标题）
    this.scheduleSection = page.locator('#schedule');
    this.scheduleTitle = page.locator('#schedule [data-testid="schedule-tabs"]').first();
    this.swissTab = page.getByTestId('home-swiss-tab');
    this.eliminationTab = page.getByTestId('home-elimination-tab');
    this.noScheduleMessage = page.getByText(/暂无赛程|暂无.*赛程信息/);

    // 鸣谢区域（ThanksSection 渲染为 <section id="thanks">，标题为 thanks-section-title）
    this.thanksSection = page.locator('#thanks');
    this.thanksTitle = page.getByTestId('thanks-section-title');
    this.marqueeContainer = page.getByTestId('marquee-container');
    this.marqueeContent = page.getByTestId('marquee-content');
  }

  /**
   * 导航到首页
   */
  async goto() {
    await super.goto('/');
    await this.waitForLoad();
    // 退出 StartBox 全屏封面，避免遮挡后续交互
    await prepareHome(this.page);
  }

  /**
   * 验证首页加载成功
   * 先退出 StartBox 封面并滚动激活懒加载区块，避免封面遮挡 / 区块未渲染导致断言失败
   */
  async expectPageLoaded() {
    await prepareHome(this.page);
    // 使用更宽松的定位器和更长的超时时间
    await expect(this.page.locator('text=驴酱杯').first()).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator('#teams')).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator('#schedule')).toBeVisible({ timeout: 10000 });
    // 回到顶部，保持视口初始状态
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * 退出首页 StartBox 全屏封面（供首页交互前调用）
   */
  async dismissCover() {
    await prepareHome(this.page);
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
   * 切换到瑞士轮Tab
   */
  async switchToSwiss() {
    // 先滚动到赛程区域确保Tab可见
    await this.scrollToSchedule();
    // 等待Tab可见并点击
    await this.swissTab.waitFor({ state: 'visible', timeout: 5000 });
    await this.swissTab.click();
    // 等待内容加载
    await this.page.waitForTimeout(500);
  }

  /**
   * 切换到淘汰赛Tab
   */
  async switchToElimination() {
    // 先滚动到赛程区域确保Tab可见
    await this.scrollToSchedule();
    // 等待Tab可见并点击
    await this.eliminationTab.waitFor({ state: 'visible', timeout: 5000 });
    await this.eliminationTab.click();
    // 等待内容加载
    await this.page.waitForTimeout(500);
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
    const hasTeamCards = (await this.teamCards.count()) > 0;
    const hasEmptyMessage = await this.noTeamsMessage.isVisible().catch(() => false);

    expect(hasTeamCards || hasEmptyMessage).toBeTruthy();
  }

  /**
   * 等待战队数据加载完成
   */
  async waitForTeamsLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // 等待战队数据加载完成（有卡片或空状态）
    await this.page.waitForSelector('[data-testid="team-card"], [data-testid="empty-teams"]', {
      timeout: 10000,
    });
  }

  /**
   * 滚动到战队区域
   */
  async scrollToTeams(): Promise<void> {
    // 先退出封面，避免遮罩拦截
    await this.dismissCover();
    // 滚动到战队区域
    await this.page.locator('#teams').scrollIntoViewIfNeeded();
    // 等待一下确保内容加载
    await this.page.waitForTimeout(500);
  }

  /**
   * 滚动到赛程区域
   */
  async scrollToSchedule(): Promise<void> {
    // 先退出封面，避免遮罩拦截
    await this.dismissCover();
    // 滚动到赛程区域
    await this.page.locator('#schedule').scrollIntoViewIfNeeded();
    // 等待一下确保内容加载
    await this.page.waitForTimeout(500);
  }

  /**
   * 滚动到鸣谢区域
   */
  async scrollToThanks(): Promise<void> {
    // 先退出封面，避免遮罩拦截
    await this.dismissCover();
    // 滚动到鸣谢区域
    await this.page.locator('#thanks').scrollIntoViewIfNeeded();
    // 等待一下确保内容加载
    await this.page.waitForTimeout(500);
  }

  /**
   * 验证鸣谢区域显示
   */
  async expectThanksVisible() {
    await expect(this.thanksSection).toBeVisible();
    await expect(this.thanksTitle).toBeVisible();
  }

  /**
   * 验证 Marquee 滚动容器可见
   */
  async expectMarqueeVisible() {
    await expect(this.marqueeContainer).toBeVisible();
    await expect(this.marqueeContent).toBeVisible();
  }
}
