import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '../ui/button';
import { mockService } from '../../mock/service';
import { StreamInfo } from '../../types';

const HeroSection: React.FC = () => {
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);

  useEffect(() => {
    mockService.getStreamInfo().then(setStreamInfo);
  }, []);

  const handleWatchLive = () => {
    if (streamInfo?.url) {
      window.open(streamInfo.url, '_blank');
    }
  };

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=league+of+legends+champions+battle+epic+scene+blue+and+gold+theme&image_size=landscape_16_9" 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 animate-shine mb-6 tracking-tight drop-shadow-lg">
          驴酱杯
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light tracking-wide">
          驴酱公会终极对决
        </p>
        
        {streamInfo?.isLive ? (
          <div className="flex flex-col items-center space-y-4">
            <Button 
              variant="cta" 
              size="lg" 
              className="text-xl px-12 py-8 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 transform transition-transform"
              onClick={handleWatchLive}
            >
              <Play className="mr-3 h-6 w-6 fill-current" />
              观看直播
            </Button>
            <p className="text-yellow-400 font-semibold animate-pulse">
              🔴 正在直播：{streamInfo.platform}
            </p>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <p className="text-xl text-gray-300">比赛即将开始</p>
            <p className="text-sm text-gray-400 mt-2">查看下方赛程安排</p>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
