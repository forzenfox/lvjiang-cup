import React from 'react';
import type { VideoItem } from './VideoPlayer';

interface IndicatorProps {
  videos: VideoItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const Indicator: React.FC<IndicatorProps> = ({ videos, currentIndex, onSelect }) => {
  return (
    <div className="flex justify-center gap-2 p-4" data-testid="indicator">
      {videos.map((video, index) => (
        <button
          key={video.bvid}
          onClick={() => onSelect(index)}
          className={`w-3 h-3 rounded-full transition-colors ${
            index === currentIndex ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'
          }`}
          data-testid="indicator-dot"
          aria-label={`跳转到视频 ${index + 1}`}
        />
      ))}
    </div>
  );
};
