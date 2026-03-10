# 驴酱杯赛事网站 - 部署指南

## 1. 部署概述

本部署指南详细说明如何在2C2G服务器上部署驴酱杯赛事网站，采用Docker容器化部署方案，实现前后端分离架构。

### 1.1 部署环境要求

| 项目 | 要求 | 备注 |
|------|------|------|
| 服务器 | 2核2GB内存 | 阿里云轻量应用服务器推荐 |
| 操作系统 | Ubuntu 20.04 LTS | 或其他Linux发行版 |
| Docker | 20.10+ | 容器化部署 |
| Docker Compose | 1.29+ | 服务编排 |
| 网络 | 5M带宽 | 满足20K并发需求 |

### 1.2 部署架构

```
┌────────────────────────────────────────────────────────────────┐
│                      2C2G 服务器                               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    Nginx (80/443)                   │      │
│  │  - 反向代理                                         │      │
│  │  - 静态文件服务 (前端构建产物)                       │      │
│  │  - API路由转发 (/api → 后端服务)                   │      │
│  └──────────────┬──────────────────────────────┬───────┘      │
│                 │                              │              │
│  ┌──────────────▼────────────────┐   ┌─────────▼────────────┐ │
│  │     前端容器 (Nginx)           │   │    后端容器 (NestJS) │ │
│  │  - 静态文件服务                │   │  - NestJS + SQLite   │ │
│  └───────────────────────────────┘   └─────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   数据卷                            │      │
│  │  ┌──────────────────┐  ┌───────────────────────┐    │      │
│  │  │  SQLite 数据卷    │  │  备份数据卷          │    │      │
│  │  └──────────────────┘  └───────────────────────┘    │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                               │
└────────────────────────────────────────────────────────────────┘
```

## 2. 服务器准备

### 2.1 购买服务器

推荐使用阿里云轻量应用服务器：
- **配置**：2核2GB内存，5M带宽
- **镜像**：Ubuntu 20.04 LTS
- **地域**：选择离用户最近的地域
- **费用**：约50元/月

### 2.2 初始化服务器

1. **登录服务器**：
   ```bash
   ssh root@服务器IP
   ```

2. **更新系统**：
   ```bash
   apt update && apt upgrade -y
   ```

3. **安装必要工具**：
   ```bash
   apt install -y curl wget git unzip
   ```

### 2.3 安装 Docker

1. **安装 Docker**：
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **添加用户到 Docker 组**：
   ```bash
   usermod -aG docker $USER
   ```

3. **启动 Docker 服务**：
   ```bash
   systemctl start docker
   systemctl enable docker
   ```

4. **验证 Docker 安装**：
   ```bash
   docker --version
   ```

### 2.4 安装 Docker Compose

1. **下载 Docker Compose**：
   ```bash
   curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   ```

2. **添加执行权限**：
   ```bash
   chmod +x /usr/local/bin/docker-compose
   ```

3. **验证安装**：
   ```bash
   docker-compose --version
   ```

## 3. 项目准备

### 3.1 目录结构

创建项目目录结构：

```bash
mkdir -p lvjiang-cup/{frontend,backend/data,backend/backup}
cd lvjiang-cup
```

### 3.2 前端配置

#### 3.2.1 创建前端 Dockerfile

```bash
cat > frontend/Dockerfile << 'EOF'
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
```

#### 3.2.2 创建 Nginx 配置

```bash
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

#### 3.2.3 复制前端代码

将前端代码复制到 `frontend` 目录：
- 包含 `package.json`、`vite.config.ts`、`src/` 等文件

### 3.3 后端配置

#### 3.3.1 创建后端 Dockerfile

```bash
cat > backend/Dockerfile << 'EOF'
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/main.js"]
EOF
```

#### 3.3.2 创建 PM2 配置

```bash
cat > backend/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lvjiang-api',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
```

#### 3.3.3 复制后端代码

将后端代码复制到 `backend` 目录：
- 包含 `package.json`、`src/`、`tsconfig.json` 等文件

### 3.4 创建 Docker Compose 配置

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend/data:/app/data
      - ./backend/backup:/app/backup
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/lvjiang.db
    restart: always
EOF
```

## 4. 部署步骤

### 4.1 构建镜像

在项目根目录执行：

```bash
docker-compose build
```

### 4.2 启动服务

```bash
docker-compose up -d
```

### 4.3 验证部署

1. **查看容器状态**：
   ```bash
   docker-compose ps
   ```

2. **查看日志**：
   ```bash
   docker-compose logs -f
   ```

3. **访问应用**：
   - 前端：`http://服务器IP`
   - 后端API：`http://服务器IP/api/teams`

4. **测试API**：
   ```bash
   curl http://服务器IP/api/teams
   curl http://服务器IP/api/stream
   ```

## 5. 数据初始化

### 5.1 创建数据库表结构

后端服务启动时会自动创建数据库表结构，基于 `database.service.ts` 中的初始化代码。

### 5.2 导入初始数据

可以通过后端管理API导入初始数据：

1. **登录管理后台**：`http://服务器IP/admin`
2. **创建战队**：通过 `/api/admin/teams` 接口
3. **创建比赛**：通过 `/api/admin/matches` 接口
4. **配置直播**：通过 `/api/admin/stream` 接口

### 5.3 自动备份设置

创建每日备份脚本：

```bash
cat > backend/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/app/backup/daily"
DATE=$(date +"%Y%m%d")

mkdir -p $BACKUP_DIR
cp /app/data/lvjiang.db $BACKUP_DIR/lvjiang_${DATE}.db

# 保留最近7天的备份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/lvjiang_${DATE}.db"
EOF

chmod +x backend/backup.sh
```

添加到 crontab：

```bash
echo "0 2 * * * docker exec lvjiang-cup-backend sh /app/backup.sh" >> /etc/crontab
```

## 6. 环境变量配置

### 6.1 后端环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| NODE_ENV | production | 运行环境 |
| PORT | 3000 | 服务端口 |
| DATABASE_URL | file:/app/data/lvjiang.db | SQLite数据库路径 |
| JWT_SECRET | 随机生成 | JWT密钥 |
| ADMIN_USERNAME | admin | 管理员用户名 |
| ADMIN_PASSWORD | admin123 | 管理员密码 |

### 6.2 配置文件

创建 `.env` 文件：

```bash
cat > backend/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/app/data/lvjiang.db
JWT_SECRET=your_jwt_secret_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
```

## 7. 监控与运维

### 7.1 容器监控

1. **查看容器状态**：
   ```bash
   docker-compose ps
   ```

2. **查看资源使用**：
   ```bash
   docker stats
   ```

3. **查看日志**：
   ```bash
   # 前端日志
   docker-compose logs frontend
   
   # 后端日志
   docker-compose logs backend
   ```

### 7.2 健康检查

创建健康检查脚本：

```bash
cat > healthcheck.sh << 'EOF'
#!/bin/bash

# 检查前端
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$FRONTEND_STATUS" -eq 200 ]; then
  echo "Frontend: OK"
else
  echo "Frontend: ERROR ($FRONTEND_STATUS)"
fi

# 检查后端API
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/teams)
if [ "$BACKEND_STATUS" -eq 200 ]; then
  echo "Backend: OK"
else
  echo "Backend: ERROR ($BACKEND_STATUS)"
fi

# 检查数据库
DB_SIZE=$(ls -lh /app/data/lvjiang.db | awk '{print $5}')
echo "Database size: $DB_SIZE"
EOF

chmod +x healthcheck.sh
```

### 7.3 自动重启

Docker Compose 配置中已设置 `restart: always`，确保服务异常时自动重启。

### 7.4 版本更新

1. **更新代码**：
   - 更新前端/后端代码
   - 重新构建镜像

2. **部署更新**：
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

## 8. 故障排查

### 8.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 前端无法访问 | Nginx配置错误 | 检查nginx.conf文件 |
| 后端API无响应 | 端口未开放 | 检查防火墙设置 |
| 数据库连接失败 | 权限问题 | 检查数据卷权限 |
| 内存不足 | 应用内存泄漏 | 检查PM2内存限制 |
| 容器启动失败 | 依赖问题 | 查看容器日志 |

### 8.2 日志分析

1. **查看详细日志**：
   ```bash
   docker-compose logs --tail=100 backend
   ```

2. **检查错误信息**：
   ```bash
   docker-compose logs backend | grep ERROR
   ```

### 8.3 恢复备份

如果数据库损坏，可从备份恢复：

```bash
# 停止服务
docker-compose down

# 恢复最新备份
LATEST_BACKUP=$(ls -t backend/backup/daily/*.db | head -1)
cp $LATEST_BACKUP backend/data/lvjiang.db

# 启动服务
docker-compose up -d
```

## 9. 性能优化

### 9.1 服务器优化

1. **内存管理**：
   ```bash
   # 调整系统参数
   echo "vm.swappiness = 10" >> /etc/sysctl.conf
   sysctl -p
   ```

2. **网络优化**：
   ```bash
   # 调整TCP参数
   echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
   echo "net.ipv4.tcp_max_syn_backlog = 65535" >> /etc/sysctl.conf
   sysctl -p
   ```

### 9.2 Nginx 优化

修改 `frontend/nginx.conf`：

```nginx
http {
    # 开启gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_min_length 256;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

### 9.3 后端优化

1. **SQLite 优化**：
   - 启用 WAL 模式
   - 配置内存缓存

2. **PM2 优化**：
   - 调整实例数为CPU核心数
   - 设置合理的内存限制

## 10. 安全配置

### 10.1 防火墙设置

1. **启用防火墙**：
   ```bash
   ufw enable
   ```

2. **开放必要端口**：
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp  # SSH
   ```

3. **查看防火墙状态**：
   ```bash
   ufw status
   ```

### 10.2 HTTPS 配置

1. **安装 Certbot**：
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. **获取 SSL 证书**：
   ```bash
   certbot --nginx -d your-domain.com
   ```

3. **自动续期**：
   ```bash
   echo "0 12 * * * /usr/bin/certbot renew --quiet" >> /etc/crontab
   ```

### 10.3 数据库安全

1. **设置文件权限**：
   ```bash
   chmod 600 backend/data/lvjiang.db
   ```

2. **定期备份**：
   - 每日自动备份
   - 异地存储备份

## 11. 扩展方案

### 11.1 水平扩展

当访问量增加时，可以：

1. **增加后端实例**：
   ```yaml
   # docker-compose.yml
   backend:
     deploy:
       replicas: 3
   ```

2. **使用负载均衡**：
   - 配置 Nginx 负载均衡
   - 或使用云服务负载均衡

### 11.2 数据库升级

当数据量增加时，可升级到 PostgreSQL：

1. **创建 PostgreSQL 容器**：
   ```yaml
   # docker-compose.yml
   db:
     image: postgres:16-alpine
     environment:
       - POSTGRES_DB=lvjiang
       - POSTGRES_USER=user
       - POSTGRES_PASSWORD=pass
     volumes:
       - postgres_data:/var/lib/postgresql/data
   ```

2. **修改后端配置**：
   - 更新数据库连接字符串
   - 迁移数据

## 12. 部署验证

### 12.1 功能验证

| 功能 | 测试方法 | 预期结果 |
|------|----------|----------|
| 首页访问 | 访问 `http://服务器IP` | 显示赛事首页 |
| 战队列表 | 访问 `http://服务器IP/api/teams` | 返回战队列表 |
| 比赛列表 | 访问 `http://服务器IP/api/matches` | 返回比赛列表 |
| 直播信息 | 访问 `http://服务器IP/api/stream` | 返回直播信息 |
| 管理登录 | 访问 `http://服务器IP/admin` | 显示登录页面 |

### 12.2 性能测试

1. **并发测试**：
   ```bash
   # 安装 ab 工具
   apt install -y apache2-utils
   
   # 测试并发
   ab -n 1000 -c 100 http://服务器IP/api/teams
   ```

2. **响应时间**：
   - 预期：P99 < 50ms
   - 最大：< 100ms

### 12.3 稳定性测试

1. **长时间运行**：
   - 持续运行72小时
   - 监控资源使用

2. **故障恢复**：
   - 模拟容器重启
   - 验证服务自动恢复

## 13. 总结

### 13.1 部署优势

1. **环境一致性**：Docker容器确保开发和生产环境一致
2. **一键部署**：Docker Compose 简化部署流程
3. **资源高效**：2C2G服务器完全满足需求
4. **易于维护**：容器化管理，便于升级和回滚
5. **成本低廉**：月成本约100元，经济实惠

### 13.2 最佳实践

1. **定期备份**：每日自动备份数据库
2. **监控告警**：设置资源使用监控
3. **安全更新**：定期更新依赖和系统
4. **性能优化**：根据实际使用情况调整配置
5. **文档维护**：及时更新部署文档

### 13.3 常见问题解决方案

| 问题 | 解决方案 |
|------|----------|
| 容器启动失败 | 查看日志，检查依赖和配置 |
| API响应慢 | 检查数据库索引，优化查询 |
| 内存不足 | 调整PM2内存限制，检查内存泄漏 |
| 数据库损坏 | 从备份恢复，检查磁盘空间 |
| 访问量突增 | 启用Nginx缓存，考虑水平扩展 |

---

**文档版本**：v1.0  
**编写日期**：2026-03-10  
**作者**：AI架构师
