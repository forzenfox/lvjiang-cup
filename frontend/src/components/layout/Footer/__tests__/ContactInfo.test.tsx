import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactInfo } from '../ContactInfo';

describe('ContactInfo', () => {
  it('应该正确显示邮箱', () => {
    render(<ContactInfo email="lvjiangshangwu@163.com" />);
    expect(screen.getByText(/lvjiangshangwu@163.com/)).toBeInTheDocument();
  });

  it('邮箱不应该是一个链接', () => {
    render(<ContactInfo email="lvjiangshangwu@163.com" />);
    const emailElement = screen.getByText(/lvjiangshangwu@163.com/);
    expect(emailElement.closest('a')).toBeNull();
  });

  it('应该有正确的 data-testid', () => {
    render(<ContactInfo email="lvjiangshangwu@163.com" />);
    expect(screen.getByTestId('contact-info')).toBeInTheDocument();
  });

  it('应该显示邮箱图标', () => {
    render(<ContactInfo email="lvjiangshangwu@163.com" />);
    const icon = document.querySelector('[data-testid="contact-info"] svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-blue-400');
  });
});
