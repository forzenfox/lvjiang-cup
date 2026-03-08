# 赛事编辑栏添加重置按钮计划

## 需求分析

在赛事编辑栏添加重置按钮，点击后将当前比赛重置为初始未编辑状态：
1. 比分变为 0:0
2. 对战双方清空（teamAId 和 teamBId 设为空字符串）
3. 状态变为未开始（upcoming）

## 当前代码分析

**文件位置**: [MatchRow.tsx](file:///d:/workspace/lvjiang-cup-test/src/pages/admin/components/MatchRow.tsx)

**当前编辑模式按钮区域**（第159-167行）：
```tsx
{/* Actions */}
<div className="md:col-span-2 flex justify-end gap-2">
  <Button size="sm" onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
    <Save className="w-4 h-4" />
  </Button>
  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
    <X className="w-4 h-4" />
  </Button>
</div>
```

**当前状态管理**：
- `formData`：存储编辑表单数据
- `handleChange`：修改字段值
- `handleSave`：保存修改

## 实现方案

### 任务1: 添加重置按钮

在保存和取消按钮之间添加重置按钮，使用 RotateCcw 图标（来自 lucide-react）。

**修改后代码**:
```tsx
{/* Actions */}
<div className="md:col-span-2 flex justify-end gap-2">
  <Button size="sm" onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
    <Save className="w-4 h-4" />
  </Button>
  <Button size="sm" variant="ghost" onClick={handleReset} title="重置" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20">
    <RotateCcw className="w-4 h-4" />
  </Button>
  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
    <X className="w-4 h-4" />
  </Button>
</div>
```

### 任务2: 实现重置处理函数

添加 `handleReset` 函数，将表单数据重置为初始状态：

```tsx
const handleReset = () => {
  setFormData(prev => ({
    ...prev,
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    status: 'upcoming' as MatchStatus,
    winnerId: undefined,
  }));
};
```

### 任务3: 导入 RotateCcw 图标

修改导入语句，添加 RotateCcw 图标：

```tsx
import { Save, X, Edit, Check, PlayCircle, Trophy, Crown, ArrowRight, RotateCcw } from 'lucide-react';
```

## 实施步骤

1. **导入 RotateCcw 图标** - 在 lucide-react 导入中添加 RotateCcw
2. **添加 handleReset 函数** - 在组件中实现重置逻辑
3. **添加重置按钮** - 在 Actions 区域添加重置按钮

## 预期效果

1. 编辑模式下显示三个按钮：保存（绿色）、重置（黄色）、取消（默认）
2. 点击重置按钮后：
   - 双方战队选择框变为空（显示 "Select Team A" / "Select Team B"）
   - 比分输入框变为 0
   - 状态下拉框变为 "未开始"
3. 重置后用户可以继续编辑或直接保存

## 注意事项

- 重置只影响表单状态，不会自动保存到服务器
- 重置后需要点击保存按钮才能将更改持久化
- 重置操作不会退出编辑模式
