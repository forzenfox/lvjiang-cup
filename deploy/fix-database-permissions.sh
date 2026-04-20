#!/bin/bash

# 驴酱杯数据库权限修复脚本
# 用途：修复数据库目录权限问题，创建数据库文件
# 
# 使用方法：
# chmod +x fix-database-permissions.sh
# ./fix-database-permissions.sh

set -e

PROJECT_DIR="/opt/lvjiang-cup"
DATA_DIR="$PROJECT_DIR/data"
DB_FILE="$DATA_DIR/lvjiang.db"

echo "========================================"
echo "  驴酱杯数据库权限修复脚本"
echo "========================================"
echo ""

# 1. 检查 data 目录是否存在
if [ ! -d "$DATA_DIR" ]; then
    echo "📁 创建 data 目录..."
    mkdir -p "$DATA_DIR"
else
    echo "✅ data 目录已存在"
fi

# 2. 设置正确的权限（UID 1001 对应容器内的 nodejs 用户）
echo "🔐 设置目录权限（所有者：1001:1001）..."
chown -R 1001:1001 "$DATA_DIR"
chmod -R 755 "$DATA_DIR"

# 3. 检查数据库文件是否存在
if [ ! -f "$DB_FILE" ]; then
    echo "💾 数据库文件不存在，需要初始化..."
    echo ""
    echo "⚠️  注意：数据库文件将在容器首次启动时自动创建"
    echo "   或者你可以手动创建一个空数据库文件："
    echo ""
    echo "   方式一：重启容器自动创建（推荐）"
    echo "   cd /opt/lvjiang-cup/deploy"
    echo "   docker-compose restart backend"
    echo ""
    echo "   方式二：手动创建空数据库文件"
    echo "   docker exec lvjiang-backend sh -c 'sqlite3 /app/data/lvjiang.db \"SELECT 1;\"'"
    echo ""
else
    echo "✅ 数据库文件已存在"
    ls -lh "$DB_FILE"
fi

echo ""
echo "========================================"
echo "  权限设置完成！"
echo "========================================"
echo ""

# 显示当前权限
echo "当前 data 目录权限："
ls -ld "$DATA_DIR"
echo ""

if [ -f "$DB_FILE" ]; then
    echo "当前数据库文件权限："
    ls -l "$DB_FILE"
    echo ""
fi

echo "✅ 下一步操作："
echo "   1. 重启后端容器："
echo "      cd /opt/lvjiang-cup/deploy"
echo "      docker-compose restart backend"
echo ""
echo "   2. 查看日志确认启动成功："
echo "      docker-compose logs -f backend"
echo ""
echo "   3. 验证数据库连接："
echo "      docker exec lvjiang-backend sqlite3 /app/data/lvjiang.db '.tables'"
echo ""
