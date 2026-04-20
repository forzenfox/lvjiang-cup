import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import MatchDataHeader from './MatchDataHeader';
import RadarChart from './RadarChart';
import { getMatchSeries, getMatchGameData } from '@/api/matchData';
import type { MatchSeriesInfo, MatchGameData, GameSummary } from '@/types/matchData';
import { ZIndexLayers } from '@/constants/zIndex';
import { useMatchDataStore } from '@/store/matchDataStore';
import { trackMatchDataPageView, trackGameSwitch, trackRadarChartExpand, trackRadarChartCollapse } from '@/utils/tracking';

/**
 * 对战数据详情页面
 * 
 * 功能：
 * 1. 从URL路径参数获取match id
 * 2. 从查询参数?game=X获取当前查看的局数
 * 3. 支持切换不同局数的数据，URL自动更新
 * 4. 支持浏览器前进/后退按钮导航
 */
const MatchDataPage: React.FC = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [seriesInfo, setSeriesInfo] = useState<MatchSeriesInfo | null>(null);
  const [gameData, setGameData] = useState<MatchGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 记录上一局数，用于跟踪游戏切换
  const prevGameNumberRef = useRef<number>(0);

  // 使用store的preloadAdjacentGame进行预加载
  const preloadAdjacentGame = useMatchDataStore((state) => state.preloadAdjacentGame);

  // 从URL查询参数获取当前游戏局数，默认为1
  const currentGameNumber = parseInt(searchParams.get('game') || '1', 10);

  /**
   * 加载系列赛信息
   */
  const loadSeriesInfo = useCallback(async (mId: string) => {
    try {
      const series = await getMatchSeries(mId);
      setSeriesInfo(series);
      
      // 验证请求的局数是否有效
      const validGameNumbers = series.games.map(g => g.gameNumber);
      if (!validGameNumbers.includes(currentGameNumber)) {
        // 如果当前局数无效，重置为第一个有效局数
        const firstValidGame = validGameNumbers[0];
        if (firstValidGame) {
          setSearchParams({ game: firstValidGame.toString() });
        }
      }
      
      // 触发预加载相邻局数数据
      const maxGames = Math.max(...validGameNumbers);
      preloadAdjacentGame(mId, currentGameNumber, maxGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取系列赛信息失败');
      console.error('[MatchDataPage] 系列赛信息加载失败:', err);
    }
  }, [currentGameNumber, setSearchParams, preloadAdjacentGame]);

  /**
   * 加载单局游戏数据
   */
  const loadGameData = useCallback(async (mId: string, gameNum: number) => {
    try {
      const data = await getMatchGameData(mId, gameNum);
      setGameData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取游戏数据失败');
      console.error('[MatchDataPage] 游戏数据加载失败:', err);
    }
  }, []);

  /**
   * 加载数据
   */
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
        await Promise.all([
          loadSeriesInfo(matchId),
          loadGameData(matchId, currentGameNumber),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [matchId, currentGameNumber, loadSeriesInfo, loadGameData]);

  /**
   * 跟踪页面浏览事件（仅在首次加载时触发）
   */
  useEffect(() => {
    if (matchId) {
      trackMatchDataPageView(matchId);
    }
  }, [matchId]);

  /**
   * 跟踪游戏切换事件
   */
  useEffect(() => {
    const prevGame = prevGameNumberRef.current;
    
    // 只有当 prevGame 不为 0 且 gameNumber 发生变化时才跟踪
    if (matchId && prevGame !== 0 && prevGame !== currentGameNumber) {
      trackGameSwitch(matchId, prevGame, currentGameNumber);
    }
    
    // 更新上一局数
    prevGameNumberRef.current = currentGameNumber;
  }, [matchId, currentGameNumber]);

  /**
   * 切换游戏局数
   */
  const handleGameChange = useCallback((gameNumber: number) => {
    setSearchParams({ game: gameNumber.toString() });
  }, [setSearchParams]);

  /**
   * 返回上一页
   */
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 雷达图展开/折叠状态
  const [isRadarExpanded, setIsRadarExpanded] = useState(true);

  /**
   * 切换雷达图展开/折叠状态
   */
  const handleRadarToggle = useCallback(() => {
    if (gameData && matchId && gameData.playerStats.length >= 2) {
      const newState = !isRadarExpanded;
      setIsRadarExpanded(newState);

      // 跟踪展开/折叠事件
      if (newState) {
        trackRadarChartExpand(
          matchId,
          currentGameNumber,
          gameData.playerStats[0].playerName,
          gameData.playerStats[1].playerName,
        );
      } else {
        trackRadarChartCollapse(
          matchId,
          currentGameNumber,
          gameData.playerStats[0].playerName,
          gameData.playerStats[1].playerName,
        );
      }
    }
  }, [isRadarExpanded, gameData, matchId, currentGameNumber]);

  // 渲染游戏选择按钮
  const renderGameSelector = () => {
    if (!seriesInfo) return null;

    return (
      <div className="flex gap-2 my-4">
        {seriesInfo.games.map((game: GameSummary) => (
          <button
            key={game.gameNumber}
            onClick={() => handleGameChange(game.gameNumber)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              game.gameNumber === currentGameNumber
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            } ${!game.hasData ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!game.hasData}
            aria-label={`切换到第${game.gameNumber}局`}
          >
            Game {game.gameNumber}
          </button>
        ))}
      </div>
    );
  };

  // 渲染错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
        <MatchDataHeader onBack={handleBack} />
        <div className="flex flex-col items-center justify-center mt-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // 渲染加载状态
  if (loading && !seriesInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
        <MatchDataHeader onBack={handleBack} />
        <div className="flex flex-col items-center justify-center mt-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <MatchDataHeader 
        onBack={handleBack} 
        subtitle={seriesInfo ? `${seriesInfo.teamA.name} vs ${seriesInfo.teamB.name} - ${seriesInfo.format}` : undefined} 
      />
      
      <div className="container mx-auto px-4 py-6">
        {renderGameSelector()}
        
        {gameData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {gameData.blueTeam.teamName} (Blue)
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Kills: {gameData.blueTeam.kills}</p>
                  <p>Towers: {gameData.blueTeam.towers}</p>
                  <p>Dragons: {gameData.blueTeam.dragons}</p>
                  <p>Barons: {gameData.blueTeam.barons}</p>
                  <p>Gold: {gameData.blueTeam.gold.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {gameData.redTeam.teamName} (Red)
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Kills: {gameData.redTeam.kills}</p>
                  <p>Towers: {gameData.redTeam.towers}</p>
                  <p>Dragons: {gameData.redTeam.dragons}</p>
                  <p>Barons: {gameData.redTeam.barons}</p>
                  <p>Gold: {gameData.redTeam.gold.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">雷达图对比</h3>
                {gameData.playerStats.length >= 2 && (
                  <button
                    onClick={handleRadarToggle}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                    aria-label={isRadarExpanded ? '折叠雷达图' : '展开雷达图'}
                  >
                    {isRadarExpanded ? '收起' : '展开'}
                    {isRadarExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {gameData.playerStats.length >= 2 ? (
                <RadarChart
                  player1={gameData.playerStats[0]}
                  player2={gameData.playerStats[1]}
                  gameDuration={gameData.gameDuration}
                  redTeamStats={gameData.redTeam}
                  blueTeamStats={gameData.blueTeam}
                  visible={isRadarExpanded}
                />
              ) : (
                <p className="text-gray-400 text-center py-8">暂无选手数据可对比</p>
              )}
            </div>
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center my-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MatchDataPage);
