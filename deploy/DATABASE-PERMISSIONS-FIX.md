# 数据库权限问题 - 完整分析与修复指南

## 📋 问题概述

**报错信息**：
```
[Error: SQLITE_CANTOPEN: unable to open database file] {
  errno: 14,
  code: 'SQLITE_CANTOPEN'
}
```

**问题现象**：
- 后端容器无法启动
- 数据库初始化失败
- API 服务不可用

---

## 🔍 根因分析

### 1. 目录结构问题

从你的截图可以看到：
```bash
root@VM-0-11-ubuntu:/opt/lvjiang-cup# ls -l data/
total 32
drwxr-xr-x 2 root root 4096 Apr 20 17:29 ./
drwxr-xr-x 6 root root 4096 Apr 20 16:43 ../
-rw-r--r-- 1 lighthouse lighthouse 24018 Apr 20 12:17 lol-champion-map.json
```

**问题分析**：
- ✅ `data/` 目录存在
- ❌ 目录是**空的**，没有 `lvjiang.db` 文件
- ❌ 目录所有者是 `root:root`，而不是 `1001:1001`

### 2. 权限问题详解

#### Docker 容器内的用户

后端容器使用 `nodejs` 用户运行，其 UID 为 **1001**：

```dockerfile
# 后端 Dockerfile 示例
FROM node:20-alpine

# 创建 nodejs 用户
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -s /bin/sh -D nodejs

USER nodejs
```

#### 权限不匹配

| 组件 | UID/GID | 说明 |
|------|---------|------|
| 宿主机目录所有者 | 0:0 (root) | ❌ 错误 |
| 容器内用户 | 1001:1001 (nodejs) | ✅ 正确 |
| 结果 | 无法访问 | ❌ 权限拒绝 |

**为什么无法创建数据库文件？**

1. 容器启动时尝试打开 `/app/data/lvjiang.db`
2. SQLite 需要创建或写入数据库文件
3. 但宿主机的 `data/` 目录所有者是 `root`
4. 容器内的 `nodejs` 用户（UID 1001）没有写入权限
5. SQLite 报错：`SQLITE_CANTOPEN: unable to open database file`

---

## 🛠️ 修复方案

### 方案一：快速修复脚本（推荐）⭐

**最简单的方式**：

```bash
# 在服务器上执行
curl -fsSL https://raw.githubusercontent.com/forzenfox/lvjiang-cup/main/deploy/quick-fix-db.sh | sudo bash
```

**或者使用本地脚本**：

```bash
cd /opt/lvjiang-cup/deploy
chmod +x quick-fix-db.sh
./quick-fix-db.sh
```

**脚本做了什么**：
1. ✅ 创建必要的目录（data, backup, uploads）
2. ✅ 设置正确的权限（1001:1001）
3. ✅ 重启后端容器
4. ✅ 自动验证服务是否正常

---

### 方案二：手动修复

#### 步骤 1：检查当前状态

```bash
# 检查目录是否存在
ls -la /opt/lvjiang-cup/data/

# 检查权限
ls -ld /opt/lvjiang-cup/data/
# 如果显示 root:root，则需要修复

# 检查数据库文件
ls -l /opt/lvjiang-cup/data/lvjiang.db
# 如果不存在，容器会自动创建
```

#### 步骤 2：设置权限

```bash
# 设置 data 目录权限
chown -R 1001:1001 /opt/lvjiang-cup/data
chmod -R 755 /opt/lvjiang-cup/data

# 设置 backup 目录权限
chown -R 1001:1001 /opt/lvjiang-cup/backup

# 设置 uploads 目录权限
chown -R 1001:1001 /opt/lvjiang-cup/uploads
```

#### 步骤 3：重启容器

```bash
cd /opt/lvjiang-cup/deploy
docker-compose restart backend
```

#### 步骤 4：验证

```bash
# 查看容器日志
docker-compose logs -f backend

# 检查数据库表
docker exec lvjiang-backend sqlite3 /app/data/lvjiang.db '.tables'

# 测试 API
docker exec lvjiang-backend wget -q -O - http://127.0.0.1:3000/api/teams
```

---

### 方案三：完整初始化（全新部署）

适用于第一次部署或需要重置数据库的场景：

```bash
cd /opt/lvjiang-cup/deploy
chmod +x init-database.sh
./init-database.sh
```

**脚本功能**：
1. 创建所有必要目录
2. 设置正确的权限
3. 停止运行中的容器
4. 创建并初始化数据库文件
5. 重启容器并验证

---

## 📊 权限对比表

### 修复前 ❌

```bash
$ ls -ld /opt/lvjiang-cup/data/
drwxr-xr-x 2 root root 4096 Apr 20 17:29 /opt/lvjiang-cup/data/

$ ls -l /opt/lvjiang-cup/data/
total 32
drwxr-xr-x 2 root root 4096 Apr 20 17:29 ./
drwxr-xr-x 6 root root 4096 Apr 20 16:43 ../
-rw-r--r-- 1 lighthouse lighthouse 24018 Apr 20 12:17 lol-champion-map.json
# ❌ 没有 lvjiang.db 文件
# ❌ 所有者是 root:root
```

### 修复后 ✅

```bash
$ ls -ld /opt/lvjiang-cup/data/
drwxr-xr-x 3 1001 1001 4096 Apr 20 18:30 /opt/lvjiang-cup/data/

$ ls -l /opt/lvjiang-cup/data/
total 128
drwxr-xr-x 2 1001 1001   4096 Apr 20 18:30 ./
drwxr-xr-x 6 1001 1001   4096 Apr 20 18:30 ../
-rw-r--r-- 1 1001 1001 122880 Apr 20 18:30 lvjiang.db
# ✅ 数据库文件已创建
# ✅ 所有者是 1001:1001
```

---

## 🔧 技术细节

### 为什么是 UID 1001？

在 Alpine Linux（容器基础镜像）中：

```dockerfile
# 创建用户组
addgroup -g 1001 nodejs

# 创建用户
adduser -u 1001 -G nodejs -s /bin/sh -D nodejs
```

- UID 1000 通常保留给 `root` 或其他系统用户
- UID 1001 是第一个普通用户的 ID
- 这是 Docker 容器的最佳实践（非 root 用户运行）

### Docker Volume 挂载原理

```yaml
volumes:
  - ../data:/app/data
```

这会将宿主机的 `../data` 目录挂载到容器的 `/app/data`。

**重要**：
- 文件权限在宿主机和容器之间**共享**
- 如果宿主机目录是 `root:root`，容器内也是 `root:root`
- 容器内的 `nodejs` 用户（UID 1001）无法写入 `root` 拥有的目录

---

## ✅ 验证清单

修复完成后，请检查以下项目：

- [ ] `data/` 目录所有者是 `1001:1001`
- [ ] `data/lvjiang.db` 文件存在
- [ ] 后端容器正常运行
- [ ] API 健康检查通过
- [ ] 数据库表已创建
- [ ] 可以正常访问 API

**验证命令**：

```bash
# 1. 检查权限
ls -ld /opt/lvjiang-cup/data/
# 应该显示：drwxr-xr-x 3 1001 1001 ...

# 2. 检查数据库文件
ls -l /opt/lvjiang-cup/data/lvjiang.db
# 应该显示：-rw-r--r-- 1 1001 1001 ...

# 3. 检查容器状态
docker-compose ps backend
# 应该显示：Up (healthy)

# 4. 检查数据库表
docker exec lvjiang-backend sqlite3 /app/data/lvjiang.db '.tables'
# 应该显示：teams, team_members, matches, ...

# 5. 测试 API
curl http://localhost:3000/api/teams
# 应该返回：{"data":[],"meta":{...}}
```

---

## 🛡️ 预防措施

### 1. 使用部署脚本

始终使用 `setup.sh` 进行部署，它会自动设置正确的权限：

```bash
./setup.sh
```

### 2. 避免手动操作

不要手动用 root 用户创建数据目录：

```bash
# ❌ 错误做法
sudo mkdir /opt/lvjiang-cup/data
sudo chown root:root /opt/lvjiang-cup/data

# ✅ 正确做法
./setup.sh  # 脚本会自动处理权限
```

### 3. 定期检查

添加定期检查任务：

```bash
# 检查权限
ls -ld /opt/lvjiang-cup/data/ | grep "1001 1001"

# 检查数据库文件
ls -l /opt/lvjiang-cup/data/lvjiang.db
```

---

## 📚 相关文档

- [部署文档](README.md) - 完整的部署指南
- [快速修复脚本](quick-fix-db.sh) - 一键修复
- [初始化脚本](init-database.sh) - 完整初始化
- [权限修复脚本](fix-database-permissions.sh) - 仅修复权限

---

## 🆘 常见问题

### Q1: 为什么修复后还是无法启动？

**A**: 可能是数据库文件已损坏，尝试：

```bash
# 备份旧数据库
mv /opt/lvjiang-cup/data/lvjiang.db /opt/lvjiang-cup/data/lvjiang.db.bak

# 重新初始化
./init-database.sh
```

### Q2: 权限设置后多久生效？

**A**: 立即生效，但需要重启容器：

```bash
docker-compose restart backend
```

### Q3: 会影响已有数据吗？

**A**: 
- 仅修复权限：不会影响数据
- 完整初始化：会创建新数据库，但不会删除旧文件（会询问是否删除）

### Q4: 为什么不用 root 用户运行容器？

**A**: 
- 安全最佳实践
- 防止容器逃逸攻击
- 最小权限原则

---

**文档版本**: v1.0  
**更新日期**: 2026-04-20  
**适用版本**: 所有使用 SQLite 的后端版本
