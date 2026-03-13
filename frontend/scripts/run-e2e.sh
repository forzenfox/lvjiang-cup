#!/bin/bash

# 驴酱杯赛事网站 E2E测试执行脚本
# 本地开发环境使用
# 注意：测试用例存在依赖关系，必须串行执行

set -e

echo "🧪 驴酱杯赛事网站 E2E测试"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查服务是否运行
echo "🔍 检查服务状态..."
if ! curl -s http://localhost:5173 > /dev/null; then
    echo -e "${RED}❌ 前端服务未启动，请先运行: npm run dev${NC}"
    exit 1
fi

if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${RED}❌ 后端服务未启动，请先运行: npm run start:dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 服务运行正常${NC}"
echo ""

# 执行所有测试
echo "🚀 开始执行E2E测试（串行模式）"
echo ""

# 使用playwright配置中的testMatch顺序执行
npx playwright test --workers=1

echo ""
echo -e "${GREEN}✅ E2E测试执行完成${NC}"
echo ""
echo "📊 查看测试报告:"
echo "   HTML报告: tests/e2e/report/index.html"
echo "   JUnit报告: tests/e2e/report/results.xml"
