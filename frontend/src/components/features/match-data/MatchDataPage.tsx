import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import MatchDataHeader from './MatchDataHeader';
import MatchInfoCard from './MatchInfoCard';
import GameSwitcher from './GameSwitcher';
import TeamStatsBar from './TeamStatsBar';
import PlayerStatsList from './PlayerStatsList';
import RadarChart from './RadarChart';
import { getMatchSeries, getMatchGameData } from '@/api/matchData';
import type { MatchSeriesInfo, MatchGameData, PlayerStat, PositionType } from '@/types/matchData';
import { useMatchDataStore } from '@/store/matchDataStore';
import {
  trackMatchDataPageView,
  trackGameSwitch,
  trackRadarChartExpand,
  trackRadarChartCollapse,
} from '@/utils/tracking';
import { matchDataCache } from '@/utils/matchDataCache';
import MatchDataSkeleton from './MatchDataSkeleton';
import MatchDataEmptyState from './MatchDataEmptyState';

const POSITION_ORDER: PositionType[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const MatchDataPage: React.FC = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [seriesInfo, setSeriesInfo] = useState<MatchSeriesInfo | null>(null);
  const [gameData, setGameData] = useState<MatchGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prevGameNumberRef = useRef<number>(0);
  const preloadAdjacentGame = useMatchDataStore(state => state.preloadAdjacentGame);

  const currentGameNumber = parseInt(searchParams.get('game') || '1', 10);

  const loadGameDataWithRetry = useCallback(async (mId: string, gameNum: number, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await getMatchGameData(mId, gameNum);
        return data;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, []);

  const loadSeriesInfo = useCallback(
    async (mId: string) => {
      const cacheKey = matchDataCache.getMatchSeriesKey(mId);
      const cached = matchDataCache.get<MatchSeriesInfo>(cacheKey);

      if (cached) {
        setSeriesInfo(cached);
        const validGameNumbers = cached.games.map(g => g.gameNumber);
        if (!validGameNumbers.includes(currentGameNumber)) {
          const firstValidGame = validGameNumbers[0];
          if (firstValidGame) {
            setSearchParams({ game: firstValidGame.toString() });
          }
        }
        const maxGames = Math.max(...validGameNumbers);
        preloadAdjacentGame(mId, currentGameNumber, maxGames);
        return;
      }

      try {
        const series = await getMatchSeries(mId);
        setSeriesInfo(series);
        matchDataCache.set(cacheKey, series);

        const validGameNumbers = series.games.map(g => g.gameNumber);
        if (!validGameNumbers.includes(currentGameNumber)) {
          const firstValidGame = validGameNumbers[0];
          if (firstValidGame) {
            setSearchParams({ game: firstValidGame.toString() });
          }
        }

        const maxGames = Math.max(...validGameNumbers);
        preloadAdjacentGame(mId, currentGameNumber, maxGames);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取系列赛信息失败');
        console.error('[MatchDataPage] 系列赛信息加载失败:', err);
      }
    },
    [currentGameNumber, setSearchParams, preloadAdjacentGame]
  );

  const loadGameData = useCallback(
    async (mId: string, gameNum: number) => {
      const cacheKey = matchDataCache.getGameDataKey(mId, gameNum);
      const cached = matchDataCache.get<MatchGameData>(cacheKey);

      if (cached) {
        setGameData(cached);
        return;
      }

      try {
        const data = await loadGameDataWithRetry(mId, gameNum);
        setGameData(data);
        matchDataCache.set(cacheKey, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取游戏数据失败');
        console.error('[MatchDataPage] 游戏数据加载失败:', err);
      }
    },
    [loadGameDataWithRetry]
  );

  const handleRetry = useCallback(() => {
    if (matchId) {
      setError(null);
      loadGameData(matchId, currentGameNumber);
    }
  }, [matchId, currentGameNumber, loadGameData]);

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
        await Promise.all([loadSeriesInfo(matchId), loadGameData(matchId, currentGameNumber)]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [matchId, currentGameNumber, loadSeriesInfo, loadGameData]);

  useEffect(() => {
    if (matchId) {
      trackMatchDataPageView(matchId);
    }
  }, [matchId]);

  useEffect(() => {
    const prevGame = prevGameNumberRef.current;

    if (matchId && prevGame !== 0 && prevGame !== currentGameNumber) {
      trackGameSwitch(matchId, prevGame, currentGameNumber);
    }

    prevGameNumberRef.current = currentGameNumber;
  }, [matchId, currentGameNumber]);

  const handleGameChange = useCallback(
    (gameNumber: number) => {
      setSearchParams({ game: gameNumber.toString() });
    },
    [setSearchParams]
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  const handleTogglePosition = useCallback(
    (position: string) => {
      if (gameData && matchId) {
        const newPosition = expandedPosition === position ? null : position;
        setExpandedPosition(newPosition);

        if (newPosition && gameData.playerStats.length >= 2) {
          const positionPlayers = gameData.playerStats.filter(p => p.position === position);
          if (positionPlayers.length === 2) {
            trackRadarChartExpand(
              matchId,
              currentGameNumber,
              positionPlayers[0].playerName,
              positionPlayers[1].playerName
            );
          }
        } else if (!newPosition && gameData.playerStats.length >= 2) {
          trackRadarChartCollapse(
            matchId,
            currentGameNumber,
            gameData.playerStats[0].playerName,
            gameData.playerStats[1].playerName
          );
        }
      }
    },
    [expandedPosition, gameData, matchId, currentGameNumber]
  );

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

  const filteredBluePlayers = useMemo(() => {
    if (!gameData) return [];
    return getPlayersBySide(gameData.playerStats, 'blue');
  }, [gameData, getPlayersBySide]);

  const filteredRedPlayers = useMemo(() => {
    if (!gameData) return [];
    return getPlayersBySide(gameData.playerStats, 'red');
  }, [gameData, getPlayersBySide]);

  const sortedBluePlayers = useMemo(() => {
    return POSITION_ORDER.map(pos => filteredBluePlayers.find(p => p.position === pos)).filter(
      (p): p is PlayerStat => p !== undefined
    );
  }, [filteredBluePlayers]);

  const sortedRedPlayers = useMemo(() => {
    return POSITION_ORDER.map(pos => filteredRedPlayers.find(p => p.position === pos)).filter(
      (p): p is PlayerStat => p !== undefined
    );
  }, [filteredRedPlayers]);

  const renderContent = () => {
    if (!gameData) return null;

    const topPlayers =
      sortedBluePlayers.length >= 1 && sortedRedPlayers.length >= 1
        ? { blue: sortedBluePlayers[0], red: sortedRedPlayers[0] }
        : null;

    return (
      <>
        <MatchInfoCard gameData={gameData} />

        <GameSwitcher
          games={seriesInfo?.games || []}
          currentGame={currentGameNumber}
          onChange={handleGameChange}
          isBO1={seriesInfo?.format === 'BO1'}
        />

        <TeamStatsBar blueTeam={gameData.blueTeam} redTeam={gameData.redTeam} />

        <PlayerStatsList
          bluePlayers={sortedBluePlayers}
          redPlayers={sortedRedPlayers}
          expandedPosition={expandedPosition}
          onToggle={handleTogglePosition}
        />

        {expandedPosition && topPlayers && (
          <div className="mt-4 max-w-5xl mx-auto">
            <RadarChart
              player1={topPlayers.blue}
              player2={topPlayers.red}
              gameDuration={gameData.gameDuration}
              redTeamStats={gameData.redTeam}
              blueTeamStats={gameData.blueTeam}
              visible={true}
            />
          </div>
        )}
      </>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader onBack={handleBack} />
        <div className="flex flex-col items-center justify-center mt-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg mb-2">{error}</p>
          <p className="text-sm text-gray-400 mb-6">数据加载失败</p>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#c49f58] hover:bg-[#b08d4a] text-[#1a1a2e] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                加载中...
              </>
            ) : (
              '刷新重试'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (loading && !seriesInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader onBack={handleBack} />
        <div className="container mx-auto px-4 py-6">
          <MatchDataSkeleton />
        </div>
      </div>
    );
  }

  if (!loading && !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader
          onBack={handleBack}
          subtitle={
            seriesInfo
              ? `${seriesInfo.teamA.name} vs ${seriesInfo.teamB.name} - ${seriesInfo.format}`
              : undefined
          }
        />
        <MatchDataEmptyState matchId={matchId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
      <MatchDataHeader
        onBack={handleBack}
        subtitle={
          seriesInfo
            ? `${seriesInfo.teamA.name} vs ${seriesInfo.teamB.name} - ${seriesInfo.format}`
            : undefined
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
    </div>
  );
};

export default React.memo(MatchDataPage);
