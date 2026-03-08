# 赛程对战信息编辑栏优化计划

## 问题分析

### 1. 对战状态选择器问题
**文件位置**: [MatchRow.tsx](file:///d:/workspace/lvjiang-cup-test/src/pages/admin/components/MatchRow.tsx#L145-L154)

**当前代码**:
```tsx
<select
  value={formData.status}
  onChange={(e) => handleChange('status', e.target.value as MatchStatus)}
  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
>
  <option value="upcoming">Upcoming</option>
  <option value="ongoing">Ongoing</option>
  <option value="finished">Finished</option>
</select>
```

**问题**: 选项显示为英文（Upcoming/Ongoing/Finished），与页面其他部分的中文显示不一致（如查看模式下显示"未开始"/"进行中"/"已结束"）。

### 2. 日期选择器问题
**文件位置**: [MatchRow.tsx](file:///d:/workspace/lvjiang-cup-test/src/pages/admin/components/MatchRow.tsx#L75-L80)

**当前代码**:
```tsx
<input
  type="datetime-local"
  value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
  onChange={(e) => handleChange('startTime', new Date(e.target.value).toISOString())}
  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
/>
```

**问题**: 在暗色主题下，浏览器原生的 `datetime-local` 输入框的日历图标和颜色选择器不够明显，用户体验不佳。

---

## 优化方案

### 任务1: 对战状态选项中文化

**修改内容**:
将 `select` 选项的显示文本从英文改为中文，保持 `value` 值不变以确保数据兼容性。

**修改后代码**:
```tsx
<select
  value={formData.status}
  onChange={(e) => handleChange('status', e.target.value as MatchStatus)}
  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
>
  <option value="upcoming">未开始</option>
  <option value="ongoing">进行中</option>
  <option value="finished">已结束</option>
</select>
```

### 任务2: 日期选择器暗色主题优化

**修改内容**:
为 `datetime-local` 输入框添加暗色主题适配样式，包括：
1. 添加 `dark` 模式颜色方案
2. 自定义日历图标颜色
3. 优化输入框在暗色背景下的可见性

**修改后代码**:
```tsx
<input
  type="datetime-local"
  value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
  onChange={(e) => handleChange('startTime', new Date(e.target.value).toISOString())}
  className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white
    [color-scheme:dark]
    [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[0.7]
    [&::-webkit-calendar-picker-indicator]:hover:invert-[1] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
/>
```

**样式说明**:
- `[color-scheme:dark]`: 告诉浏览器使用暗色主题渲染原生控件
- `[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[0.7]`: 将日历图标颜色反转，使其在暗色背景下可见
- `[&::-webkit-calendar-picker-indicator]:hover:invert-[1]`: 鼠标悬停时图标更亮
- `[&::-webkit-calendar-picker-indicator]:cursor-pointer`: 鼠标悬停显示手型光标

---

## 实施步骤

1. **修改对战状态选择器** - 将选项文本改为中文
2. **修改日期时间选择器** - 添加暗色主题样式
3. **验证修改** - 确保功能正常，样式正确显示

---

## 预期效果

1. 对战状态下拉框显示中文选项："未开始"、"进行中"、"已结束"
2. 日期选择器的日历图标在暗色主题下清晰可见，悬停时有视觉反馈
