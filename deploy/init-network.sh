#!/bin/bash

# 驴酱杯网络初始化脚本
# 使用方法：./init-network.sh
#
# 功能：
# - 创建 Docker 网络 npm-network
# - 供 Nginx Proxy Manager 和驴酱杯应用共享使用

set -e

echo "========================================"
echo "  驴酱杯网络初始化"
echo "========================================"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查网络是否已存在
if docker network ls | grep -q npm-network; then
    echo "✅ 网络 npm-network 已存在，无需创建"
    echo ""
    echo "网络详情："
    docker network inspect npm-network --format='{{.Name}}: {{.Driver}}'
    exit 0
fi

# 创建网络
echo "📡 创建 Docker 网络 npm-network..."
docker network create npm-network

echo ""
echo "========================================"
echo "  ✅ 网络创建成功！"
echo "========================================"
echo ""
echo "网络名称：npm-network"
echo "驱动类型：bridge"
echo ""
echo "📌 下一步操作："
echo ""
echo "1. 部署 Nginx Proxy Manager："
echo "   cd /opt/nginx-proxy-manager"
echo "   docker-compose up -d"
echo ""
echo "2. 部署驴酱杯应用："
echo "   cd /opt/lvjiang-cup/deploy"
echo "   ./deploy.sh"
echo ""
