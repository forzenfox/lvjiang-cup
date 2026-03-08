# 淘汰赛 UI 优化计划

根据用户最新的反馈和截图，需要对淘汰赛 UI 进行以下精简和优化：

## 1. 需求分析

1.  **移除 "Game X" 显示**：不再在比赛卡片旁显示 "Game 1", "Game 2" 等场次编号。
2.  **移除 "视频" 按钮**：比赛卡片上只保留 "数据" 按钮（或根据后续需求调整），移除 "视频" 回放按钮。
3.  **移除冠军展示**：删除总决赛后方原本用于展示冠军（小熊/Crown Icon）的 UI 元素。

## 2. 修改文件

### 2.1 `src/components/features/BracketMatchCard.tsx`

-   **移除 Props**：删除 `gameLabel` 属性定义。
-   **移除渲染逻辑**：删除渲染 `gameLabel` 的 JSX 代码（原位于卡片左侧）。
-   **移除按钮**：删除底部的 "视频" 按钮代码 `<button>...视频...</button>`。

### 2.2 `src/components/features/EliminationStage.tsx`

-   **修改调用**：在调用 `renderMatch` 时，不再传递 "Game X" 字符串，或者修改 `renderMatch` 函数签名以移除 `label` 参数。
-   **移除冠军元素**：删除 `g8` 渲染后的冠军展示代码块（包含 `Crown` 图标和 `motion.div` 动画的部分）。

## 3. 实施步骤

1.  修改 `BracketMatchCard.tsx`，清理 `gameLabel` 和视频按钮。
2.  修改 `EliminationStage.tsx`，清理 `renderMatch` 的参数传递和冠军展示逻辑。
3.  验证 UI 是否整洁且符合要求。

## 4. 任务清单 (Todo)

- [ ] 修改 `BracketMatchCard.tsx` (移除 Game Label 和 视频按钮)
- [ ] 修改 `EliminationStage.tsx` (移除 Game 参数传递和冠军展示)
