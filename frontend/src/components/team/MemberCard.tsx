import React, { useState, useRef, useEffect } from 'react';
import { getChampionIconUrl } from '../../utils/championUtils';
import type { PlayerLevel } from '../../api/types';
import { getLevelBadgeClasses, getCaptainBadgeClasses } from '../../utils/levelColors';
import { getUploadUrl } from '@/utils/upload';

interface MemberCardProps {
  member: TeamMember;
}

export interface TeamMember {
  id: string;
  nickname: string;
  avatarUrl?: string;
  gameId?: string;
  position: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  bio?: string;
  championPool?: string[];
  rating?: number;
  isCaptain?: boolean;
  liveUrl?: string;
  level?: PlayerLevel;
}

const POSITION_CONFIG = {
  TOP: { label: '上单', icon: '/assets/positions/top.png' },
  JUNGLE: { label: '打野', icon: '/assets/positions/jungle.png' },
  MID: { label: '中单', icon: '/assets/positions/mid.png' },
  ADC: { label: '射手', icon: '/assets/positions/adc.png' },
  SUPPORT: { label: '辅助', icon: '/assets/positions/support.png' },
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating / 20);
  const hasHalfStar = rating % 20 >= 10;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'text-amber-500' : i === fullStars && hasHalfStar ? 'text-amber-500' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {i < fullStars || (i === fullStars && hasHalfStar) ? (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          ) : (
            <path d="M10.271 5.016a.5.5 0 01.515.135l2.5 5a.5.5 0 01-.139.67l-4.5 3.5a.5.5 0 01-.607 0l-4.5-3.5a.5.5 0 01.026-.814l5-4.5a.5.5 0 01.65.033l.5.5 3.5-4.5.5-.5z" />
          )}
        </svg>
      ))}
      <span className="text-amber-500 text-sm ml-1">({rating})</span>
    </div>
  );
};

const ChampionHover: React.FC<{ championName: string }> = ({ championName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const iconUrl = getChampionIconUrl(championName);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <span className="text-slate-400 text-xs hover:text-amber-500 transition-colors cursor-default">
        {championName}
      </span>
      {isVisible && iconUrl && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          style={{
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          <div
            className="w-20 h-20 rounded-lg bg-slate-900 border border-white/10 shadow-xl overflow-hidden"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <img
              src={iconUrl}
              alt={championName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </span>
  );
};

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const positionConfig = POSITION_CONFIG[member.position];

  return (
    <div
      className="p-5 rounded-xl border border-white/10 transition-colors duration-200 hover:border-white/20"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
      }}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className="w-16 h-16 rounded-lg border-2 overflow-hidden"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {member.avatarUrl ? (
              <img
                src={getUploadUrl(member.avatarUrl)}
                alt={member.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <span className="text-xl font-semibold text-slate-400">
                  {member.nickname.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Nickname & Captain Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-semibold text-slate-100 truncate">
              {member.nickname}
            </h4>
            {member.level && (
              <span className={getLevelBadgeClasses(member.level)}>
                {member.level}
              </span>
            )}
            {member.isCaptain && (
              <span className={getCaptainBadgeClasses('flex items-center gap-1')}>
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                队长
              </span>
            )}
          </div>

          {/* Game ID */}
          {member.gameId && (
            <p className="text-sm text-slate-500 mb-2">{member.gameId}</p>
          )}

          {/* Position */}
          <div className="flex items-center gap-1.5 mb-2">
            {positionConfig && (
              <img
                src={positionConfig.icon}
                alt={positionConfig.label}
                className="w-4 h-4"
              />
            )}
            <span className="text-sm text-slate-400">{positionConfig?.label}</span>
          </div>

          {/* Rating */}
          {member.rating !== undefined && (
            <div className="mb-3">
              <StarRating rating={member.rating} />
            </div>
          )}

          {/* Live URL */}
          {member.liveUrl && (
            <div className="mb-3">
              <a
                href={member.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
              >
                <span>直播间</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      {(member.bio || member.championPool) && (
        <div className="border-t border-white/10 my-3" />
      )}

      {/* Bio */}
      {member.bio && (
        <p
          className="text-xs text-slate-500 italic line-clamp-2 mb-3"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {member.bio}
        </p>
      )}

      {/* Champion Pool */}
      {member.championPool && member.championPool.length > 0 && (
        <div>
          <span className="text-xs text-slate-500">常用英雄：</span>
          <div className="inline-flex flex-wrap gap-2 mt-1">
            {member.championPool.map((champion) => (
              <ChampionHover key={champion} championName={champion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberCard;