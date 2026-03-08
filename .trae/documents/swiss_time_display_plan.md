# 瑞士轮时间显示修复计划

## 问题描述
瑞士轮比赛卡片中没有显示对战时间，但数据中已经存在 `startTime` 字段。

## 问题分析

### 1. 数据层面
- 文件：`src/mock/data.ts`
- 每个瑞士轮比赛都有 `startTime` 字段，格式为 ISO 8601（如 `'2025-11-13T18:00:00Z'`）
- 时间已经按天数和小时分组设置

### 2. 组件层面
- 文件：`src/components/features/SwissStage.tsx`
- `MatchCard` 组件只显示：
  - 队伍 Logo
  - 队伍名称
  - 比分
  - BO3 标记
- **缺少**：比赛开始时间显示

## 修复方案

### 方案一：在 MatchCard 中显示时间（推荐）

在 `MatchCard` 组件中添加时间显示：

1. **位置选择**：
   - 选项A：在卡片顶部显示（与 BO3 标记并排）
   - 选项B：在卡片底部显示
   - 选项C：在队伍名称旁边显示

2. **时间格式**：
   - 格式：`11月13日 18:00`
   - 使用本地时区转换

3. **实现步骤**：
   - 添加时间格式化函数
   - 在 MatchCard 中添加时间显示元素
   - 调整样式确保布局美观

### 方案二：按时间分组显示

将同一时间的比赛分组显示，但这样改动较大，可能影响现有布局。

## 实施步骤

### 步骤 1：添加时间格式化工具函数
```typescript
// 格式化时间为本地时间字符串
const formatMatchTime = (startTime: string): string => {
  const date = new Date(startTime);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
```

### 步骤 2：修改 MatchCard 组件
在 `MatchCard` 组件中添加时间显示：
- 在卡片顶部左侧显示时间
- 与右侧的 BO3 标记形成对称布局
- 使用较小的字体和次要颜色

### 步骤 3：样式调整
- 时间文字使用 `text-gray-500` 和 `text-xs`
- 确保时间显示不会挤占其他内容空间

## 预期效果

每个比赛卡片顶部会显示类似 "11月13日 18:00" 的时间信息，让用户清楚知道比赛时间。

## 文件变更

1. `src/components/features/SwissStage.tsx`
   - 添加 `formatMatchTime` 函数
   - 修改 `MatchCard` 组件，添加时间显示

## 测试验证

1. 检查所有瑞士轮比赛卡片是否正确显示时间
2. 验证时间格式是否符合中文习惯
3. 确认时区转换正确（UTC 转本地时间）
