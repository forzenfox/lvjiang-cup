# 驴酱杯赛事网站 - 部署指南

## 1. 部署概述

采用 **Cloudflare + GitHub Container Registry + Docker Compose** 方案，前后端均打包为 Docker 镜像，服务器只需一个命令即可部署。

### 1.1 架构图

```
用户 ──HTTPS──► Cloudflare ──HTTP──► 服务器
                                      │
                                      ▼
                              ┌───────────────┐
                              │  Docker Compose│
                              │   (/deploy)   │
                              │               │
                              │  ┌─────────┐  │
                              │  │ Frontend│  │ Port: 80
                              │  │ (Nginx) │  │
                              │  └────┬────┘  │
                              │       │       │
                              │  ┌────┴────┐  │
                              │  │ Backend │  │ Port: 3000
                              │  │ (NestJS)│  │
                              │  └─────────┘  │
                              └───────────────┘
```

### 1.2 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | React + Vite + Nginx |
| 后端 | NestJS + SQLite |
| CI/CD | GitHub Actions |
| 镜像仓库 | GitHub Container Registry |
| CDN/SSL | Cloudflare |

### 1.3 部署目录结构

```
/opt/lvjiang-cup/
├── deploy/                 # 部署配置目录
│   ├── docker-compose.yml  # Docker Compose 配置
│   ├── .env               # 环境变量
│   ├── deploy.sh          # 一键部署脚本
│   └── config/
│       ├── nginx.conf     # Nginx 配置
│       └── config.js      # 前端运行时配置
├── data/                  # SQLite 数据库
└── backup/                # 备份文件
```

---

## 2. 快速部署（3步完成）

### 第1步：配置 Cloudflare

1. 添加域名到 Cloudflare
2. 配置 A 记录指向服务器 IP（开启橙色云朵）
3. SSL/TLS 模式选择 **Flexible** 或 **Full**
4. 开启 **Always Use HTTPS**

### 第2步：服务器执行一键部署（首次运行）

```bash
# 下载并执行部署脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/deploy.sh | bash
```

脚本会自动：
- 检查 Docker 和 Docker Compose 是否已安装
- 下载配置文件到 `/opt/lvjiang-cup/deploy/`
- 创建 `.env` 文件并提示输入自定义域名

**注意**：首次运行脚本时，会在创建 `.env` 文件后自动退出，需要继续执行第3步。

### 第3步：配置环境变量并重新部署

```bash
cd /opt/lvjiang-cup/deploy
vim .env
```

修改以下配置：
```bash
GITHUB_OWNER=forzenfox
GITHUB_REPO=lvjiang-cup
JWT_SECRET=随机字符串（openssl rand -base64 32）
ADMIN_PASSWORD=管理员密码
CORS_ORIGIN=https://你的域名.com
```

保存后，**重新运行部署脚本**完成部署：
```bash
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/deploy.sh | bash
```

---

## 3. 手动部署

### 3.1 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker
```

### 3.2 创建部署目录

```bash
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy
```

### 3.3 下载配置文件

```bash
# 下载 docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml

# 下载环境变量模板
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/.env.example -o .env

# 创建配置目录
mkdir -p config

# 下载 Nginx 配置
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/config/nginx.conf -o config/nginx.conf

# 下载前端配置
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/config/config.js -o config/config.js
```

### 3.4 配置环境变量

```bash
vim .env
# 修改配置...
```

### 3.5 启动服务

```bash
docker-compose pull
docker-compose up -d
```

---

## 4. 更新和回滚

### 4.1 更新到最新版本

```bash
cd /opt/lvjiang-cup/deploy
docker-compose pull
docker-compose up -d
```

### 4.2 更新到指定版本

```bash
# 修改 .env 中的 TAG
vim .env
# TAG=v1.0.0

# 重启
docker-compose up -d
```

### 4.3 回滚版本

```bash
# 修改 docker-compose.yml 中的镜像标签
vim docker-compose.yml
# image: ghcr.io/xxx/lvjiang-cup/backend:v0.9.0

# 重启
docker-compose up -d
```

---

## 5. 常用命令

```bash
# 切换到部署目录
cd /opt/lvjiang-cup/deploy

# 查看日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 查看状态
docker-compose ps

# 进入后端容器
docker exec -it lvjiang-backend sh
```

---

## 6. 配置文件说明

### 6.1 环境变量 (.env)

位于 `/opt/lvjiang-cup/deploy/.env`

| 变量 | 说明 |
|------|------|
| GITHUB_OWNER | GitHub 用户名 |
| GITHUB_REPO | 仓库名 |
| TAG | 镜像标签 |
| JWT_SECRET | JWT 密钥 |
| ADMIN_PASSWORD | 管理员密码 |
| CORS_ORIGIN | 允许的跨域域名 |

### 6.2 Nginx 配置 (config/nginx.conf)

位于 `/opt/lvjiang-cup/deploy/config/nginx.conf`

可自定义：
- 缓存策略
- 反向代理设置
- 静态资源处理

### 6.3 前端配置 (config/config.js)

位于 `/opt/lvjiang-cup/deploy/config/config.js`

可配置：
- API 基础地址
- 应用名称
- 版本号

修改后刷新浏览器即可生效，无需重启容器。

---

## 7. 备份和恢复

### 7.1 自动备份

```bash
# 创建备份脚本
cat > /opt/lvjiang-cup/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec lvjiang-backend sh -c "cp /app/data/lvjiang.db /app/backup/lvjiang_$DATE.db"
find /opt/lvjiang-cup/backup -name "*.db" -mtime +30 -delete
EOF
chmod +x /opt/lvjiang-cup/backup.sh

# 添加定时任务
echo "0 2 * * * /opt/lvjiang-cup/backup.sh" | crontab -
```

### 7.2 手动备份

```bash
docker exec lvjiang-backend sh -c "cp /app/data/lvjiang.db /app/backup/lvjiang_$(date +%Y%m%d).db"
```

### 7.3 恢复数据

```bash
cd /opt/lvjiang-cup/deploy
docker-compose down
cp ../backup/lvjiang_xxxx.db ../data/lvjiang.db
docker-compose up -d
```

---

## 8. 故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 无法拉取镜像 | 未登录 GHCR | `docker login ghcr.io -u 用户名` |
| 502 错误 | 后端未启动 | `docker-compose logs backend` |
| CORS 错误 | 域名配置错误 | 检查 `.env` 中的 `CORS_ORIGIN` |
| 数据库错误 | 权限问题 | `chmod 755 ../data/` |

---

## 9. 总结

### 9.1 方案优势

1. **简单高效**：Cloudflare 自动处理 SSL 和 CDN
2. **安全可靠**：Docker 容器隔离，Cloudflare 提供 DDoS 防护
3. **配置灵活**：配置文件外挂，无需重新构建镜像
4. **易于维护**：一键部署脚本，自动备份

### 9.2 成本估算

| 项目 | 费用 |
|------|------|
| 云服务器（1核1G） | 约 50-80 元/月 |
| 域名 | 约 30-60 元/年 |
| Cloudflare | 免费 |
| **总计** | **约 60-90 元/月** |

---

**文档版本**: v5.0  
**更新日期**: 2026-03-15  
**部署方案**: Cloudflare + GHCR + Docker Compose
