import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { mockService } from '../../mock/service';
import { teamService } from '@/services/teamService';
import { matchService } from '@/services/matchService';
import { streamService } from '@/services/streamService';
import { Upload, Trash2, Database, Users, Trophy, Radio, Activity } from 'lucide-react';
import { toast } from 'sonner';
// import type { Match } from '@/types';

interface DashboardStats {
  totalTeams: number;
  totalMatches: number;
  upcomingMatches: number;
  ongoingMatches: number;
  finishedMatches: number;
  liveStream: boolean;
}

const AdminDashboard: React.FC = () => {
  const [isLoadMockDialogOpen, setIsLoadMockDialogOpen] = useState(false);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalMatches: 0,
    upcomingMatches: 0,
    ongoingMatches: 0,
    finishedMatches: 0,
    liveStream: false,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      // 并行获取数据
      const [teamsResult, matchesResult, streamResult] = await Promise.all([
        teamService.getAll(1, 100),
        matchService.getAll(1, 100),
        streamService.get().catch(() => null),
      ]);

      const teams = teamsResult.data || [];
      const matches = matchesResult.data || [];

      // 计算统计数据 - 将 API 状态映射到前端状态
      const mapStatus = (status: string): string => {
        switch (status) {
          case 'scheduled': return 'upcoming';
          case 'live': return 'ongoing';
          case 'completed': return 'finished';
          default: return 'upcoming';
        }
      };
      
      const upcomingMatches = matches.filter(m => mapStatus(m.status) === 'upcoming').length;
      const ongoingMatches = matches.filter(m => mapStatus(m.status) === 'ongoing').length;
      const finishedMatches = matches.filter(m => mapStatus(m.status) === 'finished').length;

      setStats({
        totalTeams: teams.length,
        totalMatches: matches.length,
        upcomingMatches,
        ongoingMatches,
        finishedMatches,
        liveStream: streamResult?.isActive || false,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('加载统计数据失败');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLoadMockData = async () => {
    setIsLoading(true);
    try {
      await mockService.resetAllData();
      toast.success('Mock 数据加载成功！');
      setIsLoadMockDialogOpen(false);
      // 刷新统计数据
      await loadStats();
      // 刷新页面以显示新数据
      window.location.reload();
    } catch (error) {
      toast.error('加载 Mock 数据失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    setIsLoading(true);
    try {
      await mockService.clearAllData();
      toast.success('所有数据已清空！');
      setIsClearDataDialogOpen(false);
      // 刷新统计数据
      await loadStats();
      // 刷新页面以反映数据清空
      window.location.reload();
    } catch (error) {
      toast.error('清空数据失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color,
    subtitle 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{loadingStats ? '-' : value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">管理仪表盘</h1>
      
      {/* 统计卡片区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="参赛战队"
          value={stats.totalTeams}
          icon={Users}
          color="bg-blue-600"
          subtitle="已注册战队总数"
        />
        <StatCard
          title="比赛总数"
          value={stats.totalMatches}
          icon={Trophy}
          color="bg-purple-600"
          subtitle={`${stats.upcomingMatches} 未开始 / ${stats.ongoingMatches} 进行中 / ${stats.finishedMatches} 已结束`}
        />
        <StatCard
          title="直播状态"
          value={stats.liveStream ? '直播中' : '未直播'}
          icon={Radio}
          color={stats.liveStream ? 'bg-green-600' : 'bg-gray-600'}
          subtitle={stats.liveStream ? '当前正在直播' : '暂无直播'}
        />
        <StatCard
          title="系统状态"
          value="正常"
          icon={Activity}
          color="bg-green-600"
          subtitle="所有服务运行正常"
        />
      </div>

      {/* 快捷操作区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/admin/stream'}
        >
          <h3 className="text-xl font-semibold text-secondary mb-2">直播管理</h3>
          <p className="text-gray-400">管理直播链接和状态</p>
          <div className="mt-4 flex items-center text-sm text-blue-400">
            <span>进入管理</span>
            <span className="ml-1">→</span>
          </div>
        </div>
        <div 
          className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/admin/teams'}
        >
          <h3 className="text-xl font-semibold text-secondary mb-2">战队管理</h3>
          <p className="text-gray-400">管理参赛战队和队员信息</p>
          <div className="mt-4 flex items-center text-sm text-blue-400">
            <span>进入管理</span>
            <span className="ml-1">→</span>
          </div>
        </div>
        <div 
          className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/admin/schedule'}
        >
          <h3 className="text-xl font-semibold text-secondary mb-2">赛程管理</h3>
          <p className="text-gray-400">更新比赛结果和赛程安排</p>
          <div className="mt-4 flex items-center text-sm text-blue-400">
            <span>进入管理</span>
            <span className="ml-1">→</span>
          </div>
        </div>
      </div>

      {/* 数据管理区域 */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-secondary" />
          <h3 className="text-xl font-semibold text-white">数据管理</h3>
        </div>
        <p className="text-gray-400 mb-6">管理本地存储的数据，包括加载初始 Mock 数据或清空所有数据。</p>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => setIsLoadMockDialogOpen(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            加载 Mock 数据
          </Button>
          <Button
            onClick={() => setIsClearDataDialogOpen(true)}
            disabled={isLoading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空所有数据
          </Button>
          <Button
            onClick={loadStats}
            disabled={loadingStats}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Activity className="w-4 h-4 mr-2" />
            刷新统计
          </Button>
        </div>
      </div>

      {/* 加载 Mock 数据确认对话框 */}
      <ConfirmDialog
        isOpen={isLoadMockDialogOpen}
        title="确认加载 Mock 数据？"
        message="此操作将重置所有数据为初始 Mock 状态，当前数据将被覆盖。是否继续？"
        confirmText="加载数据"
        cancelText="取消"
        onConfirm={handleLoadMockData}
        onCancel={() => setIsLoadMockDialogOpen(false)}
      />

      {/* 清空数据确认对话框 */}
      <ConfirmDialog
        isOpen={isClearDataDialogOpen}
        title="确认清空所有数据？"
        message="此操作将清空所有 localStorage 数据，无法恢复。是否继续？"
        confirmText="清空数据"
        cancelText="取消"
        onConfirm={handleClearAllData}
        onCancel={() => setIsClearDataDialogOpen(false)}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
