# 主页赛程信息同步问题修复计划 V2

## 补充信息

当前是一个 demo，后期会采用前后端交互的方式进行实际开发。

## 架构分析

### 当前 Demo 架构

- **数据存储**: 内存中的变量（`let matches = [...initialMatches]`）
- **数据共享**: 同一代码库中的共享模块
- **问题**: 主页和管理后台是两个独立页面，各自加载数据，没有实时同步机制

### 未来前后端分离架构

- **数据存储**: 后端数据库
- **数据共享**: HTTP API + 可能的 WebSocket 实时推送
- **方案选择**:
  1. **轮询**: 简单可靠，适用于大多数场景
  2. **WebSocket**: 实时推送，适合高实时性需求
  3. **SWR/React Query**: 自动缓存、重验证、乐观更新

## 修复方案评估

考虑到当前是 demo，但未来会迁移到前后端分离架构，推荐以下方案：

### 推荐方案: 轮询机制（最实用）

**为什么选轮询**:
1. **当前 demo 可用**: 立即解决同步问题
2. **未来可复用**: 轮询在前后端分离架构中依然有效
3. **实现简单**: 代码量少，维护成本低
4. **可平滑迁移**: 后期只需替换数据获取方式（mock → API）

**为什么不选 WebSocket**:
- 当前 demo 环境难以演示
- 需要后端支持，增加复杂度
- 对于赛程展示场景，秒级延迟可接受

**为什么不选 SWR/React Query**:
- 当前项目未引入这些库
- 为 demo 引入新库增加复杂度
- 轮询已能满足需求

## 实施方案

### 当前 Demo 实现

在 ScheduleSection 组件中添加轮询机制：

```tsx
useEffect(() => {
  loadData();

  // 轮询机制：每5秒刷新一次数据
  const interval = setInterval(() => {
    loadData();
  }, 5000);

  // 页面可见性检测：切换回页面时立即刷新
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      loadData();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

### 未来前后端分离迁移

当迁移到真实后端时，只需修改 `loadData` 函数：

```tsx
// 当前 (mock)
const loadData = async () => {
  const [matchesData, teamsData] = await Promise.all([
    mockService.getMatches(),
    mockService.getTeams()
  ]);
  setMatches(matchesData);
  setTeams(teamsData);
};

// 未来 (API)
const loadData = async () => {
  const [matchesData, teamsData] = await Promise.all([
    api.getMatches(),      // 替换为真实 API
    api.getTeams()
  ]);
  setMatches(matchesData);
  setTeams(teamsData);
};
```

轮询逻辑完全不需要修改！

## 代码变更

**文件**: [ScheduleSection.tsx](file:///d:/workspace/lvjiang-cup-test/src/components/features/ScheduleSection.tsx)

修改 `useEffect` 添加轮询和页面可见性检测。

## 预期效果

1. **当前 Demo**:
   - 用户在管理后台修改数据
   - 主页每5秒自动刷新，显示最新数据
   - 用户切换回主页时立即刷新

2. **未来前后端分离**:
   - 相同代码逻辑，只需替换数据获取方式
   - 可平滑迁移，无需重构同步机制

## 总结

轮询方案是当前 demo 和未来生产环境都适用的最佳方案，实现简单且可平滑迁移。
