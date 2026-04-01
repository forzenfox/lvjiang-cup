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

### 第1.5步：配置云服务器安全组/防火墙

部署前需要确保云服务器的安全组或防火墙已开放以下端口：

#### HTTP 模式（默认）
| 端口 | 协议 | 用途 | 访问来源 |
|------|------|------|----------|
| 80 | TCP | HTTP 访问（前端服务） | 所有 IP (0.0.0.0/0) |

#### HTTPS 模式（推荐）
| 端口 | 协议 | 用途 | 访问来源 |
|------|------|------|----------|
| 443 | TCP | HTTPS 访问（前端服务） | 所有 IP (0.0.0.0/0) |

**注意**：
- **HTTP 模式**：只需开放 80 端口，Cloudflare 会自动处理 HTTPS（使用 Flexible SSL 模式）
- **HTTPS 模式**：只需开放 443 端口，需要配置 SSL 证书（使用 Full (strict) SSL 模式）
- 后端服务（3000 端口）**不需要**对外开放，前端通过 Docker 内部网络访问
- 建议关闭 22 端口的公网访问，或使用密钥认证提高安全性

**常见云厂商配置方式**：
- **阿里云**：安全组规则 → 入方向 → 添加规则
- **腾讯云**：安全组 → 入站规则 → 添加规则
- **AWS**：Security Groups → Inbound rules → Edit inbound rules
- **Azure**：网络安全组 → 入站安全规则

---

## 附录：HTTPS 配置指南（可选）

如果你想关闭 80 端口，只使用 HTTPS (443端口)，请按照以下步骤配置：

### 生成 Cloudflare 源站证书

1. 登录 Cloudflare 控制台 → 选择你的域名
2. 点击 **SSL/TLS** → **源服务器**
3. 点击 **创建证书**
4. 选择 **RSA (2048)**，有效期 15 年
5. 复制生成的证书内容，保存到服务器的 `/opt/lvjiang-cup/deploy/ssl/cert.pem`
6. 复制生成的私钥内容，保存到服务器的 `/opt/lvjiang-cup/deploy/ssl/key.pem`

```bash
# 在服务器上创建 SSL 目录
mkdir -p /opt/lvjiang-cup/deploy/ssl

# 创建证书文件（将 Cloudflare 提供的证书内容粘贴进去）
vim /opt/lvjiang-cup/deploy/ssl/cert.pem

# 创建私钥文件（将 Cloudflare 提供的私钥内容粘贴进去）
vim /opt/lvjiang-cup/deploy/ssl/key.pem
```

### 修改 Cloudflare SSL/TLS 设置

1. 进入 Cloudflare 控制台 → SSL/TLS → Overview
2. 将加密模式改为 **"完全 (严格)"** (Full (strict))

### 更新安全组规则

- 关闭 80 端口的入站规则
- 确保 443 端口已开放

### 重启服务

```bash
cd /opt/lvjiang-cup/deploy
docker-compose down
docker-compose up -d
```

完成以上步骤后，访问 `https://你的域名` 即可正常使用。

### 第2步：服务器执行一键部署（首次运行）

```bash
# 下载部署脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/deploy.sh -o deploy.sh

# 执行部署脚本
bash deploy.sh
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
bash deploy.sh
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

---

**文档版本**: v5.0  
**更新日期**: 2026-03-15  
**部署方案**: Cloudflare + GHCR + Docker Compose
