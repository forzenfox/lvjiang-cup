#!/bin/bash
# 驴酱杯 - Docker 镜像加速一键配置脚本（国内服务器专用）
# 使用方法：curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/setup-docker-mirror.sh | sudo bash
# 或：wget -qO- https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/setup-docker-mirror.sh | sudo bash

set -e

# 颜色定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo "${GREEN}========================================${NC}"
echo "${GREEN}  Docker 镜像加速配置脚本${NC}"
echo "${GREEN}  （适用于国内服务器）${NC}"
echo "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 sudo 运行此脚本${NC}"
    echo "示例：sudo bash setup-docker-mirror.sh"
    exit 1
fi

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ 未检测到 Docker，请先安装 Docker${NC}"
    echo "安装指南：https://docs.docker.com/get-docker/"
    exit 1
fi

echo "${YELLOW}📋 检测到的 Docker 版本：${NC}"
docker --version
echo ""

# 备份现有配置
if [ -f /etc/docker/daemon.json ]; then
    echo "${YELLOW}📦 备份现有 Docker 配置...${NC}"
    BACKUP_FILE="/etc/docker/daemon.json.backup.$(date +%Y%m%d%H%M%S)"
    cp /etc/docker/daemon.json "$BACKUP_FILE"
    echo "${GREEN}✅ 配置已备份到：$BACKUP_FILE${NC}"
    echo ""
fi

# 检测云服务器提供商
echo "${YELLOW}☁️  检测服务器提供商...${NC}"
CLOUD_PROVIDER="unknown"

# 腾讯云检测
if dmidecode -s system-product-name 2>/dev/null | grep -qi "qcloud\|tencent"; then
    CLOUD_PROVIDER="tencent"
    echo "${GREEN}检测到腾讯云服务器${NC}"
# 阿里云检测
elif dmidecode -s system-product-name 2>/dev/null | grep -qi "aliyun\|alibaba"; then
    CLOUD_PROVIDER="alibaba"
    echo "${GREEN}检测到阿里云服务器${NC}"
# 华为云检测
elif dmidecode -s system-product-name 2>/dev/null | grep -qi "huawei"; then
    CLOUD_PROVIDER="huawei"
    echo "${GREEN}检测到华为云服务器${NC}"
else
    # 尝试通过实例 ID 检测
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo "")
    if [[ $INSTANCE_ID == i-* ]]; then
        CLOUD_PROVIDER="tencent"
        echo "${GREEN}推测为腾讯云服务器${NC}"
    fi
fi

if [ "$CLOUD_PROVIDER" == "unknown" ]; then
    echo "${YELLOW}⚠️  未能自动识别云服务器提供商，将使用通用配置${NC}"
fi
echo ""

# 创建镜像加速配置
echo "${YELLOW}⚙️  配置 Docker 镜像加速器...${NC}"

# 根据云服务商选择最优镜像源
case $CLOUD_PROVIDER in
    tencent)
        MIRROR1="https://mirror.ccs.tencentyun.com"
        MIRROR2="https://docker.m.daocloud.io"
        MIRROR3="https://docker.1panel.live"
        echo "${GREEN}使用腾讯云专属镜像源：$MIRROR1${NC}"
        ;;
    alibaba)
        MIRROR1="https://docker.m.daocloud.io"
        MIRROR2="https://docker.1panel.live"
        MIRROR3="https://registry.docker-cn.com"
        echo "${YELLOW}⚠️  阿里云用户建议手动配置专属加速器地址${NC}"
        echo "访问：https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors"
        echo ""
        ;;
    huawei)
        MIRROR1="https://docker.m.daocloud.io"
        MIRROR2="https://docker.1panel.live"
        MIRROR3="https://mirror.ccs.tencentyun.com"
        ;;
    *)
        MIRROR1="https://docker.m.daocloud.io"
        MIRROR2="https://docker.1panel.live"
        MIRROR3="https://mirror.ccs.tencentyun.com"
        ;;
esac

# 创建配置文件
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "$MIRROR1",
    "$MIRROR2",
    "$MIRROR3"
  ],
  "max-concurrent-downloads": 10,
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-level": "warn",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "live-restore": true
}
EOF

echo "${GREEN}✅ Docker 配置文件已创建${NC}"
echo ""

# 重启 Docker 服务
echo "${YELLOW}🔄 重启 Docker 服务...${NC}"
systemctl daemon-reload
systemctl restart docker

# 等待 Docker 重启
sleep 3

# 验证 Docker 状态
if systemctl is-active --quiet docker; then
    echo "${GREEN}✅ Docker 服务运行正常${NC}"
else
    echo "${RED}❌ Docker 服务启动失败${NC}"
    echo "请查看日志：journalctl -u docker -f"
    exit 1
fi
echo ""

# 验证镜像加速配置
echo "${YELLOW}🔍 验证镜像加速配置...${NC}"
MIRRORS=$(docker info --format '{{.RegistryConfig.Mirrors}}' 2>/dev/null || echo "")

if [ -n "$MIRRORS" ] && [ "$MIRRORS" != "[]" ]; then
    echo "${GREEN}✅ 镜像加速器配置成功${NC}"
    echo "配置的镜像地址："
    docker info 2>/dev/null | grep -A 10 "Registry Mirrors" || echo "  $MIRRORS"
else
    echo "${YELLOW}⚠️  配置已写入，但 Docker 未显示镜像地址${NC}"
    echo "请检查配置文件：cat /etc/docker/daemon.json"
fi
echo ""

# 测试镜像拉取速度
echo "${YELLOW}🚀 测试镜像拉取速度...${NC}"
echo "开始拉取测试镜像（hello-world）..."
START_TIME=$(date +%s)

# 先删除本地镜像（如果存在）
docker rmi hello-world:latest 2>/dev/null || true

# 拉取镜像
if docker pull hello-world:latest > /dev/null 2>&1; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo "${GREEN}✅ 测试镜像拉取成功，耗时：${DURATION}秒${NC}"
    
    if [ $DURATION -lt 10 ]; then
        echo "${GREEN}🎉 速度非常快！加速配置生效了${NC}"
    elif [ $DURATION -lt 30 ]; then
        echo "${GREEN}速度正常${NC}"
    else
        echo "${YELLOW}⚠️  速度较慢，可能需要调整镜像源${NC}"
    fi
else
    echo "${RED}❌ 测试镜像拉取失败${NC}"
    echo "请检查网络连接或更换镜像源"
fi
echo ""

# 清理测试镜像
docker rmi hello-world:latest > /dev/null 2>&1 || true

# 显示配置摘要
echo "${GREEN}========================================${NC}"
echo "${GREEN}  配置完成摘要${NC}"
echo "${GREEN}========================================${NC}"
echo "镜像源配置："
echo "  1. $MIRROR1"
echo "  2. $MIRROR2"
echo "  3. $MIRROR3"
echo ""
echo "配置文件位置：/etc/docker/daemon.json"
echo ""
echo "后续操作："
echo "  1. 拉取项目镜像：docker compose pull"
echo "  2. 启动服务：docker compose up -d"
echo "  3. 查看状态：docker compose ps"
echo ""
echo "${GREEN}✅ Docker 镜像加速配置完成！${NC}"
echo ""

# 提供故障排查提示
echo "${YELLOW}💡 提示：${NC}"
echo "如果镜像拉取仍然很慢，可以尝试："
echo "  1. 手动更换其他镜像源地址"
echo "  2. 检查 DNS 配置（推荐使用 114.114.114.114 或 223.5.5.5）"
echo "  3. 查看 Docker 日志：journalctl -u docker -f"
echo "  4. 参考文档：deploy/docker-mirror-config.md"
echo ""
