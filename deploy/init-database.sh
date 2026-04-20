#!/bin/bash

# 驴酱杯数据库初始化脚本
# 用途：完全初始化数据库，包括创建文件、设置权限、初始化表结构
# 
# 使用方法：
# chmod +x init-database.sh
# sudo ./init-database.sh

set -e

PROJECT_DIR="/opt/lvjiang-cup"
DEPLOY_DIR="$PROJECT_DIR/deploy"
DATA_DIR="$PROJECT_DIR/data"
DB_FILE="$DATA_DIR/lvjiang.db"
BACKUP_DIR="$PROJECT_DIR/backup"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================"
echo -e "${GREEN}  驴酱杯数据库初始化脚本${NC}"
echo "========================================"
echo ""

# 检查是否在正确的目录
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}错误：部署目录不存在：$DEPLOY_DIR${NC}"
    echo "请确认项目已正确部署到 $PROJECT_DIR"
    exit 1
fi

# 步骤 1：创建必要的目录
echo "📁 步骤 1/5: 创建目录..."
mkdir -p "$DATA_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$PROJECT_DIR/uploads"
echo -e "${GREEN}   ✅ 目录创建完成${NC}"
echo ""

# 步骤 2：设置权限
echo "🔐 步骤 2/5: 设置权限..."
chown -R 1001:1001 "$DATA_DIR"
chown -R 1001:1001 "$BACKUP_DIR"
chown -R 1001:1001 "$PROJECT_DIR/uploads"
chmod -R 755 "$DATA_DIR"
chmod -R 755 "$BACKUP_DIR"
chmod -R 755 "$PROJECT_DIR/uploads"
echo -e "${GREEN}   ✅ 权限设置完成 (所有者：1001:1001)${NC}"
echo ""

# 步骤 3：检查容器状态
echo "🐳 步骤 3/5: 检查容器状态..."
if docker ps | grep -q lvjiang-backend; then
    echo -e "${YELLOW}   ⚠️  后端容器正在运行，需要先停止${NC}"
    cd "$DEPLOY_DIR"
    docker-compose stop backend
    echo -e "${GREEN}   ✅ 后端容器已停止${NC}"
else
    echo -e "${YELLOW}   ℹ️  后端容器未运行${NC}"
fi
echo ""

# 步骤 4：初始化数据库文件
echo "💾 步骤 4/5: 初始化数据库..."

# 检查是否已有数据库文件
if [ -f "$DB_FILE" ]; then
    echo -e "${YELLOW}   ⚠️  数据库文件已存在${NC}"
    echo -n "   是否删除并重新创建？(y/N): "
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -f "$DB_FILE"
        echo "   🗑️  已删除旧数据库文件"
    else
        echo "   ℹ️  保留现有数据库文件"
    fi
fi

# 如果数据库文件不存在，创建一个临时容器来初始化
if [ ! -f "$DB_FILE" ]; then
    echo "   📦 创建临时容器初始化数据库..."
    
    # 获取 .env 文件中的配置
    if [ -f "$DEPLOY_DIR/.env" ]; then
        source "$DEPLOY_DIR/.env"
        JWT_SECRET="${JWT_SECRET:-default-secret}"
        ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
    else
        JWT_SECRET="default-secret"
        ADMIN_PASSWORD="admin123"
    fi
    
    # 运行临时容器初始化数据库
    docker run --rm \
      --name lvjiang-init \
      -v "$DATA_DIR:/app/data" \
      -v "$BACKUP_DIR:/app/backup" \
      -v "$PROJECT_DIR/uploads:/app/uploads" \
      -e NODE_ENV=production \
      -e DATABASE_PATH=/app/data/lvjiang.db \
      -e UPLOAD_BASE_DIR=/app/uploads \
      -e JWT_SECRET="$JWT_SECRET" \
      -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
      ghcr.io/forzenfox/lvjiang-cup/backend:latest \
      node -e "
        const fs = require('fs');
        const path = require('path');
        const sqlite3 = require('sqlite3');
        
        const dbPath = '/app/data/lvjiang.db';
        const dataDir = path.dirname(dbPath);
        
        // 确保目录存在
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // 创建数据库
        const db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error('创建数据库失败:', err);
            process.exit(1);
          }
          console.log('数据库创建成功');
          db.close();
          process.exit(0);
        });
      " 2>&1 | sed 's/^/     /'
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}   ✅ 数据库文件创建成功${NC}"
      # 重新设置权限（因为是用 root 创建的）
      chown 1001:1001 "$DB_FILE"
    else
      echo -e "${RED}   ❌ 数据库文件创建失败${NC}"
      echo "   请查看上面的错误信息"
      exit 1
    fi
  else
    echo -e "${GREEN}   ✅ 数据库文件已存在，跳过创建${NC}"
fi

echo ""

# 步骤 5：重启容器
echo "🚀 步骤 5/5: 重启后端容器..."
cd "$DEPLOY_DIR"
docker-compose start backend
sleep 5

# 检查容器健康状态
echo ""
echo "⏳ 等待容器启动..."
for i in {1..10}; do
  if docker exec lvjiang-backend wget -q -T 2 -O /dev/null http://127.0.0.1:3000/api/teams 2>/dev/null; then
    echo -e "${GREEN}   ✅ 后端服务启动成功！${NC}"
    break
  else
    if [ $i -eq 10 ]; then
      echo -e "${YELLOW}   ⚠️  容器启动中，请稍后查看日志${NC}"
    else
      echo -n "."
      sleep 2
    fi
  fi
done

echo ""
echo ""
echo "========================================"
echo -e "${GREEN}  ✅ 数据库初始化完成！${NC}"
echo "========================================"
echo ""

# 显示数据库表
echo "📊 数据库表结构："
docker exec lvjiang-backend sqlite3 /app/data/lvjiang.db ".tables" 2>/dev/null | sed 's/^/   /' || echo "   (无法访问数据库，请稍后检查)"
echo ""

# 显示权限
echo "📁 当前权限状态："
echo "   Data 目录:"
ls -ld "$DATA_DIR" | sed 's/^/     /'
echo "   数据库文件:"
ls -l "$DB_FILE" 2>/dev/null | sed 's/^/     /' || echo "     (文件不存在)"
echo ""

echo "📝 后续操作："
echo "   - 查看日志：cd $DEPLOY_DIR && docker-compose logs -f backend"
echo "   - 验证服务：docker exec lvjiang-backend wget -q -O - http://127.0.0.1:3000/api/teams"
echo ""
