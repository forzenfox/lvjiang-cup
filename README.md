# 驴酱杯电竞赛事管理系统

一个基于 React + TypeScript + Vite 构建的现代化电竞赛事管理平台，支持战队管理、赛程安排、直播配置等功能。

## 功能特性

### 前台展示
- **赛事首页**：展示赛事信息、直播入口、战队介绍
- **战队展示**：展示参赛战队及其队员信息（上单、打野、中单、AD、辅助）
- **赛程查看**：支持瑞士轮和淘汰赛双阶段赛程展示
- **直播观看**：集成直播平台链接，实时观看比赛

### 后台管理
- **仪表盘**：概览系统状态和管理入口
- **战队管理**：添加、编辑、删除战队及队员信息
- **赛程管理**：
  - 瑞士轮赛程管理（支持战绩记录）
  - 淘汰赛赛程管理（支持自动晋级逻辑）
  - 比赛结果录入和更新
- **直播配置**：配置直播标题、链接、平台和直播状态

## 技术栈

- **前端框架**：React 18
- **开发语言**：TypeScript
- **构建工具**：Vite 6
- **路由管理**：React Router DOM 7
- **状态管理**：Zustand 5
- **样式方案**：Tailwind CSS 3
- **UI 组件**：Radix UI
- **动画效果**：Framer Motion
- **图标库**：Lucide React
- **通知组件**：Sonner

## 项目结构

```
src/
├── components/
│   ├── features/          # 功能组件
│   │   ├── HeroSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── ScheduleSection.tsx
│   │   ├── SwissStage.tsx
│   │   ├── EliminationStage.tsx
│   │   ├── BracketMatchCard.tsx
│   │   └── BracketConnector.tsx
│   ├── layout/            # 布局组件
│   │   ├── Layout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── ui/                # UI 基础组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   └── confirm-dialog.tsx
│   └── icons/             # 图标组件
├── pages/
│   ├── Home.tsx           # 首页
│   └── admin/
│       ├── Login.tsx      # 管理员登录
│       ├── Dashboard.tsx  # 管理仪表盘
│       ├── Teams.tsx      # 战队管理
│       ├── Schedule.tsx   # 赛程管理
│       └── Stream.tsx     # 直播配置
├── types/
│   └── index.ts           # TypeScript 类型定义
├── mock/
│   ├── data.ts            # 模拟数据
│   └── service.ts         # 模拟服务
├── utils/
│   └── datetime.ts        # 日期时间工具
├── hooks/
│   └── useTheme.ts        # 主题 Hook
├── lib/
│   └── utils.ts           # 工具函数
├── App.tsx                # 应用入口
└── main.tsx               # 主入口
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npm run check
```

### 预览生产构建

```bash
npm run preview
```

## 核心数据模型

### 战队 (Team)
```typescript
interface Team {
  id: string;
  name: string;        // 战队名称
  logo: string;        // 队标链接
  players: Player[];   // 队员列表
  description: string; // 战队简介
}
```

### 队员 (Player)
```typescript
interface Player {
  id: string;
  name: string;        // 姓名
  avatar: string;      // 头像链接
  position: string;    // 位置（上单/打野/中单/AD/辅助）
  description: string; // 简介
}
```

### 比赛 (Match)
```typescript
interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
  round: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  startTime: string;
  stage: 'swiss' | 'elimination';
  swissRecord?: string;      // 瑞士轮战绩
  swissDay?: number;         // 瑞士轮天数
  eliminationBracket?: 'winners' | 'losers' | 'grand_finals';
  nextMatchId?: string;      // 晋级后的下一场比赛
  nextMatchSlot?: 'teamA' | 'teamB';
}
```

## 管理后台访问

管理后台地址：`/admin`

默认登录信息（开发环境）：
- 用户名：`admin`
- 密码：`admin`

## 赛程赛制说明

### 瑞士轮阶段
- 采用战绩匹配机制（相同战绩的队伍相互对战）
- 支持战绩记录：0-0, 1-0, 0-1, 1-1, 0-2, 1-2, 2-0, 2-1
- 达到 3 胜晋级，3 败淘汰

### 淘汰赛阶段
- 双败淘汰制
- 包含胜者组、败者组和总决赛
- 支持自动晋级逻辑：比赛结束后自动将胜者推进到下一轮

## 开发指南

### 添加新页面

1. 在 `src/pages/` 下创建页面组件
2. 在 `App.tsx` 中添加路由配置
3. 如需权限保护，使用 `ProtectedRoute` 包裹

### 添加新组件

1. 功能组件放在 `src/components/features/`
2. UI 组件放在 `src/components/ui/`
3. 遵循现有组件的样式和类型规范

### 状态管理

使用 Zustand 进行全局状态管理，示例：

```typescript
import { create } from 'zustand';

interface StoreState {
  data: DataType;
  setData: (data: DataType) => void;
}

export const useStore = create<StoreState>((set) => ({
  data: initialData,
  setData: (data) => set({ data }),
}));
```

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

---

**注意**：当前版本使用模拟数据（mock data）进行开发演示，生产环境需要接入真实后端 API。
