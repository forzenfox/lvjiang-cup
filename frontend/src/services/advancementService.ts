import * as advancementApi from '@/api/advancement';
import type { AdvancementRule, UpdateAdvancementRequest } from '@/api/types';

/**
 * 晋级数据服务状态接口
 */
export interface AdvancementServiceState {
  /** 所有晋级规则列表 */
  rules: AdvancementRule[];
  /** 当前选中的晋级规则 */
  currentRule: AdvancementRule | null;
  /** 按阶段分组的晋级规则 */
  rulesByStage: Map<string, AdvancementRule>;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 晋级数据服务接口
 */
interface AdvancementService {
  /** 获取晋级规则（全部或指定阶段） */
  get: (stage?: string) => Promise<AdvancementRule | AdvancementRule[]>;
  /** 获取特定阶段的晋级规则 */
  getByStage: (stage: string) => Promise<AdvancementRule>;
  /** 更新晋级规则 */
  update: (data: UpdateAdvancementRequest) => Promise<AdvancementRule>;
  /** 获取服务状态 */
  getState: () => AdvancementServiceState;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 服务状态（内部状态管理）
 */
let state: AdvancementServiceState = {
  rules: [],
  currentRule: null,
  rulesByStage: new Map(),
  loading: false,
  error: null,
};

/**
 * 状态监听器集合
 */
const listeners: Set<(state: AdvancementServiceState) => void> = new Set();

/**
 * 更新状态并通知监听器
 */
function setState(newState: Partial<AdvancementServiceState>): void {
  state = { ...state, ...newState };
  listeners.forEach(listener => listener(state));
}

/**
 * 处理错误
 */
function handleError(error: unknown, defaultMessage: string): never {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  setState({ error: errorMessage, loading: false });
  throw new Error(errorMessage);
}

/**
 * 晋级数据服务
 * 
 * 提供晋级规则的获取和更新操作，包含状态管理和错误处理
 * 支持按阶段查询晋级规则
 * 
 * @example
 * ```ts
 * // 获取所有晋级规则
 * const rules = await advancementService.get();
 * 
 * // 获取指定阶段的晋级规则
 * const swissRule = await advancementService.get('swiss');
 * // 或使用 getByStage
 * const swissRule = await advancementService.getByStage('swiss');
 * 
 * // 更新晋级规则
 * await advancementService.update({
 *   id: 'rule1',
 *   advancementCount: 4,
 *   criteria: 'points',
 *   tiebreaker: 'head_to_head'
 * });
 * ```
 */
export const advancementService: AdvancementService = {
  /**
   * 获取晋级规则
   * @param stage 阶段名称，如果不传则获取所有阶段的晋级规则
   * @returns 晋级规则信息或列表
   */
  async get(stage?: string): Promise<AdvancementRule | AdvancementRule[]> {
    setState({ loading: true, error: null });
    
    try {
      const result = await advancementApi.get(stage);
      
      if (Array.isArray(result)) {
        // 获取到规则列表
        const rulesByStage = new Map<string, AdvancementRule>();
        result.forEach(rule => {
          rulesByStage.set(rule.stage, rule);
        });
        
        setState({
          rules: result,
          rulesByStage,
          loading: false,
        });
      } else {
        // 获取到单个规则
        const updatedRulesByStage = new Map(state.rulesByStage);
        updatedRulesByStage.set(result.stage, result);
        
        // 更新规则列表
        const existingIndex = state.rules.findIndex(r => r.id === result.id);
        const updatedRules = existingIndex >= 0
          ? state.rules.map(r => r.id === result.id ? result : r)
          : [...state.rules, result];
        
        setState({
          rules: updatedRules,
          rulesByStage: updatedRulesByStage,
          currentRule: result,
          loading: false,
        });
      }
      
      return result;
    } catch (error) {
      handleError(error, stage ? `获取 ${stage} 阶段晋级规则失败` : '获取晋级规则失败');
    }
  },

  /**
   * 获取特定阶段的晋级规则
   * @param stage 阶段名称
   * @returns 晋级规则信息
   */
  async getByStage(stage: string): Promise<AdvancementRule> {
    setState({ loading: true, error: null });
    
    try {
      // 验证阶段参数
      if (!stage || stage.trim() === '') {
        throw new Error('阶段名称不能为空');
      }
      
      const rule = await advancementApi.getByStage(stage);
      
      // 更新阶段分组缓存
      const updatedRulesByStage = new Map(state.rulesByStage);
      updatedRulesByStage.set(stage, rule);
      
      // 更新规则列表
      const existingIndex = state.rules.findIndex(r => r.id === rule.id);
      const updatedRules = existingIndex >= 0
        ? state.rules.map(r => r.id === rule.id ? rule : r)
        : [...state.rules, rule];
      
      setState({
        rules: updatedRules,
        rulesByStage: updatedRulesByStage,
        currentRule: rule,
        loading: false,
      });
      
      return rule;
    } catch (error) {
      handleError(error, `获取 ${stage} 阶段晋级规则失败`);
    }
  },

  /**
   * 更新晋级规则
   * @param data 更新晋级规则数据
   * @returns 更新后的晋级规则信息
   */
  async update(data: UpdateAdvancementRequest): Promise<AdvancementRule> {
    setState({ loading: true, error: null });
    
    try {
      // 验证 ID
      if (!data.id) {
        throw new Error('晋级规则 ID 不能为空');
      }
      
      // 验证晋级数量
      if (data.advancementCount !== undefined && data.advancementCount < 0) {
        throw new Error('晋级数量不能为负数');
      }
      
      // 验证晋级标准
      const validCriteria = ['points', 'wins', 'score'];
      if (data.criteria && !validCriteria.includes(data.criteria)) {
        throw new Error(`无效的晋级标准: ${data.criteria}，可选值: ${validCriteria.join(', ')}`);
      }
      
      // 验证平局决胜规则
      const validTiebreakers = ['head_to_head', 'score_difference', 'total_score'];
      if (data.tiebreaker && !validTiebreakers.includes(data.tiebreaker)) {
        throw new Error(`无效的平局决胜规则: ${data.tiebreaker}，可选值: ${validTiebreakers.join(', ')}`);
      }
      
      const rule = await advancementApi.update(data);
      
      // 更新本地列表中的规则
      const updatedRules = state.rules.map(r => r.id === rule.id ? rule : r);
      
      // 更新阶段分组缓存
      const updatedRulesByStage = new Map(state.rulesByStage);
      updatedRulesByStage.set(rule.stage, rule);
      
      setState({
        rules: updatedRules,
        rulesByStage: updatedRulesByStage,
        currentRule: state.currentRule?.id === rule.id ? rule : state.currentRule,
        loading: false,
      });
      
      return rule;
    } catch (error) {
      handleError(error, '更新晋级规则失败');
    }
  },

  /**
   * 获取当前服务状态
   * @returns 当前状态
   */
  getState(): AdvancementServiceState {
    return { ...state };
  },

  /**
   * 清除错误信息
   */
  clearError(): void {
    setState({ error: null });
  },

  /**
   * 重置状态到初始值
   */
  resetState(): void {
    state = {
      rules: [],
      currentRule: null,
      rulesByStage: new Map(),
      loading: false,
      error: null,
    };
    listeners.forEach(listener => listener(state));
  },
};

/**
 * 订阅状态变化
 * @param callback 状态变化回调函数
 * @returns 取消订阅函数
 */
export function subscribeToAdvancementService(callback: (state: AdvancementServiceState) => void): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态
  
  return () => {
    listeners.delete(callback);
  };
}

export default advancementService;
