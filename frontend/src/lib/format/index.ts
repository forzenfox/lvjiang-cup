/**
 * 赛制可配置化 - 视图模型推导层（纯函数）
 * 统一导出：类型 / 内置默认配置 / 配置校验 / 瑞士轮列视图 / BO 快捷视图 / 淘汰赛视图
 */
export * from './types';
export * from './defaultFormat';
export * from './validateFormat';
export * from './buildSwissColumns';
export * from './getSwissViewConfig';
export * from './buildEliminationStages';
