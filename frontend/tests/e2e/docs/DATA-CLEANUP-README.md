# E2E 测试数据清理 - 完整使用指南

## 📋 概述

本配置会在 E2E 测试执行前后自动清理测试数据，包括：
- ✅ **后端数据库数据**（通过调用 API）
- ✅ **前端存储数据**（localStorage、sessionStorage、Cookie、IndexedDB）

## 🚀 快速开始

### 1. 配置环境变量（可选）

复制环境变量配置文件：

```bash
cd frontend/tests/e2e
copy .env.example .env
```

修改 `.env` 文件中的配置：

```bash
# 后端服务地址
BACKEND_URL=http://localhost:3000

# 管理员账号（用于调用清空数据 API）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 2. 运行测试

直接运行测试即可，清理会自动执行：

```bash
npm run test:e2e
```

## 📊 清理流程

### 测试开始前（global-setup）

```
1. 调用后端 API 清空数据库
   └─ POST /api/admin/auth/login (获取 token)
   └─ DELETE /api/admin/data (清空数据)

2. 清理前端存储
   └─ localStorage (测试数据、缓存)
   └─ sessionStorage (会话数据)
   └─ Cookie (认证信息)
   └─ IndexedDB (数据库)
```

### 测试结束后（global-teardown）

```
1. 调用后端 API 清空数据库
   └─ POST /api/admin/auth/login (获取 token)
   └─ DELETE /api/admin/data (清空数据)

2. 清理前端存储
   └─ localStorage (测试数据、缓存)
   └─ sessionStorage (会话数据)
   └─ Cookie (认证信息)
   └─ IndexedDB (数据库)
```

## 🔍 日志输出示例

### 正常情况（后端服务已启动）

```
🚀 开始全局设置...
开始清空后端数据库数据...
✅ 登录成功，获取到 token
✅ 后端数据库数据已清空
响应：{ message: "All data cleared successfully" }
✅ 全局设置完成

Running 57 tests using 1 worker
  ✓ 55 passed (3.0m)
  2 skipped

🧹 开始全局清理...
开始清空后端数据库数据...
✅ 登录成功，获取到 token
✅ 后端数据库数据已清空
响应：{ message: "All data cleared successfully" }
✅ Cookie 清理完成
✅ 全局清理完成
```

### 后端服务未启动

```
🚀 开始全局设置...
开始清空后端数据库数据...
⚠️ 后端服务未启动，跳过数据库清理
✅ 全局设置完成

Running 57 tests using 1 worker
  ✓ 55 passed (3.0m)
  2 skipped

🧹 开始全局清理...
开始清空后端数据库数据...
⚠️ 后端服务未启动，跳过数据库清理
✅ Cookie 清理完成
✅ 全局清理完成
```

### API 不存在

```
🚀 开始全局设置...
开始清空后端数据库数据...
✅ 登录成功，获取到 token
⚠️ 清空数据 API 不存在 (/api/admin/data)，跳过后端数据清理
✅ 全局设置完成
```

## 📁 相关文件

### 核心文件

| 文件 | 说明 |
|------|------|
| `tests/e2e/utils/global-setup.ts` | 全局设置，测试前执行 |
| `tests/e2e/utils/global-teardown.ts` | 全局清理，测试后执行 |
| `tests/e2e/utils/test-data-cleaner.ts` | 数据清理工具类 |
| `tests/e2e/.env.example` | 环境变量配置示例 |

### 文档文件

| 文件 | 说明 |
|------|------|
| `tests/e2e/docs/DATA-CLEANUP-SUMMARY.md` | 配置总结 |
| `tests/e2e/docs/data-cleanup-guide.md` | 详细使用指南 |
| `tests/e2e/docs/DATA-CLEANUP-README.md` | 本文档 |

## 🔧 高级用法

### 在单个测试中手动清理

```typescript
import { cleanTestData } from '../utils/test-data-cleaner';

test('TEST-XXX: 测试用例', async ({ page }) => {
  // 测试逻辑...
  
  // 清理测试数据
  await cleanTestData(page);
});
```

### 在每个测试后自动清理

```typescript
import { cleanTestData } from '../utils/test-data-cleaner';

test.describe('测试套件', () => {
  test.afterEach(async ({ page }) => {
    // 每个测试结束后清理
    await cleanTestData(page);
  });
  
  test('测试用例 1', async ({ page }) => {
    // 测试逻辑...
  });
});
```

### 只清理特定数据

```typescript
import { TestDataCleaner } from '../utils/test-data-cleaner';

test('测试用例', async ({ page }) => {
  const cleaner = new TestDataCleaner(page);
  
  // 只清理认证信息
  await cleaner.cleanSpecificKeys(['token', 'user']);
  
  // 或只清理缓存
  await cleaner.cleanCacheByTag('teams');
});
```

## ⚠️ 注意事项

### 1. 后端服务依赖

- **有后端服务**: 会调用 API 清空数据库
- **无后端服务**: 跳过数据库清理，只清理前端数据
- **API 不存在**: 跳过数据库清理，不影响测试

### 2. 错误处理

清理失败不会影响测试结果，只会记录错误日志：

```typescript
try {
  await clearBackendData();
} catch (error) {
  console.error('清理失败:', error);
  // 不抛出错误，继续执行测试
}
```

### 3. 超时配置

默认超时时间为 10 秒，可以在 `.env` 中修改：

```bash
CLEANUP_TIMEOUT=10000
```

### 4. 安全考虑

- 使用环境变量存储敏感信息
- 不要将 `.env` 文件提交到版本控制
- 默认使用测试账号，不要使用生产环境账号

## 🔍 故障排除

### 问题：清理后数据库仍有数据

**可能原因**:
1. 后端服务未启动
2. API 路径不正确
3. 认证失败

**解决方案**:
1. 检查后端服务是否运行：`http://localhost:3000`
2. 查看 API 文档确认路径：`/api/admin/data`
3. 检查 `.env` 中的账号密码是否正确

### 问题：清理操作超时

**可能原因**:
1. 后端服务响应慢
2. 网络问题

**解决方案**:
1. 增加超时时间：`CLEANUP_TIMEOUT=20000`
2. 检查网络连接
3. 重启后端服务

### 问题：前端数据未清理

**可能原因**:
1. localStorage 键名不匹配
2. 清理逻辑未执行

**解决方案**:
1. 检查要清理的键名是否在列表中
2. 查看控制台日志确认清理执行
3. 使用 `logStorageInfo()` 查看存储状态

## 📚 相关资源

- [Playwright 全局设置文档](https://playwright.dev/docs/test-global-setup-teardown)
- [后端 API 文档](../../../docs/api-documentation.md)
- [测试配置文档](../../../playwright.config.ts)

## 🎯 最佳实践

1. **始终运行完整测试**: 让 global-setup 和 global-teardown 自动清理
2. **特殊情况手动清理**: 使用 TestDataCleaner 工具类
3. **调试时禁用清理**: 临时注释清理代码方便调试
4. **定期检查清理日志**: 确保清理正常工作

---

**最后更新**: 2026-03-14  
**版本**: 1.0.0  
**维护者**: Test Team
