#!/bin/bash

# 驴酱杯统一部署脚本（方案 C：Nginx Proxy Manager 统一网关）
# 使用方法: ./setup.sh [tag]
#
# 功能：
# - 初始化 Docker 网络
# - 部署 Nginx Proxy Manager
# - 部署驴酱杯应用
# - 配置检查和健康验证

set -e

TAG="${1:-latest}"
PROJECT_DIR="/opt/lvjiang-cup"
DEPLOY_DIR="$PROJECT_DIR/deploy"
NPM_DIR="/opt/nginx-proxy-manager"

# 颜色定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo "${GREEN}========================================${NC}"
echo "${GREEN}  驴酱杯统一部署脚本（方案 C）${NC}"
echo "${GREEN}========================================${NC}"
echo "版本标签：$TAG"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ 未检测到 Docker，请先安装 Docker${NC}"
    echo "安装指南：https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose（支持新版 docker compose 和旧版 docker-compose）
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "${RED}❌ 未检测到 Docker Compose，请先安装 Docker Compose${NC}"
    echo "安装指南：https://docs.docker.com/compose/install/"
    exit 1
fi

# 步骤 1：初始化网络
echo "${YELLOW}📡 步骤 1：初始化 Docker 网络${NC}"
if ! docker network ls | grep -q npm-network; then
    echo "创建 Docker 网络 npm-network..."
    docker network create npm-network
    echo "${GREEN}✅ 网络创建成功${NC}"
else
    echo "${GREEN}✅ 网络已存在，跳过创建${NC}"
fi
echo ""

# 步骤 2：部署 Nginx Proxy Manager
echo "${YELLOW}🔧 步骤 2：部署 Nginx Proxy Manager${NC}"
mkdir -p $NPM_DIR
cd $NPM_DIR

# 下载 NPM 配置文件
if [ ! -f "docker-compose.yml" ]; then
    echo "下载 Nginx Proxy Manager 配置..."
    curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/npm/docker-compose.yml -o docker-compose.yml
fi

# 启动 NPM
if ! docker ps | grep -q nginx-proxy-manager; then
    echo "启动 Nginx Proxy Manager..."
    $COMPOSE_CMD up -d
    echo "等待 NPM 启动..."
    sleep 10
    echo "${GREEN}✅ NPM 部署成功${NC}"
else
    echo "${GREEN}✅ NPM 已运行，跳过部署${NC}"
fi
echo ""

# 步骤 3：部署驴酱杯应用
echo "${YELLOW}🚀 步骤 3：部署驴酱杯应用${NC}"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 下载配置文件
if [ ! -f "docker-compose.yml" ]; then
    echo "下载驴酱杯配置..."
    curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/docker-compose.yml -o docker-compose.yml
fi

# 下载前端运行时配置文件（如果不存在）
if [ ! -f "config.js" ]; then
    echo "下载前端配置文件..."
    curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/config.js -o config.js
    echo "${GREEN}✅ 前端配置文件下载完成${NC}"
    echo "${YELLOW}💡 提示：如需修改 API 地址，请编辑 $DEPLOY_DIR/config.js${NC}"
fi

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "${YELLOW}创建环境变量文件...${NC}"
    
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
        echo "${YELLOW}⚠️  已跳过 CORS_ORIGIN 设置，请后续自行编辑 .env 文件配置${NC}"
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
    echo "${GREEN}✅ 环境变量文件创建完成${NC}"
    if [ -z "$CORS_ORIGIN" ]; then
        echo "${YELLOW}⚠️  请编辑 .env 文件添加 CORS_ORIGIN 配置${NC}"
    fi
    echo ""
    echo "请先编辑 .env 文件，然后重新运行此脚本继续部署"
    echo "编辑命令：vim $DEPLOY_DIR/.env"
    exit 0
fi

# 创建数据目录（包括上传文件目录）
mkdir -p $PROJECT_DIR/data $PROJECT_DIR/backup $PROJECT_DIR/uploads $PROJECT_DIR/templates

# 设置目录权限（UID 1001 对应容器内的 nodejs 用户）
echo "${YELLOW}🔐 设置目录权限...${NC}"
chown -R 1001:1001 $PROJECT_DIR/data $PROJECT_DIR/backup $PROJECT_DIR/uploads $PROJECT_DIR/templates
chmod -R 755 $PROJECT_DIR/data $PROJECT_DIR/backup $PROJECT_DIR/uploads $PROJECT_DIR/templates
echo "${GREEN}✅ 权限设置完成${NC}"
echo ""

# 从镜像中提取英雄映射数据文件到宿主机
# 必须在 docker-compose up 之前完成，因为 volume 挂载会覆盖容器内文件
CHAMPION_MAP_SRC="/app/data/lol-champion-map.json"
CHAMPION_MAP_DST="$PROJECT_DIR/data/lol-champion-map.json"
if [ ! -f "$CHAMPION_MAP_DST" ]; then
    echo "从镜像提取英雄映射数据文件..."
    IMAGE_NAME="ghcr.io/${GITHUB_OWNER:-forzenfox}/${GITHUB_REPO:-lvjiang-cup}/backend:${TAG:-latest}"
    
    # 先拉取镜像（如果还没拉过）
    TAG=$TAG $COMPOSE_CMD pull backend
    
    # 从镜像中临时创建一个容器来复制文件
    TEMP_CONTAINER=$(docker create "$IMAGE_NAME" sh)
    docker cp "$TEMP_CONTAINER:$CHAMPION_MAP_SRC" "$PROJECT_DIR/data/"
    docker rm "$TEMP_CONTAINER" > /dev/null 2>&1
    
    if [ -f "$CHAMPION_MAP_DST" ]; then
        chown -R 1001:1001 "$CHAMPION_MAP_DST"
        echo "${GREEN}✅ 英雄映射数据文件已提取到 $PROJECT_DIR/data/${NC}"
    else
        echo "${RED}❌ 镜像中未找到英雄映射数据文件${NC}"
        echo "请检查镜像是否正确构建"
        exit 1
    fi
fi

# 拉取其他服务镜像并启动
echo "拉取镜像..."
TAG=$TAG $COMPOSE_CMD pull

echo "启动服务..."
TAG=$TAG $COMPOSE_CMD up -d

# 等待容器启动
echo "等待容器启动..."
sleep 10

# 健康检查
echo "${YELLOW}🔍 步骤 4：健康检查${NC}"

# 检查 NPM（使用 curl 检查，因为容器内可能没有 wget）
if curl -s --max-time 5 http://localhost:8181 > /dev/null 2>&1; then
    echo "${GREEN}✅ Nginx Proxy Manager 服务正常${NC}"
else
    echo "${YELLOW}⚠️  Nginx Proxy Manager 服务检查失败（可能是服务启动较慢）${NC}"
    echo "建议手动检查：curl -I http://localhost:8181"
fi

# 检查后端
if curl -s --max-time 5 http://localhost:3000/api/teams > /dev/null 2>&1; then
    echo "${GREEN}✅ 后端服务正常${NC}"
else
    echo "${YELLOW}⚠️  后端服务检查失败（可能是服务启动较慢）${NC}"
    echo "建议手动检查：curl -I http://localhost:3000/api/teams"
fi

# 检查前端
if curl -s --max-time 5 http://localhost:3001 > /dev/null 2>&1; then
    echo "${GREEN}✅ 前端服务正常${NC}"
else
    echo "${YELLOW}⚠️  前端服务检查失败（可能是服务启动较慢）${NC}"
    echo "建议手动检查：curl -I http://localhost:3001"
fi

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}  ✅ 部署完成！${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "📌 访问信息："
echo ""
echo "1. Nginx Proxy Manager 管理界面："
echo "   ${YELLOW}http://服务器 IP:8181${NC}"
echo "   默认账号：admin@example.com"
echo "   默认密码：changeme"
echo ""
echo "2. 配置 NPM 代理："
echo "   - 添加 Proxy Host:"
echo "     * Domain: your-domain.com"
echo "     * Forward IP: lvjiang-frontend"
echo "     * Forward Port: 3001 (前端)"
echo "   - 配置 SSL 证书（Request a new SSL certificate）"
echo "   - 添加 API 路由：/api → lvjiang-backend:3000 (后端)"
echo ""
echo "📁 配置文件位置:"
echo "  - 环境变量：$DEPLOY_DIR/.env"
echo "  - 前端配置：$DEPLOY_DIR/config.js"
echo "  - 数据目录：$PROJECT_DIR/data"
echo "  - 备份目录：$PROJECT_DIR/backup"
echo "  - NPM 配置：$NPM_DIR/docker-compose.yml"
echo ""
echo "🔧 常用命令:"
echo "  - 查看状态：cd $DEPLOY_DIR && $COMPOSE_CMD ps"
echo "  - 查看日志：cd $DEPLOY_DIR && $COMPOSE_CMD logs -f"
echo "  - 重启服务：cd $DEPLOY_DIR && $COMPOSE_CMD restart"
echo "  - 停止服务：cd $DEPLOY_DIR && $COMPOSE_CMD down"
echo "  - 更新应用：cd $DEPLOY_DIR && ./update.sh"
echo ""
echo "${YELLOW}💡 提示：${NC}"
echo "- 首次登录 NPM 管理界面请修改默认密码"
echo "- 生产环境请修改 .env 文件中的敏感配置"
echo "- 配置域名 DNS 解析到服务器 IP 后再申请 SSL 证书"
echo ""
