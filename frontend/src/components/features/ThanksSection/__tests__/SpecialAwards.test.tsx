import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpecialAwards } from '../SpecialAwards';
import type { SponsorConfig } from '@/data/types';

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('SpecialAwards', () => {
  const mockSponsorsWithoutAwards: SponsorConfig[] = [
    { id: 1, sponsorName: '斗鱼官方', sponsorContent: '7W' },
    { id: 2, sponsorName: '秀木老板', sponsorContent: '2W' },
  ];

  const mockSponsorsWithAwards: SponsorConfig[] = [
    { id: 1, sponsorName: '斗鱼官方', sponsorContent: '7W' },
    { id: 2, sponsorName: '为何如此衰', sponsorContent: '8K', specialAward: '8强每个队伍1K' },
    { id: 3, sponsorName: '董B登', sponsorContent: '1K', specialAward: '冠军每人750g蓝莓果干+250g参片' },
    { id: 4, sponsorName: 'MT', sponsorContent: '2K', specialAward: '4强每人一份贡菜千层肚' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
  });

  describe('无特殊奖项时', () => {
    it('应该返回 null 不渲染', () => {
      const { container } = render(<SpecialAwards sponsors={mockSponsorsWithoutAwards} />);
      expect(container.firstChild).toBeNull();
    });

    it('空数组应该返回 null', () => {
      const { container } = render(<SpecialAwards sponsors={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('有特殊奖项时', () => {
    it('应该渲染标题', () => {
      render(<SpecialAwards sponsors={mockSponsorsWithAwards} />);

      // 标题现在包含装饰符号
      expect(screen.getByText((content) => content.includes('特殊奖项'))).toBeInTheDocument();
    });

    it('应该渲染所有有特殊奖项的赞助商', () => {
      render(<SpecialAwards sponsors={mockSponsorsWithAwards} />);

      const expectedAwards = [
        { name: '为何如此衰', award: '8强每个队伍1K' },
        { name: '董B登', award: '冠军每人750g蓝莓果干+250g参片' },
        { name: 'MT', award: '4强每人一份贡菜千层肚' },
      ];

      expectedAwards.forEach(({ name, award }) => {
        expect(screen.getByText(name)).toBeInTheDocument();
        // 使用函数匹配器来处理文本可能被分割的情况
        expect(screen.getByText((content) => content.includes(award))).toBeInTheDocument();
      });
    });

    it('不应该渲染没有特殊奖项的赞助商', () => {
      render(<SpecialAwards sponsors={mockSponsorsWithAwards} />);

      // 斗鱼官方没有 specialAward，不应该出现在列表中
      const sponsorName = screen.queryByText('斗鱼官方');
      expect(sponsorName).not.toBeInTheDocument();
    });

    it('应该应用正确的样式类', () => {
      render(<SpecialAwards sponsors={mockSponsorsWithAwards} />);

      const container = screen.getByTestId('special-awards-container');
      // 更新为新的样式类
      expect(container.className).toContain('rounded-2xl');
      expect(container.className).toContain('border');
      expect(container.className).toContain('border-pink-500/20');
      expect(container.className).toContain('backdrop-blur-md');
    });

    it('标题应该有正确的样式', () => {
      render(<SpecialAwards sponsors={mockSponsorsWithAwards} />);

      const title = screen.getByTestId('special-awards-title');
      // 标题现在使用渐变文字
      expect(title.className).toContain('font-bold');
      expect(title.className).toContain('tracking-wide');
    });
  });

  describe('移动端展开/收起功能', () => {
    it('移动端应该显示展开按钮当奖项超过3个', () => {
      window.innerWidth = 375;

      const manyAwards: SponsorConfig[] = [
        { id: 1, sponsorName: '赞助1', sponsorContent: '1K', specialAward: '奖项1' },
        { id: 2, sponsorName: '赞助2', sponsorContent: '1K', specialAward: '奖项2' },
        { id: 3, sponsorName: '赞助3', sponsorContent: '1K', specialAward: '奖项3' },
        { id: 4, sponsorName: '赞助4', sponsorContent: '1K', specialAward: '奖项4' },
      ];

      render(<SpecialAwards sponsors={manyAwards} />);

      const button = screen.getByTestId('expand-button');
      expect(button).toBeInTheDocument();
      expect(button.textContent).toContain('查看更多');
    });

    it('点击展开按钮应该显示所有奖项', () => {
      window.innerWidth = 375;

      const manyAwards: SponsorConfig[] = [
        { id: 1, sponsorName: '赞助1', sponsorContent: '1K', specialAward: '奖项1' },
        { id: 2, sponsorName: '赞助2', sponsorContent: '1K', specialAward: '奖项2' },
        { id: 3, sponsorName: '赞助3', sponsorContent: '1K', specialAward: '奖项3' },
        { id: 4, sponsorName: '赞助4', sponsorContent: '1K', specialAward: '奖项4' },
      ];

      render(<SpecialAwards sponsors={manyAwards} />);

      // 初始只显示3个
      expect(screen.getByText('赞助1')).toBeInTheDocument();
      expect(screen.queryByText('赞助4')).not.toBeInTheDocument();

      // 点击展开
      const button = screen.getByTestId('expand-button');
      fireEvent.click(button);

      // 现在应该显示所有4个
      expect(screen.getByText('赞助4')).toBeInTheDocument();
      expect(button.textContent).toContain('收起');
    });

    it('PC端不应该显示展开按钮', () => {
      window.innerWidth = 1024;

      const manyAwards: SponsorConfig[] = [
        { id: 1, sponsorName: '赞助1', sponsorContent: '1K', specialAward: '奖项1' },
        { id: 2, sponsorName: '赞助2', sponsorContent: '1K', specialAward: '奖项2' },
        { id: 3, sponsorName: '赞助3', sponsorContent: '1K', specialAward: '奖项3' },
        { id: 4, sponsorName: '赞助4', sponsorContent: '1K', specialAward: '奖项4' },
      ];

      render(<SpecialAwards sponsors={manyAwards} />);

      const button = screen.queryByTestId('expand-button');
      expect(button).not.toBeInTheDocument();
    });

    it('移动端奖项不超过3个时不显示展开按钮', () => {
      window.innerWidth = 375;

      const fewAwards: SponsorConfig[] = [
        { id: 1, sponsorName: '赞助1', sponsorContent: '1K', specialAward: '奖项1' },
        { id: 2, sponsorName: '赞助2', sponsorContent: '1K', specialAward: '奖项2' },
      ];

      render(<SpecialAwards sponsors={fewAwards} />);

      const button = screen.queryByTestId('expand-button');
      expect(button).not.toBeInTheDocument();
    });
  });
});
