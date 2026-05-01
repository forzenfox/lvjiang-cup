# 驴酱杯赛事平台 - 奖金池展示功能开发设计文档

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 奖金池展示功能开发设计文档 |
| 对应 PRD | [PRD-奖金池展示功能.md](./PRD-奖金池展示功能.md) |
| 产品版本 | v1.0.0 |
| 创建日期 | 2026-05-01 |
| 文档状态 | 待审核 |

---

## 2. 总体设计

### 2.1 设计目标
在现有 `HeroSection` 组件内新增奖金池展示区域，通过读取 `window.PRIZE_POOL_DATA` 配置直接展示常规奖金与特殊奖项，无需客户端计算。

### 2.2 核心设计决策

| 决策项 | 方案 | 理由 |
|--------|------|------|
| 数据读取 | 全局配置 `window.PRIZE_POOL_DATA` | PRD 要求，无需计算，运营直接配置 |
| 组件位置 | 内嵌于 `HeroSection.tsx` | PRD 要求，不新增独立区块 |
| 常规奖金展示 | 静态卡片 + 数字滚动动画 | 金额直接读取，动画增强视觉效果 |
| 特殊奖项滚动 | 纵向向上无缝滚动 | PRD 要求，参考鸣谢模块 `SpecialAwards` 实现 |
| 动画库 | `framer-motion` | 项目已依赖，与现有动画风格一致 |
| 样式方案 | Tailwind CSS | 项目统一方案 |

---

## 3. 详细设计

### 3.1 类型定义

在 `src/data/types.ts` 中新增：

```typescript
/**
 * 常规奖金配置
 */
export interface RegularPrizeConfig {
  /** 常规奖金总额（元） */
  total: number;
  /** 冠军奖金（元） */
  champion: number;
  /** 亚军奖金（元） */
  runnerUp: number;
  /** 冠军占比（可选，用于UI展示） */
  championRatio?: number;
  /** 亚军占比（可选，用于UI展示） */
  runnerUpRatio?: number;
}

/**
 * 特殊奖项配置
 */
export interface SpecialAwardConfig {
  /** 唯一标识 */
  id: number;
  /** 奖项内容 */
  content: string;
}

/**
 * 奖金池数据接口
 */
export interface PrizePoolData {
  /** 常规奖金 */
  regular: RegularPrizeConfig;
  /** 特殊奖项列表 */
  specialAwards: SpecialAwardConfig[];
}

// 扩展全局 Window 接口
declare global {
  interface Window {
    PRIZE_POOL_DATA?: PrizePoolData;
  }
}

// 确保此文件被 TypeScript 识别为模块（使 declare global 生效）
export {};
```

### 3.2 组件设计

#### 3.2.1 HeroSection 扩展示意

```
HeroSection.tsx
├── 背景图 (z-0)
├── 遮罩层 (z-0)
├── z-10 内容区
│   ├── 标题区 (驴酱杯 / 驴酱公会终极对决)
│   ├── 直播信息/状态 (条件渲染: 正在直播/未直播/加载中)
│   ├── PrizePoolPanel (新增) ← 奖金池展示（在条件渲染分支外，始终显示）
│   └── 加载/失败状态提示 (可选)
└── 底部滚动提示
```

**集成说明**：
- `PrizePoolPanel` 放置在**条件渲染分支之外**，无论直播状态如何都始终展示
- 位置：在直播状态区域之后、底部滚动提示之前
- 无 `window.PRIZE_POOL_DATA` 配置时，组件返回 `null`，不影响原有布局

#### 3.2.2 PrizePoolPanel 组件

```typescript
// src/components/features/HeroSection/PrizePoolPanel.tsx

interface PrizePoolPanelProps {
  data: PrizePoolData;
}
```

**内部结构**：
```
PrizePoolPanel (data-testid="prize-pool-panel")
├── PrizePoolTitle (data-testid="prize-pool-title")         # 标题 + 总金额数字动画
├── PrizePoolGrid (data-testid="prize-pool-grid")           # 左右两列网格
│   ├── RegularPrizeCard (data-testid="regular-prize-card")    # 常规奖金卡片
│   │   ├── 总奖金展示 (data-testid="regular-total")
│   │   ├── ChampionCard (data-testid="champion-card")       # 冠军 70%
│   │   └── RunnerUpCard (data-testid="runner-up-card")      # 亚军 30%
│   └── SpecialAwardsCard (data-testid="special-awards-card")  # 特殊奖项卡片
│       ├── 标题 (data-testid="special-awards-title")
│       └── ScrollList (data-testid="special-awards-scroll")   # 纵向向上滚动列表
```

**data-testid 说明**：

| data-testid | 对应元素 | 测试用途 |
|-------------|----------|----------|
| `prize-pool-panel` | 整个奖金池面板容器 | 验证面板整体可见性 |
| `prize-pool-title` | "赛事奖金池" 标题区域 | 验证标题渲染 |
| `prize-pool-grid` | 两列/单列网格容器 | 验证响应式布局变化 |
| `regular-prize-card` | 常规奖金卡片 | 验证常规奖金区域显示 |
| `regular-total` | 常规奖金总额数字 | 验证总金额格式化 |
| `champion-card` | 冠军奖金子卡片 | 验证冠军金额和占比 |
| `runner-up-card` | 亚军奖金子卡片 | 验证亚军金额和占比 |
| `special-awards-card` | 特殊奖项卡片容器 | 验证特殊奖项区域显示 |
| `special-awards-title` | "特殊奖项" 标题 | 验证特殊奖项标题 |
| `special-awards-scroll` | 纵向滚动容器 | 验证滚动动画启动 |

#### 3.2.3 各子组件详细设计

**PrizePoolTitle**
- 展示 "赛事奖金池" 标题
- 下方展示 `regular.total`，带数字滚动增长动画
- 使用 `framer-motion` 的 `useMotionValue` + `animate` 实现
- 视觉：金色/琥珀色渐变字体，与 HeroSection 主标题风格一致

**RegularPrizeCard**
- 左侧卡片，深色渐变背景 + 微光边框
- 上方：总常规奖金金额（大字号）
- 下方：两个子卡片横向排列
  - ChampionCard：奖杯图标 + 金额 + "冠军 70%"
  - RunnerUpCard：奖牌图标 + 金额 + "亚军 30%"
- 悬停：边框高亮，轻微放大 `scale: 1.02`

**SpecialAwardsCard**
- 右侧卡片，粉/紫渐变背景（参考 SpecialAwards）
- 标题："特殊奖项" + StarBurst 装饰图标
- 滚动区域：纵向向上无缝滚动
  - 实现参考：`SpecialAwards.tsx` 的 `scroll-up` 动画
  - 检测内容溢出后启动滚动
  - 复制一份内容实现无缝循环
  - 固定速度：20s/周期
- 每条奖项：TrophyIcon + 奖项内容文本
- 无赞助人名称展示

### 3.3 动画设计

| 动画 | 实现方式 | 触发时机 |
|------|----------|----------|
| 区块入场 | `framer-motion` `whileInView` | 进入视口时淡入+上移 |
| 金额数字滚动 | `useMotionValue` + `animate` | 组件挂载后延迟 300ms 触发 |
| 卡片悬停 | Tailwind `hover:` 类 | 鼠标悬停 |
| 特殊奖项滚动 | CSS `@keyframes scroll-up` | 内容溢出时自动启动 |

**数字滚动动画实现**：
```typescript
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';
import { useEffect } from 'react';

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    // count 是 useMotionValue 返回的稳定引用，不需要加入依赖数组
    // 仅在 value 变化时触发动画
    const controls = animate(count, value, { duration: 1.5, ease: 'easeOut' });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}
```

**注意事项**：
- `count` 是 `useMotionValue` 返回的引用，在整个组件生命周期中保持稳定
- 依赖数组中包含 `count` 不会导致无限循环（因为引用不变），但为清晰起见可以移除
- 推荐写法：`}, [value]);` （仅依赖 `value`）

### 3.4 响应式设计

| 断点 | 布局 | 字体 |
|------|------|------|
| PC（≥1024px） | `grid-cols-2` 左右两列 | 标题 `text-4xl`，金额 `text-3xl` |
| 平板（768px-1023px） | `grid-cols-2` 缩小间距 | 标题 `text-3xl`，金额 `text-2xl` |
| 移动端（<768px） | `grid-cols-1` 上下堆叠 | 标题 `text-2xl`，金额 `text-xl` |

### 3.5 空状态处理

```typescript
const prizePoolData = window.PRIZE_POOL_DATA;

// 无配置时不渲染
if (!prizePoolData) return null;

// 常规奖金为0时仅展示特殊奖项
const showRegular = prizePoolData.regular.total > 0;

// 特殊奖项为空时仅展示常规奖金
const showSpecial = prizePoolData.specialAwards.length > 0;
```

---

## 4. 接口设计

### 4.1 全局配置接口

```javascript
// frontend/public/config.js & deploy/config.js

window.PRIZE_POOL_DATA = {
  regular: {
    total: 100000,
    champion: 70000,
    runnerUp: 30000,
    championRatio: 0.7,
    runnerUpRatio: 0.3,
  },
  specialAwards: [
    { id: 1, content: "8强每个队伍1K" },
    { id: 2, content: "冠军队伍每人750g蓝莓果干+250g参片" },
    { id: 3, content: "FMVP 1K，冠军上单 500" },
    { id: 4, content: "4强队伍每人一份贡菜千层肚" },
    { id: 5, content: "最佳C/D级（参赛选手评）" },
    { id: 6, content: "爆种奖" },
    { id: 7, content: "最拉辅助和最强辅助，一人500" },
    { id: 8, content: "亚军SVP 1K" },
    { id: 9, content: "爆种奖 500" },
    { id: 10, content: "瑞士轮第一个淘汰的队伍5人平分1K" },
    { id: 11, content: "弹幕票选表现最差A/S，300R/人" },
    { id: 12, content: "冠军打野 1K" },
  ],
};
```

### 4.2 金额格式化

```typescript
function formatAmount(amount: number): string {
  // 处理 0 或负数的边界情况
  if (amount <= 0) return '¥0';
  return `¥${amount.toLocaleString('zh-CN')}`;
}
// 输出示例：¥100,000 | ¥0
```

---

## 5. 文件变更清单

### 5.1 新增文件

| 文件路径 | 说明 |
|----------|------|
| `src/components/features/HeroSection/PrizePoolPanel.tsx` | 奖金池展示面板主组件 |

### 5.2 修改文件

| 文件路径 | 变更内容 |
|----------|----------|
| `src/components/features/HeroSection.tsx` | 引入 PrizePoolPanel，在直播信息下方渲染 |
| `src/data/types.ts` | 新增 PrizePoolData、RegularPrizeConfig、SpecialAwardConfig 类型 |
| `frontend/public/config.js` | 新增 `window.PRIZE_POOL_DATA` 配置项 |
| `deploy/config.js` | 新增 `window.PRIZE_POOL_DATA` 配置项 |

### 5.3 新增测试文件

| 文件路径 | 说明 |
|----------|------|
| `tests/unit/components/features/HeroSection/PrizePoolPanel.test.tsx` | PrizePoolPanel 单元测试 |
| `tests/unit/components/features/HeroSection.test.tsx` | 扩展 HeroSection 测试（新增奖金池相关用例） |

---

## 6. 测试设计

### 6.1 单元测试

**PrizePoolPanel.test.tsx**

```typescript
describe('PrizePoolPanel', () => {
  const mockData: PrizePoolData = {
    regular: { total: 100000, champion: 70000, runnerUp: 30000, championRatio: 0.7, runnerUpRatio: 0.3 },
    specialAwards: [
      { id: 1, content: '测试奖项1' },
      { id: 2, content: '测试奖项2' },
    ],
  };

  it('渲染常规奖金总额', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByText('¥100,000')).toBeInTheDocument();
  });

  it('渲染冠军奖金与占比', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByText('¥70,000')).toBeInTheDocument();
    expect(screen.getByText(/冠军.*70%/)).toBeInTheDocument();
  });

  it('渲染亚军奖金与占比', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByText('¥30,000')).toBeInTheDocument();
    expect(screen.getByText(/亚军.*30%/)).toBeInTheDocument();
  });

  it('渲染特殊奖项列表', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByText('测试奖项1')).toBeInTheDocument();
    expect(screen.getByText('测试奖项2')).toBeInTheDocument();
  });

  it('特殊奖项不展示赞助人名称', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.queryByText('为何如此衰')).not.toBeInTheDocument();
  });

  it('无特殊奖项时仅展示常规奖金', () => {
    const noSpecial = { ...mockData, specialAwards: [] };
    render(<PrizePoolPanel data={noSpecial} />);
    expect(screen.getByText('¥100,000')).toBeInTheDocument();
    expect(screen.queryByText('特殊奖项')).not.toBeInTheDocument();
  });

  it('无常规奖金时仅展示特殊奖项', () => {
    const noRegular = { ...mockData, regular: { total: 0, champion: 0, runnerUp: 0 } };
    render(<PrizePoolPanel data={noRegular} />);
    expect(screen.queryByText('常规奖金')).not.toBeInTheDocument();
    expect(screen.getByText('测试奖项1')).toBeInTheDocument();
  });
});
```

**HeroSection.test.tsx（扩展）**

```typescript
describe('HeroSection PrizePool', () => {
  beforeEach(() => {
    // @ts-ignore
    window.PRIZE_POOL_DATA = {
      regular: { total: 100000, champion: 70000, runnerUp: 30000 },
      specialAwards: [{ id: 1, content: '测试奖项' }],
    };
  });

  afterEach(() => {
    // @ts-ignore
    delete window.PRIZE_POOL_DATA;
  });

  it('有配置时渲染奖金池区域', () => {
    render(<HeroSection />);
    expect(screen.getByText('赛事奖金池')).toBeInTheDocument();
  });

  it('无配置时不渲染奖金池区域', () => {
    // @ts-ignore
    delete window.PRIZE_POOL_DATA;
    render(<HeroSection />);
    expect(screen.queryByText('赛事奖金池')).not.toBeInTheDocument();
  });
});
```

### 6.2 E2E 测试

**P0-05-prize-pool.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('奖金池展示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 跳过封面
    await page.click('body');
  });

  test('奖金池区域在 HeroSection 内显示', async ({ page }) => {
    const prizePool = page.locator('#hero >> text=赛事奖金池');
    await expect(prizePool).toBeVisible();
  });

  test('常规奖金金额展示正确', async ({ page }) => {
    await expect(page.locator('text=¥100,000')).toBeVisible();
    await expect(page.locator('text=¥70,000')).toBeVisible();
    await expect(page.locator('text=¥30,000')).toBeVisible();
  });

  test('特殊奖项纵向滚动展示', async ({ page }) => {
    const scrollContainer = page.locator('[data-testid="special-awards-scroll"]');
    await expect(scrollContainer).toBeVisible();
  });

  test('移动端上下堆叠布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const grid = page.locator('[data-testid="prize-pool-grid"]');
    await expect(grid).toHaveClass(/grid-cols-1/);
  });
});
```

---

## 7. 开发步骤

### Step 1: 类型定义
- [ ] 在 `src/data/types.ts` 中新增 `PrizePoolData`、`RegularPrizeConfig`、`SpecialAwardConfig`
- [ ] 扩展全局 `Window` 接口声明 `PRIZE_POOL_DATA`

### Step 2: 配置文件
- [ ] 在 `frontend/public/config.js` 中新增 `window.PRIZE_POOL_DATA`
- [ ] 在 `deploy/config.js` 中新增 `window.PRIZE_POOL_DATA`

### Step 3: 核心组件开发
- [ ] 创建 `PrizePoolPanel.tsx`
  - [ ] 实现 `PrizePoolTitle`（标题 + 数字动画）
  - [ ] 实现 `RegularPrizeCard`（常规奖金卡片）
  - [ ] 实现 `SpecialAwardsCard`（特殊奖项 + 纵向滚动）
- [ ] 金额格式化工具函数

### Step 4: 集成到 HeroSection
- [ ] 修改 `HeroSection.tsx`，在直播信息下方引入 `PrizePoolPanel`
- [ ] 读取 `window.PRIZE_POOL_DATA` 传入组件
- [ ] 无配置时返回 `null`

### Step 5: 样式与动画
- [ ] 实现响应式布局（PC 两列 / 移动端单列）
- [ ] 实现数字滚动增长动画
- [ ] 实现特殊奖项纵向滚动动画
- [ ] 实现卡片悬停效果

### Step 6: 测试
- [ ] 编写 `PrizePoolPanel.test.tsx`
- [ ] 扩展 `HeroSection.test.tsx`
- [ ] 编写 E2E 测试 `P0-05-prize-pool.spec.ts`
- [ ] 运行全部测试确保通过

### Step 7: 代码检查
- [ ] 运行 `npm run lint`
- [ ] 运行 `npm run typecheck`
- [ ] 运行 `npm run test:unit`
- [ ] 运行 `npm run test:e2e`

---

## 8. 风险与回滚

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| HeroSection 高度超出视口 | 页面布局错乱 | 奖金池区域使用 `max-height` 限制，移动端适当缩小 |
| 配置数据格式错误 | 组件渲染异常 | 增加数据校验，格式错误时静默不渲染 |
| 动画性能问题 | 页面卡顿 | 使用 `will-change` 优化，支持 `prefers-reduced-motion` |

**回滚方案**：删除 `HeroSection.tsx` 中的 `PrizePoolPanel` 引用即可恢复原有布局。

---

## 9. 参考代码

### 9.1 参考组件
- [HeroSection.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/src/components/features/HeroSection.tsx) - 扩展目标组件
- [SpecialAwards.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/src/components/features/ThanksSection/SpecialAwards.tsx) - 纵向滚动参考
- [DecorativeIcons.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/src/components/features/ThanksSection/DecorativeIcons.tsx) - 装饰图标

### 9.2 参考测试
- [HeroSection.test.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/tests/unit/components/features/HeroSection.test.tsx) - 现有测试模式

---

*文档结束，待审核。*
