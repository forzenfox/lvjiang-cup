import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { mockService } from '../../mock/service';
import { Team, Player } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

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
const ensureAllPositions = (players: Player[], teamId: string): Player[] => {
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

const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = () => {
    mockService.getTeams().then(setTeams);
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
    setLoading(true);
    try {
      if (teams.find(t => t.id === editingTeam.id)) {
        await mockService.updateTeam(editingTeam);
      } else {
        await mockService.addTeam(editingTeam);
      }
      setEditingTeam(null);
      loadTeams();
    } catch (error) {
      console.error('Failed to save team', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个战队吗？')) {
      await mockService.deleteTeam(id);
      loadTeams();
    }
  };

  const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
    if (!editingTeam) return;
    const newPlayers = [...editingTeam.players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setEditingTeam({ ...editingTeam, players: newPlayers });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">战队管理</h1>
        <Button onClick={() => {
          const newTeamId = `team-${Date.now()}`;
          setEditingTeam({
            id: newTeamId,
            name: '新战队',
            logo: '',
            description: '',
            players: createDefaultPlayers(newTeamId)
          });
        }}>
          <Plus className="w-4 h-4 mr-2" /> 添加战队
        </Button>
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
                <label className="block text-sm text-gray-400 mb-1">战队名称</label>
                <input
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">队标链接</label>
                <input
                  value={editingTeam.logo}
                  onChange={(e) => setEditingTeam({ ...editingTeam, logo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">战队简介</label>
                <textarea
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-2">队员列表</h3>
              {editingTeam.players.map((player, idx) => (
                <div key={player.id} className="grid grid-cols-3 gap-2 mb-2 p-2 bg-gray-900/50 rounded items-center">
                  <input
                    value={player.name}
                    onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                    placeholder="姓名"
                    className="px-2 py-1 bg-gray-700 rounded text-white text-sm"
                  />
                  <span className="px-2 py-1 bg-gray-600 rounded text-white text-sm text-center font-medium">
                    {player.position}
                  </span>
                  <input
                    value={player.avatar}
                    onChange={(e) => handlePlayerChange(idx, 'avatar', e.target.value)}
                    placeholder="头像链接"
                    className="px-2 py-1 bg-gray-700 rounded text-white text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setEditingTeam(null)}>取消</Button>
              <Button onClick={handleSave} disabled={loading} className="bg-secondary text-secondary-foreground">
                <Save className="w-4 h-4 mr-2" /> 保存战队
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <Card key={team.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center space-x-3">
                <img src={team.logo} alt={team.name} className="w-10 h-10 rounded object-contain bg-black/20" />
                <CardTitle className="text-white text-lg">{team.name}</CardTitle>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(team)}>
                  <Edit2 className="w-4 h-4 text-blue-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">{team.description}</p>
              <div className="text-sm text-gray-500">
                {team.players.length} 名队员
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminTeams;
