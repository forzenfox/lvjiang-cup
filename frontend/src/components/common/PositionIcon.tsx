import React from 'react';

interface PositionIconProps {
  position: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  size?: number;
  className?: string;
}

const POSITION_CONFIG = {
  TOP: { label: '上单', icon: '/assets/positions/top.png' },
  JUNGLE: { label: '打野', icon: '/assets/positions/jungle.png' },
  MID: { label: '中单', icon: '/assets/positions/mid.png' },
  ADC: { label: '射手', icon: '/assets/positions/adc.png' },
  SUPPORT: { label: '辅助', icon: '/assets/positions/support.png' },
};

export const PositionIcon: React.FC<PositionIconProps> = ({ position, size = 24, className = '' }) => {
  const config = POSITION_CONFIG[position];
  if (!config) return null;

  return (
    <img
      src={config.icon}
      alt={config.label}
      width={size}
      height={size}
      className={className}
    />
  );
};

export default PositionIcon;