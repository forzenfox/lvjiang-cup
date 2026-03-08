# 驴酱杯后台应用开发方案

## 1. 项目概述

### 1.1 目标
为驴酱杯 LOL 娱乐赛事网站开发一个完整的后台管理系统，实现数据的持久化存储和实时管理功能。

### 1.2 当前状态
- 前端：React + TypeScript + Vite + Tailwind CSS
- 数据层：Mock 数据（内存存储，刷新后数据丢失）
- 认证：简单的本地存储密码验证

### 1.3 目标架构
- 前端：保持现有 React 前端
- 后端：新增 Node.js + Express 后端服务
- 数据库：SQLite（轻量级，适合小型应用）
- 部署：自有服务器 Docker 部署（前端 Nginx + 后端 Node.js + SQLite 数据持久化）

---

## 2. 技术选型

### 2.1 后端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.x | Web 框架 |
| SQLite3 | 5.x | 数据库 |
| JWT | 9.x | 身份认证 |
| bcryptjs | 2.x | 密码加密 |
| cors | 2.x | 跨域处理 |

### 2.2 前端调整
- 移除 Mock 服务
- 添加 API 客户端
- 添加环境变量配置

---

## 3. 数据库设计

### 3.1 表结构

```sql
-- 管理员表
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 战队表
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 队员表
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  position TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 赛程表
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  team_a_id TEXT,
  team_b_id TEXT,
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  winner_id TEXT,
  round TEXT,
  status TEXT CHECK(status IN ('upcoming', 'ongoing', 'finished')),
  start_time DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_a_id) REFERENCES teams(id),
  FOREIGN KEY (team_b_id) REFERENCES teams(id)
);

-- 直播信息表
CREATE TABLE stream_info (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  title TEXT,
  url TEXT,
  platform TEXT,
  is_live BOOLEAN DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. API 设计

### 4.1 认证相关
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 管理员登录 |
| POST | /api/auth/logout | 管理员登出 |
| GET | /api/auth/verify | 验证 Token |

### 4.2 战队管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/teams | 获取所有战队 |
| GET | /api/teams/:id | 获取单个战队 |
| POST | /api/teams | 创建战队 |
| PUT | /api/teams/:id | 更新战队 |
| DELETE | /api/teams/:id | 删除战队 |

### 4.3 赛程管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/matches | 获取所有赛程 |
| GET | /api/matches/:id | 获取单个赛程 |
| POST | /api/matches | 创建赛程 |
| PUT | /api/matches/:id | 更新赛程 |
| DELETE | /api/matches/:id | 删除赛程 |

### 4.4 直播管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/stream | 获取直播信息 |
| PUT | /api/stream | 更新直播信息 |

---

## 5. 项目结构

```
d:\workspace\lvjiang-cup-test
├── src/                      # 前端代码（现有）
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── api/                  # 新增：API 客户端
├── server/                   # 新增：后端代码
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── middleware/       # 中间件
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由定义
│   │   ├── utils/            # 工具函数
│   │   └── app.ts            # 应用入口
│   ├── database/
│   │   ├── schema.sql        # 数据库结构
│   │   └── seed.sql          # 初始数据
│   ├── package.json
│   └── tsconfig.json
├── shared/                   # 新增：共享类型
│   └── types/
└── package.json              # 修改：添加工作区配置
```

---

## 6. 开发步骤

### 阶段 1：后端基础搭建（预计 2-3 小时）
1. 创建 server 目录结构
2. 初始化 Node.js 项目
3. 配置 TypeScript
4. 安装依赖包
5. 创建 Express 应用基础

### 阶段 2：数据库实现（预计 2 小时）
1. 创建数据库连接
2. 执行 schema.sql 创建表
3. 创建数据访问层（Models）
4. 添加 seed 数据

### 阶段 3：API 开发（预计 4-5 小时）
1. 实现认证中间件
2. 实现战队 CRUD API
3. 实现赛程 CRUD API
4. 实现直播信息 API
5. 添加错误处理和日志

### 阶段 4：前端改造（预计 2-3 小时）
1. 创建 API 客户端
2. 替换 Mock 服务
3. 添加环境变量配置
4. 测试前后端联调

### 阶段 5：部署准备（预计 3-4 小时）
1. 配置 CORS
2. 添加生产环境配置
3. **编写 Dockerfile 和 docker-compose.yml**
4. **配置 SQLite 数据卷持久化**
5. **编写数据备份脚本**
6. 测试部署流程

#### 5.1 Docker 配置要点
```dockerfile
# server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
# 创建数据目录
RUN mkdir -p /data
ENV DB_PATH=/data/lvmao.db
EXPOSE 3001
CMD ["node", "dist/app.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./dist:/usr/share/nginx/html
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build: ./server
    ports:
      - "3001:3001"
    volumes:
      # SQLite 数据持久化 - 关键配置
      - sqlite-data:/data
      - ./backups:/backups
    environment:
      - NODE_ENV=production
      - DB_PATH=/data/lvmao.db
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  # 可选：备份服务
  backup:
    image: alpine:latest
    volumes:
      - sqlite-data:/data:ro
      - ./backups:/backups
    command: >
      sh -c "
        echo '0 3 * * * cp /data/lvmao.db /backups/lvmao-$$(date +\%Y\%m\%d).db' | crontab - &&
        crond -f
      "
    restart: unless-stopped

volumes:
  sqlite-data:
    driver: local
```

#### 5.2 SQLite 持久化注意事项
1. **必须使用命名卷**: 避免容器删除后数据丢失
2. **定期备份**: 即使使用卷，也要定期备份
3. **单容器写入**: SQLite 不支持多容器同时写入
4. ** WAL 模式**: 建议启用 WAL 模式提高并发性能

```javascript
// 数据库连接配置
const db = new sqlite3.Database('/data/lvmao.db');
// 启用 WAL 模式
db.exec('PRAGMA journal_mode = WAL;');
```

---

## 7. 关键实现细节

### 7.1 认证流程
```
1. 管理员 POST /api/auth/login
2. 后端验证密码，生成 JWT
3. 前端存储 JWT（localStorage）
4. 后续请求携带 Authorization: Bearer <token>
5. 后端中间件验证 Token
```

### 7.2 数据关系处理
- 战队删除时级联删除队员
- 赛程关联战队使用外键约束
- 查询赛程时自动填充战队信息

### 7.3 错误处理
- 统一错误响应格式
- 区分开发/生产环境错误信息
- 添加请求日志

---

## 8. 环境配置

### 8.1 开发环境
```env
# server/.env
PORT=3001
NODE_ENV=development
DB_PATH=./database/lvmao.db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### 8.2 前端环境变量
```env
# .env.development
VITE_API_BASE_URL=http://localhost:3001/api

# .env.production
VITE_API_BASE_URL=https://your-api-domain.com/api
```

---

## 9. 部署方案

### 9.1 前端部署
- 继续使用 GitHub Pages
- 构建时注入生产环境 API 地址

### 9.2 后端部署方案
**自有服务器 Docker 部署**

#### 部署架构
```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   Nginx      │    │  Node.js     │    │ SQLite   │  │
│  │   (前端)      │───▶│  (后端API)   │───▶│ (数据卷)  │  │
│  │   80/443端口 │    │   3001端口   │    │ /data    │  │
│  └──────────────┘    └──────────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### SQLite 持久化方案
| 方案 | 说明 | 推荐度 |
|------|------|--------|
| **Docker Volume** | 使用命名卷挂载到容器外 | ⭐⭐⭐ 推荐 |
| Bind Mount | 直接挂载宿主机目录 | ⭐⭐ 备选 |
| 对象存储 | 定期备份到 OSS/S3 | ⭐⭐ 辅助 |

#### 推荐的 Volume 配置
```yaml
# docker-compose.yml
volumes:
  sqlite-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/lvmao/data  # 宿主机数据目录
```

#### 数据备份策略
1. **自动备份**: 每日凌晨 3 点自动备份数据库
2. **备份保留**: 保留最近 7 天的备份
3. **备份位置**: `/opt/lvmao/backups/`
4. **异地备份**: 可选同步到云存储

#### Docker 部署文件结构
```
/opt/lvmao/
├── docker-compose.yml      # Docker Compose 配置
├── nginx/
│   ├── nginx.conf          # Nginx 配置
│   └── ssl/                # SSL 证书
├── server/
│   ├── Dockerfile          # 后端镜像构建
│   └── uploads/            # 上传文件目录
├── data/
│   └── lvmao.db            # SQLite 数据库（持久化）
└── backups/
    └── daily/              # 每日备份
```

---

## 10. 后续优化方向

1. **数据备份**：定期备份 SQLite 数据库
2. **图片存储**：接入图床或对象存储
3. **实时更新**：添加 WebSocket 支持实时推送
4. **操作日志**：记录管理员操作历史
5. **数据验证**：添加更严格的输入验证
6. **缓存优化**：添加 Redis 缓存热点数据

---

## 11. 开发规范

### 11.1 代码规范
- 使用 ESLint + Prettier
- 遵循 RESTful API 设计规范
- 添加必要的代码注释

### 11.2 Git 工作流
- 功能分支开发
- 提交信息使用中文描述
- 重要节点打标签

---

## 12. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| SQLite 并发性能 | 中 | 数据量小，可接受；后期可迁移 |
| 免费部署限制 | 低 | 监控使用量，必要时升级 |
| 数据丢失 | 高 | 定期备份，使用事务 |

---

## 13. Docker 部署操作指南

### 13.1 首次部署
```bash
# 1. 克隆代码到服务器
git clone <your-repo> /opt/lvmao
cd /opt/lvmao

# 2. 创建必要目录
mkdir -p data backups/nginx/ssl

# 3. 配置环境变量
cp server/.env.example server/.env
# 编辑 .env 文件设置 JWT_SECRET 等

# 4. 构建并启动
docker-compose up -d --build

# 5. 初始化数据库
docker-compose exec backend npm run db:init
```

### 13.2 日常维护
```bash
# 查看日志
docker-compose logs -f backend

# 备份数据库
docker-compose exec backend npm run db:backup

# 更新部署
git pull
docker-compose down
docker-compose up -d --build

# 查看数据卷
docker volume ls | grep lvmao
```

### 13.3 数据恢复
```bash
# 从备份恢复
cp /opt/lvmao/backups/lvmao-20250308.db /opt/lvmao/data/lvmao.db
docker-compose restart backend
```

---

**文档版本**: 1.1  
**创建日期**: 2026-03-08  
**最后更新**: 2026-03-08
