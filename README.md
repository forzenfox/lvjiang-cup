# 驴酱杯电竞赛事管理系统

一个基于 React + TypeScript + Vite 构建的现代化电竞赛事管理平台，支持战队管理、赛程安排、直播配置、对战数据管理等功能。

## 功能特性

### 前台展示
- **赛事首页**：展示赛事信息、直播入口、战队介绍
- **战队展示**：展示参赛战队及其队员信息（top、jungle、mid、bot、support）
- **赛程查看**：支持瑞士轮和淘汰赛双阶段赛程展示
- **对战数据查看**：查看比赛详细数据（英雄选择、玩家统计、雷达图对比）
- **视频回看**：赛事视频列表展示与播放
- **直播观看**：集成直播平台链接，实时观看比赛

### 后台管理
- **仪表盘**：概览系统状态和管理入口
- **战队管理**：添加、编辑、删除战队及队员信息
- **战队导入**：Excel 批量导入战队和队员信息
- **赛程管理**：
  - 瑞士轮赛程管理（支持战绩记录）
  - 淘汰赛赛程管理
  - 比赛结果录入和更新
- **对战数据管理**：Excel 批量导入对战数据，支持在线编辑
- **主播管理**：主播信息配置和展示排序
- **视频管理**：赛事视频上传、编辑、排序
- **直播配置**：配置直播标题、链接、平台和直播状态

## 技术栈

### 前端
- **框架**：React 18
- **语言**：TypeScript
- **构建**：Vite 6
- **路由**：React Router DOM 7
- **状态管理**：Zustand 5
- **样式**：Tailwind CSS 3
- **UI 组件**：Radix UI
- **动画**：Framer Motion
- **图标**：Lucide React
- **测试**：Vitest（单元测试）、Playwright（E2E 测试）

### 后端
- **框架**：NestJS
- **数据库**：SQLite + better-sqlite3
- **缓存**：node-cache
- **认证**：JWT + Passport
- **文档**：Swagger/OpenAPI
- **容器化**：Docker

## 项目结构

```
.
├── frontend/              # 前端应用 (React + Vite)
│   ├── src/
│   │   ├── api/          # API 客户端层
│   │   ├── components/   # React 组件 (common, features, layout, ui 等)
│   │   ├── pages/        # 页面组件 (Home, admin 管理等)
│   │   ├── store/        # Zustand 状态管理
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── types/        # TypeScript 类型定义
│   │   ├── utils/        # 工具函数
│   │   └── constants/    # 常量配置
│   ├── tests/
│   │   ├── unit/         # Vitest 单元测试
│   │   └── e2e/          # Playwright E2E 测试
│   └── Dockerfile        # 前端 Docker 构建文件
│
├── backend/               # 后端应用 (NestJS)
│   ├── src/
│   │   ├── modules/      # 业务模块
│   │   │   ├── admin/    # 管理操作（数据清空/槽位初始化）
│   │   │   ├── auth/     # JWT 认证模块
│   │   │   ├── match-data/# 对战数据模块（导入/导出/编辑）
│   │   │   ├── matches/  # 比赛管理模块
│   │   │   ├── streamers/# 主播展示模块
│   │   │   ├── streams/  # 直播流模块
│   │   │   ├── teams/    # 战队管理模块（含 Excel 导入）
│   │   │   ├── tracking/ # 数据追踪模块
│   │   │   ├── upload/   # 文件上传模块
│   │   │   ├── utils/    # Excel 工具模块
│   │   │   └── videos/   # 视频管理模块
│   │   ├── cache/        # 缓存模块 (node-cache)
│   │   ├── common/       # 公共模块 (拦截器/过滤器)
│   │   ├── config/       # 配置模块 (app/upload)
│   │   └── database/     # 数据库模块 (better-sqlite3)
│   ├── test/
│   │   ├── unit/         # 单元测试
│   │   ├── integration/  # 集成测试
│   │   └── e2e/          # 端到端测试
│   └── Dockerfile        # 后端 Docker 构建文件
│
└── deploy/                # 部署配置
    ├── README.md          # 部署指南
    ├── docker-compose.yml # Docker Compose 配置
    ├── setup.sh           # 一键部署脚本
    ├── update.sh          # 更新脚本
    ├── backup.sh          # 备份脚本
    └── npm/               # Nginx Proxy Manager 配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- Docker >= 20（生产环境）

### 本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/forzenfox/lvjiang-cup.git
cd lvjiang-cup
```

#### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

#### 3. 启动开发服务

```bash
# 启动后端（端口 3000）
cd backend
npm run start:dev

# 启动前端（端口 5173）
cd frontend
npm run dev
```

访问 http://localhost:5173 查看应用。

### 生产环境部署

本项目采用 **Nginx Proxy Manager 统一网关** 的容器化部署方案，适用于多应用服务器环境。

#### 快速部署

```bash
# 1. 创建部署目录
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 2. 下载统一部署脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/setup.sh -o setup.sh
chmod +x setup.sh

# 3. 运行部署脚本（自动完成 NPM 部署和应用部署）
./setup.sh

# 或指定版本标签
./setup.sh v1.0.0
```

详细部署指南请查看：[deploy/README.md](deploy/README.md)

## 管理后台访问

管理后台地址：`/admin`

默认登录信息（开发环境）：
- 用户名：`admin`
- 密码：`admin123`

**生产环境请务必修改默认密码！**

## 赛程赛制说明

### 瑞士轮阶段
- 采用战绩匹配机制（相同战绩的队伍相互对战）
- 支持战绩记录：0-0, 1-0, 0-1, 1-1, 0-2, 1-2, 2-0, 2-1
- 达到 3 胜晋级，3 败淘汰

### 淘汰赛阶段
- 双败淘汰制
- 包含胜者组、败者组和总决赛

## CI/CD

### GitHub Actions 工作流

#### 1. 后端 Docker 镜像构建（`docker-build-backend.yml`）

**触发条件**：手动触发

**功能**：自动构建后端 Docker 镜像并推送到 GitHub Container Registry (GHCR)

#### 2. 前端 Docker 镜像构建（`docker-build-frontend.yml`）

**触发条件**：手动触发

**功能**：自动构建前端 Docker 镜像并推送到 GitHub Container Registry (GHCR)

#### 3. Demo 环境部署（`deploy.yml`）

**触发条件**：手动触发

**功能**：部署到 GitHub Pages（仅在 `release/demo` 分支）

### 服务器手动更新

```bash
# 1. 连接到服务器
ssh user@your-server

# 2. 切换到部署目录
cd /opt/lvjiang-cup/deploy

# 3. 更新到最新版本
./update.sh

# 或更新到指定版本
./update.sh v1.0.0
```

## 常用命令

### 前端

```bash
cd frontend

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
npm run check

# 运行单元测试（Vitest）
npm run test
npm run test:watch
npm run test:coverage

# 运行 E2E 测试（Playwright）
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug
```

### 后端

```bash
cd backend

# 开发模式
npm run start:dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start:prod

# 运行测试
npm run test
npm run test:watch
npm run test:e2e
npm run test:cov
```

### Docker

```bash
# 构建镜像
docker build -t lvjiang-backend ./backend
docker build -t lvjiang-frontend ./frontend

# 本地测试
docker-compose -f deploy/docker-compose.yml up -d

# 查看日志
docker-compose logs -f
```

## 开发指南

### 添加新页面

1. 在 `frontend/src/pages/` 下创建页面组件
2. 在 `App.tsx` 中添加路由配置
3. 如需权限保护，使用 `ProtectedRoute` 包裹

### 添加新组件

1. 功能组件放在 `frontend/src/components/features/`
2. UI 组件放在 `frontend/src/components/ui/`
3. 遵循现有组件的样式和类型规范

### 状态管理

使用 Zustand 进行全局状态管理：

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

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 相关文档

- [部署指南](deploy/README.md)
- [Nginx Proxy Manager 配置](deploy/npm/README.md)
- [项目文档索引](docs/README.md)

## 联系方式

- 作者：ForzenFox
- 项目地址：https://github.com/forzenfox/lvjiang-cup
