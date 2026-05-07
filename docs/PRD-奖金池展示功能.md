# 驴酱杯赛事平台 - 奖金池展示功能 PRD

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 奖金池展示功能产品需求文档 |
| 产品版本 | v1.0.0 |
| 创建日期 | 2026-05-01 |
| 文档状态 | 待审核 |
| 目标受众 | 前端开发、产品经理 |

---

## 2. 背景与目标

### 2.1 背景
当前驴酱杯赛事首页包含以下模块：封面轮播（StartBox）、Hero直播区、视频轮播、主播展示、战队展示、赛程安排（含瑞士轮与淘汰赛）、特别鸣谢。其中"特别鸣谢"模块已展示赞助商列表、特殊奖项及幕后工作人员信息。

赞助数据通过 `window.THANKS_DATA` 全局配置注入，包含 `sponsors`（赞助商列表）和 `staff`（工作人员列表）。每位赞助商包含 `sponsorName`（名称）、`sponsorContent`（赞助金额/内容）、`specialAward`（特殊奖项说明，可选）。

### 2.2 目标
在现有 **HeroSection 模块内**增加**奖金池展示**，让观众在进入首页时即可直观了解：
- 赛事总奖金规模
- 常规奖金的分配规则与金额
- 特殊奖项的明细

从而提升赛事的专业感与透明度，增强观众参与感。

---

## 3. 需求范围

### 3.1 In-Scope（范围内）
- 在现有 **HeroSection 组件内**新增"奖金池"展示区域
- 通过专门的配置项 `window.PRIZE_POOL_DATA` 读取奖金数据，无需客户端计算
- 区分"常规奖金"与"特殊奖项"两类展示
- 常规奖金按冠军70%、亚军30%规则展示分配金额
- 响应式布局（PC端与移动端适配）
- 动画入场效果（与现有页面风格一致）

### 3.2 Out-of-Scope（范围外）
- 后端API接口开发（仍使用现有 `THANKS_DATA` 配置方式）
- 奖金数据的动态编辑功能（仍通过部署配置文件修改）
- 多币种支持（当前仅人民币）
- 奖金发放流程管理

---

## 4. 功能需求

### 4.1 奖金池区域定位

**位置**：在现有 **HeroSection 组件内部**新增奖金池展示区域，放置于现有直播信息/比赛状态内容下方，作为 HeroSection 的一部分统一呈现。

**布局方式**：
- HeroSection 现有内容（标题、直播按钮/状态）保持顶部居中
- 奖金池区域位于其下方，与上方内容保持合理间距
- 整体仍为一个完整的 `section#hero`，不新增独立区块或导航锚点

### 4.2 数据配置规则

奖金池数据通过独立的 `window.PRIZE_POOL_DATA` 配置项注入，前端直接读取展示，**无需客户端计算**。

#### 4.2.1 配置项结构
```javascript
window.PRIZE_POOL_DATA = {
  // 常规奖金配置
  regular: {
    total: 100000,        // 常规奖金总额（单位：元）
    champion: 70000,      // 冠军奖金（单位：元）
    runnerUp: 30000,      // 亚军奖金（单位：元）
    championRatio: 0.7,   // 冠军比例（可选，用于展示）
    runnerUpRatio: 0.3,   // 亚军比例（可选，用于展示）
  },
  // 特殊奖项列表
  specialAwards: [
    { id: 1, content: "8强每个队伍1K" },
    { id: 2, content: "冠军队伍每人750g蓝莓果干+250g参片" },
    { id: 3, content: "FMVP 1K，冠军上单 500" },
    { id: 4, content: "4强队伍每人一份贡菜千层肚" },
    // ... 更多特殊奖项
  ],
};```

#### 4.2.2 配置说明
| 字段 | 类型 | 说明 |
|------|------|------|
| `regular.total` | `number` | 常规奖金总额，直接展示 |
| `regular.champion` | `number` | 冠军奖金金额，直接展示 |
| `regular.runnerUp` | `number` | 亚军奖金金额，直接展示 |
| `regular.championRatio` | `number` | 冠军占比，用于UI展示（如"70%"） |
| `regular.runnerUpRatio` | `number` | 亚军占比，用于UI展示（如"30%"） |
| `specialAwards` | `array` | 特殊奖项列表，每条仅包含奖项内容 |

> 注：所有金额字段均为数值类型（元），前端负责格式化为展示文本（如 `¥70,000`）。特殊奖项仅展示奖项内容，赞助人信息已在鸣谢模块展示，此处不再重复。

#### 4.2.3 配置位置
在 `frontend/public/config.js` 与 `deploy/config.js` 中增加 `window.PRIZE_POOL_DATA` 配置项，与现有的 `window.APP_CONFIG`、`window.THANKS_DATA` 并列。

### 4.3 界面展示需求

#### 4.3.1 整体布局（位于 HeroSection 内部）
```
┌─────────────────────────────────────────────┐
│                                             │
│           驴酱杯                            │
│        驴酱公会终极对决                      │
│                                             │
│      [ 观看直播 / 比赛即将开始 ]              │
│                                             │
├─────────────────────────────────────────────┤
│              奖金池标题区                      │
│         （动态金额数字 + 装饰效果）             │
├─────────────────────────────────────────────┤
│                                             │
│   ┌──────────────────┐  ┌────────────────┐  │
│   │    常规奖金       │  │    特殊奖项     │  │
│   │                  │  │  ┌──────────┐  │  │
│   │  总奖金: ¥X      │  │  │ ▲ 奖项1  │  │  │
│   │                  │  │  │ ▲ 奖项2  │  │  │
│   │  ┌────┐  ┌────┐  │  │  │ ▲ 奖项3  │  │  │
│   │  │冠军│  │亚军│  │  │  │ ▲ 奖项4  │  │  │
│   │  │70% │  │30% │  │  │  └──────────┘  │  │
│   │  └────┘  └────┘  │  │   向上滚动区域  │  │
│   └──────────────────┘  └────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

#### 4.3.2 标题区
- 大标题："赛事奖金池" 或 "总奖金池"
- 动态金额：展示 `regular.total` 配置的常规奖金总额
- 金额动画：数字从0滚动增长到最终金额，持续约1.5秒
- 视觉风格：金色/琥珀色渐变字体，与 HeroSection 标题风格呼应

#### 4.3.3 常规奖金卡片
- 左侧卡片，标题"常规奖金"
- 展示总常规奖金金额
- 下方两个子卡片：
  - 冠军：金额 + 占比（70%），使用金色/奖杯图标
  - 亚军：金额 + 占比（30%），使用银色图标
- 背景：深色渐变，带微光边框效果

#### 4.3.4 特殊奖项卡片
- 右侧卡片，标题"特殊奖项"
- 采用**纵向向上滚动**形式展示所有特殊奖项
- 滚动效果参考现有"鸣谢模块"的 `SpecialAwards` 组件：
  - 内容从下往上无缝循环滚动
  - 内容复制一份用于无缝衔接
  - 当内容超出容器高度时自动开始滚动
  - 滚动速度固定（约 20s 完成一个周期）
  - 每条奖项为独立卡片，带 trophy 图标
- 每条仅展示奖项内容，不展示赞助人名称
- 背景：与现有 `SpecialAwards` 组件风格一致（粉/紫渐变）

#### 4.3.5 空状态
- 若无赞助商数据，整个奖金池区块不渲染（返回 `null`）
- 若常规奖金为0，仅展示特殊奖项区域
- 若特殊奖项为空，仅展示常规奖金区域

### 4.4 交互需求

| 交互 | 描述 |
|------|------|
| 入场动画 | 使用 `framer-motion` 的 `whileInView`，区块进入视口时触发淡入+上移动画 |
| 数字动画 | 金额数字使用滚动增长动画（如 `framer-motion` 的 `useMotionValue` + `animate`） |
| 悬停效果 | 卡片悬停时边框高亮，轻微放大（`scale: 1.02`） |
| 响应式 | PC端左右两列布局，移动端上下堆叠布局 |

### 4.5 响应式适配

| 断点 | 布局 | 字体大小调整 |
|------|------|-------------|
| PC（≥1024px） | 左右两列网格（`grid-cols-2`） | 标题 `text-4xl`，金额 `text-3xl` |
| 平板（768px-1023px） | 左右两列，间距缩小 | 标题 `text-3xl`，金额 `text-2xl` |
| 移动端（<768px） | 上下堆叠（`grid-cols-1`） | 标题 `text-2xl`，金额 `text-xl` |

---

## 5. 技术方案

### 5.1 组件结构
由于奖金池展示内嵌于 HeroSection，采用以下结构：

```
components/features/HeroSection/
├── HeroSection.tsx           # 现有主组件（扩展，读取 window.PRIZE_POOL_DATA）
├── PrizePoolOverlay.tsx      # 奖金池展示子组件（新增）
└── ...existing files
```

或直接在 `HeroSection.tsx` 内联实现奖金池区域，保持组件扁平化。

> 无需金额计算 Hook，前端直接读取配置数据并展示。

### 5.2 核心逻辑

#### 数据读取与格式化
前端通过全局配置对象直接读取奖金池数据：

```typescript
interface PrizePoolData {
  regular: {
    total: number;
    champion: number;
    runnerUp: number;
    championRatio?: number;
    runnerUpRatio?: number;
  };
  specialAwards: Array<{
    id: number;
    content: string;
  }>;
}

// 读取配置
const prizePoolData: PrizePoolData | undefined = (window as any).PRIZE_POOL_DATA;

// 金额格式化
function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`;
}
```

> 前端仅负责数据读取与格式化展示，不涉及任何金额计算逻辑。

### 5.3 集成方式

1. **扩展 HeroSection**：在现有 `src/components/features/HeroSection.tsx` 中新增奖金池展示区域
2. **类型定义**：在 `src/data/types.ts` 中增加 `PrizePoolData` 类型定义
3. **样式规范**：使用 Tailwind CSS，与 HeroSection 现有暗黑主题风格统一
4. **无需修改 Home.tsx**：奖金池作为 HeroSection 的一部分，不新增独立区块

### 5.4 依赖
- `framer-motion`：入场动画与数字滚动动画（项目已依赖）
- `lucide-react`：图标（奖杯、奖牌等，项目已依赖）
- 无需新增外部依赖

---

## 6. 非功能需求

### 6.1 性能
- 数据直接从配置读取，无计算开销与网络请求
- 动画使用 GPU 加速属性（`transform`、`opacity`）

### 6.2 可访问性
- 金额数字使用 `aria-label` 标注完整读法
- 颜色对比度符合 WCAG 2.1 AA 标准
- 支持 `prefers-reduced-motion` 媒体查询，减少动画

### 6.3 兼容性
- 支持 Chrome、Firefox、Safari、Edge 最新两个主版本
- 移动端 iOS Safari 与 Android Chrome 适配

---

## 7. 测试策略

### 7.1 单元测试（Vitest + React Testing Library）
- 奖金池组件测试：
  - 正确读取 `window.PRIZE_POOL_DATA` 并渲染金额与奖项列表
  - 无配置数据时不渲染
  - 金额格式化正确（如 `70000` → `¥70,000`）
  - 响应式布局类名正确

### 7.2 E2E 测试（Playwright）
- 验证奖金池区域在 HeroSection 内正确显示
- 验证金额计算与配置数据一致
- 验证移动端布局切换

---

## 8. 数据与配置

### 8.1 配置项示例
在 `frontend/public/config.js` 与 `deploy/config.js` 中增加：

```javascript
// 奖金池数据配置
// - regular: 常规奖金
//   - total: 常规奖金总额（元）
//   - champion: 冠军奖金（元）
//   - runnerUp: 亚军奖金（元）
//   - championRatio: 冠军占比（可选，用于UI展示）
//   - runnerUpRatio: 亚军占比（可选，用于UI展示）
// - specialAwards: 特殊奖项列表
//   - id: 唯一标识
//   - sponsorName: 赞助人名称
//   - awardContent: 奖项内容说明
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

> 注：`window.PRIZE_POOL_DATA` 与现有的 `window.THANKS_DATA` 相互独立，奖金池数据由运营人员手动配置，不依赖赞助数据的自动计算。

---

## 9. 验收标准

- [ ] HeroSection 内出现"奖金池"展示区域，位于直播信息/比赛状态下方
- [ ] 区块标题展示总奖金金额，数字带滚动增长动画
- [ ] 左侧"常规奖金"卡片展示总常规奖金、冠军金额（70%）、亚军金额（30%）
- [ ] 右侧"特殊奖项"区域以纵向向上滚动形式展示所有奖项内容
- [ ] 金额展示与 `window.PRIZE_POOL_DATA` 配置一致
- [ ] PC端左右两列布局，移动端上下堆叠布局
- [ ] 无 `window.PRIZE_POOL_DATA` 配置时区块不显示
- [ ] 通过所有单元测试与E2E测试
- [ ] 代码通过 ESLint 检查与类型检查

---

## 10. 风险与依赖

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 配置数据遗漏 | 奖金池不显示 | 明确配置文档，部署时检查配置完整性 |
| 特殊奖项条目过多 | 布局溢出 | 采用纵向向上滚动展示，参考鸣谢模块 SpecialAwards 组件实现 |
| 与现有动画性能冲突 | 页面卡顿 | 使用 `will-change` 与 `transform` 优化 |

---

## 11. 附录

### 11.1 参考组件
- [HeroSection.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/src/components/features/HeroSection.tsx) - 标题动画与视觉风格参考
- [ThanksSection/index.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/src/components/features/ThanksSection/index.tsx) - 区块布局与动画参考
- [SpecialAwards.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/src/components/features/ThanksSection/SpecialAwards.tsx) - 特殊奖项展示风格参考

### 11.2 相关文件
- [deploy/config.js](file:///d:/workspace/lvjiang-cup-test/deploy/config.js) - 赞助数据源配置
- [frontend/src/data/types.ts](file:///d:/workspace/lvjiang-cup-test/frontend/src/data/types.ts) - 类型定义
- [frontend/src/pages/Home.tsx](file:///d:/workspace/lvjiang-cup-test/frontend/src/pages/Home.tsx) - 首页组件

---

*文档结束，待审核。*
