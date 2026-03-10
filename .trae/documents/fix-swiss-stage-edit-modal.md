# 瑞士轮管理页面编辑弹窗修复计划

## 问题描述

瑞士轮管理页面（Schedule.tsx）中，点击已有赛事卡片无法弹出编辑界面。

## 问题定位

**文件路径：** `src/pages/admin/SwissStageVisualEditor.tsx`

**问题组件：** `FixedSlotMatchCard`

**问题代码位置：** 第 79-83 行

```typescript
const handleClick = () => {
  if (isEmpty && onCreate) {
    setIsEditing(true);
  }
};
```

## 问题原因

`handleClick` 函数中使用了条件判断 `if (isEmpty && onCreate)`，这意味着：
- 只有当槽位为空（`isEmpty = true`）且存在 `onCreate` 回调时，才会进入编辑状态
- 当槽位已有比赛数据时（`isEmpty = false`），点击卡片不会触发编辑

## 修复方案

### 方案：修改 handleClick 逻辑

将 `handleClick` 函数修改为支持两种场景：
1. 空槽位：创建新比赛（需要 `onCreate`）
2. 已有数据：编辑现有比赛（需要 `onUpdate`）

**修改前：**
```typescript
const handleClick = () => {
  if (isEmpty && onCreate) {
    setIsEditing(true);
  }
};
```

**修改后：**
```typescript
const handleClick = () => {
  if (isEmpty && onCreate) {
    // 空槽位：创建新比赛
    setIsEditing(true);
  } else if (!isEmpty) {
    // 已有比赛：编辑现有比赛
    setIsEditing(true);
  }
};
```

## TDD 测试计划

根据用户要求的 TDD 方法，先编写测试用例：

### 测试用例 1：点击空槽位应弹出编辑界面
- **输入：** 渲染 `FixedSlotMatchCard` 组件，`match` 为 `null`，`onCreate` 已提供
- **操作：** 点击卡片
- **预期：** 编辑表单应显示

### 测试用例 2：点击已有比赛卡片应弹出编辑界面
- **输入：** 渲染 `FixedSlotMatchCard` 组件，`match` 为有效比赛对象
- **操作：** 点击卡片
- **预期：** 编辑表单应显示，且表单预填充现有数据

### 测试用例 3：点击空槽位但无 onCreate 时不应弹出编辑
- **输入：** 渲染 `FixedSlotMatchCard` 组件，`match` 为 `null`，`onCreate` 为 `undefined`
- **操作：** 点击卡片
- **预期：** 编辑表单不应显示

## 实施步骤

1. **编写测试用例**（SwissStageVisualEditor.test.tsx）
   - 添加测试用例覆盖点击编辑功能

2. **修复代码**
   - 修改 `SwissStageVisualEditor.tsx` 第 79-83 行的 `handleClick` 函数

3. **运行测试验证**
   - 执行测试确保修复成功
   - 确保原有测试不受影响

## 影响范围

- **仅影响：** `SwissStageVisualEditor.tsx` 中的 `FixedSlotMatchCard` 组件
- **不影响：** 只读展示的 `SwissStage.tsx` 组件
- **不影响：** 已废弃的 `SwissStageEditor.tsx` 组件
