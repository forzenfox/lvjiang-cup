# 移除瑞士轮赛事卡片上的BO3标识计划

## 问题分析

在 `SwissStage.tsx` 组件中，BO3标识显示逻辑如下：

1. **MatchCard 组件** (第57-61行): 当 `isBo3` 为 `true` 时，在卡片右上角显示 "BO3" 标签
2. **RoundColumn 组件**: 接收 `isBo3` 属性并传递给 MatchCard
3. **SwissStage 组件**: 在以下轮次中设置了 `isBo3={true}`:
   - Round 2 High (1-0) - 第186行
   - Round 2 Low (0-1) - 第187行
   - Round 3 Mid (1-1) - 第198行
   - Round 3 Low (0-2) - 第201行
   - Last Chance (1-2) - 第216行

## 实施方案

### 步骤1: 移除 RoundColumn 组件的 isBo3 属性
- 文件: `src/components/features/SwissStage.tsx`
- 修改第186、187、198、201、216行，移除所有 `isBo3` 属性

### 步骤2: 清理 MatchCard 组件的 BO3 渲染逻辑
- 文件: `src/components/features/SwissStage.tsx`
- 修改第41行 MatchCard 接口定义，移除 `isBo3` 属性
- 修改第57-61行，移除 BO3 标识的条件渲染代码

### 步骤3: 清理 RoundColumn 组件的 isBo3 属性
- 文件: `src/components/features/SwissStage.tsx`
- 修改第93-99行 RoundColumn 接口定义，移除 `isBo3` 属性
- 修改第109行，移除传递 isBo3 属性的代码

## 预期结果

移除所有瑞士轮赛事卡片上的BO3标识显示。
