# 驴酱杯电竞赛事管理系统

一个基于 React + TypeScript + Vite 构建的现代化电竞赛事管理平台，支持战队管理、赛程安排、直播配置等功能。

## 功能特性

### 前台展示
- **赛事首页**：展示赛事信息、直播入口、战队介绍
- **战队展示**：展示参赛战队及其队员信息（top、jungle、mid、bot、support）
- **赛程查看**：支持瑞士轮和淘汰赛双阶段赛程展示
- **直播观看**：集成直播平台链接，实时观看比赛

### 后台管理
- **仪表盘**：概览系统状态和管理入口
- **战队管理**：添加、编辑、删除战队及队员信息
- **赛程管理**：
  - 瑞士轮赛程管理（支持战绩记录）
  - 淘汰赛赛程管理
  - 比赛结果录入和更新
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

### 后端
- **框架**：NestJS
- **数据库**：SQLite
- **认证**：JWT
- **容器化**：Docker

## 项目结构

```
.
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── types/        # 类型定义
│   │   └── utils/        # 工具函数
│   ├── Dockerfile        # 前端 Docker 构建文件
│   └── package.json
│
├── backend/              # 后端应用
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 服务层
│   │   ├── entities/     # 数据模型
│   │   └── dto/          # 数据传输对象
│   ├── Dockerfile        # 后端 Docker 构建文件
│   └── package.json
│
└── deploy/               # 部署配置
    ├── docker-compose.yml
    ├── deploy.sh
    ├── npm/              # Nginx Proxy Manager 配置
    └── QUICKSTART.md     # 快速部署指南
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
npm run dev

# 启动前端（端口 5173）
cd frontend
npm run dev
```

访问 http://localhost:5173 查看应用。

### 生产环境部署（方案 C）

本项目采用 **Nginx Proxy Manager 统一网关** 的容器化部署方案，适用于多应用服务器环境。

#### 部署架构

```
用户 → Cloudflare → Nginx Proxy Manager (80/443)
                          │
                          ├─→ 前端容器 (3001)
                          └─→ 后端容器 (3000)
```

#### 快速部署（1 步完成）

**使用统一部署脚本**（推荐）

```bash
# 1. 创建部署目录
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 2. 下载统一部署脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/setup.sh -o setup.sh
chmod +x setup.sh

# 3. 运行部署脚本（自动完成网络初始化、NPM 部署和应用部署）
./setup.sh

# 或指定版本标签
./setup.sh v1.0.0
```

**传统部署步骤**（4 步完成）

**第 0 步：初始化网络**

```bash
# 创建部署目录
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 下载网络初始化脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/init-network.sh -o init-network.sh
chmod +x init-network.sh

# 运行网络初始化
./init-network.sh
```

**第 1 步：部署 Nginx Proxy Manager**

```bash
# 创建部署目录
mkdir -p /opt/nginx-proxy-manager
cd /opt/nginx-proxy-manager

# 下载配置
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/npm/docker-compose.yml -o docker-compose.yml

# 启动 NPM
docker-compose up -d
```

**第 2 步：部署驴酱杯应用**

```bash
# 创建部署目录
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 下载部署脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/deploy.sh -o deploy.sh
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

**第 3 步：配置 NPM 代理**

1. 访问 `http://服务器 IP:8181` 登录 NPM 管理界面
2. 添加 Proxy Host：
   - Domain: `cup.example.com`
   - Forward IP: `127.0.0.1`
   - Forward Port: `3001`（前端）
3. 配置 SSL 证书（自动申请）
4. 添加 API 路由（高级配置）：
   - Location: `/api`
   - Forward Port: `3000`（后端）

详细部署指南请查看：[deploy/QUICKSTART.md](deploy/QUICKSTART.md)

#### 方案优势

- ✅ **统一网关**：所有应用通过 NPM 统一管理
- ✅ **自动 SSL**：Let's Encrypt 证书自动申请和续期
- ✅ **Web 界面**：可视化管理，无需记忆 Nginx 配置
- ✅ **资源优化**：前端容器使用 http-server（不含 Nginx）
- ✅ **易于扩展**：添加新应用只需几步点击

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
  position: string;    // 位置（top/jungle/mid/bot/support）
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
}
```

## 管理后台访问

管理后台地址：`/admin`

默认登录信息（开发环境）：
- 用户名：`admin`
- 密码：`admin`

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

#### 1. Docker 镜像构建（`docker-build.yml`）

**触发条件**：
- Push 到 `main` 分支
- 创建 `v*` 标签
- 手动触发

**功能**：
- 自动构建前后端 Docker 镜像
- 推送到 GitHub Container Registry (GHCR)
- 支持多平台构建（amd64/arm64）

**镜像地址**：
```bash
ghcr.io/forzenfox/lvjiang-cup/backend:latest
ghcr.io/forzenfox/lvjiang-cup/frontend:latest
```

#### 2. Demo 环境部署（`deploy.yml`）

**触发条件**：手动触发

**功能**：部署到 GitHub Pages（仅前端 Demo）

### 服务器手动更新

本项目提供便捷的更新脚本，无需自动化部署，用户可在服务器上手动操作：

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

**优势**：
- ✅ 更灵活：可选择更新时间点
- ✅ 更安全：无需配置 SSH Secrets
- ✅ 更可控：实时查看更新过程

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

### 代码检查

```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npm run check
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
```

### 后端

```bash
cd backend

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm run start:prod
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

- [快速部署指南](deploy/QUICKSTART.md)
- [Nginx Proxy Manager 配置](deploy/npm/README.md)
- [多应用部署方案](deploy/multi-app-deployment.md)

## 联系方式

- 作者：ForzenFox
- 邮箱：forzenfox@example.com
- 项目地址：https://github.com/forzenfox/lvjiang-cup

---

**注意**：
- 当前版本使用模拟数据（mock data）进行开发演示，生产环境需要接入真实后端 API。
- 生产环境部署前请仔细阅读 [QUICKSTART.md](deploy/QUICKSTART.md) 并配置好环境变量。
