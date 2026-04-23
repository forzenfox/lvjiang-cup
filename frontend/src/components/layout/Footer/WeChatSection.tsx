import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const hasAttemptedLoad = useRef(false);

  const loadImage = (src: string, isRetry: boolean = false) => {
    const img = new Image();
    img.onload = () => {
      setDisplaySrc(src);
      setIsLoading(false);
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
      setIsLoading(false);
    };
    img.src = src;
  };

  useEffect(() => {
    if (isHovered && !hasAttemptedLoad.current && !displaySrc && !hasError) {
      hasAttemptedLoad.current = true;
      loadImage(qrCode);
    }
  }, [isHovered]);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="wechat-section"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-4 z-50"
          >
            <div className="relative">
              {isLoading && (
                <div
                  className="bg-[#1a1a2e] rounded-lg shadow-2xl p-1 flex items-center justify-center"
                  style={{ width: 200, height: 200 }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
                </div>
              )}

              {!isLoading && displaySrc && (
                <>
                  <div className="bg-[#1a1a2e] rounded-lg shadow-2xl p-1">
                    <img
                      src={displaySrc}
                      alt="微信公众号二维码"
                      className="object-contain w-auto h-auto max-w-[500px] max-h-[500px] rounded"
                    />
                  </div>
                  <div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2
                    w-0 h-0 border-l-8 border-r-8 border-t-8
                    border-l-transparent border-r-transparent border-t-[#1a1a2e]"
                  />
                </>
              )}

              {!isLoading && hasError && (
                <div
                  className="bg-[#1a1a2e] rounded-lg shadow-2xl p-1"
                  style={{ width: 200, height: 200 }}
                >
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-2">
                    二维码加载失败
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <QrCode className="w-5 h-5 text-green-400" />
        <span className="text-sm text-white hover:text-gold cursor-pointer">
          <span className="hover:underline">微信公众号：{name}</span>
        </span>
      </div>
    </div>
  );
};
