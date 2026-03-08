# 重置按钮后编辑栏加载问题修复计划

## 问题描述

用户操作流程：
1. 点击编辑按钮进入编辑模式
2. 点击重置按钮重置表单数据
3. 点击叉叉（取消）放弃修改
4. 再次点击编辑按钮

**预期结果**：编辑栏应加载原始的待编辑信息
**实际结果**：编辑栏显示的是重置后的数据（空白队伍、0:0比分、未开始状态）

## 问题分析

**文件位置**: [MatchRow.tsx](file:///d:/workspace/lvjiang-cup-test/src/pages/admin/components/MatchRow.tsx)

### 当前状态管理逻辑

```tsx
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState<Match>(match);

// Sync formData when match prop changes (e.g. external update)
useEffect(() => {
  setFormData(match);
}, [match]);
```

### 问题根源

1. `formData` 初始值设为 `match`，但只在 `match` prop 变化时通过 `useEffect` 同步
2. 当用户点击重置按钮时，`formData` 被修改（队伍清空、比分置0、状态变未开始）
3. 用户点击取消（叉叉）时，只是将 `isEditing` 设为 `false`，`formData` 保持重置后的状态
4. 再次点击编辑按钮时，`isEditing` 变为 `true`，但 `formData` 仍然是重置后的状态
5. 由于 `match` prop 没有变化，`useEffect` 不会触发，`formData` 不会恢复为原始数据

### 根本原因

取消编辑时没有将 `formData` 恢复为原始 `match` 数据。

## 修复方案

### 方案：取消编辑时恢复原始数据

修改取消按钮的处理逻辑，在退出编辑模式前将 `formData` 恢复为原始的 `match` 数据。

**当前代码**（第179行）：
```tsx
<Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
  <X className="w-4 h-4" />
</Button>
```

**修复后代码**：
```tsx
<Button size="sm" variant="ghost" onClick={() => {
  setFormData(match);  // 恢复原始数据
  setIsEditing(false); // 退出编辑模式
}}>
  <X className="w-4 h-4" />
</Button>
```

## 实施步骤

1. **修改取消按钮的 onClick 处理函数** - 在退出编辑模式前恢复 `formData` 为 `match`

## 预期效果

修复后用户操作流程：
1. 点击编辑按钮进入编辑模式 → 加载原始数据
2. 点击重置按钮重置表单数据 → 表单变为空白状态
3. 点击叉叉（取消）放弃修改 → 恢复原始数据并退出编辑模式
4. 再次点击编辑按钮 → 正确加载原始的待编辑信息

## 代码变更

**文件**: [MatchRow.tsx](file:///d:/workspace/lvjiang-cup-test/src/pages/admin/components/MatchRow.tsx#L179)

将内联的取消处理改为恢复数据后退出编辑模式。
