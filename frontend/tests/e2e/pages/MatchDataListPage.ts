import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 对战数据管理列表页面 - Page Object
 */
export class MatchDataListPage extends BasePage {
  readonly pageTitle: Locator;
  readonly downloadTemplateButton: Locator;
  readonly searchInput: Locator;
  readonly matchTable: Locator;
  readonly matchRows: Locator;
  readonly importButtons: Locator;
  readonly manageButtons: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByRole('heading', { name: '对战数据管理' });
    this.downloadTemplateButton = page.getByTestId('download-template-button');
    this.searchInput = page.getByPlaceholder('搜索战队名称...');
    this.matchTable = page.locator('table');
    this.matchRows = page.locator('tbody tr');
    this.importButtons = page.locator('button:has-text("导入数据")');
    this.manageButtons = page.locator('button:has-text("管理数据")');
  }

  async goto() {
    await super.goto('/admin/match-data');
    await this.waitForLoad();
  }

  async expectPageLoaded() {
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async clickDownloadTemplate() {
    await this.downloadTemplateButton.click();
  }

  async searchTeam(teamName: string) {
    await this.searchInput.fill(teamName);
    await this.page.waitForTimeout(500);
  }

  async getMatchRowCount(): Promise<number> {
    return await this.matchRows.count();
  }

  async getImportButtonCount(): Promise<number> {
    return await this.importButtons.count();
  }

  async getManageButtonCount(): Promise<number> {
    return await this.manageButtons.count();
  }

  async clickFirstImportButton() {
    const firstButton = this.importButtons.first();
    await firstButton.click();
  }
}
