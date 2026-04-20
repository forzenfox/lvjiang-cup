import type { TrackEventProperties } from '@/types/tracking';

/**
 * 跟踪端点路径
 */
const TRACKING_ENDPOINT = '/api/track';

/**
 * 获取完整的跟踪 API URL
 */
function getTrackingUrl(): string {
  // 在开发环境中使用 Vite 代理，生产环境中使用相对路径
  return TRACKING_ENDPOINT;
}

/**
 * 发送跟踪事件到后端
 * 优先使用 navigator.sendBeacon，否则使用 fetch with keepalive
 * 
 * @param payload - 事件数据
 */
function sendTrackingData(payload: TrackEventProperties): void {
  const url = getTrackingUrl();
  const jsonPayload = JSON.stringify(payload);

  // 优先使用 sendBeacon（可靠交付，页面关闭时也能发送）
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([jsonPayload], { type: 'application/json' });
      const success = navigator.sendBeacon(url, blob);
      
      if (!success) {
        // sendBeacon 失败（通常是队列满），降级到 fetch
        console.warn('[Tracking] sendBeacon 队列已满，使用 fetch 降级');
        sendViaFetch(url, jsonPayload);
      }
    } catch (error) {
      // sendBeacon 抛出异常，降级到 fetch
      console.warn('[Tracking] sendBeacon 失败，使用 fetch 降级:', error);
      sendViaFetch(url, jsonPayload);
    }
  } else {
    // 不支持 sendBeacon，直接使用 fetch
    sendViaFetch(url, jsonPayload);
  }
}

/**
 * 使用 fetch with keepalive 发送跟踪数据
 * 
 * @param url - 跟踪端点
 * @param jsonPayload - JSON 格式的事件数据
 */
function sendViaFetch(url: string, jsonPayload: string): void {
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonPayload,
      keepalive: true, // 允许页面关闭后继续发送
    }).catch((error) => {
      // 静默处理错误，不影响用户体验
      console.error('[Tracking] fetch 发送失败:', error);
    });
  } catch (error) {
    // 静默处理错误，不影响用户体验
    console.error('[Tracking] fetch 调用失败:', error);
  }
}

/**
 * 跟踪自定义事件
 * 
 * @param event - 事件名称
 * @param properties - 事件属性（可选）
 * 
 * @example
 * trackEvent('button_click', { buttonId: 'submit', page: 'login' });
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  try {
    const payload: TrackEventProperties = {
      event,
      timestamp: new Date().toISOString(),
      ...properties,
    };

    sendTrackingData(payload);
  } catch (error) {
    // 静默处理错误，确保跟踪不会破坏应用
    console.error('[Tracking] trackEvent 失败:', error);
  }
}

/**
 * 跟踪页面浏览事件
 * 
 * @param page - 页面路径/名称
 * @param properties - 额外属性（可选）
 * 
 * @example
 * trackPageView('/match-data/123', { matchId: '123' });
 */
export function trackPageView(
  page: string,
  properties?: Record<string, unknown>,
): void {
  try {
    const payload: TrackEventProperties = {
      event: 'page_view',
      page,
      timestamp: new Date().toISOString(),
      ...properties,
    };

    sendTrackingData(payload);
  } catch (error) {
    // 静默处理错误，确保跟踪不会破坏应用
    console.error('[Tracking] trackPageView 失败:', error);
  }
}

/**
 * 跟踪对战数据页面浏览事件
 * 
 * @param matchId - 比赛 ID
 * 
 * @example
 * trackMatchDataPageView('match_123');
 */
export function trackMatchDataPageView(matchId: string): void {
  trackEvent('match_data_page_view', {
    matchId,
    page: `/match-data/${matchId}`,
  });
}

/**
 * 跟踪游戏切换事件
 * 
 * @param matchId - 比赛 ID
 * @param fromGame - 从哪局切换
 * @param toGame - 切换到哪局
 * 
 * @example
 * trackGameSwitch('match_123', 1, 2);
 */
export function trackGameSwitch(
  matchId: string,
  fromGame: number,
  toGame: number,
): void {
  trackEvent('game_switch', {
    matchId,
    fromGame,
    toGame,
    gameNumber: toGame,
  });
}

/**
 * 跟踪玩家行点击事件
 * 
 * @param matchId - 比赛 ID
 * @param gameNumber - 当前局数
 * @param playerId - 玩家 ID
 * @param playerName - 玩家名称
 * 
 * @example
 * trackPlayerRowClick('match_123', 1, 'player_456', '张三');
 */
export function trackPlayerRowClick(
  matchId: string,
  gameNumber: number,
  playerId: string,
  playerName: string,
): void {
  trackEvent('player_row_click', {
    matchId,
    gameNumber,
    playerId,
    playerName,
  });
}

/**
 * 跟踪雷达图展开事件
 * 
 * @param matchId - 比赛 ID
 * @param gameNumber - 当前局数
 * @param player1Name - 玩家 1 名称
 * @param player2Name - 玩家 2 名称
 * 
 * @example
 * trackRadarChartExpand('match_123', 1, '张三', '李四');
 */
export function trackRadarChartExpand(
  matchId: string,
  gameNumber: number,
  player1Name: string,
  player2Name: string,
): void {
  trackEvent('radar_chart_expand', {
    matchId,
    gameNumber,
    player1Name,
    player2Name,
  });
}

/**
 * 跟踪雷达图折叠事件
 * 
 * @param matchId - 比赛 ID
 * @param gameNumber - 当前局数
 * @param player1Name - 玩家 1 名称
 * @param player2Name - 玩家 2 名称
 * 
 * @example
 * trackRadarChartCollapse('match_123', 1, '张三', '李四');
 */
export function trackRadarChartCollapse(
  matchId: string,
  gameNumber: number,
  player1Name: string,
  player2Name: string,
): void {
  trackEvent('radar_chart_collapse', {
    matchId,
    gameNumber,
    player1Name,
    player2Name,
  });
}

/**
 * 跟踪管理员导入开始事件
 * 
 * @param matchId - 比赛 ID
 * @param fileName - 文件名
 * 
 * @example
 * trackAdminImportStart('match_123', 'data.xlsx');
 */
export function trackAdminImportStart(matchId: string, fileName: string): void {
  trackEvent('admin_import_start', {
    matchId,
    fileName,
  });
}

/**
 * 跟踪管理员导入成功事件
 * 
 * @param matchId - 比赛 ID
 * @param gameNumber - 导入局数
 * @param playerCount - 选手数据条数
 * 
 * @example
 * trackAdminImportSuccess('match_123', 1, 10);
 */
export function trackAdminImportSuccess(
  matchId: string,
  gameNumber: number,
  playerCount: number,
): void {
  trackEvent('admin_import_success', {
    matchId,
    gameNumber,
    playerCount,
  });
}

/**
 * 跟踪管理员编辑打开事件
 * 
 * @param matchId - 比赛 ID
 * @param gameNumber - 局数
 * 
 * @example
 * trackAdminEditOpen('match_123', 1);
 */
export function trackAdminEditOpen(matchId: string, gameNumber: number): void {
  trackEvent('admin_edit_open', {
    matchId,
    gameNumber,
  });
}

/**
 * 跟踪管理员编辑保存事件
 * 
 * @param matchId - 比赛 ID
 * @param gameNumber - 局数
 * 
 * @example
 * trackAdminEditSave('match_123', 1);
 */
export function trackAdminEditSave(matchId: string, gameNumber: number): void {
  trackEvent('admin_edit_save', {
    matchId,
    gameNumber,
  });
}
