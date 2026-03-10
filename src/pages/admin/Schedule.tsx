import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { mockService } from '../../mock/service';
import { Match, Team } from '../../types';
import { Toaster, toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import SwissStageVisualEditor from './SwissStageVisualEditor';
import EliminationStage from '@/components/features/EliminationStage';
import { useAdvancementStore } from '@/store/advancementStore';

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
      const [matchesData, teamsData] = await Promise.all([
        mockService.getMatches(),
        mockService.getTeams()
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = async (updatedMatch: Match) => {
    setLoading(true);
    try {
      await mockService.updateMatch(updatedMatch);
      toast.success('比赛信息已更新');
      await loadData();
    } catch (error) {
      console.error('Failed to update match', error);
      toast.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchCreate = async (newMatch: Omit<Match, 'id'>) => {
    setLoading(true);
    try {
      await mockService.addMatch(newMatch);
      toast.success('比赛添加成功');
      await loadData();
    } catch (error) {
      console.error('Failed to create match', error);
      toast.error('添加失败');
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
          <h1 className="text-3xl font-bold text-white">赛程管理</h1>
          <div className="text-sm text-gray-400">
            共 {matches.length} 场比赛
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg border border-gray-800 p-6">
          {loading && matches.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              加载中...
            </div>
          ) : (
            <Tabs defaultValue="swiss" className="w-full">
              <TabsList className="mb-6 bg-gray-800/50 border border-gray-700">
                <TabsTrigger value="swiss" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  瑞士轮 (Swiss Stage)
                </TabsTrigger>
                <TabsTrigger value="elimination" className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  淘汰赛 (Elimination Stage)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="swiss" className="mt-0">
                <SwissStageVisualEditor
                  matches={swissMatches}
                  teams={teams}
                  advancement={advancement}
                  onMatchUpdate={handleMatchUpdate}
                  onMatchCreate={handleMatchCreate}
                  onAdvancementUpdate={handleAdvancementUpdate}
                />
              </TabsContent>

              <TabsContent value="elimination" className="mt-0">
                <EliminationStage
                  matches={eliminationMatches}
                  teams={teams}
                  editable={true}
                  onMatchUpdate={handleMatchUpdate}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
