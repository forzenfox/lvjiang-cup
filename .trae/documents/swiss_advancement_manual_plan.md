# 赛程管理页面UI优化方案

## 需求概述
将主页面的UI(水平卡片布局)复刻到管理页面，使管理员能够直观地看到比赛状态，并支持直接在UI上进行操作。同时将晋级淘汰名单的管理也整合到同一个可视化UI中。

## 反馈调整
根据用户反馈：
1. **废弃现有编辑模式** - 不再使用垂直列表+表单编辑模式，改用可视化UI
2. **瑞士轮的晋级淘汰名单也设计成UI上直接编辑** - 整合赛程和晋级名单管理
3. **废弃代码使用TODO标记并采用注释的方式进行屏蔽** - 不直接删除，便于恢复
4. **使用TDD开发** - 测试驱动开发，确保80%+覆盖率

---

## TDD开发流程

本项目将遵循TDD原则，按照以下流程开发：

```
编写测试 → 运行测试(失败) → 编写代码 → 运行测试(通过) → 重构 → 验证覆盖率
```

### 测试类型

1. **单元测试** - 组件逻辑、工具函数、纯函数
2. **集成测试** - API端点、服务交互
3. **E2E测试** - 关键用户流程、UI交互

### 覆盖率要求

- 最低 80% 覆盖率（单元 + 集成 + E2E）
- 所有边缘情况需要覆盖
- 错误场景需要测试
- 边界条件需要验证

---

## 问题分析

### 1. 比赛状态在公开UI上没有体现
- `SwissStage.tsx` 的 MatchCard 组件只展示：时间、队伍名、比分
- `BracketMatchCard.tsx` 淘汰赛卡片也没有状态标识

### 2. 管理页面与公开页面UI不一致
- **公开页面**: 水平卡片布局，按瑞士轮战绩分组
- **管理页面**: 垂直列表+表单编辑模式，缺乏直观性

### 3. 晋级名单管理独立于赛程管理
- 当前晋级名单在独立的 AdvancementManager 页面管理（拖拽方式）

---

## 修改方案

### 核心思路
创建统一的**可视化赛程管理页面**，包含：
1. 瑞士轮/淘汰赛的可视化卡片布局（与公开页面一致）
2. 点击卡片直接编辑比赛信息
3. 比赛结果自动更新晋级状态（或提供快捷操作）

---

### 改动详情

#### 1. 在 MatchCard 组件中添加比赛状态显示 (SwissStage.tsx)

```tsx
// 新增状态徽章
const StatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
  const styles = {
    upcoming: 'bg-blue-900/40 text-blue-400 border-blue-700/30',
    ongoing: 'bg-green-900/50 text-green-400 border-green-700/30 animate-pulse',
    finished: 'bg-gray-700/50 text-gray-400 border-gray-600/30'
  };
  
  return (
    <span className={`absolute top-0 right-0 px-1.5 py-0.5 text-[10px] rounded-bl border ${styles[status]}`}>
      {status === 'upcoming' ? '未开始' : status === 'ongoing' ? '进行中' : '已结束'}
    </span>
  );
};
```

#### 2. 在 BracketMatchCard 组件中添加比赛状态显示 (BracketMatchCard.tsx)

#### 3. 创建统一编辑弹窗组件

**新增文件**: `src/pages/admin/components/MatchEditDialog.tsx`

#### 4. 创建可编辑版本的 MatchCard 组件

**新增文件**: `src/components/features/EditableMatchCard.tsx`

#### 5. 创建可编辑版本的 BracketMatchCard 组件

**新增文件**: `src/components/features/EditableBracketMatchCard.tsx`

#### 6. 创建可视化赛程管理页面

**新增文件**: `src/pages/admin/SwissStageVisualEditor.tsx`
**新增文件**: `src/pages/admin/EliminationStageVisualEditor.tsx`

#### 7. 整合晋级名单管理到可视化UI

在瑞士轮可视化编辑器中，直接在各个战绩分组区域显示晋级的队伍。

#### 8. 废弃现有编辑模式

使用TODO标记和注释屏蔽现有代码。

---

## TDD实现步骤

### 第一阶段：测试准备

#### 步骤1：设置测试环境
- 确认测试框架配置（Jest/Vitest）
- 配置覆盖率阈值
- 设置测试目录结构

#### 步骤2：编写用户旅程

**用户旅程1：管理员查看赛程**
```
作为管理员，我希望看到直观的赛程布局，
以便快速了解比赛状态和晋级情况
```

**用户旅程2：管理员编辑比赛**
```
作为管理员，我希望点击比赛卡片直接编辑，
以便快速更新比分和比赛状态
```

**用户旅程3：管理员管理晋级名单**
```
作为管理员，我希望在同一界面管理晋级名单，
以便直观地调整各队晋级状态
```

### 第二阶段：UI组件增强

#### 步骤3：为 MatchCard 编写测试 (TDD)

```typescript
// src/components/features/__tests__/MatchCard.test.tsx

describe('MatchCard Component', () => {
  it('renders match with upcoming status', () => {
    // Test upcoming status badge
  })

  it('renders match with ongoing status with pulse animation', () => {
    // Test ongoing status with animate-pulse
  })

  it('renders match with finished status', () => {
    // Test finished status badge
  })

  it('displays correct team names and scores', () => {
    // Test team display
  })

  it('handles missing team data gracefully', () => {
    // Test TBD case
  })
})
```

#### 步骤4：运行测试（应该失败）
```bash
npm test
# Tests should fail - status badge not implemented yet
```

#### 步骤5：实现 MatchCard 状态徽章
根据测试实现代码，使测试通过。

#### 步骤6：为 BracketMatchCard 编写测试并实现
重复TDD流程。

### 第三阶段：编辑功能

#### 步骤7：为 MatchEditDialog 编写测试

```typescript
// src/pages/admin/components/__tests__/MatchEditDialog.test.tsx

describe('MatchEditDialog', () => {
  it('opens when edit button clicked', () => {
    // Test dialog opens
  })

  it('displays team selection dropdowns', () => {
    // Test team selectors
  })

  it('allows score input', () => {
    // Test score editing
  })

  it('provides quick status change buttons', () => {
    // Test start/end match buttons
  })

  it('saves match on confirm', () => {
    // Test save functionality
  })

  it('validates required fields', () => {
    // Test validation
  })

  it('handles BO3 matches correctly', () => {
    // Test BO3 score handling
  })
})
```

#### 步骤8：实现 MatchEditDialog
运行测试，通过后继续。

#### 步骤9：为 EditableMatchCard 编写测试

```typescript
// src/components/features/__tests__/EditableMatchCard.test.tsx

describe('EditableMatchCard', () => {
  it('opens edit dialog on click', () => {
    // Test click handler
  })

  it('displays current status visually', () => {
    // Test status display
  })

  it('updates match data from dialog', () => {
    // Test data update
  })
})
```

### 第四阶段：可视化编辑器

#### 步骤10：为 SwissStageVisualEditor 编写测试

```typescript
// src/pages/admin/__tests__/SwissStageVisualEditor.test.tsx

describe('SwissStageVisualEditor', () => {
  it('renders all round columns', () => {
    // Test round layout
  })

  it('displays advancement list in correct positions', () => {
    // Test advancement display
  })

  it('allows editing match on click', () => {
    // Test edit flow
  })

  it('updates advancement when match finishes', () => {
    // Test advancement update (auto mode)
  })

  it('allows manual advancement adjustment', () => {
    // Test manual mode
  })

  it('handles empty matches gracefully', () => {
    // Test empty state
  })

  it('displays correct match counts per round', () => {
    // Test match count
  })
})
```

#### 步骤11：实现 SwissStageVisualEditor

#### 步骤12：为 EliminationStageVisualEditor 编写测试并实现

### 第五阶段：整合与测试

#### 步骤13：集成测试 - Schedule页面

```typescript
// src/pages/admin/__tests__/Schedule.test.tsx

describe('Schedule Admin Page', () => {
  it('switches between visual and list view', () => {
    // Test view switching
  })

  it('loads matches and teams data', () => {
    // Test data loading
  })

  it('updates match through visual editor', () => {
    // Test full update flow
  })
})
```

#### 步骤14：E2E测试 - 赛程管理流程

```typescript
// src/e2e/schedule-management.spec.ts

test('admin can manage schedule visually', async ({ page }) => {
  // Navigate to admin schedule
  await page.goto('/admin/schedule')

  // Verify visual layout displayed
  await expect(page.locator('text=Round 1')).toBeVisible()

  // Click match card to edit
  await page.click('[data-match-card]')

  // Update score
  await page.fill('[data-score-a]', '2')
  await page.fill('[data-score-b]', '0')

  // End match
  await page.click('button:has-text("结束比赛")')

  // Verify advancement updated
  await expect(page.locator('text=2-0 晋级')).toContainText('TeamA')
})

test('admin can manually adjust advancement', async ({ page }) => {
  // Navigate to visual editor
  await page.goto('/admin/schedule')

  // Click on advancement badge
  await page.click('[data-advancement-badge="winners2_0"]')

  // Add team to advancement
  await page.click('[data-add-team]')

  // Verify team added
  await expect(page.locator('[data-team="TeamA"]')).toBeVisible()
})
```

#### 步骤15：运行完整测试套件

```bash
npm test
# All tests should pass
```

#### 步骤16：验证覆盖率

```bash
npm run test:coverage
# Verify 80%+ coverage
```

### 第六阶段：废弃旧代码

#### 步骤17：为旧组件添加TODO标记

在 SwissStageEditor.tsx 和 EliminationStageEditor.tsx 中添加废弃注释。

### 第七阶段：重构与优化

#### 步骤18：重构代码

在保持测试通过的情况下优化代码质量。

#### 步骤19：最终验证

运行所有测试，确认功能正常。

---

## 文件变更清单

### 测试文件（新增）
- `src/components/features/__tests__/MatchCard.test.tsx`
- `src/components/features/__tests__/BracketMatchCard.test.tsx`
- `src/components/features/__tests__/EditableMatchCard.test.tsx`
- `src/components/features/__tests__/EditableBracketMatchCard.test.tsx`
- `src/pages/admin/components/__tests__/MatchEditDialog.test.tsx`
- `src/pages/admin/__tests__/SwissStageVisualEditor.test.tsx`
- `src/pages/admin/__tests__/EliminationStageVisualEditor.test.tsx`
- `src/pages/admin/__tests__/Schedule.test.tsx`
- `src/e2e/schedule-management.spec.ts`

### 新增文件
- `src/components/features/EditableMatchCard.tsx`
- `src/components/features/EditableBracketMatchCard.tsx`
- `src/pages/admin/components/MatchEditDialog.tsx`
- `src/pages/admin/SwissStageVisualEditor.tsx`
- `src/pages/admin/EliminationStageVisualEditor.tsx`

### 修改文件
- `src/components/features/SwissStage.tsx` - 添加状态徽章
- `src/components/features/BracketMatchCard.tsx` - 添加状态徽章
- `src/pages/admin/Schedule.tsx` - 添加视图切换

### 废弃文件（TODO标记）
- `src/pages/admin/components/SwissStageEditor.tsx`
- `src/pages/admin/components/EliminationStageEditor.tsx`

---

## 预期效果

### 公开页面
- 每场比赛卡片右上角显示状态标签
- 未开始：蓝色标签
- 进行中：绿色脉冲标签
- 已结束：灰色标签

### 管理页面
- 默认显示"可视化视图"，布局与公开页面一致
- 点击任意比赛卡片，弹出编辑窗口
- 弹窗内可快速修改比分、切换状态
- 快捷按钮：一键开始、一键结束
- 晋级名单直接显示在各战绩分组区域
- 管理员可以直接在UI上调整晋级名单

---

## 覆盖率目标

| 测试类型 | 覆盖率目标 | 关键指标 |
|---------|-----------|---------|
| 单元测试 | 80%+ | 组件逻辑、工具函数 |
| 集成测试 | 80%+ | API交互、数据流 |
| E2E测试 | 关键流程覆盖 | 完整用户旅程 |

---

## 测试文件组织

```
src/
├── components/
│   ├── features/
│   │   ├── MatchCard.tsx
│   │   ├── __tests__/
│   │   │   └── MatchCard.test.tsx
│   │   ├── EditableMatchCard.tsx
│   │   └── __tests__/
│   │       └── EditableMatchCard.test.tsx
│   └── ...
├── pages/
│   └── admin/
│       ├── Schedule.tsx
│       ├── SwissStageVisualEditor.tsx
│       ├── __tests__/
│       │   ├── SwissStageVisualEditor.test.tsx
│       │   └── Schedule.test.tsx
│       └── components/
│           ├── MatchEditDialog.tsx
│           └── __tests__/
│               └── MatchEditDialog.test.tsx
└── e2e/
    └── schedule-management.spec.ts
```
