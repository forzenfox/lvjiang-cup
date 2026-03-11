import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { matchService, teamService } from '@/services';
import type { Match as ApiMatch, Team as ApiTeam } from '@/api/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SwissStage from './SwissStage';
import EliminationStage from './EliminationStage';
import { useAdvancementStore } from '@/store/advancementStore';

// 本地 Match 类型（兼容现有UI组件）
type MatchStatus = 'upcoming' | 'ongoing' | 'finished';
type MatchStage = 'swiss' | 'elimination';
type EliminationBracket = 'winners' | 'losers' | 'grand_finals';

interface Player {
  id: string;
  name: string;
  avatar: string;
  position: string;
  description: string;
}

interface Team {
  id: string;
  name: string;
  logo: string;
  players: Player[];
  description: string;
}

interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
  round: string;
  status: MatchStatus;
  startTime: string;
  stage: MatchStage;
  swissRecord?: string;
  swissDay?: number;
  eliminationGameNumber?: number;
  eliminationBracket?: EliminationBracket;
}

// 将 API Match 转换为本地 Match 格式
const convertApiMatchToLocal = (apiMatch: ApiMatch, teams: Team[]): Match => {
  const teamA = teams.find(t => t.id === apiMatch.team1Id);
  const teamB = teams.find(t => t.id === apiMatch.team2Id);

  // 将 API status 映射到本地 status
  let status: MatchStatus = 'upcoming';
  if (apiMatch.status === 'live') status = 'ongoing';
  else if (apiMatch.status === 'completed') status = 'finished';

  // 将 API stage 映射到本地 stage
  const stage: MatchStage = apiMatch.stage === 'elimination' ? 'elimination' : 'swiss';

  return {
    id: apiMatch.id,
    teamAId: apiMatch.team1Id,
    teamBId: apiMatch.team2Id,
    teamA,
    teamB,
    scoreA: apiMatch.team1Score || 0,
    scoreB: apiMatch.team2Score || 0,
    winnerId: apiMatch.winnerTeamId || null,
    round: `第${apiMatch.round}轮`,
    status,
    startTime: apiMatch.scheduledAt || new Date().toISOString(),
    stage,
    swissRecord: stage === 'swiss' ? `${apiMatch.team1Score || 0}-${apiMatch.team2Score || 0}` : undefined,
    swissDay: stage === 'swiss' ? apiMatch.round : undefined,
    eliminationGameNumber: stage === 'elimination' ? apiMatch.round : undefined,
    eliminationBracket: stage === 'elimination' ? 'winners' : undefined,
  };
};

// 将 API Team 转换为本地 Team 格式
const convertApiTeamToLocal = (apiTeam: ApiTeam): Team => {
  const positions = ['上单', '打野', '中单', 'ADC', '辅助'];
  const players: Player[] = positions.map((position, index) => ({
    id: `${apiTeam.id}-player-${index}`,
    name: `${apiTeam.name} - ${position}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiTeam.id}-${index}`,
    position,
    description: `${position}选手`,
  }));

  return {
    id: apiTeam.id,
    name: apiTeam.name,
    logo: apiTeam.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${apiTeam.id}`,
    players,
    description: apiTeam.description || '暂无描述',
  };
};

// 加载骨架屏组件
const ScheduleSkeleton: React.FC = () => (
  <div className="w-full">
    <div className="flex justify-center mb-8">
      <div className="flex space-x-2 bg-gray-800/50 p-1 rounded-lg">
        <div className="w-24 h-10 bg-white/10 rounded animate-pulse" />
        <div className="w-24 h-10 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

// 错误状态组件
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20">
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

// 空数据状态组件
const EmptyState: React.FC<{ stage: string; onRetry: () => void }> = ({ stage, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <Calendar className="w-16 h-16 text-gray-500 mb-4" />
    <p className="text-xl text-gray-400 mb-2">暂无{stage}数据</p>
    <p className="text-sm text-gray-500 mb-6">当前没有可用的比赛信息</p>
    <Button 
      variant="outline" 
      onClick={onRetry}
      className="border-secondary text-secondary hover:bg-secondary/10"
    >
      刷新数据
    </Button>
  </div>
);

interface ScheduleSectionProps {
  /** 自动刷新间隔（毫秒），默认 30000ms (30秒) */
  refreshInterval?: number;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ refreshInterval = 30000 }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('swiss');
  const advancement = useAdvancementStore(state => state.advancement);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [matchesResponse, teamsResponse] = await Promise.all([
        matchService.getAll(1, 100),
        teamService.getAll(1, 100)
      ]);

      const convertedTeams = teamsResponse.data.map(convertApiTeamToLocal);
      const convertedMatches = matchesResponse.data.map(m => convertApiMatchToLocal(m, convertedTeams));
      
      setTeams(convertedTeams);
      setMatches(convertedMatches);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取赛程数据失败';
      setError(errorMessage);
      console.error('[ScheduleSection] 获取赛程数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 按阶段筛选比赛
  const swissMatches = matches.filter(m => m.stage === 'swiss');
  const eliminationMatches = matches.filter(m => m.stage === 'elimination');

  // Tab 切换处理
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Tab 切换时刷新数据
    loadData();
  };

  useEffect(() => {
    // 初始加载
    loadData();

    // 设置自动刷新
    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    // 页面可见性检测：切换回页面时立即刷新
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData, refreshInterval]);

  return (
    <section id="schedule" className="py-20 px-4 bg-gradient-to-b from-primary via-primary to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white uppercase tracking-wider"
        >
          赛程安排
        </motion.h2>

        {loading && matches.length === 0 ? (
          // 加载骨架屏
          <ScheduleSkeleton />
        ) : error && matches.length === 0 ? (
          // 错误状态
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-8 flex">
              <TabsTrigger value="swiss" className="flex-1">瑞士轮</TabsTrigger>
              <TabsTrigger value="elimination" className="flex-1">淘汰赛</TabsTrigger>
            </TabsList>

            <TabsContent value="swiss" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {swissMatches.length === 0 ? (
                  <EmptyState stage="瑞士轮" onRetry={loadData} />
                ) : (
                  <SwissStage 
                    matches={swissMatches} 
                    teams={teams}
                    advancement={advancement}
                  />
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="elimination" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {eliminationMatches.length === 0 ? (
                  <EmptyState stage="淘汰赛" onRetry={loadData} />
                ) : (
                  <EliminationStage 
                    matches={eliminationMatches} 
                    teams={teams}
                  />
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        )}

        {/* 刷新指示器 */}
        {loading && matches.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">更新中...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScheduleSection;
