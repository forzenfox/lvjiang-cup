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
    echo "❌ 未检测到 Docker，请先安装 Docker"
    echo "安装指南：https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose（支持新版 docker compose 和旧版 docker-compose）
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ 未检测到 Docker Compose，请先安装 Docker Compose"
    echo "安装指南：https://docs.docker.com/compose/install/"
    exit 1
fi

# 创建目录
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 下载配置文件（如果不存在）
if [ ! -f "docker-compose.yml" ]; then
    echo "下载 docker-compose.yml..."
    curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml
fi

# 创建配置目录
mkdir -p config

# 下载 nginx 配置（如果不存在）
if [ ! -f "config/nginx.conf" ]; then
    echo "下载 nginx.conf..."
    curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/config/nginx.conf -o config/nginx.conf
fi

# 下载前端配置（如果不存在）
if [ ! -f "config/config.js" ]; then
    echo "下载 config.js..."
    curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/config/config.js -o config/config.js
fi

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "创建环境变量文件..."
    
    # 询问用户是否设置自定义域名
    echo ""
    read -p "请输入自定义域名（直接回车跳过）: " CUSTOM_DOMAIN
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        CORS_ORIGIN="https://$CUSTOM_DOMAIN"
        echo "已设置 CORS_ORIGIN: $CORS_ORIGIN"
    else
        CORS_ORIGIN=""
        echo "⚠️ 已跳过 CORS_ORIGIN 设置，请后续自行编辑 .env 文件配置"
    fi
    
    cat > .env << EOF
GITHUB_OWNER=forzenfox
GITHUB_REPO=lvjiang-cup
TAG=$TAG
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
EOF
    
    # 只有当用户输入了自定义域名时才写入 CORS_ORIGIN
    if [ -n "$CORS_ORIGIN" ]; then
        echo "CORS_ORIGIN=$CORS_ORIGIN" >> .env
    fi
    
    echo ""
    echo "✅ 环境变量文件创建完成"
    if [ -z "$CORS_ORIGIN" ]; then
        echo "⚠️ 请编辑 .env 文件添加 CORS_ORIGIN 配置"
    fi
    echo ""
    echo "请先编辑 .env 文件，然后重新运行此脚本继续部署"
    echo "编辑命令: vim $DEPLOY_DIR/.env"
    exit 0
fi

# 创建数据目录（在项目根目录）
mkdir -p $PROJECT_DIR/data $PROJECT_DIR/backup

# 拉取镜像并启动
echo "拉取镜像..."
TAG=$TAG $COMPOSE_CMD pull

echo "启动服务..."
TAG=$TAG $COMPOSE_CMD up -d

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
    echo "❌ 部署失败，请检查日志: $COMPOSE_CMD logs"
    exit 1
fi
