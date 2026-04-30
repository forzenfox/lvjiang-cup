# 移动端赛程对战信息抽屉改造方案

## 一、需求背景

当前移动端赛程模块中，点击对战卡片无法查看对战详情信息。PC端已存在 `MatchDetailModal` 弹框展示对战详情，但移动端体验不佳。需要参照移动端选手详情抽屉（`PlayerDetailDrawer`）的交互方式，在移动端实现底部弹出的抽屉来展示对战信息。

## 二、现状分析

### 2.1 现有组件结构

| 组件 | 路径 | 说明 |
|------|------|------|
| `ScheduleSection` | `src/components/features/ScheduleSection.tsx` | 赛程总入口，包含瑞士轮/淘汰赛 tabs |
| `SwissStage` | `src/components/features/SwissStageResponsive.tsx` | 响应式容器，区分移动端/PC端 |
| `SwissStageMobile` | `src/components/features/swiss/SwissStageMobile.tsx` | 移动端瑞士轮展示，已预留 `onMatchClick` 回调 |
| `SwissMatchCardMobile` | `src/components/features/swiss/SwissMatchCardMobile.tsx` | 移动端对战卡片，已支持 `onClick` |
| `MatchDetailModal` | `src/components/features/MatchDetailModal.tsx` | PC端对战详情弹框（Modal 形式） |
| `PlayerDetailDrawer` | `src/components/team/PlayerDetailDrawer.tsx` | 选手详情抽屉（底部滑出），可作为参考 |
| `Modal` | `src/components/ui/Modal.tsx` | 通用弹框组件（居中显示） |

### 2.2 现有交互链路

```
SwissStageMobile → SwissMatchCardMobile(onClick) → onMatchClick(match)
```

当前 `SwissStageMobile` 和 `SwissStageResponsive` 均已预留 `onMatchClick` 回调，但 `ScheduleSection` 中未传入该回调，因此点击无响应。

### 2.3 选手详情抽屉参考

`PlayerDetailDrawer` 已实现：
- 移动端：底部滑入抽屉（`y: '100%' → y: 0`），高度 `85vh`，圆角 `rounded-t-2xl`
- PC端：右侧滑入抽屉（`x: '100%' → x: 0`），固定宽度
- 遮罩层点击关闭、动画过渡、无障碍属性

## 三、改造方案

### 3.1 整体思路

采用 **"复用逻辑 + 新建抽屉组件"** 的策略：
1. 新建 `MatchDetailDrawer` 组件，参照 `PlayerDetailDrawer` 实现移动端底部抽屉交互
2. 复用 `MatchDetailModal` 中的详情展示逻辑（抽取为 `MatchDetailContent`）
3. 在 `ScheduleSection` 中接入抽屉状态管理，移动端打开抽屉，PC端保持原有弹框

### 3.2 组件改造清单

#### 3.2.1 新建 `MatchDetailContent` 组件

**路径**：`src/components/features/MatchDetailContent.tsx`

**职责**：将 `MatchDetailModal` 中的详情展示逻辑抽取为独立内容组件，供 Modal 和 Drawer 复用。

**抽取内容**：
- 对战时间和状态展示
- 对战双方头部（队名、Logo、比分、胜者标识）
- 队员对阵表（按位置排序）
- 赛制信息
- 对战数据按钮

**接口设计**：
```typescript
interface MatchDetailContentProps {
  match: Match;
  teams: Team[];
}
```

#### 3.2.2 新建 `MatchDetailDrawer` 组件

**路径**：`src/components/features/MatchDetailDrawer.tsx`

**职责**：移动端底部抽屉容器，参照 `PlayerDetailDrawer` 实现。

**核心特性**：
- 移动端：底部滑入（`y: '100%' → y: 0`），高度 `85vh`，`rounded-t-2xl`
- 遮罩层：`bg-black/60`，点击关闭
- 动画：`framer-motion`，`type: 'tween'`，`duration: 0.3`
- 内部滚动：`flex-1 overflow-y-auto`
- 关闭按钮：顶部标题栏右侧
- 无障碍：`role="dialog"`、`aria-modal="true"`

**接口设计**：
```typescript
interface MatchDetailDrawerProps {
  match: Match | null;
  teams: Team[];
  onClose: () => void;
}
```

#### 3.2.3 改造 `MatchDetailModal`

**路径**：`src/components/features/MatchDetailModal.tsx`

**改造内容**：
- 引入 `MatchDetailContent` 替换原有内联详情内容
- 保持原有 `Modal` 容器和接口不变，确保 PC 端行为不受影响

#### 3.2.4 改造 `ScheduleSection`

**路径**：`src/components/features/ScheduleSection.tsx`

**改造内容**：
- 新增状态：`selectedMatch`（当前选中的比赛）
- 新增 `handleMatchClick` 回调：设置 `selectedMatch`
- 新增 `handleCloseMatchDetail` 回调：清空 `selectedMatch`
- 传入 `onMatchClick` 给 `SwissStage` 和 `EliminationStage`
- 渲染 `MatchDetailDrawer`（移动端）和 `MatchDetailModal`（PC端）

**条件渲染逻辑**：
```
if (isMobile && selectedMatch) → 渲染 MatchDetailDrawer
if (!isMobile && selectedMatch) → 渲染 MatchDetailModal
```

#### 3.2.5 改造 `EliminationStage`

**路径**：`src/components/features/EliminationStage.tsx`

**改造内容**：
- 新增 `onMatchClick` 可选回调接口
- 在 `BracketMatchCard` 的点击事件中触发 `onMatchClick`

### 3.3 交互时序图

```
用户点击 SwissMatchCardMobile
  → SwissMatchCardMobile.onClick()
  → SwissStageMobile.onMatchClick(match)
  → SwissStageResponsive.onMatchClick(match)
  → ScheduleSection.handleMatchClick(match)
  → setSelectedMatch(match)
  → 移动端：渲染 MatchDetailDrawer（底部滑出）
  → PC端：渲染 MatchDetailModal（居中弹框）

用户点击遮罩层/关闭按钮
  → onClose()
  → setSelectedMatch(null)
  → 抽屉/弹框关闭
```

## 四、TDD 测试计划

### 4.1 单元测试

#### `MatchDetailContent.test.tsx`
- [ ] 应显示对战时间
- [ ] 无 startTime 时应显示"待定"
- [ ] 应显示对战状态（未开始/进行中/已结束）
- [ ] 应显示双方队伍名称
- [ ] 应显示比分
- [ ] 已结束比赛应显示胜者标签
- [ ] 应显示队员对阵信息
- [ ] 应显示赛制信息
- [ ] 已上传数据时应显示"对战数据"按钮

#### `MatchDetailDrawer.test.tsx`
- [ ] match 为 null 时不渲染
- [ ] 应渲染抽屉标题"对战详情"
- [ ] 应渲染遮罩层
- [ ] 点击遮罩层应调用 onClose
- [ ] 点击关闭按钮应调用 onClose
- [ ] 应渲染 MatchDetailContent 内容
- [ ] 抽屉内容区域应支持滚动

#### `ScheduleSection.test.tsx`（补充）
- [ ] 点击对战卡片应打开对战详情（移动端抽屉/PC弹框）
- [ ] 关闭详情后 selectedMatch 应为 null

### 4.2 E2E 测试

- [ ] 移动端：点击赛程对战卡片，底部抽屉滑出，展示对战详情
- [ ] 移动端：点击遮罩层或关闭按钮，抽屉收起
- [ ] PC端：点击赛程对战卡片，居中弹框展示，行为保持不变

## 五、样式规范

### 5.1 抽屉样式（参照 PlayerDetailDrawer）

| 属性 | 值 |
|------|-----|
| 背景 | `linear-gradient(145deg, #0F172A 0%, #1E293B 100%)` |
| 高度 | `85vh` |
| 圆角 | `rounded-t-2xl` |
| 阴影 | `0 25px 50px -12px rgba(0, 0, 0, 0.5)` |
| 标题栏背景 | `linear-gradient(90deg, rgba(220, 38, 38, 0.2) 0%, transparent 50%)` |
| 标题文字 | `text-base font-semibold text-slate-100` |
| 关闭按钮 | `p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg` |
| 内容区内边距 | `p-6` |
| z-index | `ZIndexLayers.NESTED_MODAL` |

### 5.2 动画参数

| 属性 | 值 |
|------|-----|
| 类型 | `tween` |
| 持续时间 | `0.3s` |
| 遮罩层淡入 | `duration: 0.2` |
| 移动端初始位置 | `y: '100%'` |
| 移动端目标位置 | `y: 0` |

## 六、文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `src/components/features/MatchDetailContent.tsx` | 对战详情内容组件 |
| 新建 | `src/components/features/MatchDetailDrawer.tsx` | 移动端对战详情抽屉 |
| 新建 | `tests/unit/components/features/MatchDetailContent.test.tsx` | 内容组件单元测试 |
| 新建 | `tests/unit/components/features/MatchDetailDrawer.test.tsx` | 抽屉组件单元测试 |
| 修改 | `src/components/features/MatchDetailModal.tsx` | 复用 MatchDetailContent |
| 修改 | `src/components/features/ScheduleSection.tsx` | 接入抽屉状态管理 |
| 修改 | `src/components/features/EliminationStage.tsx` | 新增 onMatchClick 回调 |

## 七、风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| PC端弹框行为被意外修改 | 高 | `MatchDetailModal` 保持原有接口不变，仅内部抽取 Content 组件 |
| 移动端抽屉与现有 Modal 冲突 | 中 | 使用 `ZIndexLayers.NESTED_MODAL`，确保层级正确 |
| 淘汰赛卡片点击未接入 | 中 | `EliminationStage` 同步新增 `onMatchClick` 回调 |
| 无障碍属性缺失 | 低 | 参照 `PlayerDetailDrawer` 添加 `role`、`aria-modal` 等属性 |

## 八、实施步骤

1. **抽取 `MatchDetailContent`**：从 `MatchDetailModal` 抽取详情展示逻辑
2. **新建 `MatchDetailDrawer`**：参照 `PlayerDetailDrawer` 实现移动端抽屉
3. **改造 `MatchDetailModal`**：引入 `MatchDetailContent`，确保 PC 端正常
4. **改造 `ScheduleSection`**：接入状态管理和条件渲染
5. **改造 `EliminationStage`**：接入 `onMatchClick` 回调
6. **编写单元测试**：`MatchDetailContent`、`MatchDetailDrawer`
7. **运行测试**：确保全部通过
8. **静态检查 & 格式化**：执行 `npm run lint` 和 `npm run format`
9. **自测验证**：移动端抽屉滑出/关闭正常，PC端弹框正常

---

**方案制定日期**：2026-04-30  
**参考组件**：`PlayerDetailDrawer.tsx`、`MatchDetailModal.tsx`  
**待审核人**：产品/前端负责人
