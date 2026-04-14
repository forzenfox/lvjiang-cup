import React from 'react';
import type { VideoItem } from './VideoPlayer';

interface VideoThumbnailProps {
  video: VideoItem;
  isActive?: boolean;
  onClick: (video: VideoItem) => void;
  index?: number;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  video,
  isActive = false,
  onClick,
  index,
}) => {
  return (
    <button
      onClick={() => onClick(video)}
      className={`relative w-full aspect-video rounded-lg overflow-hidden transition-all ${
        isActive ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-400'
      }`}
      data-testid={index !== undefined ? `thumbnail-${index}` : 'video-thumbnail'}
    >
      {video.cover && (
        <img
          src={video.cover}
          alt="thumbnail"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <span className="text-white text-sm truncate block">{video.title}</span>
      </div>
    </button>
  );
};