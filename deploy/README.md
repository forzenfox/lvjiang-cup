# 驴酱杯赛事网站 - 部署文档

## 目录

1. [架构概述](#架构概述)
2. [国内服务器镜像加速](#国内服务器镜像加速)
3. [快速部署](#快速部署)
4. [Nginx Proxy Manager 配置](#nginx-proxy-manager-配置)
5. [CDN 配置（腾讯云）](#cdn-配置腾讯云)
6. [前端配置](#前端配置)
7. [常用操作](#常用操作)
8. [清理与重置](#清理与重置)
9. [故障排查](#故障排查)
10. [安全建议](#安全建议)

---

## 架构概述

本方案采用 **Nginx Proxy Manager（NPM）统一网关**，适用于多应用服务器环境。

### 架构优势

- ✅ **统一网关**：所有应用通过 NPM 统一管理
- ✅ **自动 SSL**：Let's Encrypt 证书自动申请和续期
- ✅ **Web 界面**：可视化管理，无需记忆 Nginx 配置
- ✅ **资源优化**：前端容器使用 static-web-server（高性能 Rust 静态服务器，4MB 体积）
- ✅ **配置灵活**：前端配置通过 volume 挂载，无需重新构建镜像即可修改

### 架构图

```
用户 → Cloudflare → Nginx Proxy Manager (80/443)
                          │
                          ├─→ 驴酱杯前端容器 (3001)
                          └─→ 驴酱杯后端容器 (3000)
```

### 核心文件

| 文件 | 用途 | 说明 |
|------|------|------|
| `setup.sh` | 一键部署脚本 | 自动完成网络初始化、NPM 部署、应用部署、权限设置 |
| `setup-docker-mirror.sh` | Docker 镜像加速配置 | 国内服务器专用，自动选择最优镜像源 |
| `quick-fix-permissions.sh` | 快速修复脚本 | 修复目录权限问题（数据库、上传、备份） |
| `cleanup.sh` | 清理脚本 | 清理容器和镜像，可选择保留数据 |
| `update.sh` | 更新脚本 | 拉取新镜像并重启服务 |
| `backup.sh` | 备份脚本 | 备份数据库 |
| `init-database.sh` | 数据库初始化脚本 | 完整初始化数据库 |
| `config.js` | 前端运行时配置 | 通过 volume 挂载，可热更新 |
| `.env` | 环境变量 | 后端服务配置 |
| `docker-compose.yml` | Docker Compose 配置 | 服务编排（含日志轮转配置） |
| `health-check.sh` | 健康检查脚本 | 检查服务状态和日志大小 |

---

## 国内服务器镜像加速

> **重要**：在腾讯元、阿里云等国内服务器上部署时，强烈建议先配置 Docker 镜像加速器，否则镜像拉取速度会很慢。

### 快速配置（一键脚本）

```bash
# 使用自动配置脚本（推荐）
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/setup-docker-mirror.sh | sudo bash
```

脚本会自动：
- ✅ 检测云服务器提供商（腾讯云/阿里云/华为云）
- ✅ 配置最优镜像源地址
- ✅ 重启 Docker 服务
- ✅ 验证加速效果

### 手动配置

**腾讯云服务器：**

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.m.daocloud.io"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

**验证配置：**

```bash
# 查看 Docker 信息
docker info | grep -A 5 "Registry Mirrors"

# 测试拉取速度
time docker pull hello-world
```

### 性能对比

| 配置 | 拉取速度 | 说明 |
|------|---------|------|
| 腾讯云镜像源 | 5-10 MB/s | ⭐⭐⭐⭐⭐ 推荐 |
| 阿里云镜像源 | 5-10 MB/s | ⭐⭐⭐⭐⭐ 推荐 |
| DaoCloud | 2-5 MB/s | ⭐⭐⭐⭐ |
| 官方源（无加速） | 0.1-1 MB/s | ⭐ 不推荐 |

### 详细文档

更多配置选项和故障排查，请参考：[Docker 镜像加速配置指南](docker-mirror-config.md)

---

## 快速部署

### 方式一：使用统一部署脚本（推荐）

```bash
# 1. 创建部署目录
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 2. 下载所有脚本（如文件已存在会被覆盖更新）
## 主部署脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/setup.sh -o setup.sh

## 镜像加速脚本（国内服务器推荐先执行）
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/setup-docker-mirror.sh -o setup-docker-mirror.sh

## 快速修复脚本（权限问题修复）
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/quick-fix-permissions.sh -o quick-fix-permissions.sh

## 更新脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/update.sh -o update.sh

## 清理脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/cleanup.sh -o cleanup.sh

## 备份脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/backup.sh -o backup.sh

## 数据库初始化脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/init-database.sh -o init-database.sh

## 健康检查脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/health-check.sh -o health-check.sh

## 添加执行权限
chmod +x *.sh

> **注意**：`curl -o` 会覆盖已存在的文件。如需保留旧版本，请先备份：
> ```bash
> cp setup.sh setup.sh.backup.$(date +%Y%m%d)
> ```

# 3. 运行部署脚本
./setup.sh

# 或指定版本标签
./setup.sh v1.0.0
```

**脚本功能**：
- ✅ 自动初始化 Docker 网络 `npm-network`
- ✅ 自动设置目录权限（data、backup、uploads）
- ✅ 自动部署 Nginx Proxy Manager
- ✅ 自动部署驴酱杯应用
- ✅ 自动下载前端配置文件 `config.js`
- ✅ 自动进行健康检查验证

**脚本说明**：
| 脚本 | 用途 | 使用场景 |
|------|------|----------|
| `setup.sh` | 一键部署 | 首次部署或完全重新部署 |
| `setup-docker-mirror.sh` | 镜像加速配置 | 国内服务器部署前（可选） |
| `quick-fix-permissions.sh` | 权限快速修复 | 修复上传/数据库/备份目录权限 |
| `update.sh` | 更新应用 | 升级到新版本 |
| `cleanup.sh` | 清理环境 | 清理容器和镜像，保留数据 |
| `backup.sh` | 数据备份 | 备份数据库 |
| `init-database.sh` | 数据库初始化 | 完整初始化数据库 |
| `health-check.sh` | 健康检查 | 检查服务状态 |

### 方式二：手动部署

#### 第 1 步：部署 Nginx Proxy Manager

```bash
mkdir -p /opt/nginx-proxy-manager
cd /opt/nginx-proxy-manager
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/npm/docker-compose.yml -o docker-compose.yml
docker-compose up -d
```

#### 第 2 步：部署驴酱杯应用

```bash
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 下载配置文件
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/config.js -o config.js

# 创建环境变量文件
cp .env.example .env
vim .env  # 修改配置

# 启动服务
docker-compose up -d
```

---

## Nginx Proxy Manager 配置

### 访问管理界面

1. 访问：`http://服务器 IP:8181`
2. 默认登录凭证：
   - 邮箱：`admin@example.com`
   - 密码：`changeme`
3. 首次登录会要求修改密码

### 配置代理主机

#### 1. 添加前端代理

1. 点击 **Hosts** → **Add Proxy Host**
2. 填写配置：
   - **Domain Names**: `cup.example.com`
   - **Scheme**: `http`
   - **Forward IP / Hostname**: `lvjiang-frontend`
   - **Forward Port**: `3001`
   - **Cache Assets**: ✓ 勾选（注意：config.js 文件不应缓存）
   - **Block Common Exploits**: ✓ 勾选
3. 点击 **Save**

> **注意**：对于 `config.js` 配置文件，建议在 **Advanced** 标签页中添加自定义位置规则，设置为不缓存（详见 [Nginx Proxy Manager 配置](deploy/npm/README.md)）

#### 2. 配置 SSL 证书

1. 点击刚创建的代理主机，选择 **Edit**
2. 切换到 **SSL** 标签页
3. 配置：
   - **SSL Certificate**: `Request a new SSL certificate`
   - **Force SSL**: ✓ 勾选
   - **HTTP/2 Support**: ✓ 勾选
   - **I agree to the Terms of Service**: ✓ 勾选
4. 点击 **Save**

#### 3. 添加 API 路由（高级配置）

1. 切换到 **Advanced** 标签页
2. 添加自定义位置：
   ```
   Location: /api
   Scheme: http
   Forward IP / Hostname: lvjiang-backend
   Forward Port: 3000
   ```
3. 点击 **Save**

> **注意**：使用容器名称（如 `lvjiang-frontend`）而不是 `127.0.0.1`，因为服务运行在 Docker 网络中

---

## CDN 配置（腾讯云）

本项目支持通过腾讯云 CDN 加速静态资源（如视频封面、用户上传的头像等），减轻服务器带宽压力。

### 架构说明

```
用户浏览器 → CDN加速域名(cdn.yourdomain.com)
                  ↓ 有缓存 → 直接返回
                  ↓ 无缓存 → 回源到你的服务器 → CDN缓存 → 返回给用户
```

### 腾讯云 CDN 控制台配置

登录 [腾讯云 CDN 控制台](https://console.cloud.tencent.com/cdn)，进行以下配置：

#### 1. 添加加速域名

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 加速域名 | `cdn.yourdomain.com` | 自定义子域名 |
| 业务类型 | 静态加速 | 适用于图片、文件等静态资源 |
| 源站类型 | 自有源 | |
| 回源协议 | HTTPS | 443 端口 |
| 回源地址 | `your-server-ip` 或 `api.yourdomain.com` | 你的服务器地址 |

#### 2. 配置缓存规则

建议为静态资源目录设置较长的缓存时间：

| 路径规则 | 缓存时间 | 说明 |
|----------|----------|------|
| `/api/uploads/*` | 30 天 | 上传的静态文件 |
| `/*.jpg`, `/*.png`, `/*.webp` | 30 天 | 图片格式 |
| `/*` | 7 天 | 其他静态资源 |

#### 3. 配置 HTTPS 证书

1. 在 **SSL 证书** 页面申请或上传证书
2. 腾讯云提供免费 SSL 证书（TrustAsia）
3. 开启 **HTTPS** 并绑定证书

#### 4. 配置 DNS 解析

在 DNS 服务商处添加 CNAME 记录：

| 记录类型 | 主机记录 | 记录值 |
|----------|----------|--------|
| CNAME | cdn | `xxx.xxx.xxx.xxx.cdns.cn` |

> **说明**：CNAME 值来自腾讯云 CDN 控制台提供的加速域名

### 环境变量配置

配置 CDN 基础 URL（可选，不配置则使用本地路径）：

**文件**: `deploy/.env`

```bash
# CDN 配置（可选，不配置则使用本地路径）
CDN_BASE_URL=https://cdn.yourdomain.com
```

### 目录结构要求

CDN 加速的静态资源位于 `/api/uploads/` 目录：

```
uploads/
├── teams/      # 战队 Logo
├── members/    # 队员头像
├── streamers/   # 主播海报
└── covers/     # 视频封面
```

确保 Docker volumes 挂载正确：

```yaml
# docker-compose.yml
volumes:
  - ../uploads:/app/uploads  # 静态资源目录
```

### 验证 CDN 配置

1. 上传一个测试图片到 `uploads/covers/`
2. 访问 `https://cdn.yourdomain.com/covers/test.jpg`
3. 确认能正常显示图片

### CDN 刷新

当静态资源更新时，需要刷新 CDN 缓存：

#### 方式一：控制台刷新

1. 进入腾讯云 CDN 控制台 → **缓存刷新**
2. 选择 **URL 刷新** 或 **目录刷新**
3. 提交需要刷新的资源

#### 方式二：API 刷新

```bash
# 刷新单个 URL
curl -X POST 'https://cdn.api.qcloud.com/v2/index.php' \
  -d 'Action=RefreshCdnUrl' \
  -d 'urls.0=https://cdn.yourdomain.com/covers/xxx.jpg'

# 刷新目录
curl -X POST 'https://cdn.api.qcloud.com/v2/index.php' \
  -d 'Action=RefreshCdnDir' \
  -d 'dirs.0=https://cdn.yourdomain.com/covers/'
```

---

## 前端配置

前端运行时配置通过 `config.js` 文件挂载，无需重新构建镜像即可修改。

### 配置文件位置

- **生产环境**：`/opt/lvjiang-cup/deploy/config.js`
- **本地开发**：`frontend/public/config.js`

### 配置项说明

```javascript
window.APP_CONFIG = {
  // API 基础地址
  // - 使用 Nginx Proxy Manager 代理时，使用相对路径: '/api'
  // - 分离部署（前后端不同域名）时，使用完整地址: 'https://api.your-domain.com/api'
  API_BASE_URL: '/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',
};
```

### 修改配置

1. 编辑 `config.js` 文件
2. 重启前端容器：
   ```bash
   cd /opt/lvjiang-cup/deploy
   docker-compose restart frontend
   ```
3. 用户刷新浏览器即可生效

---

## 常用操作

### 查看状态

```bash
cd /opt/lvjiang-cup/deploy
docker-compose ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看最近 100 行
docker-compose logs --tail=100 backend

# 查看特定时间范围的日志
docker-compose logs --since="2026-04-07T10:00:00" --until="2026-04-07T12:00:00" backend
```

### 日志管理

**日志配置**：
- 使用 Docker json-file 日志驱动
- 单文件最大：100MB
- 最多保留：3 个文件（总计 300MB）
- 自动轮转：超出大小自动滚动

**查看日志文件大小**：
```bash
# 运行健康检查脚本查看日志大小
./health-check.sh

# 或手动查看
du -sh /var/lib/docker/containers/*/*-json.log | sort -rh | head -3
```

**清理日志**：
```bash
# 清空特定容器日志
truncate -s 0 /var/lib/docker/containers/$(docker inspect -f '{{.Id}}' lvjiang-backend)/*-json.log

# 或使用 docker-compose
docker-compose down -v  # 会删除日志卷（谨慎使用）
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart frontend
docker-compose restart backend
```

### 更新应用

```bash
# 方法 1：使用更新脚本（推荐，自动健康检查）
./update.sh

# 或指定版本
./update.sh v1.0.0

# 方法 2：手动更新
docker-compose pull
docker-compose up -d
```

### 备份数据

```bash
# 运行备份脚本
./backup.sh

# 备份文件位置：/opt/lvjiang-cup/backup/
```

### 健康检查

```bash
# 运行健康检查脚本
./health-check.sh
```

---

## 清理与重置

### 快速清理（保留 NPM 和数据）

```bash
cd /opt/lvjiang-cup/deploy
./cleanup.sh
```

**保留内容**：
- Nginx Proxy Manager 容器和配置
- Docker 网络 `npm-network`
- 数据目录（`/opt/lvjiang-cup/data`, `/opt/lvjiang-cup/backup`）
- 配置文件（`/opt/lvjiang-cup/deploy/.env`, `/opt/lvjiang-cup/deploy/config.js`）

### 完全清理（包括 NPM）

```bash
./cleanup.sh --all
```

**清理内容**：
- 所有容器和镜像
- Docker 网络（如无其他容器使用）
- 数据目录（可选）
- 配置文件（可选）

### 清理后重新部署

```bash
# 1. 清理
./cleanup.sh

# 2. 重新部署
./setup.sh
```

---

## 故障排查

### 问题 1：容器无法启动

```bash
# 检查 Docker 状态
systemctl status docker

# 查看容器日志
docker-compose logs backend
docker-compose logs frontend

# 检查端口占用
netstat -tlnp | grep :3000
```

### 问题 2：NPM 无法访问

```bash
# 检查 NPM 容器状态
docker-compose ps

# 查看 NPM 日志
docker-compose logs nginx-proxy-manager

# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### 问题 3：SSL 证书申请失败

1. 检查域名 DNS 解析是否正确
2. 检查 80 端口是否开放
3. 查看 Let's Encrypt 日志：
   ```bash
   cd /opt/nginx-proxy-manager
   docker-compose logs | grep "letsencrypt"
   ```

### 问题 4：API 无法访问

1. 检查后端容器是否运行：
   ```bash
   docker-compose ps backend
   ```

2. 测试后端服务：
   ```bash
   docker exec lvjiang-backend wget -q -O - http://localhost:3000/api/teams
   ```

3. 检查 NPM 配置中的 API 路由

### 问题 5：上传战队图标失败（EACCES: permission denied）

**错误信息**：
```
EACCES: permission denied, mkdir '/app/uploads/teams'
```

**原因**：
- `uploads` 目录不存在或由 root 用户创建
- 容器内的 nodejs 用户（UID 1001）没有写入权限

**解决方案**：

方式一：使用快速修复脚本（推荐，同时修复所有目录权限）
```bash
cd /opt/lvjiang-cup/deploy
chmod +x quick-fix-permissions.sh
./quick-fix-permissions.sh
```

方式二：手动修复
```bash
# 1. 创建 uploads 目录
mkdir -p /opt/lvjiang-cup/uploads

# 2. 设置正确的权限（UID 1001 对应容器内的 nodejs 用户）
chown -R 1001:1001 /opt/lvjiang-cup/uploads

# 3. 重启后端容器
docker restart lvjiang-backend

# 4. 验证权限
docker exec lvjiang-backend ls -ld /app/uploads
```

**验证**：
- 权限应该显示为 `1001:1001`
- 重新尝试上传战队图标

### 问题 6：前端配置未生效

1. 检查 config.js 是否存在：
   ```bash
   ls -la /opt/lvjiang-cup/deploy/config.js
   ```

2. 检查容器内配置是否挂载：
   ```bash
   docker exec lvjiang-frontend cat /app/dist/config.js
   ```

3. 重启前端容器：
   ```bash
   docker-compose restart frontend
   ```

### 问题 7：日志文件过大

1. 检查日志大小：
   ```bash
   ./health-check.sh
   ```

2. 临时清理日志：
   ```bash
   # 清空所有容器日志
   for log in $(find /var/lib/docker/containers -name "*-json.log"); do
     truncate -s 0 $log
   done
   ```

3. 调整日志配置（修改 docker-compose.yml）：
   ```yaml
   x-logging: &default-logging
     driver: "json-file"
     options:
       max-size: "50m"  # 减小单文件大小
       max-file: "5"    # 增加文件数量
   ```

### 问题 8：数据库启动报错（SQLITE_CANTOPEN）

**错误信息**：
```
[Error: SQLITE_CANTOPEN: unable to open database file] {
  errno: 14,
  code: 'SQLITE_CANTOPEN'
}
```

**原因分析**：
- `data/` 目录不存在或为空
- 目录权限不正确（容器内 nodejs 用户 UID 1001 无法访问）
- 数据库文件不存在且无法自动创建

**快速诊断**：
```bash
# 1. 检查 data 目录是否存在
ls -la /opt/lvjiang-cup/data/

# 2. 检查目录权限
# 应该显示 1001:1001，如果是 root:root 则需要修复
ls -ld /opt/lvjiang-cup/data/

# 3. 检查数据库文件是否存在
ls -l /opt/lvjiang-cup/data/lvjiang.db
```

**解决方案**：

方式一：使用快速修复脚本（推荐）
```bash
# 方法 A：直接执行远程脚本
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/quick-fix-permissions.sh | sudo bash

# 方法 B：下载并执行本地脚本
cd /opt/lvjiang-cup/deploy
chmod +x quick-fix-permissions.sh
./quick-fix-permissions.sh
```

方式二：手动修复
```bash
# 1. 确保目录存在
mkdir -p /opt/lvjiang-cup/data
mkdir -p /opt/lvjiang-cup/backup
mkdir -p /opt/lvjiang-cup/uploads

# 2. 设置正确的权限（UID 1001 对应容器内的 nodejs 用户）
chown -R 1001:1001 /opt/lvjiang-cup/data
chown -R 1001:1001 /opt/lvjiang-cup/backup
chown -R 1001:1001 /opt/lvjiang-cup/uploads
chmod -R 755 /opt/lvjiang-cup/data

# 3. 重启后端容器（会自动创建数据库文件）
cd /opt/lvjiang-cup/deploy
docker-compose restart backend

# 4. 验证数据库连接
docker exec lvjiang-backend sqlite3 /app/data/lvjiang.db '.tables'
```

方式三：完整初始化（适用于全新部署）
```bash
cd /opt/lvjiang-cup/deploy
chmod +x init-database.sh
./init-database.sh
```

**验证修复**：
```bash
# 查看权限（应该是 1001:1001）
ls -ld /opt/lvjiang-cup/data/
ls -l /opt/lvjiang-cup/data/lvjiang.db

# 查看后端日志
docker-compose logs -f backend

# 测试 API
docker exec lvjiang-backend wget -q -O - http://127.0.0.1:3000/api/teams
```

**预防措施**：
- 部署时 `setup.sh` 脚本会自动设置正确的权限
- 不要手动用 root 用户创建数据目录
- 定期检查目录权限是否正确

---

## 安全建议

### 1. 修改默认密码

- NPM 管理界面密码（首次登录时修改）
- 驴酱杯管理员密码（`.env` 文件中的 `ADMIN_PASSWORD`）
- JWT 密钥（`.env` 文件中的 `JWT_SECRET`）

### 2. 限制管理界面访问

```bash
# 使用防火墙限制 8181 端口访问
sudo ufw allow from 你的 IP to any port 8181
sudo ufw reload
```

### 3. 配置云服务器安全组

**开放端口**：
- 80（HTTP，NPM 使用）
- 443（HTTPS，NPM 使用）
- 22（SSH，建议限制 IP 访问）

**关闭端口**：
- 8181（NPM 管理界面，仅限内网访问）
- 3000（应用端口，不对外开放）

---

## 日志策略

### 日志输出

**后端**：
- 使用 NestJS Logger 输出到 stdout/stderr
- 包含启动日志、错误日志、警告日志
- 生产环境已移除 console.log，统一使用 Logger

**前端**：
- 生产构建自动移除 console.log/debug 语句
- 保留 console.error/warn 用于错误排查
- 浏览器控制台日志不影响 Pod 日志

### 日志持久化

- 日志存储在 Docker 日志目录：`/var/lib/docker/containers/*/*-json.log`
- 自动轮转，防止磁盘耗尽
- 容器重启不会丢失日志（除非删除容器）

### 日志收集建议

如需更强大的日志管理，可集成：
- **轻量级**：使用 `docker logs` 命令 + 日志轮转
- **中级**：使用 Fluentd/Fluent Bit 收集到 ELK/Loki
- **企业级**：使用 Prometheus + Grafana Loki + Tempo 全链路追踪

---

**文档版本**: v1.3
**更新日期**: 2026-04-21
**适用场景**: 生产环境部署（方案 C）
**更新日志**:
- v1.3: 优化脚本结构 - 移除镜像加速检查逻辑（由独立脚本处理）、合并权限设置到部署脚本、重命名 quick-fix-db.sh 为 quick-fix-permissions.sh、删除 fix-upload-permissions.sh
- v1.2: 修复前端配置文件挂载路径说明（从 `/app/public/config.js` 改为 `/app/dist/config.js`）
- v1.1: 添加日志轮转配置和日志管理文档
