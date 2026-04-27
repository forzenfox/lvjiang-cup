import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Player } from '@/api/types';
import PlayerDetailContent from './PlayerDetailContent';
import { ZIndexLayers } from '@/constants/zIndex';

export interface PlayerDetailDrawerProps {
  player: Player | null;
  onClose: () => void;
  isMobile: boolean;
}

const PlayerDetailDrawer: React.FC<PlayerDetailDrawerProps> = ({ player, onClose, isMobile }) => {
  if (!player) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // PC/平板端动画配置（右侧滑入）
  const desktopAnimation = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'tween' as const, duration: 0.3 },
  };

  // 手机端动画配置（底部滑入）
  const mobileAnimation = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { type: 'tween' as const, duration: 0.3 },
  };

  const animationConfig = isMobile ? mobileAnimation : desktopAnimation;

  return (
    <motion.div
      className="fixed inset-0"
      style={{ zIndex: ZIndexLayers.NESTED_MODAL }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-drawer-title"
    >
      {/* 遮罩层 */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        data-testid="drawer-overlay"
        onClick={handleOverlayClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* 抽屉内容 */}
      <motion.div
        className={`absolute flex flex-col overflow-hidden ${
          isMobile
            ? 'bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl'
            : 'right-0 top-0 h-full sm:w-[320px] md:w-[350px] lg:w-[400px]'
        }`}
        data-testid="player-drawer"
        style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          zIndex: ZIndexLayers.NESTED_MODAL,
        }}
        {...animationConfig}
      >
        {/* 关闭按钮 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, transparent 50%)',
          }}
        >
          <h2 id="player-drawer-title" className="text-base font-semibold text-slate-100">
            选手详情
          </h2>
          <button
            data-testid="close-drawer-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 详情内容 - flex-1 填满剩余空间，overflow-y-auto 实现内部滚动 */}
        <div className="flex-1 overflow-y-auto">
          <PlayerDetailContent player={player} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayerDetailDrawer;
