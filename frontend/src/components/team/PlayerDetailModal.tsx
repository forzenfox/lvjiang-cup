import React, { useEffect } from 'react';
import { X, Star, ExternalLink } from 'lucide-react';
import type { Player } from '@/api/types';
import { PositionType } from '@/types/position';
import { getChampionIconUrl } from '@/utils/championUtils';
import { getLevelBadgeClasses, getCaptainBadgeClasses } from '@/utils/levelColors';

interface PlayerDetailModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

const POSITION_LABELS: Record<PositionType, string> = {
  TOP: '上单',
  JUNGLE: '打野',
  MID: '中单',
  ADC: '射手',
  SUPPORT: '辅助',
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const totalStars = 5;

  return (
    <div className="flex items-center gap-1">
      {[...Array(totalStars)].map((_, i) => (
        <Star
          key={i}
          data-testid="rating-star"
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-amber-500 fill-amber-500'
              : i === fullStars && hasHalfStar
                ? 'text-amber-500 fill-amber-500'
                : 'text-gray-600'
          }`}
        />
      ))}
    </div>
  );
};

const ChampionIcon: React.FC<{ championName: string; index: number }> = ({
  championName,
  index,
}) => {
  const iconUrl = getChampionIconUrl(championName);

  return (
    <div className="flex flex-col items-center gap-1 group cursor-pointer">
      <div
        className="w-14 h-14 rounded-lg bg-slate-800/50 border border-white/10 overflow-hidden transition-all duration-200 group-hover:border-amber-500/50 group-hover:shadow-lg group-hover:shadow-amber-500/20 group-hover:scale-105"
        data-testid={`champion-icon-${index}`}
      >
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={championName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
            ?
          </div>
        )}
      </div>
      <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors truncate max-w-[70px]">
        {championName.split('·').pop() || championName}
      </span>
    </div>
  );
};

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="player-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        data-testid="modal-overlay"
        onClick={handleOverlayClick}
        aria-hidden="true"
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />

      <div
        className="relative z-50 w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(251, 191, 36, 0.1)',
          animation: 'slideUp 0.2s ease-out',
          maxHeight: '90vh',
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-white/10"
          style={{
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, transparent 50%)',
          }}
        >
          <h2
            id="player-modal-title"
            className="text-lg font-semibold text-slate-100"
          >
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

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 64px)' }}>
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-28 h-28 rounded-full border-4 overflow-hidden mb-4"
              style={{
                borderColor: player.isCaptain ? 'rgba(251, 191, 36, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: player.isCaptain
                  ? '0 0 20px rgba(251, 191, 36, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {player.avatarUrl ? (
                <img
                  data-testid="player-avatar"
                  src={player.avatarUrl}
                  alt={player.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"
                  data-testid="player-avatar"
                >
                  <span className="text-3xl font-bold text-slate-400">
                    {player.nickname.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-100">{player.nickname}</h3>
                {player.isCaptain && (
                  <span className={getCaptainBadgeClasses('rounded-full')}>
                    队长
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-400 mb-1">
                {POSITION_LABELS[player.position] || player.position}
              </p>

              {player.gameId && (
                <p className="text-xs text-slate-500">游戏ID: {player.gameId}</p>
              )}
            </div>
          </div>

          <div
            className="rounded-xl p-4 mb-4 border border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <h4 className="text-sm font-medium text-slate-300 mb-2">个人简介</h4>
            <p className="text-sm text-slate-400 italic">
              {player.bio || '暂无简介'}
            </p>
          </div>

          <div
            className="rounded-xl p-4 mb-4 border border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <h4 className="text-sm font-medium text-slate-300 mb-3">常用英雄</h4>
            {player.championPool && player.championPool.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {player.championPool.map((champion, index) => (
                  <ChampionIcon
                    key={champion}
                    championName={champion}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center">暂无常用英雄</p>
            )}
          </div>

          {player.rating !== undefined && (
            <div
              className="rounded-xl p-4 mb-4 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300">评分</h4>
                <div className="flex items-center gap-2">
                  <StarRating rating={(player.rating / 100) * 5} />
                  <span className="text-sm text-amber-500 font-medium">
                    {player.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {player.level && (
            <div
              className="rounded-xl p-4 mb-4 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300">实力等级</h4>
                <span className={getLevelBadgeClasses(player.level, 'px-3 py-1 text-sm')}>
                  {player.level}
                </span>
              </div>
            </div>
          )}

          {player.liveUrl && (
            <div
              className="rounded-xl p-4 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                    data-testid="live-indicator"
                  />
                  <span className="text-sm text-slate-300">正在直播</span>
                </div>
                <a
                  href={player.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="watch-live-button"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    background: 'rgba(220, 38, 38, 0.2)',
                    color: '#EF4444',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                  }}
                >
                  <span>观看直播</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
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
