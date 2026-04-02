#!/bin/bash

# 驴酱杯一键部署脚本（方案 C：Nginx Proxy Manager 统一网关）
# 使用方法: ./deploy.sh [tag]
#
# 注意：
# - 此脚本位于 /deploy 目录
# - 需要先部署 Nginx Proxy Manager
# - 所有容器端口仅内部访问，不映射到主机

set -e

TAG="${1:-latest}"
PROJECT_DIR="/opt/lvjiang-cup"
DEPLOY_DIR="$PROJECT_DIR/deploy"
NPM_DIR="$PROJECT_DIR/npm"

echo "========================================"
echo "  驴酱杯一键部署（方案 C）"
echo "========================================"
echo "版本标签：$TAG"
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

# 检查 Nginx Proxy Manager 是否已部署
echo "检查 Nginx Proxy Manager 状态..."
if ! docker ps | grep -q nginx-proxy-manager; then
    echo "⚠️  未检测到 Nginx Proxy Manager，请先部署 NPM"
    echo ""
    echo "部署 NPM 的步骤："
    echo "1. 创建部署目录：mkdir -p $NPM_DIR"
    echo "2. 下载配置：curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/npm/docker-compose.yml -o $NPM_DIR/docker-compose.yml"
    echo "3. 启动 NPM: cd $NPM_DIR && $COMPOSE_CMD up -d"
    echo ""
    echo "然后重新运行此脚本"
    exit 1
fi
echo "✅ Nginx Proxy Manager 运行正常"
echo ""

# 创建目录
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 下载配置文件（如果不存在）
if [ ! -f "docker-compose.yml" ]; then
    echo "下载 docker-compose.yml..."
    curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml
fi

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "创建环境变量文件..."
    
    # 检查是否通过管道执行（非交互式）
    if [ ! -t 0 ]; then
        # 非交互式模式，使用默认值
        echo ""
        echo "检测到非交互式执行，使用默认配置..."
        CUSTOM_DOMAIN=""
    else
        # 交互式模式，询问用户
        echo ""
        read -p "请输入自定义域名（直接回车跳过）: " CUSTOM_DOMAIN
    fi
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        CORS_ORIGIN="https://$CUSTOM_DOMAIN"
        echo "已设置 CORS_ORIGIN: $CORS_ORIGIN"
    else
        CORS_ORIGIN=""
        echo "⚠️  已跳过 CORS_ORIGIN 设置，请后续自行编辑 .env 文件配置"
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
        echo "⚠️  请编辑 .env 文件添加 CORS_ORIGIN 配置"
    fi
    echo ""
    echo "请先编辑 .env 文件，然后重新运行此脚本继续部署"
    echo "编辑命令：vim $DEPLOY_DIR/.env"
    exit 0
fi

# 创建数据目录（在项目根目录）
mkdir -p $PROJECT_DIR/data $PROJECT_DIR/backup

# 检查 npm-network 网络是否存在
if ! docker network ls | grep -q npm-network; then
    echo "创建 Docker 网络 npm-network..."
    docker network create npm-network
fi

# 拉取镜像并启动
echo "拉取镜像..."
TAG=$TAG $COMPOSE_CMD pull

echo "启动服务..."
TAG=$TAG $COMPOSE_CMD up -d

# 等待容器启动
echo "等待容器启动..."
sleep 8

# 健康检查
echo "进行健康检查..."
if docker exec lvjiang-backend wget --quiet --tries=1 --spider http://localhost:3000/api/teams; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务检查失败"
    echo "查看日志：$COMPOSE_CMD logs backend"
    exit 1
fi

if docker exec lvjiang-frontend wget --quiet --tries=1 --spider http://localhost:3001; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务检查失败"
    echo "查看日志：$COMPOSE_CMD logs frontend"
    exit 1
fi

echo ""
echo "========================================"
echo "  ✅ 部署成功！"
echo "========================================"
echo ""
echo "📌 下一步操作："
echo ""
echo "1. 在 Nginx Proxy Manager 中配置代理主机："
echo "   - 访问：http://服务器 IP:8181"
echo "   - 添加 Proxy Host:"
echo "     * Domain: your-domain.com"
echo "     * Forward IP: 127.0.0.1"
echo "     * Forward Port: 3001 (前端)"
echo "   - 配置 SSL 证书（Request a new SSL certificate）"
echo ""
echo "2. 添加 API 路由（高级配置）："
echo "   - Location: /api"
echo "   - Forward Port: 3000 (后端)"
echo ""
echo "配置文件位置:"
echo "  - 环境变量：$DEPLOY_DIR/.env"
echo "  - 数据目录：$PROJECT_DIR/data"
echo "  - 备份目录：$PROJECT_DIR/backup"
echo ""
echo "常用命令:"
echo "  - 查看状态：cd $DEPLOY_DIR && $COMPOSE_CMD ps"
echo "  - 查看日志：cd $DEPLOY_DIR && $COMPOSE_CMD logs -f"
echo "  - 重启服务：cd $DEPLOY_DIR && $COMPOSE_CMD restart"
echo "  - 停止服务：cd $DEPLOY_DIR && $COMPOSE_CMD down"
echo ""
