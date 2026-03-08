# 数据持久化修复计划

## 问题根因

**内存数据在页面刷新后会重置**

当前 mockService 使用内存变量存储数据：
```ts
let matches = [...initialMatches];  // 页面刷新后重新初始化
```

当用户刷新页面时：
1. JavaScript 应用重新加载
2. `matches` 变量被重新赋值为 `initialMatches`
3. 之前通过管理后台修改的数据丢失

## 修复方案

### 方案：使用 localStorage 持久化数据

将数据存储在浏览器的 localStorage 中，页面刷新后数据不丢失。

**优点**:
- 实现简单
- 页面刷新后数据持久化
- 兼容当前 demo 和未来前后端分离架构

**实现步骤**:

1. **修改 mockService.ts**
   - 从 localStorage 读取初始数据（如果存在）
   - 每次修改后保存到 localStorage
   - 提供重置功能（可选）

2. **代码变更**:

```ts
// 从 localStorage 加载数据，如果不存在则使用初始数据
const loadFromStorage = <T>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initialData;
};

// 保存数据到 localStorage
const saveToStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// 初始化数据
let teams = loadFromStorage('teams', [...initialTeams]);
let matches = loadFromStorage('matches', [...initialMatches]);
let streamInfo = loadFromStorage('streamInfo', { ...initialStreamInfo });

// 修改 updateMatch 时保存到 localStorage
updateMatch: async (updatedMatch: Match): Promise<Match> => {
  await delay(DELAY);
  matches = matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
  saveToStorage('matches', matches);  // 持久化
  return updatedMatch;
},
```

## 实施步骤

1. **修改 mockService.ts**
   - 添加 localStorage 读写辅助函数
   - 修改数据初始化逻辑
   - 在修改操作后添加持久化

## 预期效果

1. 用户在管理后台修改比赛信息
2. 数据保存到 localStorage
3. 刷新主页后，从 localStorage 读取最新数据
4. 数据同步问题得到解决

## 未来迁移

当迁移到真实后端时：
- 移除 localStorage 相关代码
- 直接调用后端 API
- 数据持久化由后端数据库负责
