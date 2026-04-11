import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 瑞士轮编辑器页面 - Page Object
 * 用于管理和编辑瑞士轮比赛对阵
 */
export class SwissStageEditorPage extends BasePage {
  // 页面主容器
  readonly editorContainer: Locator;

  // Tab切换
  readonly swissTab: Locator;
  readonly eliminationTab: Locator;

  // 操作按钮
  readonly initSlotsButton: Locator;
  readonly refreshButton: Locator;

  // 晋级/淘汰区域
  readonly qualifiedSection: Locator;
  readonly eliminatedSection: Locator;

  // 战绩分组
  readonly round1Group: Locator;
  readonly round2Group: Locator;
  readonly round3Group: Locator;
  readonly round4Group: Locator;
  readonly round5Group: Locator;

  // 编辑对话框
  readonly editDialog: Locator;
  readonly matchEditDialog: Locator;
  readonly dialogSaveButton: Locator;
  readonly dialogCancelButton: Locator;

  // 队伍选择
  readonly teamASelect: Locator;
  readonly teamBSelect: Locator;

  // 比分输入
  readonly scoreAInput: Locator;
  readonly scoreBInput: Locator;

  // 状态按钮
  readonly upcomingButton: Locator;
  readonly ongoingButton: Locator;
  readonly finishedButton: Locator;

  // Toast提示
  readonly toastSuccess: Locator;
  readonly toastError: Locator;

  constructor(page: Page) {
    super(page);

    // 页面主容器
    this.editorContainer = page.getByTestId('swiss-stage-editor');

    // Tab切换
    this.swissTab = page.getByTestId('swiss-tab');
    this.eliminationTab = page.getByTestId('elimination-tab');

    // 操作按钮
    this.initSlotsButton = page.getByTestId('init-slots-button');
    this.refreshButton = page.getByRole('button', { name: '刷新' });

    // 晋级/淘汰区域
    this.qualifiedSection = page.getByTestId('editor-qualified-3-2');
    this.eliminatedSection = page.getByTestId('editor-eliminated-2-3');

    // 战绩分组
    this.round1Group = page.getByTestId('swiss-round-1');
    this.round2Group = page.getByTestId('swiss-round-2');
    this.round3Group = page.getByTestId('swiss-round-3');
    this.round4Group = page.getByTestId('swiss-round-4');
    this.round5Group = page.getByTestId('swiss-round-5');

    // 编辑对话框 - 使用更灵活的定位
    this.editDialog = page.locator('[role="dialog"]').filter({ hasText: '编辑比赛' });
    this.matchEditDialog = page.locator('text=编辑比赛').first();
    this.dialogSaveButton = page.getByRole('button', { name: '保存' });
    this.dialogCancelButton = page.getByRole('button', { name: '取消' });

    // 队伍选择
    this.teamASelect = page.locator('select').filter({ hasText: '队伍 A' }).first();
    this.teamBSelect = page.locator('select').filter({ hasText: '队伍 B' }).first();

    // 比分输入
    this.scoreAInput = page.locator('input[type="number"]').first();
    this.scoreBInput = page.locator('input[type="number"]').nth(1);

    // 状态按钮
    this.upcomingButton = page.getByRole('button', { name: '未开始' });
    this.ongoingButton = page.getByRole('button', { name: '进行中' });
    this.finishedButton = page.getByRole('button', { name: '已结束' });

    // Toast提示
    this.toastSuccess = page.locator('[data-sonner-toast][data-type="success"], .toast-success');
    this.toastError = page.locator('[data-sonner-toast][data-type="error"], .toast-error');
  }

  /**
   * 导航到瑞士轮编辑器页面
   */
  async goto(): Promise<void> {
    await super.goto('/admin/schedule');
    await this.waitForLoad();
    // 确保在瑞士轮Tab
    await this.switchToSwiss();
  }

  /**
   * 验证页面加载成功
   */
  async expectPageLoaded(): Promise<void> {
    await expect(this.editorContainer).toBeVisible({ timeout: 10000 });
  }

  /**
   * 切换到瑞士轮Tab
   */
  async switchToSwiss(): Promise<void> {
    await this.swissTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 切换到淘汰赛Tab
   */
  async switchToElimination(): Promise<void> {
    await this.eliminationTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 点击"初始化赛程"按钮
   */
  async clickInitSlots(): Promise<void> {
    const isVisible = await this.initSlotsButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.initSlotsButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * 获取瑞士轮比赛卡片
   * @param record 战绩记录，如 '0-0', '1-0', '2-1' 等
   * @param index 在该战绩分组中的索引（从0开始）
   */
  getMatchCard(record: string, index: number): Locator {
    return this.page.getByTestId(`swiss-match-card-${record}-${index}`);
  }

  /**
   * 获取比赛卡片（通过比赛ID）
   * @param matchId 比赛ID
   */
  getMatchCardById(matchId: string): Locator {
    return this.page.locator(
      `[data-testid="swiss-match-card-${matchId}"], [data-match-id="${matchId}"]`
    );
  }

  /**
   * 点击比赛卡片打开编辑对话框
   * @param record 战绩记录
   * @param index 索引
   */
  async clickMatchCard(record: string, index: number): Promise<void> {
    const card = this.getMatchCard(record, index);
    await card.click();
    await expect(this.editDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * 选择比赛队伍A
   * @param teamName 队伍名称
   */
  async selectTeamA(teamName: string): Promise<void> {
    await this.teamASelect.selectOption({ label: teamName });
  }

  /**
   * 选择比赛队伍B
   * @param teamName 队伍名称
   */
  async selectTeamB(teamName: string): Promise<void> {
    await this.teamBSelect.selectOption({ label: teamName });
  }

  /**
   * 设置比分
   * @param scoreA A队得分
   * @param scoreB B队得分
   */
  async setScore(scoreA: number, scoreB: number): Promise<void> {
    await this.scoreAInput.fill(scoreA.toString());
    await this.scoreBInput.fill(scoreB.toString());
  }

  /**
   * 设置比赛状态
   * @param status 状态: upcoming, ongoing, finished
   */
  async setMatchStatus(status: 'upcoming' | 'ongoing' | 'finished'): Promise<void> {
    switch (status) {
      case 'upcoming':
        await this.upcomingButton.click();
        break;
      case 'ongoing':
        await this.ongoingButton.click();
        break;
      case 'finished':
        await this.finishedButton.click();
        break;
    }
  }

  /**
   * 更新比赛结果
   * @param options 配置选项
   */
  async updateMatch(options: {
    teamA?: string;
    teamB?: string;
    scoreA?: number;
    scoreB?: number;
    status?: 'upcoming' | 'ongoing' | 'finished';
  }): Promise<void> {
    if (options.teamA) {
      await this.selectTeamA(options.teamA);
    }
    if (options.teamB) {
      await this.selectTeamB(options.teamB);
    }
    if (options.scoreA !== undefined && options.scoreB !== undefined) {
      await this.setScore(options.scoreA, options.scoreB);
    }
    if (options.status) {
      await this.setMatchStatus(options.status);
    }
  }

  /**
   * 保存比赛编辑
   */
  async saveMatch(): Promise<void> {
    await this.dialogSaveButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 关闭编辑对话框
   */
  async closeDialog(): Promise<void> {
    await this.dialogCancelButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 验证战队在特定战绩分组中
   * @param teamName 队伍名称
   * @param record 战绩记录，如 '2-0', '1-1', '0-2' 等
   */
  async expectTeamInGroup(teamName: string, record: string): Promise<void> {
    const group = this.page.getByTestId(`swiss-record-group-${record}`);
    const teamInGroup = group.getByText(teamName);
    await expect(teamInGroup).toBeVisible();
  }

  /**
   * 验证晋级区域显示
   */
  async expectQualifiedSectionVisible(): Promise<void> {
    await expect(this.qualifiedSection).toBeVisible();
  }

  /**
   * 验证淘汰区域显示
   */
  async expectEliminatedSectionVisible(): Promise<void> {
    await expect(this.eliminatedSection).toBeVisible();
  }

  /**
   * 验证比赛状态显示
   * @param record 战绩记录
   * @param index 索引
   * @param status 预期状态
   */
  async expectMatchStatus(record: string, index: number, status: string): Promise<void> {
    const card = this.getMatchCard(record, index);
    const statusBadge = card.locator('text=' + status);
    await expect(statusBadge).toBeVisible();
  }

  /**
   * 获取比赛数量
   */
  async getMatchCount(): Promise<number> {
    const matches = this.page.locator('[data-testid^="swiss-match-card-"]');
    return await matches.count();
  }

  /**
   * 获取指定战绩分组的比赛数量
   * @param record 战绩记录
   */
  async getMatchCountByRecord(record: string): Promise<number> {
    const matches = this.page.locator(`[data-testid^="swiss-match-card-${record}-"]`);
    return await matches.count();
  }

  /**
   * 验证瑞士轮编辑器可见
   */
  async expectSwissEditorVisible(): Promise<void> {
    await expect(this.editorContainer).toBeVisible();
  }

  /**
   * 验证战绩分组可见
   * @param round 轮次编号 1-5
   */
  async expectRoundGroupVisible(round: number): Promise<void> {
    const group = this.page.getByTestId(`swiss-round-${round}`);
    await expect(group).toBeVisible();
  }

  /**
   * 验证晋级状态文本
   * @param text 预期的状态文本
   */
  async expectAdvancementStatus(text: string): Promise<void> {
    const status = this.page.getByTestId('advancement-status');
    await expect(status).toContainText(text);
  }

  /**
   * 等待Toast消失
   */
  async waitForToast(): Promise<void> {
    await this.page.waitForTimeout(1000);
  }

  /**
   * 刷新页面数据
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.page.waitForTimeout(1000);
  }
}
