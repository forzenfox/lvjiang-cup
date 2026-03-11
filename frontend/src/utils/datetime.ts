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
 * 将日期转换为 datetime-local 格式（用于输入框）
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
