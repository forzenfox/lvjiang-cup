import React from 'react';
import { Crown } from 'lucide-react';
import { PositionIcon } from '../common/PositionIcon';
import { getUploadUrl } from '@/utils/upload';

export interface TeamMember {
  id: string;
  nickname: string;
  avatarUrl?: string;
  position: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  isCaptain?: boolean;
}

export interface TeamCardProps {
  team: {
    id: string;
    name: string;
    logoUrl?: string;
    logoThumbnailUrl?: string;
    battleCry?: string;
    members: TeamMember[];
  };
  onMembersClick: (teamId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onMembersClick }) => {
  const { id, name, logoUrl, logoThumbnailUrl, battleCry, members } = team;

  // 获取队长信息
  const captain = members.find((member) => member.isCaptain);

  // 获取已拥有的位置
  const positions = members.map((member) => member.position);

  // 位置顺序
  const positionOrder: Array<'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT'> = [
    'TOP',
    'JUNGLE',
    'MID',
    'ADC',
    'SUPPORT',
  ];

  return (
    <div
      className="w-full max-w-[400px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-[rgba(245,158,11,0.5)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4),0_0_15px_rgba(245,158,11,0.2)] hover:-translate-y-[8px] cursor-pointer overflow-hidden"
      data-testid="team-card"
    >
      {/* 战队图标区域 */}
      <div className="h-[128px] bg-gradient-to-br from-[rgba(30,58,138,0.5)] to-[rgba(88,28,135,0.5)] flex items-center justify-center p-4">
        <img
          src={getUploadUrl(logoThumbnailUrl || logoUrl) || '/assets/default-team-logo.png'}
          alt={`${name} logo`}
          className="w-[96px] h-[96px] object-contain shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          data-testid="team-logo"
        />
      </div>

      {/* 战队信息区域 */}
      <div className="p-4 space-y-3">
        {/* 战队名称 */}
        <h3
          className="text-[20px] font-semibold text-center text-[#F59E0B] hover:text-[#F8FAFC] transition-colors"
          data-testid="team-name"
        >
          {name}
        </h3>

        {/* 参赛宣言 */}
        {battleCry && (
          <p
            className="text-[14px] text-[#94A3B8] italic text-center line-clamp-2 before:content-['&quot;'] after:content-['&quot;']"
            data-testid="team-battle-cry"
          >
            {battleCry}
          </p>
        )}

        {/* 队员数量（可点击） */}
        <button
          type="button"
          className="w-full text-[14px] text-[#94A3B8] hover:text-[#F59E0B] hover:underline cursor-pointer text-center transition-colors"
          onClick={() => onMembersClick(id)}
          data-testid="team-members-btn"
        >
          队员：{members.length} 人
        </button>

        {/* 位置图标 */}
        <div className="flex items-center justify-center gap-[8px]" data-testid="team-positions">
          {positionOrder.map((position) => {
            if (!positions.includes(position)) return null;
            return (
              <div key={position} className="w-[24px] h-[24px]" title={position}>
                <PositionIcon position={position} size={24} />
              </div>
            );
          })}
        </div>

        {/* 队长信息 */}
        {captain && (
          <div
            className="flex items-center justify-center text-[14px] text-[#94A3B8]"
            data-testid="team-captain"
          >
            <span>队长：{captain.nickname}</span>
            <Crown
              className="w-[16px] h-[16px] text-[#F59E0B] ml-[8px]"
              data-testid="captain-badge"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
