#!/bin/bash

# 驴酱杯健康检查脚本
# 使用方法：./health-check.sh
#
# 功能：
# - 检查容器状态
# - 检查服务连通性
# - 检查磁盘空间
# - 检查内存使用

set -e

PROJECT_DIR="/opt/lvjiang-cup"
DEPLOY_DIR="$PROJECT_DIR/deploy"

echo "========================================"
echo "  驴酱杯健康检查"
echo "========================================"
echo "检查时间：$(date)"
echo ""

cd $DEPLOY_DIR

# 检查 Docker 状态
echo "🔍 检查 Docker 状态..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行"
    exit 1
fi
echo "✅ Docker 运行正常"

# 检查容器状态
echo ""
echo "🔍 检查容器状态..."
BACKEND_STATUS=$(docker inspect -f '{{.State.Status}}' lvjiang-backend 2>/dev/null || echo "not_found")
FRONTEND_STATUS=$(docker inspect -f '{{.State.Status}}' lvjiang-frontend 2>/dev/null || echo "not_found")

if [ "$BACKEND_STATUS" = "running" ]; then
    echo "✅ 后端容器：运行中"
else
    echo "❌ 后端容器：$BACKEND_STATUS"
fi

if [ "$FRONTEND_STATUS" = "running" ]; then
    echo "✅ 前端容器：运行中"
else
    echo "❌ 前端容器：$FRONTEND_STATUS"
fi

# 检查服务连通性
echo ""
echo "🔍 检查服务连通性..."

if docker exec lvjiang-backend wget --quiet --tries=1 --spider http://localhost:3000/api/teams; then
    echo "✅ 后端 API：正常"
else
    echo "❌ 后端 API：无法访问"
fi

if docker exec lvjiang-frontend wget --quiet --tries=1 --spider http://localhost:3001; then
    echo "✅ 前端服务：正常"
else
    echo "❌ 前端服务：无法访问"
fi

# 检查磁盘空间
echo ""
echo "🔍 检查磁盘空间..."
DISK_USAGE=$(df -h $PROJECT_DIR | tail -1 | awk '{print $5}')
echo "磁盘使用率：$DISK_USAGE"

# 检查内存使用
echo ""
echo "🔍 检查内存使用..."
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | grep lvjiang

# 检查日志大小
echo ""
echo "🔍 检查日志文件大小..."
LOG_SIZE=$(du -sh /var/lib/docker/containers/*/*-json.log 2>/dev/null | sort -rh | head -3)
if [ -n "$LOG_SIZE" ]; then
    echo "最大的日志文件:"
    echo "$LOG_SIZE"
fi

echo ""
echo "========================================"
echo "  ✅ 健康检查完成！"
echo "========================================"
echo ""
