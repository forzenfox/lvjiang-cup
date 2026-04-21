import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZIndexLayers } from '@/constants/zIndex';
import { COVER_BACKGROUNDS, ANIMATION_CONFIG } from './constants';
import { BackgroundCarousel } from './BackgroundCarousel';
import { ScrollTip } from './ScrollTip';
import { useIsMobile } from '@/hooks/useMediaQuery';
import './StartBox.styles.css';

interface StartBoxProps {
  onExit?: () => void;
}

export const StartBox: React.FC<StartBoxProps> = ({ onExit }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const isMobile = useIsMobile();

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

  const backgrounds = isMobile ? COVER_BACKGROUNDS.mobile : COVER_BACKGROUNDS.pc;

  if (!isVisible || backgrounds.length === 0 || hasImageError) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black overflow-hidden start-box-cover"
      style={{ zIndex: ZIndexLayers.COVER }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <BackgroundCarousel
        isExiting={isExiting}
        isMobile={isMobile}
        onError={() => setHasImageError(true)}
      />
      <ScrollTip isExiting={isExiting} />
    </motion.div>
  );
};
