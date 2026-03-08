# 管理员赛程界面优化计划

目前赛程管理界面（`AdminSchedule`）采用卡片式布局，每场比赛占用空间大，缺乏筛选和批量操作能力，且没有自动晋级逻辑。本计划旨在重构该界面，提升管理员操作效率。

## 1. 界面重构 (UI Refactor)

### 1.1 布局调整
-   **放弃卡片流布局**：改为更紧凑的 **表格/列表 (Table/List)** 视图，一屏展示更多比赛信息。
-   **顶部工具栏 (Toolbar)**：
    -   **筛选器 (Filters)**：
        -   赛段 (Stage): 全部 / 瑞士轮 / 淘汰赛
        -   状态 (Status): 未开始 / 进行中 / 已结束
        -   搜索 (Search): 输入队伍名称快速查找
    -   **排序 (Sort)**：按时间 正序/倒序。
    -   **批量操作 (Batch Actions)**（可选）：一键保存所有修改。

### 1.2 列表行设计 (Match Row)
每行包含以下列：
-   **时间/轮次**：显示 `startTime` 和 `round`，点击可编辑。
-   **对阵双方**：
    -   Team A (下拉选择) - Score A (输入框)
    -   VS
    -   Score B (输入框) - Team B (下拉选择)
    -   *高亮显示胜者*
-   **状态**：下拉选择，或快捷按钮（如 "开始", "结束"）。
-   **晋级信息**（仅淘汰赛）：显示 "胜者 -> G5", "败者 -> G3" 等提示。
-   **操作**：保存按钮、重置按钮。

## 2. 功能增强 (Feature Enhancement)

### 2.1 快捷操作与状态流转
-   **自动计算胜者**：当输入比分且状态改为 "Finished" 时，自动根据比分设置 `winnerId`。
-   **一键结束**：提供 "结束比赛" 按钮，点击后自动设置状态为 Finished 并计算胜者。

### 2.2 淘汰赛自动晋级 (Auto-Advance)
-   当淘汰赛的一场比赛结束并产生胜者时，自动检测该比赛的 `nextMatchId` 和 `nextMatchSlot`。
-   自动将胜者填入下一场比赛的对应位置（Team A 或 Team B）。
-   对于败者组逻辑（`previousMatchIds`），如果 mock 数据支持，也尝试自动填充败者到对应比赛。

## 3. 代码结构调整

### 3.1 组件拆分
-   `ScheduleFilterBar`: 包含搜索、筛选、排序控件。
-   `MatchList`: 渲染比赛列表。
-   `MatchRow`: 单行比赛编辑组件。

### 3.2 逻辑优化
-   在 `AdminSchedule` 中集中处理 `updateMatch` 逻辑，包括级联更新（Cascading Update）下一场比赛的逻辑。

## 4. 实施步骤

1.  **创建组件**：在 `src/pages/admin/components` 下创建 `ScheduleFilterBar.tsx` 和 `MatchRow.tsx`。
2.  **重构主页面**：修改 `src/pages/admin/Schedule.tsx`，引入新组件，替换原有的 `MatchEditor`。
3.  **实现筛选逻辑**：在主页面实现多条件筛选。
4.  **实现自动晋级**：编写 `handleMatchFinish` 函数，处理胜者晋级逻辑。

## 5. 任务清单 (Todo)

- [ ] 创建 `ScheduleFilterBar` 组件
- [ ] 创建 `MatchRow` 组件 (支持行内编辑)
- [ ] 重构 `AdminSchedule` 页面布局
- [ ] 实现淘汰赛自动晋级逻辑
