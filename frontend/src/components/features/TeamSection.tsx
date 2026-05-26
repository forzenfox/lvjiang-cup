import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useHomeData } from '../../context/HomeDataContext';
import type { Player, Team } from '@/types';
import { PlayerDetailModal } from '../team/PlayerDetailModal';
import { TeamMemberModal } from '../team/TeamMemberModal';
import PlayerDetailDrawer from '../team/PlayerDetailDrawer';
import type { PositionType } from '@/types/position';

// 骨架屏组件（正方形卡片样式，队标队名同一区域，图标队名占比更大）
const TeamCardSkeleton: React.FC = () => (
  <div
    className="aspect-square bg-[#1a1a2e] border border-white/10 rounded-lg overflow-hidden animate-pulse"
    data-testid="team-card-skeleton"
  >
    <div className="h-full flex flex-col items-center justify-center p-3 md:p-4 gap-1 md:gap-2">
      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-lg bg-white/10" />
      <div className="h-4 w-20 md:w-24 lg:w-28 bg-white/10 rounded" />
    </div>
  </div>
);

// 空数据状态组件
const EmptyState: React.FC = () => (
  <div
    className="col-span-full flex flex-col items-center justify-center py-20"
    data-testid="empty-teams"
  >
    <Users className="w-16 h-16 text-gray-500 mb-4" />
    <p className="text-xl text-gray-400 mb-2">暂无战队数据</p>
    <p className="text-sm text-gray-500 mb-6">当前没有可用的战队信息</p>
  </div>
);

const TeamSection: React.FC = () => {
  const { teamsWithMembers } = useHomeData();

  // 弹框状态
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);

  // 抽屉状态（独立于弹框）
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const teams = useMemo(() => {
    if (teamsWithMembers.length > 0) {
      return teamsWithMembers;
    }
    return [];
  }, [teamsWithMembers]);

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalOpen(false);
    setSelectedTeam(null);
    setSelectedPlayer(null);
  };

  const handleCloseDrawer = () => {
    setSelectedPlayer(null);
  };

  return (
    <section
      id="teams"
      className="min-h-[calc(100vh-96px)] md:h-[calc(100vh-96px)] flex flex-col bg-black relative"
    >
      <div className="container mx-auto px-4 flex-1 flex flex-col justify-center min-h-0 py-8">
        {/* 加载骨架屏 */}
        {teams.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          /* 正常数据展示（4行4列正方形卡片布局，队标队名占比更大） */
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto w-full"
            data-testid="teams-grid"
          >
            {teams.map(team => (
              <div
                key={team.id}
                className="aspect-square bg-[#1a1a2e] border border-white/10 hover:border-white/30 transition-all duration-300 hover:transform hover:-translate-y-1 group overflow-hidden cursor-pointer rounded-lg"
                data-testid="team-card"
                onClick={() => handleTeamClick(team)}
              >
                <div className="h-full flex flex-col items-center justify-center p-3 md:p-4 gap-1 md:gap-2">
                  <img
                    src={team.logo}
                    alt={team.name}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                    data-testid="team-logo"
                  />
                  <span
                    className="text-sm md:text-base lg:text-lg text-center text-gray-300 group-hover:text-white transition-colors truncate font-medium max-w-full"
                    data-testid="team-name"
                  >
                    {team.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 旧版队员详情弹框（向后兼容保留） */}
        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {/* 新版弹框：战队成员列表 */}
        {selectedTeam && (
          <TeamMemberModal
            team={{
              id: selectedTeam.id,
              name: selectedTeam.name,
              logoUrl: selectedTeam.logo,
              battleCry: selectedTeam.battleCry,
              members: selectedTeam.players,
            }}
            isOpen={isTeamModalOpen}
            onClose={handleCloseTeamModal}
            onPlayerClick={handlePlayerClick}
          />
        )}

        {/* 嵌套在弹框内的抽屉：队员详情 */}
        <PlayerDetailDrawer
          player={selectedPlayer}
          onClose={handleCloseDrawer}
          isMobile={isMobile}
        />
      </div>
    </section>
  );
};

export default TeamSection;
