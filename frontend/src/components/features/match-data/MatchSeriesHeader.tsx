import React from 'react';
import type { MatchSeriesInfo, MatchGameData } from '@/types/matchData';
import { getUploadUrl } from '@/utils/upload';
import { Play } from 'lucide-react';

interface MatchSeriesHeaderProps {
  seriesInfo: MatchSeriesInfo | null;
  gameData: MatchGameData | null;
}

/**
 * 计算系列赛总比分
 * @param seriesInfo 系列赛信息
 * @param currentGameData 当前对局数据
 * @returns [红色方胜场, 蓝色方胜场]
 */
const calculateSeriesScore = (
  seriesInfo: MatchSeriesInfo | null,
  currentGameData: MatchGameData | null
): [number, number] => {
  if (!seriesInfo || !currentGameData) return [0, 0];

  let redWins = 0;
  let blueWins = 0;

  // 统计已完成对局的胜负
  seriesInfo.games.forEach(game => {
    if (game.winnerTeamId && game.hasData) {
      if (game.winnerTeamId === currentGameData.redTeam.teamId) {
        redWins++;
      } else if (game.winnerTeamId === currentGameData.blueTeam.teamId) {
        blueWins++;
      }
    }
  });

  return [redWins, blueWins];
};

/**
 * 格式化比赛日期时间
 * @param isoTime ISO格式时间字符串
 * @returns 格式化后的字符串 (MM-DD HH:mm)
 */
const formatMatchDateTime = (isoTime: string | null): { date: string; time: string } => {
  if (!isoTime) return { date: '待定', time: '' };

  const date = new Date(isoTime);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    date: `${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

/**
 * 获取比赛状态文本
 * @param gameData 对局数据
 * @returns 状态文本
 */
const getMatchStatus = (gameData: MatchGameData | null): string => {
  if (!gameData) return '未开始';
  if (gameData.winnerTeamId) return '已结束';
  if (gameData.gameStartTime) return '进行中';
  return '未开始';
};

/**
 * 系列赛头部组件
 * 展示双方队伍Logo、总比分、比赛日期和状态
 */
const MatchSeriesHeader: React.FC<MatchSeriesHeaderProps> = ({ seriesInfo, gameData }) => {
  const [redScore, blueScore] = calculateSeriesScore(seriesInfo, gameData);
  const { date, time } = formatMatchDateTime(gameData?.gameStartTime || null);
  const status = getMatchStatus(gameData);
  const isFinished = status === '已结束';

  const redTeam = gameData?.redTeam;
  const blueTeam = gameData?.blueTeam;

  if (!redTeam || !blueTeam) {
    return (
      <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-xl p-8 max-w-5xl mx-auto">
      {/* 主内容区域 */}
      <div className="flex items-center justify-between">
        {/* 左侧：红色方 */}
        <div className="flex flex-col items-center gap-4 min-w-[140px]">
          <div className="w-24 h-24 rounded-full border-3 border-[#f44336] bg-[#1a1a2e] flex items-center justify-center overflow-hidden shadow-lg shadow-[#f44336]/20">
            <img
              src={
                getUploadUrl(redTeam.logoUrl) ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${redTeam.teamId}`
              }
              alt={redTeam.teamName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-3xl font-bold text-[#f44336]">
              {redTeam.teamName.charAt(0)}
            </span>
          </div>
          <span className="text-2xl font-bold text-white">{redTeam.teamName}</span>
        </div>

        {/* 中间：比分和比赛信息 */}
        <div className="flex flex-col items-center gap-3">
          {/* 总比分 */}
          <div className="flex items-center gap-4">
            <span className="text-6xl font-bold text-[#f44336] font-mono">{redScore}</span>
            <span className="text-4xl text-gray-500 font-light">:</span>
            <span className="text-6xl font-bold text-[#00bcd4] font-mono">{blueScore}</span>
          </div>

          {/* 日期和状态 */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-gray-400">
              {date} {time}
            </span>
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                isFinished
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-[#c49f58]/20 text-[#c49f58]'
              }`}
            >
              {status}
            </span>
          </div>

          {/* 视频回顾按钮 */}
          {isFinished && (
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-[#c49f58] hover:bg-[#b08d4a] text-[#1a1a2e] font-bold rounded-lg transition-all duration-200 mt-2 group"
              onClick={() => {
                // TODO: 实现视频回顾功能
              }}
            >
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
              视频回顾
            </button>
          )}
        </div>

        {/* 右侧：蓝色方 */}
        <div className="flex flex-col items-center gap-4 min-w-[140px]">
          <div className="w-24 h-24 rounded-full border-3 border-[#00bcd4] bg-[#1a1a2e] flex items-center justify-center overflow-hidden shadow-lg shadow-[#00bcd4]/20">
            <img
              src={
                getUploadUrl(blueTeam.logoUrl) ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${blueTeam.teamId}`
              }
              alt={blueTeam.teamName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden text-3xl font-bold text-[#00bcd4]">
              {blueTeam.teamName.charAt(0)}
            </span>
          </div>
          <span className="text-2xl font-bold text-white">{blueTeam.teamName}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchSeriesHeader;
