import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CoverImage, ANIMATION_CONFIG } from './constants';
import { useImageWithFallback } from '@/hooks';

interface BackgroundCarouselProps {
  isExiting: boolean;
  onError: () => void;
  backgrounds: readonly CoverImage[];
}

export const BackgroundCarousel: React.FC<BackgroundCarouselProps> = ({
  isExiting,
  onError,
  backgrounds,
}) => {
  const availableBackgrounds = useImageWithFallback(backgrounds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hasError, setHasError] = useState(false);

  const shouldCarousel = availableBackgrounds.length >= 2;

  useEffect(() => {
    if (!shouldCarousel || hasError) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % availableBackgrounds.length);
    }, ANIMATION_CONFIG.carouselInterval);

    return () => clearInterval(interval);
  }, [shouldCarousel, availableBackgrounds.length, hasError]);

  // 预加载图片并跟踪加载状态
  useEffect(() => {
    if (!availableBackgrounds.length) return;

    availableBackgrounds.forEach(bg => {
      if (loadedImages.has(bg.cdn)) return;

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(bg.cdn));
      };
      img.onerror = () => {
        // 图片加载失败，静默处理
      };
      img.src = bg.cdn;
    });
  }, [availableBackgrounds, loadedImages]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      onError();
    }
  };

  // 过滤出已加载的图片
  const displayBackgrounds = availableBackgrounds.filter(bg => loadedImages.has(bg.cdn));

  if (hasError || !displayBackgrounds.length) {
    return null;
  }

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: ANIMATION_CONFIG.exitDuration / 1000 }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {availableBackgrounds.map((bg, index) => {
          const imageUrl = loadedImages.has(bg.cdn) ? bg.cdn : null;

          if (!imageUrl) return null;

          return (
            <img
              key={bg.cdn}
              src={imageUrl}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-1000"
              style={{
                opacity: shouldCarousel ? (index === currentIndex ? 1 : 0) : 1,
              }}
              alt=""
            />
          );
        })}
      </div>
      {availableBackgrounds.map(bg => (
        <img
          key={`error-check-${bg.cdn}`}
          src={bg.cdn}
          className="hidden"
          onError={handleImageError}
          alt=""
        />
      ))}
    </motion.div>
  );
};
