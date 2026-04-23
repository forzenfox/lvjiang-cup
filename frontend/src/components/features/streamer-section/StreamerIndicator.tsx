import React from 'react';
import { type Streamer } from '@/api/types';

interface StreamerIndicatorProps {
  streamers: Streamer[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

/**
 * 验证主播数据是否有效（用于指示器渲染）
 * @param streamer 主播数据
 * @returns 数据是否有效
 */
const isValidIndicatorStreamer = (streamer: Streamer | null | undefined): streamer is Streamer => {
  return !!(
    streamer &&
    streamer.id &&
    typeof streamer.id === 'string'
  );
};

export const StreamerIndicator: React.FC<StreamerIndicatorProps> = ({
  streamers,
  currentIndex,
  onSelect,
}) => {
  // 过滤掉无效的主播数据
  const validStreamers = streamers.filter(isValidIndicatorStreamer);

  return (
    <div className="flex justify-center gap-3 p-5" data-testid="streamer-indicator">
      {validStreamers.map((streamer, index) => (
        <button
          key={streamer.id}
          onClick={() => onSelect(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? 'bg-white scale-125 shadow-lg'
              : 'bg-gray-500 hover:bg-gray-400'
          }`}
          data-testid="indicator-dot"
          aria-label={`跳转到主播 ${streamer.nickname || '未知'}`}
        />
      ))}
    </div>
  );
};
