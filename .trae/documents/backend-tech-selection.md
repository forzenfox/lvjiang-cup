# 驴酱杯赛事网站 - 后端技术选型文档

## 1. 项目概述

驴酱公会LOL娱乐赛事网站是一个单页面滚动式网站，为斗鱼驴酱公会的主播和水友提供赛事信息展示平台。

### 1.1 核心功能
- 英雄区域：赛事横幅、直播跳转
- 赛程区域：瑞士轮/淘汰赛赛程展示
- 战队区域：战队信息、队员信息卡片
- 管理后台：直播管理、战队管理、赛程管理

### 1.2 技术约束
- **AI主力开发，个人辅助**
- **服务器配置**：2C2G（2核2GB内存）
- **数据量**：极小（<1000条记录）
- **实时性**：要求不高，页面刷新或前端轮询即可

## 2. 技术选型

### 2.1 后端框架

| 方案 | 语言/框架 | 内存占用 | 推荐指数 |
|------|-----------|----------|----------|
| **Node.js + NestJS** | TypeScript | ~300MB | ⭐⭐⭐⭐⭐ |
| Go + Gin | Go | ~50MB | ⭐⭐⭐⭐ |
| Python + FastAPI | Python | ~400MB | ⭐⭐⭐⭐ |
| Java + Spring Boot | Java | ~1GB+ | ⭐⭐⭐ |

**推荐方案**：**Node.js + NestJS**

**推荐理由**：
- AI代码生成质量最高，生态成熟
- 与前端React技术栈统一（TypeScript）
- 事件驱动模型适合高并发读场景
- 开发效率高，前端开发者可快速上手
- 20K并发完全在能力范围内

### 2.2 数据库

| 方案 | 数据库 | 内存占用 | 推荐指数 |
|------|--------|----------|----------|
| **SQLite** | 嵌入式 | ~50MB | ⭐⭐⭐⭐⭐ |
| PostgreSQL | 关系型 | ~800MB | ⭐⭐ |
| MySQL | 关系型 | ~900MB | ⭐⭐ |
| MongoDB | 文档型 | ~600MB | ⭐⭐⭐ |

**推荐方案**：**SQLite**

**推荐理由**：
- 2C2G环境下资源占用极低
- 单文件存储，备份简单
- 读性能优秀，完全满足20K并发
- 写入频率低，无并发写入问题
- 适合数据量小的应用场景

### 2.3 缓存

| 方案 | 缓存 | 内存占用 | 推荐指数 |
|------|------|----------|----------|
| **node-cache** | 内存缓存 | ~50MB | ⭐⭐⭐⭐⭐ |
| Redis | 独立服务 | ~100MB | ⭐⭐⭐⭐ |

**推荐方案**：**node-cache**

**推荐理由**：
- 无需额外服务，减少复杂度
- 内存占用低，适合2C2G环境
- 60秒TTL配置，满足数据更新需求
- 与Node.js集成简单

### 2.4 部署

| 方案 | 工具 | 复杂度 | 推荐指数 |
|------|------|--------|----------|
| **Docker + PM2** | 容器化 | 低 | ⭐⭐⭐⭐⭐ |
| 裸机部署 | 直接运行 | 中 | ⭐⭐⭐⭐ |
| Kubernetes | 容器编排 | 高 | ⭐⭐⭐ |

**推荐方案**：**Docker + PM2**

**推荐理由**：
- 环境一致性，部署简单
- 资源隔离，管理方便
- PM2集群模式，充分利用2核CPU
- 自动重启，提高稳定性

## 3. 技术栈详细配置

| 技术 | 版本 | 用途 | 配置建议 |
|------|------|------|----------|
| Node.js | 20 LTS | 运行时 | --max-old-space-size=1536 |
| NestJS | 10.x | 后端框架 | 模块化架构 |
| SQLite | 3.x | 数据库 | WAL模式，内存映射 |
| better-sqlite3 | 9.x | SQLite驱动 | 同步操作，性能更好 |
| node-cache | 5.x | 内存缓存 | TTL=60秒 |
| PM2 | 5.x | 进程管理 | 2实例集群模式 |
| Docker | 20.x+ | 容器化 | Alpine镜像 |
| Nginx | 1.20+ | 反向代理 | 静态文件服务 |

## 4. 性能评估

### 4.1 20K并发场景

| 指标 | 预估值 | 说明 |
|------|--------|------|
| 单机QPS | ~15,000 | 纯API读取 |
| 内存占用 | ~420MB | 含应用、数据库、缓存 |
| 响应延迟 | P99 < 50ms | 99%请求在50ms内完成 |
| CPU使用率 | ~70% | 2核CPU充分利用 |

### 4.2 资源分配

| 组件 | 内存占用 | 占比 |
|------|----------|------|
| NestJS应用 | ~300MB | 71% |
| SQLite数据库 | ~50MB | 12% |
| node-cache | ~50MB | 12% |
| PM2 | ~20MB | 5% |
| **总计** | **~420MB** | **100%** |

## 5. 数据模型设计

### 5.1 核心实体

| 实体 | 字段 | 说明 |
|------|------|------|
| **Team** | id, name, logo, description | 战队信息 |
| **Player** | id, name, avatar, position, team_id | 队员信息 |
| **Match** | id, team_a_id, team_b_id, score_a, score_b, winner_id, round, status, start_time, stage, swiss_record, swiss_day | 比赛信息 |
| **StreamInfo** | id, title, url, is_live | 直播信息 |

### 5.2 SQLite表结构

```sql
-- teams表
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  description TEXT
);

-- players表
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  position TEXT,
  team_id TEXT,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- matches表
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  team_a_id TEXT,
  team_b_id TEXT,
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  winner_id TEXT,
  round TEXT,
  status TEXT,
  start_time TEXT,
  stage TEXT,
  swiss_record TEXT,
  swiss_day INTEGER
);

-- stream_info表
CREATE TABLE IF NOT EXISTS stream_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  url TEXT,
  is_live INTEGER DEFAULT 0
);
```

## 6. API设计

### 6.1 公开API

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/teams` | GET | 获取所有战队 |
| `/api/teams/:id` | GET | 获取单个战队详情 |
| `/api/matches` | GET | 获取所有比赛 |
| `/api/matches/:id` | GET | 获取单个比赛详情 |
| `/api/stream` | GET | 获取直播信息 |

### 6.2 管理API

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/admin/auth/login` | POST | 管理员登录 |
| `/api/admin/teams` | POST | 创建战队 |
| `/api/admin/teams/:id` | PUT | 更新战队 |
| `/api/admin/teams/:id` | DELETE | 删除战队 |
| `/api/admin/players` | POST | 创建队员 |
| `/api/admin/players/:id` | PUT | 更新队员 |
| `/api/admin/players/:id` | DELETE | 删除队员 |
| `/api/admin/matches` | POST | 创建比赛 |
| `/api/admin/matches/:id` | PUT | 更新比赛 |
| `/api/admin/matches/:id` | DELETE | 删除比赛 |
| `/api/admin/stream` | PUT | 更新直播信息 |

## 7. 安全考虑

### 7.1 认证授权
- JWT token认证
- 管理员路由权限控制
- 密码哈希存储

### 7.2 数据安全
- SQL注入防护（参数化查询）
- 输入验证
- 跨域请求处理

### 7.3 部署安全
- Docker容器隔离
- Nginx反向代理
- 环境变量管理

## 8. 风险评估

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 并发超过2万 | 低 | 高 | Nginx静态缓存 |
| SQLite文件损坏 | 极低 | 高 | 每日自动备份 |
| 内存不足 | 中 | 高 | PM2内存限制自动重启 |
| 单点故障 | 中 | 中 | 定期备份，快速重建 |

## 9. 成本估算

| 项目 | 费用 | 说明 |
|------|------|------|
| 阿里云轻量应用服务器 | ~50元/月 | 2C2G 5M带宽 |
| 域名 | ~60元/年 | .com/.cn |
| CDN（可选） | ~20元/月 | 静态资源加速 |
| 备份存储 | ~5元/月 | OSS存储备份 |
| **总计** | **~100元/月** | |

## 10. 结论

**推荐技术栈**：
- **后端**：Node.js + NestJS + SQLite + node-cache
- **部署**：Docker + PM2 + Nginx
- **服务器**：2C2G（阿里云轻量应用服务器）

**核心优势**：
1. **AI友好**：NestJS代码生成质量高，开发效率极高
2. **资源高效**：2C2G服务器完全满足需求
3. **成本极低**：月成本约100元
4. **运维简单**：SQLite单文件管理，Docker一键部署
5. **性能充足**：20K并发读取完全可行

**适合场景**：
- 中小型赛事网站
- 数据量小的应用
- 读多写少的场景
- 预算有限的项目

---

**文档版本**：v1.0  
**编写日期**：2026-03-10  
**评估人**：AI架构师
