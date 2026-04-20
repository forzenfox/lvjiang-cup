import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Player } from '@/api/types';
import PlayerDetailContent from './PlayerDetailContent';
import { ZIndexLayers } from '@/constants/zIndex';

interface PlayerDetailModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      data-testid="player-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
      style={{ zIndex: ZIndexLayers.MODAL_OVERLAY }}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        data-testid="modal-overlay"
        onClick={handleOverlayClick}
        aria-hidden="true"
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />

      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(251, 191, 36, 0.1)',
          animation: 'slideUp 0.2s ease-out',
          maxHeight: '90vh',
          zIndex: ZIndexLayers.MODAL,
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-white/10"
          style={{
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, transparent 50%)',
          }}
        >
          <h2 id="player-modal-title" className="text-lg font-semibold text-slate-100">
            选手详情
          </h2>
          <button
            data-testid="close-modal-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <PlayerDetailContent player={player} />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerDetailModal;
