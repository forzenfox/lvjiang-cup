# 重置按钮后编辑栏加载问题修复计划 V2

## 用户反馈

1. 退出编辑时，如果有数据变动，提示未保存是否确认退出的弹框，待用户确认后再推送
2. 检查保存按钮的逻辑是否正确

## 保存按钮逻辑分析

**当前代码**（第27-43行）：
```tsx
const handleSave = () => {
  // Auto-calculate winner if finished
  const updated = { ...formData };

  // Apply fixed swiss record if provided
  if (fixedSwissRecord && updated.stage === 'swiss') {
    updated.swissRecord = fixedSwissRecord;
  }

  if (updated.status === 'finished' && !updated.winnerId) {
    if (updated.scoreA > updated.scoreB) updated.winnerId = updated.teamAId;
    else if (updated.scoreB > updated.scoreA) updated.winnerId = updated.teamBId;
  }

  onUpdate(updated);
  setIsEditing(false);
};
```

**分析结果**：
- ✅ 保存逻辑正确：复制表单数据、应用固定瑞士轮记录、自动计算获胜者、调用 onUpdate、退出编辑模式
- ✅ 数据流向正确：formData → updated → onUpdate
- ✅ 边界情况处理：已考虑 finished 状态的获胜者自动计算

**结论**：保存按钮逻辑正确，无需修改。

## 修复方案

### 任务1: 添加数据变动检测函数

添加一个函数用于比较当前表单数据与原始数据是否有变化：

```tsx
const hasUnsavedChanges = () => {
  return (
    formData.teamAId !== match.teamAId ||
    formData.teamBId !== match.teamBId ||
    formData.scoreA !== match.scoreA ||
    formData.scoreB !== match.scoreB ||
    formData.status !== match.status ||
    formData.startTime !== match.startTime ||
    formData.swissRecord !== match.swissRecord
  );
};
```

### 任务2: 修改取消按钮处理逻辑

当用户点击取消按钮时，先检查是否有未保存的更改：

```tsx
const handleCancel = () => {
  if (hasUnsavedChanges()) {
    if (window.confirm('有未保存的更改，确定要放弃修改吗？')) {
      setFormData(match);  // 恢复原始数据
      setIsEditing(false); // 退出编辑模式
    }
  } else {
    setIsEditing(false); // 无更改，直接退出
  }
};
```

### 任务3: 更新取消按钮的 onClick

```tsx
<Button size="sm" variant="ghost" onClick={handleCancel}>
  <X className="w-4 h-4" />
</Button>
```

## 实施步骤

1. **添加 hasUnsavedChanges 函数** - 检测表单数据是否有变动
2. **添加 handleCancel 函数** - 处理取消操作，带确认弹框
3. **更新取消按钮** - 使用 handleCancel 替代直接设置 isEditing

## 预期效果

用户操作流程：
1. 点击编辑 → 加载原始数据
2. 修改数据（或点击重置）→ 表单数据变化
3. 点击取消（叉叉）→ **弹出确认框"有未保存的更改，确定要放弃修改吗？"**
4. 用户点击"确定" → 放弃修改，恢复原始数据，退出编辑模式
5. 用户点击"取消" → 留在编辑模式，保留当前修改
6. 再次点击编辑 → 正确加载原始待编辑信息

## 代码变更

**文件**: [MatchRow.tsx](file:///d:/workspace/lvjiang-cup-test/src/pages/admin/components/MatchRow.tsx)

1. 在 handleReset 函数后添加 hasUnsavedChanges 和 handleCancel 函数
2. 修改取消按钮的 onClick 为 handleCancel

## 使用原生 confirm

项目已有使用 `window.confirm` 的先例（Teams.tsx 第45行），因此采用原生 confirm 实现确认弹框，无需引入额外组件。
