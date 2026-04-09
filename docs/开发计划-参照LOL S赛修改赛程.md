# 开发计划 - 参照LOL S赛修改赛程

> 版本: v3.1
> 更新日期: 2026-04-09
> 状态: 待审核

---

## 一、总体方案

### 核心思路
采用**固定槽位 + 管理员编辑对战**的方案，与现有架构保持一致：
1. **瑞士轮**：预先创建16队赛制的所有比赛槽位，管理员通过编辑槽位来配置对战
2. **淘汰赛**：预先创建8队单败赛制的所有比赛槽位，管理员通过编辑槽位来配置抽签对阵关系

### 架构差异说明（重要）
**现有代码是8队3轮赛制（6个战绩分组），目标架构是16队4轮赛制（10个战绩分组）。这不是简单扩展，而是完全不同：**

| 对比项 | 现有代码 (8队) | 目标架构 (16队) |
|--------|---------------|----------------|
| 战队数量 | 8支 | 16支 |
| 轮次 | 3轮 | 4轮 |
| 战绩分组 | 6个 | 10个 |
| 比赛总数 | 14场 | 32场 |
| 第一轮 | 4场BO1 | 8场BO1 |
| 第二轮 | 1-0(2场)+0-1(2场) | 1-0(4场)+0-1(4场) |
| 第三轮 | 1-1(2场)+0-2(1场)+2-0(提前) | 2-0(2场)+1-1(4场)+0-2(2场) |
| 第四轮 | 1-2(3场循环) | 3-0(1场)+2-1(3场)+1-2(3场)+0-3(1场) |

**淘汰赛也从双败改为单败：**

| 对比项 | 现有代码 (双败) | 目标架构 (单败) |
|--------|----------------|----------------|
| 赛制 | 双败淘汰 | 单败淘汰 |
| 比赛场数 | 8场 | 7场 |
| 分组 | winners/losers/grand_finals | quarterfinals/semifinals/finals |

---

## 二、核心决策

### 2.1 晋级名单管理：改为自动计算

**决策：移除手动设置晋级名单功能，改为根据比赛结果自动计算**

**原因**：
1. 16队4轮赛制的晋级规则明确：
   - 3-0 战绩：直接晋级
   - 2-1 战绩：直接晋级
   - 1-2 战绩：待定（可能淘汰）
   - 0-3 战绩：直接淘汰
2. 瑞士轮结束后，可以根据所有比赛的 `swissRecord` 和 `winnerId` 自动计算出 top8 和 eliminated
3. 手动设置增加了复杂度且容易出错

**实现方式**：
```typescript
// 根据比赛结果自动计算晋级名单
function calculateAdvancement(matches: Match[]): SwissAdvancementResult {
  const teamRecords = new Map<string, { wins: number; losses: number }>();

  // 遍历所有瑞士轮比赛，统计每支队伍的战绩
  matches.filter(m => m.stage === 'swiss' && m.status === 'finished').forEach(match => {
    if (match.winnerId) {
      // 赢家增加胜场
      const winnerRecord = teamRecords.get(match.winnerId) || { wins: 0, losses: 0 };
      winnerRecord.wins++;
      teamRecords.set(match.winnerId, winnerRecord);

      // 输家增加负场
      const loserId = match.teamAId === match.winnerId ? match.teamBId : match.teamAId;
      const loserRecord = teamRecords.get(loserId) || { wins: 0, losses: 0 };
      loserRecord.losses++;
      teamRecords.set(loserId, loserRecord);
    }
  });

  // 按战绩排序，分出 top8 和 eliminated
  const sortedTeams = [...teamRecords.entries()]
    .map(([teamId, record]) => ({ teamId, record: `${record.wins}-${record.losses}` }))
    .sort((a, b) => {
      const [aWins, aLosses] = a.record.split('-').map(Number);
      const [bWins, bLosses] = b.record.split('-').map(Number);
      // 按胜率排序，相同胜率按胜场排序
      if (aWins !== bWins) return bWins - aWins;
      return bLosses - aLosses;
    });

  return {
    top8: sortedTeams.slice(0, 8).map(t => t.teamId),
    eliminated: sortedTeams.slice(8).map(t => t.teamId),
    rankings: sortedTeams.map((t, index) => ({ ...t, rank: index + 1 })),
  };
}
```

**影响范围**：
- 移除 `SwissStageVisualEditor.tsx` 中的晋级名单管理面板
- 移除 `advancementStore.ts` 中的 `moveTeam` 操作
- 保留 `getAllTeamIds()` 和 `getUnassignedTeams()` 用于数据完整性校验
- 前台 `SwissStage.tsx` 展示时直接使用计算结果

---

### 2.2 前后端模型统一

**原则：前端模型字段与后端保持一致，避免多余的映射转化**

**当前状态**：
- 后端 `Advancement` 接口：5分类 `{ winners2_0, winners2_1, losersBracket, eliminated3rd, eliminated0_3 }`
- 开发计划 v2.0 前端：`top8` 和 `eliminated` 简化结构

**决策：前后端同步修改为简化结构**

| 字段 | 后端当前 | 后端目标 | 前端当前 | 前端目标 |
|------|---------|---------|---------|---------|
| 结构 | 5分类 | 2分类 | 5分类 | 2分类 |
| top8 | - | winners2_0 + winners2_1 | - | top8 |
| eliminated | eliminated0_3 + eliminated3rd | eliminated | eliminated0_3 + eliminated3rd | eliminated |

**数据库迁移**：
```sql
-- 新增字段
ALTER TABLE advancement ADD COLUMN top8 TEXT DEFAULT '[]';
ALTER TABLE advancement ADD COLUMN eliminated TEXT DEFAULT '[]';

-- 迁移数据（可选，或清空重新计算）
-- UPDATE advancement SET
--   top8 = JSON(winners2_0 || winners2_1),
--   eliminated = JSON(eliminated0_3 || eliminated3rd);
```

---

## 三、完整修改清单

### 阶段一：后端类型定义修改（Backend Types）

#### 3.1.1 backend/src/modules/advancement/advancement.service.ts

**修改 `Advancement` 接口**：

```typescript
// 当前
export interface Advancement {
  winners2_0: string[];
  winners2_1: string[];
  losersBracket: string[];
  eliminated3rd: string[];
  eliminated0_3: string[];
}

// 修改为
export interface Advancement {
  top8: string[];        // 前8名晋级淘汰赛
  eliminated: string[];  // 被淘汰队伍
  rankings?: {           // 排名信息
    teamId: string;
    record: string;
    rank: number;
  }[];
}
```

**添加自动计算方法**：

```typescript
// 根据比赛结果自动计算晋级名单
async calculateFromMatches(matches: Match[]): Promise<Advancement> {
  const teamRecords = new Map<string, { wins: number; losses: number }>();

  // 遍历所有瑞士轮比赛，统计每支队伍的战绩
  matches
    .filter(m => m.stage === 'swiss' && m.status === 'finished')
    .forEach(match => {
      if (match.winnerId) {
        const winnerRecord = teamRecords.get(match.winnerId) || { wins: 0, losses: 0 };
        winnerRecord.wins++;
        teamRecords.set(match.winnerId, winnerRecord);

        const loserId = match.teamAId === match.winnerId ? match.teamBId : match.teamAId;
        const loserRecord = teamRecords.get(loserId) || { wins: 0, losses: 0 };
        loserRecord.losses++;
        teamRecords.set(loserId, loserRecord);
      }
    });

  // 按战绩排序
  const sortedTeams = [...teamRecords.entries()]
    .map(([teamId, record]) => ({ teamId, record: `${record.wins}-${record.losses}` }))
    .sort((a, b) => {
      const [aWins, aLosses] = a.record.split('-').map(Number);
      const [bWins, bLosses] = b.record.split('-').map(Number);
      if (aWins !== bWins) return bWins - aWins;
      return bLosses - aLosses;
    });

  return {
    top8: sortedTeams.slice(0, 8).map(t => t.teamId),
    eliminated: sortedTeams.slice(8).map(t => t.teamId),
    rankings: sortedTeams.map((t, index) => ({ ...t, rank: index + 1 })),
  };
}
```

---

#### 3.1.2 backend/src/modules/advancement/dto/update-advancement.dto.ts

**修改 DTO**：

```typescript
// 当前
export class UpdateAdvancementDto {
  winners2_0?: string[];
  winners2_1?: string[];
  losersBracket?: string[];
  eliminated3rd?: string[];
  eliminated0_3?: string[];
}

// 修改为
export class UpdateAdvancementDto {
  @ApiPropertyOptional({ description: '前8名晋级淘汰赛', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  top8?: string[];

  @ApiPropertyOptional({ description: '被淘汰队伍', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eliminated?: string[];
}
```

---

#### 3.1.3 backend/src/database/database.service.ts

**修改数据库表结构**：

```typescript
// 修改 advancement 表创建语句
await run(
  this.db,
  `
  CREATE TABLE IF NOT EXISTS advancement (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    top8 TEXT DEFAULT '[]',
    eliminated TEXT DEFAULT '[]',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
);

// 修改迁移逻辑（添加新字段）
const advancementMigration = {
  table: 'advancement',
  checks: [
    { column: 'top8', sql: 'ALTER TABLE advancement ADD COLUMN top8 TEXT DEFAULT \'[]\'' },
    { column: 'eliminated', sql: 'ALTER TABLE advancement ADD COLUMN eliminated TEXT DEFAULT \'[]\'' },
  ],
};

// 修改初始化默认数据
await run(
  this.db,
  `INSERT OR IGNORE INTO advancement (id, top8, eliminated) VALUES (1, '[]', '[]')`,
);
```

---

#### 3.1.4 backend/src/modules/matches/matches.service.ts

**修改 `Match` 接口和 `initSlots`**：

```typescript
// 修改 Match 接口
export interface Match {
  // ... 现有字段 ...
  boFormat?: 'BO1' | 'BO3' | 'BO5';  // 【新增】
  swissRound?: number;               // 【新增】
  eliminationBracket?: 'quarterfinals' | 'semifinals' | 'finals'; // 【修改】
}

// 修改 initSlots - 16队4轮赛制（32场瑞士轮）
async initSlots(): Promise<void> {
  const result = await this.databaseService.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM matches',
  );

  if (result.count > 0) {
    this.logger.log('Match slots already initialized');
    return;
  }

  // 瑞士轮槽位（32场）
  const swissSlots = [
    // 第一轮：0-0，8场 BO1
    { id: 'swiss-r1-1', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    { id: 'swiss-r1-2', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    { id: 'swiss-r1-3', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    { id: 'swiss-r1-4', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    { id: 'swiss-r1-5', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    { id: 'swiss-r1-6', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    { id: 'swiss-r1-7', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    { id: 'swiss-r1-8', round: 'Round 1', stage: 'swiss', swissRecord: '0-0', swissDay: 1, swissRound: 1, boFormat: 'BO1' },
    // 第二轮：1-0，4场 BO3
    { id: 'swiss-r2-h1', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    { id: 'swiss-r2-h2', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    { id: 'swiss-r2-h3', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    { id: 'swiss-r2-h4', round: 'Round 2 High', stage: 'swiss', swissRecord: '1-0', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    // 第二轮：0-1，4场 BO3
    { id: 'swiss-r2-l1', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    { id: 'swiss-r2-l2', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    { id: 'swiss-r2-l3', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    { id: 'swiss-r2-l4', round: 'Round 2 Low', stage: 'swiss', swissRecord: '0-1', swissDay: 2, swissRound: 2, boFormat: 'BO3' },
    // 第三轮：2-0，2场 BO3
    { id: 'swiss-r3-h1', round: 'Round 3 High', stage: 'swiss', swissRecord: '2-0', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    { id: 'swiss-r3-h2', round: 'Round 3 High', stage: 'swiss', swissRecord: '2-0', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    // 第三轮：1-1，4场 BO3
    { id: 'swiss-r3-m1', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    { id: 'swiss-r3-m2', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    { id: 'swiss-r3-m3', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    { id: 'swiss-r3-m4', round: 'Round 3 Mid', stage: 'swiss', swissRecord: '1-1', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    // 第三轮：0-2，2场 BO3
    { id: 'swiss-r3-l1', round: 'Round 3 Low', stage: 'swiss', swissRecord: '0-2', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    { id: 'swiss-r3-l2', round: 'Round 3 Low', stage: 'swiss', swissRecord: '0-2', swissDay: 3, swissRound: 3, boFormat: 'BO3' },
    // 第四轮：3-0，1场 BO3
    { id: 'swiss-r4-h1', round: 'Round 4 High', stage: 'swiss', swissRecord: '3-0', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    // 第四轮：2-1，3场 BO3
    { id: 'swiss-r4-mh1', round: 'Round 4 Mid-High', stage: 'swiss', swissRecord: '2-1', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    { id: 'swiss-r4-mh2', round: 'Round 4 Mid-High', stage: 'swiss', swissRecord: '2-1', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    { id: 'swiss-r4-mh3', round: 'Round 4 Mid-High', stage: 'swiss', swissRecord: '2-1', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    // 第四轮：1-2，3场 BO3
    { id: 'swiss-r4-ml1', round: 'Round 4 Mid-Low', stage: 'swiss', swissRecord: '1-2', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    { id: 'swiss-r4-ml2', round: 'Round 4 Mid-Low', stage: 'swiss', swissRecord: '1-2', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    { id: 'swiss-r4-ml3', round: 'Round 4 Mid-Low', stage: 'swiss', swissRecord: '1-2', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
    // 第四轮：0-3，1场 BO3
    { id: 'swiss-r4-l1', round: 'Round 4 Low', stage: 'swiss', swissRecord: '0-3', swissDay: 4, swissRound: 4, boFormat: 'BO3' },
  ];

  // 淘汰赛槽位（7场）
  const eliminationSlots = [
    // 四分之一决赛（4场）
    { id: 'elim-qf-1', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 1, boFormat: 'BO5' },
    { id: 'elim-qf-2', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 2, boFormat: 'BO5' },
    { id: 'elim-qf-3', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 3, boFormat: 'BO5' },
    { id: 'elim-qf-4', round: '四分之一决赛', stage: 'elimination', eliminationBracket: 'quarterfinals', eliminationGameNumber: 4, boFormat: 'BO5' },
    // 半决赛（2场）
    { id: 'elim-sf-1', round: '半决赛', stage: 'elimination', eliminationBracket: 'semifinals', eliminationGameNumber: 5, boFormat: 'BO5' },
    { id: 'elim-sf-2', round: '半决赛', stage: 'elimination', eliminationBracket: 'semifinals', eliminationGameNumber: 6, boFormat: 'BO5' },
    // 决赛（1场）
    { id: 'elim-f-1', round: '决赛', stage: 'elimination', eliminationBracket: 'finals', eliminationGameNumber: 7, boFormat: 'BO5' },
  ];

  // 插入槽位...
}
```

---

### 阶段二：前端类型定义修改（Frontend Types）

#### 3.2.1 frontend/src/types/index.ts

**Match 接口修改**：

```typescript
// 当前代码
export type EliminationBracket = 'winners' | 'losers' | 'grand_finals';

export interface Match {
  // ...
  swissRecord?: string;
  swissDay?: number;
  eliminationBracket?: EliminationBracket;
  eliminationGameNumber?: number;
}

// 修改为
export type EliminationBracket = 'quarterfinals' | 'semifinals' | 'finals';

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
  swissRecord?: string;      // 瑞士轮战绩: "0-0", "1-0", "0-1", "2-0", "1-1", "0-2", "3-0", "2-1", "1-2", "0-3"
  swissDay?: number;          // 瑞士轮第几天 (1-4)
  swissRound?: number;        // 瑞士轮第几轮 (1-4)【新增】
  boFormat?: 'BO1' | 'BO3' | 'BO5'; // 赛制格式【新增】
  eliminationGameNumber?: number;
  eliminationBracket?: EliminationBracket;
}
```

**SwissAdvancementResult 接口修改**：

```typescript
// 当前代码
export interface SwissAdvancementResult {
  winners2_0: string[];
  winners2_1: string[];
  losersBracket: string[];
  eliminated3rd: string[];
  eliminated0_3: string[];
}

// 修改为（与后端一致）
export interface SwissAdvancementResult {
  top8: string[];        // 前8名晋级淘汰赛
  eliminated: string[];  // 被淘汰队伍
  rankings?: {           // 排名信息
    teamId: string;
    record: string;
    rank: number;
  }[];
}
```

**AdvancementCategory 类型修改**：

```typescript
// 当前代码
export type AdvancementCategory =
  | 'winners2_0'
  | 'winners2_1'
  | 'losersBracket'
  | 'eliminated3rd'
  | 'eliminated0_3';

// 修改为
export type AdvancementCategory = 'top8' | 'eliminated';
```

---

#### 3.2.2 frontend/src/api/types.ts

**同步更新 API 类型**：

```typescript
// 如果有单独的 API 类型定义，也需要同步更新
```

---

### 阶段三：瑞士轮配置（Swiss Round Config）

#### 3.3.1 frontend/src/pages/admin/swissRoundSlots.ts

**完全重写**：

```typescript
export interface SwissRoundSlot {
  swissRecord: string;
  roundName: string;
  maxMatches: number;
}

// 16队4轮赛制，10个战绩分组
export const swissRoundSlots: SwissRoundSlot[] = [
  { swissRecord: '0-0', roundName: 'Round 1', maxMatches: 8 },
  { swissRecord: '1-0', roundName: 'Round 2 High', maxMatches: 4 },
  { swissRecord: '0-1', roundName: 'Round 2 Low', maxMatches: 4 },
  { swissRecord: '2-0', roundName: 'Round 3 High', maxMatches: 2 },
  { swissRecord: '1-1', roundName: 'Round 3 Mid', maxMatches: 4 },
  { swissRecord: '0-2', roundName: 'Round 3 Low', maxMatches: 2 },
  { swissRecord: '3-0', roundName: 'Round 4 High', maxMatches: 1 },
  { swissRecord: '2-1', roundName: 'Round 4 Mid-High', maxMatches: 3 },
  { swissRecord: '1-2', roundName: 'Round 4 Mid-Low', maxMatches: 3 },
  { swissRecord: '0-3', roundName: 'Round 4 Low', maxMatches: 1 },
];

export const getRoundFormat = (swissRecord: string): 'BO1' | 'BO3' => {
  return swissRecord === '0-0' ? 'BO1' : 'BO3';
};

export const getSlotByRecord = (swissRecord: string): SwissRoundSlot | undefined => {
  return swissRoundSlots.find(slot => slot.swissRecord === swissRecord);
};

export const getTotalSlots = (): number => {
  return swissRoundSlots.reduce((sum, slot) => sum + slot.maxMatches, 0);
};

// 新增辅助函数
export const getSwissRound = (swissRecord: string): number => {
  const round1Records = ['0-0'];
  const round2Records = ['1-0', '0-1'];
  const round3Records = ['2-0', '1-1', '0-2'];
  const round4Records = ['3-0', '2-1', '1-2', '0-3'];

  if (round1Records.includes(swissRecord)) return 1;
  if (round2Records.includes(swissRecord)) return 2;
  if (round3Records.includes(swissRecord)) return 3;
  if (round4Records.includes(swissRecord)) return 4;
  return 0;
};

export const isEliminated = (swissRecord: string): boolean => {
  return swissRecord === '0-3';
};

export const isQualified = (swissRecord: string): boolean => {
  return ['3-0', '2-1'].includes(swissRecord);
};
```

---

### 阶段四：晋级状态管理（Advancement Store）

#### 3.4.1 frontend/src/store/advancementStore.ts

**简化重构（移除手动编辑功能）**：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SwissAdvancementResult } from '@/types';

interface AdvancementStore {
  advancement: SwissAdvancementResult;
  lastUpdated: string;
  setAdvancement: (data: SwissAdvancementResult) => void;
  reset: () => void;
  restoreDefault: () => void;
  getAllTeamIds: () => string[];
  // 注意：移除了 moveTeam 和 getUnassignedTeams，因为不再需要手动管理
}

// 简化为只读存储
const defaultAdvancement: SwissAdvancementResult = {
  top8: [],
  eliminated: [],
  rankings: [],
};

export const useAdvancementStore = create<AdvancementStore>()(
  persist(
    (set, get) => ({
      advancement: defaultAdvancement,
      lastUpdated: new Date().toISOString(),

      setAdvancement: (data) =>
        set({
          advancement: data,
          lastUpdated: new Date().toISOString(),
        }),

      reset: () => {
        const persisted = localStorage.getItem('advancement-storage');
        if (persisted) {
          try {
            const data = JSON.parse(persisted);
            if (data.state) {
              set({
                advancement: data.state.advancement || defaultAdvancement,
                lastUpdated: data.state.lastUpdated || new Date().toISOString(),
              });
            }
          } catch (e) {
            console.error('Failed to parse advancement storage:', e);
          }
        }
      },

      restoreDefault: () =>
        set({
          advancement: defaultAdvancement,
          lastUpdated: new Date().toISOString(),
        }),

      getAllTeamIds: () => {
        const { advancement } = get();
        return [...advancement.top8, ...advancement.eliminated];
      },
    }),
    {
      name: 'advancement-storage',
      partialize: state => ({
        advancement: state.advancement,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// 移除 categoryConfig 和 categoryOrder，因为不再需要拖拽管理
```

**计算晋级名单的工具函数**：

```typescript
// 工具函数：根据比赛结果计算晋级名单
export function calculateAdvancement(matches: Match[], teams: Team[]): SwissAdvancementResult {
  const teamRecords = new Map<string, { wins: number; losses: number }>();

  // 初始化所有队伍的战绩
  teams.forEach(team => {
    teamRecords.set(team.id, { wins: 0, losses: 0 });
  });

  // 遍历所有瑞士轮比赛，统计每支队伍的战绩
  matches
    .filter(m => m.stage === 'swiss' && m.status === 'finished' && m.winnerId)
    .forEach(match => {
      const winnerRecord = teamRecords.get(match.winnerId!) || { wins: 0, losses: 0 };
      winnerRecord.wins++;
      teamRecords.set(match.winnerId!, winnerRecord);

      const loserId = match.teamAId === match.winnerId ? match.teamBId : match.teamAId;
      const loserRecord = teamRecords.get(loserId) || { wins: 0, losses: 0 };
      loserRecord.losses++;
      teamRecords.set(loserId, loserRecord);
    });

  // 按战绩排序
  const sortedTeams = [...teamRecords.entries()]
    .map(([teamId, record]) => ({ teamId, record: `${record.wins}-${record.losses}` }))
    .sort((a, b) => {
      const [aWins, aLosses] = a.record.split('-').map(Number);
      const [bWins, bLosses] = b.record.split('-').map(Number);
      if (aWins !== bWins) return bWins - aWins;
      return bLosses - aLosses;
    });

  return {
    top8: sortedTeams.slice(0, 8).map(t => t.teamId),
    eliminated: sortedTeams.slice(8).map(t => t.teamId),
    rankings: sortedTeams.map((t, index) => ({ ...t, rank: index + 1 })),
  };
}
```

---

### 阶段五：瑞士轮组件（Swiss Stage Components）

#### 3.5.1 frontend/src/components/features/SwissStage.tsx

**修改要点**：
- Props 中的 `advancement` 类型更新为 `{ top8, eliminated, rankings }`
- 分组过滤逻辑更新为10个战绩分组
- 晋�级展示改为2分类

---

#### 3.5.2 frontend/src/pages/admin/SwissStageVisualEditor.tsx

**重要变更：移除晋级名单管理面板**

```typescript
// 移除内容：
// - 拖拽团队移动功能
// - 晋级分类卡片（top8, eliminated 等）
// - 保存/重置晋级名单按钮

// 保留内容：
// - 比赛槽位编辑器（32场比赛）
// - 比赛编辑对话框
```

---

### 阶段六：淘汰赛组件（Elimination Components）

#### 3.6.1 frontend/src/components/features/eliminationConstants.ts

**完全重写（8队单败制）**：

```typescript
export const BOARD_WIDTH = 800;
export const BOARD_HEIGHT = 700;

export const ELIMINATION_POSITIONS = {
  qf1: { x: 20, y: 30 },
  qf2: { x: 20, y: 190 },
  qf3: { x: 20, y: 350 },
  qf4: { x: 20, y: 510 },
  sf1: { x: 300, y: 110 },
  sf2: { x: 300, y: 430 },
  f: { x: 580, y: 270 },
};

export const ELIMINATION_CONNECTORS = [
  { from: 'qf1' as const, to: 'sf1' as const },
  { from: 'qf2' as const, to: 'sf1' as const },
  { from: 'qf3' as const, to: 'sf2' as const },
  { from: 'qf4' as const, to: 'sf2' as const },
  { from: 'sf1' as const, to: 'f' as const },
  { from: 'sf2' as const, to: 'f' as const },
];

type GameKey = 'qf1' | 'qf2' | 'qf3' | 'qf4' | 'sf1' | 'sf2' | 'f';

export const GAME_KEYS: GameKey[] = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'f'];

export const createPlaceholderMatch = (gameNum?: number): Match => ({
  id: `placeholder-${gameNum ?? 'na'}`,
  teamAId: '',
  teamBId: '',
  scoreA: 0,
  scoreB: 0,
  winnerId: null,
  round: '',
  status: 'upcoming',
  startTime: '',
  stage: 'elimination',
  boFormat: 'BO5',
  eliminationGameNumber: gameNum,
  eliminationBracket: gameNum <= 4 ? 'quarterfinals' : gameNum <= 6 ? 'semifinals' : 'finals',
});
```

---

#### 3.6.2 frontend/src/components/features/EliminationStage.tsx

**完全重构（7场比赛）**：

```typescript
const GAME_NUMBER_TO_ID: Record<number, string> = {
  1: 'elim-qf-1',
  2: 'elim-qf-2',
  3: 'elim-qf-3',
  4: 'elim-qf-4',
  5: 'elim-sf-1',
  6: 'elim-sf-2',
  7: 'elim-f-1',
};

const BRACKET_NAMES: Record<string, string> = {
  quarterfinals: '四分之一决赛',
  semifinals: '半决赛',
  finals: '决赛',
};
```

---

### 阶段七：Mock数据（Mock Data）

#### 3.7.1 frontend/src/mock/data.ts

**完全重写**（参考前述开发计划 v2.0）

---

### 阶段八：其他文件修改

#### 3.8.1 frontend/src/pages/admin/Schedule.tsx

**修改内容**：
- 更新 `handleAdvancementUpdate` 适配新的 `top8/eliminated` 结构
- 添加自动计算晋级的触发逻辑（在所有瑞士轮比赛结束后）
- 更新初始化提示文案

#### 3.8.2 frontend/src/pages/admin/Teams.tsx

**新增内容**：
- 添加16支战队数量限制验证

---

## 四、开发优先级

### 第一阶段：后端修改（Day 1）
1. [ ] 修改 `advancement.service.ts` - 接口和计算逻辑
2. [ ] 修改 `update-advancement.dto.ts` - DTO
3. [ ] 修改 `database.service.ts` - 数据库结构
4. [ ] 修改 `matches.service.ts` - Match 接口和 initSlots

### 第二阶段：前端类型和配置（Day 1-2）
5. [ ] 更新 `types/index.ts` - Match, SwissAdvancementResult
6. [ ] 更新 API 类型定义
7. [ ] 重写 `swissRoundSlots.ts` - 10个战绩分组

### 第三阶段：前端组件（Day 2-4）
8. [ ] 简化 `advancementStore.ts` - 移除手动编辑
9. [ ] 重写 `SwissStage.tsx` - 10分组布局
10. [ ] 修改 `SwissStageVisualEditor.tsx` - 移除晋级管理面板
11. [ ] 重写 `eliminationConstants.ts` - 7位置单败制
12. [ ] 重写 `EliminationConnectors.tsx` - 单败连线
13. [ ] 重写 `EliminationStage.tsx` - 8队单败展示

### 第四阶段：数据和集成（Day 4-5）
14. [ ] 重写 `mock/data.ts` - 16队数据
15. [ ] 更新 `Schedule.tsx`
16. [ ] 添加16队限制验证
17. [ ] 集成测试

---

## 五、文件修改清单汇总

### 后端文件（P0）

| 序号 | 文件路径 | 修改类型 | 优先级 |
|------|---------|---------|--------|
| 1 | `modules/advancement/advancement.service.ts` | 接口修改 + 新增计算逻辑 | P0 |
| 2 | `modules/advancement/dto/update-advancement.dto.ts` | DTO修改 | P0 |
| 3 | `database/database.service.ts` | 数据库结构修改 | P0 |
| 4 | `modules/matches/matches.service.ts` | Match接口 + initSlots | P0 |

### 前端文件（P0/P1）

| 序号 | 文件路径 | 修改类型 | 优先级 |
|------|---------|---------|--------|
| 5 | `types/index.ts` | 接口修改 | P0 |
| 6 | `api/types.ts` | API类型同步 | P1 |
| 7 | `pages/admin/swissRoundSlots.ts` | 完全重写 | P0 |
| 8 | `store/advancementStore.ts` | 简化重构 | P0 |
| 9 | `components/features/SwissStage.tsx` | 完全重构 | P0 |
| 10 | `pages/admin/SwissStageVisualEditor.tsx` | 部分修改（移除晋级管理） | P0 |
| 11 | `components/features/eliminationConstants.ts` | 完全重写 | P0 |
| 12 | `components/features/EliminationStage.tsx` | 完全重构 | P0 |
| 13 | `components/features/EliminationConnectors.tsx` | 完全重写 | P0 |
| 14 | `mock/data.ts` | 完全重写 | P0 |
| 15 | `pages/admin/Schedule.tsx` | 部分修改 | P1 |
| 16 | `pages/admin/Teams.tsx` | 新增验证 | P1 |

---

## 六、验收标准

### 晋级逻辑验收（新增）
- [ ] 瑞士轮比赛结束后可自动计算 top8 和 eliminated
- [ ] 无需手动设置晋级名单
- [ ] 晋级结果可根据比赛结果实时更新

### 瑞士轮验收
- [ ] 正确显示10个战绩分组
- [ ] 第一轮显示BO1标识
- [ ] 其他轮次显示BO3标识
- [ ] 16支战队完整展示

### 淘汰赛验收
- [ ] 正确显示8队单败赛制（4QF + 2SF + 1F）
- [ ] 所有比赛显示BO5标识
- [ ] 正确显示7场比赛位置
- [ ] 连接线正确连接

### 管理后台验收
- [ ] 战队管理限制为最多16支
- [ ] 瑞士轮编辑器支持32场比赛配置
- [ ] 淘汰赛编辑器支持7场比赛配置
- [ ] 数据管理功能正常

### 性能验收
- [ ] 页面加载时间 < 2秒
- [ ] 赛程区域渲染流畅

---

## 七、E2E测试设计（为后续E2E编写做准备）

### 7.1 关键设计原则

根据TDD工作流，E2E测试需要：
1. **测试数据属性（Data Attributes）**：所有交互元素必须添加 `data-testid`
2. **语义化选择器**：使用 `data-testid` 而不是 CSS 类名或 XPath
3. **Page Object模式**：每个页面有独立的 Page Object 类
4. **测试隔离**：每个测试独立设置数据，不依赖其他测试

### 7.2 需要添加的 Data Test ID

#### 赛程管理页面 (`/admin/schedule`)

| 元素 | data-testid | 说明 |
|------|-------------|------|
| 瑞士轮Tab | `swiss-tab` | 已存在 |
| 淘汰赛Tab | `elimination-tab` | 已存在 |
| 瑞士轮阶段编辑器 | `swiss-stage-editor` | 已存在 |
| 晋级面板 | `advancement-panel` | **需移除**（晋级自动计算） |
| 晋级状态 | `advancement-status` | **新增**：显示"自动计算"状态 |

**瑞士轮比赛卡片**（32场比赛，每场需要唯一标识）：
```
swiss-match-card-{swissRecord}-{index}
// 例如: swiss-match-card-0-0-1, swiss-match-card-0-0-2, ...
// 或: swiss-match-card-r1-1, swiss-match-card-r1-2, ...
```

**淘汰赛比赛卡片**（7场比赛）：
```
elim-match-card-{bracket}-{index}
// 例如: elim-match-card-quarterfinals-1, elim-match-card-semifinals-1, elim-match-card-finals-1
```

#### 前台首页 (`/`)

| 元素 | data-testid | 说明 |
|------|-------------|------|
| 英雄区域 | `hero-section` | 已存在 |
| 战队区域 | `teams-section` | 已存在 |
| 赛程区域 | `schedule-section` | 已存在 |
| 瑞士轮Tab | `home-swiss-tab` | **新增** |
| 淘汰赛Tab | `home-elimination-tab` | **新增** |
| 瑞士轮展示组件 | `swiss-stage-display` | **新增** |
| 淘汰赛展示组件 | `elimination-stage-display` | **新增** |

#### 战队管理页面 (`/admin/teams`)

| 元素 | data-testid | 说明 |
|------|-------------|------|
| 战队卡片 | `team-card-{teamId}` | **新增**：用于E2E唯一标识 |
| 添加战队按钮 | `add-team-button` | 已存在 |
| 战队数量限制提示 | `team-limit-warning` | **新增**：当添加第17支战队时显示 |

### 7.3 E2E测试用例设计

#### 7.3.1 瑞士轮赛制测试

```typescript
// tests/e2e/specs/swiss-stage.spec.ts

test.describe('瑞士轮16队赛制 E2E', () => {
  
  /**
   * 瑞士轮第一轮展示验证
   * 验证10个战绩分组正确显示
   */
  test('瑞士轮 - 10个战绩分组展示 @P0', async ({ page }) => {
    await page.goto('/');
    
    // 验证瑞士轮Tab可见
    await expect(page.getByTestId('home-swiss-tab')).toBeVisible();
    await page.getByTestId('home-swiss-tab').click();
    
    // 验证所有10个战绩分组可见
    const recordGroups = [
      '0-0', '1-0', '0-1', '2-0', '1-1', '0-2',
      '3-0', '2-1', '1-2', '0-3'
    ];
    
    for (const record of recordGroups) {
      const group = page.getByTestId(`swiss-record-group-${record}`);
      await expect(group).toBeVisible();
    }
  });
  
  /**
   * 瑞士轮BO赛制标识验证
   * 验证第一轮显示BO1，其他显示BO3
   */
  test('瑞士轮 - BO赛制标识 @P0', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('home-swiss-tab').click();
    
    // 验证第一轮BO1
    const round1Matches = page.getByTestId('swiss-record-group-0-0')
      .getByTestId(/swiss-match-card-/);
    await expect(round1Matches.first().getByText('BO1')).toBeVisible();
    
    // 验证第二轮BO3
    const round2Matches = page.getByTestId('swiss-record-group-1-0')
      .getByTestId(/swiss-match-card-/);
    await expect(round2Matches.first().getByText('BO3')).toBeVisible();
  });
  
  /**
   * 瑞士轮32场比赛槽位初始化
   */
  test('瑞士轮 - 32场比赛槽位初始化 @P0', async ({ page }) => {
    await page.goto('/admin/schedule');
    await page.getByTestId('swiss-tab').click();
    
    // 验证总比赛数量
    const matchCount = await page.getByTestId('schedule-match-count').textContent();
    expect(matchCount).toContain('32');
    
    // 验证各分组比赛数量
    const round1Count = await page.getByTestId('swiss-record-group-0-0')
      .getByTestId(/swiss-match-card-/).count();
    expect(round1Count).toBe(8);
  });
});
```

#### 7.3.2 淘汰赛单败赛制测试

```typescript
// tests/e2e/specs/elimination-stage.spec.ts

test.describe('淘汰赛单败赛制 E2E', () => {
  
  /**
   * 淘汰赛7场比赛展示验证
   */
  test('淘汰赛 - 7场比赛展示 @P0', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('home-elimination-tab').click();
    
    // 验证四分之一决赛（4场）
    for (let i = 1; i <= 4; i++) {
      await expect(page.getByTestId(`elim-match-card-quarterfinals-${i}`)).toBeVisible();
    }
    
    // 验证半决赛（2场）
    for (let i = 1; i <= 2; i++) {
      await expect(page.getByTestId(`elim-match-card-semifinals-${i}`)).toBeVisible();
    }
    
    // 验证决赛（1场）
    await expect(page.getByTestId(`elim-match-card-finals-1`)).toBeVisible();
  });
  
  /**
   * 淘汰赛BO5赛制标识验证
   */
  test('淘汰赛 - 所有比赛显示BO5标识 @P0', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('home-elimination-tab').click();
    
    // 验证所有7场比赛都显示BO5
    const allElimMatches = page.getByTestId('elimination-stage-display')
      .getByTestId(/elim-match-card-/);
    
    const matchCount = await allElimMatches.count();
    expect(matchCount).toBe(7);
    
    // 每个比赛卡片都应该有BO5标识
    for (let i = 0; i < matchCount; i++) {
      await expect(allElimMatches.nth(i).getByText('BO5')).toBeVisible();
    }
  });
  
  /**
   * 淘汰赛连接线验证
   */
  test('淘汰赛 - 连接线正确连接 @P0', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('home-elimination-tab').click();
    
    // 验证QF1/QF2 -> SF1的连接线
    await expect(page.getByTestId('connector-qf1-sf1')).toBeVisible();
    await expect(page.getByTestId('connector-qf2-sf1')).toBeVisible();
    
    // 验证QF3/QF4 -> SF2的连接线
    await expect(page.getByTestId('connector-qf3-sf2')).toBeVisible();
    await expect(page.getByTestId('connector-qf4-sf2')).toBeVisible();
    
    // 验证SF1/SF2 -> F的连接线
    await expect(page.getByTestId('connector-sf1-f')).toBeVisible();
    await expect(page.getByTestId('connector-sf2-f')).toBeVisible();
  });
});
```

#### 7.3.3 晋级自动计算测试

```typescript
// tests/e2e/specs/advancement-auto.spec.ts

test.describe('晋级名单自动计算 E2E', () => {
  
  /**
   * 晋级状态显示验证
   */
  test('晋级 - 自动计算状态显示 @P0', async ({ page }) => {
    await page.goto('/admin/schedule');
    await page.getByTestId('swiss-tab').click();
    
    // 验证晋级面板显示"自动计算"状态
    const statusText = await page.getByTestId('advancement-status').textContent();
    expect(statusText).toContain('自动计算');
    
    // 验证不再有手动拖拽的分类卡片
    const categories = ['winners2_0', 'winners2_1', 'losersBracket', 'eliminated3rd', 'eliminated0_3'];
    for (const cat of categories) {
      await expect(page.getByTestId(`advancement-category-${cat}`)).not.toBeVisible();
    }
  });
  
  /**
   * 晋级名单根据比赛结果自动更新
   */
  test('晋级 - 比赛结果更新后自动重新计算 @P1', async ({ page }) => {
    await page.goto('/admin/schedule');
    await page.getByTestId('swiss-tab').click();
    
    // 编辑第一轮某场比赛结果
    const matchCard = page.getByTestId('swiss-match-card-r1-1');
    await matchCard.click();
    
    // 设置比分和胜者
    await page.getByTestId('score-a-input').fill('3');
    await page.getByTestId('score-b-input').fill('1');
    await page.getByTestId('winner-select').selectOption('teamA');
    await page.getByTestId('save-match-button').click();
    
    // 验证晋级名单自动更新
    // （具体验证逻辑根据UI实现而定）
    await page.waitForTimeout(500);
  });
});
```

#### 7.3.4 16队战队限制测试

```typescript
// tests/e2e/specs/team-limit.spec.ts

test.describe('16队战队限制 E2E', () => {
  
  /**
   * 添加第16支战队成功
   */
  test('战队限制 - 第16支战队添加成功 @P0', async ({ page }) => {
    await page.goto('/admin/teams');
    
    // 获取当前战队数量
    const initialCount = await page.getByTestId('team-list').getByTestId(/team-card-/).count();
    
    // 添加新战队
    await page.getByTestId('add-team-button').click();
    await page.getByTestId('team-name-input').fill('Test Team 16');
    await page.getByTestId('save-team-button').click();
    
    // 验证添加成功
    const newCount = await page.getByTestId('team-list').getByTestId(/team-card-/).count();
    expect(newCount).toBe(initialCount + 1);
  });
  
  /**
   * 添加第17支战队被阻止
   */
  test('战队限制 - 第17支战队添加被阻止 @P0', async ({ page }) => {
    await page.goto('/admin/teams');
    
    // 确保已有16支战队（通过fixture或测试数据准备）
    
    // 尝试添加第17支战队
    await page.getByTestId('add-team-button').click();
    await page.getByTestId('team-name-input').fill('Test Team 17');
    await page.getByTestId('save-team-button').click();
    
    // 验证限制提示出现
    await expect(page.getByTestId('team-limit-warning')).toBeVisible();
    await expect(page.getByTestId('team-limit-warning')).toContainText('16');
    
    // 验证战队数量未增加
    const count = await page.getByTestId('team-list').getByTestId(/team-card-/).count();
    expect(count).toBe(16);
  });
});
```

### 7.4 现有E2E测试需修改的部分

由于架构变更，以下现有测试需要修改：

| 测试文件 | 需要修改的内容 |
|---------|--------------|
| `05-schedule.spec.ts` | - 晋级分类从5个改为2个（top8/eliminated）<br>- 移除TEST-111和TEST-112中的拖拽测试<br>- 更新match count预期（14场→32场瑞士轮） |
| `06-advancement.spec.ts` | - 移除整个文件的拖拽相关测试<br>- 添加晋级自动计算验证测试<br>- 更新分类选择器 |
| `03-teams.spec.ts` | - 添加16队限制测试 |

### 7.5 Page Object 更新

```typescript
// tests/e2e/pages/SchedulePage.ts 更新

export class SchedulePage extends BasePage {
  // ... 现有代码 ...
  
  // 新增：晋级状态
  readonly advancementStatus: Locator;
  
  // 新增：瑞士轮比赛卡片定位器
  getSwissMatchCard(swissRecord: string, index: number): Locator {
    return this.page.getByTestId(`swiss-match-card-${swissRecord}-${index}`);
  }
  
  // 新增：淘汰赛比赛卡片定位器
  getElimMatchCard(bracket: string, index: number): Locator {
    return this.page.getByTestId(`elim-match-card-${bracket}-${index}`);
  }
}
```

---

**文档状态**：⏳ 待审核
**审核状态**：⏳ 待审核
**开发优先级**：🔥 高优先级