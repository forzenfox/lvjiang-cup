import React from 'react';

interface IconProps {
  className?: string;
}

// LOL官方上单图标
export const TopIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/top.png" alt="top" className={className} />
);

// LOL官方打野图标
export const JungleIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/jungle.png" alt="jungle" className={className} />
);

// LOL官方中单图标
export const MidIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/mid.png" alt="mid" className={className} />
);

// LOL官方ADC图标
export const AdcIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/bot.png" alt="bot" className={className} />
);

// LOL官方辅助图标
export const SupportIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/support.png" alt="support" className={className} />
);
