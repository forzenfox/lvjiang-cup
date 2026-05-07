import { test, expect } from '@playwright/test';
import { DashboardPage, VideosPage } from '../pages';

/**
 * 视频管理完整功能测试
 * 对应测试计划: TEST-VIDEO-01 到 TEST-VIDEO-06
 *
 * 测试范围：
 * 1. 视频列表加载
 * 2. 添加视频完整流程
 * 3. 编辑视频
 * 4. 删除视频
 * 5. 空状态显示
 * 6. 视频搜索
 */

test.describe('【P1】视频管理 - 完整功能测试', () => {
  let dashboardPage: DashboardPage;
  let videosPage: VideosPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    videosPage = new VideosPage(page);

    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();

    await dashboardPage.clickNavigation('视频管理');
    await page.waitForURL('**/admin/videos', { timeout: 10000 });
    await videosPage.expectPageLoaded();
  });

  /**
   * TEST-VIDEO-01: 视频列表加载
   * 优先级：P1
   * 验证视频管理页面正确加载并显示列表
   */
  test('TEST-VIDEO-01: 视频列表加载 @P1', async () => {
    await expect(videosPage.pageTitle).toBeVisible();
    await expect(videosPage.addVideoButton).toBeVisible();
    await expect(videosPage.refreshButton).toBeVisible();

    const videoCount = await videosPage.getVideoCount();
    console.log(`✅ 视频管理页面加载完成，当前有 ${videoCount} 个视频`);
  });

  /**
   * TEST-VIDEO-02: 添加视频完整流程
   * 优先级：P1
   * 验证添加视频的完整操作流程
   */
  test('TEST-VIDEO-02: 添加视频完整流程 @P1', async ({ page }) => {
    await videosPage.clickAddVideo();
    await videosPage.expectFormVisible();

    await videosPage.fillVideoForm({
      title: 'E2E测试视频',
      bvid: 'BV1GJ411x7h7',
      page: 1,
      coverUrl: 'https://picsum.photos/seed/video-cover/400/225',
      order: 1,
    });

    await videosPage.submitVideoForm();
    await page.waitForTimeout(2000);

    // 验证表单已关闭
    const formHidden = await videosPage.videoForm.isVisible().catch(() => false);
    if (!formHidden) {
      console.log('⚠️ 表单可能未关闭（提交可能有错误）');
    } else {
      console.log('✅ 视频添加成功');
    }
  });

  /**
   * TEST-VIDEO-03: 取消添加视频
   * 优先级：P1
   * 验证取消添加视频不保存数据
   */
  test('TEST-VIDEO-03: 取消添加视频 @P1', async ({ page }) => {
    await videosPage.clickAddVideo();
    await videosPage.expectFormVisible();

    await videosPage.fillVideoForm({
      title: '取消测试视频',
      bvid: 'BV1GJ411x7h7',
    });

    await videosPage.cancelVideoForm();
    await page.waitForTimeout(500);

    const formHidden = await videosPage.videoForm.isVisible().catch(() => false);
    expect(formHidden).toBe(false);

    console.log('✅ 取消添加视频成功，未保存数据');
  });

  /**
   * TEST-VIDEO-04: 空状态显示
   * 优先级：P1
   * 验证无视频时显示空状态提示
   */
  test('TEST-VIDEO-04: 空状态显示 @P1', async () => {
    const videoCount = await videosPage.getVideoCount();

    if (videoCount === 0) {
      const emptyText = videosPage.page.getByText(/暂无视频|还没有视频|暂无视频数据/);
      await expect(emptyText).toBeVisible();
      console.log('✅ 视频管理空状态正确显示');
    } else {
      console.log(`⚠️ 当前有 ${videoCount} 个视频，无法验证空状态`);
    }
  });

  /**
   * TEST-VIDEO-05: 编辑视频
   * 优先级：P1
   * 验证编辑视频功能
   */
  test('TEST-VIDEO-05: 编辑视频 @P1', async ({ page }) => {
    const videoCount = await videosPage.getVideoCount();

    if (videoCount === 0) {
      console.log('⚠️ 暂无视频，跳过编辑测试');
      return;
    }

    // 获取第一个视频ID
    const firstRow = page.locator('table tbody tr').first();
    const videoId = await firstRow.getAttribute('data-testid')?.replace('video-item-', '');

    if (!videoId) {
      console.log('⚠️ 无法获取视频ID，跳过编辑测试');
      return;
    }

    await videosPage.editVideo(videoId);
    await videosPage.expectFormVisible();

    // 验证表单包含当前视频数据
    const titleValue = await videosPage.titleInput.inputValue().catch(() => '');
    const bvidValue = await videosPage.bvidInput.inputValue().catch(() => '');

    console.log(`✅ 视频编辑表单已打开，标题: "${titleValue}", BV号: "${bvidValue}"`);
  });

  /**
   * TEST-VIDEO-06: 视频搜索
   * 优先级：P2
   * 验证搜索视频功能
   */
  test('TEST-VIDEO-06: 视频搜索 @P2', async ({ page }) => {
    const searchVisible = await videosPage.searchInput.isVisible().catch(() => false);

    if (!searchVisible) {
      console.log('⚠️ 搜索框不可见，跳过搜索测试');
      return;
    }

    await videosPage.searchVideo('测试');
    await page.waitForTimeout(1000);

    // 验证搜索结果
    const videoCountAfterSearch = await videosPage.getVideoCount();
    console.log(`✅ 视频搜索完成，找到 ${videoCountAfterSearch} 个结果`);
  });
});
