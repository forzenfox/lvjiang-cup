import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const CDN_SPRITE_URL = '//game.gtimg.cn/images/lpl/es/web201612/n-spr.png';
const LOCAL_SPRITE_URL = '/assets/n-spr.webp';

interface SpriteContextValue {
  spriteUrl: string;
}

const SpriteContext = createContext<SpriteContextValue>({ spriteUrl: CDN_SPRITE_URL });

/**
 * 精灵图加载钩子：CDN 优先，失败降级本地
 */
function useSpriteLoader() {
  const [spriteUrl, setSpriteUrl] = useState(CDN_SPRITE_URL);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const img = new Image();
    img.onload = () => setSpriteUrl(CDN_SPRITE_URL);
    img.onerror = () => setSpriteUrl(LOCAL_SPRITE_URL);
    img.src = CDN_SPRITE_URL;
  }, []);

  return spriteUrl;
}

export const SpriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const spriteUrl = useSpriteLoader();
  return (
    <SpriteContext.Provider value={{ spriteUrl }}>{children}</SpriteContext.Provider>
  );
};

export const useSpriteUrl = () => useContext(SpriteContext).spriteUrl;

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
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

export const TopIcon: React.FC<IconProps> = ({ className, style }) => {
  const spriteUrl = useSpriteUrl();
  const baseStyle = getPositionIconStyle('TOP');
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        backgroundImage: `url(${spriteUrl})`,
        ...style,
      }}
    />
  );
};

export const JungleIcon: React.FC<IconProps> = ({ className, style }) => {
  const spriteUrl = useSpriteUrl();
  const baseStyle = getPositionIconStyle('JUNGLE');
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        backgroundImage: `url(${spriteUrl})`,
        ...style,
      }}
    />
  );
};

export const MidIcon: React.FC<IconProps> = ({ className, style }) => {
  const spriteUrl = useSpriteUrl();
  const baseStyle = getPositionIconStyle('MID');
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        backgroundImage: `url(${spriteUrl})`,
        ...style,
      }}
    />
  );
};

export const AdcIcon: React.FC<IconProps> = ({ className, style }) => {
  const spriteUrl = useSpriteUrl();
  const baseStyle = getPositionIconStyle('ADC');
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        backgroundImage: `url(${spriteUrl})`,
        ...style,
      }}
    />
  );
};

export const SupportIcon: React.FC<IconProps> = ({ className, style }) => {
  const spriteUrl = useSpriteUrl();
  const baseStyle = getPositionIconStyle('SUPPORT');
  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        backgroundImage: `url(${spriteUrl})`,
        ...style,
      }}
    />
  );
};
