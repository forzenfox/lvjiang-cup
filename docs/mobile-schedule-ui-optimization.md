# 移动端赛程管理UI优化方案

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| **文档版本** | v1.0 |
| **编写日期** | 2026-04-27 |
| **涉及模块** | 移动端赛程管理（瑞士轮/淘汰赛） |
| **目标平台** | 移动端（max-width: 767px） |
| **相关组件** | SwissStageMobile, SwissRoundTabs, SwissMatchCardMobile, SwissFinalResultMobile |

---

## 2. 现状分析

### 2.1 组件架构

```
SwissStageMobile (移动端瑞士轮主容器)
├── SwissRoundTabs (轮次切换标签栏) ← 核心优化目标
│   ├── 水平滑动容器 (overflow-x-auto)
│   ├── 渐变遮罩 (左右两侧)
│   └── 标签按钮 (1-5轮 + 最终结果)
├── SwissMatchCardMobile (比赛卡片) ← 核心优化目标
│   ├── 左侧队伍 (队标+名称)
│   ├── 中间比分 (大字体)
│   └── 右侧队伍 (队标+名称)
└── SwissFinalResultMobile (最终结果)
    ├── 晋级队伍列表
    └── 淘汰队伍列表
```

### 2.2 截图问题清单

基于UI截图分析，当前存在以下问题：

| 序号 | 问题类别 | 具体问题 | 严重程度 |
|------|----------|----------|----------|
| 1 | 文字截断 | 轮次导航栏"第五轮"显示为"第五" | 🔴 高 |
| 2 | 视觉层次 | 比分数字过大（text-2xl），喧宾夺主 | 🟡 中 |
| 3 | 颜色不一致 | 获胜方名称黄色，失败方灰色，缺乏统一性 | 🟡 中 |
| 4 | 间距问题 | 卡片内边距过大（p-4），一屏显示内容少 | 🟡 中 |
| 5 | 选中态不明显 | 轮次标签选中状态对比度低 | 🟡 中 |
| 6 | 滚动指示 | 水平滚动无明确提示，用户不知道可滑动 | 🟢 低 |
| 7 | 底部导航 | 底部Tab选中态视觉反馈弱 | 🟢 低 |

---

## 3. 优化方案

### 3.1 轮次导航栏优化 (SwissRoundTabs)

#### 问题1：文字截断修复

**现状**：标签使用 `px-4 py-2.5` 固定内边距，在窄屏下文字被截断。

**优化方案**：
- 标签最小宽度改为 `min-w-[64px]`
- 字体大小调整为 `text-xs`（窄屏）/ `text-sm`（宽屏）
- 添加 `title` 属性显示完整文字

```tsx
// 优化后代码示例
<button
  className={`
    flex-shrink-0 px-3 py-2 rounded font-medium whitespace-nowrap 
    transition-all duration-200 min-h-[44px] min-w-[64px]
    text-xs sm:text-sm
    ${selectedRound === round.round
      ? 'bg-[#1E3A8A] text-white shadow-lg shadow-blue-500/20 border-b-2 border-[#F59E0B]'
      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }
  `}
  title={round.label} // 添加完整标签提示
>
  {round.label}
</button>
```

#### 问题5：选中状态增强

**优化方案**：
- 选中标签添加底部指示条（已部分实现，需增强）
- 未选中标签增加微妙的边框区分
- 添加过渡动画使切换更流畅

```tsx
// 优化后选中态
selectedRound === round.round
  ? 'bg-[#1E3A8A] text-white shadow-lg shadow-blue-500/20 border-b-2 border-[#F59E0B] scale-[1.02]'
  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-transparent hover:border-gray-600'
```

#### 问题6：滚动指示优化

**优化方案**：
- 右侧添加"更多"指示点或箭头图标
- 当内容溢出时显示滚动提示
- 支持手势滑动时显示视觉反馈

```tsx
// 添加滚动指示器组件
const ScrollIndicator = () => (
  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 animate-pulse">
    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
  </div>
);
```

### 3.2 比赛卡片优化 (SwissMatchCardMobile)

#### 问题2：比分字体过大

**现状**：比分使用 `text-2xl font-bold`，在移动端过于突出。

**优化方案**：
- 比分字体缩小为 `text-xl`
- 获胜方比分使用品牌色高亮，而非纯黄色
- 添加"BO3"等赛制标识

```tsx
// 优化后比分显示
<div className="flex-1 flex items-center justify-center gap-1">
  <span className={`text-xl font-bold ${match.winnerId === match.teamAId ? 'text-[#F59E0B]' : 'text-white'}`}>
    {match.scoreA ?? '--'}
  </span>
  <span className="text-gray-500 text-sm">:</span>
  <span className={`text-xl font-bold ${match.winnerId === match.teamBId ? 'text-[#F59E0B]' : 'text-white'}`}>
    {match.scoreB ?? '--'}
  </span>
  {match.boFormat && (
    <span className="text-[10px] text-gray-500 ml-1">{match.boFormat}</span>
  )}
</div>
```

#### 问题3：颜色统一性

**优化方案**：
- 所有队伍名称统一使用白色
- 获胜方使用品牌金色 `#F59E0B` 仅用于比分
- 失败方名称使用 `text-gray-400` 降低视觉权重

```tsx
// 优化后队伍名称样式
<span className={`text-sm font-medium ${
  match.winnerId === match.teamAId ? 'text-white' : 'text-gray-400'
}`}>
  {teamA?.name || '待定'}
</span>
```

#### 问题4：间距优化

**优化方案**：
- 卡片内边距从 `p-4` 调整为 `p-3`
- 队标大小从 `48px` 调整为 `40px`
- 队伍名称与队标间距从 `gap-1` 调整为 `gap-0.5`
- 卡片间距从 `space-y-2` 调整为 `space-y-1`

```tsx
// 优化后卡片结构
<div className="flex flex-col items-center p-3 bg-[#0F172A] border-b border-[#1E293B]">
  <div className="flex items-center gap-3 w-full">
    <div className="flex flex-col items-center gap-0.5">
      <SwissTeamLogo team={teamA} size={40} />
      <span className="text-sm font-medium">{teamA?.name}</span>
    </div>
    {/* 比分区域 */}
    <div className="flex flex-col items-center gap-0.5">
      <SwissTeamLogo team={teamB} size={40} />
      <span className="text-sm font-medium">{teamB?.name}</span>
    </div>
  </div>
</div>
```

### 3.3 整体布局优化

#### 战绩分组标题优化

**现状**：战绩标题使用 `text-sm text-gray-400 mb-2`，视觉权重不足。

**优化方案**：
- 添加左侧边框指示器增强视觉层级
- 使用更明显的背景色区分不同分组

```tsx
// 优化后战绩分组标题
<h4 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 pl-3 border-l-2 border-[#F59E0B]">
  第三轮 2-0
  <span className="text-xs text-gray-500">晋级组</span>
</h4>
```

#### 空状态与加载状态

**现状**：已存在 `MatchDataEmptyState` 和 `MatchDataSkeleton` 组件。

**优化建议**：
- 在 `SwissStageMobile` 中集成空状态展示
- 添加下拉刷新功能（Pull-to-Refresh）

```tsx
// 添加下拉刷新支持
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const SwissStageMobile: React.FC<SwissStageMobileProps> = ({
  matches,
  teams,
  onRefresh,
  // ...其他props
}) => {
  const { isRefreshing, pullProps } = usePullToRefresh(onRefresh);
  
  return (
    <div {...pullProps}>
      {isRefreshing && <RefreshIndicator />}
      {/* 原有内容 */}
    </div>
  );
};
```

### 3.4 交互体验优化

#### 底部导航增强

**优化方案**：
- 选中图标使用品牌色填充
- 添加微动画（缩放/位移）增强反馈
- 标签文字选中时加粗

```tsx
// 底部导航选中态示例
<div className={`
  flex flex-col items-center gap-1 transition-all duration-200
  ${isActive ? 'text-[#F59E0B] scale-105' : 'text-gray-500'}
`}>
  <Icon className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} />
  <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>赛程</span>
</div>
```

#### 点击反馈优化

**优化方案**：
- 卡片点击时添加 `active:scale-[0.98]` 微缩放
- 添加 `touch-feedback` 类优化触摸反馈
- 减少点击延迟（`touch-action: manipulation`）

```tsx
// 优化后卡片点击态
<div 
  className="active:scale-[0.98] transition-transform duration-100 touch-manipulation"
  onClick={onClick}
>
  {/* 卡片内容 */}
</div>
```

---

## 4. 实现计划

### 4.1 任务拆分

| 序号 | 任务 | 涉及文件 | 优先级 | 预估工时 |
|------|------|----------|--------|----------|
| 1 | 修复轮次标签文字截断 | SwissRoundTabs.tsx | 🔴 高 | 2h |
| 2 | 优化比分字体和颜色 | SwissMatchCardMobile.tsx | 🟡 中 | 2h |
| 3 | 调整卡片间距和尺寸 | SwissMatchCardMobile.tsx | 🟡 中 | 1.5h |
| 4 | 增强选中态视觉反馈 | SwissRoundTabs.tsx | 🟡 中 | 1.5h |
| 5 | 添加滚动指示器 | SwissRoundTabs.tsx | 🟢 低 | 2h |
| 6 | 优化战绩分组标题 | SwissStageMobile.tsx | 🟢 低 | 1h |
| 7 | 集成下拉刷新 | SwissStageMobile.tsx + hooks | 🟢 低 | 3h |
| 8 | 添加空状态处理 | SwissStageMobile.tsx | 🟢 低 | 1h |

### 4.2 TDD测试计划

根据项目规范，所有修改需遵循TDD方法：

```
测试文件清单：
├── SwissRoundTabs.test.tsx
│   ├── 应正确渲染所有轮次标签
│   ├── 选中态样式应正确应用
│   ├── 文字不应被截断（最小宽度测试）
│   └── 点击应触发onRoundChange
├── SwissMatchCardMobile.test.tsx
│   ├── 应正确显示队伍信息
│   ├── 获胜方应高亮显示
│   ├── 比分字体大小应符合规范
│   └── 点击应触发onClick
└── SwissStageMobile.test.tsx
    ├── 应正确按轮次分组显示
    ├── 空状态应显示提示
    └── 下拉刷新应触发onRefresh
```

### 4.3 视觉回归测试点

| 测试项 | 基准截图 | 验收标准 |
|--------|----------|----------|
| iPhone SE (375px) | 截图对比 | 所有文字完整显示，无截断 |
| iPhone 14 (390px) | 截图对比 | 布局正常，间距合理 |
| iPhone 14 Pro Max (430px) | 截图对比 | 视觉层次清晰 |
| 深色模式 | 截图对比 | 对比度符合WCAG 2.1 AA标准 |

---

## 5. 设计规范更新

### 5.1 更新后的Token

```css
/* 移动端赛程专用Token */
--schedule-tab-min-width: 64px;
--schedule-tab-height: 44px;
--schedule-card-padding: 12px; /* 原16px */
--schedule-team-logo-size: 40px; /* 原48px */
--schedule-score-font-size: 20px; /* 原24px */
--schedule-team-name-size: 14px; /* 原16px */
--schedule-card-gap: 4px; /* 原8px */
```

### 5.2 响应式断点

| 断点 | 宽度范围 | 特殊处理 |
|------|----------|----------|
| xs | < 375px | 标签使用text-xs，队标36px |
| sm | 375px - 430px | 标签使用text-sm，队标40px |
| md | 430px - 767px | 标准移动端样式 |

---

## 6. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 修改影响PC端样式 | 中 | SwissRoundTabs通过showFinalResult区分，确保修改仅影响移动端 |
| 字体缩小导致可读性下降 | 低 | 保持最小14px字号，通过对比度增强可读性 |
| 间距缩小导致点击区域不足 | 低 | 保持min-h-[44px]，符合WCAG触摸目标规范 |

---

## 7. 审核清单

- [ ] 方案符合移动端设计规范
- [ ] 所有修改可追溯到具体代码文件
- [ ] 测试用例覆盖所有变更点
- [ ] 视觉回归测试基准已建立
- [ ] 无障碍访问（a11y）要求已考虑
- [ ] 性能影响已评估（无额外重渲染）

---

**文档状态**：待审核  
**下一步行动**：等待产品/设计审核确认后进入开发阶段
