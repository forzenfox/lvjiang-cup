import React from 'react';
import type { MatchGameData } from '@/types/matchData';
import { getUploadUrl } from '@/utils/upload';

interface MatchInfoCardProps {
  gameData: MatchGameData;
}

const MatchInfoCard: React.FC<MatchInfoCardProps> = ({ gameData }) => {
  const { blueTeam, redTeam, gameNumber, gameDuration, gameStartTime, winnerTeamId } = gameData;

  const isBlueWinner = winnerTeamId !== null && winnerTeamId === blueTeam.teamId;
  const isRedWinner = winnerTeamId !== null && winnerTeamId === redTeam.teamId;

  const formatGameStartTime = (isoTime: string | null): string => {
    if (!isoTime) return '待定';
    const date = new Date(isoTime);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  const getSeriesFormat = (): string => {
    const gameCount = 3;
    return gameCount > 1 ? `BO${gameCount} · 第 ${gameNumber} 局` : `第 ${gameNumber} 局`;
  };

  return (
    <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-6 max-w-5xl mx-auto mt-6">
      <div className="flex items-center justify-between">
        {/* 左侧：红色方 */}
        <div className="flex flex-col items-center gap-3 min-w-[120px]">
          <div className="w-20 h-20 rounded-full border-2 border-[#f44336] bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
            <img
              src={
                getUploadUrl(redTeam.logoUrl) ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${redTeam.teamId}`
              }
              alt={redTeam.teamName}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-2xl font-bold text-[#f44336]">
              {redTeam.teamName.charAt(0)}
            </span>
          </div>
          <span className="text-xl font-bold text-white">{redTeam.teamName}</span>
          <span className="text-xs text-[#f44336] bg-[#f44336]/20 px-2 py-0.5 rounded-full">
            红色方
          </span>
          {isRedWinner && <span className="text-[#0febc1] text-sm font-bold">★ 胜利</span>}
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-[#c49f58] font-bold">{getSeriesFormat()}</span>
          <span className="text-3xl font-bold text-white font-mono">{gameDuration}</span>
          <span className="text-sm text-gray-400">{formatGameStartTime(gameStartTime)}</span>
        </div>

        {/* 右侧：蓝色方 */}
        <div className="flex flex-col items-center gap-3 min-w-[120px]">
          <div className="w-20 h-20 rounded-full border-2 border-[#00bcd4] bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
            <img
              src={
                getUploadUrl(blueTeam.logoUrl) ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${blueTeam.teamId}`
              }
              alt={blueTeam.teamName}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-2xl font-bold text-[#00bcd4]">
              {blueTeam.teamName.charAt(0)}
            </span>
          </div>
          <span className="text-xl font-bold text-white">{blueTeam.teamName}</span>
          <span className="text-xs text-[#00bcd4] bg-[#00bcd4]/20 px-2 py-0.5 rounded-full">
            蓝色方
          </span>
          {isBlueWinner && <span className="text-[#0febc1] text-sm font-bold">★ 胜利</span>}
        </div>
      </div>
    </div>
  );
};

export default MatchInfoCard;
