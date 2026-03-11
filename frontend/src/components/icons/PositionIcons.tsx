import React from 'react';

interface IconProps {
  className?: string;
}

// LOL官方上单图标
export const TopIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/top.png" alt="上单" className={className} />
);

// LOL官方打野图标
export const JungleIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/jungle.png" alt="打野" className={className} />
);

// LOL官方中单图标
export const MidIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/mid.png" alt="中单" className={className} />
);

// LOL官方ADC图标
export const AdcIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/bot.png" alt="ADC" className={className} />
);

// LOL官方辅助图标
export const SupportIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/support.png" alt="辅助" className={className} />
);
