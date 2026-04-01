# Nginx Proxy Manager 部署指南

## 快速部署（首次部署）

### 第 1 步：部署 Nginx Proxy Manager

```bash
# 创建部署目录
mkdir -p /opt/nginx-proxy-manager
cd /opt/nginx-proxy-manager

# 下载配置文件
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/npm/docker-compose.yml -o docker-compose.yml

# 启动 NPM
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 第 2 步：访问管理界面

1. 访问：`http://服务器 IP:81`
2. 默认登录凭证：
   - 邮箱：`admin@example.com`
   - 密码：`changeme`
3. 首次登录会要求修改密码

### 第 3 步：配置代理主机

#### 3.1 添加驴酱杯前端代理

1. 点击 **Hosts** → **Add Proxy Host**
2. 填写配置：
   - **Domain Names**: `cup.example.com`
   - **Scheme**: `http`
   - **Forward IP / Hostname**: `127.0.0.1`
   - **Forward Port**: `3001`
   - **Cache Assets**: ✓ 勾选
   - **Block Common Exploits**: ✓ 勾选
3. 点击 **Save**

#### 3.2 配置 SSL 证书

1. 点击刚创建的代理主机，选择 **Edit**
2. 切换到 **SSL** 标签页
3. 配置：
   - **SSL Certificate**: `Request a new SSL certificate`
   - **Force SSL**: ✓ 勾选
   - **HTTP/2 Support**: ✓ 勾选
   - **I agree to the Terms of Service**: ✓ 勾选
4. 点击 **Save**

#### 3.3 添加 API 路由（高级配置）

1. 切换到 **Advanced** 标签页
2. 添加自定义位置：
   ```
   Location: /api
   Scheme: http
   Forward IP / Hostname: 127.0.0.1
   Forward Port: 3002
   ```
3. 点击 **Save**

---

## 已有 NPM 环境（添加新应用）

如果服务器上已有 Nginx Proxy Manager，只需添加新的代理主机：

### 方式 1：通过 Web 界面（推荐）

1. 登录 NPM 管理界面
2. 添加代理主机，配置域名和转发端口
3. 申请 SSL 证书

### 方式 2：通过 Docker Compose 网络

确保应用容器加入 `npm-network` 网络：

```yaml
networks:
  npm-network:
    driver: bridge
    external: true
```

---

## 多应用管理示例

假设服务器上有 3 个应用：

| 应用 | 域名 | 前端端口 | 后端端口 |
|------|------|---------|---------|
| 驴酱杯 | cup.example.com | 3001 | 3002 |
| 博客 | blog.example.com | 3003 | - |
| API 服务 | api.example.com | - | 3004 |

### NPM 配置

在 NPM 管理界面添加 3 个代理主机：

1. **cup.example.com** → `127.0.0.1:3001`
   - 高级配置：`/api` → `127.0.0.1:3002`
2. **blog.example.com** → `127.0.0.1:3003`
3. **api.example.com** → `127.0.0.1:3004`

---

## 常用命令

```bash
# 切换到 NPM 目录
cd /opt/nginx-proxy-manager

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启 NPM
docker-compose restart

# 停止 NPM
docker-compose down

# 更新 NPM
docker-compose pull
docker-compose up -d
```

---

## 数据备份

### 备份数据

```bash
# 创建备份目录
mkdir -p /opt/backup/npm

# 备份数据
tar -czf /opt/backup/npm/npm-data-$(date +%Y%m%d).tar.gz /opt/nginx-proxy-manager/npm-data
tar -czf /opt/backup/npm/npm-letsencrypt-$(date +%Y%m%d).tar.gz /opt/nginx-proxy-manager/npm-letsencrypt
```

### 恢复数据

```bash
# 停止 NPM
docker-compose down

# 恢复数据
tar -xzf /opt/backup/npm/npm-data-YYYYMMDD.tar.gz -C /opt/nginx-proxy-manager/
tar -xzf /opt/backup/npm/npm-letsencrypt-YYYYMMDD.tar.gz -C /opt/nginx-proxy-manager/

# 重启 NPM
docker-compose up -d
```

---

## 故障排查

### 问题 1：无法访问管理界面

```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs nginx-proxy-manager

# 检查端口占用
netstat -tlnp | grep :81
```

### 问题 2：SSL 证书申请失败

1. 检查域名 DNS 解析是否正确
2. 检查 80 端口是否开放
3. 查看 Let's Encrypt 日志：
   ```bash
   docker-compose logs | grep "letsencrypt"
   ```

### 问题 3：代理主机无法访问

1. 检查后端容器是否运行
   ```bash
   docker-compose ps
   ```
2. 检查网络连通性
   ```bash
   docker exec nginx-proxy-manager ping 127.0.0.1
   ```
3. 检查端口是否正确
   ```bash
   docker exec nginx-proxy-manager wget -q -O - http://127.0.0.1:3001
   ```

---

## 安全建议

1. **修改默认密码**：首次登录后立即修改
2. **限制管理界面访问**：
   ```bash
   # 使用防火墙限制 81 端口访问
   ufw allow from 你的 IP to any port 81
   ```
3. **定期更新**：保持 NPM 镜像为最新版本
4. **备份数据**：定期备份 `npm-data` 和 `npm-letsencrypt` 目录

---

**文档版本**: v1.0  
**更新日期**: 2026-04-01  
**适用场景**: 多应用服务器环境
