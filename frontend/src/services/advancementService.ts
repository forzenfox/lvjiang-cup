import * as advancementApi from '@/api/advancement';
import type { Advancement, UpdateAdvancementRequest } from '@/api/types';

/**
 * 晋级数据服务状态接口
 */
export interface AdvancementServiceState {
  /** 所有晋级规则列表 */
  rules: Advancement[];
  /** 当前选中的晋级规则 */
  currentRule: Advancement | null;
  /** 按阶段分组的晋级规则 */
  rulesByStage: Map<string, Advancement>;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 晋级数据服务接口
 */
interface AdvancementService {
  /** 获取晋级规则 */
  get: () => Promise<Advancement>;
  /** 获取特定阶段的晋级规则 */
  getByStage: (stage: string) => Promise<Advancement>;
  /** 更新晋级规则 */
  update: (data: UpdateAdvancementRequest) => Promise<Advancement>;
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
 *   top8: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
 *   eliminated: ['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16']
 * });
 * ```
 */
export const advancementService: AdvancementService = {
  /**
   * 获取晋级规则
   * @returns 晋级规则信息
   */
  async get(): Promise<Advancement> {
    setState({ loading: true, error: null });

    try {
      const result = await advancementApi.get();

      // 获取到单个规则
      const updatedRulesByStage = new Map(state.rulesByStage);
      updatedRulesByStage.set('default', result);

      // 更新规则列表
      const existingIndex = state.rules.findIndex(r => r === result);
      const updatedRules =
        existingIndex >= 0
          ? state.rules.map(r => (r === result ? result : r))
          : [...state.rules, result];

      setState({
        rules: updatedRules,
        rulesByStage: updatedRulesByStage,
        currentRule: result,
        loading: false,
      });

      return result;
    } catch (error) {
      handleError(error, '获取晋级规则失败');
    }
  },

  /**
   * 获取特定阶段的晋级规则
   * @param stage 阶段名称
   * @returns 晋级规则信息
   */
  async getByStage(stage: string): Promise<Advancement> {
    setState({ loading: true, error: null });

    try {
      // 验证阶段参数
      if (!stage || stage.trim() === '') {
        throw new Error('阶段名称不能为空');
      }

      // 由于 API 没有 getByStage 方法，使用 get() 获取所有数据
      const rule = await advancementApi.get();

      // 更新阶段分组缓存
      const updatedRulesByStage = new Map(state.rulesByStage);
      updatedRulesByStage.set(stage, rule);

      // 更新规则列表
      const existingIndex = state.rules.findIndex(r => r === rule);
      const updatedRules =
        existingIndex >= 0 ? state.rules.map(r => (r === rule ? rule : r)) : [...state.rules, rule];

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
  async update(data: UpdateAdvancementRequest): Promise<Advancement> {
    setState({ loading: true, error: null });

    try {
      const rule = await advancementApi.update(data);

      // 更新本地列表中的规则
      const existingIndex = state.rules.findIndex(r => r === rule);
      const updatedRules =
        existingIndex >= 0 ? state.rules.map(r => (r === rule ? rule : r)) : [...state.rules, rule];

      // 更新阶段分组缓存
      const updatedRulesByStage = new Map(state.rulesByStage);
      updatedRulesByStage.set('default', rule);

      setState({
        rules: updatedRules,
        rulesByStage: updatedRulesByStage,
        currentRule: rule,
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
export function subscribeToAdvancementService(
  callback: (state: AdvancementServiceState) => void
): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态

  return () => {
    listeners.delete(callback);
  };
}

export default advancementService;
