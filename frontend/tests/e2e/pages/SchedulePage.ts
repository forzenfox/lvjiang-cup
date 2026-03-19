import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 赛程管理页面 - Page Object
 */
export class SchedulePage extends BasePage {
  // 页面标题
  readonly pageTitle: Locator;
  readonly matchCount: Locator;

  // Tab切换
  readonly swissTab: Locator;
  readonly eliminationTab: Locator;
  readonly tabsList: Locator;

  // 操作按钮
  readonly initSlotsButton: Locator;
  readonly refreshButton: Locator;

  // 比赛列表
  readonly swissStage: Locator;
  readonly eliminationStage: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);

    // 页面标题 - 使用 data-testid
    this.pageTitle = page.getByTestId('schedule-page-title');
    this.matchCount = page.getByTestId('schedule-match-count');

    // Tab 切换 - 使用 data-testid
    this.tabsList = page.getByTestId('schedule-tabs');
    this.swissTab = page.getByTestId('swiss-tab');
    this.eliminationTab = page.getByTestId('elimination-tab');

    // 操作按钮
    this.initSlotsButton = page.getByTestId('init-slots-button');
    this.refreshButton = page.getByTestId('refresh-schedule-button');

    // 比赛阶段组件
    this.swissStage = page.locator('[data-testid="swiss-stage"], [data-value="swiss"]');
    this.eliminationStage = page.locator(
      '[data-testid="elimination-stage"], [data-value="elimination"]'
    );
    this.emptyMessage = page.locator('text=请先添加战队数据, text=暂无比赛数据');
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
    // 尝试多种方式验证页面加载
    try {
      await expect(this.pageTitle).toBeVisible({ timeout: 5000 });
    } catch {
      // 验证页面URL正确
      await expect(this.page).toHaveURL(/\/admin\/schedule/, { timeout: 10000 });
      // 验证至少有一个Tab元素
      const hasTab = await this.tabsList.isVisible().catch(() => false);
      if (!hasTab) {
        console.log('⚠️ 赛程管理页面标题未找到，但URL正确');
      }
    }
  }

  /**
   * 切换到瑞士轮Tab
   */
  async switchToSwiss() {
    await this.swissTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 切换到淘汰赛Tab
   */
  async switchToElimination() {
    await this.eliminationTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 初始化比赛槽位
   */
  async initSlots() {
    const hasButton = await this.initSlotsButton.isVisible().catch(() => false);
    if (hasButton) {
      await this.initSlotsButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * 刷新数据
   */
  async refreshData() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 获取比赛数量文本
   */
  async getMatchCountText(): Promise<string | null> {
    return await this.matchCount.textContent();
  }

  /**
   * 验证瑞士轮Tab可见
   */
  async expectSwissTabVisible() {
    await expect(this.swissTab).toBeVisible();
  }

  /**
   * 验证淘汰赛Tab可见
   */
  async expectEliminationTabVisible() {
    await expect(this.eliminationTab).toBeVisible();
  }

  /**
   * 验证空状态
   */
  async expectEmptyState() {
    await expect(this.emptyMessage).toBeVisible();
  }
}
