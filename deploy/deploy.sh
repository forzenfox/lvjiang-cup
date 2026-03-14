#!/bin/bash

# 驴酱杯一键部署脚本
# 使用方法: ./deploy.sh [tag]
#
# 注意：此脚本位于 /deploy 目录

set -e

TAG="${1:-latest}"
PROJECT_DIR="/opt/lvjiang-cup"
DEPLOY_DIR="$PROJECT_DIR/deploy"

echo "========================================"
echo "  驴酱杯一键部署"
echo "========================================"
echo "版本标签: $TAG"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 创建目录
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 下载配置文件（如果不存在）
if [ ! -f "docker-compose.yml" ]; then
    echo "下载 docker-compose.yml..."
    curl -fsSL https://raw.githubusercontent.com/your-username/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml
fi

# 创建配置目录
mkdir -p config

# 下载 nginx 配置（如果不存在）
if [ ! -f "config/nginx.conf" ]; then
    echo "下载 nginx.conf..."
    curl -fsSL https://raw.githubusercontent.com/your-username/lvjiang-cup/main/deploy/config/nginx.conf -o config/nginx.conf
fi

# 下载前端配置（如果不存在）
if [ ! -f "config/config.js" ]; then
    echo "下载 config.js..."
    curl -fsSL https://raw.githubusercontent.com/your-username/lvjiang-cup/main/deploy/config/config.js -o config/config.js
fi

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "创建环境变量文件..."
    cat > .env << EOF
GITHUB_OWNER=your-github-username
GITHUB_REPO=lvjiang-cup
TAG=$TAG
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
CORS_ORIGIN=https://your-domain.com
EOF
    echo "⚠️ 请编辑 .env 文件修改配置"
    exit 1
fi

# 创建数据目录（在项目根目录）
mkdir -p $PROJECT_DIR/data $PROJECT_DIR/backup

# 拉取镜像并启动
echo "拉取镜像..."
TAG=$TAG docker-compose pull

echo "启动服务..."
TAG=$TAG docker-compose up -d

# 健康检查
sleep 5
if curl -s http://localhost/api/teams > /dev/null; then
    echo ""
    echo "✅ 部署成功！"
    echo "访问地址: https://your-domain.com"
    echo ""
    echo "配置文件位置:"
    echo "  - 环境变量: $DEPLOY_DIR/.env"
    echo "  - Nginx配置: $DEPLOY_DIR/config/nginx.conf"
    echo "  - 前端配置: $DEPLOY_DIR/config/config.js"
    echo "  - 数据目录: $PROJECT_DIR/data"
else
    echo "❌ 部署失败，请检查日志: docker-compose logs"
    exit 1
fi
