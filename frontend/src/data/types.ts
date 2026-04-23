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
