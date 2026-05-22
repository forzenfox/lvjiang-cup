# 多赛季静态网站部署方案 - 技术设计方案

## 1. 文档概述

### 1.1 文档目的

本文档基于运营需求（S2 赛季结束后，将赛事数据以静态网站形式部署，节省服务器成本），提供基于 Cloudflare Pages 的多赛季静态网站架构设计方案。

### 1.2 适用范围

- **开发工程师**：赛季独立站点的分支管理、构建配置、部署流水线
- **运维工程师**：Cloudflare Pages 项目配置、GitHub Actions 工作流维护
- **产品/运营**：理解多赛季静态网站的访问方式和发布流程

### 1.3 术语定义

| 术语 | 说明 |
|------|------|
| Cloudflare Pages | Cloudflare 提供的静态网站托管平台，支持 Git 集成、无限免费带宽 |
| Season Branch | 每个赛季独立的 Git 分支，包含该赛季的完整静态站点源码 |
| SPA Fallback | 单页应用路由回退机制，确保前端路由在刷新时正确返回 `index.html` |
| Assets Subpath | 静态资源部署的路径前缀，如 `/s1/assets/` |

---

## 2. 架构总览

### 2.1 核心设计原则

1. **赛季间解耦**：每个赛季的源码、构建流程、技术栈完全独立
2. **统一入口**：用户通过 `https://lvjiang-cup.pages.dev/s1`、`/s2` 等统一路径访问不同赛季
3. **零服务器成本**：完全基于 Cloudflare Pages 免费层，无后端服务
4. **按需构建**：S2 完成后立刻部署，S3 赛季随时可扩展

### 2.2 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                                                             │
│  main (production)         release/s1             release/s2 │
│  ├── index.html (导航页)   ├── React SPA          ├── 任意框架 │
│  ├── _redirects            ├── vite.config.ts     ├── 构建配置 │
│  ├── .github/workflows/    ├── 静态数据           ├── S2 数据  │
│  └── ...                   └── ...                └── ...      │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ git push
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions (build-and-deploy)               │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────────┐    │
│  │ Build S1 │   │ Build S2 │   │ Assemble & Deploy    │    │
│  │ npm ci   │   │ npm ci   │   │ - Merge outputs      │    │
│  │ npm run  │   │ npm run  │   │ - Create index.html  │    │
│  │ build    │   │ build    │   │ - Generate _redirects │    │
│  └────┬─────┘   └────┬─────┘   └──────────┬───────────┘    │
│       └──────────────┴────────────────────┘                 │
│                                     │                       │
└─────────────────────────────────────┼───────────────────────┘
                                      │ wrangler pages deploy
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Cloudflare Pages (lvjiang-cup)               │
│                                                             │
│  https://lvjiang-cup.pages.dev/                             │
│       ├── index.html        → 赛季导航页                    │
│       ├── s1/               → S1 赛季静态站                 │
│       │   ├── index.html    → SPA 入口                      │
│       │   └── assets/...    → 资源文件                       │
│       ├── s2/               → S2 赛季静态站                 │
│       │   ├── index.html    → SPA 入口                      │
│       │   └── assets/...    → 资源文件                       │
│       └── _redirects        → SPA fallback 规则              │
│                                                             │
│  CDN: 330+ 全球节点，无限带宽                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 分支策略

### 3.1 分支结构

| 分支名 | 用途 | 触发部署 |
|--------|------|----------|
| `main` | 赛季导航页 + 部署工作流 | ✅ 推送自动部署到生产环境 |
| `release/s1` | S1 赛季静态站点源码（基于 `release/demo` 创建） | ❌ 由 main 分支 CI 拉取构建 |
| `release/s2` | S2 赛季静态站点源码（基于 `master` 创建） | ❌ 同上 |
| `release/s3` | （未来）S3 赛季 | ❌ 同上 |

所有 `release/*` 分支不直接触发部署，而是由 `main` 分支的 CI 工作流在构建阶段拉取这些分支的代码。

### 3.2 分支独立性规则

每个 `release/*` 分支是**完全独立的项目**：

```
release/s1/
├── package.json        # S1 独有的依赖（React + Vite）
├── vite.config.ts      # base: '/s1/'  （关键！构建产物输出到 s1 子目录）
├── index.html
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── ...             # S1 的前端代码
├── public/
│   └── config.js       # 运行时配置（如数据源）
└── ...

release/s2/
├── package.json        # S2 可以完全不同（Vue、Astro、纯 HTML 均可）
├── vite.config.ts      # base: '/s2/'
├── src/
│   └── ...
└── ...
```

关键约束：**每个赛季分支的构建配置中 `base` 路径必须设置为 `/sN/`**，确保构建产物的资源引用路径正确。

---

## 4. Cloudflare Pages 配置

### 4.1 项目创建

在 Cloudflare Dashboard 中创建 Pages 项目：

| 配置项 | 值 |
|--------|-----|
| 项目名称 | `lvjiang-cup` |
| 生产分支 | `main` |
| 构建命令 | 由 GitHub Actions 完成，Pages 配置为 **跳过自动构建** |
| 框架预设 | 无（手动配置） |

### 4.2 路由规则（_redirects）

在 `main` 分支的根目录创建 `_redirects` 文件，实现 SPA fallback：

```
# SPA fallback - 每个赛季子路径下的任意路由都导向对应 index.html
/s1/*   /s1/index.html   200
/s2/*   /s2/index.html   200

# 根路径
/       /index.html      200
```

> `_redirects` 文件是 Cloudflare Pages 的路由配置文件，`200` 表示内部 rewrite（不改变浏览器地址栏 URL），实现 SPA 前端路由的刷新支持。

### 4.3 缓存策略（_headers）

在 `main` 分支的根目录创建 `_headers` 文件：

```
# 静态资源长缓存
/s1/assets/*
  Cache-Control: public, max-age=31536000, immutable

/s2/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML 文件不缓存（确保内容更新后立即生效）
/s1/index.html
  Cache-Control: public, max-age=0, must-revalidate

/s2/index.html
  Cache-Control: public, max-age=0, must-revalidate

/index.html
  Cache-Control: public, max-age=0, must-revalidate
```

---

## 5. 构建与部署流水线

### 5.1 GitHub Actions 工作流

在 `main` 分支创建 `.github/workflows/deploy-all-seasons.yml`：

```yaml
name: Deploy All Seasons to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      deploy_s1:
        description: '部署 S1'
        type: boolean
        default: true
      deploy_s2:
        description: '部署 S2'
        type: boolean
        default: true

jobs:
  # ── Job 1: 构建 S1 ──
  build-s1:
    if: ${{ github.event_name == 'push' || inputs.deploy_s1 }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: release/s1
          path: release-s1
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: release-s1/package-lock.json
      - run: |
          cd release-s1
          npm ci
          npm run build
      - run: mkdir -p dist/s1 && cp -r release-s1/dist/* dist/s1/
      - uses: actions/upload-pages-artifact@v3
        with:
          name: season-s1
          path: dist/s1

  # ── Job 2: 构建 S2 ──
  build-s2:
    if: ${{ github.event_name == 'push' || inputs.deploy_s2 }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: release/s2
          path: release-s2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: release-s2/package-lock.json
      - run: |
          cd release-s2
          npm ci
          npm run build
      - run: mkdir -p dist/s2 && cp -r release-s2/dist/* dist/s2/
      - uses: actions/upload-pages-artifact@v3
        with:
          name: season-s2
          path: dist/s2

  # ── Job 3: 汇总并部署 ──
  assemble-and-deploy:
    needs: [build-s1, build-s2]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout main (for _redirects, _headers, and index.html)
        uses: actions/checkout@v4
        with:
          ref: main

      - name: Download S1 build
        uses: actions/download-artifact@v4
        with:
          name: season-s1
          path: dist/s1

      - name: Download S2 build
        uses: actions/download-artifact@v4
        with:
          name: season-s2
          path: dist/s2

      - name: Copy _redirects and _headers
        run: |
          cp _redirects dist/
          cp _headers dist/

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=lvjiang-cup
```

### 5.2 关键说明

| 要素 | 说明 |
|------|------|
| 并行构建 | `build-s1` 和 `build-s2` 独立并行运行，互不阻塞 |
| 增量部署 | Cloudflare Pages 只上传变更文件，部署速度快 |
| 回滚 | Cloudflare Dashboard 支持一键回滚到任意历史版本 |
| 环境变量 | `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 配置在 GitHub Secrets 中 |

### 5.3 赛季扩展

当新增 S3 赛季时，只需：

1. 创建 `release/s3` 分支（独立项目，自由选技术栈）
2. 在 `main` 分支更新 `_redirects` 文件，添加 `/s3/*` 规则
3. 在 `deploy-all-seasons.yml` 中添加 `build-s3` job
4. 在 `assemble-and-deploy` 的 `needs` 中添加 `build-s3`

---

## 6. 赛季导航页

### 6.1 功能

`main` 分支根目录的 `index.html` 是一个轻量级的赛季导航页，功能包括：

- 赛季列表展示（S1、S2、……）
- 各赛季的简要介绍（赛季主题、时间、冠军队等）
- 页面间跳转链接

### 6.2 示例结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>驴酱杯 - 赛事中心</title>
  <style>
    /* 极简样式，仅用于导航 */
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🏆 驴酱杯</h1>
      <p>选择赛季查看赛事详情</p>
    </header>
    <div class="seasons">
      <a href="/s1" class="season-card">
        <h2>S1 赛季</h2>
        <p>首届驴酱杯</p>
      </a>
      <a href="/s2" class="season-card">
        <h2>S2 赛季</h2>
        <p>第二届驴酱杯</p>
      </a>
    </div>
  </div>
</body>
</html>
```

---

## 7. S1 赛季迁移计划

### 7.1 从 `release/demo` 迁移到 `release/s1`

需要做以下变更：

#### 7.1.1 创建 `release/s1` 分支

```bash
# 基于 release/demo 分支创建 S1 赛季分支
git checkout -b release/s1 origin/release/demo

# 添加 base 路径配置
# 修改 vite.config.ts，添加 base: '/s1/'
```

#### 7.1.2 Vite 配置变更

```typescript
// vite.config.ts - release/s1 分支
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/s1/',                              // ← 新增：部署子路径
  build: {
    sourcemap: 'hidden',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animation: ['framer-motion'],
          chart: ['echarts'],
          ui: ['lucide-react', '@radix-ui/react-tabs', 'sonner'],
        },
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
})
```

#### 7.1.3 数据静态化

S1 的当前前端代码依赖于后端 API。需要将运行时数据预获取并转为静态数据：

| 数据源 | 处理方式 |
|--------|----------|
| 战队信息 | 从后端数据库导出为 JSON，放入 `src/data/s1-teams.json` |
| 赛程数据 | 从后端导出为 JSON，放入 `src/data/s1-schedule.json` |
| 对战数据 | 从 Excel 导出为 JSON |
| 主播信息 | 导出为静态 JSON |
| 视频列表 | 导出为静态 JSON |

前端 API 调用层改为直接导入静态 JSON 数据，移除 `async/await` 和 loading 状态。

---

## 8. S2 赛季创建指引

### 8.1 分支创建

```bash
# 基于 master 分支创建 S2 赛季分支
git checkout -b release/s2 master
```

### 8.2 数据提取

S2 赛季的数据导出流程：

1. 从当前 `master` 分支启动后端服务
2. 通过后端 API 或数据库工具导出 S2 数据为 JSON 文件
3. 将 JSON 文件作为静态数据放入 `release/s2` 分支

### 8.3 架构选择

S2 赛季可以选择任意技术栈，不受 S1 限制：

| 推荐选型 | 适用场景 |
|----------|----------|
| React + Vite（沿用 S1） | S2 页面结构类似 S1，可复用组件 |
| Astro | 更轻量的静态站点，天然零 JS |
| 纯 HTML + CSS | 页面结构简单时 |
| Vue + Vite | 团队偏好 Vue |

### 8.4 Vite 配置（如使用）

```typescript
// vite.config.ts - release/s2 分支
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/s2/',
  // ... 其余配置与 S1 可以完全不同
})
```

### 8.5 数据流对比

```
S1（后端依赖）
  React App → fetch(/api/teams) → 后端 NestJS → SQLite

S1/S2（静态化后）
  React App → import('./data/teams.json') → 直接渲染
```

---

## 9. 本地开发指南

### 9.1 开发单个赛季

```bash
# 切换到赛季分支
git checkout release/s2

# 安装依赖
cd frontend
npm install

# 本地开发（base 路径不影响本地开发）
npm run dev

# 本地预览生产构建
npm run build
npx serve dist  # 访问 http://localhost:3000/s2/
```

### 9.2 全量预览

如需在本地模拟最终部署效果：

```bash
# 构建所有赛季
git checkout main
# 手动依次构建各赛季到 dist/s1/, dist/s2/
# 然后本地预览
npx serve dist
```

---

## 10. 部署操作手册

### 10.1 初始部署

| 步骤 | 操作 | 负责人 |
|------|------|--------|
| 1 | 在 Cloudflare Dashboard 创建 Pages 项目 `lvjiang-cup` | 运维 |
| 2 | 生成 Cloudflare API Token（权限：Pages: Write） | 运维 |
| 3 | 将 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 配置到 GitHub Secrets | 运维 |
| 4 | 创建 `release/s1` 分支，配置好 `base: '/s1/'` | 开发 |
| 5 | 创建 `release/s2` 分支，配置好 `base: '/s2/'` | 开发 |
| 6 | 在 `main` 分支创建 `_redirects`、`_headers` 和 `index.html` | 开发 |
| 7 | 推送 `main` 分支，触发 CI 自动部署 | - |

### 10.2 日常更新（S2 内容变更）

```bash
git checkout release/s2
# 修改代码/数据
git add .
git commit -m "feat: 更新 S2 赛程数据"
git push origin release/s2

# 然后切换到 main 分支，手动触发 workflow_dispatch 部署
```

### 10.3 回滚

Cloudflare Dashboard → Pages → lvjiang-cup → 部署记录 → 选择版本 → 回滚

---

## 11. 安全与性能

### 11.1 安全

- Cloudflare Pages 默认提供 DDoS 防护（免费）
- 纯静态站点无后端攻击面（无 SQL 注入、无命令执行）
- 资源路径基于赛季隔离，S1 和 S2 的资源不会互相影响

### 11.2 性能

| 指标 | 预期值 |
|------|--------|
| 全球 TTFB | < 100ms（Cloudflare CDN 边缘节点） |
| 带宽 | 无限免费 |
| 并发 | 无上限 |
| 构建时间 | ~2-3 分钟（所有赛季并行构建） |

---

## 12. 风险与注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `base` 路径配置错误 | 资源 404 | 构建后本地预览确认；CI 中增加验证步骤 |
| `release/s1` 数据未静态化 | 页面 API 无法获取数据 | 迁移时逐一检查 API 调用，替换为静态 JSON |
| CI Token 过期 | 部署失败 | 定期检查 Token 有效期，设置告警 |
| 忘记更新 `_redirects` | SPA 刷新 404 | 部署清单中纳入 `_redirects` 检查 |

---

## 13. 附录

### 13.1 Cloudflare API Token 配置

在 GitHub 仓库设置中添加以下 Secrets：

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret 名称 | 值 | 获取方式 |
|-------------|-----|----------|
| `CLOUDFLARE_API_TOKEN` | API 令牌 | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | 账户 ID | Cloudflare Dashboard 右侧 |

API Token 权限配置：
- 权限：`Cloudflare Pages → Edit`
- 资源：`Include → All accounts`

### 13.2 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [_redirects 语法参考](https://developers.cloudflare.com/pages/configuration/redirects/)
- [_headers 语法参考](https://developers.cloudflare.com/pages/configuration/headers/)