#!/bin/bash

# 驴酱杯应用更新脚本（方案 C：Nginx Proxy Manager 统一网关）
# 使用方法：./update.sh [tag]
#
# 功能：
# - 拉取最新 Docker 镜像
# - 重启应用容器
# - 健康检查验证
# - 保留所有数据

set -e

TAG="${1:-latest}"
PROJECT_DIR="/opt/lvjiang-cup"
DEPLOY_DIR="$PROJECT_DIR/deploy"

echo "========================================"
echo "  驴酱杯应用更新脚本"
echo "========================================"
echo "版本标签：$TAG"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ 未检测到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

# 切换到部署目录
cd $DEPLOY_DIR

echo "📦 拉取最新镜像..."
TAG=$TAG $COMPOSE_CMD pull

echo ""
echo "🎯 停止当前服务..."
$COMPOSE_CMD down

echo ""
echo "🚀 启动新版本服务..."
TAG=$TAG $COMPOSE_CMD up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 8

echo ""
echo "✅ 进行健康检查..."

# 检查后端
if docker exec lvjiang-backend wget --quiet --tries=1 --spider http://localhost:3000/api/teams; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务检查失败"
    echo "查看日志：$COMPOSE_CMD logs backend"
    exit 1
fi

# 检查前端
if docker exec lvjiang-frontend wget --quiet --tries=1 --spider http://localhost:3001; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务检查失败"
    echo "查看日志：$COMPOSE_CMD logs frontend"
    exit 1
fi

echo ""
echo "========================================"
echo "  ✅ 更新成功！"
echo "========================================"
echo ""
echo "当前版本：$TAG"
echo "访问地址：https://your-domain.com"
echo ""
echo "常用命令:"
echo "  - 查看状态：cd $DEPLOY_DIR && $COMPOSE_CMD ps"
echo "  - 查看日志：cd $DEPLOY_DIR && $COMPOSE_CMD logs -f"
echo "  - 重启服务：cd $DEPLOY_DIR && $COMPOSE_CMD restart"
echo "  - 回滚版本：修改 .env 中的 TAG 并重启"
echo ""
