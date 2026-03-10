# 移除晋级名单管理页面方案 (TDD开发)

## 需求概述
移除 http://localhost:5173/admin/advancement 晋级名单管理页面，只保留一个配置点。同时移除主页面的"管理晋级名单"按钮。

**修改原则**：将无用代码注释掉，并标记移除，使用TDD方法开发。

---

## TDD开发流程

```
编写测试 → 运行测试(失败) → 编写代码 → 运行测试(通过) → 重构 → 验证覆盖率
```

---

## 测试文件规划

### 1. 路由移除测试
```typescript
// src/__tests__/App.routes.test.tsx

describe('App 路由配置', () => {
  it('不应该包含 /admin/advancement 路由', () => {
    // 验证路由配置中不包含 advancement 路由
  })

  it('应该包含其他管理页面路由', () => {
    // 验证 dashboard, stream, teams, schedule 路由仍然存在
  })
})
```

### 2. 导航菜单测试
```typescript
// src/components/layout/__tests__/AdminLayout.test.tsx

describe('AdminLayout 导航菜单', () => {
  it('不应该显示晋级名单菜单项', () => {
    // 验证导航中没有"晋级名单"菜单
  })

  it('应该显示其他管理菜单项', () => {
    // 验证仪表盘、直播配置、战队管理、赛程管理菜单存在
  })
})
```

### 3. SwissStage 组件测试
```typescript
// src/components/features/__tests__/SwissStage.test.tsx

describe('SwissStage 组件', () => {
  it('不应该显示管理晋级名单按钮', () => {
    // 验证没有"管理晋级名单"链接按钮
  })

  it('应该正常显示晋级名单数据', () => {
    // 验证从 store 读取的晋级名单正常显示
  })
})
```

---

## 实施步骤 (TDD)

### 第一阶段：编写测试

#### 步骤1：编写路由测试
```typescript
// 测试 App.tsx 路由配置
```

#### 步骤2：编写导航菜单测试
```typescript
// 测试 AdminLayout.tsx 导航菜单
```

#### 步骤3：编写 SwissStage 组件测试
```typescript
// 测试 SwissStage.tsx 按钮移除
```

#### 步骤4：运行测试（失败）
```bash
npm test
# 测试失败 - 代码未修改
```

---

### 第二阶段：修改代码（注释方式）

#### 步骤5：修改 App.tsx
```typescript
// 注释掉 AdvancementManager 导入
// import AdvancementManager from './pages/admin/AdvancementManager';

// 注释掉 /admin/advancement 路由
/*
<Route path="/admin/advancement" element={
  <ProtectedRoute>
    <AdvancementManager />
  </ProtectedRoute>
} />
*/
```

#### 步骤6：修改 AdminLayout.tsx
```typescript
// 注释掉晋级名单菜单项
/*
{ path: '/admin/advancement', label: '晋级名单', icon: Trophy },
*/

// 如果 Trophy 图标不再使用，注释掉导入
// import { ..., Trophy } from 'lucide-react';
```

#### 步骤7：修改 SwissStage.tsx
```typescript
// 注释掉管理晋级名单按钮
/*
<div className="flex justify-end mb-4 px-4">
  <Link
    to="/admin/advancement"
    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
  >
    <Settings className="w-4 h-4" />
    管理晋级名单
  </Link>
</div>
*/

// 如果 Link 和 Settings 不再使用，注释掉导入
// import { Link } from 'react-router-dom';
// import { ..., Settings } from 'lucide-react';
```

#### 步骤8：运行测试（通过）
```bash
npm test
# 测试通过
```

---

### 第三阶段：验证和清理

#### 步骤9：验证应用功能
- 访问 `/admin/advancement` 应显示 404 或重定向
- 侧边栏导航不显示"晋级名单"菜单
- SwissStage 正常显示晋级名单数据

#### 步骤10：标记移除代码
在注释中添加 `[REMOVE]` 标记，便于后续清理：
```typescript
// [REMOVE] 晋级名单管理页面已废弃
// import AdvancementManager from './pages/admin/AdvancementManager';
```

---

## 文件变更清单

### 修改文件
1. `src/App.tsx` - 注释掉 advancement 路由和导入
2. `src/components/layout/AdminLayout.tsx` - 注释掉导航菜单项
3. `src/components/features/SwissStage.tsx` - 注释掉管理按钮

### 新增测试文件
1. `src/__tests__/App.routes.test.tsx`
2. `src/components/layout/__tests__/AdminLayout.test.tsx`
3. `src/components/features/__tests__/SwissStage.test.tsx`

### 保留文件（功能仍需要）
- `src/pages/admin/AdvancementManager.tsx` - 保留但不可访问
- `src/store/advancementStore.ts` - SwissStage 仍在使用
- `src/types/index.ts` - 类型定义保留

---

## 验证清单

- [ ] 路由测试通过 - `/admin/advancement` 路由已移除
- [ ] 导航测试通过 - 侧边栏不显示晋级名单菜单
- [ ] SwissStage 测试通过 - 不显示管理按钮，数据正常显示
- [ ] 应用无编译错误
- [ ] 应用无运行时错误
- [ ] 代码覆盖率达标
