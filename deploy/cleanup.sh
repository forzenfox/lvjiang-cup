#!/bin/bash

# 驴酱杯清理脚本（服务器版本）
# 功能：清除前后端应用的容器、镜像、数据，保留 NPM 配置
# 使用方法：./cleanup.sh [--all]
#
# 选项：
#   --all : 清理所有内容（包括 NPM 容器和数据）
#
# 适用场景：
# - 服务器部署环境（Linux）
# - 配合 setup.sh 使用，清理后可重新部署

set -e

PROJECT_DIR="/opt/lvjiang-cup"
DEPLOY_DIR="$PROJECT_DIR/deploy"
NPM_DIR="/opt/nginx-proxy-manager"

# 颜色定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo "${BLUE}========================================${NC}"
echo "${BLUE}  驴酱杯清理脚本（服务器版）${NC}"
echo "${BLUE}========================================${NC}"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ 未检测到 Docker，请先安装 Docker${NC}"
    echo "安装指南：https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "${RED}❌ 未检测到 Docker Compose，请先安装 Docker Compose${NC}"
    exit 1
fi

# 询问清理范围
if [ "$1" == "--all" ]; then
    CLEAN_ALL=true
    echo "${YELLOW}⚠️  警告：将清理所有内容（包括 NPM）！${NC}"
else
    CLEAN_ALL=false
fi

echo ""
echo "${YELLOW}请选择清理范围：${NC}"
echo "1. 仅清理驴酱杯应用（保留 NPM）"
echo "2. 清理所有内容（包括 NPM）"
echo ""

if [ "$CLEAN_ALL" = false ]; then
    read -p "请输入选项 (1/2): " choice
    if [ "$choice" == "2" ]; then
        CLEAN_ALL=true
    fi
fi

echo ""
echo "${YELLOW}⚠️  警告：此操作将删除容器和相关数据，且不可恢复！${NC}"
read -p "确认继续？(y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "${YELLOW}操作已取消${NC}"
    exit 0
fi

echo ""

# 步骤 1：停止并删除驴酱杯容器
echo "${YELLOW}📦 步骤 1：停止并删除驴酱杯容器${NC}"
cd "$DEPLOY_DIR"

if $COMPOSE_CMD ps 2>/dev/null | grep -q "lvjiang"; then
    echo "停止服务..."
    $COMPOSE_CMD down
    echo "${GREEN}✅ 驴酱杯容器已停止并删除${NC}"
else
    echo "${GREEN}✅ 驴酱杯容器未运行，跳过${NC}"
fi
echo ""

# 步骤 2：删除驴酱杯容器（如果步骤 1 失败）
echo "${YELLOW}🗑️  步骤 2：清理残留容器${NC}"
for container in lvjiang-backend lvjiang-frontend; do
    if docker ps -a | grep -q "$container"; then
        echo "删除容器：$container"
        docker rm -f "$container" 2>/dev/null || true
    fi
done
echo "${GREEN}✅ 残留容器清理完成${NC}"
echo ""

# 步骤 3：删除驴酱杯镜像
echo "${YELLOW}🗑️  步骤 3：删除驴酱杯镜像${NC}"
echo "删除后端镜像..."
docker rmi $(docker images | grep "ghcr.io/.*/lvjiang-cup/backend" | awk '{print $3}') 2>/dev/null || echo "后端镜像未找到或已删除"

echo "删除前端镜像..."
docker rmi $(docker images | grep "ghcr.io/.*/lvjiang-cup/frontend" | awk '{print $3}') 2>/dev/null || echo "前端镜像未找到或已删除"
echo "${GREEN}✅ 镜像删除完成${NC}"
echo ""

# 步骤 4：清理数据目录（可选）
echo "${YELLOW}📁 步骤 4：处理数据目录${NC}"
if [ -d "$PROJECT_DIR/data" ] || [ -d "$PROJECT_DIR/backup" ]; then
    echo ""
    echo "发现数据目录："
    echo "  - $PROJECT_DIR/data"
    echo "  - $PROJECT_DIR/backup"
    echo ""
    
    if [ "$CLEAN_ALL" = true ]; then
        read -p "是否删除数据库和备份文件？(y/N): " delete_data
        if [ "$delete_data" == "y" ] || [ "$delete_data" == "Y" ]; then
            echo "删除数据目录..."
            rm -rf "$PROJECT_DIR/data" "$PROJECT_DIR/backup" 2>/dev/null || true
            echo "${GREEN}✅ 数据目录已删除${NC}"
        else
            echo "${YELLOW}⚠️  保留数据目录，下次部署将使用现有数据${NC}"
        fi
    else
        echo "${YELLOW}⚠️  保留数据目录，下次部署将使用现有数据${NC}"
        echo "如需删除数据，请手动执行：rm -rf $PROJECT_DIR/data $PROJECT_DIR/backup"
    fi
else
    echo "${GREEN}✅ 数据目录不存在，跳过${NC}"
fi
echo ""

# 步骤 5：清理配置文件（.env 和 config.js）
echo "${YELLOW}📝 步骤 5：处理配置文件${NC}"
if [ -f "$DEPLOY_DIR/.env" ] || [ -f "$DEPLOY_DIR/config.js" ]; then
    echo "发现配置文件："
    [ -f "$DEPLOY_DIR/.env" ] && echo "  - $DEPLOY_DIR/.env"
    [ -f "$DEPLOY_DIR/config.js" ] && echo "  - $DEPLOY_DIR/config.js"
    echo ""

    if [ "$CLEAN_ALL" = true ]; then
        read -p "是否删除配置文件？(y/N): " delete_config
        if [ "$delete_config" == "y" ] || [ "$delete_config" == "Y" ]; then
            [ -f "$DEPLOY_DIR/.env" ] && rm "$DEPLOY_DIR/.env" && echo "✅ .env 文件已删除"
            [ -f "$DEPLOY_DIR/config.js" ] && rm "$DEPLOY_DIR/config.js" && echo "✅ config.js 文件已删除"
            echo "${GREEN}✅ 配置文件已删除${NC}"
        else
            echo "${YELLOW}⚠️  保留配置文件${NC}"
        fi
    else
        echo "${YELLOW}⚠️  保留配置文件，下次部署将使用现有配置${NC}"
    fi
else
    echo "${GREEN}✅ 配置文件不存在，跳过${NC}"
fi
echo ""

# 步骤 6：清理 Docker 网络（仅当清理所有时）
echo "${YELLOW}🌐 步骤 6：处理 Docker 网络${NC}"
if docker network ls 2>/dev/null | grep -q "npm-network"; then
    if [ "$CLEAN_ALL" = true ]; then
        # 检查是否有其他容器使用此网络
        if docker network inspect npm-network 2>/dev/null | grep -q "\"Containers\": {}"; then
            echo "删除 Docker 网络 npm-network..."
            docker network rm npm-network 2>/dev/null || true
            echo "${GREEN}✅ Docker 网络已删除${NC}"
        else
            echo "${YELLOW}⚠️  网络 npm-network 仍被其他容器使用，保留网络${NC}"
        fi
    else
        echo "${GREEN}✅ 保留 Docker 网络 npm-network（setup.sh 将复用此网络）${NC}"
    fi
else
    echo "${GREEN}✅ Docker 网络不存在，跳过${NC}"
fi
echo ""

# 步骤 7：清理 NPM（仅当清理所有时）
if [ "$CLEAN_ALL" = true ]; then
    echo "${YELLOW}🔧 步骤 7：清理 Nginx Proxy Manager${NC}"
    cd "$NPM_DIR" 2>/dev/null || {
        echo "${YELLOW}⚠️  未找到 NPM 配置目录，跳过 NPM 清理${NC}"
        echo ""
    }
    
    if [ -f "docker-compose.yml" ]; then
        if docker ps | grep -q "nginx-proxy-manager"; then
            echo "停止 NPM 服务..."
            $COMPOSE_CMD down
            echo "${GREEN}✅ NPM 容器已停止${NC}"
        fi
        
        echo "删除 NPM 容器..."
        docker rm -f nginx-proxy-manager 2>/dev/null || true
        
        echo "删除 NPM 镜像..."
        docker rmi $(docker images | grep "jc21/nginx-proxy-manager" | awk '{print $3}') 2>/dev/null || true
        
        echo "${GREEN}✅ NPM 清理完成${NC}"
    else
        echo "${GREEN}✅ NPM 配置文件不存在，跳过${NC}"
    fi
    echo ""
else
    echo "${YELLOW}🔧 步骤 7：保留 Nginx Proxy Manager${NC}"
    if docker ps | grep -q "nginx-proxy-manager"; then
        echo "${GREEN}✅ NPM 正在运行，已保留${NC}"
    else
        echo "${YELLOW}⚠️  NPM 未运行，但配置文件已保留${NC}"
    fi
    echo ""
fi

# 总结
echo "${GREEN}========================================${NC}"
echo "${GREEN}  ✅ 清理完成！${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "已清理的内容："
echo "  ✅ 驴酱杯前后端容器（lvjiang-backend, lvjiang-frontend）"
echo "  ✅ 驴酱杯镜像"
if [ "$CLEAN_ALL" = true ]; then
    echo "  ✅ NPM 容器和镜像（如选择删除）"
    echo "  ✅ Docker 网络（如无其他容器使用）"
else
    echo "  ✅ 保留 NPM 配置"
    echo "  ✅ 保留 Docker 网络"
fi
echo ""
echo "保留的内容："
if [ "$CLEAN_ALL" = true ]; then
    echo "  - 无（所有已清理）"
else
    echo "  - NPM 容器和配置"
    echo "  - Docker 网络 npm-network"
    echo "  - 数据目录（$PROJECT_DIR/data, $PROJECT_DIR/backup）"
    echo "  - 配置文件（$DEPLOY_DIR/.env, $DEPLOY_DIR/config.js）"
fi
echo ""
echo "📌 下一步操作："
echo ""
if [ "$CLEAN_ALL" = true ]; then
    echo "1. 重新部署 NPM（可选）："
    echo "   cd $NPM_DIR && $COMPOSE_CMD up -d"
    echo ""
    echo "2. 重新部署驴酱杯应用："
    echo "   cd $DEPLOY_DIR && ./setup.sh"
else
    echo "可以直接运行部署脚本重新部署："
    echo "  cd $DEPLOY_DIR && ./setup.sh"
fi
echo ""
