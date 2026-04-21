import React, { useEffect } from 'react';
import { X, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team, Player } from '@/api/types';
import { TopIcon, JungleIcon, MidIcon, AdcIcon, SupportIcon } from '@/components/icons/PositionIcons';
import { PositionType } from '@/types/position';
import { ZIndexLayers } from '@/constants/zIndex';
import { getLevelBadgeClasses } from '@/utils/levelColors';

export interface TeamMemberModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onPlayerClick: (player: Player) => void;
  loading?: boolean;
}

const PositionIcon: React.FC<{ position: PositionType }> = ({ position }) => {
  switch (position) {
    case 'TOP':
      return <TopIcon className="w-5 h-5" />;
    case 'JUNGLE':
      return <JungleIcon className="w-5 h-5" />;
    case 'MID':
      return <MidIcon className="w-5 h-5" />;
    case 'ADC':
      return <AdcIcon className="w-5 h-5" />;
    case 'SUPPORT':
      return <SupportIcon className="w-5 h-5" />;
    default:
      return null;
  }
};

const SkeletonLoader: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3, 4, 5].map(i => (
      <div
        key={i}
        className="h-12 rounded-lg bg-gray-800 animate-pulse"
        data-testid="skeleton-line"
      />
    ))}
  </div>
);

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  team,
  isOpen,
  onClose,
  onPlayerClick,
  loading = false,
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const members = team.members || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: ZIndexLayers.NESTED_MODAL }}
          data-testid="team-member-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-member-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩层 */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            data-testid="modal-overlay"
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 弹框内容 - 响应式宽度 - 暗色主题 */}
          <motion.div
            className="relative w-[90vw] sm:w-[90vw] md:w-[500px] lg:w-[550px] rounded-2xl overflow-hidden"
            style={{
              background: '#1a1a1a',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxHeight: '85vh',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* 头部 - 队标和队名并排居中显示 */}
            <div
              className="flex items-center justify-center gap-3 px-6 py-4 border-b border-gray-700 relative"
              style={{
                background: '#111111',
              }}
            >
              {team.logoUrl && (
                <img
                  src={team.logoUrl}
                  alt={`${team.name} logo`}
                  className="w-10 h-10 object-contain"
                  data-testid="team-logo"
                />
              )}
              <h2
                id="team-member-modal-title"
                className="text-xl font-bold text-white"
              >
                {team.name}
              </h2>
              <button
                data-testid="close-modal-button"
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 参赛宣言 */}
            {team.battleCry && (
              <div className="px-6 py-2 border-b border-gray-700">
                <p className="text-sm text-gray-400 text-center">
                  {team.battleCry}
                </p>
              </div>
            )}

            {/* 成员列表 */}
            <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
              {loading ? (
                <SkeletonLoader />
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无队员</div>
              ) : (
                <div className="space-y-2">
                  {members.map(player => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:bg-gray-800/50"
                      data-testid="member-row"
                      onClick={() => onPlayerClick(player)}
                    >
                      {player.avatarUrl && (
                        <img
                          src={player.avatarUrl}
                          alt={player.nickname}
                          className="w-10 h-10 object-contain flex-shrink-0"
                          data-testid="player-avatar"
                        />
                      )}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-white font-medium truncate">{player.nickname}</span>
                        {player.isCaptain && (
                          <div className="flex items-center gap-1 text-amber-400 flex-shrink-0" title="队长">
                            <Crown className="w-4 h-4" />
                            <span className="text-xs">队长</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {player.level && (
                          <span
                            className={getLevelBadgeClasses(player.level)}
                            data-testid="player-level"
                          >
                            {player.level}
                          </span>
                        )}
                        <div
                          data-testid="member-position-icon"
                          className="text-gray-400"
                        >
                          <PositionIcon position={player.position} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
