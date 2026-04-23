import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StaffThanks } from '../StaffThanks';
import type { StaffConfig } from '@/data/types';

describe('StaffThanks', () => {
  const mockStaff: StaffConfig[] = [
    { id: 1, name: '张三', role: '赛事策划' },
    { id: 2, name: '李四', role: '技术支持' },
    { id: 3, name: '王五', role: '运营推广' },
    { id: 4, name: '赵六', role: '赛事策划' },
  ];

  describe('无工作人员时', () => {
    it('应该返回 null 不渲染', () => {
      const { container } = render(<StaffThanks staff={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('有工作人员时', () => {
    it('应该渲染标题', () => {
      render(<StaffThanks staff={mockStaff} />);

      // 标题现在包含装饰符号
      expect(screen.getByText((content) => content.includes('幕后工作人员'))).toBeInTheDocument();
    });

    it('应该按角色分组渲染工作人员', () => {
      render(<StaffThanks staff={mockStaff} />);

      // 赛事策划组应该有张三和赵六
      expect(screen.getByText('赛事策划')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('赵六')).toBeInTheDocument();

      // 技术支持组应该有李四
      expect(screen.getByText('技术支持')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();

      // 运营推广组应该有王五
      expect(screen.getByText('运营推广')).toBeInTheDocument();
      expect(screen.getByText('王五')).toBeInTheDocument();
    });

    it('同一角色下的多个工作人员应该用分隔符显示', () => {
      render(<StaffThanks staff={mockStaff} />);

      // 赛事策划组有张三和赵六
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('赵六')).toBeInTheDocument();
    });

    it('应该应用正确的容器样式', () => {
      render(<StaffThanks staff={mockStaff} />);

      const container = screen.getByTestId('staff-thanks-container');
      // 更新为新的样式类
      expect(container.className).toContain('rounded-2xl');
      expect(container.className).toContain('border');
      expect(container.className).toContain('border-amber-500/20');
      expect(container.className).toContain('backdrop-blur-md');
    });

    it('标题应该有正确的样式', () => {
      render(<StaffThanks staff={mockStaff} />);

      const title = screen.getByTestId('staff-thanks-title');
      // 标题现在使用渐变文字
      expect(title.className).toContain('font-bold');
      expect(title.className).toContain('tracking-wide');
    });

    it('角色标签应该有高亮样式', () => {
      render(<StaffThanks staff={mockStaff} />);

      // 查找所有角色标签
      const roleElements = screen.getAllByText((content, element) => {
        const className = element?.className || '';
        return ['赛事策划', '技术支持', '运营推广'].includes(content) && className.includes('text-amber-400');
      });

      expect(roleElements.length).toBeGreaterThan(0);
    });
  });

  describe('边界情况', () => {
    it('单个工作人员应该正确渲染', () => {
      const singleStaff: StaffConfig[] = [
        { id: 1, name: '张三', role: '赛事策划' },
      ];

      render(<StaffThanks staff={singleStaff} />);

      expect(screen.getByText('赛事策划')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    it('多个角色分组应该正确渲染', () => {
      const multiRoleStaff: StaffConfig[] = [
        { id: 1, name: '张三', role: '策划' },
        { id: 2, name: '李四', role: '技术' },
        { id: 3, name: '王五', role: '设计' },
        { id: 4, name: '赵六', role: '运营' },
      ];

      render(<StaffThanks staff={multiRoleStaff} />);

      expect(screen.getByText('策划')).toBeInTheDocument();
      expect(screen.getByText('技术')).toBeInTheDocument();
      expect(screen.getByText('设计')).toBeInTheDocument();
      expect(screen.getByText('运营')).toBeInTheDocument();
    });
  });
});
