import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { teamService } from '@/services/teamService';
import type { Team, Player } from '@/types';
import type { CreateTeamRequest, UpdateTeamRequest, CreatePlayerRequest } from '@/api/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Plus, Trash2, Edit2, Save, X, RefreshCw, Users, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getPositionLabel } from '@/utils/position';
import { MemberForm, type MemberFormData } from '@/components/admin/MemberForm';

// LOL固定位置
const LOL_POSITIONS = ['top', 'jungle', 'mid', 'bot', 'support'];

// 创建默认队员列表
const createDefaultPlayers = (teamId: string): Player[] => {
  return LOL_POSITIONS.map((position, index) => ({
    id: `p-${teamId}-${index}`,
    name: '',
    position,
    avatar: '',
    description: '',
    teamId,
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
        teamId,
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
  players:
    team.players
      ?.filter(p => p.name.trim())
      .map(
        p =>
          ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            position: p.position as 'top' | 'jungle' | 'mid' | 'bot' | 'support',
          }) as CreatePlayerRequest
      ) || [],
});

// 将前端 Team 转换为 API UpdateTeamRequest
const toUpdateTeamRequest = (team: Team): UpdateTeamRequest => ({
  id: team.id,
  name: team.name,
  logo: team.logo,
  description: team.description,
  players:
    team.players
      ?.filter(p => p.name.trim())
      .map(
        p =>
          ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            position: p.position as 'top' | 'jungle' | 'mid' | 'bot' | 'support',
          }) as CreatePlayerRequest
      ) || [],
});

// 将 API Team 转换为前端 Team
interface ApiTeam {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  players?: Array<{
    id: string;
    name: string;
    position: string;
    avatar?: string;
  }>;
}

const toFrontendTeam = (apiTeam: ApiTeam): Team => ({
  id: apiTeam.id,
  name: apiTeam.name,
  logo: apiTeam.logo || '',
  description: apiTeam.description || '',
  players: ensureAllPositions(
    (apiTeam.players || []).map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      avatar: p.avatar || '',
      description: '',
      teamId: apiTeam.id,
    })),
    apiTeam.id
  ),
});

// 扩展 Player 类型以包含额外字段
interface ExtendedPlayer extends Player {
  rating?: number;
  bio?: string;
  championPool?: string[];
  liveUrl?: string;
  isCaptain?: boolean;
}

const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  // 筛选和排序状态
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [ratingSort, setRatingSort] = useState<'asc' | 'desc' | null>(null);

  // 队员编辑弹框状态
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{ player: ExtendedPlayer; index: number } | null>(null);

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
      players: ensureAllPositions(team.players, team.id),
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

  const handleCreateNew = () => {
    const newTeamId = `team-${Date.now()}`;
    setEditingTeam({
      id: newTeamId,
      name: '',
      logo: '',
      description: '',
      players: createDefaultPlayers(newTeamId),
    });
  };

  // 打开队员编辑弹框
  const handleEditMember = (player: ExtendedPlayer, index: number) => {
    setEditingMember({ player, index });
    setIsMemberFormOpen(true);
  };

  // 保存队员编辑
  const handleSaveMember = (data: MemberFormData) => {
    if (!editingTeam || !editingMember) return;

    const { index } = editingMember;
    const newPlayers = [...editingTeam.players];

    // 将 MemberFormData 转换为 Player
    const positionMap: Record<MemberFormData['position'], string> = {
      'TOP': 'top',
      'JUNGLE': 'jungle',
      'MID': 'mid',
      'ADC': 'bot',
      'SUPPORT': 'support',
    };

    newPlayers[index] = {
      ...newPlayers[index],
      name: data.nickname,
      avatar: data.avatarUrl || '',
      position: positionMap[data.position],
      description: data.bio || '',
    };

    setEditingTeam({ ...editingTeam, players: newPlayers });
    setIsMemberFormOpen(false);
    setEditingMember(null);
    toast.success('队员信息已更新');
  };

  // 筛选和排序后的战队列表
  const filteredAndSortedTeams = useMemo(() => {
    let result = [...teams];

    // 位置筛选
    if (positionFilter !== 'all') {
      result = result.filter(team =>
        team.players.some(p => p.position === positionFilter && p.name.trim())
      );
    }

    // 评分排序（根据队员平均评分）
    if (ratingSort) {
      result.sort((a, b) => {
        const avgRatingA = a.players.reduce((sum, p) => sum + ((p as ExtendedPlayer).rating || 0), 0) / (a.players.filter(p => p.name).length || 1);
        const avgRatingB = b.players.reduce((sum, p) => sum + ((p as ExtendedPlayer).rating || 0), 0) / (b.players.filter(p => p.name).length || 1);
        return ratingSort === 'asc' ? avgRatingA - avgRatingB : avgRatingB - avgRatingA;
      });
    }

    return result;
  }, [teams, positionFilter, ratingSort]);

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

      {/* 筛选和排序工具栏 */}
      {teams.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">位置筛选:</span>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部</option>
              <option value="top">上单</option>
              <option value="jungle">打野</option>
              <option value="mid">中单</option>
              <option value="bot">ADC</option>
              <option value="support">辅助</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">评分排序:</span>
            <Button
              variant={ratingSort === 'desc' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setRatingSort(ratingSort === 'desc' ? null : 'desc')}
              className={ratingSort === 'desc' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
            >
              从高到低
            </Button>
            <Button
              variant={ratingSort === 'asc' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setRatingSort(ratingSort === 'asc' ? null : 'asc')}
              className={ratingSort === 'asc' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
            >
              从低到高
            </Button>
          </div>
        </div>
      )}

      {editingTeam && (
        <Card className="mb-8 bg-[#0F172A] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
            <CardTitle className="text-white">
              {teams.find(t => t.id === editingTeam.id) ? '编辑战队' : '新建战队'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditingTeam(null)}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                  战队名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingTeam.name}
                  onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  placeholder="请输入战队名称"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#475569] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                  队标链接
                </label>
                <input
                  type="text"
                  value={editingTeam.logo}
                  onChange={e => setEditingTeam({ ...editingTeam, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#475569] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                  参赛宣言
                </label>
                <div className="relative">
                  <textarea
                    value={editingTeam.description}
                    onChange={e => setEditingTeam({ ...editingTeam, description: e.target.value })}
                    placeholder="请输入参赛宣言"
                    rows={3}
                    maxLength={100}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#475569] focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <span className="absolute bottom-2 right-2 text-xs text-[#64748B]">
                    {editingTeam.description.length}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                队员列表
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {editingTeam.players.map((player, idx) => (
                  <div
                    key={player.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-blue-600/30 text-blue-400 text-xs rounded font-medium">
                        {getPositionLabel(player.position)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditMember(player as ExtendedPlayer, idx)}
                        className="h-6 w-6"
                      >
                        <Edit2 className="w-3 h-3 text-blue-400" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {player.avatar ? (
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="12">?</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                          ?
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">
                          {player.name || '未填写'}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {player.position}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setEditingTeam(null)} disabled={loading}>
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]"
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
      ) : filteredAndSortedTeams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无战队数据</p>
          <p className="text-sm mt-2">点击"添加战队"按钮创建第一个战队</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTeams.map(team => (
            <Card
              key={team.id}
              data-testid="admin-team-card"
              className="bg-[#0F172A] border-white/10 hover:border-yellow-500/50 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  {team.logo ? (
                    <img
                      data-testid="team-logo"
                      src={team.logo}
                      alt={team.name}
                      className="w-10 h-10 rounded object-contain bg-black/20"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="14">?</text></svg>';
                      }}
                    />
                  ) : (
                    <div
                      data-testid="team-logo-placeholder"
                      className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-gray-500"
                    >
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                  <CardTitle data-testid="team-name" className="text-white text-lg">
                    {team.name}
                  </CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(team)}
                    disabled={loading}
                    aria-label="编辑"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(team.id)}
                    disabled={loading}
                    aria-label="删除"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-[#94A3B8] mb-4 italic">
                  {team.description ? `"${team.description}"` : '暂无参赛宣言'}
                </p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-[#64748B]">
                    {team.players.filter(p => p.name).length} / {LOL_POSITIONS.length} 名队员
                  </span>
                  <span className="text-[#475569] text-xs">ID: {team.id.slice(0, 8)}...</span>
                </div>
                {/* 显示队员列表预览 */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-1">
                    {team.players
                      .filter(p => p.name)
                      .slice(0, 5)
                      .map((player, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white/5 text-[#94A3B8] text-xs rounded"
                        >
                          {getPositionLabel(player.position)}: {player.name}
                        </span>
                      ))}
                    {team.players.filter(p => p.name).length > 5 && (
                      <span className="px-2 py-0.5 text-[#64748B] text-xs">
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

      {/* 队员编辑弹框 */}
      <MemberForm
        visible={isMemberFormOpen}
        onClose={() => {
          setIsMemberFormOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        initialData={editingMember?.player ? {
          nickname: editingMember.player.name,
          gameId: editingMember.player.id,
          position: editingMember.player.position.toUpperCase() as MemberFormData['position'],
          avatarUrl: editingMember.player.avatar,
          bio: editingMember.player.description,
          championPool: (editingMember.player as ExtendedPlayer).championPool || [],
          rating: (editingMember.player as ExtendedPlayer).rating || 60,
          isCaptain: (editingMember.player as ExtendedPlayer).isCaptain || false,
          liveUrl: (editingMember.player as ExtendedPlayer).liveUrl,
        } : null}
      />
    </AdminLayout>
  );
};

export default AdminTeams;