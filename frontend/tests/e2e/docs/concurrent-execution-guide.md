# E2E测试并发执行问题分析与解决方案

> 文档版本: v1.0  
> 更新日期: 2026-03-13  
> 状态: 重要提示

---

## 问题概述

当前测试用例存在**强依赖关系**，如果直接并发执行会导致严重的测试失败和数据不一致问题。

## 依赖关系分析

### 核心依赖链

```
ENV-001 (环境初始化)
    ↓
TEST-001 (访问首页) ─────────────────────┐
    ↓                                     │
TEST-101 (登录)                          │
    ↓                                     │
    ├── TEST-102 (仪表盘)                 │
    ├── TEST-103 (直播配置) ←─────────────┤ TEST-002 (观看直播)
    ├── TEST-104 (战队列表)               │
    ├── TEST-105 (添加战队) ←─────────────┤ TEST-003/004 (浏览/查看战队)
    │   ↓                                 │
    │   ├── TEST-106 (编辑战队)           │
    │   └── TEST-107 (删除战队)           │
    │                                     │
    ├── TEST-108 (瑞士轮赛程) ←───────────┤ TEST-005 (查看瑞士轮)
    │   ↓                                 │
    │   └── TEST-110 (更新结果) ←─────────┤ TEST-007 (追踪状态)
    │       ↓                             │
    │       └── TEST-111 (晋级名单)       │
    │           ↓                         │
    │           └── TEST-112 (同步验证)   │
    │                                     │
    └── TEST-109 (淘汰赛赛程) ←───────────┘ TEST-006 (查看淘汰赛)
```

### 并发执行的问题场景

#### 场景1: 数据竞争
```typescript
// 测试A在删除战队
await teamsPage.deleteTeam('测试战队');

// 测试B同时在读取战队列表
const teams = await teamsPage.getAllTeams();
// 结果: 测试B可能读到不一致的数据
```

#### 场景2: 登录状态冲突
```typescript
// 测试A登录为admin
await loginPage.login(adminUser);

// 测试B同时尝试登录
await loginPage.login(adminUser);
// 结果: 可能导致token失效或会话冲突
```

#### 场景3: 数据库状态不一致
```typescript
// 测试A创建比赛
await schedulePage.addSwissMatch({...});

// 测试B同时读取比赛
const matches = await schedulePage.getMatches();
// 结果: 测试B可能读不到测试A刚创建的数据
```

---

## 解决方案

### 方案1: 串行执行（推荐用于当前项目）

修改 `playwright.config.ts`:

```typescript
export default defineConfig({
  // 禁用并行执行
  workers: 1,
  
  // 或者使用串行模式
  fullyParallel: false,
  
  // 测试文件按顺序执行
  testMatch: [
    '**/01-home.spec.ts',      // 第一阶段
    '**/02-admin-login.spec.ts', // 第二阶段-1
    '**/05-stream.spec.ts',    // 第二阶段-2
    '**/03-teams.spec.ts',     // 第二阶段-3/4
    '**/04-schedule.spec.ts',  // 第二阶段-5/6/7
    '**/06-advancement.spec.ts', // 第四阶段-1/2
    '**/07-edge-cases.spec.ts',  // 边界测试
  ],
});
```

### 方案2: 使用测试隔离（推荐用于CI/CD）

#### 2.1 数据库隔离

```typescript
// fixtures/test-isolation.ts
export async function createIsolatedContext() {
  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 为每个测试创建独立的数据库schema
  await db.execute(`CREATE SCHEMA IF NOT EXISTS ${testId}`);
  await db.execute(`SET search_path TO ${testId}`);
  
  return {
    testId,
    async cleanup() {
      await db.execute(`DROP SCHEMA IF EXISTS ${testId} CASCADE`);
    }
  };
}
```

#### 2.2 测试数据前缀隔离

```typescript
// fixtures/isolated-data.ts
export function createIsolatedData(testId: string) {
  return {
    team: {
      ...testTeam,
      name: `${testTeam.name}-${testId}`,
    },
    teamBeta: {
      ...testTeamBeta,
      name: `${testTeamBeta.name}-${testId}`,
    }
  };
}
```

### 方案3: 使用测试钩子确保顺序

```typescript
// playwright.config.ts
export default defineConfig({
  // 配置测试项目，按依赖顺序执行
  projects: [
    {
      name: 'setup',
      testMatch: '**/setup/*.spec.ts',
    },
    {
      name: 'phase1-home',
      testMatch: '**/01-home.spec.ts',
      dependencies: ['setup'],
    },
    {
      name: 'phase2-admin',
      testMatch: ['**/02-admin-login.spec.ts', '**/05-stream.spec.ts'],
      dependencies: ['phase1-home'],
    },
    {
      name: 'phase3-teams',
      testMatch: '**/03-teams.spec.ts',
      dependencies: ['phase2-admin'],
    },
    {
      name: 'phase4-schedule',
      testMatch: '**/04-schedule.spec.ts',
      dependencies: ['phase3-teams'],
    },
    {
      name: 'phase5-advancement',
      testMatch: '**/06-advancement.spec.ts',
      dependencies: ['phase4-schedule'],
    },
    {
      name: 'phase6-edge',
      testMatch: '**/07-edge-cases.spec.ts',
      dependencies: ['phase5-advancement'],
    },
  ],
});
```

### 方案4: 使用全局setup/teardown

```typescript
// global-setup.ts
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // 1. 启动服务
  // 2. 初始化测试数据库
  // 3. 创建基础测试数据
  
  console.log('🚀 全局测试环境准备完成');
}

export default globalSetup;
```

```typescript
// global-teardown.ts
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // 1. 清理测试数据
  // 2. 关闭服务
  // 3. 生成测试报告
  
  console.log('🧹 全局测试环境清理完成');
}

export default globalTeardown;
```

---

## 推荐的执行策略

### 开发环境

```bash
# 串行执行所有测试
npx playwright test --workers=1

# 或者按阶段执行
npx playwright test 01-home.spec.ts --workers=1
npx playwright test 02-admin-login.spec.ts --workers=1
npx playwright test 03-teams.spec.ts --workers=1
# ...
```

### CI/CD环境

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E Tests (Serial)
        run: npx playwright test --workers=1
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 测试执行顺序脚本

创建 `scripts/run-e2e.sh`:

```bash
#!/bin/bash

set -e

echo "🧪 开始执行E2E测试（串行模式）"

# 第一阶段：环境准备与基础验证
echo "📋 第一阶段：环境准备与基础验证"
npx playwright test 01-home.spec.ts --workers=1

# 第二阶段：管理员数据准备
echo "📋 第二阶段：管理员数据准备"
npx playwright test 02-admin-login.spec.ts --workers=1
npx playwright test 05-stream.spec.ts --workers=1
npx playwright test 03-teams.spec.ts --workers=1
npx playwright test 04-schedule.spec.ts --workers=1

# 第三阶段：游客功能验证（已在第一阶段验证）
echo "📋 第三阶段：游客功能验证（已包含在第一阶段）"

# 第四阶段：高级管理功能
echo "📋 第四阶段：高级管理功能"
npx playwright test 06-advancement.spec.ts --workers=1

# 第五阶段：边界和异常测试
echo "📋 第五阶段：边界和异常测试"
npx playwright test 07-edge-cases.spec.ts --workers=1

echo "✅ 所有E2E测试执行完成"
```

---

## 快速修复方案

如果你需要**立即**解决并发问题，请修改 `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // ⚠️ 关键：禁用并行执行
  workers: 1,
  fullyParallel: false,
  
  // 测试文件按依赖顺序排列
  testMatch: [
    '**/01-home.spec.ts',
    '**/02-admin-login.spec.ts',
    '**/05-stream.spec.ts',
    '**/03-teams.spec.ts',
    '**/04-schedule.spec.ts',
    '**/06-advancement.spec.ts',
    '**/07-edge-cases.spec.ts',
  ],
  
  // 其他配置...
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

---

## 验证并发安全的检查清单

- [ ] 测试数据使用唯一标识（时间戳/UUID）
- [ ] 测试完成后清理创建的数据
- [ ] 避免多个测试同时操作同一资源
- [ ] 使用数据库事务隔离
- [ ] 测试之间不共享登录状态
- [ ] 每个测试独立初始化数据

---

**结论**: 在当前强依赖的测试架构下，**必须使用串行执行**。如果要支持并发，需要重构测试架构，引入数据隔离机制。
