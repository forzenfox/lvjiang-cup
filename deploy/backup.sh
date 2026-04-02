#!/bin/bash

# 驴酱杯备份脚本
# 使用方法：./backup.sh
#
# 功能：
# - 自动备份 SQLite 数据库
# - 保留最近 30 天的备份
# - 压缩备份文件节省空间

set -e

PROJECT_DIR="/opt/lvjiang-cup"
BACKUP_DIR="$PROJECT_DIR/backup"
DATE=$(date +%Y%m%d_%H%M%S)

echo "========================================"
echo "  驴酱杯数据备份脚本"
echo "========================================"
echo "备份时间：$DATE"
echo ""

# 创建备份目录
mkdir -p $BACKUP_DIR

echo "📦 备份数据库..."
docker exec lvjiang-backend sh -c "cp /app/data/lvjiang.db /app/backup/lvjiang_$DATE.db"

# 压缩备份文件
cd $BACKUP_DIR
tar -czf lvjiang_$DATE.tar.gz lvjiang_$DATE.db
rm lvjiang_$DATE.db

echo "✅ 数据库备份完成：$BACKUP_DIR/lvjiang_$DATE.tar.gz"

echo ""
echo "🗑️  清理 30 天前的备份..."
find $BACKUP_DIR -name "lvjiang_*.tar.gz" -mtime +30 -delete

echo ""
echo "========================================"
echo "  ✅ 备份完成！"
echo "========================================"
echo ""
echo "备份文件：$BACKUP_DIR/lvjiang_$DATE.tar.gz"
echo "备份保留：30 天"
echo ""

# 显示备份列表
echo "最近的备份:"
ls -lht $BACKUP_DIR/lvjiang_*.tar.gz | head -5
