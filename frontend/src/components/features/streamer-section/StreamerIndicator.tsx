import React from 'react';
import { type Streamer } from '@/api/types';

interface StreamerIndicatorProps {
  streamers: Streamer[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const StreamerIndicator: React.FC<StreamerIndicatorProps> = ({
  streamers,
  currentIndex,
  onSelect,
}) => {
  return (
    <div className="flex justify-center gap-3 p-5" data-testid="streamer-indicator">
      {streamers.map((streamer, index) => (
        <button
          key={streamer.id}
          onClick={() => onSelect(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? 'bg-white scale-125 shadow-lg'
              : 'bg-gray-500 hover:bg-gray-400'
          }`}
          data-testid="indicator-dot"
          aria-label={`跳转到主播 ${streamer.nickname}`}
        />
      ))}
    </div>
  );
};
