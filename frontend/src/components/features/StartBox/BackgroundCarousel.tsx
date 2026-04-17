import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COVER_IMAGES, MOBILE_BG_POSITION } from './constants';

interface BackgroundCarouselProps {
  isExiting: boolean;
}

export const BackgroundCarousel: React.FC<BackgroundCarouselProps> = ({ isExiting }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const backgrounds = [COVER_IMAGES.pc.background1, COVER_IMAGES.pc.background2];
  const positions = [MOBILE_BG_POSITION.background1, MOBILE_BG_POSITION.background2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % backgrounds.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    <motion.div
      className={`background-carousel absolute inset-0 ${isExiting ? 'exiting' : ''}`}
      initial={{ y: 0 }}
      animate={isExiting ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      {backgrounds.map((bg, index) => (
        <div
          key={bg}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundPosition: positions[index],
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
    </motion.div>
  );
};
