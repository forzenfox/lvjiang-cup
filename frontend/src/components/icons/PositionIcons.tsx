import React from 'react';

const POSITION_ICON_BASE_URL = '//game.gtimg.cn/images/lpl/es/web201612/n-spr.png';

interface IconProps {
  className?: string;
}

const getPositionIconStyle = (position: string): React.CSSProperties => {
  const styles: Record<string, React.CSSProperties> = {
    TOP: { width: 32, height: 24, backgroundPosition: '-420px -4px' },
    JUNGLE: { width: 32, height: 24, backgroundPosition: '-420px -32px' },
    MID: { width: 32, height: 24, backgroundPosition: '-384px -4px' },
    ADC: { width: 32, height: 24, backgroundPosition: '-384px -32px' },
    SUPPORT: { width: 32, height: 24, backgroundPosition: '-456px -4px' },
  };
  return styles[position] || { width: 32, height: 24 };
};

export const TopIcon: React.FC<IconProps> = ({ className }) => {
  const style = getPositionIconStyle('TOP');
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${POSITION_ICON_BASE_URL})`,
      }}
    />
  );
};

export const JungleIcon: React.FC<IconProps> = ({ className }) => {
  const style = getPositionIconStyle('JUNGLE');
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${POSITION_ICON_BASE_URL})`,
      }}
    />
  );
};

export const MidIcon: React.FC<IconProps> = ({ className }) => {
  const style = getPositionIconStyle('MID');
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${POSITION_ICON_BASE_URL})`,
      }}
    />
  );
};

export const AdcIcon: React.FC<IconProps> = ({ className }) => {
  const style = getPositionIconStyle('ADC');
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${POSITION_ICON_BASE_URL})`,
      }}
    />
  );
};

export const SupportIcon: React.FC<IconProps> = ({ className }) => {
  const style = getPositionIconStyle('SUPPORT');
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${POSITION_ICON_BASE_URL})`,
      }}
    />
  );
};
