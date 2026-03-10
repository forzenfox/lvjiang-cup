# 晋级名单管理问题修复计划

## 问题描述

管理页面的晋级名单管理存在两个问题：
1. 加载mock数据后，该组件并未加载对应数据
2. 该组件的修改并未同步到主页面

## 问题分析

### 问题1：加载mock数据后，晋级名单组件未加载对应数据

**根本原因**：
- `Schedule.tsx` 页面使用了 `useAdvancementStore` 来获取晋级名单数据
- `advancementStore.ts` 中定义了 `defaultAdvancement` 作为默认值
- `mock/data.ts` 中也定义了 `swissAdvancement` 对象
- **问题**：当调用 `mockService.resetAllData()` 加载mock数据时，只重置了 teams、matches 和 streamInfo，**没有重置晋级名单数据**
- `advancementStore` 使用 `persist` 中间件将数据保存在 localStorage 中，mock数据加载不会影响到它

**代码位置**：
- `src/mock/service.ts` 第125-137行的 `resetAllData` 方法
- `src/store/advancementStore.ts` 第23-29行的默认数据
- `src/mock/data.ts` 第482-488行的 `swissAdvancement`

### 问题2：晋级名单修改未同步到主页面

**根本原因**：
- `SwissStageVisualEditor.tsx` 中的 `AdvancementEditor` 组件直接调用 `onUpdate` 回调
- `Schedule.tsx` 中的 `handleAdvancementUpdate` 调用 `setAdvancement(newAdvancement, 'admin')` 更新 store
- **问题**：`SwissStageVisualEditor` 组件接收的 `advancement` prop 来自父组件 `Schedule.tsx`
- `Schedule.tsx` 从 store 获取 `advancement` 并传递给子组件
- 但 `advancementStore` 的更新机制是正确的，问题可能在于组件没有正确响应状态变化

经过进一步分析，发现问题在于：
- `AdvancementEditor` 组件内部使用了本地状态管理，但没有正确同步外部数据变化
- 当从 mock 数据加载时，store 中的数据没有被更新为 mock 数据

## 修复方案

### 修复1：在 mockService.resetAllData 中同步重置晋级名单

**修改文件**：`src/mock/service.ts`

**修改内容**：
在 `resetAllData` 方法中，添加重置 `advancementStore` 的逻辑：

```typescript
// 加载Mock数据 - 使用data.ts中的初始数据覆盖localStorage
resetAllData: async (): Promise<void> => {
  await delay(DELAY);
  // 移除清空标志，允许使用初始数据
  localStorage.removeItem(CLEAR_FLAG);
  // 使用初始数据覆盖
  teams = [...initialTeams];
  matches = [...initialMatches];
  streamInfo = { ...initialStreamInfo };
  // 保存到 localStorage
  saveToStorage('teams', teams);
  saveToStorage('matches', matches);
  saveToStorage('streamInfo', streamInfo);
  
  // 重置晋级名单数据 - 清除 advancement-storage 让 store 使用默认值
  localStorage.removeItem('advancement-storage');
},
```

### 修复2：确保 Schedule 页面正确加载和同步晋级名单

**修改文件**：`src/pages/admin/Schedule.tsx`

**修改内容**：

当前代码已经正确地从 store 获取 advancement 并传递给子组件。但需要确保在加载 mock 数据后，store 中的数据被正确更新。

实际上，修复1已经解决了这个问题。当调用 `resetAllData` 时，清除 `advancement-storage` 会让 store 重新使用默认值（即 `defaultAdvancement`，它与 `mock/data.ts` 中的 `swissAdvancement` 一致）。

### 修复3：添加从 mock 数据加载晋级名单的功能（可选增强）

为了让代码更清晰，可以在 `mockService` 中添加获取晋级名单的方法：

**修改文件**：`src/mock/service.ts`

**修改内容**：

```typescript
import { swissAdvancement } from './data';

// ... 其他代码 ...

export const mockService = {
  // ... 其他方法 ...
  
  // 获取晋级名单
  getAdvancement: async () => {
    await delay(DELAY);
    return { ...swissAdvancement };
  },
  
  // ... 其他方法 ...
}
```

但考虑到当前架构使用 zustand store 管理晋级名单状态，这个修改不是必须的。

## 考虑后续后端开发的架构设计

由于该项目是demo，后续需要开发后端应用，建议在修复中考虑以下架构设计：

### 1. 统一的数据服务接口

当前 `mockService` 已经提供了统一的数据访问接口。后续开发后端时，只需：
- 保持相同的接口签名
- 将 `mockService` 替换为真实的 API 调用
- 晋级名单数据也应该通过类似的 service 接口获取

### 2. 状态管理策略

当前使用 zustand + persist 中间件管理晋级名单状态。后续接入后端时：
- 可以选择继续使用 zustand，但移除 persist 中间件（数据由后端持久化）
- 或者使用 React Query/SWR 等数据获取库管理服务端状态

### 3. 建议的后续后端接口设计

```typescript
// 建议的后端接口设计
interface AdvancementAPI {
  GET /api/advancement          // 获取当前晋级名单
  PUT /api/advancement          // 更新整个晋级名单
  POST /api/advancement/teams   // 添加队伍到指定分类
  DELETE /api/advancement/teams/:id  // 从分类中移除队伍
}
```

## 测试策略

根据用户要求的 TDD 方法，在修改代码之前，先编写/修改测试用例：

### 测试1：验证 resetAllData 清除 advancement-storage

**测试文件**：需要创建或修改相应的测试文件

```typescript
it('resetAllData 应该清除 advancement-storage', async () => {
  // 先设置一些数据到 advancement-storage
  localStorage.setItem('advancement-storage', JSON.stringify({
    state: {
      advancement: { winners2_0: [], winners2_1: [], losersBracket: [], eliminated3rd: [], eliminated0_3: [] },
      lastUpdated: new Date().toISOString(),
      updatedBy: 'test'
    }
  }));
  
  await mockService.resetAllData();
  
  expect(localStorage.getItem('advancement-storage')).toBeNull();
});
```

### 测试2：验证 Schedule 页面加载 mock 数据后显示正确的晋级名单

```typescript
it('Schedule 页面加载 mock 数据后应显示正确的晋级名单', async () => {
  // 先清除 advancement-storage
  localStorage.removeItem('advancement-storage');
  
  // 渲染 Schedule 组件
  render(<Schedule />);
  
  // 等待加载完成
  await waitFor(() => {
    // 验证晋级名单中显示了预期的队伍
    expect(screen.getByText('驴酱')).toBeInTheDocument();
  });
});
```

## 实施步骤

1. **编写测试用例**（TDD 方法）
   - 为 `mockService.resetAllData` 添加测试，验证它会清除 `advancement-storage`

2. **修复代码**
   - 修改 `src/mock/service.ts` 中的 `resetAllData` 方法，添加清除 `advancement-storage` 的逻辑

3. **验证修复**
   - 运行测试确保通过
   - 手动验证功能是否正常工作

## 文件变更清单

| 文件路径 | 变更类型 | 变更说明 |
|---------|---------|---------|
| `src/mock/service.ts` | 修改 | 在 `resetAllData` 方法中添加清除 `advancement-storage` 的逻辑 |
| `tests/unit/mock/service.test.ts` | 新增/修改 | 添加测试用例验证 resetAllData 行为 |

## 注意事项

1. **数据一致性**：`advancementStore.ts` 中的 `defaultAdvancement` 和 `mock/data.ts` 中的 `swissAdvancement` 应该保持一致。如果需要修改晋级名单数据，需要同时修改这两个地方。

2. **localStorage 清理**：清除 `advancement-storage` 后，zustand 的 persist 中间件会自动使用 `defaultAdvancement` 作为初始值。

3. **向后兼容**：此修复不会影响现有功能，只是确保 mock 数据加载时晋级名单也被重置。

4. **后续后端开发**：当前修复保持了与现有架构的一致性。后续开发后端时，建议：
   - 在 `mockService` 中添加 `getAdvancement` 和 `updateAdvancement` 方法
   - 在 `Schedule.tsx` 中添加加载晋级名单数据的逻辑
   - 考虑使用 React Query 等库管理服务端状态
