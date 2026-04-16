import React, { useEffect, useState, useCallback } from 'react';
import { User, Users, Loader2, AlertCircle } from 'lucide-react';
import { teamService } from '../../services';
import type { Team as ApiTeam, Player } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { TopIcon, JungleIcon, MidIcon, AdcIcon, SupportIcon } from '../icons/PositionIcons';
import { getPositionLabel } from '../../utils/position';
import { PositionType } from '../../types/position';
import { PlayerDetailModal } from '../team/PlayerDetailModal';
import { getLevelBadgeClasses, getCaptainBadgeClasses } from '../../utils/levelColors';
import { getUploadUrl } from '@/utils/upload';

// 本地 Team 类型（与后端数据模型一致）
interface Team {
  id: string;
  name: string;
  logo: string;
  battleCry: string;
  players: Player[];
}

const PositionIcon: React.FC<{ position: PositionType }> = ({ position }) => {
  switch (position) {
    case 'TOP':
      return <TopIcon className="w-4 h-4" />;
    case 'JUNGLE':
      return <JungleIcon className="w-4 h-4" />;
    case 'MID':
      return <MidIcon className="w-4 h-4" />;
    case 'ADC':
      return <AdcIcon className="w-4 h-4" />;
    case 'SUPPORT':
      return <SupportIcon className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4 text-gray-400" />;
  }
};

// 骨架屏组件
const TeamCardSkeleton: React.FC = () => (
  <Card className="bg-white/5 border-white/10 overflow-hidden">
    <div className="h-32 bg-gradient-to-br from-blue-900/30 to-purple-900/30 relative flex items-center justify-center p-4">
      <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
    </div>
    <CardHeader>
      <div className="h-6 w-3/4 mx-auto bg-white/10 rounded animate-pulse" />
      <div className="h-4 w-1/2 mx-auto bg-white/10 rounded animate-pulse mt-2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center justify-between p-2 rounded bg-black/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// 空数据状态组件
const EmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div
    className="col-span-full flex flex-col items-center justify-center py-20"
    data-testid="empty-teams"
  >
    <Users className="w-16 h-16 text-gray-500 mb-4" />
    <p className="text-xl text-gray-400 mb-2">暂无战队数据</p>
    <p className="text-sm text-gray-500 mb-6">当前没有可用的战队信息</p>
    <Button
      variant="outline"
      onClick={onRetry}
      className="border-secondary text-secondary hover:bg-secondary/10"
    >
      刷新数据
    </Button>
  </div>
);

// 错误状态组件
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20">
    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
    <p className="text-xl text-red-400 mb-2">加载失败</p>
    <p className="text-sm text-gray-400 mb-6">{message}</p>
    <Button
      variant="outline"
      onClick={onRetry}
      className="border-red-400 text-red-400 hover:bg-red-400/10"
    >
      重试
    </Button>
  </div>
);

const TeamSection: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  // 将 API Team 转换为本地 Team 格式
  const convertApiTeamToLocal = (apiTeam: ApiTeam): Team => {
    // 使用 members 字段（后端返回）
    const members = apiTeam.members || [];

    // 如果 API 返回了队员数据，使用真实数据；否则生成模拟数据
    let players: Player[];
    if (members.length > 0) {
      players = members.map(apiPlayer => ({
        id: apiPlayer.id,
        nickname: apiPlayer.nickname,
        avatarUrl:
          apiPlayer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiPlayer.id}`,
        position: apiPlayer.position,
        teamId: apiTeam.id,
        gameId: apiPlayer.gameId,
        bio: apiPlayer.bio,
        championPool: apiPlayer.championPool,
        rating: apiPlayer.rating,
        isCaptain: apiPlayer.isCaptain,
        liveUrl: apiPlayer.liveUrl,
        level: apiPlayer.level,
      }));
    } else {
      // 生成模拟队员数据（当 API 没有返回队员数据时）
      const positions: PositionType[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      players = positions.map((position, index) => ({
        id: `${apiTeam.id}-player-${index}`,
        nickname: '待补充',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiTeam.id}-${index}`,
        position,
        teamId: apiTeam.id,
      }));
    }

    return {
      id: apiTeam.id,
      name: apiTeam.name,
      logo:
        getUploadUrl(apiTeam.logo || apiTeam.logoUrl) ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${apiTeam.id}`,
      players,
      battleCry: apiTeam.battleCry || '暂无参赛宣言',
    };
  };

  // 获取战队数据
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamService.getAll();
      const convertedTeams = response.map(convertApiTeamToLocal);
      setTeams(convertedTeams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取战队数据失败';
      setError(errorMessage);
      console.error('[TeamSection] 获取战队数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <section id="teams" className="min-h-screen flex flex-col bg-black relative">
      <div className="container mx-auto px-4 flex-1 flex flex-col justify-center min-h-0">
        {/* 加载骨架屏 */}
        {loading && teams.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        ) : error && teams.length === 0 ? (
          /* 错误状态 */
          <div className="grid grid-cols-1">
            <ErrorState message={error} onRetry={fetchTeams} />
          </div>
        ) : teams.length === 0 ? (
          /* 空数据状态 */
          <div className="grid grid-cols-1">
            <EmptyState onRetry={fetchTeams} />
          </div>
        ) : (
          /* 正常数据展示 */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            data-testid="teams-grid"
          >
            {teams.map(team => (
              <Card
                key={team.id}
                className="bg-white/5 border-white/10 hover:border-secondary/50 transition-all duration-300 hover:transform hover:-translate-y-2 group overflow-hidden"
                data-testid="team-card"
              >
                <div className="h-32 bg-gradient-to-br from-blue-900/50 to-purple-900/50 relative flex items-center justify-center p-4">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-24 h-24 object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                    data-testid="team-logo"
                  />
                </div>
                <CardHeader>
                  <CardTitle
                    className="text-xl text-center text-secondary group-hover:text-white transition-colors"
                    data-testid="team-name"
                  >
                    {team.name}
                  </CardTitle>
                  <CardDescription className="text-center" data-testid="team-battle-cry">
                    {team.battleCry}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.players.map(player => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 rounded bg-gray-200/90 hover:bg-gray-100/95 transition-colors shadow-sm cursor-pointer"
                        onClick={() => handlePlayerClick(player)}
                        data-testid="player-row"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={player.avatarUrl}
                            alt={player.nickname}
                            className="w-8 h-8 rounded-full bg-gray-300 object-cover ring-2 ring-white/50"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            {player.nickname}
                          </span>
                          {player.level && (
                            <span className={getLevelBadgeClasses(player.level)}>
                              {player.level}
                            </span>
                          )}
                          {player.isCaptain && (
                            <span className={getCaptainBadgeClasses()}>队长</span>
                          )}
                        </div>
                        <div
                          className="flex items-center"
                          title={getPositionLabel(player.position)}
                          data-testid="position-icon"
                        >
                          <PositionIcon position={player.position} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 刷新指示器 */}
        {loading && teams.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">更新中...</span>
          </div>
        )}

        {/* 队员详情弹框 */}
        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </section>
  );
};

export default TeamSection;
