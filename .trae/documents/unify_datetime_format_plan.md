# 统一项目日期时间格式和时区方案

## 现状分析

### 当前日期时间使用情况

1. **SwissStage.tsx** (第24-34行)
   - 使用 `toLocaleString('zh-CN', {...})` 格式化时间
   - 格式：`month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'`

2. **MatchRow.tsx** (第101-108行)
   - 使用 `toLocaleString('zh-CN', {...})` 格式化时间
   - 格式：`month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'`

3. **EliminationStage.tsx** (第10-18行)
   - 手动拼接日期字符串
   - 格式：`${month}月${day}日 ${hours}:${minutes}`

### 存在的问题

1. **格式不统一**：三个地方使用了三种不同的日期格式化方式
2. **时区不明确**：没有明确设置时区，依赖系统默认时区
3. **代码重复**：每个组件都自己实现日期格式化逻辑
4. **维护困难**：需要修改格式时需要改动多个地方

## 解决方案

### 方案概述

创建一个统一的日期时间工具模块，统一使用北京时区 (Asia/Shanghai) 进行格式化。

### 实施步骤

#### 步骤 1：创建日期时间工具模块

创建 `src/utils/datetime.ts` 文件，提供统一的日期格式化函数：

```typescript
/**
 * 统一日期时间格式化工具
 * 默认使用北京时区 (Asia/Shanghai)
 */

// 默认时区：北京
const DEFAULT_TIMEZONE = 'Asia/Shanghai';

// 默认日期时间格式选项
const DEFAULT_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: DEFAULT_TIMEZONE,
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

// 短日期格式（不含时间）
const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: DEFAULT_TIMEZONE,
  month: 'short',
  day: 'numeric',
};

// 完整日期时间格式
const FULL_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: DEFAULT_TIMEZONE,
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

/**
 * 格式化日期时间为字符串（默认格式：X月X日 XX:XX）
 * @param dateString ISO 8601 格式的日期字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', DEFAULT_DATETIME_OPTIONS);
  } catch {
    return dateString;
  }
}

/**
 * 格式化短日期（不含时间）
 * @param dateString ISO 8601 格式的日期字符串
 * @returns 格式化后的日期字符串（X月X日）
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', SHORT_DATE_OPTIONS);
  } catch {
    return dateString;
  }
}

/**
 * 格式化完整日期时间（含年份）
 * @param dateString ISO 8601 格式的日期字符串
 * @returns 格式化后的完整日期时间字符串（XXXX年X月X日 XX:XX）
 */
export function formatFullDateTime(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', FULL_DATETIME_OPTIONS);
  } catch {
    return dateString;
  }
}

/**
 * 将日期转换为 ISO 字符串（用于输入框）
 * @param dateString ISO 8601 格式的日期字符串
 * @returns 适用于 datetime-local 输入框的字符串 (YYYY-MM-DDTHH:MM)
 */
export function toDateTimeLocal(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // 转换为本地时间字符串，用于 datetime-local 输入框
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

/**
 * 将 datetime-local 输入框的值转换为 ISO 字符串
 * @param localDateTime datetime-local 格式的字符串 (YYYY-MM-DDTHH:MM)
 * @returns ISO 8601 格式的 UTC 时间字符串
 */
export function fromDateTimeLocal(localDateTime: string): string {
  if (!localDateTime) return '';
  try {
    const date = new Date(localDateTime);
    return date.toISOString();
  } catch {
    return localDateTime;
  }
}
```

#### 步骤 2：更新 SwissStage.tsx

替换原有的 `formatMatchTime` 函数为使用工具函数：

```typescript
// 删除原有的 formatMatchTime 函数
// import { formatDateTime } from '@/utils/datetime';

// 在 MatchCard 中使用
<span>{formatDateTime(match.startTime)}</span>
```

#### 步骤 3：更新 MatchRow.tsx

替换原有的 `formatTime` 函数：

```typescript
// import { formatDateTime, toDateTimeLocal, fromDateTimeLocal } from '@/utils/datetime';

// 在显示时使用
<div className="text-gray-300 font-medium">{formatDateTime(match.startTime)}</div>

// 在编辑时使用
value={formData.startTime ? toDateTimeLocal(formData.startTime) : ''}
onChange={(e) => handleChange('startTime', fromDateTimeLocal(e.target.value))}
```

#### 步骤 4：更新 EliminationStage.tsx

替换原有的 `formatDateTime` 函数：

```typescript
// import { formatDateTime } from '@/utils/datetime';

// 在 renderMatch 中使用
{displayMatch.startTime ? formatDateTime(displayMatch.startTime) : ''}
```

#### 步骤 5：检查并更新其他可能使用日期时间的地方

- SwissStageEditor.tsx
- EliminationStageEditor.tsx
- 其他可能存在的日期时间格式化代码

### 预期效果

1. **格式统一**：所有地方使用相同的日期时间格式 "X月X日 XX:XX"
2. **时区统一**：明确使用北京时区 (Asia/Shanghai)
3. **代码复用**：通过工具函数避免重复代码
4. **易于维护**：需要修改格式时只需改动一处

### 文件变更清单

1. **新增**：`src/utils/datetime.ts` - 日期时间工具模块
2. **修改**：`src/components/features/SwissStage.tsx` - 使用工具函数
3. **修改**：`src/pages/admin/components/MatchRow.tsx` - 使用工具函数
4. **修改**：`src/components/features/EliminationStage.tsx` - 使用工具函数
5. **检查**：其他可能使用日期时间的地方

### 测试验证

1. 瑞士轮比赛卡片显示正确的时间格式
2. 淘汰赛比赛卡片显示正确的时间格式
3. 管理后台比赛列表显示正确的时间格式
4. 时间编辑功能正常工作
5. 所有时间统一显示为北京时区
