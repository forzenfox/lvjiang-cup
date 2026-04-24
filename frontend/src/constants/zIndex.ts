/**
 * 全局 z-index 层级规范
 *
 * 设计原则：
 * - 以 100 为单位间隔，便于插入新层级
 * - Portal 渲染的组件需要更高的 z-index
 * - 封面组件在显示期间应该覆盖页面内容，但不覆盖 Modal
 */
export const ZIndexLayers = {
  /** 隐藏元素 */
  HIDDEN: -1,

  /** 基础层级 */
  BASE: 0,

  /** 组件内绝对定位元素（视频箭头、渐变遮罩等） */
  ABSOLUTE: 10,

  /** 粘性定位元素（导航栏） */
  STICKY: 50,

  /** 下拉菜单、悬浮提示 */
  DROPDOWN: 60,

  /** Toast 通知、全局提示 */
  TOAST: 70,

  /** 网页封面（显示时覆盖页面内容） */
  COVER: 80,

  /** 确认对话框 */
  CONFIRM_DIALOG: 90,

  /** 通用 Modal 遮罩 */
  MODAL_OVERLAY: 100,

  /** 通用 Modal 内容 */
  MODAL: 110,

  /** 嵌套 Modal（如 Modal 内打开 Modal） */
  NESTED_MODAL: 120,

  /** 拖拽元素（临时提升） */
  DRAGGING: 1000,
} as const;

/** 层级常量类型 */
export type ZIndexLayer = (typeof ZIndexLayers)[keyof typeof ZIndexLayers];
