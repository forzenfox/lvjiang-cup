# 瑞士轮赛事卡片 UI 一致性改造计划

## 需求概述
主页面的瑞士轮赛事卡片与管理页面的瑞士轮赛事卡片 UI 不一致，管理页面的赛事卡片未显示赛事时间。需要统一两个页面的卡片 UI。

## 当前状态分析

### 主页面 SwissStage.tsx
- **MatchCard 组件** (第41-86行) 包含：
  - 状态徽章（右上角）
  - **赛事时间显示（左上角，第51-56行）**
  - 队伍A信息（左侧）
  - 队伍B信息（左侧）
  - 比分显示（右侧）

### 管理页面 SwissStageVisualEditor.tsx
- **FixedSlotMatchCard 组件** (第60-237行) 包含：
  - 状态徽章（右上角）
  - **缺少赛事时间显示**
  - 队伍A信息（左侧）
  - 队伍B信息（左侧）
  - 比分显示（右侧）

### 差异点
| 功能 | 主页面 | 管理页面 |
|------|--------|----------|
| 状态徽章 | ✅ | ✅ |
| 赛事时间 | ✅ | ❌ 缺失 |
| 队伍信息 | ✅ | ✅ |
| 比分显示 | ✅ | ✅ |

## 改造方案

在管理页面的 `FixedSlotMatchCard` 组件中添加赛事时间显示，与主页面保持一致。

### 具体修改

**文件**: `src/pages/admin/SwissStageVisualEditor.tsx`

在 `FixedSlotMatchCard` 组件的返回部分（非编辑状态），在 `MatchStatusBadge` 之后添加时间显示：

```tsx
// 在 MatchStatusBadge 之后添加
{match?.startTime && (
  <div className="absolute top-0 left-0 bg-gray-700/50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-br flex items-center gap-1">
    <Clock className="w-3 h-3" />
    <span>{formatDateTime(match.startTime)}</span>
  </div>
)}
```

同时需要：
1. 导入 `Clock` 图标 from 'lucide-react'
2. 导入 `formatDateTime` 函数 from '@/utils/datetime'

## 实现步骤

### 步骤1：添加导入
```typescript
import { Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';
```

### 步骤2：修改 FixedSlotMatchCard 组件
在组件的返回部分（非编辑状态的 Card 中），添加时间显示代码。

### 步骤3：运行测试验证
```bash
npm test
```

## 预期效果

管理页面的赛事卡片将显示赛事时间，与主页面保持一致：
- 时间显示在卡片左上角
- 格式与主页面相同
- 只在有 startTime 时显示

## 文件变更清单

### 修改文件
1. `src/pages/admin/SwissStageVisualEditor.tsx` - 添加时间显示和必要的导入
