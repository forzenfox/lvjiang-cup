# 管理员赛程界面优化评估与计划

您提出的优化方案旨在通过更明确的**分页（Tabs）**和**轮次（Round）**区分，提升管理员的操作直观性。这与前台展示的逻辑（瑞士轮 Round 1-4，淘汰赛树状图）更加契合。

## 1. 方案评估与对比

| 特性 | 当前方案 (Filter Bar) | 目标方案 (Tabs + Rounds) | 评估结论 |
| :--- | :--- | :--- | :--- |
| **赛段切换** | 下拉菜单筛选 (All/Swiss/Elimination) | **顶部页签 (Tabs)** | **Tab 更优**。赛段是最高维度的分类，Tab 切换更符合直觉，且能显著减少页面上的无关信息干扰。 |
| **轮次展示** | 混合列表，需人工查看 `round` 字段 | **分组展示 (Grouped by Round)** | **分组更优**。将比赛按 Round X 归类展示，管理员能一眼看出哪些是第一轮，哪些是第二轮，不再需要在一长串列表中寻找。 |
| **配置便捷性** | 需手动输入或选择 Round 字段 | **上下文自动填充** | **分组更优**。在 "Round 2" 分组下新增比赛时，系统可以自动预填 "Round 2" 字段，减少操作。 |
| **视觉清晰度** | 线性列表，信息密度高但层级弱 | **分块/折叠面板** | **分块更优**。通过标题区分 Round，视觉层级更清晰。 |

**结论**：您提出的方案在**信息架构**和**操作体验**上均优于当前方案。我们将采纳该方案进行重构。

## 2. 详细设计 (Detailed Design)

### 2.1 顶层导航：Tabs
使用 `Radix UI` 或自定义的 Tabs 组件，将页面主体分为两个大标签页：
- **瑞士轮 (Swiss Stage)**
- **淘汰赛 (Elimination Stage)**

### 2.2 瑞士轮 Tab 内容
- **布局**：垂直排列 4 个区块（Round 1, Round 2, Round 3, Round 4）。
- **每个区块**：
  - 标题：例如 "Round 1 (0-0)"，"Round 2 (1-0 & 0-1)"。
  - 内容：该轮次下的 `MatchRow` 列表。
  - *可选*：每个区块底部提供 "添加本轮比赛" 按钮（本次暂不实现，仅做展示优化）。

### 2.3 淘汰赛 Tab 内容
- **布局**：按轮次分组展示（Upper Bracket R1, Upper Bracket R2... Lower Bracket... Finals）。
- 或者简单按 `eliminationGameNumber` 范围分组，或者按 `round` 字段分组。
- 考虑到淘汰赛结构的复杂性，我们可以按 **Round (日期/轮次)** 进行视觉分组。

## 3. 实施步骤

1.  **引入 Tabs 组件**：创建或使用现有的 Tab 切换逻辑。
2.  **重构 `AdminSchedule`**：
    - 移除 `ScheduleFilterBar` 中的 "Stage" 筛选（改为 Tab 切换）。
    - 移除 "Sort" 和 "Search"（或保留 Search 但仅在当前 Tab 内搜索）。
    - 根据当前激活的 Tab，渲染不同的视图组件：`SwissStageEditor` 和 `EliminationStageEditor`。
3.  **实现 `SwissStageEditor`**：
    - 将 `matches` 按 `swissDay` (1-4) 或 `round` 分组。
    - 渲染 4 个分组区块。
4.  **实现 `EliminationStageEditor`**：
    - 将 `matches` 按 `round` 或 `eliminationGameNumber` 排序并分组。
5.  **清理旧组件**：
    - 移除不再需要的 `ScheduleFilterBar` 组件及其引用。

## 4. 任务清单 (Todo)

- [ ] 创建 Tabs UI 结构，区分瑞士轮和淘汰赛
- [ ] 实现 `SwissStageEditor`：按 Round 1-4 分组展示比赛
- [ ] 实现 `EliminationStageEditor`：按轮次分组展示比赛
- [ ] 移除 `ScheduleFilterBar` 组件
