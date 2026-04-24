import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 对战数据展示页面 - Page Object
 */
export class MatchDataPage extends BasePage {
  // 页面标题
  readonly pageTitle: Locator;
  readonly backButton: Locator;

  // 对战信息卡片
  readonly matchInfoCard: Locator;
  readonly teamAName: Locator;
  readonly teamBName: Locator;
  readonly boFormat: Locator;
  readonly gameNumber: Locator;
  readonly matchTime: Locator;
  readonly gameDuration: Locator;
  readonly winner: Locator;

  // 对局切换器
  readonly gameSwitcher: Locator;
  readonly gameButtons: Locator;

  // 选手数据列表
  readonly playerStatsList: Locator;
  readonly playerRows: Locator;

  // 雷达图
  readonly radarChart: Locator;
  readonly radarChartVisible: Locator;

  // 状态元素
  readonly loadingSkeleton: Locator;
  readonly emptyState: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByRole('heading', { name: '对战数据详情' });
    this.backButton = page.getByRole('button', { name: /返回/ }).first();

    this.matchInfoCard = page.locator('[data-testid="match-info-card"]');
    this.teamAName = page.locator('[data-testid="team-a-name"]');
    this.teamBName = page.locator('[data-testid="team-b-name"]');
    this.boFormat = page.locator('[data-testid="bo-format"]');
    this.gameNumber = page.locator('[data-testid="game-number"]');
    this.matchTime = page.locator('[data-testid="match-time"]');
    this.gameDuration = page.locator('[data-testid="game-duration"]');
    this.winner = page.locator('[data-testid="winner"]');

    this.gameSwitcher = page.locator('[data-testid="game-switcher"]');
    this.gameButtons = page.locator('[data-testid^="game-button"]');

    this.playerStatsList = page.locator('[data-testid="player-stats-list"]');
    this.playerRows = page.locator('[data-testid^="player-row"]');

    this.radarChart = page.locator('[data-testid="radar-chart"]');
    this.radarChartVisible = page.locator('[data-testid="radar-chart-visible"]');

    this.loadingSkeleton = page.locator('[data-testid="loading-skeleton"]');
    this.emptyState = page.locator('[data-testid="empty-state"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  /**
   * 导航到对战数据页面
   */
  async goto(matchId: string, gameNumber?: number) {
    const url = gameNumber
      ? `/match/${matchId}/games?game=${gameNumber}`
      : `/match/${matchId}/games`;
    await super.goto(url);
    await this.waitForLoad();
  }

  /**
   * 验证页面加载成功
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  /**
   * 验证加载状态
   */
  async expectLoadingVisible() {
    await expect(this.loadingSkeleton).toBeVisible({ timeout: 5000 });
  }

  /**
   * 验证空状态
   */
  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10000 });
  }

  /**
   * 验证错误状态
   */
  async expectErrorVisible() {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * 获取当前游戏局数
   */
  async getCurrentGameNumber(): Promise<string | null> {
    return await this.gameNumber.textContent();
  }

  /**
   * 点击对局按钮
   */
  async clickGameButton(gameNumber: number) {
    const button = this.page.locator(`[data-testid="game-button-${gameNumber}"]`);
    await button.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 验证对局按钮状态
   */
  async expectGameButtonState(gameNumber: number, state: 'active' | 'disabled' | 'normal') {
    const button = this.page.locator(`[data-testid="game-button-${gameNumber}"]`);
    await expect(button).toBeVisible();

    if (state === 'active') {
      await expect(button).toHaveClass(/primary|active|selected/);
    } else if (state === 'disabled') {
      await expect(button).toBeDisabled();
    }
  }

  /**
   * 点击选手行
   */
  async clickPlayerRow(playerIndex: number) {
    const row = this.page.locator(`[data-testid="player-row-${playerIndex}"]`);
    await row.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 验证雷达图可见
   */
  async expectRadarChartVisible() {
    await expect(this.radarChartVisible).toBeVisible({ timeout: 5000 });
  }

  /**
   * 验证雷达图不可见
   */
  async expectRadarChartHidden() {
    await expect(this.radarChartVisible).not.toBeVisible();
  }

  /**
   * 验证URL包含游戏参数
   */
  async expectUrlHasGameParam(gameNumber: number) {
    await expect(this.page).toHaveURL(new RegExp(`\\?game=${gameNumber}`));
  }

  /**
   * 获取选手行数量
   */
  async getPlayerRowCount(): Promise<number> {
    return await this.playerRows.count();
  }

  /**
   * 验证选手数据显示
   */
  async expectPlayerStatsVisible() {
    await expect(this.playerStatsList).toBeVisible({ timeout: 10000 });
    const count = await this.getPlayerRowCount();
    expect(count).toBeGreaterThanOrEqual(5);
  }

  /**
   * 验证对战信息
   */
  async expectMatchInfoVisible() {
    await expect(this.matchInfoCard).toBeVisible({ timeout: 10000 });
  }

  /**
   * 返回上一页
   */
  async clickBack() {
    await this.backButton.click();
    await this.page.waitForTimeout(500);
  }
}
