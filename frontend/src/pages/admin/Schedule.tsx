import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { teamService } from '@/services/teamService';
import { matchService } from '@/services/matchService';
import type { Team, Match, MatchStatus } from '@/types';
import type { UpdateMatchRequest } from '@/api/types';
import { Toaster, toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import SwissStageVisualEditor from './SwissStageVisualEditor';
import EliminationStage from '@/components/features/EliminationStage';
import { useAdvancementStore } from '@/store/advancementStore';
import { RefreshCw, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 将前端 Match 转换为 API UpdateMatchRequest
const toUpdateMatchRequest = (match: Match): UpdateMatchRequest => ({
  id: match.id,
  team1Score: match.scoreA,
  team2Score: match.scoreB,
  winnerTeamId: match.winnerId || undefined,
  status: mapStatusToApi(match.status),
});

// 将前端状态映射到 API 状态
const mapStatusToApi = (status: MatchStatus): 'scheduled' | 'live' | 'completed' | 'cancelled' => {
  switch (status) {
    case 'upcoming':
      return 'scheduled';
    case 'ongoing':
      return 'live';
    case 'finished':
      return 'completed';
    default:
      return 'scheduled';
  }
};

// 将 API 状态映射到前端状态
const mapStatusToFrontend = (status: string): MatchStatus => {
  switch (status) {
    case 'scheduled':
      return 'upcoming';
    case 'live':
      return 'ongoing';
    case 'completed':
      return 'finished';
    case 'cancelled':
      return 'upcoming';
    default:
      return 'upcoming';
  }
};

// 将 API Match 转换为前端 Match
const toFrontendMatch = (apiMatch: any): Match => ({
  id: apiMatch.id,
  teamAId: apiMatch.team1Id,
  teamBId: apiMatch.team2Id,
  scoreA: apiMatch.team1Score || 0,
  scoreB: apiMatch.team2Score || 0,
  winnerId: apiMatch.winnerTeamId || null,
  round: `第${apiMatch.round}轮`,
  status: mapStatusToFrontend(apiMatch.status),
  startTime: apiMatch.scheduledAt || '',
  stage: apiMatch.stage as 'swiss' | 'elimination',
  swissRecord: apiMatch.swissRecord,
  swissDay: apiMatch.swissDay,
  eliminationGameNumber: apiMatch.eliminationGameNumber,
  eliminationBracket: apiMatch.eliminationBracket,
});

const AdminSchedule: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  
  const advancement = useAdvancementStore(state => state.advancement);
  const setAdvancement = useAdvancementStore(state => state.setAdvancement);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesResult, teamsResult] = await Promise.all([
        matchService.getAll(1, 100),
        teamService.getAll(1, 100),
      ]);
      
      const frontendMatches = matchesResult.data.map(toFrontendMatch);
      const frontendTeams = teamsResult.data.map(t => ({
        id: t.id,
        name: t.name,
        logo: t.logo || '',
        description: t.description || '',
        players: (t.members || []).map((name: string, index: number) => ({
          id: `p-${t.id}-${index}`,
          name,
          position: ['上单', '打野', '中单', 'AD', '辅助'][index] || '替补',
          avatar: '',
          description: '',
          teamId: t.id
        })),
      }));
      
      setMatches(frontendMatches);
      setTeams(frontendTeams as Team[]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = async (updatedMatch: Match) => {
    setLoading(true);
    try {
      const updateData = toUpdateMatchRequest(updatedMatch);
      await matchService.update(updateData);
      toast.success('比赛信息已更新');
      await loadData();
    } catch (error) {
      console.error('Failed to update match:', error);
      toast.error(error instanceof Error ? error.message : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancementUpdate = (newAdvancement: typeof advancement) => {
    setAdvancement(newAdvancement, 'admin');
    toast.success('晋级名单已更新');
  };

  const swissMatches = matches.filter(m => m.stage === 'swiss');
  const eliminationMatches = matches.filter(m => m.stage === 'elimination');

  return (
    <AdminLayout>
      <Toaster position="top-right" theme="dark" />
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">赛程管理</h1>
            <p className="text-sm text-gray-400 mt-1">
              共 {matches.length} 场比赛 · {swissMatches.length} 场瑞士轮 · {eliminationMatches.length} 场淘汰赛
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadData}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg border border-gray-800 p-6">
          {loading && matches.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin mr-2" />
              加载中...
            </div>
          ) : (
            <Tabs defaultValue="swiss" className="w-full">
              <TabsList className="mb-6 bg-gray-800/50 border border-gray-700">
                <TabsTrigger value="swiss" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  瑞士轮 (Swiss Stage)
                  <span className="ml-1 text-xs opacity-70">({swissMatches.length})</span>
                </TabsTrigger>
                <TabsTrigger value="elimination" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  淘汰赛 (Elimination Stage)
                  <span className="ml-1 text-xs opacity-70">({eliminationMatches.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="swiss" className="mt-0">
                {teams.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>请先添加战队数据</p>
                  </div>
                ) : (
                  <SwissStageVisualEditor
                    matches={swissMatches}
                    teams={teams}
                    advancement={advancement}
                    onMatchUpdate={handleMatchUpdate}
                    onAdvancementUpdate={handleAdvancementUpdate}
                  />
                )}
              </TabsContent>

              <TabsContent value="elimination" className="mt-0">
                {teams.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>请先添加战队数据</p>
                  </div>
                ) : (
                  <EliminationStage
                    matches={eliminationMatches}
                    teams={teams}
                    editable={true}
                    onMatchUpdate={handleMatchUpdate}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
