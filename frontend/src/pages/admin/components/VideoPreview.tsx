import React from 'react';
import { Video } from '@/api/videos';
import { Play } from 'lucide-react';

interface VideoPreviewProps {
  video: Video | null;
  autoPlay?: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video, autoPlay = false }) => {
  if (!video) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
        <div className="text-center text-gray-500">
          <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无视频预览</p>
        </div>
      </div>
    );
  }

  const src = `https://player.bilibili.com/player.html?bvid=${video.bvid}&page=${video.page || 1}${autoPlay ? '&autoplay=1' : ''}`;

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <iframe
          src={src}
          title={`${video.title} - Bilibili Player`}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <h4 className="text-white font-medium truncate">{video.title}</h4>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
          <span>BV: {video.bvid}</span>
          <span>Page: {video.page || 1}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;