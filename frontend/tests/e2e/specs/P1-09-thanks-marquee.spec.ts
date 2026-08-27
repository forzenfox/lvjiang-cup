import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * 鸣谢模块 Marquee 滚动测试
 * 对应测试计划: TEST-THANKS-001 到 TEST-THANKS-005
 *
 * 验证鸣谢区域的水平滚动效果：
 * - 滚动动画正常显示
 * - 赞助商内容完整渲染
 * - 悬停暂停功能正常
 * - 响应式布局适配
 */

test.describe('【P1】鸣谢模块 Marquee 滚动测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.scrollToThanks();
  });

  /**
   * TEST-THANKS-01: 鸣谢区域可见
   * 优先级: P1
   * 验证鸣谢区域正确加载并显示
   */
  test('TEST-THANKS-01: 鸣谢区域可见 @P1', async () => {
    await homePage.expectThanksVisible();
    console.log('✅ 鸣谢区域正确显示');
  });

  /**
   * TEST-THANKS-02: Marquee 滚动容器可见
   * 优先级: P1
   * 验证滚动容器和动画内容存在
   */
  test('TEST-THANKS-02: Marquee 滚动容器可见 @P1', async () => {
    await homePage.expectMarqueeVisible();

    // 验证动画样式存在
    const marqueeContent = homePage.marqueeContent;
    const animationDuration = await marqueeContent.evaluate(
      el => window.getComputedStyle(el).animationDuration
    );

    expect(animationDuration).toBeTruthy();
    console.log(`✅ Marquee 动画时长: ${animationDuration}`);
  });

  /**
   * TEST-THANKS-03: 赞助商内容完整渲染
   * 优先级: P1
   * 验证所有赞助商信息都渲染在 Marquee 中
   */
  test('TEST-THANKS-03: 赞助商内容完整渲染 @P1', async ({ page }) => {
    await homePage.expectMarqueeVisible();

    // 检查是否有赞助商内容（两份重复内容）
    const sponsorTexts = await page
      .locator('[data-testid="marquee-content"] span')
      .allTextContents();

    // 至少应该有一些赞助商文本
    expect(sponsorTexts.length).toBeGreaterThan(0);

    // 验证包含"感谢老板"文案
    const hasThanksText = sponsorTexts.some(text => text.includes('感谢老板'));
    expect(hasThanksText).toBeTruthy();

    console.log(`✅ Marquee 中包含 ${sponsorTexts.length} 个赞助商标语`);
  });

  /**
   * TEST-THANKS-04: 悬停暂停功能
   * 优先级: P1
   * 验证鼠标悬停时动画暂停
   */
  test('TEST-THANKS-04: 悬停暂停功能 @P1', async () => {
    await homePage.expectMarqueeVisible();

    const marqueeContent = homePage.marqueeContent;

    // 获取初始动画状态
    const initialPlayState = await marqueeContent.evaluate(
      el => window.getComputedStyle(el).animationPlayState
    );

    // 鼠标悬停到容器上
    await homePage.marqueeContainer.hover();
    await homePage.page.waitForTimeout(300);

    // 获取悬停后的动画状态
    const hoverPlayState = await marqueeContent.evaluate(
      el => window.getComputedStyle(el).animationPlayState
    );

    console.log(`✅ 悬停前状态: ${initialPlayState}, 悬停后状态: ${hoverPlayState}`);

    // 验证状态变化（如果动画在视口内运行）
    if (initialPlayState === 'running') {
      expect(hoverPlayState).toBe('paused');
      console.log('✅ 悬停暂停功能正常');
    }
  });

  /**
   * TEST-THANKS-05: 动画时长在合理范围
   * 优先级: P1
   * 验证滚动动画时长不小于最小值 15 秒
   */
  test('TEST-THANKS-05: 动画时长在合理范围 @P1', async () => {
    await homePage.expectMarqueeVisible();

    const marqueeContent = homePage.marqueeContent;

    // 获取动画时长
    const durationStr = await marqueeContent.evaluate(
      el => window.getComputedStyle(el).animationDuration
    );

    // 解析时长（如 "30s" -> 30）
    const durationValue = parseFloat(durationStr);

    // 验证时长不小于 15 秒（无最大值限制）
    expect(durationValue).toBeGreaterThanOrEqual(15);

    console.log(`✅ 动画时长 ${durationValue} 秒符合固定速度方案要求`);
  });
});

test.describe('【P2】鸣谢模块响应式测试', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  /**
   * TEST-THANKS-06: 移动端鸣谢区域显示
   * 优先级: P2
   * 验证移动端鸣谢区域正常显示
   */
  test('TEST-THANKS-06: 移动端鸣谢区域显示 @P2', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);

    await homePage.scrollToThanks();
    await homePage.expectThanksVisible();
    await homePage.expectMarqueeVisible();

    console.log('✅ 移动端鸣谢区域正常显示');

    // 恢复桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  /**
   * TEST-THANKS-07: 桌面端速度验证
   * 优先级: P2
   * 验证桌面端（>=768px）使用 130px/s 的速度
   */
  test('TEST-THANKS-07: 桌面端速度验证 @P2', async ({ page }) => {
    // 确保桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForTimeout(1000);

    await homePage.scrollToThanks();
    await homePage.expectMarqueeVisible();

    const marqueeContent = homePage.marqueeContent;
    const durationStr = await marqueeContent.evaluate(
      el => window.getComputedStyle(el).animationDuration
    );
    const durationValue = parseFloat(durationStr);

    // 获取内容宽度来计算预期时长
    const contentWidth = await marqueeContent.evaluate(el => el.scrollWidth / 2);
    // 与 useMarqueeDuration 一致：固定速度换算后再取 Math.max(..., 15) 下限
    const expectedDuration = Math.max(contentWidth / 130, 15); // 桌面端速度 130px/s

    console.log(
      `✅ 桌面端内容宽度: ${contentWidth}px, 预期时长: ${expectedDuration.toFixed(1)}s, 实际时长: ${durationValue}s`
    );

    // 验证时长与预期值接近
    expect(durationValue).toBeCloseTo(expectedDuration, 0);
  });

  /**
   * TEST-THANKS-08: 移动端速度验证
   * 优先级: P2
   * 验证移动端（<768px）使用 80px/s 的速度
   */
  test('TEST-THANKS-08: 移动端速度验证 @P2', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);

    await homePage.scrollToThanks();
    await homePage.expectMarqueeVisible();

    const marqueeContent = homePage.marqueeContent;
    const durationStr = await marqueeContent.evaluate(
      el => window.getComputedStyle(el).animationDuration
    );
    const durationValue = parseFloat(durationStr);

    // 获取内容宽度来计算预期时长
    const contentWidth = await marqueeContent.evaluate(el => el.scrollWidth / 2);
    // 与 useMarqueeDuration 一致：固定速度换算后再取 Math.max(..., 15) 下限
    const expectedDuration = Math.max(contentWidth / 80, 15); // 移动端速度 80px/s

    console.log(
      `✅ 移动端内容宽度: ${contentWidth}px, 预期时长: ${expectedDuration.toFixed(1)}s, 实际时长: ${durationValue}s`
    );

    // 验证时长与预期值接近
    expect(durationValue).toBeCloseTo(expectedDuration, 0);
  });

  /**
   * TEST-THANKS-09: 速度一致性验证
   * 优先级: P2
   * 验证不同视口宽度下速度保持恒定
   */
  test('TEST-THANKS-09: 速度一致性验证 @P2', async ({ page }) => {
    // 先测试桌面端
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForTimeout(1000);
    await homePage.scrollToThanks();
    await homePage.expectMarqueeVisible();

    const desktopMarqueeContent = homePage.marqueeContent;
    const desktopDurationStr = await desktopMarqueeContent.evaluate(
      el => window.getComputedStyle(el).animationDuration
    );
    const desktopDuration = parseFloat(desktopDurationStr);
    const desktopContentWidth = await desktopMarqueeContent.evaluate(el => el.scrollWidth / 2);
    // 桌面端速度 130px/s，且与 useMarqueeDuration 一致取下限 15s
    const desktopExpected = Math.max(desktopContentWidth / 130, 15);

    console.log(`✅ 桌面端时长: ${desktopDuration}s, 预期: ${desktopExpected.toFixed(2)}s`);

    // 切换到移动端
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(1000);
    await homePage.scrollToThanks();
    await homePage.expectMarqueeVisible();

    const mobileMarqueeContent = homePage.marqueeContent;
    const mobileDurationStr = await mobileMarqueeContent.evaluate(
      el => window.getComputedStyle(el).animationDuration
    );
    const mobileDuration = parseFloat(mobileDurationStr);
    const mobileContentWidth = await mobileMarqueeContent.evaluate(el => el.scrollWidth / 2);
    // 移动端速度 80px/s，且与 useMarqueeDuration 一致取下限 15s
    const mobileExpected = Math.max(mobileContentWidth / 80, 15);

    console.log(`✅ 移动端时长: ${mobileDuration}s, 预期: ${mobileExpected.toFixed(2)}s`);

    // 验证两种视口下的动画时长与固定速度（含最小时长下限）换算结果一致
    expect(desktopDuration).toBeCloseTo(desktopExpected, 0);
    expect(mobileDuration).toBeCloseTo(mobileExpected, 0);
  });
});
