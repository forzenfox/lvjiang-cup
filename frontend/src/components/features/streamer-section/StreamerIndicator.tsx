import React from 'react';
import { type Streamer } from '@/api/types';

interface StreamerIndicatorProps {
  streamers: Streamer[];
  currentIndex: number;
  onSelect: (index: number) => void;
  maxVisible?: number;
}

/**
 * 验证主播数据是否有效（用于指示器渲染）
 * @param streamer 主播数据
 * @returns 数据是否有效
 */
const isValidIndicatorStreamer = (streamer: Streamer | null | undefined): streamer is Streamer => {
  return !!(streamer && streamer.id && typeof streamer.id === 'string');
};

export const StreamerIndicator: React.FC<StreamerIndicatorProps> = ({
  streamers,
  currentIndex,
  onSelect,
  maxVisible = 7,
}) => {
  // 过滤掉无效的主播数据
  const validStreamers = streamers.filter(isValidIndicatorStreamer);
  const totalCount = validStreamers.length;

  // 计算可见窗口的起始和结束索引
  const getVisibleRange = () => {
    if (totalCount <= maxVisible) {
      return { start: 0, end: totalCount };
    }

    const halfVisible = Math.floor(maxVisible / 2);
    let start = currentIndex - halfVisible;
    let end = start + maxVisible;

    // 边界处理：确保不超出范围
    if (start < 0) {
      start = 0;
      end = maxVisible;
    }
    if (end > totalCount) {
      end = totalCount;
      start = totalCount - maxVisible;
    }

    return { start, end };
  };

  const { start, end } = getVisibleRange();
  const visibleStreamers = validStreamers.slice(start, end);

  return (
    <div className="flex justify-center gap-3 p-5" data-testid="streamer-indicator">
      {visibleStreamers.map((streamer, localIndex) => {
        const originalIndex = start + localIndex;
        return (
          <button
            key={streamer.id}
            onClick={() => onSelect(originalIndex)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              originalIndex === currentIndex
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-gray-500 hover:bg-gray-400'
            }`}
            data-testid="indicator-dot"
            aria-label={`跳转到主播 ${streamer.nickname || '未知'}`}
          />
        );
      })}
    </div>
  );
};
