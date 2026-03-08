# 淘汰赛 UI 改造计划 (修正版)

根据用户提供的最新赛程截图，赛制为 **6支队伍的双败淘汰制**（而非标准的8支队伍）。
赛程共包含 8 场比赛（Game 1 - Game 8），具体流程如下：

## 1. 赛程结构分析

### 参赛队伍

* **胜者组起步 (Upper Bracket Starters)**: 驴酱, 雨酱, IC, 小熊 (瑞士轮 2-0 和 2-1 的队伍)

* **败者组起步 (Lower Bracket Starters)**: PLG, 69 (瑞士轮 2-2 的队伍，或特定排名的队伍)

### 比赛流转 (Flow)

1. **G1 (11.17)**: 驴酱 vs 雨酱 -> 胜者进 G5，败者进 G3。
2. **G2 (11.18)**: IC vs 小熊 -> 胜者进 G5，败者进 G4。
3. **G3 (11.19)**: PLG (等待) vs G1败者 -> 胜者进 G6。
4. **G4 (11.20)**: 69 (等待) vs G2败者 -> 胜者进 G6。
5. **G5 (11.21)**: G1胜者 vs G2胜者 -> 胜者进 G8 (胜者组冠军)，败者进 G7。
6. **G6 (11.21)**: G3胜者 vs G4胜者 -> 胜者进 G7。
7. **G7 (11.22)**: G6胜者 vs G5败者 -> 胜者进 G8 (败者组冠军)。
8. **G8 (11.23)**: G5胜者 vs G7胜者 -> 决出总冠军。

## 2. 数据层改造 (Mock Data)

修改 `src/mock/data.ts` 中的 `eliminationMatches`，精确定义这 8 场比赛。
需要确保每场比赛的 `id`, `startTime`, `round` (如 "Game 1"), `teamAId`, `teamBId` 以及 `nextMatchId` 等字段准确无误。

## 3. 组件改造

### 3.1 `BracketMatchCard.tsx`

* **样式适配**：

  * **保持现有暗色主题**：背景使用 `bg-gray-800/90` 或 `bg-card`，文字使用 `text-foreground`，高亮色使用 `lvmao.gold` (#F59E0B)。

  * **结构微调**：

    * 紧凑布局：减小内边距，适应密集排版。

    * 状态标识：清晰展示“胜者”高亮（金色文字/边框）。

    * 标签显示：在卡片上方或侧边显示 "Game X" 标识。

  * **交互**：保留 hover 效果，增加点击查看详情/视频的入口。

### 3.2 `EliminationStage.tsx`

* **布局重构**：

  * 采用 **CSS Grid** 或 **绝对定位** 来实现这个非对称的 6 队双败结构。

  * **布局分区**：

    * **第一列 (Round 1)**:

      * 上：G1 (驴酱 vs 雨酱)

      * 中上：G2 (IC vs 小熊)

      * 中下：G3 (PLG vs G1败者)

      * 下：G4 (69 vs G2败者)

    * **第二列 (Round 2)**:

      * 上：G5 (G1胜 vs G2胜)

      * 下：G6 (G3胜 vs G4胜)

    * **第三列 (Round 3)**:

      * 下：G7 (G5败 vs G6胜)

    * **第四列 (Finals)**:

      * 上：G8 (G5胜 vs G7胜)

* **连接线绘制**：

  * 使用 SVG 或 div border 绘制复杂的连接线，特别是：

    * G1/G2 败者掉落到 G3/G4 的折线。

    * G5 败者掉落到 G7 的折线。

    * G6 胜者连接到 G7。

  * **线条样式**：使用 `border-gray-600` 或更细的线条，确保在深色背景下清晰可见。

## 4. 实施步骤

1. **Mock 数据更新**：重写 `eliminationMatches` 数组，匹配截图中的对阵和时间。
2. **UI 布局实现**：在 `EliminationStage` 中构建新的网格布局。
3. **连线实现**：添加连接线组件或 SVG 路径。
4. **样式微调**：确保整体视觉风格与 `Layout.tsx` 和 `tailwind.config.js` 定义的 **深蓝/金色主题** 保持一致，而非照搬截图的浅色背景。

## 5. 任务清单 (Todo)

* [ ] 重写 `src/mock/data.ts` 中的 `eliminationMatches` 数据 (G1-G8)

* [ ] 更新 `BracketMatchCard.tsx` 适配暗色主题和紧凑布局

* [ ] 重构 `EliminationStage.tsx` 实现 6 队双败布局

* [ ] 绘制符合暗色风格的连接线

