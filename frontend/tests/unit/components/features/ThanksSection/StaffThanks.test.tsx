import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StaffThanks } from '@/components/features/ThanksSection/StaffThanks';
import type { StaffConfig } from '@/data/types';

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

describe('StaffThanks', () => {
  const mockStaff: StaffConfig[] = [
    { id: 1, role: '赛事策划', name: '张三' },
    { id: 2, role: '技术支持', name: '李四' },
    { id: 3, role: '运营推广', name: '王五' },
  ];

  const mockEmptyStaff: StaffConfig[] = [
    { id: 1, role: '赛事策划', name: '（待补充）' },
    { id: 2, role: '技术支持', name: '（待补充）' },
    { id: 3, role: '运营推广', name: '（待补充）' },
  ];

  const mockMixedStaff: StaffConfig[] = [
    { id: 1, role: '赛事策划', name: '（待补充）' },
    { id: 2, role: '技术支持', name: '李四' },
    { id: 3, role: '运营推广', name: '（待补充）' },
  ];

  describe('空数据状态', () => {
    it('工作人员数组为空时不应该渲染', () => {
      const { container } = render(<StaffThanks staff={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('正常渲染', () => {
    it('应该渲染幕后工作人员容器', () => {
      render(<StaffThanks staff={mockStaff} />);

      expect(screen.getByTestId('staff-thanks-container')).toBeInTheDocument();
    });

    it('应该渲染标题', () => {
      render(<StaffThanks staff={mockStaff} />);

      expect(screen.getByTestId('staff-thanks-title')).toBeInTheDocument();
    });

    it('应该渲染所有工作人员', () => {
      render(<StaffThanks staff={mockStaff} />);

      mockStaff.forEach(staff => {
        expect(screen.getByText(staff.role)).toBeInTheDocument();
        expect(screen.getByText(staff.name)).toBeInTheDocument();
      });
    });

    it('应该使用SVG图标替代emoji', () => {
      render(<StaffThanks staff={mockStaff} />);

      const container = screen.getByTestId('staff-thanks-container');
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('空状态处理', () => {
    it('所有人员都是占位符时应该显示"即将公布"', () => {
      render(<StaffThanks staff={mockEmptyStaff} />);

      expect(screen.getByText('幕后工作人员名单即将公布')).toBeInTheDocument();
      expect(screen.getByText('敬请期待')).toBeInTheDocument();
    });

    it('部分人员为占位符时应该正常显示', () => {
      render(<StaffThanks staff={mockMixedStaff} />);

      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('赛事策划')).toBeInTheDocument();
    });

    it('空状态应该渲染SVG图标', () => {
      render(<StaffThanks staff={mockEmptyStaff} />);

      const container = screen.getByTestId('staff-thanks-container');
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('滚动动画', () => {
    it('应该有滚动容器', () => {
      render(<StaffThanks staff={mockStaff} />);

      const container = screen.getByTestId('staff-thanks-container');
      const scrollContainer = container.querySelector('div[style*="max-height"]');
      expect(scrollContainer).not.toBeNull();
    });

    it('滚动容器应该限制最大高度', () => {
      render(<StaffThanks staff={mockStaff} />);

      const container = screen.getByTestId('staff-thanks-container');
      const scrollContainer = container.querySelector('div[style*="max-height: 280px"]');
      expect(scrollContainer).not.toBeNull();
    });
  });
});
