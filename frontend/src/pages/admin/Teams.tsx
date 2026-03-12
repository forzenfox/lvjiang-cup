import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { teamService } from '@/services/teamService';
import type { Team, Player } from '@/types';
import type { CreateTeamRequest, UpdateTeamRequest } from '@/api/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Plus, Trash2, Edit2, Save, X, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// LOL固定位置
const LOL_POSITIONS = ['上单', '打野', '中单', 'AD', '辅助'];

// 创建默认队员列表
const createDefaultPlayers = (teamId: string): Player[] => {
  return LOL_POSITIONS.map((position, index) => ({
    id: `p-${teamId}-${index}`,
    name: '',
    position,
    avatar: '',
    description: '',
    teamId
  }));
};

// 确保队员列表包含所有位置
const ensureAllPositions = (players: Player[] = [], teamId: string): Player[] => {
  const existingPlayers = [...players];
  const result: Player[] = [];
  
  LOL_POSITIONS.forEach((position, index) => {
    const existingPlayer = existingPlayers.find(p => p.position === position);
    if (existingPlayer) {
      result.push(existingPlayer);
    } else {
      result.push({
        id: `p-${teamId}-${index}-${Date.now()}`,
        name: '',
        position,
        avatar: '',
        description: '',
        teamId
      });
    }
  });
  
  return result;
};

// 将前端 Team 转换为 API CreateTeamRequest
const toCreateTeamRequest = (team: Team): CreateTeamRequest => ({
  id: team.id,
  name: team.name,
  logo: team.logo,
  description: team.description,
  players: team.players
    ?.filter(p => p.name.trim())
    .map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      position: p.position as '上单' | '打野' | '中单' | 'AD' | '辅助',
    })) || [],
});

// 将前端 Team 转换为 API UpdateTeamRequest
const toUpdateTeamRequest = (team: Team): UpdateTeamRequest => ({
  id: team.id,
  name: team.name,
  logo: team.logo,
  description: team.description,
  players: team.players
    ?.filter(p => p.name.trim())
    .map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      position: p.position as '上单' | '打野' | '中单' | 'AD' | '辅助',
    })) || [],
});

// 将 API Team 转换为前端 Team
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toFrontendTeam = (apiTeam: any): Team => ({
  id: apiTeam.id,
  name: apiTeam.name,
  logo: apiTeam.logo || '',
  description: apiTeam.description || '',
  players: ensureAllPositions(
    (apiTeam.members || []).map((name: string, index: number) => ({
      id: `p-${apiTeam.id}-${index}`,
      name,
      position: LOL_POSITIONS[index] || '替补',
      avatar: '',
      description: '',
      teamId: apiTeam.id
    })),
    apiTeam.id
  ),
});

const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const response = await teamService.getAll(1, 100);
      const frontendTeams = response.data.map(toFrontendTeam);
      setTeams(frontendTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast.error('加载战队列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    // 确保编辑时包含所有5个位置
    const teamWithAllPositions = {
      ...team,
      players: ensureAllPositions(team.players, team.id)
    };
    setEditingTeam(teamWithAllPositions);
  };

  const handleSave = async () => {
    if (!editingTeam) return;
    
    // 验证战队名称
    if (!editingTeam.name.trim()) {
      toast.error('战队名称不能为空');
      return;
    }

    setLoading(true);
    try {
      const isExisting = teams.find(t => t.id === editingTeam.id);
      
      if (isExisting) {
        // 更新现有战队
        const updateData = toUpdateTeamRequest(editingTeam);
        await teamService.update(updateData);
        toast.success('战队信息已更新');
      } else {
        // 创建新战队
        const createData = toCreateTeamRequest(editingTeam);
        await teamService.create(createData);
        toast.success('战队创建成功');
      }
      
      setEditingTeam(null);
      await loadTeams();
    } catch (error) {
      console.error('Failed to save team:', error);
      toast.error(error instanceof Error ? error.message : '保存战队失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTeamToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    
    setLoading(true);
    try {
      await teamService.remove(teamToDelete);
      toast.success('战队已删除');
      await loadTeams();
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error(error instanceof Error ? error.message : '删除战队失败');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
    if (!editingTeam) return;
    const newPlayers = [...editingTeam.players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setEditingTeam({ ...editingTeam, players: newPlayers });
  };

  const handleCreateNew = () => {
    const newTeamId = `team-${Date.now()}`;
    setEditingTeam({
      id: newTeamId,
      name: '',
      logo: '',
      description: '',
      players: createDefaultPlayers(newTeamId)
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">战队管理</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadTeams}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={handleCreateNew} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" /> 添加战队
          </Button>
        </div>
      </div>

      {editingTeam && (
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              {teams.find(t => t.id === editingTeam.id) ? '编辑战队' : '新建战队'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditingTeam(null)}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  战队名称 <span className="text-red-500">*</span>
                </label>
                <input
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  placeholder="请输入战队名称"
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">队标链接</label>
                <input
                  value={editingTeam.logo}
                  onChange={(e) => setEditingTeam({ ...editingTeam, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">战队简介</label>
                <textarea
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                  placeholder="请输入战队简介"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                队员列表
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {editingTeam.players.map((player, idx) => (
                  <div key={player.id} className="p-3 bg-gray-900/50 rounded border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-600/30 text-blue-400 text-xs rounded font-medium">
                        {player.position}
                      </span>
                    </div>
                    <input
                      value={player.name}
                      onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                      placeholder="队员姓名"
                      className="w-full px-2 py-1.5 bg-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 border border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="ghost" 
                onClick={() => setEditingTeam(null)}
                disabled={loading}
              >
                取消
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-secondary text-secondary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? '保存中...' : '保存战队'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && teams.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mr-2" />
          加载中...
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无战队数据</p>
          <p className="text-sm mt-2">点击"添加战队"按钮创建第一个战队</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Card key={team.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-3">
                  {team.logo ? (
                    <img 
                      src={team.logo} 
                      alt={team.name} 
                      className="w-10 h-10 rounded object-contain bg-black/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="14">?</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-gray-500">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                  <CardTitle className="text-white text-lg">{team.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(team)}
                    disabled={loading}
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteClick(team.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {team.description || '暂无简介'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {team.players.filter(p => p.name).length} / {LOL_POSITIONS.length} 名队员
                  </span>
                  <span className="text-gray-600 text-xs">
                    ID: {team.id.slice(0, 8)}...
                  </span>
                </div>
                {/* 显示队员列表预览 */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {team.players
                      .filter(p => p.name)
                      .slice(0, 5)
                      .map((player, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded"
                        >
                          {player.position}: {player.name}
                        </span>
                      ))}
                    {team.players.filter(p => p.name).length > 5 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">
                        +{team.players.filter(p => p.name).length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="确认删除战队？"
        message="此操作将永久删除该战队，无法恢复。是否继续？"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setTeamToDelete(null);
        }}
      />
    </AdminLayout>
  );
};

export default AdminTeams;
