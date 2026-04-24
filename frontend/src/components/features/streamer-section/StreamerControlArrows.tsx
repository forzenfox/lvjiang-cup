import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StreamerControlArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export const StreamerControlArrows: React.FC<StreamerControlArrowsProps> = ({
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors backdrop-blur-sm"
        data-testid="streamer-prev-arrow"
        aria-label="上一个主播"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors backdrop-blur-sm"
        data-testid="streamer-next-arrow"
        aria-label="下一个主播"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>
    </>
  );
};
