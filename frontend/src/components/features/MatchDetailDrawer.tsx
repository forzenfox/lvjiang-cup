import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Match, Team } from '@/types';
import MatchDetailContent from './MatchDetailContent';
import { ZIndexLayers } from '@/constants/zIndex';

export interface MatchDetailDrawerProps {
  match: Match | null;
  teams: Team[];
  onClose: () => void;
}

const MatchDetailDrawer: React.FC<MatchDetailDrawerProps> = ({ match, teams, onClose }) => {
  // body 滚动锁定
  useEffect(() => {
    if (match) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [match]);

  if (!match) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0"
      style={{ zIndex: ZIndexLayers.NESTED_MODAL }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-drawer-title"
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

      {/* 抽屉内容 - 移动端底部滑入 */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl flex flex-col overflow-hidden"
        data-testid="match-drawer"
        style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          zIndex: ZIndexLayers.NESTED_MODAL,
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        {/* 标题栏 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, transparent 50%)',
          }}
        >
          <h2 id="match-drawer-title" className="text-base font-semibold text-slate-100">
            对战详情
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
        <div className="flex-1 overflow-y-auto p-6">
          <MatchDetailContent match={match} teams={teams} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MatchDetailDrawer;
