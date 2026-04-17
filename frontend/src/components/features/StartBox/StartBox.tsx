import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZIndexLayers } from '@/constants/zIndex';
import { ANIMATION_CONFIG, COVER_IMAGES } from './constants';
import { BackgroundCarousel } from './BackgroundCarousel';
import { ScrollTip } from './ScrollTip';
import './StartBox.styles.css';

interface StartBoxProps {
  onExit?: () => void;
}

export const StartBox: React.FC<StartBoxProps> = ({ onExit }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const triggerExit = useCallback(() => {
    if (isExiting) return;

    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onExit?.();
    }, ANIMATION_CONFIG.exitDuration);
  }, [isExiting, onExit]);

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || isExiting) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        triggerExit();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isVisible, isExiting, triggerExit]);

  useEffect(() => {
    if (!isVisible || isExiting) return;

    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const diff = startY - e.touches[0].clientY;
      if (diff > ANIMATION_CONFIG.touchThreshold) {
        triggerExit();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isVisible, isExiting, triggerExit]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black overflow-hidden start-box-cover"
      style={{ zIndex: ZIndexLayers.COVER }}
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-0 left-0 right-0 h-[66.66%]">
        <BackgroundCarousel isExiting={isExiting} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[33.34%]">
        <motion.div
          className="absolute top-[10px] left-[10%] w-[80%] h-[70%] bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(${COVER_IMAGES.pc.slogan})` }}
          animate={isExiting ? { y: '100%' } : {}}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute bottom-[3.33%] left-0 right-0 h-[16.6%] bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: `url(${COVER_IMAGES.pc.logo})` }}
          animate={isExiting ? { opacity: 0 } : {}}
          transition={{ duration: 0.5 }}
        />

        <ScrollTip isExiting={isExiting} />
      </div>
    </motion.div>
  );
};
