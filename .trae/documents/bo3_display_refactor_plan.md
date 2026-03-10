# BO1/BO3 显示位置重构计划

## 需求概述
将 BO1/BO3 赛制信息从赛事卡片中移除，改为显示在轮次分组信息（RoundColumn 标题）中。同时从数据模型中移除 `isBo3` 字段。

## 当前状态分析

### 当前代码结构
1. **swissRoundSlots.ts**: 定义了 `SwissRoundSlot` 接口，包含 `isBo3: boolean` 字段
2. **SwissStageVisualEditor.tsx**: 
   - `FixedSlotMatchCard` 组件在卡片右上角显示 BO3 标签（第236-240行）
   - `RoundColumn` 组件显示轮次名称和战绩
3. **swissRoundSlots.test.ts**: 测试了 `isBo3` 字段

### 需要修改的内容
1. 从 `SwissRoundSlot` 接口中移除 `isBo3` 字段
2. 从 `swissRoundSlots` 数组中移除 `isBo3` 属性
3. 从 `FixedSlotMatchCard` 中移除 BO3 标签显示
4. 在 `RoundColumn` 标题中添加 BO1/BO3 显示
5. 更新测试文件，移除对 `isBo3` 的测试

## TDD 开发流程

### 第一阶段：修改数据模型

#### 步骤1：更新配置接口和常量
**文件**: `src/pages/admin/swissRoundSlots.ts`
- 移除 `SwissRoundSlot` 接口中的 `isBo3` 字段
- 更新 `swissRoundSlots` 数组，移除所有 `isBo3` 属性
- 添加辅助函数 `getRoundFormat(swissRecord: string): 'BO1' | 'BO3'`

#### 步骤2：运行测试（预期失败）
```bash
npm test
```
预期：测试失败，因为测试文件还在引用 `isBo3`

#### 步骤3：更新测试文件
**文件**: `src/pages/admin/__tests__/swissRoundSlots.test.ts`
- 移除对 `isBo3` 的测试用例
- 添加对 `getRoundFormat` 函数的测试

#### 步骤4：运行测试（预期通过）
```bash
npm test
```

### 第二阶段：修改 UI 组件

#### 步骤5：更新 SwissStageVisualEditor.tsx
**文件**: `src/pages/admin/SwissStageVisualEditor.tsx`

**修改1**: 从 `FixedSlotMatchCard` 中移除 BO3 标签
- 移除第236-240行的 BO3 显示代码
- 从 `FixedSlotMatchCardProps` 中移除 `slot` 属性（如果不再需要）

**修改2**: 在 `RoundColumn` 标题中添加 BO1/BO3 显示
- 修改 `RoundColumn` 组件的标题区域
- 添加赛制显示：在战绩旁边显示 BO1 或 BO3

#### 步骤6：运行测试验证
```bash
npm test
```

### 第三阶段：验证和清理

#### 步骤7：检查类型定义
**文件**: `src/types/index.ts`
- 确认 `Match` 类型中没有 `isBo3` 字段（当前确实没有，符合要求）

#### 步骤8：检查其他使用处
搜索整个代码库，确保没有其他地方使用 `isBo3`

#### 步骤9：运行完整测试
```bash
npm test
```

## 具体代码变更

### 1. swissRoundSlots.ts 变更
```typescript
// 移除前
export interface SwissRoundSlot {
  swissRecord: string;
  roundName: string;
  maxMatches: number;
  isBo3: boolean;  // 移除这行
}

// 移除后
export interface SwissRoundSlot {
  swissRecord: string;
  roundName: string;
  maxMatches: number;
}

// 添加辅助函数
export const getRoundFormat = (swissRecord: string): 'BO1' | 'BO3' => {
  return swissRecord === '0-0' ? 'BO1' : 'BO3';
};
```

### 2. SwissStageVisualEditor.tsx 变更

#### RoundColumn 标题修改
```tsx
// 修改前
<div className="text-center pb-2 border-b border-gray-800">
  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{slot.roundName}</h3>
  <span className="text-xs text-gray-500">({slot.swissRecord})</span>
</div>

// 修改后
<div className="text-center pb-2 border-b border-gray-800">
  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{slot.roundName}</h3>
  <div className="flex items-center justify-center gap-2 mt-1">
    <span className="text-xs text-gray-500">({slot.swissRecord})</span>
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
      getRoundFormat(slot.swissRecord) === 'BO1' 
        ? 'bg-green-600/20 text-green-400' 
        : 'bg-blue-600/20 text-blue-400'
    }`}>
      {getRoundFormat(slot.swissRecord)}
    </span>
  </div>
</div>
```

#### FixedSlotMatchCard 移除 BO3 标签
```tsx
// 移除这段代码（第236-240行）
{slot.isBo3 && (
  <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-bl font-mono">
    BO3
  </div>
)}
```

### 3. 测试文件变更
```typescript
// 移除整个测试用例
it('应该正确区分BO1和BO3赛制', () => {
  // ... 移除
});

// 添加新的测试用例
it('getRoundFormat 应该正确返回赛制', () => {
  expect(getRoundFormat('0-0')).toBe('BO1');
  expect(getRoundFormat('1-0')).toBe('BO3');
  expect(getRoundFormat('0-1')).toBe('BO3');
  expect(getRoundFormat('1-1')).toBe('BO3');
  expect(getRoundFormat('0-2')).toBe('BO3');
  expect(getRoundFormat('1-2')).toBe('BO3');
});
```

## 预期效果

1. **数据模型**: `SwissRoundSlot` 接口不再包含 `isBo3` 字段
2. **赛事卡片**: 不再显示 BO1/BO3 标签
3. **轮次标题**: 在战绩旁边显示 BO1（绿色）或 BO3（蓝色）标签
4. **视觉效果**: 
   - Round 1: 显示 "(0-0) BO1"（绿色标签）
   - 其他轮次: 显示 "(战绩) BO3"（蓝色标签）

## 文件变更清单

### 修改文件
1. `src/pages/admin/swissRoundSlots.ts` - 移除 `isBo3` 字段，添加 `getRoundFormat` 函数
2. `src/pages/admin/SwissStageVisualEditor.tsx` - 移除卡片 BO3 标签，在标题显示赛制
3. `src/pages/admin/__tests__/swissRoundSlots.test.ts` - 更新测试用例

## 验证步骤

1. 运行测试确保所有测试通过
2. 启动开发服务器查看 UI 效果
3. 确认：
   - 轮次标题正确显示 BO1/BO3
   - 赛事卡片不再显示 BO3 标签
   - 所有功能正常工作
