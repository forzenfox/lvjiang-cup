import React from 'react';
import { motion } from 'framer-motion';
import { COVER_IMAGES } from './constants';
import './StartBox.styles.css';

interface ScrollTipProps {
  isExiting: boolean;
}

export const ScrollTip: React.FC<ScrollTipProps> = ({ isExiting }) => {
  return (
    <motion.div
      className={`scroll-tip absolute left-1/2 bottom-[25%] w-8 h-20 -ml-4 ${isExiting ? 'exiting' : ''}`}
      animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="w-full h-full bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url(${COVER_IMAGES.pc.scrollTip})` }}
      />
    </motion.div>
  );
};
