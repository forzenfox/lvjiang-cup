# 瑞士轮固定场次改造方案 (TDD开发)

## 需求
瑞士轮当前是动态根据战绩分组显示场次，参照淘汰赛做法，改为固定场次槽位。管理员只需要编辑对战信息。

## 当前分析

### 瑞士轮赛制（固定的）
| 轮次 | 战绩 | 场次 | 赛制 |
|------|------|------|------|
| Round 1 | 0-0 | 4场 | BO1 |
| Round 2 High | 1-0 | 2场 | BO3 |
| Round 2 Low | 0-1 | 2场 | BO3 |
| Round 3 Mid | 1-1 | 2场 | BO3 |
| Round 3 Low | 0-2 | 1场 | BO3 |
| Round 4 | 1-2 | 3场 | BO3 |

### 淘汰赛实现方式
淘汰赛通过 `eliminationGameNumber` (1-8) 固定每个位置，UI直接渲染1-8号位置的卡片，管理员点击编辑。

---

## TDD开发流程

```
编写测试 → 运行测试(失败) → 编写代码 → 运行测试(通过) → 重构 → 验证覆盖率
```

---

## 测试文件规划

### 1. 瑞士轮槽位配置测试
```typescript
// src/pages/admin/__tests__/swissRoundSlots.test.ts

describe('SwissRoundSlots 槽位配置', () => {
  it('应该包含正确的轮次配置', () => {
    // 验证所有轮次都定义了
  })

  it('每个轮次应该有正确的场次数', () => {
    // Round 1: 4场, Round 2 High: 2场...
  })

  it('应该正确区分BO1和BO3赛制', () => {
    // Round 1 是 BO1，其他是 BO3
  })
})
```

### 2. 固定槽位渲染测试
```typescript
// src/pages/admin/__tests__/SwissStageFixedSlots.test.tsx

describe('SwissStageFixedSlots 固定槽位渲染', () => {
  it('应该渲染正确数量的轮次列', () => {
    // 6个轮次列
  })

  it('每个轮次应该渲染正确数量的槽位', () => {
    // Round 1: 4个槽位, Round 2 High: 2个槽位...
  })

  it('已有比赛应该填充到对应槽位', () => {
    // swissRecord="0-0" 的比赛应在Round 1槽位
  })

  it('空槽位应该显示虚线边框', () => {
    // 没有比赛的槽位显示等待对阵
  })
})
```

### 3. 比赛创建测试
```typescript
// src/pages/admin/__tests__/SwissStageFixedSlots.test.tsx

describe('固定槽位比赛创建', () => {
  it('点击空槽位应该打开编辑弹窗', () => {
    // 点击空槽位打开MatchEditDialog
 新创建 })

  it('的比赛应该自动设置正确的swissRecord', () => {
    // 在Round 1槽位创建比赛，自动设置swissRecord="0-0"
  })

  it('新创建的比赛应该自动设置正确的BO赛制', () => {
    // Round 1 设置为BO1，其他轮次BO3
  })
})
```

### 4. 比赛编辑测试
```typescript
// src/pages/admin/__tests__/SwissStageFixedSlots.test.tsx

describe('固定槽位比赛编辑', () => {
  it('点击已有比赛应该打开编辑弹窗', () => {
    // 点击已有比赛卡片打开编辑
  })

  it('编辑后应该更新比赛信息', () => {
    // 修改比分、状态后更新
  })

  it('删除比赛应该清空槽位', () => {
    // 删除比赛后槽位变为空
  })
})
```

---

## 实现步骤 (TDD)

### 第一阶段：槽位配置

#### 步骤1：编写配置测试
```typescript
// 测试 SwissRoundSlots 配置的正确性
```

#### 步骤2：运行测试（失败）
```bash
npm test
# 测试失败 - 配置未实现
```

#### 步骤3：实现槽位配置
```typescript
// 定义 SwissRoundSlots 常量
```

#### 步骤4：运行测试（通过）
验证配置正确

---

### 第二阶段：固定槽位渲染

#### 步骤5：编写渲染测试
```typescript
// 测试固定槽位渲染逻辑
```

#### 步骤6：运行测试（失败）
```bash
npm test
# 测试失败 - 渲染逻辑未实现
```

#### 步骤7：实现固定槽位组件
修改 SwissStageVisualEditor.tsx

#### 步骤8：运行测试（通过）

---

### 第三阶段：编辑功能

#### 步骤9：编写编辑测试
```typescript
// 测试空槽位创建、已有比赛编辑
```

#### 步骤10：运行测试（失败）

#### 步骤11：实现编辑功能
- 修改 EditableMatchCard 支持空槽位
- 修改 MatchEditDialog 自动设置 swissRecord

#### 步骤12：运行测试（通过）

---

## 文件变更

### 测试文件（新增）
- `src/pages/admin/__tests__/swissRoundSlots.test.ts`
- `src/pages/admin/__tests__/SwissStageFixedSlots.test.tsx`

### 修改文件
- `src/pages/admin/SwissStageVisualEditor.tsx` - 改为固定槽位渲染
- `src/components/features/EditableMatchCard.tsx` - 支持空槽位状态

---

## 预期效果

1. 瑞士轮显示6个轮次列，每个轮次有固定数量的槽位
2. 点击空槽位创建比赛，自动设置正确的 swissRecord 和赛制
3. 点击已有比赛编辑对战信息
4. 空槽位显示虚线边框和"等待对阵"提示
5. 管理员无需关心比赛如何分组，系统自动处理
