import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Team } from '../fixtures/teams.fixture';

/**
 * 战队管理页面 - Page Object
 */
export class TeamsPage extends BasePage {
  // 页面标题
  readonly pageTitle: Locator;
  
  // 战队列表
  readonly teamList: Locator;
  readonly teamItems: Locator;
  readonly emptyMessage: Locator;
  
  // 操作按钮
  readonly addTeamButton: Locator;
  readonly loadMockDataButton: Locator;
  readonly clearAllButton: Locator;
  
  // 添加/编辑战队弹窗
  readonly teamModal: Locator;
  readonly teamNameInput: Locator;
  readonly teamLogoInput: Locator;
  readonly teamDescriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  
  // 删除确认
  readonly deleteConfirmButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // 页面标题
    this.pageTitle = page.locator('h1:has-text("战队管理"), h2:has-text("战队管理")');
    
    // 战队列表
    this.teamList = page.locator('[data-testid="team-list"], .team-list');
    this.teamItems = page.locator('[data-testid="team-item"], .team-item');
    this.emptyMessage = page.locator('text=暂无战队数据, text=暂无战队');
    
    // 操作按钮
    this.addTeamButton = page.locator('button:has-text("添加战队")');
    this.loadMockDataButton = page.locator('button:has-text("加载Mock数据"), button:has-text("加载示例数据")');
    this.clearAllButton = page.locator('button:has-text("清空所有")');
    
    // 添加/编辑战队弹窗
    this.teamModal = page.locator('.el-dialog, [role="dialog"], .modal').filter({ hasText: '添加战队' });
    this.teamNameInput = page.locator('input[placeholder*="战队名称"], input[name="name"]').first();
    this.teamLogoInput = page.locator('input[placeholder*="Logo"], input[name="logo"]').first();
    this.teamDescriptionInput = page.locator('textarea[placeholder*="描述"], input[name="description"]').first();
    this.saveButton = page.locator('button:has-text("保存"), button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("取消")');
    
    // 删除确认
    this.deleteConfirmButton = page.locator('.el-message-box__btns button:has-text("确定"), button:has-text("确认")');
  }

  /**
   * 导航到战队管理页面
   */
  async goto() {
    await super.goto('/admin/teams');
    await this.waitForLoad();
  }

  /**
   * 验证页面加载成功
   */
  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * 点击添加战队按钮
   */
  async clickAddTeam() {
    await this.addTeamButton.click();
  }

  /**
   * 填写战队表单
   */
  async fillTeamForm(team: Partial<Team>) {
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
   * 保存战队
   */
  async saveTeam() {
    await this.saveButton.click();
  }

  /**
   * 取消操作
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * 添加新战队（完整流程）
   */
  async addNewTeam(team: Team) {
    await this.clickAddTeam();
    await this.fillTeamForm(team);
    await this.saveTeam();
  }

  /**
   * 编辑战队
   */
  async editTeam(teamName: string, updates: Partial<Team>) {
    const editButton = this.page.locator('.team-item', { hasText: teamName }).locator('button:has-text("编辑")');
    await editButton.click();
    await this.fillTeamForm(updates);
    await this.saveTeam();
  }

  /**
   * 删除战队
   */
  async deleteTeam(teamName: string) {
    const deleteButton = this.page.locator('.team-item', { hasText: teamName }).locator('button:has-text("删除")');
    await deleteButton.click();
    await this.deleteConfirmButton.click();
  }

  /**
   * 加载Mock数据
   */
  async loadMockData() {
    await this.loadMockDataButton.click();
  }

  /**
   * 清空所有数据
   */
  async clearAllData() {
    await this.clearAllButton.click();
    await this.deleteConfirmButton.click();
  }

  /**
   * 获取战队数量
   */
  async getTeamCount(): Promise<number> {
    return await this.teamItems.count();
  }

  /**
   * 验证战队存在
   */
  async expectTeamExists(teamName: string) {
    const team = this.page.locator('.team-item', { hasText: teamName });
    await expect(team).toBeVisible();
  }

  /**
   * 验证战队不存在
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
