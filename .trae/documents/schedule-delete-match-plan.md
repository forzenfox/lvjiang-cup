# 赛程管理页面删除对战项功能修复计划

## 问题描述
赛程管理页面无法删除对战项。

## 问题分析
通过代码审查发现：

1. **Schedule.tsx** (赛程管理页面): 没有 `onDeleteMatch` 回调函数传递给子组件
2. **SwissStageEditor.tsx / EliminationStageEditor.tsx**: 没有接收 `onDeleteMatch` prop，也没有将删除功能传递给 MatchRow
3. **MatchRow.tsx**: 没有删除按钮和删除逻辑
4. **mock/service.ts**: 虽然有 `deleteTeam` 方法，但没有 `deleteMatch` 方法

## 修复方案

### 1. 添加 deleteMatch 到 mockService
**文件**: `src/mock/service.ts`

添加删除比赛的方法：
```typescript
deleteMatch: async (id: string): Promise<void> => {
  await delay(DELAY);
  matches = matches.filter(m => m.id !== id);
  saveToStorage('matches', matches);
}
```

### 2. 更新 Schedule.tsx
**文件**: `src/pages/admin/Schedule.tsx`

- 添加 `handleDeleteMatch` 处理函数
- 将 `onDeleteMatch` 传递给 SwissStageEditor 和 EliminationStageEditor

### 3. 更新 SwissStageEditor.tsx
**文件**: `src/pages/admin/components/SwissStageEditor.tsx`

- 添加 `onDeleteMatch` prop
- 将 `onDeleteMatch` 传递给 MatchRow 组件

### 4. 更新 EliminationStageEditor.tsx
**文件**: `src/pages/admin/components/EliminationStageEditor.tsx`

- 添加 `onDeleteMatch` prop
- 将 `onDeleteMatch` 传递给 MatchRow 组件

### 5. 更新 MatchRow.tsx
**文件**: `src/pages/admin/components/MatchRow.tsx`

- 添加 `onDelete` prop
- 添加删除按钮（仅在非编辑模式下显示）
- 添加删除确认对话框
- 调用 `onDelete` 回调

## 测试计划
1. 在瑞士轮页面添加一个测试比赛
2. 点击删除按钮，确认对话框弹出
3. 确认删除后，比赛从列表中移除
4. 刷新页面，确认删除已持久化到 localStorage
5. 在淘汰赛页面重复测试
