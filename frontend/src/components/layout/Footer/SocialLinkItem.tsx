import React from 'react';
import { motion } from 'framer-motion';

interface SocialLinkItemProps {
  platform: string;
  name: string;
  url: string;
  icon: string;
}

export const SocialLinkItem: React.FC<SocialLinkItemProps> = ({
  platform,
  name,
  url,
  icon,
}) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 text-white hover:text-gold group"
      whileHover={{ scale: 1.15, y: -2 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      data-testid="social-link-item"
    >
      <img
        src={icon}
        alt={`${platform} 图标`}
        className="w-8 h-8 object-contain"
        loading="lazy"
      />
      <span className="text-sm group-hover:underline">{name}</span>
    </motion.a>
  );
};
