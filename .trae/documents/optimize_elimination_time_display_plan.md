# 优化淘汰赛时间显示方案

## 问题分析

从截图和代码分析，淘汰赛时间显示存在以下问题：

### 1. 数据来源问题
- `round` 字段存储的是简化的日期格式（如 "11.17"、"11.18"）
- `startTime` 字段存储的是完整 ISO 时间（如 "2025-11-17T18:00:00Z"）
- 当前 EliminationStage.tsx 使用 `formatDateTime()` 显示时间，但显示位置在卡片上方，空间受限

### 2. 显示问题
- 时间显示在卡片外部的上方（`h-4` 高度限制），空间很小
- 部分时间显示为 "11月18日 02:00"，部分显示为 "11.17"，格式不统一
- 卡片内部的 Header 显示的是 `round` 字段（如 "11.17"），而不是完整时间

### 3. 用户体验问题
- 用户需要同时看卡片外的完整时间和卡片内的简写日期，信息分散
- 小屏幕下时间显示可能被截断

## 优化方案

### 方案：统一时间显示到卡片内部

将完整时间显示整合到 BracketMatchCard 组件内部，替代或补充现有的 `round` 字段显示。

#### 具体改动

1. **修改 BracketMatchCard.tsx**
   - 在 Card Header 区域显示完整时间（替代原有的 `round` 简写）
   - 添加时间图标增强视觉识别
   - 保持原有样式风格

2. **修改 EliminationStage.tsx**
   - 移除卡片外部的时间显示（第136-138行）
   - 将时间通过 props 传递给 BracketMatchCard

3. **（可选）修改数据**
   - 更新 mock/data.ts 中的 `round` 字段，使其更有意义（如 "胜者组半决赛"、"败者组第一轮" 等）

#### 实施步骤

### 步骤 1：修改 BracketMatchCard.tsx

```typescript
import { formatDateTime } from '@/utils/datetime';
import { Clock } from 'lucide-react';

// 在 Header 区域显示完整时间
<div className="bg-gray-900/50 px-3 py-1 flex justify-between items-center border-b border-gray-700">
  <div className="flex items-center gap-1 text-xs text-gray-400">
    <Clock className="w-3 h-3" />
    <span>{match.startTime ? formatDateTime(match.startTime) : '待定'}</span>
  </div>
  {isGrandFinals && <span className="text-xs text-yellow-500 font-bold">总决赛</span>}
</div>
```

### 步骤 2：修改 EliminationStage.tsx

移除卡片外部的时间显示：
```typescript
// 删除这部分
<div className="mb-1 text-xs text-gray-500 font-mono ml-1 h-4">
  {displayMatch.startTime ? formatDateTime(displayMatch.startTime) : ''}
</div>
```

### 步骤 3：（可选）优化数据

更新 mock/data.ts 中的 round 字段，使用更有意义的名称：
```typescript
// 原数据
round: '11.17',

// 优化后
round: '胜者组半决赛',
```

## 预期效果

1. **时间显示统一**：所有比赛卡片都显示完整时间格式 "X月X日 XX:XX"
2. **布局更紧凑**：移除卡片外部的额外时间行，减少空间占用
3. **视觉一致性**：时间显示在卡片内部 Header 区域，与其他信息（如总决赛标记）保持一致
4. **信息完整**：用户一眼就能看到完整的比赛时间

## 文件变更

1. **BracketMatchCard.tsx**
   - 导入 `formatDateTime` 和 `Clock` 图标
   - 修改 Header 区域显示完整时间

2. **EliminationStage.tsx**
   - 移除卡片外部的时间显示 div

3. **（可选）mock/data.ts**
   - 更新 eliminationMatches 的 round 字段为更有意义的名称

## 测试验证

1. 检查所有淘汰赛卡片是否正确显示完整时间
2. 验证时间格式是否统一为 "X月X日 XX:XX"
3. 确认北京时区是否正确应用
4. 检查总决赛卡片的时间显示是否正常
