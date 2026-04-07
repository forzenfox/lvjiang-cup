# 驴酱杯清理脚本使用说明

## 概述

清理脚本用于安全地清除驴酱杯前后端应用的容器、镜像和相关资源，同时可以选择性地保留 Nginx Proxy Manager (NPM) 配置。清理完成后，可以通过运行 `setup.sh` 脚本重新一键部署。

## 适用场景

- **服务器部署环境**：Linux 服务器（通过 `setup.sh` 部署后）
- **重新部署**：清理现有部署，为重新部署准备环境
- **版本更新**：清除旧版本，部署新版本
- **环境重置**：完全或部分重置部署环境

## 脚本文件

- **`cleanup.sh`**：服务器端清理脚本（Bash）
- **适用系统**：Linux/Unix（与 `setup.sh` 一致）

## 使用方法

### 基本用法

```bash
# 1. SSH 登录服务器
ssh user@your-server-ip

# 2. 切换到部署目录
cd /opt/lvjiang-cup/deploy

# 3. 添加执行权限（首次使用）
chmod +x cleanup.sh

# 4. 运行清理脚本（保留 NPM）
./cleanup.sh

# 5. 重新部署
./setup.sh
```

### 命令行选项

```bash
# 保留 NPM 配置（推荐）
./cleanup.sh

# 清理所有内容（包括 NPM 和数据）
./cleanup.sh --all
```

## 清理范围

### 默认清理（保留 NPM）- 推荐

✅ **会清理的内容：**
- 驴酱杯前后端容器（`lvjiang-backend`, `lvjiang-frontend`）
- 驴酱杯 Docker 镜像
- Docker Compose 服务配置

✅ **保留的内容：**
- Nginx Proxy Manager 容器和配置
- Docker 网络 `npm-network`（`setup.sh` 将复用）
- 数据目录（`/opt/lvjiang-cup/data`, `/opt/lvjiang-cup/backup`）
- 环境变量文件（`/opt/lvjiang-cup/deploy/.env`）

### 完全清理（使用 `--all`）

✅ **会清理的内容：**
- 所有内容（包括上述保留项）
- NPM 容器和镜像
- Docker 网络（如果没有其他容器使用）

⚠️ **注意：** 完全清理后，需要重新部署 NPM 才能再次使用。

## 交互式选项

脚本运行时会提示以下选项：

1. **清理范围选择**
   - 选项 1：仅清理驴酱杯应用（保留 NPM）- **推荐**
   - 选项 2：清理所有内容（包括 NPM）

2. **数据目录处理**（如果存在数据，仅 `--all` 模式）
   - 选择是否删除数据库和备份文件
   - 保留数据可在下次部署时恢复原有数据

3. **环境变量文件处理**（仅 `--all` 模式）
   - 选择是否删除 `.env` 文件
   - 保留文件可在下次部署时保留配置

4. **确认操作**
   - 最终确认是否继续执行清理

## 清理后的重新部署

清理完成后，可以直接运行部署脚本重新部署：

```bash
cd /opt/lvjiang-cup/deploy
./setup.sh [tag]  # tag 可选，默认为 latest
```

## 常见场景

### 场景 1：更新应用到最新版本

```bash
# 1. SSH 登录服务器
ssh user@your-server-ip

# 2. 清理当前部署（保留数据和 NPM）
cd /opt/lvjiang-cup/deploy
./cleanup.sh

# 3. 重新部署最新版本
./setup.sh latest
```

### 场景 2：完全重置环境

```bash
# 1. 完全清理（包括 NPM 和数据）
cd /opt/lvjiang-cup/deploy
./cleanup.sh --all
# 选择删除数据目录和 .env 文件

# 2. 重新部署 NPM
cd /opt/nginx-proxy-manager
docker-compose up -d

# 3. 重新部署驴酱杯应用
cd /opt/lvjiang-cup/deploy
./setup.sh
```

### 场景 3：保留数据重新部署（推荐）

```bash
# 1. 清理应用（保留数据）
cd /opt/lvjiang-cup/deploy
./cleanup.sh
# 选择保留数据目录和 .env 文件

# 2. 重新部署（使用现有数据）
./setup.sh
```

### 场景 4：快速测试部署

```bash
# 1. 首次部署
./setup.sh test-tag

# 2. 测试发现问题，清理
./cleanup.sh

# 3. 修复后重新部署
./setup.sh test-tag-fix
```

## 注意事项

⚠️ **重要提示：**

1. **数据备份**：清理前建议备份重要数据
   ```bash
   cp -r /opt/lvjiang-cup/data /opt/lvjiang-cup/data.backup
   ```

2. **容器状态**：确保没有重要进程正在运行

3. **权限问题**：确保有 Docker 操作权限
   ```bash
   # Linux: 添加用户到 docker 组
   sudo usermod -aG docker $USER
   ```

4. **执行权限**：首次使用需要添加执行权限
   ```bash
   chmod +x cleanup.sh
   ```

## 故障排除

### 问题 1：Docker 权限不足

**症状：** `Got permission denied while trying to connect to the Docker daemon socket`

**解决方案：**
```bash
# 添加用户到 docker 组
sudo usermod -aG docker $USER
# 重新登录或重启系统
```

### 问题 2：找不到部署目录

**症状：** `cd: /opt/lvjiang-cup/deploy: No such file or directory`

**解决方案：**
```bash
# 确认是否使用 setup.sh 部署过
# 检查部署目录是否存在
ls -la /opt/lvjiang-cup/

# 如果没有，先运行 setup.sh 部署
cd /opt/lvjiang-cup/deploy
# 如果目录不存在，说明还未部署
```

### 问题 3：容器无法删除

**症状：** `Error response from daemon: conflict, unable to delete image`

**解决方案：**
```bash
# 强制删除容器
docker rm -f lvjiang-backend lvjiang-frontend

# 强制删除镜像
docker rmi -f <image-id>
```

### 问题 4：cleanup.sh 无法执行

**症状：** `Permission denied`

**解决方案：**
```bash
# 添加执行权限
chmod +x cleanup.sh

# 或者使用 bash 执行
bash cleanup.sh
```

## 相关文件

- `cleanup.sh` - 清理脚本（本文件）
- `setup.sh` - 一键部署脚本
- `update.sh` - 更新脚本
- `docker-compose.yml` - Docker Compose 配置
- `.env.example` - 环境变量示例

## 完整工作流程

```bash
# 1. 首次部署
ssh user@server-ip
cd /opt/lvjiang-cup/deploy
./setup.sh

# 2. 测试运行
# 访问应用进行测试...

# 3. 发现问题，清理环境
./cleanup.sh

# 4. 修复后重新部署
./setup.sh

# 5. 验证部署
curl http://localhost:3000/api/teams
```

## 技术支持

如有问题，请查看：
- 项目文档：[README.md](../README.md)
- 快速开始：[QUICKSTART.md](QUICKSTART.md)
- 部署指南：[DEPLOY.md](DEPLOY.md)
- GitHub Issues: https://github.com/forzenfox/lvjiang-cup/issues
