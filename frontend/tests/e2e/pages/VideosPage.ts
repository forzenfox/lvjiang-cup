import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 视频管理页面 - Page Object
 */
export class VideosPage extends BasePage {
  // 页面标题
  readonly pageTitle: Locator;

  // 添加视频按钮
  readonly addVideoButton: Locator;

  // 视频表单
  readonly videoForm: Locator;
  readonly titleInput: Locator;
  readonly bvidInput: Locator;
  readonly pageInput: Locator;
  readonly coverUrlInput: Locator;
  readonly orderInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // 视频列表
  readonly videoList: Locator;
  readonly refreshButton: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;

  // 视频轮播
  readonly videoCarousel: Locator;
  readonly prevArrow: Locator;
  readonly nextArrow: Locator;

  constructor(page: Page) {
    super(page);

    // 页面标题
    this.pageTitle = page.locator('h1:has-text("视频管理")');

    // 添加视频按钮 - data-testid="add-video-button"
    this.addVideoButton = page.getByTestId('add-video-button');

    // 视频表单 - data-testid="video-form"
    this.videoForm = page.getByTestId('video-form');
    this.titleInput = page.locator('input[placeholder="留空则使用B站原始标题"]');
    this.bvidInput = page.locator('input[placeholder="输入BV号或粘贴B站视频链接"]');
    this.pageInput = page.locator('input[type="number"]').first();
    this.coverUrlInput = page.locator('input[placeholder*="封面"]');
    this.orderInput = page.locator('input[type="number"]').last();
    this.submitButton = page.getByTestId('submit-button');
    this.cancelButton = page.getByTestId('cancel-button');

    // 视频列表 - data-testid="video-list"
    this.videoList = page.getByTestId('video-list');
    this.refreshButton = page.locator('button:has-text("刷新")');
    this.searchInput = page.locator('input[placeholder*="搜索"]');
    this.filterSelect = page.locator('select');

    // 视频轮播 - data-testid="video-carousel"
    this.videoCarousel = page.getByTestId('video-carousel');
    this.prevArrow = page.getByTestId('prev-arrow');
    this.nextArrow = page.getByTestId('next-arrow');
  }

  /**
   * 导航到视频管理页面
   */
  async goto() {
    await super.goto('/admin/videos');
    await this.waitForLoad();
  }

  /**
   * 验证页面加载成功
   */
  async expectPageLoaded() {
    try {
      await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
    } catch {
      await expect(this.page).toHaveURL(/\/admin\/videos/, { timeout: 10000 });
      console.log('⚠️ 视频管理页面标题未找到，但URL正确');
    }
  }

  /**
   * 点击添加视频按钮
   */
  async clickAddVideo() {
    await this.addVideoButton.click();
  }

  /**
   * 填写视频表单
   */
  async fillVideoForm(data: {
    title?: string;
    bvid?: string;
    page?: number;
    coverUrl?: string;
    order?: number;
  }) {
    if (data.title) {
      await this.titleInput.fill(data.title);
    }
    if (data.bvid) {
      await this.bvidInput.fill(data.bvid);
    }
    if (data.page !== undefined) {
      await this.pageInput.fill(data.page.toString());
    }
    if (data.coverUrl) {
      await this.coverUrlInput.fill(data.coverUrl);
    }
    if (data.order !== undefined) {
      await this.orderInput.fill(data.order.toString());
    }
  }

  /**
   * 提交视频表单
   */
  async submitVideoForm() {
    await this.submitButton.click();
  }

  /**
   * 取消视频表单
   */
  async cancelVideoForm() {
    await this.cancelButton.click();
  }

  /**
   * 关闭视频表单
   */
  async closeVideoForm() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  /**
   * 获取视频列表项
   */
  getVideoItem(videoId: string): Locator {
    return this.page.getByTestId(`video-item-${videoId}`);
  }

  /**
   * 获取编辑按钮
   */
  getEditButton(videoId: string): Locator {
    return this.page.getByTestId(`edit-button-${videoId}`);
  }

  /**
   * 获取删除按钮
   */
  getDeleteButton(videoId: string): Locator {
    return this.page.getByTestId(`delete-button-${videoId}`);
  }

  /**
   * 获取启用/禁用开关
   */
  getToggleStatus(videoId: string): Locator {
    return this.page.getByTestId(`toggle-status-${videoId}`);
  }

  /**
   * 获取缩略图
   */
  getThumbnail(index: number): Locator {
    return this.page.getByTestId(`thumbnail-${index}`);
  }

  /**
   * 等待视频列表加载
   */
  async waitForVideoList() {
    await this.videoList.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      console.log('⚠️ 视频列表未找到');
    });
  }

  /**
   * 点击刷新按钮
   */
  async clickRefresh() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 搜索视频
   */
  async searchVideo(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(500);
  }

  /**
   * 切换视频启用状态
   */
  async toggleVideoStatus(videoId: string) {
    await this.getToggleStatus(videoId).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 删除视频
   */
  async deleteVideo(videoId: string, confirm = true) {
    await this.getDeleteButton(videoId).click();
    await this.page.waitForTimeout(300);
    if (confirm) {
      await this.page.locator('button:has-text("确认"), button:has-text("确定")').click();
      await this.page.waitForTimeout(500);
    } else {
      await this.page.locator('button:has-text("取消")').click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * 编辑视频
   */
  async editVideo(videoId: string) {
    await this.getEditButton(videoId).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 验证视频表单可见
   */
  async expectFormVisible() {
    await expect(this.videoForm).toBeVisible({ timeout: 5000 });
  }

  /**
   * 验证视频表单不可见
   */
  async expectFormHidden() {
    await expect(this.videoForm).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * 验证视频轮播存在
   */
  async expectCarouselVisible() {
    await expect(this.videoCarousel).toBeVisible({ timeout: 10000 });
  }

  /**
   * 验证箭头可见
   */
  async expectArrowsVisible() {
    await expect(this.prevArrow).toBeVisible();
    await expect(this.nextArrow).toBeVisible();
  }

  /**
   * 点击上一个视频箭头
   */
  async clickPrevArrow() {
    await this.prevArrow.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 点击下一个视频箭头
   */
  async clickNextArrow() {
    await this.nextArrow.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 获取视频数量
   */
  async getVideoCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return await rows.count();
  }
}
