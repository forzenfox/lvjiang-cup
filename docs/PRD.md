# 驴酱杯LOL娱乐赛事网站 - 产品需求文档 (PRD)

> 版本: v2.0  
> 更新日期: 2026-03-10  
> 状态: 已实现demo并部署

---

## 1. 产品概述

驴酱公会LOL娱乐赛事网站是一个仿照LPL官方赛事网站的单页面滚动式网站，为斗鱼驴酱公会的主播和水友提供赛事信息展示平台。网站采用竞技风格设计，同时融入娱乐元素，为观众提供直播跳转、战队信息和赛程查看功能。

### 1.1 技术栈
- **前端框架**: React + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **UI组件**: Radix UI + 自定义组件
- **状态管理**: Zustand
- **动画效果**: Framer Motion
- **数据持久化**: localStorage (Mock数据服务)

---

## 2. 核心功能

### 2.1 用户角色

| 角色 | 访问方式 | 核心权限 |
|------|----------|----------|
| 游客 | 直接访问网站 | 查看赛事信息、战队信息、赛程信息，跳转到直播间 |
| 管理员 | 通过 `/admin` 路径访问后台 | 配置直播链接、管理战队和队员信息、管理赛程信息、管理瑞士轮晋级名单 |

### 2.2 功能模块

网站包含以下主要页面：

1. **主页面** (`/`): 单页面滚动设计，包含英雄区域、战队区域、赛程区域
2. **管理后台页面** (`/admin/*`): 独立的配置管理界面，包含仪表盘、直播管理、战队管理、赛程管理

### 2.3 页面详情

| 页面名称 | 模块名称 | 功能描述 |
|-----------|-------------|-------------|
| 主页面 | 英雄区域 | 显示赛事横幅、标题、观看直播按钮，点击跳转到指定直播间，显示直播状态 |
| 主页面 | 战队区域 | 展示参赛战队信息和队员信息卡片，显示队员位置图标 |
| 主页面 | 赛程区域 | 以Tab切换展示瑞士轮和淘汰赛赛程，瑞士轮按战绩分组展示，淘汰赛使用双败赛制树状图 |
| 管理后台 | 仪表盘 | 概览各管理模块状态，提供数据管理功能（加载Mock数据/清空数据） |
| 管理后台 | 直播管理 | 表单配置直播标题、链接、状态，保存后实时生效 |
| 管理后台 | 战队管理 | 卡片式展示，支持添加/编辑/删除战队，编辑时固定5个位置输入框 |
| 管理后台 | 赛程管理 | Tab切换瑞士轮/淘汰赛，瑞士轮可视化编辑器支持晋级名单管理，淘汰赛支持比分编辑 |

### 5.3 响应式设计

采用桌面端优先设计，适配1200px以上宽度。移动端通过媒体查询进行适配：

| 断点 | 布局调整 |
|------|----------|
| < 640px (sm) | 战队卡片单列，赛程区域横向滚动 |
| 640px - 1024px (md) | 战队卡片2列，导航栏适配 |
| > 1024px (lg) | 战队卡片4列，完整展示所有内容 |

---

## 6. 项目结构

```
src/
├── components/
│   ├── features/          # 功能组件
│   │   ├── HeroSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── ScheduleSection.tsx
│   │   ├── SwissStage.tsx          # 瑞士轮展示
│   │   ├── EliminationStage.tsx    # 淘汰赛展示
│   │   └── swiss/                  # 瑞士轮子组件
│   ├── layout/            # 布局组件
│   │   ├── Layout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── ui/                # 基础UI组件
│   └── icons/             # 图标组件
├── pages/
│   ├── Home.tsx
│   └── admin/
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── Stream.tsx
│       ├── Teams.tsx
│       ├── Schedule.tsx
│       └── components/    # 管理后台子组件
├── store/
│   └── advancementStore.ts  # 晋级状态管理
├── mock/
│   ├── data.ts            # Mock数据
│   └── service.ts         # Mock服务
├── types/
│   └── index.ts           # TypeScript类型定义
└── utils/
    └── datetime.ts        # 日期时间工具
```

---

## 7. API接口

### 7.1 Mock服务接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `getTeams()` | GET | 获取所有战队 |
| `updateTeam(team)` | PUT | 更新战队信息 |
| `addTeam(team)` | POST | 添加新战队 |
| `deleteTeam(id)` | DELETE | 删除战队 |
| `getMatches()` | GET | 获取所有比赛 |
| `updateMatch(match)` | PUT | 更新比赛信息 |
| `addMatch(match)` | POST | 添加新比赛 |
| `getStreamInfo()` | GET | 获取直播信息 |
| `updateStreamInfo(info)` | PUT | 更新直播信息 |
| `resetAllData()` | POST | 重置为Mock数据 |
| `clearAllData()` | DELETE | 清空所有数据 |

---

## 8. 部署信息

- **部署平台**: GitHub
- **CI/CD**: GitHub Actions
- **域名**: 通过CNAME配置自定义域名
- **数据持久化**: 浏览器localStorage

---

## 9. 更新日志

### v2.0 (2026-03-10)
- 完整实现瑞士轮赛制展示和管理
- 实现双败淘汰赛可视化
- 添加晋级名单管理功能
- 优化响应式布局
- 添加数据管理功能(加载Mock/清空数据)

### v1.0 (初始版本)
- 基础页面结构
- 英雄区域、战队区域、赛程区域
- 管理后台基础功能 表单配置直播标题、链接、状态，保存后实时生效 |
| 管理后台 | 战队管理 | 卡片式展示，支持添加/编辑/删除战队，编辑时固定5个位置输入框 |
| 管理后台 | 赛程管理 | Tab切换瑞士轮/淘汰赛，瑞士轮可视化编辑器支持晋级名单管理，淘汰赛支持比分编辑 |

---

## 3. 核心流程

### 3.1 游客访问流程

```
graph TD
  A[游客访问首页] --> B[浏览英雄区域]
  B --> C[浏览战队区域]
  C --> D[浏览赛程区域]
  B --> E[点击观看直播]
  E --> F[跳转到斗鱼直播间]
  D --> G[切换瑞士轮/淘汰赛Tab]
```

### 3.2 管理员操作流程

```
graph TD
  A[访问 /admin] --> B[后台登录验证]
  B --> C[仪表盘]
  C --> D[直播管理]
  C --> E[战队管理]
  C --> F[赛程管理]
  F --> G[瑞士轮管理]
  F --> H[淘汰赛管理]
  D --> I[保存更新]
  E --> I
  G --> I
  H --> I
  I --> J[前台页面自动更新]
```

---

## 4. 数据模型

### 4.1 核心实体

```typescript
// 队员
interface Player {
  id: string;
  name: string;
  avatar: string;
  position: string; // top/jungle/mid/bot/support
  description: string;
  teamId?: string;
}

// 战队
interface Team {
  id: string;
  name: string;
  logo: string;
  players: Player[];
  description: string;
}

// 比赛
interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
  round: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  startTime: string;
  stage: 'swiss' | 'elimination';
  swissRecord?: string; // 瑞士轮战绩: "0-0", "1-0", "0-1", "1-1", "0-2", "1-2", "2-0", "2-1"
  swissDay?: number; // 瑞士轮第几天
  eliminationBracket?: 'winners' | 'losers' | 'grand_finals'; // 淘汰赛分组
  eliminationGameNumber?: number; // 淘汰赛比赛编号
}

// 直播信息
interface StreamInfo {
  title: string;
  url: string;
  isLive: boolean;
}

// 瑞士轮晋级结果
interface SwissAdvancementResult {
  winners2_0: string[];      // 2-0战绩晋级胜者组
  winners2_1: string[];      // 2-1战绩晋级胜者组
  losersBracket: string[];   // 晋级败者组
  eliminated3rd: string[];   // 积分第三淘汰
  eliminated0_3: string[];   // 0-3战绩淘汰
}
```

### 4.2 赛事赛制

#### 瑞士轮 (Swiss Stage)
- **参赛队伍**: 8支队伍
- **赛制规则**:
  - Round 1 (0-0): BO1
  - Round 2 High (1-0): BO3
  - Round 2 Low (0-1): BO3
  - Round 3 Mid (1-1): BO3
  - Round 3 Low (0-2): BO3
  - Round 4 Last Chance (1-2): BO3 积分循环
- **晋级规则**:
  - 2-0战绩: 晋级胜者组
  - 2-1战绩: 晋级胜者组
  - 败者组: 晋级败者组
  - 积分第三: 淘汰
  - 0-3战绩: 淘汰

#### 淘汰赛 (Elimination Stage)
- **参赛队伍**: 6支队伍 (双败赛制)
- **赛制结构**:
  - 胜者组半决赛 (2场)
  - 败者组第一轮 (2场)
  - 胜者组决赛 (1场)
  - 败者组第二轮 (1场)
  - 败者组决赛 (1场)
  - 总决赛 (1场)

---

## 5. 用户界面设计

### 5.1 设计风格

- **主色调**: 
  - 深蓝色 `#1E3A8A` (primary)
  - 金色 `#F59E0B` (secondary) - 用于高亮和CTA
- **辅助色**: 
  - 深灰色 `#374151`
  - 白色 `#FFFFFF`
  - 背景渐变: 从 primary 到 gray-900
- **按钮样式**: 圆角矩形，悬停时有发光效果，CTA按钮使用金色渐变
- **字体**: 系统默认字体栈
- **布局风格**: 单页面滚动，每个区域占满视口高度，使用卡片式布局
- **图标风格**: Lucide React 图标 + 自定义位置图标

### 5.2 页面设计概述

| 页面名称 | 模块名称 | UI元素 |
|-----------|-------------|-------------|
| 主页面 | 英雄区域 | 全屏背景图(LOL主题)，中央显示"驴酱杯"金色渐变标题，下方金色渐变按钮"观看直播"，显示直播状态 |
| 主页面 | 战队区域 | 网格布局展示战队卡片(1列/2列/4列响应式)，卡片包含战队logo、名称、队员头像列表和位置图标 |
| 主页面 | 赛程区域 | Tab切换瑞士轮/淘汰赛，瑞士轮按战绩分组展示，淘汰赛使用可视化双败赛制图 |
| 管理后台 | 仪表盘 | 概览卡片 + 数据管理区域(加载Mock/清空数据) |
| 管理后台 | 直播管理 |