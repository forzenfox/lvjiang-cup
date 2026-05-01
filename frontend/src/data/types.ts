/**
 * 赞助商配置接口
 */
export interface SponsorConfig {
  /** 唯一标识（不重复的正整数） */
  id: number;
  /** 赞助人名称 */
  sponsorName: string;
  /** 赞助内容 */
  sponsorContent: string;
  /** 特殊奖项说明（可选） */
  specialAward?: string;
}

/**
 * 工作人员配置接口
 */
export interface StaffConfig {
  /** 唯一标识（不重复的正整数） */
  id: number;
  /** 工作人员姓名 */
  name: string;
  /** 角色/职责分类 */
  role: string;
}

/**
 * 鸣谢区域数据接口
 */
export interface ThanksData {
  /** 赞助商列表 */
  sponsors: SponsorConfig[];
  /** 工作人员列表 */
  staff: StaffConfig[];
}

/**
 * 常规奖金配置
 */
export interface RegularPrizeConfig {
  /** 常规奖金总额（元） */
  total: number;
  /** 冠军奖金（元），可选，默认根据 total * championRatio 计算 */
  champion?: number;
  /** 亚军奖金（元），可选，默认根据 total * runnerUpRatio 计算 */
  runnerUp?: number;
  /** 冠军占比 */
  championRatio: number;
  /** 亚军占比 */
  runnerUpRatio: number;
}

/**
 * 特殊奖项配置
 */
export interface SpecialAwardConfig {
  /** 唯一标识 */
  id: number;
  /** 奖项内容 */
  content: string;
}

/**
 * 奖金池数据接口
 */
export interface PrizePoolData {
  /** 赛事奖金池总额（常规奖金 + 特殊奖项，用于标题展示） */
  prizePoolTotal: number;
  /** 常规奖金 */
  regular: RegularPrizeConfig;
  /** 特殊奖项列表 */
  specialAwards: SpecialAwardConfig[];
}

declare global {
  interface Window {
    PRIZE_POOL_DATA?: PrizePoolData;
  }
}

export {};
