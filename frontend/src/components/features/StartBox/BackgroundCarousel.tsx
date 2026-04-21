import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COVER_BACKGROUNDS, ANIMATION_CONFIG } from './constants';

interface BackgroundCarouselProps {
  isExiting: boolean;
  isMobile: boolean;
  onError: () => void;
}

export const BackgroundCarousel: React.FC<BackgroundCarouselProps> = ({ isExiting, isMobile, onError }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const backgrounds = isMobile ? COVER_BACKGROUNDS.mobile : COVER_BACKGROUNDS.pc;
  const shouldCarousel = backgrounds.length >= 2;

  useEffect(() => {
    if (!shouldCarousel || hasError) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % backgrounds.length);
    }, ANIMATION_CONFIG.carouselInterval);

    return () => clearInterval(interval);
  }, [shouldCarousel, backgrounds.length, hasError]);

  const handleImageError = () => {
    setHasError(true);
    onError();
  };

  if (hasError || !backgrounds.length) {
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
        {backgrounds.map((bg, index) => (
          <div
            key={bg}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${bg})`,
              opacity: shouldCarousel ? (index === currentIndex ? 1 : 0) : 1,
            }}
          />
        ))}
      </div>
      {backgrounds.map((bg) => (
        <img
          key={`error-check-${bg}`}
          src={bg}
          className="hidden"
          onError={handleImageError}
          alt=""
        />
      ))}
    </motion.div>
  );
};
