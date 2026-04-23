import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SocialLinkItemProps {
  platform: string;
  name: string;
  url: string;
  icon: string;
}

const getFallbackIcon = (platform: string): string => {
  switch (platform) {
    case 'bilibili':
      return '📺';
    case 'douyin':
      return '🎵';
    case 'wechat':
      return '💬';
    default:
      return '🔗';
  }
};

export const SocialLinkItem: React.FC<SocialLinkItemProps> = ({ platform, name, url, icon }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-white group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      data-testid="social-link-item"
    >
      <div
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
        group-hover:bg-white/20 transition-colors duration-200
        border border-white/5 group-hover:border-white/15"
      >
        {hasError ? (
          <div className="w-5 h-5 flex items-center justify-center text-sm">
            {getFallbackIcon(platform)}
          </div>
        ) : (
          <img
            src={icon}
            alt={`${platform} 图标`}
            className="w-5 h-5 object-contain"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <span
        className="text-xs text-gray-300 group-hover:text-white
        transition-colors duration-200 whitespace-nowrap"
      >
        {name}
      </span>
    </motion.a>
  );
};
