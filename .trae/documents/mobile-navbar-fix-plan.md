# 移动端导航栏修复计划

## 问题描述
移动端导航栏上的"战队"和"赛程"按钮未显示。

## 问题分析
在 `src/components/layout/Layout.tsx` 第25行，导航栏使用了 `hidden md:flex` 类：
```tsx
<nav className="hidden md:flex items-center space-x-8">
```
这导致在移动端（屏幕宽度 < 768px）时，整个导航菜单被隐藏。

## 修复方案

### 方案2: 简化方案 - 始终显示导航（用户选择）
移除 `hidden md:flex`，改为始终显示导航，但调整样式适应移动端。

**实现步骤：**
1. 移除 `hidden md:flex` 中的 `hidden`，改为 `flex`
2. 调整导航项的间距，在移动端使用更小的间距
3. 调整字体大小，在移动端使用更小的字体

**代码变更位置：** `src/components/layout/Layout.tsx`

**具体修改：**
- 第25行：`<nav className="hidden md:flex items-center space-x-8">` 
  改为：`<nav className="flex items-center space-x-2 md:space-x-8">`
- 第26-34行：按钮文字大小调整为 `text-xs md:text-sm`

## 测试计划
1. 在桌面端（>768px）验证导航栏正常显示，间距为 space-x-8
2. 在移动端（<768px）验证导航栏显示，间距为 space-x-2
3. 点击"战队"、"赛程"按钮验证页面滚动到对应区域
4. 点击"管理"验证跳转到管理页面
