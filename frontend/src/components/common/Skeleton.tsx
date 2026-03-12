import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 骨架屏变体类型
 */
type SkeletonVariant =
  | 'text'
  | 'circular'
  | 'rectangular'
  | 'rounded'
  | 'card'
  | 'avatar'
  | 'button'
  | 'image';

/**
 * 骨架屏尺寸预设
 */
type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 骨架屏变体 */
  variant?: SkeletonVariant;
  /** 尺寸预设 */
  size?: SkeletonSize;
  /** 自定义宽度 */
  width?: string | number;
  /** 自定义高度 */
  height?: string | number;
  /** 是否显示动画 */
  animate?: boolean;
  /** 行数（仅用于 text 变体） */
  lines?: number;
  /** 行间距（仅用于 text 变体） */
  lineGap?: number;
}

/**
 * 尺寸映射
 */
const sizeMap: Record<SkeletonSize, { width: string; height: string }> = {
  xs: { width: 'w-16', height: 'h-4' },
  sm: { width: 'w-24', height: 'h-6' },
  md: { width: 'w-32', height: 'h-8' },
  lg: { width: 'w-48', height: 'h-10' },
  xl: { width: 'w-64', height: 'h-12' },
  full: { width: 'w-full', height: 'h-full' },
};

/**
 * 变体样式映射
 */
const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-md',
  card: 'rounded-lg',
  avatar: 'rounded-full',
  button: 'rounded-md',
  image: 'rounded-lg',
};

/**
 * 基础骨架屏组件
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  size = 'md',
  width,
  height,
  animate = true,
  lines = 1,
  className,
  style,
  ...props
}) => {
  const baseClasses = cn(
    'bg-muted',
    animate && 'animate-pulse',
    variantStyles[variant]
  );

  // 如果是多行文本
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              sizeMap[size].height,
              // 最后一行短一点
              index === lines - 1 ? 'w-3/4' : sizeMap[size].width
            )}
            style={{
              ...style,
              width: index === lines - 1 ? undefined : width,
              height,
            }}
          />
        ))}
      </div>
    );
  }

  // 单元素骨架屏
  return (
    <div
      className={cn(
        baseClasses,
        !width && !height && sizeMap[size].width,
        !width && !height && sizeMap[size].height,
        className
      )}
      style={{
        ...style,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      {...props}
    />
  );
};

/**
 * 卡片骨架屏
 */
interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示头像 */
  showAvatar?: boolean;
  /** 内容行数 */
  contentLines?: number;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  animate?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showAvatar = true,
  contentLines = 3,
  showActions = true,
  animate = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 space-y-4',
        className
      )}
      {...props}
    >
      {/* 头部 */}
      <div className="flex items-center gap-4">
        {showAvatar && (
          <Skeleton variant="avatar" size="lg" width={48} height={48} animate={animate} />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={20} animate={animate} />
          <Skeleton variant="text" width="40%" height={16} animate={animate} />
        </div>
      </div>

      {/* 内容 */}
      <div className="space-y-2 pt-2">
        <Skeleton
          variant="text"
          lines={contentLines}
          animate={animate}
        />
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex gap-2 pt-2">
          <Skeleton variant="button" width={80} height={36} animate={animate} />
          <Skeleton variant="button" width={80} height={36} animate={animate} />
        </div>
      )}
    </div>
  );
};

/**
 * 列表项骨架屏
 */
interface ListItemSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示图片 */
  showImage?: boolean;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  animate?: boolean;
}

export const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({
  showImage = false,
  showActions = false,
  animate = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 border-b border-border last:border-b-0',
        className
      )}
      {...props}
    >
      {showImage && (
        <Skeleton
          variant="image"
          width={64}
          height={64}
          animate={animate}
        />
      )}

      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" height={20} animate={animate} />
        <Skeleton variant="text" width="70%" height={16} animate={animate} />
      </div>

      {showActions && (
        <Skeleton variant="button" width={80} height={36} animate={animate} />
      )}
    </div>
  );
};

/**
 * 表格骨架屏
 */
interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 行数 */
  rows?: number;
  /** 列数 */
  columns?: number;
  /** 是否显示表头 */
  showHeader?: boolean;
  animate?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  animate = true,
  className,
  ...props
}) => {
  return (
    <div className={cn('w-full', className)} {...props}>
      {/* 表头 */}
      {showHeader && (
        <div className="flex gap-4 pb-4 border-b border-border">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              variant="text"
              className="flex-1"
              height={24}
              animate={animate}
            />
          ))}
        </div>
      )}

      {/* 表格行 */}
      <div className="space-y-4 pt-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="text"
                className="flex-1"
                height={20}
                animate={animate}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 页面骨架屏
 */
interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 内容区块数量 */
  sections?: number;
  animate?: boolean;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  showTitle = true,
  sections = 2,
  animate = true,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-6 p-6', className)} {...props}>
      {/* 标题 */}
      {showTitle && (
        <Skeleton
          variant="text"
          width={200}
          height={32}
          animate={animate}
          className="mb-8"
        />
      )}

      {/* 内容区块 */}
      {Array.from({ length: sections }).map((_, index) => (
        <CardSkeleton
          key={`section-${index}`}
          showAvatar={index === 0}
          contentLines={3 + index}
          animate={animate}
        />
      ))}
    </div>
  );
};

/**
 * 比赛卡片骨架屏 - 针对赛事系统的定制骨架屏
 */
interface MatchCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export const MatchCardSkeleton: React.FC<MatchCardSkeletonProps> = ({
  animate = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 space-y-4',
        className
      )}
      {...props}
    >
      {/* 比赛状态 */}
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width={80} height={24} animate={animate} />
        <Skeleton variant="text" width={60} height={16} animate={animate} />
      </div>

      {/* 队伍信息 */}
      <div className="flex items-center justify-between gap-4">
        {/* 主队 */}
        <div className="flex items-center gap-3 flex-1">
          <Skeleton variant="avatar" width={40} height={40} animate={animate} />
          <Skeleton variant="text" width={80} height={20} animate={animate} />
        </div>

        {/* 比分 */}
        <Skeleton variant="text" width={60} height={32} animate={animate} />

        {/* 客队 */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <Skeleton variant="text" width={80} height={20} animate={animate} />
          <Skeleton variant="avatar" width={40} height={40} animate={animate} />
        </div>
      </div>

      {/* 比赛信息 */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" width={100} height={16} animate={animate} />
        <Skeleton variant="text" width={80} height={16} animate={animate} />
      </div>
    </div>
  );
};

/**
 * 瑞士轮表格骨架屏
 */
interface SwissTableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 队伍数量 */
  teamCount?: number;
  animate?: boolean;
}

export const SwissTableSkeleton: React.FC<SwissTableSkeletonProps> = ({
  teamCount = 8,
  animate = true,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* 表头 */}
      <div className="flex gap-2 pb-2 border-b border-border">
        <Skeleton variant="text" width={60} height={24} animate={animate} />
        <Skeleton variant="text" className="flex-1" height={24} animate={animate} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={40}
            height={24}
            animate={animate}
          />
        ))}
      </div>

      {/* 队伍行 */}
      {Array.from({ length: teamCount }).map((_, index) => (
        <div key={index} className="flex gap-2 items-center py-2">
          <Skeleton variant="text" width={40} height={32} animate={animate} />
          <div className="flex-1 flex items-center gap-2">
            <Skeleton variant="avatar" width={32} height={32} animate={animate} />
            <Skeleton variant="text" width={120} height={20} animate={animate} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={40}
              height={32}
              animate={animate}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
