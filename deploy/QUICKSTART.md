# 驴酱杯赛事网站 - 快速部署指南（方案 C）

## 📋 方案概述

本方案采用 **Nginx Proxy Manager（NPM）统一网关**，适用于多应用服务器环境。

### 架构优势

- ✅ **统一网关**：所有应用通过 NPM 统一管理
- ✅ **自动 SSL**：Let's Encrypt 证书自动申请和续期
- ✅ **Web 界面**：可视化管理，无需记忆 Nginx 配置
- ✅ **资源优化**：前端容器使用 static-web-server（高性能 Rust 静态服务器，4MB 体积）
- ✅ **易于扩展**：添加新应用只需几步点击

### 架构图

```
用户 → Cloudflare → Nginx Proxy Manager (80/443)
                          │
                          ├─→ 驴酱杯前端容器 (3001)
                          └─→ 驴酱杯后端容器 (3000)
```

---

## 🚀 快速部署（1 步完成）

### 使用统一部署脚本（推荐）

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

**功能说明**：
- ✅ 自动初始化 Docker 网络 `npm-network`
- ✅ 自动部署 Nginx Proxy Manager
- ✅ 自动部署驴酱杯应用
- ✅ 自动进行健康检查验证
- ✅ 提供详细的部署结果和后续操作指南

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

### 清理和重新部署

```bash
# 清理部署（保留 NPM 和数据）
./cleanup.sh

# 重新部署
./setup.sh
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

## 📝 下一步

1. **配置域名**：将域名 DNS 解析到服务器 IP
2. **配置 NPM 代理**：登录 NPM 管理界面配置域名和 SSL 证书
3. **测试功能**：访问网站测试各项功能
4. **配置备份**：设置自动备份数据库
5. **监控告警**：配置服务监控和告警

---

## 🆘 获取帮助

- **GitHub Issues**: https://github.com/forzenfox/lvjiang-cup/issues
- **NPM 文档**: https://nginxproxymanager.com/guide/
- **Docker 文档**: https://docs.docker.com/

---

**文档版本**: v1.0  
**更新日期**: 2026-04-01  
**适用场景**: 多应用服务器环境（方案 C）
