import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ControlArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export const ControlArrows: React.FC<ControlArrowsProps> = ({
  onPrev,
  onNext,
  canPrev,
  canNext,
}) => {
  return (
    <>
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed rounded-r-lg transition-colors"
        data-testid="prev-arrow"
        aria-label="上一个视频"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-lg transition-colors"
        data-testid="next-arrow"
        aria-label="下一个视频"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </>
  );
};