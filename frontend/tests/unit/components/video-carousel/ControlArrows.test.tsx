import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlArrows } from '@/components/video-carousel/ControlArrows';

describe('ControlArrows', () => {
  it('renders left and right arrows', () => {
    render(<ControlArrows onPrev={vi.fn()} onNext={vi.fn()} canPrev={true} canNext={true} />);

    expect(screen.getByTestId('prev-arrow')).toBeInTheDocument();
    expect(screen.getByTestId('next-arrow')).toBeInTheDocument();
  });

  it('calls onPrev when left arrow is clicked', () => {
    const handlePrev = vi.fn();
    render(<ControlArrows onPrev={handlePrev} onNext={vi.fn()} canPrev={true} canNext={true} />);

    fireEvent.click(screen.getByTestId('prev-arrow'));
    expect(handlePrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when right arrow is clicked', () => {
    const handleNext = vi.fn();
    render(<ControlArrows onPrev={vi.fn()} onNext={handleNext} canPrev={true} canNext={true} />);

    fireEvent.click(screen.getByTestId('next-arrow'));
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('disables prev arrow when canPrev is false', () => {
    render(<ControlArrows onPrev={vi.fn()} onNext={vi.fn()} canPrev={false} canNext={true} />);

    const prevArrow = screen.getByTestId('prev-arrow');
    expect(prevArrow).toBeDisabled();
  });

  it('disables next arrow when canNext is false', () => {
    render(<ControlArrows onPrev={vi.fn()} onNext={vi.fn()} canPrev={true} canNext={false} />);

    const nextArrow = screen.getByTestId('next-arrow');
    expect(nextArrow).toBeDisabled();
  });
});
