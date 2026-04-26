# 驴酱杯赛事网站后端服务

基于 NestJS + SQLite + better-sqlite3 + node-cache 的轻量级后端服务。

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: SQLite 3.x + better-sqlite3
- **缓存**: node-cache (TTL=60秒)
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件配置你的环境变量
```

### 环境变量说明

| 变量 | 说明 | 开发环境默认值 |
|------|------|----------------|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3000` |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key-here` |
| `JWT_EXPIRES_IN` | Token 过期时间 | `24h` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` |
| `DATABASE_PATH` | SQLite 数据库路径 | `./data/lvjiang.db` |
| `CORS_ORIGIN` | CORS 允许的来源 | `*` |
| `UPLOAD_BASE_DIR` | 上传目录 | `./uploads` |
| `ENABLE_SWAGGER` | 是否启用 Swagger 文档 | `true` |
| `LOG_LEVEL` | 日志级别 | `debug` |

### 开发模式运行

```bash
npm run start:dev
```

### 生产模式运行

```bash
npm run build
npm run start:prod
```

## API 文档

启动服务后访问: http://localhost:3000/api/docs

## API 路由

| 模块 | 基础路径 | 说明 |
|------|----------|------|
| 认证 | `/api/admin/auth` | 管理员登录 |
| 管理 | `/api/admin` | 数据清空、槽位初始化 |
| 战队 | `/api/teams` | 战队 CRUD、Excel 导入 |
| 比赛 | `/api/matches` | 比赛 CRUD、结果更新 |
| 直播 | `/api/streams` | 直播流配置 |
| 主播 | `/api/streamers` | 主播信息 |
| 对战数据 | `/api/match-data` | 对战数据导入/查询 |
| 视频 | `/api/videos` | 视频 CRUD、排序 |
| 上传 | `/api/upload` | 文件上传 |

## 管理员操作

### 登录获取 Token

```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 初始化比赛槽位

```bash
curl -X POST http://localhost:3000/api/admin/init-slots \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 重置槽位

```bash
curl -X POST http://localhost:3000/api/admin/reset-slots \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 清空所有数据

```bash
curl -X DELETE http://localhost:3000/api/admin/data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 测试

### 运行测试

```bash
# 单元测试
npm run test

# 监听模式
npm run test:watch

# 带覆盖率
npm run test:cov

# 端到端测试
npm run test:e2e
```

### 测试目录结构

```
test/
├── unit/          # 各模块单元测试
├── integration/   # 模块集成测试
├── e2e/           # 端到端测试
└── helpers/       # 测试工具
```

## 项目结构

```
backend/
├── src/
│   ├── modules/           # 业务模块
│   │   ├── admin/         # 管理操作（数据清空/槽位初始化）
│   │   ├── auth/          # JWT 认证模块
│   │   ├── match-data/    # 对战数据模块（导入/导出/编辑）
│   │   ├── matches/       # 比赛管理模块
│   │   ├── streamers/     # 主播展示模块
│   │   ├── streams/       # 直播流模块
│   │   ├── teams/         # 战队管理模块（含 Excel 导入）
│   │   ├── tracking/      # 数据追踪模块
│   │   ├── upload/        # 文件上传模块
│   │   ├── utils/         # Excel 工具模块
│   │   └── videos/        # 视频管理模块
│   ├── cache/             # 缓存模块 (node-cache)
│   ├── common/            # 公共模块 (拦截器/过滤器)
│   ├── config/            # 配置模块 (app/upload)
│   ├── database/          # 数据库模块 (better-sqlite3)
│   ├── main.ts            # 应用入口
│   └── app.module.ts      # 根模块
├── data/                  # 数据目录 (SQLite)
├── test/                  # 测试目录
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   └── e2e/               # 端到端测试
├── .env.example
├── Dockerfile
└── package.json
```

## Docker 部署

### 使用 Docker Compose

```bash
docker-compose up -d
```

### 构建镜像

```bash
docker build -t lvjiang-cup-backend .
```

## 许可证

MIT
