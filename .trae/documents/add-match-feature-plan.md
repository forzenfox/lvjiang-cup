# 管理员添加赛程功能计划（优化版）

## 问题描述
当前系统在无数据时，管理员无法通过页面添加赛程对战信息。现有功能只能编辑预定义的比赛数据，无法创建新的比赛。

## 新增信息
1. 当前项目为demo，后续会开发后端应用用于数据交互，方案需要考虑后期的平滑迁移
2. 赛程管理页面UI已按区域显示不同轮次分组（瑞士轮：Round 1/2/3/4，淘汰赛：胜者组/败者组/总决赛）
3. 建议直接在对应分组下新增若干项目，管理员只需填写对战信息，减少操作步骤

## 解决方案
在每个分组区域添加"添加比赛"按钮，点击后在该分组下直接插入一个空白比赛项（进入编辑模式），管理员只需填写队伍、时间、比分等信息即可。

## 架构设计（考虑后端迁移）

### API 接口设计（前后端通用）
```typescript
// 当前 mockService 接口
addMatch: (match: Omit<Match, 'id'>) => Promise<Match>

// 未来后端接口形式（保持一致）
POST /api/matches
body: Omit<Match, 'id'>
response: Match
```

### 数据流设计
- 组件层：点击"添加比赛"→ 创建空白比赛项（进入编辑模式）→ 填写信息 → 保存时调用 onAddMatch
- 页面层：Schedule.tsx 统一处理 addMatch 调用 → 成功后刷新列表
- 服务层：mockService.addMatch 模拟后端行为（生成ID、保存数据）

## 实现步骤

### 1. 扩展 Mock Service
**文件**: `src/mock/service.ts`
- 添加 `addMatch` 方法，接收 `Omit<Match, 'id'>` 参数
- 生成唯一比赛ID（使用 `match-${Date.now()}` 格式）
- 将新比赛添加到 matches 数组并保存到 localStorage
- 返回完整的 Match 对象（含生成的ID）

```typescript
addMatch: async (newMatch: Omit<Match, 'id'>): Promise<Match> => {
  await delay(DELAY);
  const match: Match = { ...newMatch, id: `match-${Date.now()}` };
  matches.push(match);
  saveToStorage('matches', matches);
  return match;
}
```

### 2. 修改 MatchRow 组件支持新增模式
**文件**: `src/pages/admin/components/MatchRow.tsx`
- 添加 `isNew` prop，表示是否为新增模式
- 新增模式时：
  - 自动进入编辑状态
  - 显示"取消"按钮，点击后取消新增（从列表移除）
  - 保存时调用 `onAdd` 回调（而非 `onUpdate`）
- Props 扩展：
  ```typescript
  interface MatchRowProps {
    match: Match;
    teams: Team[];
    onUpdate: (match: Match) => void;
    onAdd?: (match: Omit<Match, 'id'>) => void;
    onCancel?: () => void;  // 取消新增时调用
    loading: boolean;
    fixedSwissRecord?: string;
    isNew?: boolean;  // 是否为新增模式
  }
  ```

### 3. 修改瑞士轮编辑器
**文件**: `src/pages/admin/components/SwissStageEditor.tsx`
- 添加本地状态 `newMatches` 存储待新增的临时比赛项
- 在每个分组标题栏右侧添加"+ 添加比赛"按钮
- 点击按钮时，在 `newMatches` 中添加一个空白比赛项，传入对应分组的属性：
  - `stage: 'swiss'`
  - `swissRecord: 对应分组的战绩（如 '0-0'）`
  - `round: 分组名称（如 'Round 1'）`
  - `status: 'upcoming'`
  - `scoreA: 0, scoreB: 0`
  - `winnerId: null`
  - `teamAId: '', teamBId: ''`
  - `startTime: 当前时间`
- 在对应分组的列表末尾渲染 `newMatches` 中的临时项
- 临时项使用 `isNew=true` 模式，保存时调用 `onAddMatch`，取消时从 `newMatches` 移除

### 4. 修改淘汰赛编辑器
**文件**: `src/pages/admin/components/EliminationStageEditor.tsx`
- 与瑞士轮编辑器类似，添加 `newMatches` 状态
- 在每个分组（胜者组、败者组、总决赛）标题栏右侧添加"+ 添加比赛"按钮
- 点击时创建空白比赛项，传入对应属性：
  - `stage: 'elimination'`
  - `eliminationBracket: 'winners' | 'losers' | 'grand_finals'`
  - `round: 分组名称`
  - 其他默认值同上

### 5. 修改赛程管理主页面
**文件**: `src/pages/admin/Schedule.tsx`
- 添加 `handleAddMatch` 方法：
  ```typescript
  const handleAddMatch = async (newMatch: Omit<Match, 'id'>) => {
    setLoading(true);
    try {
      await mockService.addMatch(newMatch);
      toast.success('比赛添加成功');
      await loadData(); // 刷新列表
    } catch (error) {
      console.error('Failed to add match', error);
      toast.error('添加失败');
    } finally {
      setLoading(false);
    }
  };
  ```
- 将 `handleAddMatch` 传递给 SwissStageEditor 和 EliminationStageEditor

## 界面设计

### 瑞士轮分组
每个分组标题栏（如 "Round 1" / "0-0 (BO1)"）右侧显示：
- 左侧：比赛数量（如 "2 场"）
- 右侧："+ 添加比赛" 按钮（蓝色小按钮）

### 淘汰赛分组
同样在每个分组标题栏右侧显示 "+ 添加比赛" 按钮

### 新增比赛项样式
- 与现有 MatchRow 编辑模式一致
- 底部按钮："保存" | "取消"
- 取消后该项从列表移除

## 后端迁移路径
1. **接口替换**：将 `mockService.addMatch` 替换为真实的 `fetch('/api/matches', { method: 'POST' })`
2. **无需修改组件层**：MatchRow 只负责收集数据并调用 onAdd/onUpdate，不关心具体实现
3. **无需修改页面层**：Schedule.tsx 中的 `handleAddMatch` 只需替换内部调用
4. **错误处理**：保持现有的 try-catch 和 toast 提示机制

## 测试要点
1. 在瑞士轮各分组（Round 1/2 High/2 Low/3 Mid/3 Low/4）添加比赛
2. 在淘汰赛各分组（胜者组/败者组/总决赛）添加比赛
3. 验证新增项自动进入编辑模式
4. 验证取消后临时项被移除
5. 验证保存后数据正确持久化
6. 验证新增的比赛可以正常编辑
7. 验证表单验证（相同队伍不能对战）
