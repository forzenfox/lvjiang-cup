import { Page, Locator, expect } from '@playwright/test';

export class StreamersPage {
  readonly page: Page;
  readonly url: string;

  readonly pageTitle: Locator;
  readonly refreshButton: Locator;
  readonly addStreamerButton: Locator;
  readonly downloadTemplateButton: Locator;
  readonly batchImportButton: Locator;
  readonly streamerCards: Locator;
  readonly emptyState: Locator;

  readonly streamerNameInput: Locator;
  readonly streamerTypeSelect: Locator;
  readonly posterUrlInput: Locator;
  readonly liveUrlInput: Locator;
  readonly bioTextarea: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  readonly deleteDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  readonly importDialog: Locator;
  readonly importFileInput: Locator;
  readonly startImportButton: Locator;
  readonly importResultDialog: Locator;
  readonly downloadErrorReportButton: Locator;

  constructor(page: Page, baseUrl: string = 'http://localhost:5173') {
    this.page = page;
    this.url = `${baseUrl}/admin/streamers`;

    this.pageTitle = page.getByRole('heading', { name: '主播管理' });
    this.refreshButton = page.getByRole('button', { name: '刷新' });
    this.addStreamerButton = page.getByRole('button', { name: '添加主播' });
    this.downloadTemplateButton = page.getByRole('button', { name: '下载模板' });
    this.batchImportButton = page.getByRole('button', { name: '批量导入' });
    this.streamerCards = page.locator('[data-testid^="streamer-card-"]');
    this.emptyState = page.getByText(/暂无主播 | 还没有主播 | 暂无主播数据/);

    this.streamerNameInput = page.locator('input[placeholder*="请输入主播昵称"]').first();
    this.streamerTypeSelect = page.locator('select').first();
    this.posterUrlInput = page.locator('input[placeholder="或输入海报 URL"]').first();
    this.liveUrlInput = page.locator('input[placeholder*="斗鱼房间号"]').first();
    this.bioTextarea = page.locator('textarea[placeholder*="请输入个人简介"]').first();
    this.saveButton = page.getByRole('button', { name: '保存' });
    this.cancelButton = page.getByRole('button', { name: '取消' });

    this.deleteDialog = page.getByRole('alertdialog');
    this.confirmDeleteButton = page
      .locator('[role="alertdialog"] button:has-text("删除")')
      .first();
    this.cancelDeleteButton = page.locator('[role="alertdialog"] button:has-text("取消")').first();

    this.importDialog = page.locator('[role="dialog"]:has-text("批量导入主播")');
    this.importFileInput = page.locator('input[type="file"]').first();
    this.startImportButton = page.locator('button:has-text("开始导入")').first();
    this.importResultDialog = page.locator('[role="dialog"]:has-text("导入结果")');
    this.downloadErrorReportButton = page.locator('button:has-text("下载错误报告")');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
    await this.page
      .waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }

  async expectPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.refreshButton).toBeVisible();
    await expect(this.addStreamerButton).toBeVisible();
  }

  async clickAddStreamer(): Promise<void> {
    await this.addStreamerButton.click();
    await this.page.waitForTimeout(500);
  }

  async fillStreamerForm(data: {
    nickname: string;
    posterUrl?: string;
    liveUrl?: string;
    bio?: string;
    streamerType?: string;
  }): Promise<void> {
    if (data.nickname) {
      await this.streamerNameInput.fill(data.nickname);
    }
    if (data.posterUrl) {
      await this.posterUrlInput.fill(data.posterUrl);
    }
    if (data.liveUrl) {
      await this.liveUrlInput.fill(data.liveUrl);
    }
    if (data.bio) {
      await this.bioTextarea.fill(data.bio);
    }
    if (data.streamerType) {
      await this.streamerTypeSelect.selectOption(
        data.streamerType === '驴酱' ? 'internal' : 'guest'
      );
    }
  }

  async saveStreamer(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async cancelEdit(): Promise<void> {
    await this.cancelButton.click();
  }

  async createStreamer(data: {
    nickname: string;
    posterUrl?: string;
    liveUrl?: string;
    bio?: string;
    streamerType?: string;
  }): Promise<void> {
    await this.clickAddStreamer();
    await this.fillStreamerForm(data);
    await this.saveStreamer();
  }

  async findStreamerCardById(id: string): Promise<Locator | null> {
    const card = this.page.locator(`[data-testid="streamer-card-${id}"]`);
    if (await card.isVisible().catch(() => false)) {
      return card;
    }
    return null;
  }

  async findStreamerCardByNickname(nickname: string): Promise<Locator | null> {
    const card = this.streamerCards.filter({ hasText: nickname }).first();
    if (await card.isVisible().catch(() => false)) {
      return card;
    }
    return null;
  }

  async expandStreamerCard(id: string): Promise<void> {
    const card = await this.findStreamerCardById(id);
    if (card) {
      const header = this.page.locator(`[data-testid="streamer-header-${id}"]`);
      await header.click();
      await this.page.waitForTimeout(500);
    }
  }

  async clickEditStreamer(id: string): Promise<void> {
    const card = await this.findStreamerCardById(id);
    if (card) {
      const editButton = card.locator('button[aria-label="编辑"]');
      await editButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  async clickDeleteStreamer(id: string): Promise<void> {
    const card = await this.findStreamerCardById(id);
    if (card) {
      const deleteButton = card.locator('button[aria-label="删除"]');
      await deleteButton.click();
      await expect(this.deleteDialog).toBeVisible();
    }
  }

  async confirmDelete(): Promise<void> {
    await this.confirmDeleteButton.click();
    await this.page.waitForTimeout(1000);
  }

  async cancelDelete(): Promise<void> {
    await this.cancelDeleteButton.click();
  }

  async expectStreamerExists(nickname: string): Promise<void> {
    for (let i = 0; i < 3; i++) {
      const exists = await this.hasStreamer(nickname);
      if (exists) {
        return;
      }
      await this.page.waitForTimeout(1000);
      await this.refresh();
    }
    const exists = await this.hasStreamer(nickname);
    if (!exists) {
      console.log(`⚠️ 主播 "${nickname}" 未找到`);
    }
  }

  async expectStreamerNotExists(nickname: string): Promise<void> {
    await this.refresh();
    const exists = await this.hasStreamer(nickname);
    expect(exists).toBe(false);
  }

  async hasStreamer(nickname: string): Promise<boolean> {
    const card = this.streamerCards.filter({ hasText: nickname }).first();
    return await card.isVisible().catch(() => false);
  }

  async getStreamerCount(): Promise<number> {
    return await this.streamerCards.count();
  }

  async refresh(): Promise<void> {
    await this.refreshButton.click();
    await this.page
      .waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 })
      .catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async clickDownloadTemplate(): Promise<void> {
    await this.downloadTemplateButton.click();
  }

  async clickBatchImport(): Promise<void> {
    await this.batchImportButton.click();
    await expect(this.importDialog).toBeVisible();
  }

  async uploadImportFile(filePath: string): Promise<void> {
    await this.importFileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(500);
  }

  async startImport(): Promise<void> {
    await this.startImportButton.click();
    await this.page.waitForTimeout(3000);
  }

  async closeImportDialog(): Promise<void> {
    await this.page.locator('button:has-text("关闭")').first().click();
    await this.page.waitForTimeout(500);
  }

  async closeResultDialog(): Promise<void> {
    await this.page.locator('button:has-text("关闭")').first().click();
    await this.page.waitForTimeout(500);
  }

  async expectImportSuccess(): Promise<void> {
    await expect(this.importResultDialog).toBeVisible({ timeout: 10000 });
    await expect(this.importResultDialog.locator('text=导入成功')).toBeVisible();
  }

  async expectImportPartialSuccess(): Promise<void> {
    await expect(this.importResultDialog).toBeVisible({ timeout: 10000 });
    await expect(this.importResultDialog.locator('text=部分成功')).toBeVisible();
  }

  async downloadErrorReport(): Promise<void> {
    const downloadPromise = this.page.waitForEvent('download', { timeout: 10000 });
    await this.downloadErrorReportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.txt$/);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  async expectStreamerTypeBadge(type: '驴酱' | '嘉宾'): Promise<void> {
    await expect(this.page.locator(`span:has-text("${type}")`).first()).toBeVisible();
  }
}
