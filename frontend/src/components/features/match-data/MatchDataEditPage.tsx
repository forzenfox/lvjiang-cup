import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import MatchDataHeader from './MatchDataHeader';
import MatchSeriesHeader from './MatchSeriesHeader';
import GameSwitcher from './GameSwitcher';
import TeamStatsBarEdit from './TeamStatsBarEdit';
import PlayerStatsRowEdit from './PlayerStatsRowEdit';
import PlayerStatsHeader from './PlayerStatsHeader';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { matchDataService } from '@/services/matchDataService';
import type { MatchSeriesInfo, MatchGameData, PlayerStat, PositionType } from '@/types/matchData';
import { ADMIN_PREFIX, adminPath } from '@/constants/routes';
import { useMatchDataStore } from '@/store/matchDataStore';
import { trackAdminEditSave } from '@/utils/tracking';
import MatchDataSkeleton from './MatchDataSkeleton';

const POSITION_ORDER: PositionType[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const isEditDisabled = true;

const DisabledEditPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
      <div className="sticky top-0 z-50 h-16 border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              返回
            </button>
            <div className="h-5 w-px bg-slate-700" />
            <div>
              <h1 className="text-lg font-bold text-white md:text-xl neon-text">
                对战数据详情编辑
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c49f58]/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#c49f58]"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                fill="none"
                height="24"
                stroke="currentColor"
                strokeWidth="2"
                width="24"
                x="3"
                y="11"
              />
              <circle cx="12" cy="16" r="1" />
              <circle cx="8" cy="16" r="1" />
              <circle cx="16" cy="16" r="1" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">功能暂时禁用</h2>
          <p className="text-gray-400 mb-6">
            对战数据编辑功能暂时禁用
            <br />
            如有需要请联系管理员
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#c49f58] hover:bg-[#b08d4a] text-[#1a1a2e] font-bold rounded-lg transition-colors"
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchDataEditPage: React.FC = () => {
  const { matchId, gameNumber: routeGameNumber } = useParams<{
    matchId: string;
    gameNumber: string;
  }>();
  const navigate = useNavigate();

  const [seriesInfo, setSeriesInfo] = useState<MatchSeriesInfo | null>(null);
  const [gameData, setGameData] = useState<MatchGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const preloadAdjacentGame = useMatchDataStore(state => state.preloadAdjacentGame);
  const currentGameRef = useRef(1);

  const [modifiedTeamFields, setModifiedTeamFields] = useState<Set<string>>(new Set());
  const [modifiedPlayerFields, setModifiedPlayerFields] = useState<Set<string>>(new Set());
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  useEffect(() => {
    if (routeGameNumber) {
      const gameNum = parseInt(routeGameNumber, 10);
      if (!isNaN(gameNum)) {
        currentGameRef.current = gameNum;
      }
    }
  }, [routeGameNumber]);

  const loadSeriesInfo = useCallback(
    async (mId: string) => {
      try {
        const series = await matchDataService.getSeries(mId);
        setSeriesInfo(series);

        const validGameNumbers = series.games.map(g => g.gameNumber);
        const firstValidGame = validGameNumbers[0];
        if (firstValidGame) {
          currentGameRef.current = firstValidGame;
        }

        const maxGames = Math.max(...validGameNumbers);
        preloadAdjacentGame(mId, currentGameRef.current, maxGames);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取系列赛信息失败');
      }
    },
    [preloadAdjacentGame]
  );

  const loadGameData = useCallback(async (mId: string, gameNum: number) => {
    try {
      const data = await matchDataService.getGameData(mId, gameNum);
      if (!data) {
        setError('该局对战数据尚未导入');
        setGameData(null);
        return;
      }
      setGameData(data);
      currentGameRef.current = gameNum;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取游戏数据失败');
    }
  }, []);

  useEffect(() => {
    if (!matchId) {
      setError('缺少比赛ID');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await loadSeriesInfo(matchId);
        await loadGameData(matchId, currentGameRef.current);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [matchId, loadSeriesInfo, loadGameData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modifiedTeamFields.size > 0 || modifiedPlayerFields.size > 0) {
        e.preventDefault();
        e.returnValue = '有未保存的修改，是否放弃？';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [modifiedTeamFields, modifiedPlayerFields]);

  const handleGameChange = useCallback(
    async (gameNumber: number) => {
      if (modifiedTeamFields.size > 0 || modifiedPlayerFields.size > 0) {
        setShowUnsavedConfirm(true);
        setPendingNavigation(() => async () => {
          await loadGameData(matchId!, gameNumber);
        });
        return;
      }
      await loadGameData(matchId!, gameNumber);
    },
    [modifiedTeamFields, modifiedPlayerFields, loadGameData, matchId]
  );

  const handleBack = useCallback(() => {
    const navigateBack = () => {
      if (window.location.pathname.includes(`/${ADMIN_PREFIX}/`)) {
        navigate(adminPath('matches'));
      } else {
        navigate(-1);
      }
    };

    if (modifiedTeamFields.size > 0 || modifiedPlayerFields.size > 0) {
      setShowUnsavedConfirm(true);
      setPendingNavigation(() => navigateBack);
      return;
    }
    navigateBack();
  }, [modifiedTeamFields, modifiedPlayerFields, navigate]);

  const handleCancelEdit = () => {
    if (modifiedTeamFields.size > 0 || modifiedPlayerFields.size > 0) {
      setShowUnsavedConfirm(true);
      setPendingNavigation(() => () => {
        setModifiedTeamFields(new Set());
        setModifiedPlayerFields(new Set());
        handleBack();
      });
    } else {
      handleBack();
    }
  };

  const handleSaveEdit = async () => {
    if (!gameData || !matchId) return;

    try {
      const updatedData = {
        winnerTeamId: gameData.winnerTeamId,
        gameDuration: gameData.gameDuration,
        gameStartTime: gameData.gameStartTime,
        videoBvid: gameData.videoBvid,
        blueTeam: {
          teamId: gameData.blueTeam.teamId,
          side: gameData.blueTeam.side,
          kills: gameData.blueTeam.kills,
          gold: gameData.blueTeam.gold,
          towers: gameData.blueTeam.towers,
          dragons: gameData.blueTeam.dragons,
          barons: gameData.blueTeam.barons,
        },
        redTeam: {
          teamId: gameData.redTeam.teamId,
          side: gameData.redTeam.side,
          kills: gameData.redTeam.kills,
          gold: gameData.redTeam.gold,
          towers: gameData.redTeam.towers,
          dragons: gameData.redTeam.dragons,
          barons: gameData.redTeam.barons,
        },
        playerStats: gameData.playerStats.map(p => ({
          playerId: p.playerId,
          teamId: p.teamId,
          position: p.position,
          championName: p.championName,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          cs: p.cs,
          gold: p.gold,
          damageDealt: p.damageDealt,
          damageTaken: p.damageTaken,
          level: p.level,
          visionScore: p.visionScore,
          firstBlood: p.firstBlood,
          mvp: p.mvp,
        })),
      };

      await matchDataService.updateGameData(matchId, gameData.gameNumber, updatedData);
      toast.success('保存成功');
      setModifiedTeamFields(new Set());
      setModifiedPlayerFields(new Set());
      trackAdminEditSave(matchId, gameData.gameNumber);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
      setError(err instanceof Error ? err.message : '保存失败');
    }
  };

  const handleConfirmUnsaved = () => {
    setShowUnsavedConfirm(false);
    setModifiedTeamFields(new Set());
    setModifiedPlayerFields(new Set());
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancelUnsaved = () => {
    setShowUnsavedConfirm(false);
    setPendingNavigation(null);
  };

  const getPlayersBySide = useCallback(
    (playerStats: PlayerStat[], side: 'blue' | 'red') => {
      return playerStats.filter(p => {
        if (side === 'blue') {
          return p.teamId === gameData?.blueTeam.teamId;
        } else {
          return p.teamId === gameData?.redTeam.teamId;
        }
      });
    },
    [gameData]
  );

  const handleTogglePosition = useCallback((position: string) => {
    setExpandedPosition(prev => (prev === position ? null : position));
  }, []);

  const handleTeamFieldChange = useCallback(
    (team: 'blue' | 'red', field: string, value: number) => {
      const newFields = new Set(modifiedTeamFields);
      const fieldKey = `${team}.${field}`;
      if (newFields.has(fieldKey)) {
        newFields.delete(fieldKey);
      } else {
        newFields.add(fieldKey);
      }
      setModifiedTeamFields(newFields);

      setGameData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [team === 'blue' ? 'blueTeam' : 'redTeam']: {
            ...prev[team === 'blue' ? 'blueTeam' : 'redTeam'],
            [field]: value,
          },
        };
      });
    },
    [modifiedTeamFields]
  );

  const handlePlayerFieldChange = useCallback(
    (playerId: string, field: string, value: number | string) => {
      const newFields = new Set(modifiedPlayerFields);
      const fieldKey = `${playerId}.${field}`;
      if (newFields.has(fieldKey)) {
        newFields.delete(fieldKey);
      } else {
        newFields.add(fieldKey);
      }
      setModifiedPlayerFields(newFields);

      setGameData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          playerStats: prev.playerStats.map(p =>
            p.playerId === playerId ? { ...p, [field]: value } : p
          ),
        };
      });
    },
    [modifiedPlayerFields]
  );

  const renderContent = () => {
    if (!gameData) return null;

    const bluePlayers = getPlayersBySide(gameData.playerStats, 'blue');
    const redPlayers = getPlayersBySide(gameData.playerStats, 'red');

    const sortedBluePlayers = POSITION_ORDER.map(pos =>
      bluePlayers.find(p => p.position === pos)
    ).filter((p): p is PlayerStat => p !== undefined);

    const sortedRedPlayers = POSITION_ORDER.map(pos =>
      redPlayers.find(p => p.position === pos)
    ).filter((p): p is PlayerStat => p !== undefined);

    return (
      <>
        {/* 系列赛头部：展示总比分和比赛状态 - 与详情页保持一致 */}
        <MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />

        {/* 对局切换器 */}
        <GameSwitcher
          games={seriesInfo?.games || []}
          currentGame={currentGameRef.current}
          onChange={handleGameChange}
          format={seriesInfo?.format}
        />

        {/* 队伍数据统计栏 - 可编辑版本，布局与详情页一致 */}
        <TeamStatsBarEdit
          blueTeam={gameData.blueTeam}
          redTeam={gameData.redTeam}
          bans={gameData.bans}
          gameDuration={gameData.gameDuration}
          modifiedFields={modifiedTeamFields}
          onFieldChange={handleTeamFieldChange}
        />

        {/* 选手数据列表 - 与详情页布局一致，但可编辑 */}
        <div className="max-w-5xl mx-auto mt-4">
          <PlayerStatsHeader />
          <div className="rounded-b-lg overflow-hidden bg-[#2d2d2d]">
            {POSITION_ORDER.map((position, index) => {
              const bluePlayer = sortedBluePlayers[index];
              const redPlayer = sortedRedPlayers[index];

              if (!bluePlayer || !redPlayer) return null;

              return (
                <PlayerStatsRowEdit
                  key={position}
                  bluePlayer={bluePlayer}
                  redPlayer={redPlayer}
                  isExpanded={expandedPosition === position}
                  onToggle={() => handleTogglePosition(position)}
                  modifiedFields={modifiedPlayerFields}
                  onFieldChange={handlePlayerFieldChange}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  };

  if (isEditDisabled) {
    return <DisabledEditPage onBack={handleBack} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader onBack={handleBack} title="对战数据详情编辑" />
        <div className="flex flex-col items-center justify-center mt-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (loading && !seriesInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader onBack={handleBack} title="对战数据详情编辑" />
        <div className="container mx-auto px-4 py-6">
          <MatchDataSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
      <MatchDataHeader
        onBack={handleBack}
        title="对战数据详情编辑"
        subtitle={
          seriesInfo
            ? `${seriesInfo.teamA.name} vs ${seriesInfo.teamB.name} - ${seriesInfo.format}`
            : undefined
        }
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-[#1E3A8A] bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6">
        {renderContent()}

        {loading && (
          <div className="flex justify-center my-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#c49f58]" />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showUnsavedConfirm}
        title="有未保存的修改"
        description="有未保存的修改，是否放弃？"
        onConfirm={handleConfirmUnsaved}
        onCancel={handleCancelUnsaved}
        confirmText="放弃"
        cancelText="继续编辑"
      />
    </div>
  );
};

export default MatchDataEditPage;
