import { Page, Locator, expect } from '@playwright/test';
import { Team } from '../../../src/types';

/**
 * 战队管理页面 Page Object
 */
export class TeamsPage {
  readonly page: Page;
  readonly url: string;

  // 页面元素
  readonly pageTitle: Locator;
  readonly addButton: Locator;
  readonly refreshButton: Locator;
  readonly teamCards: Locator;
  readonly emptyState: Locator;

  // 表单元素
  readonly teamForm: Locator;
  readonly teamNameInput: Locator;
  readonly teamLogoInput: Locator;
  readonly teamDescriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // 删除确认对话框
  readonly deleteDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:5173') {
    this.page = page;
    this.url = `${baseUrl}/admin/teams`;

    // 页面元素 - 使用稳定的 role 和 data-testid
    this.pageTitle = page.getByRole('heading', { name: '战队管理' });
    this.addButton = page.getByRole('button', { name: '添加战队' });
    this.refreshButton = page.getByRole('button', { name: '刷新' });
    this.teamCards = page.getByTestId('admin-team-card');
    this.emptyState = page.getByText(/暂无战队|还没有战队/);

    // 表单元素 - 使用 data-testid
    this.teamForm = page.getByTestId('team-form');
    this.teamNameInput = page.getByTestId('team-name-input');
    this.teamLogoInput = page.getByTestId('team-logo-input');
    this.teamDescriptionInput = page.getByTestId('team-description-input');
    this.saveButton = page.getByRole('button', { name: '保存战队' });
    this.cancelButton = page.getByRole('button', { name: '取消' });

    // 删除确认对话框
    this.deleteDialog = page.getByRole('alertdialog');
    this.confirmDeleteButton = page.getByRole('button', { name: '删除' });
    this.cancelDeleteButton = page.getByRole('button', { name: '取消' });
  }

  /**
   * 访问战队管理页面
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * 等待加载完成
   */
  async waitForLoading(): Promise<void> {
    // 等待加载动画消失
    await this.page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  /**
   * 点击添加战队按钮
   */
  async clickAddTeam(): Promise<void> {
    await this.addButton.click();
    await expect(this.teamNameInput).toBeVisible();
  }

  /**
   * 填写战队表单
   */
  async fillTeamForm(team: Partial<Team>): Promise<void> {
    if (team.name) {
      await this.teamNameInput.fill(team.name);
    }
    if (team.logo) {
      await this.teamLogoInput.fill(team.logo);
    }
    if (team.description) {
      await this.teamDescriptionInput.fill(team.description);
    }
  }

  /**
   * 填写队员信息
   */
  async fillPlayerNames(playerNames: string[]): Promise<void> {
    const playerInputs = this.page.getByTestId('player-name-input');
    const count = await playerInputs.count();

    for (let i = 0; i < Math.min(playerNames.length, count); i++) {
      await playerInputs.nth(i).fill(playerNames[i]);
    }
  }

  /**
   * 保存战队
   */
  async saveTeam(): Promise<void> {
    await this.saveButton.click();
    // 等待表单关闭
    await this.page.waitForTimeout(500);
  }

  /**
   * 取消编辑
   */
  async cancelEdit(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * 创建新战队（完整流程）
   */
  async createTeam(team: Partial<Team>, playerNames?: string[]): Promise<void> {
    await this.clickAddTeam();
    await this.fillTeamForm(team);
    if (playerNames && playerNames.length > 0) {
      await this.fillPlayerNames(playerNames);
    }
    await this.saveTeam();
  }

  /**
   * 添加新战队（别名，与 createTeam 相同）
   */
  async addNewTeam(team: Partial<Team> & { players?: Array<{ name: string; position: string }> }): Promise<void> {
    const playerNames = team.players?.map(p => p.name) || [];
    await this.createTeam(team, playerNames);
  }

  /**
   * 编辑战队
   */
  async editTeam(name: string, updates: Partial<Team>): Promise<void> {
    await this.clickEditTeam(name);
    await this.fillTeamForm(updates);
    await this.saveTeam();
  }

  /**
   * 删除战队
   */
  async deleteTeam(name: string): Promise<void> {
    await this.clickDeleteTeam(name);
    await this.confirmDelete();
  }

  /**
   * 验证战队存在
   */
  async expectTeamExists(name: string): Promise<void> {
    const exists = await this.hasTeam(name);
    expect(exists).toBe(true);
  }

  /**
   * 验证战队不存在
   */
  async expectTeamNotExists(name: string): Promise<void> {
    const exists = await this.hasTeam(name);
    expect(exists).toBe(false);
  }

  /**
   * 验证空状态
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * 页面加载完成验证（别名）
   */
  async expectPageLoaded(): Promise<void> {
    await this.verifyPageElements();
  }

  /**
   * 获取战队列表
   */
  async getTeamCount(): Promise<number> {
    return await this.teamCards.count();
  }

  /**
   * 根据名称查找战队卡片
   */
  async findTeamCardByName(name: string): Promise<Locator | null> {
    const card = this.page.getByTestId('admin-team-card').filter({ hasText: name });
    if (await card.isVisible().catch(() => false)) {
      return card;
    }
    return null;
  }

  /**
   * 点击编辑战队
   */
  async clickEditTeam(name: string): Promise<void> {
    const card = await this.findTeamCardByName(name);
    if (card) {
      const editButton = card.getByRole('button', { name: '编辑' });
      await editButton.click();
      await expect(this.teamNameInput).toBeVisible();
    }
  }

  /**
   * 点击删除战队
   */
  async clickDeleteTeam(name: string): Promise<void> {
    const card = await this.findTeamCardByName(name);
    if (card) {
      const deleteButton = card.getByRole('button', { name: '删除' });
      await deleteButton.click();
      await expect(this.deleteDialog).toBeVisible();
    }
  }

  /**
   * 确认删除
   */
  async confirmDelete(): Promise<void> {
    await this.confirmDeleteButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 取消删除
   */
  async cancelDelete(): Promise<void> {
    await this.cancelDeleteButton.click();
  }

  /**
   * 检查战队是否存在
   */
  async hasTeam(name: string): Promise<boolean> {
    const card = this.page.getByTestId('admin-team-card').filter({ hasText: name });
    return await card.isVisible().catch(() => false);
  }

  /**
   * 刷新列表
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForLoading();
  }

  /**
   * 验证页面基本元素
   */
  async verifyPageElements(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.addButton).toBeVisible();
    await expect(this.refreshButton).toBeVisible();
  }

  /**
   * 加载模拟数据（用于测试）
   */
  async loadMockData(): Promise<void> {
    // 通过 API 调用创建测试数据
    await this.page.evaluate(async () => {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试战队',
          logo: 'https://example.com/logo.png',
          description: '测试描述'
        })
      });
      return response.ok;
    });
    // 刷新页面以加载新数据
    await this.page.reload();
    await this.waitForPageLoad();
  }
}
