import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZIndexLayers } from '@/constants/zIndex';
import { COVER_IMAGES, ANIMATION_CONFIG } from './constants';
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

  // 点击鼠标进入主页面
  useEffect(() => {
    if (!isVisible || isExiting) return;

    const handleClick = () => {
      triggerExit();
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible, isExiting, triggerExit]);

  // 按任意键进入主页面
  useEffect(() => {
    if (!isVisible || isExiting) return;

    const handleKeyDown = () => {
      triggerExit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isExiting, triggerExit]);

  const backgrounds = isMobile ? COVER_IMAGES.mobile : COVER_IMAGES.pc;

  if (!isVisible || !backgrounds.length) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black overflow-hidden start-box-cover"
      style={{ zIndex: ZIndexLayers.COVER }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <BackgroundCarousel
        isExiting={isExiting}
        onError={() => setIsVisible(false)}
        backgrounds={backgrounds}
      />
      <ScrollTip isExiting={isExiting} />
    </motion.div>
  );
};
