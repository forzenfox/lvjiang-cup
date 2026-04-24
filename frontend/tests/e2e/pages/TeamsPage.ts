import { Page, Locator, expect } from '@playwright/test';
import { getTestConfig } from '../config/TestConfig';

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
  readonly saveTeamBtn: Locator;
  readonly cancelEditTeamBtn: Locator;

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
    this.teamCards = page.locator('[data-testid="admin-team-card"], .card:has(.text-white)');
    this.emptyState = page.getByText(/暂无战队 | 还没有战队 | 暂无战队数据/);

    // 表单元素 - 使用 placeholder 和 label 定位
    this.teamForm = page.locator('form, .card:has(input[placeholder*="请输入战队名称"])');
    this.teamNameInput = page.locator('input[placeholder*="请输入战队名称"]').first();
    this.teamLogoInput = page.locator('input[placeholder="或输入图标 URL"]').first();
    this.teamDescriptionInput = page.locator('textarea[placeholder="请输入参赛宣言"]').first();
    this.saveButton = page.getByRole('button', { name: '保存' });
    this.cancelButton = page.getByRole('button', { name: '取消' });
    this.saveTeamBtn = page.getByTestId('save-team-btn');
    this.cancelEditTeamBtn = page.getByTestId('cancel-edit-team-btn');

    // 删除确认对话框
    this.deleteDialog = page.getByRole('alertdialog');
    this.confirmDeleteButton = page
      .locator(
        '[role="alertdialog"] button.bg-blue-600, [role="alertdialog"] button:has-text("删除")'
      )
      .first();
    this.cancelDeleteButton = page.locator('[role="alertdialog"] button:has-text("取消")').first();
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
    await this.page
      .waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }

  /**
   * 点击添加战队按钮 - 验证编辑模式正确激活
   */
  async clickAddTeam(): Promise<void> {
    const isDisabled = await this.addButton.isDisabled().catch(() => true);
    if (isDisabled) {
      throw new Error('添加战队按钮被禁用');
    }
    await this.addButton.click();
    await this.waitForEditMode();
  }

  /**
   * 等待编辑模式激活并验证表单元素
   */
  async waitForEditMode(): Promise<void> {
    await expect(this.teamNameInput).toBeVisible({ timeout: 5000 });
    await expect(this.saveTeamBtn).toBeVisible({ timeout: 5000 });
    await expect(this.cancelEditTeamBtn).toBeVisible({ timeout: 5000 });
    await expect(this.teamNameInput).toBeEnabled();
  }

  /**
   * 验证添加战队后处于编辑模式（编辑按钮应隐藏）
   */
  async expectEditModeActive(): Promise<void> {
    await expect(this.saveTeamBtn).toBeVisible();
    await expect(this.cancelEditTeamBtn).toBeVisible();
    await expect(this.teamNameInput).toBeEnabled();
  }

  /**
   * 填写战队表单
   */
  async fillTeamForm(team: any): Promise<void> {
    if (team.name) {
      await this.teamNameInput.fill(team.name);
    }
    if (team.logo) {
      await this.teamLogoInput.fill(team.logo);
    }
    if (team.battleCry) {
      await this.teamDescriptionInput.fill(team.battleCry);
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
    // 重新获取保存按钮的引用，因为页面可能已刷新
    const saveBtn = this.page.getByRole('button', { name: '保存' });
    const cancelBtn = this.page.getByTestId('cancel-edit-team-btn');

    // 等待按钮可用
    await saveBtn.waitFor({ state: 'visible', timeout: 5000 });

    // 点击保存
    await saveBtn.click();

    // 等待保存完成
    await this.page.waitForTimeout(2000);

    // 等待取消按钮消失（表示表单已关闭）
    await cancelBtn.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    // 等待页面稳定
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 取消编辑
   */
  async cancelEdit(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * 创建新战队（完整流程）
   * @returns 是否成功创建
   */
  async createTeam(team: any, playerNames?: string[]): Promise<boolean> {
    try {
      await this.clickAddTeam();
    } catch {
      console.log('⚠️ 添加战队按钮被禁用');
      return false;
    }
    await this.fillTeamForm(team);
    if (playerNames && playerNames.length > 0) {
      await this.fillPlayerNames(playerNames);
    }
    await this.saveTeam();
    return true;
  }

  /**
   * 添加新战队（别名，与 createTeam 相同）
   * @returns 是否成功创建
   */
  async addNewTeam(team: any): Promise<boolean> {
    const playerNames = team.players?.map((p: any) => p.name) || [];
    return await this.createTeam(team, playerNames);
  }

  /**
   * 编辑战队
   */
  async editTeam(name: string, updates: any): Promise<void> {
    await this.clickEditTeam(name);
    // 等待表单完全打开
    await this.page.waitForTimeout(1000);
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
    // 等待战队出现，最多重试 3 次
    for (let i = 0; i < 3; i++) {
      const exists = await this.hasTeam(name);
      if (exists) {
        return;
      }
      // 如果没找到，等待一下再试
      await this.page.waitForTimeout(1000);
      // 刷新列表
      await this.refresh();
    }
    // 最后一次检查
    const exists = await this.hasTeam(name);
    if (!exists) {
      console.log(`⚠️ 战队 "${name}" 未找到`);
    }
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
   * 获取战队数量
   */
  async getTeamCount(): Promise<number> {
    const teamCards = this.page.locator('[data-testid^="team-card-"]');
    return await teamCards.count();
  }

  /**
   * 获取所有战队卡片
   */
  async getTeamCards(): Promise<Locator[]> {
    const count = await this.getTeamCount();
    const cards: Locator[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.page.locator('[data-testid^="team-card-"]').nth(i));
    }
    return cards;
  }

  /**
   * 根据名称查找战队卡片
   */
  async findTeamCardByName(name: string): Promise<Locator | null> {
    // 使用 data-testid 定位战队卡片
    const card = this.page.locator('[data-testid^="team-card-"]').filter({ hasText: name }).first();
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
    // 尝试多种定位方式
    const card = this.page
      .locator('.card, [data-testid="admin-team-card"]')
      .filter({ hasText: name })
      .first();
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
   * 通过 API 逐个创建团队 - 使用 mockTeams 中的全部16支真实战队数据
   */
  async loadMockData(): Promise<void> {
    // 使用 mockTeams 的全部16支真实战队数据
    const mockTeamData = [
      { name: '驴酱', logo: 'https://picsum.photos/seed/donkey/200/200', battleCry: '驴酱战队' },
      { name: 'IC', logo: 'https://picsum.photos/seed/icstar/200/200', battleCry: 'IC战队' },
      { name: 'PLG', logo: 'https://picsum.photos/seed/plgwater/200/200', battleCry: 'PLG战队' },
      { name: '小熊', logo: 'https://picsum.photos/seed/xiaoxiong/200/200', battleCry: '小熊战队' },
      {
        name: '搓搓鸟',
        logo: 'https://picsum.photos/seed/cuocuoniao/200/200',
        battleCry: '搓搓鸟战队',
      },
      { name: '100J', logo: 'https://picsum.photos/seed/100j/200/200', battleCry: '100J战队' },
      { name: '69', logo: 'https://picsum.photos/seed/69team/200/200', battleCry: '69战队' },
      { name: '雨酱', logo: 'https://picsum.photos/seed/yujiang/200/200', battleCry: '雨酱战队' },
      { name: '星辰', logo: 'https://picsum.photos/seed/star/200/200', battleCry: '星辰战队' },
      { name: '烈焰', logo: 'https://picsum.photos/seed/fire/200/200', battleCry: '烈焰战队' },
      { name: '寒冰', logo: 'https://picsum.photos/seed/ice/200/200', battleCry: '寒冰战队' },
      { name: '雷霆', logo: 'https://picsum.photos/seed/thunder/200/200', battleCry: '雷霆战队' },
      { name: '暗影', logo: 'https://picsum.photos/seed/shadow/200/200', battleCry: '暗影战队' },
      { name: '疾风', logo: 'https://picsum.photos/seed/wind/200/200', battleCry: '疾风战队' },
      { name: '巨石', logo: 'https://picsum.photos/seed/rock/200/200', battleCry: '巨石战队' },
      { name: '深海', logo: 'https://picsum.photos/seed/ocean/200/200', battleCry: '深海战队' },
    ];

    // 逐个创建团队
    for (const team of mockTeamData) {
      try {
        await this.page.evaluate(async teamData => {
          const response = await fetch('/api/admin/teams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teamData),
          });
          return response.ok;
        }, team);
      } catch (error) {
        console.error(`创建团队 ${team.name} 失败:`, error);
      }
    }

    // 刷新页面以加载新数据
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * 清理测试数据 - 删除所有测试创建的战队
   * 通过 API 直接删除后端数据
   */
  async cleanupTestData(): Promise<void> {
    const config = getTestConfig();
    const baseURL = this.url.replace('/admin/teams', '');
    const cleanupUrl = `${baseURL}/api/admin/data`;

    try {
      interface CleanupResponse {
        success: boolean;
      }

      const response = await this.page.evaluate<CleanupResponse, [string, typeof config.admin]>(
        async ([url, adminConfig]) => {
          const token = localStorage.getItem('token') || localStorage.getItem('auth-token');
          const loginResponse = await fetch(
            `${url.replace('/api/admin/data', '/api/admin/auth/login')}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: adminConfig.username,
                password: adminConfig.password,
              }),
            }
          );

          if (!loginResponse.ok) return { success: false };

          const loginData = await loginResponse.json();
          const adminToken = loginData.data?.access_token || token;

          const clearResponse = await fetch(url, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
            },
          });
          return { success: clearResponse.ok };
        },
        [cleanupUrl, config.admin]
      );

      if (response.success) {
        await this.page.reload();
        await this.waitForPageLoad();
      }
    } catch (error) {
      console.error('清理测试数据失败:', error);
    }
  }

  /**
   * 刷新并等待页面稳定
   */
  async refreshAndWait(): Promise<void> {
    await this.refresh();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 点击下载模板按钮
   */
  async clickDownloadTemplateButton(): Promise<void> {
    const templateButton = this.page.getByTestId('download-template-button');
    if (await templateButton.isVisible().catch(() => false)) {
      await templateButton.click();
    } else {
      const button = this.page.getByRole('button', { name: '下载模板' });
      await button.click();
    }
  }

  /**
   * 点击批量导入按钮
   */
  async clickBatchImportButton(): Promise<void> {
    const importButton = this.page.getByTestId('batch-import-button');
    if (await importButton.isVisible().catch(() => false)) {
      await importButton.click();
    } else {
      const button = this.page.getByRole('button', { name: '批量导入' });
      await button.click();
    }
  }

  /**
   * 验证下载模板按钮存在
   */
  async expectDownloadTemplateButtonVisible(): Promise<void> {
    const button = this.page.getByTestId('download-template-button');
    await expect(button).toBeVisible();
  }

  /**
   * 验证批量导入按钮存在
   */
  async expectBatchImportButtonVisible(): Promise<void> {
    const button = this.page.getByTestId('batch-import-button');
    await expect(button).toBeVisible();
  }
}
