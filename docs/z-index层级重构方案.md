# z-index 层级重构方案

> **文档版本**: v1.0  
> **创建日期**: 2026-04-16  
> **状态**: 待实施  
> **优先级**: 高  

---

## 📋 目录

1. [问题概述](#1-问题概述)
2. [全项目 z-index 现状分析](#2-全项目-z-index-现状分析)
3. [重构方案设计](#3-重构方案设计)
4. [组件修改清单](#4-组件修改清单)
5. [边界情况处理](#5-边界情况处理)
6. [实施计划](#6-实施计划)
7. [回归测试清单](#7-回归测试清单)
8. [长期维护策略](#8-长期维护策略)

---

## 1. 问题概述

### 1.1 核心问题

**z-index 层级管理存在严重不一致，导致以下风险：**

1. **封面组件与 Modal 冲突** 🔴🔴🔴
   - PRD 设计封面使用 `z-[60]`
   - 现有 Modal 使用 `z-[100]` / `z-[101]`
   - **结果：Modal 会覆盖在封面上方，破坏产品体验**

2. **Portal 渲染打破层级控制** 🔴🔴
   - Modal 使用 `createPortal` 渲染到 `document.body`
   - 不受父组件 z-index 限制
   - 渲染顺序不可预测

3. **多个组件共享 z-50** 🟡
   - 8 个组件使用 `z-50`，无优先级区分
   - 同时显示时渲染顺序不可控

### 1.2 影响范围

| 组件类型 | 当前 z-index | 文件位置 | 影响 |
|---------|-------------|---------|------|
| **网页封面** (PRD) | `z-[60]` | 未实现 | 会被 Modal 遮挡 |
| **通用 Modal** | `z-[100]` / `z-[101]` | `Modal.tsx:39,59` | Portal 渲染 |
| **确认对话框** | `z-50` | `confirm-dialog.tsx:30` | 与导航栏同层 |
| **导航栏** | `z-50` | `Layout.tsx:113,185` | 固定定位 |
| **Toast 容器** | `z-50` | `Toast.tsx:136` | 固定定位 |
| **全局错误提示** | `z-50` | `Home.tsx:36` | 固定定位 |
| **全局加载** | `z-50` | `Home.tsx:51` | 固定定位 |
| **拖拽元素** | `1000` | `Streamers.tsx:91` | 内联样式 |
| **下拉菜单** | `z-50` | `HeroSelector.tsx:95` | 绝对定位 |
| **队员卡片悬浮** | `z-50` | `MemberCard.tsx:90` | 绝对定位 |

---

## 2. 全项目 z-index 现状分析

### 2.1 组件分类

根据渲染方式和定位方式，将组件分为 4 类：

#### 类别 1：Portal 渲染的模态框 🔴 **最高优先级**

| 组件 | 文件 | z-index | 特点 |
|------|------|---------|------|
| **通用 Modal** | `Modal.tsx` | `z-[100]` (遮罩) / `z-[101]` (内容) | `createPortal` 渲染到 body |
| **确认对话框** | `confirm-dialog.tsx` | `z-50` | 内联渲染 |
| **导入对话框** | `ImportDialog.tsx` | 依赖 Modal | 使用 Modal 组件 |
| **导入结果对话框** | `ImportResultDialog.tsx` | 依赖 Modal | 使用 Modal 组件 |
| **选手详情弹窗** | `PlayerDetailModal.tsx` | `z-50` | 内联渲染 |
| **队员详情弹窗** | `MemberDetailModal.tsx` | `z-50` | 内联渲染 |
| **比赛详情弹窗** | `MatchDetailModal.tsx` | 依赖 Modal | 使用 Modal 组件 |

#### 类别 2：固定定位组件 🟡 **高优先级**

| 组件 | 文件 | z-index | 定位方式 |
|------|------|---------|---------|
| PC 导航栏 | `Layout.tsx:113` | `z-50` | `fixed` |
| 移动端导航 | `Layout.tsx:185` | `z-50` | `fixed` |
| Toast 容器 | `Toast.tsx:136` | `z-50` | `fixed` |
| 全局错误提示 | `Home.tsx:36` | `z-50` | `fixed` |
| 全局加载 | `Home.tsx:51` | `z-50` | `fixed` |

#### 类别 3：绝对定位组件 🟢 **中优先级**

| 组件 | 文件 | z-index | 定位方式 |
|------|------|---------|---------|
| 下拉菜单 | `HeroSelector.tsx:95` | `z-50` | `absolute` |
| 队员卡片悬浮 | `MemberCard.tsx:90` | `z-50` | `absolute` |
| 视频控制箭头 | `ControlArrows.tsx:22,31` | `z-10` | `absolute` |
| 瑞士轮渐变遮罩 | `SwissRoundTabs.tsx:32,64` | `z-10` | `absolute` |

#### 类别 4：其他组件 🟢 **低优先级**

| 组件 | 文件 | z-index | 定位方式 |
|------|------|---------|---------|
| 拖拽元素 | `Streamers.tsx:91` | `1000` | 内联样式 |
| 瑞士轮树 | `SwissRoundTree.tsx:261` | `zIndex: 2` | 内联样式 |
| 英雄区域背景 | `HeroSection.tsx` | `z-0` / `z-10` | `absolute` |

### 2.2 问题统计

| 问题类型 | 数量 | 严重程度 |
|---------|------|---------|
| z-index 冲突 | 3 处 | 🔴 高 |
| Portal 渲染 | 1 处 | 🔴 高 |
| 重复 z-50 | 8 处 | 🟡 中 |
| 硬编码 z-index | 32 处 | 🟡 中 |

---

## 3. 重构方案设计

### 3.1 设计原则

1. **以 100 为单位间隔** - 便于插入新层级
2. **Portal 渲染的组件需要更高的 z-index** - 不受父组件限制
3. **封面组件在显示期间应该覆盖页面内容，但不覆盖 Modal** - 符合产品需求
4. **拖拽元素始终保持最高层级** - 临时提升

### 3.2 层级常量定义

```typescript
// src/constants/zIndex.ts

/**
 * 全局 z-index 层级规范
 * 
 * 设计原则：
 * - 以 100 为单位间隔，便于插入新层级
 * - Portal 渲染的组件需要更高的 z-index
 * - 封面组件在显示期间应该覆盖页面内容，但不覆盖 Modal
 */
export const ZIndexLayers = {
  /** 隐藏元素 */
  HIDDEN: -1,
  
  /** 基础层级 */
  BASE: 0,
  
  /** 组件内绝对定位元素（视频箭头、渐变遮罩等） */
  ABSOLUTE: 10,
  
  /** 粘性定位元素（导航栏） */
  STICKY: 50,
  
  /** 下拉菜单、悬浮提示 */
  DROPDOWN: 60,
  
  /** Toast 通知、全局提示 */
  TOAST: 70,
  
  /** 网页封面（显示时覆盖页面内容） */
  COVER: 80,
  
  /** 确认对话框 */
  CONFIRM_DIALOG: 90,
  
  /** 通用 Modal 遮罩 */
  MODAL_OVERLAY: 100,
  
  /** 通用 Modal 内容 */
  MODAL: 110,
  
  /** 嵌套 Modal（如 Modal 内打开 Modal） */
  NESTED_MODAL: 120,
  
  /** 拖拽元素（临时提升） */
  DRAGGING: 1000,
} as const;

/** 层级常量类型 */
export type ZIndexLayer = typeof ZIndexLayers[keyof typeof ZIndexLayers];
```

### 3.3 层级关系图

```
┌─────────────────────────────────────────┐
│  拖拽元素 (z-1000)                      │ ← 临时最高，不受限制
├─────────────────────────────────────────┤
│  嵌套 Modal (z-120)                     │
│  Modal 内容 (z-110)                     │
│  Modal 遮罩 (z-100)                     │ ← Portal 渲染到 body
├─────────────────────────────────────────┤
│  确认对话框 (z-90)                      │
├─────────────────────────────────────────┤
│  网页封面 (z-80)                        │ ← 覆盖页面内容，被 Modal 覆盖
├─────────────────────────────────────────┤
│  Toast 通知 (z-70)                      │
├─────────────────────────────────────────┤
│  下拉菜单 (z-60)                        │
├─────────────────────────────────────────┤
│  导航栏 (z-50)                          │ ← 粘性定位
├─────────────────────────────────────────┤
│  组件内绝对定位 (z-10)                  │
│  基础层级 (z-0)                         │
└─────────────────────────────────────────┘
```

### 3.4 关键设计决策

#### 决策 1：封面 z-index 设置为 80 ✅

**理由：**
- 封面需要覆盖导航栏 (50)、Toast (70)
- 封面**不能**覆盖 Modal (100/110)，否则用户无法操作
- 80 是合适的值，留出 10 的间隔

**产品逻辑验证：**
- ✅ 封面显示时：覆盖页面内容，用户滚动退出
- ✅ 封面显示期间触发 Modal：Modal 覆盖封面，用户可操作 Modal
- ✅ Modal 关闭后：封面仍然显示（如果未退出），等待用户操作

#### 决策 2：Modal 使用 Portal 渲染，z-index 保持 100/110 ✅

**理由：**
- Portal 渲染到 `document.body`，不受父组件影响
- 确保 Modal 始终在最上层
- 保持现有实现，只需将硬编码改为常量

#### 决策 3：Toast 提升为 70 ✅

**理由：**
- Toast 需要覆盖导航栏 (50)
- Toast 不应该覆盖封面 (80)
- 70 是合适的值

---

## 4. 组件修改清单

### 4.1 第一步：创建 z-index 配置文件

**文件：** `src/constants/zIndex.ts`

```typescript
/**
 * 全局 z-index 层级规范
 * 
 * 设计原则：
 * - 以 100 为单位间隔，便于插入新层级
 * - Portal 渲染的组件需要更高的 z-index
 * - 封面组件在显示期间应该覆盖页面内容，但不覆盖 Modal
 */
export const ZIndexLayers = {
  /** 隐藏元素 */
  HIDDEN: -1,
  
  /** 基础层级 */
  BASE: 0,
  
  /** 组件内绝对定位元素（视频箭头、渐变遮罩等） */
  ABSOLUTE: 10,
  
  /** 粘性定位元素（导航栏） */
  STICKY: 50,
  
  /** 下拉菜单、悬浮提示 */
  DROPDOWN: 60,
  
  /** Toast 通知、全局提示 */
  TOAST: 70,
  
  /** 网页封面（显示时覆盖页面内容） */
  COVER: 80,
  
  /** 确认对话框 */
  CONFIRM_DIALOG: 90,
  
  /** 通用 Modal 遮罩 */
  MODAL_OVERLAY: 100,
  
  /** 通用 Modal 内容 */
  MODAL: 110,
  
  /** 嵌套 Modal（如 Modal 内打开 Modal） */
  NESTED_MODAL: 120,
  
  /** 拖拽元素（临时提升） */
  DRAGGING: 1000,
} as const;

/** 层级常量类型 */
export type ZIndexLayer = typeof ZIndexLayers[keyof typeof ZIndexLayers];
```

### 4.2 第二步：修改现有组件

#### 4.2.1 Modal.tsx - 通用弹框 🔴 **必须修改**

**当前代码：**
```tsx
// Modal.tsx:39
<div className="fixed z-[100] flex items-center justify-center">
// Modal.tsx:59
<div className="relative z-[101] bg-gray-900 ...">
```

**修改后：**
```tsx
import { ZIndexLayers } from '../../constants/zIndex';

// 遮罩层
<div 
  className="fixed flex items-center justify-center"
  style={{ zIndex: ZIndexLayers.MODAL_OVERLAY }}
>

// 弹框内容
<div 
  className="relative bg-gray-900 ..."
  style={{ zIndex: ZIndexLayers.MODAL }}
>
```

**影响范围：**
- `ImportDialog.tsx`（依赖 Modal）
- `ImportResultDialog.tsx`（依赖 Modal）
- `MatchDetailModal.tsx`（依赖 Modal）

#### 4.2.2 confirm-dialog.tsx - 确认对话框 🟡 **建议修改**

**当前代码：**
```tsx
// confirm-dialog.tsx:30
className="fixed inset-0 z-50 flex items-center justify-center"
```

**修改后：**
```tsx
import { ZIndexLayers } from '../constants/zIndex';

className="fixed inset-0 flex items-center justify-center"
style={{ zIndex: ZIndexLayers.CONFIRM_DIALOG }}
```

#### 4.2.3 Layout.tsx - 导航栏 🟡 **建议修改**

**当前代码：**
```tsx
// Layout.tsx:113
<header className="... z-50 ...">
// Layout.tsx:185
<nav className="... z-50 ...">
```

**修改后：**
```tsx
import { ZIndexLayers } from '../constants/zIndex';

<header 
  className="fixed top-0 left-0 right-0 ..."
  style={{ zIndex: ZIndexLayers.STICKY }}
>

<nav 
  className="fixed bottom-0 left-0 right-0 ..."
  style={{ zIndex: ZIndexLayers.STICKY }}
>
```

#### 4.2.4 Toast.tsx - Toast 通知 🟢 **可选修改**

**当前代码：**
```tsx
// Toast.tsx:136
<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
```

**修改后：**
```tsx
import { ZIndexLayers } from '../../constants/zIndex';

<div 
  className="fixed bottom-4 right-4 flex flex-col gap-2"
  style={{ zIndex: ZIndexLayers.TOAST }}
>
```

#### 4.2.5 Home.tsx - 全局组件 🟢 **可选修改**

**当前代码：**
```tsx
// Home.tsx:36
<div className="fixed top-4 right-4 z-50 ...">
// Home.tsx:51
<div className="fixed bottom-4 right-4 z-50 ...">
```

**修改后：**
```tsx
import { ZIndexLayers } from '../constants/zIndex';

// 错误提示
<div 
  className="fixed top-4 right-4 ..."
  style={{ zIndex: ZIndexLayers.TOAST }}
>

// 加载指示器
<div 
  className="fixed bottom-4 right-4 ..."
  style={{ zIndex: ZIndexLayers.TOAST }}
>
```

#### 4.2.6 HeroSelector.tsx - 下拉菜单 🟢 **可选修改**

**当前代码：**
```tsx
// HeroSelector.tsx:95
className="absolute z-50 w-full mt-2 ..."
```

**修改后：**
```tsx
import { ZIndexLayers } from '../../constants/zIndex';

className="absolute w-full mt-2 ..."
style={{ zIndex: ZIndexLayers.DROPDOWN }}
```

#### 4.2.7 MemberCard.tsx - 悬浮提示 🟢 **可选修改**

**当前代码：**
```tsx
// MemberCard.tsx:90
className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 ..."
```

**修改后：**
```tsx
import { ZIndexLayers } from '../../constants/zIndex';

className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ..."
style={{ zIndex: ZIndexLayers.DROPDOWN }}
```

#### 4.2.8 PlayerDetailModal.tsx - 选手详情弹窗 🟡 **建议修改**

**当前代码：**
```tsx
// PlayerDetailModal.tsx:117
className="fixed inset-0 z-50 flex items-center justify-center p-4"
// PlayerDetailModal.tsx:132
className="relative z-50 w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
```

**修改后：**
```tsx
import { ZIndexLayers } from '../../constants/zIndex';

// 遮罩层
className="fixed inset-0 flex items-center justify-center p-4"
style={{ zIndex: ZIndexLayers.MODAL_OVERLAY }}

// 弹框内容
className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
style={{ zIndex: ZIndexLayers.MODAL }}
```

#### 4.2.9 MemberDetailModal.tsx - 队员详情弹窗 🟡 **建议修改**

**当前代码：**
```tsx
// MemberDetailModal.tsx:41
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
// MemberDetailModal.tsx:54
className="relative z-50 w-full max-w-3xl mx-4 rounded-2xl overflow-hidden"
```

**修改后：**
```tsx
import { ZIndexLayers } from '../../constants/zIndex';

// 遮罩层
className="fixed inset-0 flex items-center justify-center p-4"
style={{ zIndex: ZIndexLayers.MODAL_OVERLAY }}

// 弹框内容
className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden"
style={{ zIndex: ZIndexLayers.MODAL }}
```

### 4.3 第三步：StartBox 组件使用新常量

**当前 PRD 代码：**
```tsx
<motion.div className="fixed inset-0 z-[60] bg-black">
```

**修改后：**
```tsx
import { ZIndexLayers } from '../constants/zIndex';

<motion.div 
  className="fixed inset-0 bg-black"
  style={{ zIndex: ZIndexLayers.COVER }}
>
```

---

## 5. 边界情况处理

### 5.1 场景 1：封面显示期间触发 Modal

**时间线：**
1. 用户访问首页 → 封面显示 (z-80)
2. 封面显示期间，后台异步加载数据完成
3. 数据加载失败 → 触发错误 Modal (z-100/110)

**预期行为：**
- ✅ Modal 应该覆盖在封面上方
- ✅ 用户可以关闭 Modal
- ✅ 封面仍然显示，等待用户滚动退出

**验证方法：**
```tsx
// 测试脚本
1. 打开首页，封面显示
2. 手动触发错误 Modal
3. 验证 Modal 覆盖在封面上方
4. 关闭 Modal
5. 验证封面仍然显示
```

### 5.2 场景 2：封面退出期间触发 Modal

**时间线：**
1. 用户滚动触发封面退出动画
2. 封面动画进行中（1 秒）
3. 此时触发 Modal

**预期行为：**
- ✅ Modal 立即显示
- ✅ 封面继续退出动画
- ✅ 两者互不干扰

**验证方法：**
```tsx
// 测试脚本
1. 打开首页，封面显示
2. 快速滚动触发退出动画
3. 在动画进行中触发 Modal
4. 验证 Modal 和封面同时显示
5. 等待封面动画完成
6. 验证 Modal 仍然显示
```

### 5.3 场景 3：多个 Modal 嵌套

**时间线：**
1. 用户打开导入对话框 (z-110)
2. 导入完成后显示结果对话框 (z-110)

**预期行为：**
- ✅ 结果对话框应该替换导入对话框
- ✅ 避免两个 Modal 同时显示造成混乱

**验证方法：**
```tsx
// 测试脚本
1. 打开导入对话框
2. 完成导入
3. 验证结果对话框显示
4. 验证导入对话框已关闭
```

### 5.4 场景 4：拖拽元素与其他组件

**时间线：**
1. 用户在 Streamers 页面拖拽主播卡片
2. 拖拽元素 z-index: 1000
3. 此时触发 Modal (z-110)

**预期行为：**
- ✅ 拖拽元素应该在最顶层
- ✅ Modal 不应该遮挡拖拽元素

**验证方法：**
```tsx
// 测试脚本
1. 打开 Streamers 管理页面
2. 开始拖拽主播卡片
3. 拖拽期间触发 Modal
4. 验证拖拽元素在最顶层
```

### 5.5 场景 5：Toast 与封面同时显示

**时间线：**
1. 封面显示 (z-80)
2. Toast 通知触发 (z-70)

**预期行为：**
- ✅ Toast 不应该覆盖封面
- ✅ Toast 可能被封面遮挡（符合预期）

**验证方法：**
```tsx
// 测试脚本
1. 打开首页，封面显示
2. 手动触发 Toast 通知
3. 验证 Toast 被封面遮挡（或等待封面退出后显示）
```

---

## 6. 实施计划

### 6.1 阶段划分

#### 阶段 1：创建配置文件（30 分钟）

- [ ] 创建 `src/constants/zIndex.ts`
- [ ] 定义所有层级常量
- [ ] 添加 TypeScript 类型导出
- [ ] 运行 TypeScript 检查

#### 阶段 2：修改核心组件（2-3 小时）

**必须修改（高风险）：**
- [ ] `Modal.tsx` - 通用弹框
- [ ] `confirm-dialog.tsx` - 确认对话框
- [ ] `Layout.tsx` - 导航栏

**建议修改（中风险）：**
- [ ] `PlayerDetailModal.tsx` - 选手详情弹窗
- [ ] `MemberDetailModal.tsx` - 队员详情弹窗

**可选修改（低风险）：**
- [ ] `Toast.tsx` - Toast 通知
- [ ] `Home.tsx` - 全局组件
- [ ] `HeroSelector.tsx` - 下拉菜单
- [ ] `MemberCard.tsx` - 悬浮提示

#### 阶段 3：实现 StartBox 组件（待开发）

- [ ] 创建 `StartBox/` 文件夹结构
- [ ] 使用 `ZIndexLayers.COVER` 常量
- [ ] 集成到 `Home.tsx`

#### 阶段 4：回归测试（2-3 小时）

- [ ] 所有 Modal 正常显示
- [ ] 导航栏正常显示
- [ ] Toast 正常显示
- [ ] 下拉菜单正常显示
- [ ] 封面覆盖导航栏
- [ ] Modal 覆盖封面
- [ ] 拖拽元素最高层

### 6.2 时间估算

| 阶段 | 预计耗时 | 风险等级 |
|-----|---------|---------|
| 配置文件 | 30 分钟 | 🟢 低 |
| 核心组件 | 2-3 小时 | 🔴 高 |
| 可选组件 | 1-2 小时 | 🟢 低 |
| StartBox 集成 | 待开发 | - |
| 回归测试 | 2-3 小时 | 🟡 中 |
| **总计** | **6-8 小时** | - |

### 6.3 风险控制

**高风险操作：**
1. 修改 `Modal.tsx` - 影响所有使用 Modal 的组件
2. 修改 `Layout.tsx` - 影响全局导航栏

**缓解措施：**
1. 逐步修改，每次修改一个组件
2. 每次修改后运行测试
3. 保留 Git 分支，方便回滚

---

## 7. 回归测试清单

### 7.1 功能测试

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|---------|---------|------|
| Modal 正常显示 | 打开导入对话框 | 对话框正常显示 | ⬜ |
| Modal 正常关闭 | 点击关闭按钮 | 对话框正常关闭 | ⬜ |
| 确认对话框 | 触发删除操作 | 确认框正常显示 | ⬜ |
| 导航栏显示 | 访问首页 | 导航栏正常显示 | ⬜ |
| Toast 显示 | 触发成功操作 | Toast 正常显示 | ⬜ |
| 下拉菜单 | 点击英雄选择器 | 下拉菜单正常显示 | ⬜ |
| 悬浮提示 | 悬停队员卡片 | 悬浮提示正常显示 | ⬜ |
| 拖拽元素 | 拖拽主播卡片 | 拖拽元素在最顶层 | ⬜ |

### 7.2 边界情况测试

| 测试项 | 测试方法 | 预期结果 | 状态 |
|--------|---------|---------|------|
| 封面 + Modal | 封面显示期间触发 Modal | Modal 覆盖封面 | ⬜ |
| 封面退出 + Modal | 封面退出期间触发 Modal | 两者互不干扰 | ⬜ |
| Toast + 封面 | 封面显示期间触发 Toast | Toast 被封面遮挡 | ⬜ |
| 拖拽 + Modal | 拖拽期间触发 Modal | 拖拽元素在最顶层 | ⬜ |
| 多 Modal 嵌套 | 导入对话框 + 结果对话框 | 结果对话框替换导入对话框 | ⬜ |

### 7.3 浏览器兼容性

| 浏览器 | 版本 | 测试状态 |
|--------|------|---------|
| Chrome | 最新 | ⬜ |
| Edge | 最新 | ⬜ |
| Firefox | 最新 | ⬜ |
| Safari | 最新 | ⬜ |

---

## 8. 长期维护策略

### 8.1 代码规范

**规则 1：所有新组件必须使用 z-index 常量**

```tsx
// ❌ 禁止：硬编码 z-index
<div className="z-50">

// ✅ 推荐：使用常量
<div style={{ zIndex: ZIndexLayers.STICKY }}>
```

**规则 2：新增层级必须添加到配置文件**

```typescript
// ❌ 禁止：直接使用自定义值
<div className="z-[75]">

// ✅ 推荐：在配置文件中定义新层级
export const ZIndexLayers = {
  // ...
  NEW_LAYER: 75,
} as const;

// 使用
<div style={{ zIndex: ZIndexLayers.NEW_LAYER }}>
```

### 8.2 代码审查

**审查清单：**
- [ ] 是否使用了硬编码的 z-index 值？
- [ ] 新增层级是否添加到配置文件？
- [ ] 层级关系是否符合设计规范？
- [ ] 是否使用了 Portal 渲染？如果是，z-index 是否足够？

### 8.3 定期清理

**每季度执行：**
1. 搜索代码库中的硬编码 z-index
2. 替换为常量引用
3. 更新本文档

**搜索命令：**
```bash
# 搜索硬编码 z-index
grep -r "z-\[" src/
grep -r "zIndex:" src/
grep -r "z-index:" src/
```

### 8.4 文档更新

**更新时机：**
- 新增层级常量时
- 修改现有组件时
- 发现新的边界情况时

---

## 附录

### A. 修改前后对比表

| 组件 | 修改前 | 修改后 | 变化 |
|------|--------|--------|------|
| Modal 遮罩 | `z-[100]` | `ZIndexLayers.MODAL_OVERLAY (100)` | 无变化 |
| Modal 内容 | `z-[101]` | `ZIndexLayers.MODAL (110)` | +9 |
| 确认对话框 | `z-50` | `ZIndexLayers.CONFIRM_DIALOG (90)` | +40 |
| 导航栏 | `z-50` | `ZIndexLayers.STICKY (50)` | 无变化 |
| Toast | `z-50` | `ZIndexLayers.TOAST (70)` | +20 |
| 下拉菜单 | `z-50` | `ZIndexLayers.DROPDOWN (60)` | +10 |
| 封面 | `z-[60]` | `ZIndexLayers.COVER (80)` | +20 |

### B. 参考资料

- [MDN z-index 文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS/z-index)
- [Tailwind CSS z-index 文档](https://tailwindcss.com/docs/z-index)
- [React Portal 文档](https://react.dev/reference/react-dom/createPortal)

### C. 更新日志

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-04-16 | 初始版本 | - |

---

**文档结束**
