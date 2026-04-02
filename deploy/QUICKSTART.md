# 驴酱杯赛事网站 - 快速部署指南（方案 C）

## 📋 方案概述

本方案采用 **Nginx Proxy Manager（NPM）统一网关**，适用于多应用服务器环境。

### 架构优势

- ✅ **统一网关**：所有应用通过 NPM 统一管理
- ✅ **自动 SSL**：Let's Encrypt 证书自动申请和续期
- ✅ **Web 界面**：可视化管理，无需记忆 Nginx 配置
- ✅ **资源优化**：前端容器使用 http-server（不含 Nginx）
- ✅ **易于扩展**：添加新应用只需几步点击

### 架构图

```
用户 → Cloudflare → Nginx Proxy Manager (80/443)
                          │
                          ├─→ 驴酱杯前端容器 (3000)
                          └─→ 驴酱杯后端容器 (3000)
```

---

## 🚀 快速部署（3 步完成）

### 第 1 步：部署 Nginx Proxy Manager

```bash
# 1. 创建部署目录
mkdir -p /opt/nginx-proxy-manager
cd /opt/nginx-proxy-manager

# 2. 下载配置文件
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/npm/docker-compose.yml -o docker-compose.yml

# 3. 启动 NPM
docker-compose up -d

# 4. 查看日志（可选）
docker-compose logs -f
```

**访问管理界面**：
- 地址：`http://服务器 IP:8181`
- 默认账号：`admin@example.com`
- 默认密码：`changeme`
- **首次登录会要求修改密码**

---

### 第 2 步：部署驴酱杯应用

```bash
# 1. 创建部署目录
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 2. 下载部署文件
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/.env.example -o .env.example
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/deploy.sh -o deploy.sh

# 3. 赋予执行权限
chmod +x deploy.sh

# 4. 运行部署脚本
./deploy.sh
```

**配置环境变量**：
```bash
# 编辑 .env 文件
vim .env

# 必须修改以下配置：
GITHUB_OWNER=forzenfox          # GitHub 用户名
JWT_SECRET=随机字符串            # openssl rand -base64 32
ADMIN_PASSWORD=强密码            # 管理员密码
CORS_ORIGIN=https://你的域名.com  # 你的域名
```

**重新运行部署脚本**：
```bash
./deploy.sh
```

---

### 第 3 步：配置 NPM 代理

#### 3.1 登录 NPM 管理界面

访问：`http://服务器 IP:8181`

#### 3.2 添加代理主机

1. 点击 **Hosts** → **Add Proxy Host**

2. 填写配置：
   ```
   Domain Names: cup.example.com
   Scheme: http
   Forward IP / Hostname: 127.0.0.1
   Forward Port: 3001
   Cache Assets: ✓ 勾选
   Block Common Exploits: ✓ 勾选
   ```

3. 点击 **Save**

#### 3.3 配置 SSL 证书

1. 点击刚创建的代理主机，选择 **Edit**
2. 切换到 **SSL** 标签页
3. 配置：
   ```
   SSL Certificate: Request a new SSL certificate
   Force SSL: ✓ 勾选
   HTTP/2 Support: ✓ 勾选
   I agree to the Terms of Service: ✓ 勾选
   ```
4. 点击 **Save**

#### 3.4 添加 API 路由（高级配置）

1. 切换到 **Advanced** 标签页
2. 添加自定义位置：
   ```
   Location: /api
   Scheme: http
   Forward IP / Hostname: 127.0.0.1
   Forward Port: 3000
   ```
3. 点击 **Save**

---

## ✅ 验证部署

### 检查容器状态

```bash
cd /opt/lvjiang-cup/deploy
docker-compose ps
```

### 测试访问

```bash
# 测试前端（通过 NPM）
curl -I https://cup.example.com

# 测试后端 API（通过 NPM）
curl -I https://cup.example.com/api/teams
```

---

## 🔧 常用命令

### 部署脚本

```bash
cd /opt/lvjiang-cup/deploy

# 首次部署
./deploy.sh

# 更新到最新版本
./update.sh
```

### Docker Compose 命令

```bash
cd /opt/lvjiang-cup/deploy

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 启动服务
docker-compose up -d
```

---

## 🔒 安全建议

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

## 🔄 更新和回滚

### 更新到最新版本

```bash
cd /opt/lvjiang-cup/deploy
docker-compose pull
docker-compose up -d
```

### 回滚到指定版本

```bash
# 编辑 .env 文件
vim .env

# 修改 TAG
TAG=v1.0.0

# 重启
docker-compose up -d
```

---

## 🐛 故障排查

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
netstat -tlnp | grep :81
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

---

## 📊 多应用管理示例

假设服务器上有 3 个应用：

| 应用 | 域名 | 端口 |
|------|------|------|
| 驴酱杯 | cup.example.com | 3001（前端）/3000（后端） |
| 博客 | blog.example.com | 3002 |
| API 服务 | api.example.com | 3003 |

### NPM 配置

在 NPM 管理界面添加 3 个代理主机：

1. **cup.example.com** → `127.0.0.1:3001`（前端）
   - 高级配置：`/api` → `127.0.0.1:3000`（后端）
2. **blog.example.com** → `127.0.0.1:3002`
3. **api.example.com** → `127.0.0.1:3003`

所有应用共享同一个 NPM 网关，统一管理 SSL 证书。

---

## 📝 下一步

1. **配置域名**：将域名 DNS 解析到服务器 IP
2. **测试功能**：访问网站测试各项功能
3. **配置备份**：设置自动备份数据库
4. **监控告警**：配置服务监控和告警

---

## 🆘 获取帮助

- **GitHub Issues**: https://github.com/forzenfox/lvjiang-cup/issues
- **NPM 文档**: https://nginxproxymanager.com/guide/
- **Docker 文档**: https://docs.docker.com/

---

**文档版本**: v1.0  
**更新日期**: 2026-04-01  
**适用场景**: 多应用服务器环境（方案 C）
