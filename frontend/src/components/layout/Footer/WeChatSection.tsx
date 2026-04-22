import React, { useState } from 'react';

interface WeChatSectionProps {
  name: string;
  qrCode: string;
  size: number;
}

export const WeChatSection: React.FC<WeChatSectionProps> = ({
  name,
  qrCode,
  size,
}) => {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // CDN 优先 + 本地兜底
  const loadImage = (src: string, isRetry: boolean = false) => {
    const img = new Image();
    img.onload = () => {
      setDisplaySrc(src);
    };
    img.onerror = () => {
      if (!isRetry) {
        const localPath = `/assets/lvlvdianjing.webp`;
        if (localPath !== src) {
          loadImage(localPath, true);
          return;
        }
      }
      setHasError(true);
    };
    img.src = src;
  };

  // 组件挂载时立即加载
  React.useEffect(() => {
    loadImage(qrCode);
  }, []);

  return (
    <div
      className="flex flex-col items-center gap-2"
      data-testid="wechat-section"
    >
      {hasError ? (
        <div
          className="bg-white/10 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-white/30 text-xs text-center px-2">
            二维码加载失败
          </span>
        </div>
      ) : displaySrc ? (
        <img
          src={displaySrc}
          alt="微信公众号二维码"
          style={{ maxWidth: size, maxHeight: size }}
          className="rounded-lg bg-white p-1 object-contain w-auto h-auto"
        />
      ) : (
        <div
          className="bg-white/10 rounded-lg flex items-center justify-center animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <span className="text-sm text-gray-300">微信公众号：{name}</span>
    </div>
  );
};
