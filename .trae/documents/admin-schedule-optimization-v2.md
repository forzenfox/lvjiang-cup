# 管理员配置页面优化计划 (瑞士轮 & 淘汰赛) - V2

根据您的需求，我们将进一步优化 `SwissStageEditor` 和 `EliminationStageEditor` 的 UI 展示和交互逻辑。

## 核心优化点

1.  **瑞士轮 Round 1 简化配置**：
    -   Round 1 默认都是 0-0，无需显示或配置具体的 `swissRecord`。
    -   Round 4 标记为“积分循环赛”。
    -   其他 Round 显示具体的胜负分组信息 (1-0 & 0-1, etc.)。

2.  **瑞士轮全轮次固定化 (New)**：
    -   既然赛制是固定的 (Round 1-4)，我们可以将每个 Round 的 `swissRecord` 和 `swissDay` 在代码层面固定下来。
    -   **Round 1**: 默认 `swissRecord="0-0"`, `swissDay=1`
    -   **Round 2**: 默认 `swissDay=2`。对于 Record，因为有 1-0 和 0-1 两种可能，界面上可以提供一个快速切换或自动判定（如果能关联上一场结果）。但考虑到灵活性，管理员仍需指定是 1-0 还是 0-1 场次，或者我们通过 UI 将 Round 2 拆分为 "Round 2 High (1-0)" 和 "Round 2 Low (0-1)" 两个子区块？
    -   *更优方案*：在 Round 2 区块内，创建比赛时默认不填 Record，保存时管理员只需选择 High/Low。或者，直接将 Round 2 拆分为两个子列表，管理员在 "High Pool" 点击添加，就自动填入 1-0。

3.  **淘汰赛 Round 区分**：
    -   使用 `Round X` 来进行视觉分组，方便管理员配置。

4.  **信息层级优化**：
    -   移除无用的 "Day X" 描述。
    -   将 (0-0), (1-0 & 0-1) 等信息作为 Round 的补充说明展示。

## 实施步骤

### 1. 修改 `SwissStageEditor.tsx`

-   **细化分组逻辑**：
    -   不再只是 Round 1-4 四个大组。
    -   建议拆分为更细的“池 (Pool)”：
        -   **Round 1 (0-0)**
        -   **Round 2 High (1-0)**
        -   **Round 2 Low (0-1)**
        -   **Round 3 High (2-0 晋级战)** -> *注：通常 2-0 直接晋级，但在本赛制中可能有排位战？根据之前代码，2-0 直接晋级。所以 Round 3 是 1-1 和 0-2。*
        -   **Round 3 Mid (1-1)**
        -   **Round 3 Low (0-2 生死战)**
        -   **Round 4 (1-2 积分循环)**
-   **固定配置**：
    -   在每个子区块中创建/编辑比赛时，`swissRecord` 和 `swissDay` 字段自动锁定或隐藏。

### 2. 修改 `MatchRow.tsx` (针对 Swiss Stage)

-   **智能默认值**：
    -   在编辑模式下，如果检测到是 Swiss Stage，且父组件传入了固定的 `swissRecord`，则隐藏该字段的编辑框，直接使用默认值。

### 3. 修改 `EliminationStageEditor.tsx`

-   **细化分组**：
    -   保持 Winners/Losers/Finals 大组。
    -   在组内增加 `Round` 标签或排序优化。

## 任务清单

- [ ] 重构 `SwissStageEditor`：按详细的 Pool (0-0, 1-0, 0-1...) 分组展示。
- [ ] 优化 `MatchRow`：支持传入 `fixedSwissRecord` 属性，锁定/隐藏编辑项。
- [ ] 优化 `EliminationStageEditor`：微调分组展示。
