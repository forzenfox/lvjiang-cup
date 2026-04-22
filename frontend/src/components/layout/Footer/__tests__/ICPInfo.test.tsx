import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ICPInfo } from '../ICPInfo';

describe('ICPInfo', () => {
  it('应该正确显示备案号', () => {
    render(<ICPInfo number="鄂 ICP 备 2026017374 号 -1" />);
    expect(screen.getByText('鄂 ICP 备 2026017374 号 -1')).toBeInTheDocument();
  });

  it('备案号不应该是一个链接', () => {
    render(<ICPInfo number="鄂 ICP 备 2026017374 号 -1" />);
    const element = screen.getByText('鄂 ICP 备 2026017374 号 -1');
    expect(element.tagName).not.toBe('A');
  });

  it('应该有正确的 data-testid', () => {
    render(<ICPInfo number="鄂 ICP 备 2026017374 号 -1" />);
    expect(screen.getByTestId('icp-info')).toBeInTheDocument();
  });
});
