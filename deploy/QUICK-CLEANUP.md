# 驴酱杯部署清理 - 快速参考

## 一句话总结

清理部署环境后，可以通过 `setup.sh` 重新一键部署。

## 快速使用

```bash
# SSH 登录服务器
ssh user@your-server-ip

# 切换到部署目录
cd /opt/lvjiang-cup/deploy

# 添加执行权限（仅首次）
chmod +x cleanup.sh

# 运行清理（保留 NPM 和数据）
./cleanup.sh

# 重新部署
./setup.sh
```

## 清理范围对比

| 清理模式 | 保留 NPM | 保留数据 | 保留 .env | 适用场景 |
|---------|---------|---------|----------|---------|
| 默认模式 | ✅ | ✅ | ✅ | 版本更新、重新部署 |
| `--all` 模式 | ❌ | ❌ | ❌ | 完全重置环境 |

## 常用命令组合

### 场景 1：更新版本
```bash
./cleanup.sh && ./setup.sh latest
```

### 场景 2：测试部署
```bash
./setup.sh test-v1 && ./cleanup.sh && ./setup.sh test-v2
```

### 场景 3：完全重置
```bash
./cleanup.sh --all  # 选择删除所有
cd /opt/nginx-proxy-manager && docker-compose up -d
cd /opt/lvjiang-cup/deploy && ./setup.sh
```

## 核心文件

| 文件 | 用途 | 位置 |
|------|------|------|
| `setup.sh` | 一键部署 | `/opt/lvjiang-cup/deploy/` |
| `cleanup.sh` | 清理环境 | `/opt/lvjiang-cup/deploy/` |
| `update.sh` | 更新应用 | `/opt/lvjiang-cup/deploy/` |
| `.env` | 环境变量 | `/opt/lvjiang-cup/deploy/` |
| `data/` | 数据目录 | `/opt/lvjiang-cup/` |

## 注意事项

⚠️ **清理前确认：**
- 数据是否需要备份
- NPM 是否需要保留
- 是否有其他服务依赖

✅ **推荐做法：**
- 保留 NPM（避免重复配置）
- 保留数据（避免数据丢失）
- 保留 .env（避免重新配置）

## 验证清理

```bash
# 检查容器是否清理
docker ps -a | grep lvjiang

# 检查镜像是否清理
docker images | grep lvjiang-cup

# 检查网络（默认保留）
docker network ls | grep npm-network
```

## 完整文档

详细文档请查看：[CLEANUP.md](CLEANUP.md)
