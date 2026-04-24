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

# 颜色定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

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

# 同步英雄映射数据文件到宿主机
# 如果宿主机 data 目录没有该文件，需要从镜像中提取
# 注意：使用 docker create 而不是从运行中的容器复制，因为 volume 挂载会覆盖容器内文件
CHAMPION_MAP_DST="$PROJECT_DIR/data/lol-champion-map.json"
if [ ! -f "$CHAMPION_MAP_DST" ]; then
    echo "${YELLOW}⚠️  宿主机缺少英雄映射数据文件，正在从镜像提取...${NC}"
    IMAGE_NAME="ghcr.io/${GITHUB_OWNER:-forzenfox}/${GITHUB_REPO:-lvjiang-cup}/backend:${TAG:-latest}"
    CHAMPION_MAP_SRC="/app/data/lol-champion-map.json"

    # 从镜像中临时创建一个容器来复制文件
    TEMP_CONTAINER=$(docker create "$IMAGE_NAME" sh)
    docker cp "$TEMP_CONTAINER:$CHAMPION_MAP_SRC" "$PROJECT_DIR/data/"
    docker rm "$TEMP_CONTAINER" > /dev/null 2>&1

    if [ -f "$CHAMPION_MAP_DST" ]; then
        chown -R 1001:1001 "$CHAMPION_MAP_DST"
        echo "${GREEN}✅ 英雄映射数据文件已提取到宿主机${NC}"
    else
        echo "${RED}❌ 镜像中未找到英雄映射数据文件${NC}"
        echo "请检查镜像是否正确构建"
        exit 1
    fi
fi

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

# 检查后端 API - 使用容器内部检查
if docker exec lvjiang-backend sh -c "wget -q -T 2 -O /dev/null http://127.0.0.1:3000/api/teams"; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务检查失败"
    echo "查看日志：$COMPOSE_CMD logs backend"
    exit 1
fi

# 检查前端服务 - 使用容器内部检查
if docker exec lvjiang-frontend sh -c "wget -q -T 2 -O /dev/null http://127.0.0.1:3001/"; then
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
