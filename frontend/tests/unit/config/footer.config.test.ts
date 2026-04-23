import { describe, it, expect } from 'vitest';
import { FOOTER_CONFIG } from '@/config/footer';

describe('FOOTER_CONFIG', () => {
  it('应该包含所有必要的配置项', () => {
    expect(FOOTER_CONFIG).toHaveProperty('socialLinks');
    expect(FOOTER_CONFIG).toHaveProperty('contact');
    expect(FOOTER_CONFIG).toHaveProperty('wechat');
    expect(FOOTER_CONFIG).toHaveProperty('icp');
    expect(FOOTER_CONFIG).toHaveProperty('layout');
  });

  it('socialLinks 应该包含 3 个链接', () => {
    expect(FOOTER_CONFIG.socialLinks).toHaveLength(3);
  });

  it('wechat 配置应该包含二维码路径', () => {
    expect(FOOTER_CONFIG.wechat.qrCode).toBeDefined();
    expect(FOOTER_CONFIG.wechat.name).toBe('驴驴电竞');
    expect(FOOTER_CONFIG.wechat.size).toBe(120);
  });

  it('contact 配置应该包含邮箱', () => {
    expect(FOOTER_CONFIG.contact.email).toBe('lvjiangshangwu@163.com');
    expect(FOOTER_CONFIG.contact.isLink).toBe(false);
  });

  it('icp 配置应该包含备案号', () => {
    expect(FOOTER_CONFIG.icp.number).toBe('鄂 ICP 备 2026017374 号 -1');
    expect(FOOTER_CONFIG.icp.isLink).toBe(false);
  });

  it('layout 配置应该包含布局参数', () => {
    expect(FOOTER_CONFIG.layout.maxWidth).toBe('1400px');
    expect(FOOTER_CONFIG.layout.paddingX).toBe('48px');
    expect(FOOTER_CONFIG.layout.paddingY).toBe('48px');
    expect(FOOTER_CONFIG.layout.gap).toBe('32px');
  });

  it('socialLinks 应该包含正确的平台信息', () => {
    const bilibiliLink = FOOTER_CONFIG.socialLinks.find(link => link.platform === 'bilibili');
    expect(bilibiliLink).toBeDefined();
    expect(bilibiliLink?.name).toBe('胡凯利_洞主');
    expect(bilibiliLink?.url).toBe('https://space.bilibili.com/393671271');

    const douyinLinks = FOOTER_CONFIG.socialLinks.filter(link => link.platform === 'douyin');
    expect(douyinLinks).toHaveLength(2);
  });
});
