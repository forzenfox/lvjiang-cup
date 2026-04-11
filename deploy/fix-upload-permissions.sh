#!/bin/bash

# 驴酱杯 - 修复上传目录权限脚本
# 使用方法：./fix-upload-permissions.sh
#
# 功能：
# - 创建 uploads 目录（如果不存在）
# - 设置正确的权限（UID 1001，与容器内 nodejs 用户匹配）
# - 重启后端容器使权限生效

set -e

PROJECT_DIR="/opt/lvjiang-cup"
UPLOADS_DIR="$PROJECT_DIR/uploads"

echo "========================================"
echo "  修复上传目录权限"
echo "========================================"
echo ""

# 检查是否在正确的目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 项目目录不存在：$PROJECT_DIR"
    echo "请确认部署路径是否正确"
    exit 1
fi

# 创建 uploads 目录
echo "📁 检查 uploads 目录..."
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "创建 uploads 目录..."
    mkdir -p "$UPLOADS_DIR"
    echo "✅ 目录创建成功：$UPLOADS_DIR"
else
    echo "✅ 目录已存在：$UPLOADS_DIR"
fi

# 设置权限
echo ""
echo "🔐 设置目录权限..."
echo "所有者：1001:1001 (nodejs 用户)"
chown -R 1001:1001 "$UPLOADS_DIR"
echo "✅ 权限设置成功"

# 验证权限
echo ""
echo "📋 验证权限设置..."
ls -ld "$UPLOADS_DIR"

# 检查 Docker 容器
echo ""
echo "🐳 检查后端容器..."
if docker ps | grep -q lvjiang-backend; then
    echo "✅ 后端容器运行中"
    
    # 重启后端容器
    echo ""
    echo "🔄 重启后端容器以应用权限更改..."
    docker restart lvjiang-backend
    
    echo "⏳ 等待容器启动..."
    sleep 5
    
    # 验证容器内权限
    echo ""
    echo "🔍 验证容器内权限..."
    if docker exec lvjiang-backend ls -ld /app/uploads > /dev/null 2>&1; then
        docker exec lvjiang-backend ls -ld /app/uploads
        echo "✅ 容器内权限验证成功"
    else
        echo "⚠️  无法验证容器内权限，请手动检查"
    fi
else
    echo "⚠️  后端容器未运行"
    echo "请先启动服务：cd $PROJECT_DIR/deploy && docker-compose up -d"
fi

echo ""
echo "========================================"
echo "  ✅ 权限修复完成！"
echo "========================================"
echo ""
echo "现在可以重新尝试上传战队图标"
echo ""
echo "测试上传："
echo "1. 访问管理后台登录"
echo "2. 进入战队管理页面"
echo "3. 上传战队图标"
echo ""
echo "如果仍然失败，请查看日志："
echo "  docker-compose logs -f backend"
echo ""
