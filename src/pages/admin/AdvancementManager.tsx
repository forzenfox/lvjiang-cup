import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAdvancementStore, categoryConfig, categoryOrder } from '@/store/advancementStore';
import { initialTeams } from '@/mock/data';
import type { Team, AdvancementCategory } from '@/types';
import { Save, RotateCcw, RefreshCcw, AlertCircle, Info, Users } from 'lucide-react';
import { toast } from 'sonner';

const ALL_TEAMS: Team[] = initialTeams;

const AdvancementManager: React.FC = () => {
  const {
    advancement,
    lastUpdated,
    updatedBy,
    setAdvancement,
    reset,
    restoreDefault,
    getAllTeamIds
  } = useAdvancementStore();

  // 本地状态用于跟踪变更
  const [localAdvancement, setLocalAdvancement] = useState(advancement);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [draggedTeam, setDraggedTeam] = useState<string | null>(null);

  // 获取未分配的队伍
  const unassignedTeams = useMemo(() => {
    const assignedIds = [
      ...localAdvancement.winners2_0,
      ...localAdvancement.winners2_1,
      ...localAdvancement.losersBracket,
      ...localAdvancement.eliminated3rd,
      ...localAdvancement.eliminated0_3
    ];
    return ALL_TEAMS.filter(team => !assignedIds.includes(team.id));
  }, [localAdvancement]);

  // 获取队伍信息
  const getTeamById = (id: string): Team | undefined => {
    return ALL_TEAMS.find(t => t.id === id);
  };

  // 处理拖拽开始
  const handleDragStart = (teamId: string) => {
    setDraggedTeam(teamId);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedTeam(null);
  };

  // 处理放置
  const handleDrop = (category: AdvancementCategory | 'unassigned') => {
    if (!draggedTeam) return;

    const newAdvancement = { ...localAdvancement };

    // 从所有分类中移除
    (Object.keys(newAdvancement) as AdvancementCategory[]).forEach(cat => {
      newAdvancement[cat] = newAdvancement[cat].filter(id => id !== draggedTeam);
    });

    // 添加到新分类
    if (category !== 'unassigned') {
      newAdvancement[category] = [...newAdvancement[category], draggedTeam];
    }

    setLocalAdvancement(newAdvancement);
    setHasChanges(true);
    setDraggedTeam(null);
  };

  // 处理保存
  const handleSave = () => {
    setAdvancement(localAdvancement, 'admin');
    setHasChanges(false);
    toast.success('晋级名单已保存');
  };

  // 处理重置
  const handleReset = () => {
    reset();
    // 重新加载 store 中的数据
    const store = useAdvancementStore.getState();
    setLocalAdvancement(store.advancement);
    setHasChanges(false);
    setShowResetDialog(false);
    toast.info('已重置到上次保存的状态');
  };

  // 处理恢复默认
  const handleRestoreDefault = () => {
    restoreDefault();
    const store = useAdvancementStore.getState();
    setLocalAdvancement(store.advancement);
    setHasChanges(false);
    setShowRestoreDialog(false);
    toast.info('已恢复到默认数据');
  };

  // 渲染队伍卡片
  const renderTeamCard = (team: Team, isDraggable: boolean = true) => (
    <div
      key={team.id}
      draggable={isDraggable}
      onDragStart={() => isDraggable && handleDragStart(team.id)}
      onDragEnd={handleDragEnd}
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all
        ${isDraggable ? 'cursor-move hover:shadow-md' : 'cursor-default'}
        ${draggedTeam === team.id ? 'opacity-50' : 'opacity-100'}
        bg-gray-700 border-gray-600 hover:border-gray-500
      `}
    >
      <img
        src={team.logo}
        alt={team.name}
        className="w-8 h-8 rounded-full object-cover bg-gray-800"
      />
      <span className="text-white font-medium">{team.name}</span>
    </div>
  );

  // 渲染分类区域
  const renderCategorySection = (category: AdvancementCategory) => {
    const config = categoryConfig[category];
    const teams = localAdvancement[category]
      .map(id => getTeamById(id))
      .filter((t): t is Team => t !== undefined);

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(category)}
        className="flex flex-col gap-2"
      >
        <div className={`${config.color} text-white px-3 py-2 rounded-t-lg font-semibold text-sm`}>
          {config.label}
          <span className="ml-2 text-xs opacity-80">({teams.length})</span>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-b-lg p-3 min-h-[120px]">
          {teams.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">
              拖拽队伍到此处
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {teams.map(team => renderTeamCard(team))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 标题栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">晋级名单管理</h1>
            <p className="text-gray-400 mt-1">
              管理瑞士轮结束后各队伍的晋级/淘汰状态
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="flex items-center gap-1 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                有未保存的变更
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              disabled={!hasChanges}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重置
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRestoreDialog(true)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              恢复默认
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </div>

        {/* 状态信息 */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Info className="w-4 h-4" />
                <span>最后更新: {new Date(lastUpdated).toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span>操作人: {updatedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-green-400">已分配: {getAllTeamIds().length}/8</span>
              </div>
              {unassignedTeams.length > 0 && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>未分配: {unassignedTeams.length} 支队伍</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：未分配队伍 */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  待分配队伍
                  <span className="text-sm font-normal text-gray-400">
                    ({unassignedTeams.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop('unassigned')}
                  className="space-y-2 min-h-[200px]"
                >
                  {unassignedTeams.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-8">
                      所有队伍已分配
                    </div>
                  ) : (
                    unassignedTeams.map(team => renderTeamCard(team))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：分类区域 */}
          <div className="lg:col-span-9">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">晋级/淘汰分类</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryOrder.map(category => renderCategorySection(category))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 说明区域 */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-4">
            <h3 className="text-white font-semibold mb-3">规则说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1" />
                <div>
                  <span className="text-white font-medium">2-0 和 2-1 晋级</span>
                  <p>2胜0负或2胜1负的队伍晋级胜者组</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 mt-1" />
                <div>
                  <span className="text-white font-medium">败者组晋级</span>
                  <p>1胜2负但积分前2名的队伍晋级败者组</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                <div>
                  <span className="text-white font-medium">积分第三淘汰</span>
                  <p>1胜2负积分第3名的队伍被淘汰</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 mt-1" />
                <div>
                  <span className="text-white font-medium">0-3 淘汰</span>
                  <p>0胜3负的队伍直接淘汰</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 重置确认对话框 */}
      <ConfirmDialog
        isOpen={showResetDialog}
        title="确认重置？"
        message="此操作将放弃当前未保存的变更，恢复到上次保存的状态。是否继续？"
        confirmText="重置"
        cancelText="取消"
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />

      {/* 恢复默认确认对话框 */}
      <ConfirmDialog
        isOpen={showRestoreDialog}
        title="确认恢复默认？"
        message="此操作将恢复到初始默认数据，当前所有变更将丢失。是否继续？"
        confirmText="恢复默认"
        cancelText="取消"
        onConfirm={handleRestoreDefault}
        onCancel={() => setShowRestoreDialog(false)}
      />
    </AdminLayout>
  );
};

export default AdvancementManager;
