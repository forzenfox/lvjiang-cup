# Docker 镜像加速配置指南（国内服务器专用）

> 适用于腾讯云、阿里云、华为云等国内云服务器

## 问题说明

在国内服务器上部署时，从 GitHub Container Registry (`ghcr.io`) 或 Docker Hub 拉取镜像速度很慢，主要原因是：
- 默认镜像源服务器位于海外
- 国际网络带宽受限
- DNS 解析延迟高

## 解决方案

### 方案一：配置 Docker 镜像加速器（推荐）

#### 1. 检查 Docker 版本

```bash
docker --version
docker info
```

#### 2. 配置镜像加速器

**腾讯云服务器（使用腾讯云镜像源）**

```bash
# 创建/编辑 Docker 配置文件
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A 5 "Registry Mirrors"
```

**阿里云服务器（使用阿里云镜像源）**

```bash
# 获取阿里云专属加速器地址（需登录阿里云容器控制台）
# 访问：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors

# 配置加速器
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://<your-alibaba-cloud-id>.mirror.aliyuncs.com",
    "https://docker.m.daocloud.io"
  ]
}
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**使用 DaoCloud 镜像源（通用）**

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live"
  ]
}
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

#### 3. 验证加速效果

```bash
# 测试镜像拉取速度
time docker pull hello-world

# 查看 Docker 信息
docker info
```

### 方案二：使用国内镜像代理

由于 GitHub Container Registry 在国内访问受限，可以考虑以下替代方案：

#### 选项 A：使用镜像代理地址

```bash
# 在 docker-compose.yml 中修改镜像地址
# 使用代理前缀（如果可用）
image: ghcr.io-proxy.example.com/forzenfox/lvjiang-cup/backend:latest
```

#### 选项 B：手动推送镜像到国内 Registry

1. **推送到阿里云容器镜像服务**

```bash
# 登录阿里云容器镜像服务
docker login --username=<your-username> registry.cn-hangzhou.aliyuncs.com

# 拉取原镜像
docker pull ghcr.io/forzenfox/lvjiang-cup/backend:latest

# 重新标记
docker tag ghcr.io/forzenfox/lvjiang-cup/backend:latest \
         registry.cn-hangzhou.aliyuncs.com/your-namespace/lvjiang-backend:latest

# 推送到阿里云
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/lvjiang-backend:latest
```

2. **更新 docker-compose.yml**

```yaml
services:
  backend:
    image: registry.cn-hangzhou.aliyuncs.com/your-namespace/lvjiang-backend:latest
```

### 方案三：离线部署（适合网络极差环境）

#### 1. 在本地下载镜像

```bash
# 在本地（网络好的地方）下载镜像
docker pull ghcr.io/forzenfox/lvjiang-cup/backend:latest
docker pull ghcr.io/forzenfox/lvjiang-cup/frontend:latest
docker pull jc21/nginx-proxy-manager:latest

# 保存镜像到文件
docker save -o backend.tar ghcr.io/forzenfox/lvjiang-cup/backend:latest
docker save -o frontend.tar ghcr.io/forzenfox/lvjiang-cup/frontend:latest
docker save -o nginx-proxy-manager.tar jc21/nginx-proxy-manager:latest
```

#### 2. 上传到服务器

```bash
# 使用 scp 或 rsync 上传
scp backend.tar frontend.tar nginx-proxy-manager.tar user@server:/opt/images/
```

#### 3. 在服务器上加载镜像

```bash
# 加载镜像
docker load -i backend.tar
docker load -i frontend.tar
docker load -i nginx-proxy-manager.tar

# 验证
docker images
```

### 方案四：配置 DNS 优化

```bash
# 修改 DNS 配置
sudo tee /etc/resolv.conf <<-'EOF'
nameserver 114.114.114.114
nameserver 223.5.5.5
nameserver 8.8.8.8
EOF

# 或使用 systemd-resolved（Ubuntu 18.04+）
sudo systemctl restart systemd-resolved
```

## 推荐的完整部署流程（腾讯元服务器）

### 步骤 1：配置 Docker 镜像加速

```bash
#!/bin/bash
# 一键配置 Docker 镜像加速

echo "配置 Docker 镜像加速器..."

# 备份原配置
if [ -f /etc/docker/daemon.json ]; then
    sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup.$(date +%Y%m%d)
fi

# 创建加速配置
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live"
  ],
  "max-concurrent-downloads": 10,
  "log-driver": "json-file",
  "log-level": "warn",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证
echo "验证 Docker 配置..."
docker info | grep -A 5 "Registry Mirrors"

echo "✅ Docker 镜像加速配置完成！"
```

### 步骤 2：优化系统网络

```bash
#!/bin/bash
# 网络优化配置

echo "优化系统网络配置..."

# 创建系统内核参数配置
sudo tee /etc/sysctl.d/99-docker-optimize.conf <<-'EOF'
# 增加文件描述符限制
fs.file-max = 1000000
fs.inotify.max_user_instances = 8192

# 优化网络连接
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_tw_reuse = 1

# 增加本地端口范围
net.ipv4.ip_local_port_range = 1024 65535
EOF

# 应用配置
sudo sysctl --system

echo "✅ 网络优化完成！"
```

### 步骤 3：部署应用

```bash
# 创建部署目录
mkdir -p /opt/lvjiang-cup/deploy
cd /opt/lvjiang-cup/deploy

# 下载配置文件
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/config.js -o config.js

# 创建环境变量
cp .env.example .env
vim .env  # 修改配置

# 拉取镜像（此时已使用加速器）
docker compose pull

# 启动服务
docker compose up -d
```

## 常见问题排查

### 问题 1：镜像拉取超时

```bash
# 检查网络连接
ping -c 4 ghcr.io

# 检查 DNS 解析
nslookup ghcr.io

# 使用 curl 测试连接
curl -I https://ghcr.io
```

### 问题 2：加速器不生效

```bash
# 检查 Docker 配置
cat /etc/docker/daemon.json

# 检查 Docker 服务状态
systemctl status docker

# 查看 Docker 日志
journalctl -u docker -f
```

### 问题 3：镜像拉取权限问题

```bash
# 匿名拉取公共镜像（不需要登录）
docker pull ghcr.io/forzenfox/lvjiang-cup/backend:latest

# 如需认证，先登录
echo $GITHUB_TOKEN | docker login ghcr.io -u <username> --password-stdin
```

## 性能对比

| 方案 | 拉取速度 | 稳定性 | 推荐度 |
|------|---------|--------|--------|
| 腾讯云镜像源 | 5-10 MB/s | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 阿里云镜像源 | 5-10 MB/s | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| DaoCloud | 2-5 MB/s | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 官方源（无加速） | 0.1-1 MB/s | ⭐⭐ | ⭐ |
| 离线部署 | 最快 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 最佳实践建议

1. **首选腾讯云镜像源**（如果你在腾讯云服务器上）
2. **配置多个镜像源**作为备份
3. **定期清理未使用的镜像**释放空间
4. **使用具体的版本标签**而非 `latest`
5. **在生产环境前先在测试环境验证**

## 参考资源

- [Docker 官方镜像加速文档](https://docs.docker.com/registry/recipes/mirror/)
- [腾讯云容器镜像服务](https://cloud.tencent.com/product/tcr)
- [阿里云容器镜像服务](https://cr.console.aliyun.com/)
- [DaoCloud 镜像加速器](https://www.daocloud.io/mirror)
