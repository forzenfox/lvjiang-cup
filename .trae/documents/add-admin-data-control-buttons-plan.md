# 管理员界面数据控制按钮开发计划

## 任务概述
在管理员界面新增两个功能按钮：
1. **一键加载 Mock 数据** - 将初始 mock 数据加载到 localStorage
2. **一键清空 LocalStorage** - 清空所有 localStorage 数据

## 需求分析

### 功能需求
1. 在管理员界面（Dashboard 或其他合适位置）添加两个按钮
2. 按钮需要有确认对话框，防止误操作
3. 操作成功后需要给用户反馈提示
4. 按钮样式需要符合现有 UI 设计规范

### 技术需求
1. 复用现有的 `mockService.resetAllData()` 方法
2. 新增清空 localStorage 的方法
3. 使用现有的 `confirm-dialog` 组件进行确认
4. 遵循 TDD 开发方法，先写测试再实现
5. 测试用例和测试结果统一放在 `src/tests/` 目录下

## 项目结构

```
src/
├── tests/                    # 统一测试目录
│   ├── unit/                 # 单元测试
│   │   └── mock/
│   │       └── service.test.ts
│   ├── integration/          # 集成测试
│   └── reports/              # 测试报告输出目录
│       └── .gitkeep
├── mock/
│   ├── data.ts
│   └── service.ts
└── ...
```

## 实现步骤

### Phase 1: 测试框架配置

#### 1.1 安装测试依赖
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

#### 1.2 配置 Vitest
创建 `vitest.config.ts`：
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    outputFile: './src/tests/reports/test-results.xml',
    reporters: ['default', 'junit'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      outputDirectory: './src/tests/reports/coverage',
    },
  },
});
```

#### 1.3 创建测试目录结构
```
src/tests/
├── setup.ts                  # 测试环境初始化
├── unit/                     # 单元测试目录
│   └── mock/
│       └── service.test.ts   # mockService 测试
├── integration/              # 集成测试目录
│   └── .gitkeep
└── reports/                  # 测试报告目录
    ├── .gitkeep
    └── coverage/             # 覆盖率报告
        └── .gitkeep
```

#### 1.4 更新 package.json 脚本
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Phase 2: 测试先行 (TDD)

#### 2.1 创建测试文件
文件路径: `src/tests/unit/mock/service.test.ts`

测试内容:
- 测试 `resetAllData()` 方法是否正确重置数据
- 测试新增的 `clearAllData()` 方法是否正确清空 localStorage
- 测试数据加载后是否正确保存到 localStorage
- 测试 `loadFromStorage` 的空数组回退逻辑

#### 2.2 运行测试确保失败
- 执行 `npm run test:run`，确认测试框架正常工作
- 确认测试用例能够正确失败（因为功能还未实现）

### Phase 3: 后端逻辑实现

#### 3.1 扩展 mockService
在 `src/mock/service.ts` 中添加新方法：
```typescript
// 清空所有数据（不重置为初始值）
clearAllData: async (): Promise<void> => {
  await delay(DELAY);
  localStorage.removeItem('teams');
  localStorage.removeItem('matches');
  localStorage.removeItem('streamInfo');
  teams = [];
  matches = [];
  streamInfo = {} as StreamInfo;
}
```

#### 3.2 修复 loadFromStorage 空数组问题
```typescript
const loadFromStorage = <T>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return initialData;
  
  try {
    const parsed = JSON.parse(stored);
    // 检查数组是否为空
    if (Array.isArray(parsed) && parsed.length === 0) {
      console.log(`[MockService] ${key} 为空数组，使用初始数据`);
      return initialData;
    }
    return parsed;
  } catch (e) {
    console.error(`[MockService] 解析 ${key} 失败，使用初始数据`, e);
    return initialData;
  }
};
```

#### 3.3 运行测试确保通过
- 执行 `npm run test:run`，确认新功能通过测试

### Phase 4: UI 组件实现

#### 4.1 选择按钮位置
在 `src/pages/admin/Dashboard.tsx` 中添加数据控制区域：
- 在仪表盘页面添加一个"数据管理"卡片/区域
- 包含两个按钮："加载 Mock 数据" 和 "清空所有数据"

#### 4.2 实现按钮组件逻辑
- 使用现有的 `confirm-dialog` 组件
- 实现加载 Mock 数据功能：
  - 调用 `mockService.resetAllData()`
  - 刷新页面或重新加载数据
  - 使用 sonner 显示成功提示
- 实现清空数据功能：
  - 调用 `mockService.clearAllData()`
  - 刷新页面或重新加载数据
  - 使用 sonner 显示成功提示

#### 4.3 样式实现
- 使用现有的 `Button` 组件
- "加载 Mock 数据"按钮使用主色调（primary）
- "清空所有数据"按钮使用危险色调（destructive）
- 添加适当的图标（Upload 和 Trash2）

### Phase 5: 集成测试

#### 5.1 创建集成测试
文件路径: `src/tests/integration/dashboard-data-control.test.tsx`

测试内容：
- 测试按钮是否正确渲染
- 测试确认对话框是否正确弹出
- 测试操作后数据是否正确更新

#### 5.2 手动测试
- 测试加载 Mock 数据按钮：
  - 清空 localStorage 后点击按钮
  - 验证数据是否正确加载
  - 验证页面是否正确显示数据
- 测试清空数据按钮：
  - 在有数据的情况下点击按钮
  - 验证 localStorage 是否被清空
  - 验证页面是否正确响应

### Phase 6: 代码审查和优化

#### 6.1 代码质量检查
- 运行 `npm run lint` 检查代码规范
- 运行 `npm run check` 检查 TypeScript 类型
- 确保代码符合项目规范

#### 6.2 生成测试报告
- 运行 `npm run test:coverage` 生成覆盖率报告
- 报告输出到 `src/tests/reports/coverage/`

## 文件变更清单

### 新增文件
1. `vitest.config.ts` - Vitest 配置文件
2. `src/tests/setup.ts` - 测试环境初始化
3. `src/tests/unit/mock/service.test.ts` - mockService 单元测试
4. `src/tests/integration/dashboard-data-control.test.tsx` - 集成测试
5. `src/tests/reports/.gitkeep` - 测试报告目录占位
6. `src/tests/reports/coverage/.gitkeep` - 覆盖率报告目录占位

### 修改文件
1. `package.json` - 添加测试脚本和依赖
2. `src/mock/service.ts` - 添加 `clearAllData` 方法和修复 `loadFromStorage`
3. `src/pages/admin/Dashboard.tsx` - 添加数据控制按钮 UI

## 技术细节

### API 设计
```typescript
// mockService 新增方法
clearAllData: () => Promise<void>
```

### UI 设计
- 位置：Dashboard 页面，放在统计卡片下方
- 布局：使用 Card 组件包裹，标题为"数据管理"
- 按钮间距：使用 flex gap-4
- 图标：Upload（加载数据）、Trash2（清空数据）

### 确认对话框文案
**加载 Mock 数据确认：**
- 标题：确认加载 Mock 数据？
- 内容：此操作将重置所有数据为初始 Mock 状态，当前数据将被覆盖。是否继续？
- 确认按钮：加载数据
- 取消按钮：取消

**清空数据确认：**
- 标题：确认清空所有数据？
- 内容：此操作将清空所有 localStorage 数据，无法恢复。是否继续？
- 确认按钮：清空数据（红色）
- 取消按钮：取消

## 测试报告位置

- **测试结果**: `src/tests/reports/test-results.xml`
- **覆盖率报告**: `src/tests/reports/coverage/`
- **HTML 覆盖率报告**: `src/tests/reports/coverage/index.html`

## 风险与注意事项

1. **数据丢失风险**：清空操作不可逆，必须添加确认对话框
2. **用户体验**：操作后需要刷新页面或重新获取数据
3. **并发操作**：避免在数据加载过程中重复点击按钮
4. **测试隔离**：每个测试用例需要独立清理 localStorage

## 验收标准

- [ ] 一键加载 Mock 数据按钮正常工作
- [ ] 一键清空 LocalStorage 按钮正常工作
- [ ] 两个按钮都有确认对话框
- [ ] 操作后有用户反馈（Toast 提示）
- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 测试覆盖率报告生成成功
- [ ] ESLint 检查通过
- [ ] TypeScript 类型检查通过
