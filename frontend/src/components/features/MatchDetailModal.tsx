import React from 'react';
import { Match, Team, MatchStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import { SWISS_THEME } from '@/constants/swissTheme';

interface MatchDetailModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match | null;
  teams: Team[];
}

// 获取状态显示文本
const getStatusText = (status: MatchStatus): string => {
  switch (status) {
    case 'upcoming':
      return '未开始';
    case 'ongoing':
      return '进行中';
    case 'finished':
      return '已结束';
    default:
      return '未知';
  }
};

// 获取状态颜色
const getStatusColor = (status: MatchStatus): string => {
  switch (status) {
    case 'upcoming':
      return '#888888';
    case 'ongoing':
      return '#4CAF50';
    case 'finished':
      return '#888888';
    default:
      return '#888888';
  }
};

// 格式化日期时间显示
const formatMatchDateTime = (startTime: string): string => {
  if (!startTime) return '待定';
  const date = new Date(startTime);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};

// 位置图标样式
const POSITION_ICON_BASE_URL = '//game.gtimg.cn/images/lpl/es/web201612/n-spr.png';

interface PositionIconStyle {
  width: number;
  height: number;
  backgroundPosition: string;
}

const getPositionIconStyle = (position: string): PositionIconStyle | null => {
  const upperPosition = position.toUpperCase();
  const positionStyles: Record<string, PositionIconStyle> = {
    TOP: { width: 32, height: 24, backgroundPosition: '-420px -4px' },
    JUNGLE: { width: 32, height: 24, backgroundPosition: '-420px -32px' },
    MID: { width: 32, height: 24, backgroundPosition: '-384px -4px' },
    ADC: { width: 32, height: 24, backgroundPosition: '-384px -32px' },
    SUPPORT: { width: 32, height: 24, backgroundPosition: '-456px -4px' },
  };
  return positionStyles[upperPosition] || null;
};

// 队伍Logo组件
const TeamLogo: React.FC<{ team?: Team; size?: number }> = ({ team, size = 48 }) => {
  if (team?.logo) {
    return (
      <img
        src={team.logo}
        alt={team.name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-gray-600 flex items-center justify-center text-gray-300"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      ?
    </div>
  );
};

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ visible, onClose, match, teams }) => {
  if (!match) return null;

  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isFinished = match.status === 'finished';
  const isTeamAWinner = isFinished && match.winnerId === match.teamAId;
  const isTeamBWinner = isFinished && match.winnerId === match.teamBId;

  // 获取双方队员，按位置排序
  const teamAPlayers = teamA?.players || [];
  const teamBPlayers = teamB?.players || [];

  // 标准位置顺序
  const positionOrder = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

  // 获取位置排序索引（支持大小写）
  const getPositionIndex = (position: string): number => {
    const upperPosition = position.toUpperCase();
    return positionOrder.indexOf(upperPosition);
  };

  // 按位置排序队员
  const sortedTeamAPlayers = [...teamAPlayers].sort((a, b) => {
    const indexA = getPositionIndex(a.position);
    const indexB = getPositionIndex(b.position);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const sortedTeamBPlayers = [...teamBPlayers].sort((a, b) => {
    const indexA = getPositionIndex(a.position);
    const indexB = getPositionIndex(b.position);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Modal visible={visible} onClose={onClose} title="对战详情" className="max-w-lg w-full">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* 对战时间和状态 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">对战时间</span>
            <span className="text-white font-medium">{formatMatchDateTime(match.startTime)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-400 text-sm">对战状态</span>
            <span className="font-medium" style={{ color: getStatusColor(match.status) }}>
              {getStatusText(match.status)}
            </span>
          </div>
        </div>

        {/* 对战双方头部 */}
        <div className="flex items-center justify-between px-4">
          {/* 左侧队伍 */}
          <div className="flex items-center gap-3">
            <TeamLogo team={teamA} size={48} />
            <div className="flex flex-col">
              <span
                className="font-semibold text-lg"
                style={{
                  color: isTeamAWinner ? SWISS_THEME.winnerText : SWISS_THEME.loserText,
                }}
              >
                {teamA?.name || '待定'}
              </span>
              {isTeamAWinner && (
                <span className="text-xs" style={{ color: SWISS_THEME.scoreActive }}>
                  胜者
                </span>
              )}
            </div>
          </div>

          {/* 比分 */}
          <div
            className="flex items-center gap-2 px-6 py-2 bg-gray-800 rounded-lg"
            style={{
              fontFamily: 'dinbold, sans-serif',
              fontWeight: 'bold',
            }}
          >
            <span
              style={{
                fontSize: '32px',
                color: isTeamAWinner ? SWISS_THEME.scoreActive : SWISS_THEME.scoreDefault,
              }}
            >
              {match.scoreA ?? '0'}
            </span>
            <span
              style={{
                fontSize: '24px',
                color: SWISS_THEME.scoreDefault,
              }}
            >
              :
            </span>
            <span
              style={{
                fontSize: '32px',
                color: isTeamBWinner ? SWISS_THEME.scoreActive : SWISS_THEME.scoreDefault,
              }}
            >
              {match.scoreB ?? '0'}
            </span>
          </div>

          {/* 右侧队伍 */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span
                className="font-semibold text-lg"
                style={{
                  color: isTeamBWinner ? SWISS_THEME.winnerText : SWISS_THEME.loserText,
                }}
              >
                {teamB?.name || '待定'}
              </span>
              {isTeamBWinner && (
                <span className="text-xs" style={{ color: SWISS_THEME.scoreActive }}>
                  胜者
                </span>
              )}
            </div>
            <TeamLogo team={teamB} size={48} />
          </div>
        </div>

        {/* 队员对阵表 */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-gray-300 text-sm font-medium mb-3 px-4">队员对阵</h3>
          {sortedTeamAPlayers.length === 0 && sortedTeamBPlayers.length === 0 ? (
            <div className="px-4 py-3 bg-gray-800 rounded-lg text-center">
              <span className="text-gray-400 text-sm">暂无队员信息</span>
            </div>
          ) : (
            <div className="space-y-2">
              {positionOrder.map(position => {
                const playerA = sortedTeamAPlayers.find(p => p.position.toUpperCase() === position);
                const playerB = sortedTeamBPlayers.find(p => p.position.toUpperCase() === position);

                // 如果双方都没有该位置的队员，不显示
                if (!playerA && !playerB) return null;

                const iconStyle = getPositionIconStyle(position);

                return (
                  <div
                    key={position}
                    className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-lg"
                  >
                    {/* 左侧队员 */}
                    <div className="flex items-center gap-2 flex-1">
                      {playerA?.avatarUrl ? (
                        <img
                          src={playerA.avatarUrl}
                          alt={playerA.nickname || ''}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-300">
                          {playerA?.nickname?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="text-white text-sm font-medium">
                        {playerA?.nickname || '待定'}
                      </span>
                    </div>

                    {/* 位置图标（中间） */}
                    <div className="px-4 flex items-center justify-center">
                      {iconStyle && (
                        <div
                          style={{
                            width: iconStyle.width,
                            height: iconStyle.height,
                            backgroundImage: `url(${POSITION_ICON_BASE_URL})`,
                            backgroundPosition: iconStyle.backgroundPosition,
                          }}
                        />
                      )}
                    </div>

                    {/* 右侧队员 */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-white text-sm font-medium">
                        {playerB?.nickname || '待定'}
                      </span>
                      {playerB?.avatarUrl ? (
                        <img
                          src={playerB.avatarUrl}
                          alt={playerB.nickname || ''}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-300">
                          {playerB?.nickname?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 赛制信息 */}
        {match.boFormat && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                赛制：<span className="text-white font-medium">{match.boFormat}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MatchDetailModal;
