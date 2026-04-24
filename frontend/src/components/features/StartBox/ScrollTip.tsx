import React from 'react';
import { motion } from 'framer-motion';
import { SCROLL_TIP_IMAGE } from './constants';

interface ScrollTipProps {
  isExiting: boolean;
}

export const ScrollTip: React.FC<ScrollTipProps> = ({ isExiting }) => {
  return (
    <motion.div
      className="scroll-tip absolute left-1/2 bottom-10 -translate-x-1/2 scroll-tip-arrow"
      animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="w-8 h-20 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url(${SCROLL_TIP_IMAGE})` }}
      />
    </motion.div>
  );
};
