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

## Docker 部署

### 使用 Docker Compose

```bash
docker-compose up -d
```

### 构建镜像

```bash
docker build -t lvjiang-cup-backend .
```

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

## 项目结构

```
backend/
├── src/
│   ├── modules/           # 业务模块
│   │   ├── teams/         # 战队模块
│   │   ├── matches/       # 比赛模块
│   │   ├── streams/       # 直播模块
│   │   ├── advancement/   # 晋级名单模块
│   │   ├── auth/          # 认证模块
│   │   └── admin/         # 管理操作
│   ├── database/          # 数据库模块
│   ├── cache/             # 缓存模块
│   ├── config/            # 配置模块
│   ├── common/            # 公共模块
│   ├── main.ts            # 应用入口
│   └── app.module.ts      # 根模块
├── data/                  # 数据目录
├── test/                  # 测试目录
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 许可证

MIT
