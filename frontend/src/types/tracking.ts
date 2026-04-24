/**
 * 数据跟踪事件类型定义
 */

/**
 * 对战数据相关事件名称常量
 */
export const MatchDataEvents = {
  // 页面事件
  MATCH_DATA_PAGE_VIEW: 'match_data_page_view',

  // 交互事件
  MATCH_DATA_BUTTON_CLICK: 'match_data_button_click',
  GAME_SWITCH: 'game_switch',
  PLAYER_ROW_CLICK: 'player_row_click',
  RADAR_CHART_EXPAND: 'radar_chart_expand',
  RADAR_CHART_COLLAPSE: 'radar_chart_collapse',
  ADMIN_IMPORT_START: 'admin_import_start',
  ADMIN_IMPORT_SUCCESS: 'admin_import_success',
  ADMIN_EDIT_OPEN: 'admin_edit_open',
  ADMIN_EDIT_SAVE: 'admin_edit_save',
  ADMIN_DELETE: 'admin_delete',
  ADMIN_TOGGLE_STATUS: 'admin_toggle_status',
} as const;

/**
 * 事件名称联合类型
 */
export type MatchDataEventType = (typeof MatchDataEvents)[keyof typeof MatchDataEvents];

/**
 * 所有跟踪事件的基础属性
 */
export interface BaseEventProperties {
  /** 事件名称 */
  event: string;
  /** 时间戳 */
  timestamp: string;
}

/**
 * 页面浏览事件属性
 */
export interface PageViewEventProperties extends BaseEventProperties {
  event: typeof MatchDataEvents.MATCH_DATA_PAGE_VIEW;
  /** 比赛 ID */
  matchId: string;
  /** 页面路径 */
  page: string;
}

/**
 * 游戏切换事件属性
 */
export interface GameSwitchEventProperties extends BaseEventProperties {
  event: typeof MatchDataEvents.GAME_SWITCH;
  /** 比赛 ID */
  matchId: string;
  /** 当前局数 */
  gameNumber: number;
  /** 从哪局切换 */
  fromGame: number;
  /** 切换到哪局 */
  toGame: number;
}

/**
 * 玩家行点击事件属性
 */
export interface PlayerRowClickEventProperties extends BaseEventProperties {
  event: typeof MatchDataEvents.PLAYER_ROW_CLICK;
  /** 比赛 ID */
  matchId: string;
  /** 当前局数 */
  gameNumber: number;
  /** 玩家 ID */
  playerId: string;
  /** 玩家名称 */
  playerName: string;
}

/**
 * 雷达图展开/折叠事件属性
 */
export interface RadarChartEventProperties extends BaseEventProperties {
  event: typeof MatchDataEvents.RADAR_CHART_EXPAND | typeof MatchDataEvents.RADAR_CHART_COLLAPSE;
  /** 比赛 ID */
  matchId: string;
  /** 当前局数 */
  gameNumber: number;
  /** 玩家 1 名称 */
  player1Name: string;
  /** 玩家 2 名称 */
  player2Name: string;
}

/**
 * 管理员导入事件属性
 */
export interface AdminImportEventProperties extends BaseEventProperties {
  event: typeof MatchDataEvents.ADMIN_IMPORT_START | typeof MatchDataEvents.ADMIN_IMPORT_SUCCESS;
  /** 比赛 ID */
  matchId: string;
  /** 文件名（仅 start 事件） */
  fileName?: string;
  /** 导入局数（仅 success 事件） */
  gameNumber?: number;
  /** 选手数据条数（仅 success 事件） */
  playerCount?: number;
}

/**
 * 管理员编辑事件属性
 */
export interface AdminEditEventProperties extends BaseEventProperties {
  event: typeof MatchDataEvents.ADMIN_EDIT_OPEN | typeof MatchDataEvents.ADMIN_EDIT_SAVE;
  /** 比赛 ID */
  matchId: string;
  /** 局数 */
  gameNumber: number;
}

/**
 * 通用事件属性（用于未明确定义的事件）
 */
export interface GenericEventProperties extends BaseEventProperties {
  event: string;
  /** 比赛 ID（可选） */
  matchId?: string;
  /** 局数（可选） */
  gameNumber?: number;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

/**
 * 所有事件属性的联合类型
 */
export type TrackEventProperties =
  | PageViewEventProperties
  | GameSwitchEventProperties
  | PlayerRowClickEventProperties
  | RadarChartEventProperties
  | AdminImportEventProperties
  | AdminEditEventProperties
  | GenericEventProperties;
