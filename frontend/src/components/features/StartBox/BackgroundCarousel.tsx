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
  const [hasError, setHasError] = useState(false);

  const shouldCarousel = availableBackgrounds.length >= 2;

  useEffect(() => {
    if (!shouldCarousel || hasError) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % availableBackgrounds.length);
    }, ANIMATION_CONFIG.carouselInterval);

    return () => clearInterval(interval);
  }, [shouldCarousel, availableBackgrounds.length, hasError]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      onError();
    }
  };

  if (hasError || !availableBackgrounds.length) {
    return null;
  }

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: ANIMATION_CONFIG.exitDuration / 1000 }}
    >
      <div className="absolute inset-0">
        {availableBackgrounds.map((bg, index) => (
          <div
            key={bg.cdn}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${bg.cdn})`,
              opacity: shouldCarousel ? (index === currentIndex ? 1 : 0) : 1,
            }}
          />
        ))}
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
