import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { type Streamer, StreamerType } from '@/api/types';

interface StreamerMainCardProps {
  streamer: Streamer;
}

/**
 * 验证主播数据是否完整
 * @param streamer 主播数据
 * @returns 数据是否有效
 */
const isValidStreamer = (streamer: Streamer | null | undefined): streamer is Streamer => {
  return !!(
    streamer &&
    streamer.posterUrl &&
    streamer.nickname &&
    streamer.liveUrl &&
    typeof streamer.posterUrl === 'string' &&
    typeof streamer.nickname === 'string' &&
    typeof streamer.liveUrl === 'string'
  );
};

export const StreamerMainCard: React.FC<StreamerMainCardProps> = ({ streamer }) => {
  // 数据验证：如果数据不完整，返回 null 不渲染
  if (!isValidStreamer(streamer)) {
    return null;
  }

  return (
    <Card
      className="bg-white/5 border-white/10 overflow-hidden group cursor-pointer"
      data-testid="streamer-main-card"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={streamer.posterUrl}
          alt={streamer.nickname}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex space-x-2">
          {streamer.streamerType === StreamerType.INTERNAL && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              驴酱
            </span>
          )}
          {streamer.streamerType === StreamerType.GUEST && (
            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              嘉宾
            </span>
          )}
        </div>
      </div>

      <CardHeader className="pb-3 pt-6">
        <CardTitle className="text-3xl font-bold text-center text-white">
          {streamer.nickname}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-0">
        <p className="text-base text-gray-300 leading-relaxed line-clamp-5 min-h-[5rem]">
          {streamer.bio}
        </p>
        <Button
          className="w-full bg-secondary hover:bg-secondary/80 text-white py-3 text-lg font-semibold transition-all duration-200"
          onClick={e => {
            e.stopPropagation();
            window.open(streamer.liveUrl, '_blank');
          }}
        >
          进入直播间
        </Button>
      </CardContent>
    </Card>
  );
};
