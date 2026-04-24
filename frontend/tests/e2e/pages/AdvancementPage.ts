import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 晋级名单页面 - Page Object
 */
export class AdvancementPage extends BasePage {
  // 页面标题
  readonly pageTitle: Locator;

  // 晋级队伍列表
  readonly advancementList: Locator;
  readonly teamItems: Locator;
  readonly emptyMessage: Locator;

  // 操作按钮
  readonly addTeamButton: Locator;
  readonly autoGenerateButton: Locator;
  readonly clearButton: Locator;

  // 添加队伍弹窗
  readonly teamModal: Locator;
  readonly teamSelect: Locator;
  readonly seedInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // 删除确认
  readonly deleteConfirmButton: Locator;

  constructor(page: Page) {
    super(page);

    // 页面标题
    this.pageTitle = page.locator('h1:has-text("晋级名单"), h2:has-text("晋级名单")');

    // 晋级队伍列表
    this.advancementList = page.locator('[data-testid="advancement-list"], .advancement-list');
    this.teamItems = page.locator('[data-testid="team-item"], .team-item');
    this.emptyMessage = page.locator('text=暂无晋级队伍, text=暂无数据');

    // 操作按钮
    this.addTeamButton = page.locator('button:has-text("添加队伍")');
    this.autoGenerateButton = page.locator(
      'button:has-text("自动生成"), button:has-text("自动晋级")'
    );
    this.clearButton = page.locator('button:has-text("清空")');

    // 添加队伍弹窗
    this.teamModal = page.locator('.el-dialog, [role="dialog"]').filter({ hasText: '添加队伍' });
    this.teamSelect = page.locator('select[name="team"], .el-select').first();
    this.seedInput = page.locator('input[name="seed"], input[placeholder*="种子"]').first();
    this.saveButton = page.locator('button:has-text("保存")');
    this.cancelButton = page.locator('button:has-text("取消")');

    // 删除确认
    this.deleteConfirmButton = page.locator('button:has-text("确定"), button:has-text("确认")');
  }

  /**
   * 导航到晋级名单页面
   */
  async goto() {
    await super.goto('/admin/advancement');
    await this.waitForLoad();
  }

  /**
   * 验证页面加载成功
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * 点击添加队伍按钮
   */
  async clickAddTeam() {
    await this.addTeamButton.click();
  }

  /**
   * 选择队伍
   */
  async selectTeam(teamName: string) {
    await this.teamSelect.selectOption(teamName);
  }

  /**
   * 填写种子排名
   */
  async fillSeed(seed: number) {
    await this.seedInput.fill(seed.toString());
  }

  /**
   * 保存队伍
   */
  async saveTeam() {
    await this.saveButton.click();
  }

  /**
   * 添加晋级队伍（完整流程）
   */
  async addAdvancementTeam(teamName: string, seed?: number) {
    await this.clickAddTeam();
    await this.selectTeam(teamName);
    if (seed !== undefined) {
      await this.fillSeed(seed);
    }
    await this.saveTeam();
  }

  /**
   * 删除晋级队伍
   */
  async deleteTeam(teamName: string) {
    const team = this.page.locator('.team-item', { hasText: teamName });
    await team.locator('button:has-text("删除")').click();
    await this.deleteConfirmButton.click();
  }

  /**
   * 自动生成晋级名单
   */
  async autoGenerate() {
    await this.autoGenerateButton.click();
  }

  /**
   * 清空晋级名单
   */
  async clearAll() {
    await this.clearButton.click();
    await this.deleteConfirmButton.click();
  }

  /**
   * 获取晋级队伍数量
   */
  async getTeamCount(): Promise<number> {
    return await this.teamItems.count();
  }

  /**
   * 验证队伍存在
   */
  async expectTeamExists(teamName: string) {
    const team = this.page.locator('.team-item', { hasText: teamName });
    await expect(team).toBeVisible();
  }

  /**
   * 验证队伍不存在
   */
  async expectTeamNotExists(teamName: string) {
    const team = this.page.locator('.team-item', { hasText: teamName });
    await expect(team).not.toBeVisible();
  }

  /**
   * 验证空状态
   */
  async expectEmptyState() {
    await expect(this.emptyMessage).toBeVisible();
  }
}
