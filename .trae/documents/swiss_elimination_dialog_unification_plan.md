# 瑞士轮和淘汰赛编辑弹框统一方案（更新版）

## 一、问题澄清

根据用户反馈，明确以下两点需求：

1. **瑞士轮当前使用内联编辑**，与淘汰赛的弹框编辑方式不一致，需要统一
2. **赛道设置 (`eliminationBracket`) 当前UI未实际使用**，建议移除相关逻辑

## 二、现状对比

| 特性 | 瑞士轮 (SwissStage) | 淘汰赛 (EliminationStage) |
|-----|-------------------|-------------------------|
| 编辑方式 | 内联编辑（直接卡片上编辑） | 弹框编辑 (MatchEditDialog) |
| 编辑弹框 | ❌ 不使用 | ✅ 使用 |
| 赛道设置 | N/A | 有字段但未实际使用 |

## 三、实施方案

### 任务1：统一编辑方式为弹框编辑

将瑞士轮的编辑方式从内联编辑改为使用 `MatchEditDialog` 弹框编辑。

**修改文件**：
- `src/pages/admin/SwissStageVisualEditor.tsx`

**具体改动**：
1. 导入 `MatchEditDialog` 组件
2. 修改 `FixedSlotMatchCard` 组件：
   - 移除内联编辑逻辑
   - 点击卡片打开 `MatchEditDialog`
   - 通过弹框保存数据

### 任务2：移除赛道设置逻辑

**修改文件**：
1. `src/pages/admin/components/MatchEditDialog.tsx`
   - 移除淘汰赛赛道选择下拉框（第188-201行）
   
2. `src/types/index.ts`
   - 移除 `EliminationBracket` 类型
   - 移除 `Match.eliminationBracket` 字段

3. `src/components/features/EditableBracketMatchCard.tsx`
   - 移除 `isGrandFinals` 相关样式逻辑

4. 其他使用到 `eliminationBracket` 的文件

### 任务3：更新相关组件

需要检查和更新的文件：
- `src/components/features/EliminationStage.tsx`
- `src/components/features/eliminationConstants.ts`
- 其他可能引用 `eliminationBracket` 的组件

## 四、详细实施步骤

### 步骤1：修改 SwissStageVisualEditor.tsx

```typescript
// 1. 添加导入
import MatchEditDialog from '@/pages/admin/components/MatchEditDialog';

// 2. 修改 FixedSlotMatchCard 组件
const FixedSlotMatchCard: React.FC<FixedSlotMatchCardProps> = ({ 
  match, teams, slot, slotIndex, onUpdate, onCreate 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 创建新比赛的辅助函数
  const createNewMatch = (): Match => ({
    id: `new-${slot.swissRecord}-${slotIndex}`,
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: slot.roundName,
    status: 'upcoming',
    startTime: '',
    stage: 'swiss',
    swissRecord: slot.swissRecord,
  });

  const handleClick = () => {
    setIsDialogOpen(true);
  };

  const handleSave = (updatedMatch: Match) => {
    if (match) {
      onUpdate(updatedMatch);
    } else if (onCreate) {
      onCreate(updatedMatch);
    }
    setIsDialogOpen(false);
  };

  // 渲染只读卡片（移除了内联编辑逻辑）
  return (
    <>
      <Card
        className="bg-gray-800/80 border-gray-700 p-2.5 hover:bg-gray-800 transition-colors group relative overflow-hidden cursor-pointer hover:border-blue-500/50"
        onClick={handleClick}
      >
        {/* 卡片内容保持不变 */}
      </Card>

      <MatchEditDialog
        match={match || createNewMatch()}
        teams={teams}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};
```

### 步骤2：移除 MatchEditDialog 中的赛道设置

```typescript
// 移除以下代码块（第188-201行）：
{match.stage === 'elimination' && (
  <div>
    <label className="block text-sm text-gray-400 mb-1">淘汰赛赛道</label>
    <select
      value={formData.eliminationBracket || 'winners'}
      onChange={(e) => handleChange('eliminationBracket', e.target.value as EliminationBracket)}
      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
    >
      <option value="winners">胜者组</option>
      <option value="losers">败者组</option>
      <option value="grand_finals">总决赛</option>
    </select>
  </div>
)}
```

同时移除导入的 `EliminationBracket` 类型。

### 步骤3：更新类型定义

```typescript
// src/types/index.ts

// 移除：
export type EliminationBracket = 'winners' | 'losers' | 'grand_finals';

// 修改 Match 接口，移除 eliminationBracket 字段：
export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
  round: string;
  status: MatchStatus;
  startTime: string;
  stage: MatchStage;
  swissRecord?: string;
  swissDay?: number;
  // 移除: eliminationBracket?: EliminationBracket;
  eliminationGameNumber?: number;
}
```

### 步骤4：更新 EditableBracketMatchCard

```typescript
// 移除 isGrandFinals 相关逻辑
// const isGrandFinals = match.eliminationBracket === 'grand_finals';

// 简化样式逻辑，移除 grand_finals 特殊样式
```

### 步骤5：更新测试

1. 更新 `SwissStageVisualEditor.test.tsx`：
   - 测试弹框打开/关闭
   - 测试通过弹框编辑比赛

2. 更新 `MatchEditDialog.test.tsx`（如果有）：
   - 移除赛道选择相关测试

3. 更新类型相关的测试

## 五、影响范围分析

| 文件 | 影响 | 操作 |
|-----|------|------|
| `SwissStageVisualEditor.tsx` | 高 | 修改编辑方式 |
| `MatchEditDialog.tsx` | 中 | 移除赛道选择 |
| `types/index.ts` | 高 | 移除类型和字段 |
| `EditableBracketMatchCard.tsx` | 中 | 移除赛道样式 |
| `EliminationStage.tsx` | 低 | 检查是否有影响 |
| 测试文件 | 中 | 更新测试用例 |

## 六、回滚方案

如需回滚：
1. 保留 `EliminationBracket` 类型定义（标记为废弃）
2. 保留 `eliminationBracket` 字段（可选）
3. 使用 Git 版本控制进行回滚

## 七、验收标准

- [ ] 瑞士轮点击比赛卡片打开 `MatchEditDialog` 弹框
- [ ] 弹框中可编辑比赛时间、状态、队伍、比分
- [ ] 弹框中显示瑞士轮战绩字段（仅瑞士轮比赛）
- [ ] 弹框中**不显示**淘汰赛赛道字段
- [ ] 所有现有测试通过
- [ ] 新增测试覆盖弹框编辑功能
