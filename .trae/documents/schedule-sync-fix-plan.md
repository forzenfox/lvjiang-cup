# 主页赛程信息同步问题修复计划

## 问题描述

用户在管理后台重置并保存了 Round 1 的第一场比赛信息后，主页面的赛程信息并未同步修改。

## 问题分析

### 数据流分析

**1. 管理后台 (Admin Schedule)**
- 文件: [Schedule.tsx](file:///d:/workspace/lvjiang-cup-test/src/pages/admin/Schedule.tsx)
- 数据加载: `loadData()` 函数通过 `mockService.getMatches()` 获取数据
- 数据更新: `handleMatchUpdate()` 函数调用 `mockService.updateMatch()` 更新数据
- 更新后会重新调用 `loadData()` 刷新本地状态

**2. 主页赛程 (Schedule Section)**
- 文件: [ScheduleSection.tsx](file:///d:/workspace/lvjiang-cup-test/src/components/features/ScheduleSection.tsx)
- 数据加载: `loadData()` 函数通过 `mockService.getMatches()` 获取数据
- 问题: **只在组件挂载时加载一次数据** (`useEffect(() => { loadData(); }, [])`)

**3. Mock Service 数据存储**
- 文件: [service.ts](file:///d:/workspace/lvjiang-cup-test/src/mock/service.ts)
- 使用内存中的变量存储数据: `let matches = [...initialMatches]`
- `updateMatch` 会修改内存中的数据
- `getMatches` 返回内存中的数据

### 问题根源

**ScheduleSection 组件只在挂载时加载数据，没有实时同步机制。**

当用户在管理后台修改数据后：
1. mockService 中的内存数据已更新 ✓
2. 管理后台重新加载数据，显示正确 ✓
3. 主页 ScheduleSection 组件没有重新加载数据，显示旧数据 ✗

## 修复方案

### 方案1: 添加轮询机制（推荐）

在 ScheduleSection 组件中添加定时轮询，定期刷新数据。

**优点**:
- 实现简单
- 数据最终一致性
- 适用于 mock 数据环境

**缺点**:
- 有延迟（可配置）
- 不必要的网络请求（mock环境下无实际网络开销）

**实现代码**:
```tsx
useEffect(() => {
  loadData();
  
  // 每 5 秒轮询一次数据
  const interval = setInterval(() => {
    loadData();
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

### 方案2: 使用浏览器本地存储

将数据持久化到 localStorage，实现跨页面数据共享。

**优点**:
- 数据持久化
- 页面刷新后数据不丢失

**缺点**:
- 需要修改 mockService
- 复杂度较高

### 方案3: 添加页面可见性检测

当用户从管理后台切换回主页时，自动刷新数据。

**实现代码**:
```tsx
useEffect(() => {
  loadData();
  
  // 当页面重新可见时刷新数据
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      loadData();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

## 推荐方案

**采用方案1（轮询）+ 方案3（页面可见性检测）的组合**

这样可以在以下场景保证数据同步：
1. 用户停留在主页时，轮询获取最新数据
2. 用户从管理后台切换回主页时，立即刷新数据

## 实施步骤

1. **修改 ScheduleSection.tsx**
   - 添加轮询机制（5秒间隔）
   - 添加页面可见性检测
   - 确保组件卸载时清理定时器和事件监听

## 代码变更

**文件**: [ScheduleSection.tsx](file:///d:/workspace/lvjiang-cup-test/src/components/features/ScheduleSection.tsx)

```tsx
useEffect(() => {
  loadData();
  
  // 轮询机制：每5秒刷新一次数据
  const interval = setInterval(() => {
    loadData();
  }, 5000);
  
  // 页面可见性检测：切换回页面时刷新数据
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      loadData();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 清理函数
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

## 预期效果

1. 用户在管理后台修改比赛信息并保存
2. 主页 ScheduleSection 会在以下时机自动刷新：
   - 每5秒自动轮询
   - 用户从其他页面切换回主页时
3. 用户无需手动刷新页面即可看到最新数据
