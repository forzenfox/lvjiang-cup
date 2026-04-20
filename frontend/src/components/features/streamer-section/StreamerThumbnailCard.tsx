import React from 'react';
import { type Streamer, StreamerType } from '@/api/types';

interface StreamerThumbnailCardProps {
  streamer: Streamer;
  onClick: () => void;
}

export const StreamerThumbnailCard: React.FC<StreamerThumbnailCardProps> = ({ streamer, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-video rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer group opacity-70 hover:opacity-100"
      data-testid="streamer-thumbnail-card"
    >
      <img
        src={streamer.posterUrl}
        alt={streamer.nickname}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="text-white text-sm font-medium truncate block">{streamer.nickname}</span>
      </div>
      <div className="absolute top-3 left-3 flex space-x-2">
        {streamer.streamerType === StreamerType.INTERNAL && (
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
            驴酱
          </span>
        )}
        {streamer.streamerType === StreamerType.GUEST && (
          <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
            嘉宾
          </span>
        )}
      </div>
    </button>
  );
};
