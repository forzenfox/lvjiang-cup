import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Upload, Edit2, Trash2, RefreshCw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import MatchDataImportDialog from '../../components/admin/MatchDataImportDialog';
import MatchDataEditDialog from '../../components/admin/MatchDataEditDialog';
import {
  getMatchSeries,
  getMatchGameData,
} from '@/api/matchData';
import type { MatchSeriesInfo, GameSummary, MatchGameData } from '@/types/matchData';

interface GameStatus {
  enabled: boolean;
}

const MatchDataManagement: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [seriesInfo, setSeriesInfo] = useState<MatchSeriesInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Dialog states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentGameData, setCurrentGameData] = useState<MatchGameData | null>(null);
  const [gameToEdit, setGameToEdit] = useState<number | null>(null);
  const [gameToDelete, setGameToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Game enabled status map (gameNumber -> enabled)
  const [gameStatuses, setGameStatuses] = useState<Record<number, GameStatus>>({});

  useEffect(() => {
    if (matchId && !hasLoaded) {
      loadSeriesData();
      setHasLoaded(true);
    }
  }, [matchId, hasLoaded]);

  const loadSeriesData = async () => {
    if (!matchId) return;

    setLoading(true);
    try {
      const series = await getMatchSeries(matchId);
      setSeriesInfo(series);

      // Initialize game statuses
      const statuses: Record<number, GameStatus> = {};
      for (const game of series.games) {
        statuses[game.gameNumber] = { enabled: game.hasData };
      }
      setGameStatuses(statuses);
    } catch (error) {
      console.error('Failed to load series data:', error);
      toast.error('加载比赛数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleImportSuccess = async () => {
    toast.success('数据导入成功');
    await loadSeriesData();
  };

  const handleEditClick = async (gameNumber: number) => {
    if (!matchId) return;

    setLoading(true);
    try {
      const gameData = await getMatchGameData(matchId, gameNumber);
      setCurrentGameData(gameData);
      setGameToEdit(gameNumber);
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Failed to load game data:', error);
      toast.error('加载游戏数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = async () => {
    toast.success('游戏数据已更新');
    setEditDialogOpen(false);
    setCurrentGameData(null);
    setGameToEdit(null);
    await loadSeriesData();
  };

  const handleDeleteClick = (gameNumber: number) => {
    setGameToDelete(gameNumber);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!gameToDelete || !matchId) return;

    setLoading(true);
    try {
      // TODO: Implement delete API when available
      toast.warning('删除功能暂未实现');
      setGameStatuses(prev => ({
        ...prev,
        [gameToDelete]: { enabled: false },
      }));
    } catch (error) {
      console.error('Failed to delete game data:', error);
      toast.error('删除游戏数据失败');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    }
  };

  const toggleGameEnabled = (gameNumber: number) => {
    setGameStatuses(prev => ({
      ...prev,
      [gameNumber]: { enabled: !prev[gameNumber]?.enabled },
    }));
  };

  const getWinnerName = (game: GameSummary): string => {
    if (!game.winnerTeamId || !seriesInfo) return '未确定';
    if (game.winnerTeamId === seriesInfo.teamA.id) return seriesInfo.teamA.name;
    if (game.winnerTeamId === seriesInfo.teamB.id) return seriesInfo.teamB.name;
    return '未知战队';
  };

  const getMaxGames = (): number => {
    if (!seriesInfo) return 1;
    switch (seriesInfo.format) {
      case 'BO3':
        return 3;
      case 'BO5':
        return 5;
      default:
        return 1;
    }
  };

  const getGameStatusBadge = (game: GameSummary): React.ReactNode => {
    if (game.hasData) {
      return (
        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
          已有数据
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">
        无数据
      </span>
    );
  };

  if (!matchId) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">未指定比赛 ID</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">比赛数据管理</h1>
          {seriesInfo && (
            <p className="text-gray-400 mt-1">
              {seriesInfo.teamA.name} vs {seriesInfo.teamB.name} - {seriesInfo.format}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadSeriesData}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]"
          >
            <Upload className="w-4 h-4 mr-2" />
            导入数据
          </Button>
        </div>
      </div>

      {loading && !seriesInfo ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          加载中...
        </div>
      ) : !seriesInfo ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无比赛数据</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: getMaxGames() }, (_, i) => i + 1).map(gameNumber => {
            const game = seriesInfo.games.find(g => g.gameNumber === gameNumber);
            const isEnabled = gameStatuses[gameNumber]?.enabled ?? false;
            const hasData = game?.hasData ?? false;

            return (
              <Card
                key={gameNumber}
                className="bg-[#0F172A] border-white/10"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                        hasData
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      G{gameNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">第 {gameNumber} 局</h3>
                        {getGameStatusBadge(game ?? { gameNumber, winnerTeamId: null, gameDuration: null, hasData: false })}
                      </div>
                      {hasData && game && (
                        <div className="text-sm text-gray-400 mt-1">
                          <span>获胜方: {getWinnerName(game)}</span>
                          {game.gameDuration && (
                            <span className="ml-3">时长: {game.gameDuration}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => toggleGameEnabled(gameNumber)}
                      className={`p-2 rounded-lg transition-colors ${
                        isEnabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                      title={isEnabled ? '禁用此局' : '启用此局'}
                    >
                      {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(gameNumber)}
                      disabled={!hasData || loading}
                      title="编辑数据"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(gameNumber)}
                      disabled={!hasData || loading}
                      title="删除数据"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Import Dialog */}
      <MatchDataImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
        matchId={matchId}
      />

      {/* Edit Dialog */}
      {currentGameData && (
        <MatchDataEditDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setCurrentGameData(null);
            setGameToEdit(null);
          }}
          onSuccess={handleEditSuccess}
          matchId={matchId}
          gameId={gameToEdit ?? 0}
          gameData={currentGameData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="确认删除游戏数据？"
        message={`此操作将永久删除第 ${gameToDelete} 局的比赛数据，无法恢复。是否继续？`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setGameToDelete(null);
        }}
      />
    </AdminLayout>
  );
};

export default MatchDataManagement;
