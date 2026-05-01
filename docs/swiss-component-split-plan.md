# 瑞士轮组件拆分优化方案

## 1. 现状分析

### 1.1 当前组件结构

```
src/components/features/
├── SwissStageResponsive.tsx          # 响应式入口组件（已存在）
└── swiss/
    ├── SwissStagePC.tsx              # PC端容器（已存在）
    ├── SwissStageMobile.tsx          # 移动端容器（已存在）
    ├── SwissMatchCard.tsx            # PC端比赛卡片（已存在）
    ├── SwissMatchCardMobile.tsx      # 移动端比赛卡片（已存在）
    ├── SwissRoundTree.tsx            # PC端树形结构（已存在）
    ├── SwissRoundTabs.tsx            # 移动端轮次标签（已存在）
    ├── SwissFinalResultMobile.tsx    # 移动端最终结果（已存在）
    ├── SwissRecordSection.tsx        # PC端战绩分区（已存在）
    ├── SwissRecordGroup.tsx          # PC端战绩分组（已存在）
    ├── SwissTeamLogo.tsx             # 队伍Logo（共享）
    ├── SwissEmptyState.tsx           # 空状态（共享）
    ├── SwissStatusBadge.tsx          # 状态标签（共享）
    ├── SwissTeamList.tsx             # 队伍列表（共享）
    └── SwissRoundColumn.tsx          # 轮次列（PC端）
```

### 1.2 当前拆分状态评估

| 组件 | 当前状态 | 评估 |
|------|----------|------|
| `SwissStageResponsive` | 已拆分 | 作为入口组件，根据 `useIsMobile` 分发到 PC/Mobile |
| `SwissStagePC` | 已拆分 | 职责清晰，仅负责 PC 端布局 |
| `SwissStageMobile` | 已拆分 | 职责清晰，但内部逻辑较复杂 |
| `SwissMatchCard` / `SwissMatchCardMobile` | 已拆分 | 两端 UI 差异大，拆分合理 |
| `SwissRoundTree` | PC 端独占 | 树形结构复杂，不适合移动端 |
| `SwissRoundTabs` | 移动端独占 | 标签导航，不适合 PC 端 |
| `SwissFinalResultMobile` | 移动端独占 | 纵向列表，PC 端使用树形结构展示结果 |
| `SwissRecordSection` | PC 端独占 | 包含晋级/淘汰/比赛三种类型，与树形结构绑定 |
| `SwissRecordGroup` | PC 端独占 | 固定宽度列布局，不适合移动端 |

### 1.3 存在的问题

1. **代码重复**：
   - `SwissMatchCard` 和 `SwissMatchCardMobile` 都包含队伍查找、胜负判断逻辑
   - `SwissStagePC` 和 `SwissStageMobile` 都处理 `advancement` 数据

2. **数据处理逻辑分散**：
   - `matchesByRecord` 在 `SwissRoundTree` 和 `SwissStageMobile` 中分别实现
   - 晋级/淘汰队伍过滤逻辑在多处重复

3. **主题/样式不一致风险**：
   - 移动端卡片使用硬编码颜色（如 `text-[#F59E0B]`）
   - PC 端卡片使用 `SWISS_THEME` 主题配置

4. **测试分散**：
   - 相同功能需要在两个组件中分别测试

---

## 2. 优化目标

1. **提取共享逻辑**：将数据处理、主题配置等逻辑提取到共享 Hook/工具中
2. **统一主题**：确保两端使用一致的主题系统
3. **减少重复代码**：合并可复用的逻辑，保持 UI 组件独立
4. **保持拆分优势**：PC 和移动端组件保持独立，互不干扰
5. **提升可维护性**：修改逻辑时只需修改一处

---

## 3. 优化方案

### 3.1 新增共享模块

#### 3.1.1 useSwissData Hook（新增）

**文件**：`frontend/src/hooks/useSwissData.ts`

**职责**：
- 按战绩分组比赛 (`matchesByRecord`)
- 过滤晋级/淘汰队伍
- 按排名排序队伍
- 获取当前轮次配置

**解决的重复**：
- `SwissRoundTree.tsx` 第 51-61 行
- `SwissStageMobile.tsx` 第 31-41 行
- `SwissRecordSection.tsx` 第 50-75 行

```typescript
// 示例接口
interface UseSwissDataResult {
  matchesByRecord: Record<string, Match[]>;
  qualifiedTeams: Team[];
  eliminatedTeams: Team[];
  getTeamsByRecord: (record: string) => Team[];
}

export function useSwissData(
  matches: Match[],
  teams: Team[],
  advancement?: Advancement
): UseSwissDataResult;
```

#### 3.1.2 useMatchResult Hook（新增）

**文件**：`frontend/src/hooks/useMatchResult.ts`

**职责**：
- 判断比赛胜负
- 获取获胜方/失败方
- 计算比分显示

**解决的重复**：
- `SwissMatchCard.tsx` 第 34-35 行
- `SwissMatchCardMobile.tsx` 第 36-38 行（内联判断）

```typescript
interface UseMatchResultResult {
  isFinished: boolean;
  isTeamAWinner: boolean;
  isTeamBWinner: boolean;
  winnerTeam?: Team;
  loserTeam?: Team;
}

export function useMatchResult(
  match: Match,
  teams: Team[]
): UseMatchResultResult;
```

### 3.2 主题统一

#### 3.2.1 移动端卡片主题化

**文件**：`frontend/src/components/features/swiss/SwissMatchCardMobile.tsx`

**修改内容**：
- 将硬编码颜色替换为 `SWISS_THEME` 引用
- 移动端特有样式（如字体大小）可通过主题覆盖或保留内联

**当前硬编码**：
```tsx
// 第 37-38 行
className={`text-sm font-medium ${
  match.winnerId === match.teamAId ? 'text-white' : 'text-gray-400'
}`}

// 第 48-49 行
className={`text-xl font-bold ${
  match.winnerId === match.teamAId ? 'text-[#F59E0B]' : 'text-white'
}`}
```

**优化后**：
```tsx
style={{
  color: isTeamAWinner ? SWISS_THEME.winnerText : SWISS_THEME.loserText,
}}
```

### 3.3 组件调整

#### 3.3.1 SwissStageMobile 简化

**文件**：`frontend/src/components/features/swiss/SwissStageMobile.tsx`

**当前问题**：
- 第 31-41 行：`matchesByRecord` 数据处理
- 第 46-55 行：晋级/淘汰队伍过滤
- 第 68-73 行：`renderRecordTitle` 函数
- 第 76-206 行：大量重复的 `SwissMatchCardMobile` 渲染逻辑

**优化方案**：
1. 使用 `useSwissData` Hook 替代内联数据处理
2. 提取 `renderRecordTitle` 为独立小组件或简化
3. 合并重复的渲染逻辑（第 3-5 轮的特殊处理可配置化）

**优化后结构**：
```tsx
const SwissStageMobile: React.FC<SwissStageMobileProps> = (props) => {
  const { matchesByRecord, qualifiedTeams, eliminatedTeams } = useSwissData(
    props.matches,
    props.teams,
    props.advancement
  );
  
  // 使用配置驱动渲染，减少条件判断
  return (
    <div>
      <SwissRoundTabs ... />
      {selectedRound === 6 ? (
        <SwissFinalResultMobile ... />
      ) : (
        <SwissRoundContentMobile ... />
      )}
    </div>
  );
};
```

#### 3.3.2 SwissMatchCard / SwissMatchCardMobile 共享逻辑

**方案 A：提取共享组件（推荐）**

创建 `SwissMatchCardBase` 组件，包含共享逻辑：

```tsx
// SwissMatchCardBase.tsx
interface SwissMatchCardBaseProps {
  match: Match;
  teams: Team[];
  renderContent: (props: MatchCardRenderProps) => React.ReactNode;
}
```

**方案 B：使用 Hook（更轻量）**

使用 `useMatchResult` Hook 在两端的卡片组件中分别渲染：

```tsx
// SwissMatchCard.tsx 和 SwissMatchCardMobile.tsx
const { isTeamAWinner, isTeamBWinner } = useMatchResult(match, teams);
// 各自保持独立的渲染逻辑
```

**推荐方案 B**，因为两端 UI 差异较大，提取共享组件反而增加复杂度。

### 3.4 目录结构重组

优化后的目录结构：

```
src/components/features/
├── SwissStageResponsive.tsx              # 响应式入口（不变）
├── swiss/
│   ├── pc/                               # PC 端组件目录
│   │   ├── SwissStagePC.tsx              # PC 端容器
│   │   ├── SwissRoundTree.tsx            # 树形结构
│   │   ├── SwissRecordSection.tsx        # 战绩分区
│   │   ├── SwissRecordGroup.tsx          # 战绩分组
│   │   └── SwissRoundColumn.tsx          # 轮次列
│   ├── mobile/                           # 移动端组件目录
│   │   ├── SwissStageMobile.tsx          # 移动端容器
│   │   ├── SwissRoundTabs.tsx            # 轮次标签
│   │   ├── SwissMatchCardMobile.tsx      # 比赛卡片
│   │   └── SwissFinalResultMobile.tsx    # 最终结果
│   ├── shared/                           # 共享组件目录
│   │   ├── SwissMatchCard.tsx            # PC 端比赛卡片（或移到 pc/）
│   │   ├── SwissTeamLogo.tsx             # 队伍 Logo
│   │   ├── SwissEmptyState.tsx           # 空状态
│   │   ├── SwissStatusBadge.tsx          # 状态标签
│   │   └── SwissTeamList.tsx             # 队伍列表
│   └── index.ts                          # 统一导出
├── hooks/
│   └── swiss/
│       ├── useSwissData.ts               # 瑞士轮数据 Hook
│       └── useMatchResult.ts             # 比赛结果 Hook
```

> **注意**：目录重组涉及文件移动，需要同步更新所有导入路径。建议作为独立步骤执行。

---

## 4. 实施步骤

### 步骤 1：提取 useSwissData Hook

**文件**：新建 `frontend/src/hooks/useSwissData.ts`

**内容**：
- 从 `SwissStageMobile` 和 `SwissRoundTree` 中提取 `matchesByRecord` 逻辑
- 从 `SwissStageMobile` 和 `SwissRecordSection` 中提取晋级/淘汰队伍过滤逻辑
- 添加单元测试

**影响组件**：
- `SwissStageMobile.tsx`
- `SwissRoundTree.tsx`
- `SwissRecordSection.tsx`

### 步骤 2：提取 useMatchResult Hook

**文件**：新建 `frontend/src/hooks/useMatchResult.ts`

**内容**：
- 从 `SwissMatchCard` 中提取胜负判断逻辑
- 从 `SwissMatchCardMobile` 中提取胜负判断逻辑
- 添加单元测试

**影响组件**：
- `SwissMatchCard.tsx`
- `SwissMatchCardMobile.tsx`

### 步骤 3：移动端卡片主题化

**文件**：`frontend/src/components/features/swiss/SwissMatchCardMobile.tsx`

**修改**：
- 引入 `SWISS_THEME`
- 替换硬编码颜色为 theme 引用
- 保持移动端特有的字体大小等样式

### 步骤 4：简化 SwissStageMobile

**文件**：`frontend/src/components/features/swiss/SwissStageMobile.tsx`

**修改**：
- 使用 `useSwissData` 替代内联数据处理
- 简化第 3-5 轮的特殊处理逻辑（配置化）
- 提取重复的 `SwissMatchCardMobile` 渲染为循环

### 步骤 5：简化 SwissRoundTree

**文件**：`frontend/src/components/features/swiss/SwissRoundTree.tsx`

**修改**：
- 使用 `useSwissData` 替代内联 `matchesByRecord`
- 保持 PC 端特有的列宽计算和滑动逻辑

### 步骤 6：目录重组（可选）

**操作**：
- 创建 `pc/`、`mobile/`、`shared/` 子目录
- 移动对应组件
- 更新所有导入路径
- 更新测试文件路径

**风险**：
- 需要大量文件修改
- 可能影响 Git 历史追溯
- 建议单独 PR，便于回滚

### 步骤 7：测试验证

**测试范围**：
- 瑞士轮 PC 端展示正常
- 瑞士轮移动端展示正常
- 比赛卡片点击弹框/抽屉正常
- 主题颜色显示正确
- 晋级/淘汰队伍显示正确

---

## 5. 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| Hook 提取引入 Bug | 中 | 为 Hook 编写完整单元测试，逐步替换 |
| 主题修改影响视觉 | 低 | 对比修改前后的颜色值，确保一致 |
| 目录重组导致导入错误 | 中 | 使用 IDE 自动重构，全量搜索验证 |
| 移动端特殊逻辑丢失 | 中 | 仔细对比优化前后的渲染结果 |

---

## 6. 预期收益

| 指标 | 当前 | 优化后 |
|------|------|--------|
| `matchesByRecord` 实现次数 | 2 处 | 1 处（Hook） |
| 晋级/淘汰过滤逻辑 | 3 处 | 1 处（Hook） |
| 胜负判断逻辑 | 2 处 | 1 处（Hook） |
| 移动端硬编码颜色 | 6+ 处 | 0 处（使用主题） |
| 组件目录清晰度 | 一般 | 清晰（按端分组） |

---

## 7. 实施建议

1. **分步实施**：每个步骤独立提交，便于回滚和 Code Review
2. **先 Hook 后组件**：先提取共享逻辑，再重构组件
3. **目录重组最后**：目录移动影响大，建议作为最后一步
4. **充分测试**：每步完成后运行相关测试，确保功能正常
5. **视觉回归**：主题修改后，对比 PC 和移动端视觉效果
