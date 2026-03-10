# 主页面瑞士轮标题更新计划 (TDD开发)

## 需求概述
1. 移除主页面瑞士轮的 (0-0) (1-0) 等战绩显示文本 
2. 主页面瑞士轮的轮次信息增加BO1/BO3显示 
3. BO1/BO3不需要根据战绩推算，固定写死：Round 1 为 BO1，其它均为 BO3

## TDD开发流程

```
编写测试 → 运行测试(失败) → 编写代码 → 运行测试(通过) → 重构 → 验证覆盖率
```

## 当前状态分析

### 当前主页面 SwissStage.tsx 的标题结构
```tsx
// RoundColumn 组件只接收 title 字符串
<RoundColumn title="Round 1 (0-0)" matches={round1Matches} teams={teams} />
<RoundColumn title="Round 2 High (1-0)" matches={round2High} teams={teams} />
<RoundColumn title="Round 2 Low (0-1)" matches={round2Low} teams={teams} />
<RoundColumn title="Round 3 Mid (1-1)" matches={round3Mid} teams={teams} />
<RoundColumn title="Round 3 Low (0-2)" matches={round3Low} teams={teams} />
<RoundColumn title="Last Chance (1-2)" matches={round4Last} teams={teams} />
```

### 当前 RoundColumn 组件
```tsx
const RoundColumn: React.FC<{
  title: string;
  matches: Match[];
  teams: Team[];
  className?: string;
}> = ({ title, matches, teams, className }) => {
  return (
    <div className={`flex flex-col gap-3 min-w-[200px] ${className}`}>
      <div className="text-center pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
      </div>
      ...
    </div>
  );
};
```

## 测试文件规划

### SwissStage 标题显示测试
```typescript
// src/components/features/__tests__/SwissStage.test.tsx

describe('SwissStage 轮次标题显示', () => {
  it('Round 1 应该显示 BO1 标签', () => {
    // 验证 Round 1 标题旁显示绿色 BO1 标签
  })

  it('Round 2 High 应该显示 BO3 标签', () => {
    // 验证 Round 2 High 标题旁显示蓝色 BO3 标签
  })

  it('Round 2 Low 应该显示 BO3 标签', () => {
    // 验证 Round 2 Low 标题旁显示蓝色 BO3 标签
  })

  it('Round 3 Mid 应该显示 BO3 标签', () => {
    // 验证 Round 3 Mid 标题旁显示蓝色 BO3 标签
  })

  it('Round 3 Low 应该显示 BO3 标签', () => {
    // 验证 Round 3 Low 标题旁显示蓝色 BO3 标签
  })

  it('Last Chance 应该显示 BO3 标签', () => {
    // 验证 Last Chance 标题旁显示蓝色 BO3 标签
  })

  it('标题不应该包含战绩文本 (0-0) 等', () => {
    // 验证标题中不包含括号内的战绩文本
  })
})
```

## 实现步骤 (TDD)

### 第一阶段：编写测试

#### 步骤1：编写测试用例
**文件**: `src/components/features/__tests__/SwissStage.test.tsx`
- 添加测试：验证各轮次显示正确的 BO1/BO3 标签
- 添加测试：验证标题不包含战绩文本

#### 步骤2：运行测试（失败）
```bash
npm test
```
预期：测试失败，因为组件还未修改

### 第二阶段：修改组件

#### 步骤3：修改 RoundColumn 组件接口
**文件**: `src/components/features/SwissStage.tsx`

将 `title` 字符串改为接收 `roundName` 和 `isBo3` 两个参数：

```tsx
const RoundColumn: React.FC<{
  roundName: string;  // 轮次名称，如 "Round 1"
  isBo3: boolean;     // 是否为 BO3，true=BO3，false=BO1
  matches: Match[];
  teams: Team[];
  className?: string;
}> = ({ roundName, isBo3, matches, teams, className }) => {
  return (
    <div className={`flex flex-col gap-3 min-w-[200px] ${className}`}>
      <div className="text-center pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{roundName}</h3>
        <div className="flex items-center justify-center mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            isBo3 ? 'bg-blue-600/20 text-blue-400' : 'bg-green-600/20 text-green-400'
          }`}>
            {isBo3 ? 'BO3' : 'BO1'}
          </span>
        </div>
      </div>
      ...
    </div>
  );
};
```

#### 步骤4：更新所有 RoundColumn 调用
```tsx
// 修改前
<RoundColumn title="Round 1 (0-0)" matches={round1Matches} teams={teams} />

// 修改后
<RoundColumn roundName="Round 1" isBo3={false} matches={round1Matches} teams={teams} />
<RoundColumn roundName="Round 2 High" isBo3={true} matches={round2High} teams={teams} />
<RoundColumn roundName="Round 2 Low" isBo3={true} matches={round2Low} teams={teams} />
<RoundColumn roundName="Round 3 Mid" isBo3={true} matches={round3Mid} teams={teams} />
<RoundColumn roundName="Round 3 Low" isBo3={true} matches={round3Low} teams={teams} />
<RoundColumn roundName="Last Chance" isBo3={true} matches={round4Last} teams={teams} />
```

#### 步骤5：运行测试（通过）
```bash
npm test
```
验证所有测试通过

### 第三阶段：验证和清理

#### 步骤6：运行完整测试
```bash
npm test
```
确保没有破坏其他功能

## 预期效果

### 修改前
- Round 1 (0-0)
- Round 2 High (1-0)
- Round 2 Low (0-1)
- ...

### 修改后
- Round 1 [BO1]（绿色标签）
- Round 2 High [BO3]（蓝色标签）
- Round 2 Low [BO3]（蓝色标签）
- Round 3 Mid [BO3]（蓝色标签）
- Round 3 Low [BO3]（蓝色标签）
- Last Chance [BO3]（蓝色标签）

## 文件变更清单

### 修改文件
1. `src/components/features/__tests__/SwissStage.test.tsx` - 添加测试用例
2. `src/components/features/SwissStage.tsx` - 修改 RoundColumn 组件和调用方式

## 验证步骤

1. 运行测试确保所有测试通过
2. 启动开发服务器查看 UI 效果
3. 确认：
   - 各轮次标题正确显示 BO1/BO3 标签
   - BO1 为绿色，BO3 为蓝色
   - 标题中不再包含战绩文本 (0-0) 等
