# 层级式故障级联调试复盘

> 基于 MatchDataPage 雷达图测试修复过程的完整复盘。
> 记录一次典型的"修了一个 bug 又出现另一个"的循环调试经历，以及从中提炼的方法论。

---

## 目录

1. [背景](#1-背景)
2. [问题描述](#2-问题描述)
3. [调试过程还原](#3-调试过程还原)
4. [根因分析](#4-根因分析)
5. [方法论提炼](#5-方法论提炼)
6. [预防措施](#6-预防措施)
7. [附录：关键代码与文件](#7-附录关键代码与文件)

---

## 1. 背景

### 项目概况

- **项目类型**：Monorepo 架构（npm workspaces），前端 React + Vite + Vitest，后端 NestJS + Jest
- **测试框架**：前端使用 Vitest + @testing-library/react + jsdom
- **目标组件**：`MatchDataPage` — 比赛数据详情页面，包含选手列表、雷达图等复杂交互

### 触发场景

在 CI 流程中运行全量测试时，雷达图相关的 7 个测试用例全部失败。修复过程中出现了典型的"层级式故障级联"——每修复一个问题，运行测试后立刻出现新的失败，形成调试循环。

---

## 2. 问题描述

### 测试目标

验证 `MatchDataPage` 组件中雷达图的展开/收起/切换行为：

| 测试 | 描述 |
|------|------|
| 测试 1-5 | 点击各位置（TOP/JUNGLE/MID/ADC/SUPPORT）选手行，验证对应维度的雷达图展开 |
| 测试 6 | 点击同一选手行两次，验证雷达图收起 |
| 测试 7 | 依次点击不同位置选手行，验证雷达图切换 |

### 初始失败现象

所有 7 个测试在 `findByText` 断言处失败，错误信息为"找不到元素"。

---

## 3. 调试过程还原

### 第 1 轮：文本匹配问题

**现象**：`findByText('分均补刀')` 报错找不到元素

**排查**：
1. 检查 RadarChart 组件的渲染逻辑
2. 发现维度标签渲染为 `{dim.label}{getDimensionUnit(dim.key)}`
3. 实际 DOM 文本是 `"分均补刀/min"` 而非 `"分均补刀"`

**修复**：改用正则匹配 `findByText(/分均补刀/)`

**结果**：仍然失败，但错误信息变为"找不到元素"（而非文本不匹配）

---

### 第 2 轮：组件未渲染

**现象**：改为正则后仍然失败，`findByText('选手A1')` 都找不到

**排查**：
1. 输出 `screen.debug()` 查看 DOM
2. 发现页面处于加载状态，选手数据未渲染
3. 检查数据流：`MatchDataPage` 通过 `useParams()` 获取 matchId，然后调用 API 加载数据
4. 发现测试使用了 `vi.mock('react-router-dom')` 模拟路由
5. Mock 实现中 `useParams` 返回 `{ id: '123' }`，但 `handleTogglePosition` 回调通过 `useCallback` 闭包捕获了 `gameData`
6. 由于 mock 破坏了 React Router 的正常数据流，`gameData` 始终为 null

**关键代码**：
```typescript
// 问题：vi.mock 导致 useParams 行为异常
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '123' }),
  useSearchParams: () => [new URLSearchParams('game=1'), vi.fn()],
  useNavigate: () => vi.fn(),
}));

// handleTogglePosition 中的守卫条件阻断
const handleTogglePosition = useCallback((position: string) => {
  if (gameData && matchId) {  // ← gameData 为 null，永远不会执行
    setExpandedPosition(newPosition);
  }
}, [expandedPosition, gameData, matchId, currentGameNumber]);
```

**修复**：改用 `MemoryRouter` + `Routes` + `Route` 真实路由渲染

```typescript
const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/match/123']}>
      <Routes>
        <Route path="/match/:id" element={<MatchDataPage />} />
      </Routes>
    </MemoryRouter>
  );
```

**结果**：组件正常渲染，选手数据加载成功，但点击选手行后雷达图未展开

---

### 第 3 轮：事件触发问题

**现象**：组件渲染了，选手行可见，但点击后雷达图未出现

**排查**：
1. 在 `handleTogglePosition` 中添加日志，确认是否被调用
2. 发现 `fireEvent.click` 在某些情况下不能正确触发 React 合成事件
3. 特别是在 jsdom 环境下，`fireEvent.click` 对复杂 DOM 结构的事件触发不完整

**修复**：改用原生 `(element as HTMLElement).click()`

**结果**：点击生效，雷达图展开，但 `findByText` 报错"找到多个元素"

---

### 第 4 轮：jsdom CSS 限制

**现象**：`findByText(/分均补刀/)` 报错找到 4 个元素（期望 1 个）

**排查**：
1. 输出 `screen.debug()` 查看完整 DOM
2. 发现 RadarChart 组件有三个渲染面板：
   - `renderLeftPanel()` — 使用 `hidden md:flex`（桌面端左侧）
   - `renderRightPanel()` — 使用 `hidden md:flex`（桌面端右侧）
   - `renderMobilePanel()` — 使用 `md:hidden grid`（移动端）
3. jsdom **不计算 CSS**，所以 `hidden` 类无效，三个面板**全部可见**
4. 每个维度标签出现 4 次（左侧 + 右侧 + 移动端红方 + 移动端蓝方）

**修复**：改用 `findAllByText` + `expect().length.toBeGreaterThan(0)`

```typescript
const csTexts = await screen.findAllByText(/分均补刀/);
expect(csTexts.length).toBeGreaterThan(0);
```

**结果**：测试 1-5 通过，测试 6（收起）和测试 7（切换）仍然失败

---

### 第 5 轮：状态转换问题

**现象**：测试 6（点击同一行收起）和测试 7（点击不同行切换）失败

**排查**：
1. 测试 6：第一次点击展开成功，第二次点击后 `queryAllByText(/分均补刀/)` 仍返回非零
2. 测试 7：点击 TOP 展开成功，点击 JUNGLE 后 `findAllByText(/分均插眼/)` 失败

**根因分析**：
- 测试 6 的收起逻辑：`handleTogglePosition` 中 `expandedPosition === position ? null : position`，第二次点击时 `expandedPosition` 为 `'TOP'`，应设为 `null`
- 但 `handleTogglePosition` 通过 `useCallback` 捕获了 `expandedPosition` 的闭包值
- 第一次点击后 `setExpandedPosition('TOP')` 触发重渲染，`handleTogglePosition` 重新创建
- 但 `PlayerStatsList` 组件接收的 `onToggle` 回调可能没有及时更新

**修复**：增加 `waitFor` 等待 DOM 更新，确保状态变更后的重渲染完成

```typescript
// 第二次点击收起
(topPlayerRow as HTMLElement).click();
// 等待 React 状态更新和重渲染
await waitFor(() => {
  expect(screen.queryAllByText(/分均补刀/).length).toBe(0);
});
```

**最终结果**：全部 7 个测试通过。

---

## 4. 根因分析

### 4.1 直接原因

| 层级 | 问题 | 根因 |
|------|------|------|
| L0 环境 | jsdom 不计算 CSS | 测试环境限制，`hidden` 类无效 |
| L1 渲染 | 组件未挂载 | 路由 mock 破坏了数据流 |
| L2 数据 | gameData 为 null | mock 导致 useParams 行为异常 |
| L3 交互 | 点击不生效 | fireEvent.click 在 jsdom 下不可靠 |
| L4 断言 | 找到多个元素 | 三个面板同时可见 |
| L5 边界 | 状态转换失败 | 闭包陈旧 + 异步时序 |

### 4.2 根本原因

**层级式故障级联**：6 个问题层层堆叠，每个问题都完全掩盖了下一层。从表面看只有一个错误（`findByText` 找不到元素），但实际上背后隐藏了 5 层不同性质的问题。

**为什么无法提前预见**：
1. **环境差异**：jsdom 不是真实浏览器，CSS 不计算、事件系统有差异
2. **Mock 副作用**：`vi.mock('react-router-dom')` 看似无害，但破坏了整个数据流
3. **依赖链长**：断言 → 渲染 → 状态 → 事件 → 数据 → 路由 → 环境，7 层依赖

### 4.3 关键教训

1. **DOM 不会说谎**：如果早期就输出 `screen.debug()`，会立刻发现组件根本没渲染，不会浪费时间调 `findByText`
2. **能不 mock 就不 mock**：`MemoryRouter` 比 `vi.mock('react-router-dom')` 更接近真实环境
3. **从上游到下游调试**：环境层的问题不解决，下游的调试都是徒劳

---

## 5. 方法论提炼

### 5.1 依赖链地图

遇到复杂调试问题时，第一步是画出依赖链地图：

```
断言: findByText(/分均补刀/)
  └── 组件渲染: RadarChart
       └── 条件渲染: isExpanded && <RadarChart>
            └── 状态更新: setExpandedPosition
                 └── 事件触发: handleTogglePosition
                      └── 守卫条件: if (gameData && matchId)
                           └── 数据加载: getMatchGameData
                                └── 路由参数: useParams
                                     └── 路由环境: MemoryRouter
                                          └── 测试渲染: render()
```

### 5.2 逐层验证法

从依赖链的**最上游**开始逐层验证：

| 层级 | 验证内容 | 验证方法 | 本次案例的发现 |
|------|---------|---------|--------------|
| L0 环境 | 测试配置、mock 风险 | 检查 vitest.config、setup 文件 | jsdom 不计算 CSS |
| L1 渲染 | 组件是否挂载 | `screen.debug()` | 组件未渲染（路由 mock 问题） |
| L2 数据 | 数据是否正确加载 | 检查 mock 返回值、守卫条件 | `gameData` 为 null |
| L3 交互 | 事件能否触发状态更新 | 在回调中加日志 | `fireEvent.click` 不生效 |
| L4 断言 | 选择器是否匹配实际 DOM | 对比 DOM 快照 | 多面板导致匹配歧义 |
| L5 边界 | 状态转换是否正常 | 测试收起、切换场景 | 闭包陈旧 + 异步时序 |

### 5.3 Mock 风险评估

每次使用 `vi.mock` 前，评估它可能破坏的依赖链：

| Mock 对象 | 风险等级 | 可能破坏的链路 | 更安全的替代方案 |
|-----------|---------|---------------|-----------------|
| `react-router-dom` | 🔴 高 | `useParams`、`useNavigate`、`useSearchParams` | `MemoryRouter` + `Routes` |
| 第三方 UI 库 | 🟡 中 | 动画、样式、事件 | 简化 mock |
| API 层 | 🟢 低 | 数据获取 | 直接 mock 返回值 |
| 工具函数 | 🟢 低 | 纯计算逻辑 | 直接 mock 返回值 |

### 5.4 调试决策树

```
测试失败 →
  DOM 为空？
    ├── 是 → 检查渲染层
    │        ├── 组件未挂载 → 检查路由/mock
    │        └── 组件挂载但内容空 → 检查数据层
    │
    └── 否 → DOM 有内容但断言失败
             ├── 找不到元素 → 检查选择器 vs 实际 DOM
             ├── 找到多个元素 → 检查 CSS/hidden 类（jsdom 限制）
             └── 文本不匹配 → 检查 exact 匹配 + 格式化逻辑

状态转换失败 →
  ├── 闭包陈旧 → 检查 useCallback 依赖数组
  ├── 守卫条件阻断 → 检查 if(x && y) 类条件
  └── 异步时序 → 检查 await/waitFor 等待
```

---

## 6. 预防措施

### 6.1 测试编写规范

1. **优先使用真实实现**：能用 `MemoryRouter` 就不用 `vi.mock('react-router-dom')`
2. **避免精确文本匹配**：当文本可能包含动态内容（如单位、格式化值）时，使用正则匹配
3. **考虑 jsdom 限制**：响应式类（`hidden md:flex`）在 jsdom 中无效，使用 `findAllByText` 替代 `findByText`
4. **使用原生 click**：在 jsdom 环境下，`(element as HTMLElement).click()` 比 `fireEvent.click` 更可靠

### 6.2 调试流程规范

1. **先看 DOM**：遇到测试失败，第一步永远是 `screen.debug()`
2. **从上游到下游**：环境 → 渲染 → 数据 → 交互 → 断言，逐层验证
3. **一次只改一层**：确认当前层问题修复后，再进入下一层
4. **记录每层结论**：每层验证后记录"通过/不通过"及证据

### 6.3 代码审查清单

在提交涉及测试修改的代码前，检查：

- [ ] 是否使用了 `vi.mock` 模拟核心库（路由、状态管理）？能否用真实实现替代？
- [ ] 测试断言是否考虑了 jsdom 的环境限制？
- [ ] 事件触发方式是否在 jsdom 下可靠？
- [ ] 异步操作是否有适当的等待机制？
- [ ] 测试之间是否有共享的可变状态？

---

## 7. 附录：关键代码与文件

### 涉及的文件

| 文件 | 作用 | 修改内容 |
|------|------|---------|
| `frontend/tests/unit/components/features/match-data/MatchDataPage.radar.test.tsx` | 雷达图测试 | 路由渲染方式、事件触发、断言方式 |
| `frontend/src/components/features/match-data/MatchDataPage.tsx` | 页面组件 | 分析对象，未修改 |
| `frontend/src/components/features/match-data/RadarChart.tsx` | 雷达图组件 | 分析对象，未修改 |
| `frontend/src/components/features/match-data/PlayerStatsList.tsx` | 选手列表 | 分析对象，未修改 |
| `frontend/tests/setup.tsx` | 测试环境配置 | 分析对象，未修改 |

### 最终修复的测试代码结构

```typescript
// 使用 MemoryRouter 替代 vi.mock('react-router-dom')
const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/match/123']}>
      <Routes>
        <Route path="/match/:id" element={<MatchDataPage />} />
      </Routes>
    </MemoryRouter>
  );

// 使用原生 click 替代 fireEvent.click
(topPlayerRow as HTMLElement).click();

// 使用 findAllByText + 正则 替代 findByText + 精确匹配
const csTexts = await screen.findAllByText(/分均补刀/);
expect(csTexts.length).toBeGreaterThan(0);

// 使用 waitFor 处理异步状态更新
await waitFor(() => {
  expect(screen.queryAllByText(/分均补刀/).length).toBe(0);
});
```

---

> 复盘时间：2026-05-15
> 适用场景：前端组件测试中的层级式故障级联调试
> 相关文档：[Skill 创建指南](./skill-creation-guide.md)