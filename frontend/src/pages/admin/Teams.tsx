import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { teamService } from '@/services/teamService';
import * as membersApi from '@/api/members';
import type { Team, Player } from '@/types';
import type { CreateTeamRequest, UpdateTeamRequest, CreatePlayerRequest } from '@/api/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Plus, Trash2, Edit2, Save, X, RefreshCw, Users, Upload as UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getPositionLabel } from '@/utils/position';
import type { MemberFormData } from '@/components/admin/MemberForm';

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
  // 不再发送 members 数组，后端会自动创建 5 个默认队员
});

// 将前端 Team 转换为 API UpdateTeamRequest
const toUpdateTeamRequest = (team: Team): UpdateTeamRequest => ({
  id: team.id,
  name: team.name,
  logo: team.logo,
  description: team.description,
  // 注意：后端 DTO 使用 members 数组，字段名为 nickname/avatarUrl/position(大写)
  members:
    team.players?.map(p => {
      const positionMap: Record<string, 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT'> = {
        'top': 'TOP',
        'jungle': 'JUNGLE',
        'mid': 'MID',
        'bot': 'ADC',
        'support': 'SUPPORT',
      };
      return {
        id: p.id,
        nickname: p.name || '',
        avatarUrl: p.avatar || '',
        position: positionMap[p.position] || 'TOP',
      };
    }) || [],
});

// 将 API Team 转换为前端 Team
interface ApiTeam {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  // 后端返回的是 members 数组，字段名为 nickname/avatarUrl
  members?: Array<{
    id: string;
    nickname: string;
    position: string;
    avatarUrl?: string;
  }>;
}

const toFrontendTeam = (apiTeam: ApiTeam): Team => ({
  id: apiTeam.id,
  name: apiTeam.name,
  logo: apiTeam.logo || '',
  description: apiTeam.description || '',
  // 将后端的 members 转换为前端的 players，字段名映射
  players: ensureAllPositions(
    (apiTeam.members || []).map(m => ({
      id: m.id,
      name: m.nickname,
      position: m.position.toLowerCase(),
      avatar: m.avatarUrl || '',
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
  gameId?: string;
}

const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  // 队员卡片折叠状态
  const [expandedPlayerIndex, setExpandedPlayerIndex] = useState<number | null>(null);

  // 队员内联编辑状态
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [editingPlayerData, setEditingPlayerData] = useState<MemberFormData | null>(null);

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

  // 判断是否为新建战队
  const isNewTeam = !teams.find(t => t.id === editingTeam?.id);

  // 处理队标上传点击
  const handleLogoUploadClick = () => {
    if (!editingTeam) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 客户端校验
      if (file.size > 2 * 1024 * 1024) {
        toast.error('图片大小不能超过 2MB');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        toast.error('仅支持 JPG/PNG 格式图片');
        return;
      }

      // 已有战队 ID（已保存到服务器）→ 调用上传 API
      if (!isNewTeam && editingTeam) {
        try {
          setLoading(true);
          const result = await teamsApi.uploadTeamLogo(editingTeam.id, file);
          setEditingTeam({ ...editingTeam, logo: result.url });
          toast.success('图标上传成功');
        } catch (error) {
          toast.error('上传失败，请重试');
        } finally {
          setLoading(false);
        }
      } else {
        // 新建战队（还未保存到服务器）→ 使用 Base64 预览
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          setEditingTeam({ ...editingTeam, logo: url });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // 打开队员内联编辑
  const handleEditMember = (player: ExtendedPlayer, index: number) => {
    // 检查战队是否已保存（是否有真实 ID）
    const isExistingTeam = teams.find(t => t.id === editingTeam?.id);
    if (!isExistingTeam) {
      toast.error('请先保存战队基本信息，然后再编辑队员信息');
      return;
    }

    setExpandedPlayerIndex(index);
    setEditingPlayerIndex(index);
    setEditingPlayerData({
      nickname: player.name,
      gameId: player.gameId || '',
      position: player.position.toUpperCase() as MemberFormData['position'],
      avatarUrl: player.avatar || '',
      bio: player.description || '',
      championPool: player.championPool || [],
      rating: player.rating || 60,
      isCaptain: player.isCaptain || false,
      liveUrl: player.liveUrl || '',
    });
  };

  // 取消队员编辑
  const handleCancelEditMember = () => {
    setEditingPlayerIndex(null);
    setEditingPlayerData(null);
  };

  // 保存队员编辑
  const handleSaveMember = async () => {
    if (!editingTeam || editingPlayerIndex === null || !editingPlayerData) return;

    // 评分校验
    const rating = editingPlayerData.rating;
    if (!Number.isInteger(rating) || rating < 0 || rating > 100) {
      toast.error('评分必须是0-100之间的整数');
      return;
    }

    const player = editingTeam.players[editingPlayerIndex];
    const newPlayers = [...editingTeam.players];

    // 准备更新到后端的数据（使用后端期望的字段名）
    const updateData = {
      nickname: editingPlayerData.nickname,
      avatarUrl: editingPlayerData.avatarUrl || '',
      position: editingPlayerData.position,
      bio: editingPlayerData.bio || '',
      gameId: editingPlayerData.gameId,
      championPool: editingPlayerData.championPool,
      rating: editingPlayerData.rating,
      isCaptain: editingPlayerData.isCaptain,
      liveUrl: editingPlayerData.liveUrl,
    };

    try {
      // 调用后端 API 更新队员信息
      await membersApi.updateMember(player.id, updateData);

      // 更新本地状态（转换为前端格式）
      const positionMap: Record<MemberFormData['position'], string> = {
        'TOP': 'top',
        'JUNGLE': 'jungle',
        'MID': 'mid',
        'ADC': 'bot',
        'SUPPORT': 'support',
      };

      newPlayers[editingPlayerIndex] = {
        ...newPlayers[editingPlayerIndex],
        name: editingPlayerData.nickname,
        avatar: editingPlayerData.avatarUrl || '',
        position: positionMap[editingPlayerData.position],
        description: editingPlayerData.bio || '',
        gameId: editingPlayerData.gameId,
        rating: editingPlayerData.rating,
        isCaptain: editingPlayerData.isCaptain,
        liveUrl: editingPlayerData.liveUrl,
        championPool: editingPlayerData.championPool,
      };

      setEditingTeam({ ...editingTeam, players: newPlayers });
      setEditingPlayerIndex(null);
      setEditingPlayerData(null);
      toast.success('队员信息已保存');
    } catch (error) {
      console.error('Failed to update member:', error);
      toast.error(error instanceof Error ? error.message : '保存队员信息失败');
    }
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
                  队标
                </label>
                <div className="flex items-start gap-3">
                  {/* 上传预览区域 - 80x80 方形区域 */}
                  <div
                    className="relative flex-shrink-0 w-20 h-20 border-2 border-dashed border-white/20 rounded-lg
                               flex items-center justify-center cursor-pointer
                               hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
                    onClick={handleLogoUploadClick}
                  >
                    {editingTeam.logo ? (
                      <>
                        <img
                          src={editingTeam.logo}
                          alt="队标预览"
                          className="w-full h-full object-contain rounded"
                        />
                        {/* 悬停时显示覆盖层 */}
                        <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100
                                        flex items-center justify-center transition-opacity">
                          <UploadIcon className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <UploadIcon className="w-6 h-6 mb-1" />
                        <span className="text-xs">上传</span>
                      </div>
                    )}
                  </div>

                  {/* URL 输入框 */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editingTeam.logo}
                      onChange={e => setEditingTeam({ ...editingTeam, logo: e.target.value })}
                      placeholder="或输入图标 URL"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white
                                 placeholder-[#475569] focus:outline-none focus:border-blue-500 mb-1.5"
                    />
                    <p className="text-xs text-gray-500">支持 JPG/PNG 格式，不超过 2MB</p>
                  </div>
                </div>
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

            <div className="flex justify-end gap-2 mt-6">
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

            {!isNewTeam && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  队员列表
                </h3>
                <div className="space-y-2">
                  {editingTeam.players.map((player, idx) => {
                    const isExpanded = expandedPlayerIndex === idx;
                    const isEditing = editingPlayerIndex === idx;
                    return (
                      <div
                        key={player.id}
                        className={`bg-white/5 rounded-lg border transition-all duration-300 cursor-pointer ${
                          isExpanded || isEditing ? 'border-blue-500/50' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div
                          className="flex items-center justify-between p-3"
                          onClick={() => !isEditing && setExpandedPlayerIndex(isExpanded ? null : idx)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-blue-600/30 text-blue-400 text-xs rounded font-medium min-w-[60px] text-center">
                              {getPositionLabel(player.position)}
                            </span>
                            {player.avatar ? (
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="12">?</text></svg>';
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                                ?
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-white text-sm">
                                {player.name || '未填写'}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {player.description || '暂无简介'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditMember(player as ExtendedPlayer, idx);
                                }}
                                className="h-8 w-8 hover:bg-white/10"
                              >
                                <Edit2 className="w-4 h-4 text-blue-400" />
                              </Button>
                            )}
                            <div className={`transition-transform duration-300 ${isExpanded || isEditing ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {(isExpanded || isEditing) && (
                          <div className="px-3 pb-3 border-t border-white/10 pt-3">
                            {isEditing && editingPlayerData ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">昵称</label>
                                    <input
                                      type="text"
                                      value={editingPlayerData.nickname}
                                      onChange={(e) => setEditingPlayerData({ ...editingPlayerData, nickname: e.target.value })}
                                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                      placeholder="请输入昵称"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">位置</label>
                                    <select
                                      value={editingPlayerData.position}
                                      onChange={(e) => setEditingPlayerData({ ...editingPlayerData, position: e.target.value as MemberFormData['position'] })}
                                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                    >
                                      <option value="TOP">上单</option>
                                      <option value="JUNGLE">打野</option>
                                      <option value="MID">中单</option>
                                      <option value="ADC">ADC</option>
                                      <option value="SUPPORT">辅助</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">头像URL</label>
                                  <input
                                    type="text"
                                    value={editingPlayerData.avatarUrl}
                                    onChange={(e) => setEditingPlayerData({ ...editingPlayerData, avatarUrl: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="https://example.com/avatar.png"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">游戏ID</label>
                                    <input
                                      type="text"
                                      value={editingPlayerData.gameId}
                                      onChange={(e) => setEditingPlayerData({ ...editingPlayerData, gameId: e.target.value })}
                                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                      placeholder="请输入游戏ID"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">评分 (0-100)</label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={editingPlayerData.rating}
                                      onChange={(e) => {
                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                        if (value === '' || (Number.isInteger(value) && value >= 0 && value <= 100)) {
                                          setEditingPlayerData({ ...editingPlayerData, rating: value === '' ? 0 : value });
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const value = Number(e.target.value);
                                        if (!Number.isInteger(value) || value < 0 || value > 100) {
                                          toast.error('评分必须是0-100之间的整数');
                                        }
                                      }}
                                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="flex items-center pt-5">
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editingPlayerData.isCaptain}
                                        onChange={(e) => setEditingPlayerData({ ...editingPlayerData, isCaptain: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-blue-500"
                                      />
                                      队长
                                    </label>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">直播间链接</label>
                                  <input
                                    type="text"
                                    value={editingPlayerData.liveUrl}
                                    onChange={(e) => setEditingPlayerData({ ...editingPlayerData, liveUrl: e.target.value })}
                                    onFocus={(e) => {
                                      if (!e.target.value) {
                                        setEditingPlayerData({ ...editingPlayerData, liveUrl: 'https://www.douyu.com/' });
                                      }
                                    }}
                                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="https://www.douyu.com/..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">个人简介</label>
                                  <textarea
                                    value={editingPlayerData.bio}
                                    onChange={(e) => setEditingPlayerData({ ...editingPlayerData, bio: e.target.value })}
                                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                                    rows={2}
                                    placeholder="请输入个人简介"
                                  />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEditMember}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    取消
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleSaveMember}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    保存
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500">位置：</span>
                                    <span className="text-white">{getPositionLabel(player.position)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">游戏ID：</span>
                                    <span className="text-white">{(player as ExtendedPlayer).gameId || '未设置'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">评分：</span>
                                    <span className="text-white">{(player as ExtendedPlayer).rating || '未设置'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">队长：</span>
                                    <span className="text-white">{(player as ExtendedPlayer).isCaptain ? '是' : '否'}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-gray-500">简介：</span>
                                    <span className="text-white">{player.description || '暂无'}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-gray-500">直播间：</span>
                                    <span className="text-white">{(player as ExtendedPlayer).liveUrl || '暂无'}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

    </AdminLayout>
  );
};

export default AdminTeams;