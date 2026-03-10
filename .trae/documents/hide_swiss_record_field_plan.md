# 隐藏瑞士轮编辑框中战绩字段计划

## 任务描述
从瑞士轮编辑弹框中隐藏战绩字段（`swissRecord`），因为该字段由比赛所在槽位自动确定，在编辑框中显示没有意义。

## 现状分析

当前 `MatchEditDialog.tsx` 中，瑞士轮战绩以下拉框形式展示：

```typescript
{match.stage === 'swiss' && (
  <div>
    <label className="block text-sm text-gray-400 mb-1">瑞士轮战绩</label>
    <select
      value={formData.swissRecord || ''}
      onChange={(e) => handleChange('swissRecord', e.target.value)}
      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
    >
      <option value="">选择战绩</option>
      <option value="0-0">0-0</option>
      <option value="1-0">1-0</option>
      <option value="0-1">0-1</option>
      <option value="1-1">1-1</option>
      <option value="0-2">0-2</option>
      <option value="1-2">1-2</option>
    </select>
  </div>
)}
```

## 实施方案

### 步骤1：修改 MatchEditDialog.tsx
移除瑞士轮战绩选择器的代码块（第169-186行）。

### 步骤2：验证修改
确保：
1. 瑞士轮编辑弹框不再显示战绩字段
2. 其他字段（时间、状态、队伍、比分）正常显示
3. 所有现有测试通过

## 影响范围

| 文件 | 修改内容 | 影响 |
|-----|---------|------|
| `MatchEditDialog.tsx` | 移除战绩选择器 | 仅UI层面，数据模型不变 |

## 注意事项
- `swissRecord` 数据字段保留，仅从前端编辑框中隐藏
- 战绩仍由 `SwissStageVisualEditor` 中的槽位配置自动确定
- 不影响任何业务逻辑
