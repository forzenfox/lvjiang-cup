import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 赛程管理页面 - Page Object
 */
export class SchedulePage extends BasePage {
  // 页面标题
  readonly pageTitle: Locator;
  
  // Tab切换
  readonly swissTab: Locator;
  readonly eliminationTab: Locator;
  
  // 比赛列表
  readonly matchList: Locator;
  readonly matchItems: Locator;
  readonly emptyMessage: Locator;
  
  // 操作按钮
  readonly addMatchButton: Locator;
  
  // 添加比赛弹窗
  readonly matchModal: Locator;
  readonly roundSelect: Locator;
  readonly team1Select: Locator;
  readonly team2Select: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  
  // 比分输入
  readonly score1Input: Locator;
  readonly score2Input: Locator;
  readonly updateScoreButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // 页面标题
    this.pageTitle = page.locator('h1:has-text("赛程管理"), h2:has-text("赛程管理")');
    
    // Tab 切换
    this.swissTab = page.getByRole('tab', { name: '瑞士轮' }).or(page.getByText('瑞士轮')).first();
    this.eliminationTab = page.getByRole('tab', { name: '淘汰赛' }).or(page.getByText('淘汰赛')).first();
    
    // 比赛列表
    this.matchList = page.locator('[data-testid="match-list"], .match-list');
    this.matchItems = page.locator('[data-testid="match-item"], .match-item');
    this.emptyMessage = page.locator('text=暂无比赛数据, text=暂无赛程');
    
    // 操作按钮
    this.addMatchButton = page.locator('button:has-text("添加比赛")');
    
    // 添加比赛弹窗
    this.matchModal = page.locator('.el-dialog, [role="dialog"]').filter({ hasText: '添加比赛' });
    this.roundSelect = page.locator('select[name="round"], .el-select').first();
    this.team1Select = page.locator('select[name="team1"], .el-select').nth(1);
    this.team2Select = page.locator('select[name="team2"], .el-select').nth(2);
    this.saveButton = page.locator('button:has-text("保存")');
    this.cancelButton = page.locator('button:has-text("取消")');
    
    // 比分输入
    this.score1Input = page.locator('input[name="score1"], input[placeholder*="比分"]').first();
    this.score2Input = page.locator('input[name="score2"], input[placeholder*="比分"]').nth(1);
    this.updateScoreButton = page.locator('button:has-text("更新比分"), button:has-text("保存比分")');
  }

  /**
   * 导航到赛程管理页面
   */
  async goto() {
    await super.goto('/admin/schedule');
    await this.waitForLoad();
  }

  /**
   * 验证页面加载成功
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * 切换到瑞士轮Tab
   */
  async switchToSwiss() {
    await this.swissTab.click();
  }

  /**
   * 切换到淘汰赛Tab
   */
  async switchToElimination() {
    await this.eliminationTab.click();
  }

  /**
   * 点击添加比赛按钮
   */
  async clickAddMatch() {
    await this.addMatchButton.click();
  }

  /**
   * 选择轮次
   */
  async selectRound(round: string) {
    await this.roundSelect.selectOption(round);
  }

  /**
   * 选择队伍
   */
  async selectTeams(team1: string, team2: string) {
    await this.team1Select.selectOption(team1);
    await this.team2Select.selectOption(team2);
  }

  /**
   * 保存比赛
   */
  async saveMatch() {
    await this.saveButton.click();
  }

  /**
   * 添加新比赛（完整流程）
   */
  async addNewMatch(round: string, team1: string, team2: string) {
    await this.clickAddMatch();
    await this.selectRound(round);
    await this.selectTeams(team1, team2);
    await this.saveMatch();
  }

  /**
   * 更新比赛比分
   */
  async updateMatchScore(matchIndex: number, score1: number, score2: number) {
    const match = this.matchItems.nth(matchIndex);
    await match.locator(this.score1Input).fill(score1.toString());
    await match.locator(this.score2Input).fill(score2.toString());
    await match.locator(this.updateScoreButton).click();
  }

  /**
   * 获取比赛数量
   */
  async getMatchCount(): Promise<number> {
    return await this.matchItems.count();
  }

  /**
   * 验证比赛存在
   */
  async expectMatchExists(team1: string, team2: string) {
    const match = this.page.locator('.match-item').filter({ hasText: team1 }).filter({ hasText: team2 });
    await expect(match).toBeVisible();
  }

  /**
   * 验证空状态
   */
  async expectEmptyState() {
    await expect(this.emptyMessage).toBeVisible();
  }

  /**
   * 获取瑞士轮比赛数量
   */
  async getSwissMatchCount(): Promise<number> {
    await this.switchToSwiss();
    await this.page.waitForTimeout(500);
    return await this.matchItems.count();
  }

  /**
   * 添加瑞士轮比赛
   */
  async addSwissMatch() {
    await this.switchToSwiss();
    await this.page.waitForTimeout(500);
    
    // 点击添加比赛按钮
    const hasAddButton = await this.addMatchButton.isVisible().catch(() => false);
    if (hasAddButton) {
      await this.addMatchButton.click();
      await this.page.waitForTimeout(500);
      
      // 尝试保存（使用现有数据）
      const hasSaveButton = await this.saveButton.isVisible().catch(() => false);
      if (hasSaveButton) {
        await this.saveButton.click();
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * 打开晋级名单管理
   */
  async openAdvancementManager() {
    await this.switchToSwiss();
    await this.page.waitForTimeout(500);
    
    // 尝试查找晋级名单管理按钮并点击
    const advancementButton = this.page.locator('button:has-text("晋级"), button:has-text("管理"), [data-testid="advancement-manager"]').first();
    const hasButton = await advancementButton.isVisible().catch(() => false);
    if (hasButton) {
      await advancementButton.click();
      await this.page.waitForTimeout(1000);
    }
  }
}
