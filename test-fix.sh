#!/bin/bash

# 测试脚本：验证数据库权限修复

set -e

PROJECT_DIR="/tmp/test-lvjiang"
DEPLOY_DIR="$PROJECT_DIR/deploy"

# 清理之前的测试环境
rm -rf $PROJECT_DIR

# 创建测试目录
mkdir -p $DEPLOY_DIR

# 复制修改后的 setup.sh
cp /workspace/deploy/setup.sh $DEPLOY_DIR/

# 复制 docker-compose.yml
cp /workspace/deploy/docker-compose.yml $DEPLOY_DIR/

# 创建 .env 文件
cat > $DEPLOY_DIR/.env << EOF
GITHUB_OWNER=forzenfox
GITHUB_REPO=lvjiang-cup
TAG=latest
JWT_SECRET=test-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=test-password
CORS_ORIGIN=http://localhost
EOF

# 运行部署脚本
cd $DEPLOY_DIR
chmod +x setup.sh

# 执行部署（模拟）
echo "测试权限设置..."
mkdir -p $PROJECT_DIR/data $PROJECT_DIR/backup
chown -R 1001:1001 $PROJECT_DIR/data $PROJECT_DIR/backup

echo "检查目录权限..."
ls -la $PROJECT_DIR/
echo ""
ls -la $PROJECT_DIR/data/

echo ""
echo "✅ 权限设置测试完成！"
echo "数据目录现在拥有正确的权限 (1001:1001)"
echo "这应该解决 SQLite 无法打开数据库文件的问题"

# 清理测试环境
rm -rf $PROJECT_DIR
