#!/bin/bash

# 驴酱杯快速修复脚本 - 目录权限问题
# 用途：快速修复数据库、备份、上传目录的权限问题
# 
# 使用方法（复制到服务器执行）：
# curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/quick-fix-permissions.sh | sudo bash

set -e

PROJECT_DIR="/opt/lvjiang-cup"
DATA_DIR="$PROJECT_DIR/data"
DB_FILE="$DATA_DIR/lvjiang.db"
DEPLOY_DIR="$PROJECT_DIR/deploy"

echo "========================================"
echo "  驴酱杯 - 目录权限快速修复"
echo "========================================"
echo ""

# 1. 确保目录存在
echo "📁 检查目录..."
mkdir -p "$DATA_DIR"
mkdir -p "$PROJECT_DIR/backup"
mkdir -p "$PROJECT_DIR/uploads"
mkdir -p "$PROJECT_DIR/templates"

# 2. 设置权限
echo "🔐 设置权限..."
chown -R 1001:1001 "$DATA_DIR"
chown -R 1001:1001 "$PROJECT_DIR/backup"
chown -R 1001:1001 "$PROJECT_DIR/uploads"
chown -R 1001:1001 "$PROJECT_DIR/templates"
chmod -R 755 "$DATA_DIR"
echo "✅ 权限设置完成 (所有者：1001:1001)"

# 3. 检查数据库文件
if [ ! -f "$DB_FILE" ]; then
    echo "💾 数据库文件不存在，将通过重启容器自动创建..."
else
    echo "✅ 数据库文件已存在"
    ls -l "$DB_FILE"
fi

# 4. 重启后端容器
echo ""
echo "🚀 重启后端容器..."
cd "$DEPLOY_DIR"

if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

$COMPOSE_CMD restart backend

echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 5. 检查服务状态
for i in {1..10}; do
    if docker exec lvjiang-backend wget -q -T 2 -O /dev/null http://127.0.0.1:3000/api/teams 2>/dev/null; then
        echo ""
        echo "========================================"
        echo "  ✅ 修复成功！服务已正常启动"
        echo "========================================"
        echo ""
        echo "📊 验证结果："
        echo "   - 数据库目录权限：$(ls -ld $DATA_DIR | awk '{print $3":"$4}')"
        echo "   - 后端服务状态：运行中"
        echo "   - API 健康检查：通过"
        echo ""
        echo "📝 查看日志：cd $DEPLOY_DIR && $COMPOSE_CMD logs -f backend"
        exit 0
    else
        echo -n "."
        sleep 2
    fi
done

echo ""
echo ""
echo "========================================"
echo "  ⚠️  服务启动中，请稍后检查"
echo "========================================"
echo ""
echo "📝 查看日志：cd $DEPLOY_DIR && $COMPOSE_CMD logs -f backend"
echo ""
