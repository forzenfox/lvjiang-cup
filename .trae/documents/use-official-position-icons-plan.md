# 使用官方PNG位置图标优化计划

## 任务概述
将当前使用的SVG图标组件替换为public目录下的官方PNG位置图标。

## 当前状态

### 已有资源
public目录下已有5个LOL官方位置图标：
- `top.png` - 上单图标（蓝色盾牌形状）
- `jungle.png` - 打野图标（绿色花朵/多刺形状）
- `mid.png` - 中单图标（黄色菱形/闪电形状）
- `bot.png` - ADC图标（红色靶心形状）
- `support.png` - 辅助图标（紫色护盾/翅膀形状）

### 当前实现
- **文件**: `src/components/icons/PositionIcons.tsx` - 当前使用SVG路径
- **使用处**: `src/components/features/TeamSection.tsx` - 导入并使用图标组件

## 实施方案

### 方案: 直接使用img标签加载PNG图标

由于图标已经是PNG格式且颜色已经正确（上单蓝/打野绿/中单黄/ADC红/辅助紫），可以直接使用img标签引用，无需额外的SVG组件。

### 具体步骤

#### Phase 1: 修改 PositionIcons 组件
**文件**: `src/components/icons/PositionIcons.tsx`

将SVG组件改为返回img标签的组件：

```tsx
import React from 'react';

interface IconProps {
  className?: string;
}

export const TopIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/top.png" alt="上单" className={className} />
);

export const JungleIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/jungle.png" alt="打野" className={className} />
);

export const MidIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/mid.png" alt="中单" className={className} />
);

export const AdcIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/bot.png" alt="ADC" className={className} />
);

export const SupportIcon: React.FC<IconProps> = ({ className }) => (
  <img src="/support.png" alt="辅助" className={className} />
);
```

#### Phase 2: 调整样式
由于PNG图标本身已有颜色，需要移除TeamSection中的颜色类：

**文件**: `src/components/features/TeamSection.tsx`

修改前：
```tsx
case '上单': return <TopIcon className="w-4 h-4 text-blue-400" />;
```

修改后：
```tsx
case '上单': return <TopIcon className="w-4 h-4" />;
```

或者保持颜色类（会被img标签忽略，不影响显示）。

#### Phase 3: 测试验证
1. 启动开发服务器
2. 查看战队展示区域
3. 确认5个位置的图标正确显示
4. 检查控制台无报错

## 预期效果
- 使用真正的LOL官方位置图标
- 图标颜色与官方一致
- 无需额外依赖

## 验收标准
- [ ] 5个位置的官方PNG图标正确显示
- [ ] 图标大小合适（w-4 h-4 = 16px）
- [ ] 响应式布局下显示正常
- [ ] 无控制台报错
