# 开发计划 - 参照LOL S赛修改赛程

> 版本: v2.0
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

## 二、完整修改清单

### 阶段一：类型定义修改（Types）

#### 2.1.1 frontend/src/types/index.ts

**Match 接口修改**：

```typescript
// 当前代码
export type MatchStage = 'swiss' | 'elimination';
export type EliminationBracket = 'winners' | 'losers' | 'grand_finals';

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
  swissRecord?: string; // 如 "0-0", "1-0", "0-1", "1-1", "0-2", "1-2", "2-0", "2-1"
  swissDay?: number;
  eliminationGameNumber?: number;
  eliminationBracket?: EliminationBracket;
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
  swissRecord?: string; // 瑞士轮战绩: "0-0", "1-0", "0-1", "2-0", "1-1", "0-2", "3-0", "2-1", "1-2", "0-3"
  swissDay?: number;     // 瑞士轮第几天 (1-4)
  swissRound?: number;   // 瑞士轮第几轮 (1-4)【新增】
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

// 修改为
export interface SwissAdvancementResult {
  top8: string[];        // 前8名晋级淘汰赛
  eliminated: string[];  // 被淘汰队伍
  rankings?: {           // 排名信息【新增】
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

### 阶段二：瑞士轮配置（Swiss Round Config）

#### 2.2.1 frontend/src/pages/admin/swissRoundSlots.ts

**完全重写**：

```typescript
export interface SwissRoundSlot {
  swissRecord: string;
  roundName: string;
  maxMatches: number;
}

// 完全重写：16队4轮赛制，10个战绩分组
export const swissRoundSlots: SwissRoundSlot[] = [
  // ========== 第一轮 ==========
  { swissRecord: '0-0', roundName: 'Round 1', maxMatches: 8 },
  // 第一轮：16支队伍随机配对，8场BO1

  // ========== 第二轮 ==========
  { swissRecord: '1-0', roundName: 'Round 2 High', maxMatches: 4 },
  // 第一轮1-0战绩的8支队伍，高组BO3
  { swissRecord: '0-1', roundName: 'Round 2 Low', maxMatches: 4 },
  // 第一轮0-1战绩的8支队伍，低组BO3

  // ========== 第三轮 ==========
  { swissRecord: '2-0', roundName: 'Round 3 High', maxMatches: 2 },
  // 第二轮2-0战绩，2场BO3
  { swissRecord: '1-1', roundName: 'Round 3 Mid', maxMatches: 4 },
  // 第二轮1-1战绩，4场BO3
  { swissRecord: '0-2', roundName: 'Round 3 Low', maxMatches: 2 },
  // 第二轮0-2战绩，2场BO3

  // ========== 第四轮 ==========
  { swissRecord: '3-0', roundName: 'Round 4 High', maxMatches: 1 },
  // 3-0战绩，1场BO3
  { swissRecord: '2-1', roundName: 'Round 4 Mid-High', maxMatches: 3 },
  // 2-1战绩，3场BO3
  { swissRecord: '1-2', roundName: 'Round 4 Mid-Low', maxMatches: 3 },
  // 1-2战绩，3场BO3
  { swissRecord: '0-3', roundName: 'Round 4 Low', maxMatches: 1 },
  // 0-3战绩，1场BO3
];

export const getRoundFormat = (swissRecord: string): 'BO1' | 'BO3' => {
  return swissRecord === '0-0' ? 'BO1' : 'BO3';
};

export const getSlotByRecord = (swissRecord: string): SwissRoundSlot | undefined => {
  return swissRoundSlots.find(slot => slot.swissRecord === swissRecord);
};

// 计算总槽位数：8 + 4 + 4 + 2 + 4 + 2 + 1 + 3 + 3 + 1 = 32
export const getTotalSlots = (): number => {
  return swissRoundSlots.reduce((sum, slot) => sum + slot.maxMatches, 0);
};

// 【新增】根据战绩获取轮次
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

// 【新增】判断是否已淘汰
export const isEliminated = (swissRecord: string): boolean => {
  return swissRecord === '0-3';
};

// 【新增】判断是否已晋级
export const isQualified = (swissRecord: string): boolean => {
  return ['3-0', '2-1'].includes(swissRecord);
};
```

---

### 阶段三：晋级状态管理（Advancement Store）

#### 2.3.1 frontend/src/store/advancementStore.ts

**完全重构**：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SwissAdvancementResult, AdvancementCategory } from '@/types';

interface AdvancementStore {
  advancement: SwissAdvancementResult;
  lastUpdated: string;
  updatedBy: string;
  setAdvancement: (data: SwissAdvancementResult, user: string) => void;
  moveTeam: (teamId: string, from: AdvancementCategory | null, to: AdvancementCategory) => void;
  reset: () => void;
  restoreDefault: () => void;
  getAllTeamIds: () => string[];
  getUnassignedTeams: (allTeamIds: string[]) => string[];
}

// 完全重构：简化为 top8 和 eliminated 两个分类
const defaultAdvancement: SwissAdvancementResult = {
  top8: [],      // 前8名晋级淘汰赛
  eliminated: [], // 被淘汰队伍
  rankings: [],
};

export const useAdvancementStore = create<AdvancementStore>()(
  persist(
    (set, get) => ({
      advancement: defaultAdvancement,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system',

      setAdvancement: (data, user) =>
        set({
          advancement: data,
          lastUpdated: new Date().toISOString(),
          updatedBy: user,
        }),

      moveTeam: (teamId, from, to) => {
        const { advancement } = get();
        const newAdvancement = { ...advancement };

        if (from && newAdvancement[from].includes(teamId)) {
          newAdvancement[from] = newAdvancement[from].filter(id => id !== teamId);
        }

        if (!newAdvancement[to].includes(teamId)) {
          newAdvancement[to] = [...newAdvancement[to], teamId];
        }

        set({
          advancement: newAdvancement,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin',
        });
      },

      reset: () => {
        const persisted = localStorage.getItem('advancement-storage');
        if (persisted) {
          try {
            const data = JSON.parse(persisted);
            if (data.state) {
              set({
                advancement: data.state.advancement || defaultAdvancement,
                lastUpdated: data.state.lastUpdated || new Date().toISOString(),
                updatedBy: data.state.updatedBy || 'system',
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
          updatedBy: 'system',
        }),

      // 重构：只从 top8 和 eliminated 获取
      getAllTeamIds: () => {
        const { advancement } = get();
        return [...advancement.top8, ...advancement.eliminated];
      },

      getUnassignedTeams: (allTeamIds: string[]) => {
        const assignedIds = get().getAllTeamIds();
        return allTeamIds.filter(id => !assignedIds.includes(id));
      },
    }),
    {
      name: 'advancement-storage',
      partialize: state => ({
        advancement: state.advancement,
        lastUpdated: state.lastUpdated,
        updatedBy: state.updatedBy,
      }),
    }
  )
);

// 完全重构：只有两个分类
export const categoryConfig: Record<
  AdvancementCategory,
  { label: string; color: string; description: string }
> = {
  top8: {
    label: '前8名晋级淘汰赛',
    color: 'bg-green-500',
    description: '瑞士轮前8名晋级淘汰赛',
  },
  eliminated: {
    label: '淘汰',
    color: 'bg-red-500',
    description: '未进入前8名，被淘汰',
  },
};

export const categoryOrder: AdvancementCategory[] = ['top8', 'eliminated'];
```

---

### 阶段四：瑞士轮组件（Swiss Stage Components）

#### 2.4.1 frontend/src/components/features/SwissStage.tsx

**接口修改**：

```typescript
// 当前 Props
interface SwissStageProps {
  matches: Match[];
  teams: Team[];
  advancement?: {
    winners2_0: string[];
    winners2_1: string[];
    losersBracket: string[];
    eliminated3rd: string[];
    eliminated0_3: string[];
  };
}

// 修改为
interface SwissStageProps {
  matches: Match[];
  teams: Team[];
  advancement?: {
    top8: string[];
    eliminated: string[];
    rankings?: { teamId: string; record: string; rank: number }[];
  };
}
```

**完全重构组件逻辑**：

```typescript
// 替换现有的分组过滤逻辑
const round1Matches = matches.filter(m => m.swissRecord === '0-0');
const round2High = matches.filter(m => m.swissRecord === '1-0');
const round2Low = matches.filter(m => m.swissRecord === '0-1');
const round3High = matches.filter(m => m.swissRecord === '2-0');
const round3Mid = matches.filter(m => m.swissRecord === '1-1');
const round3Low = matches.filter(m => m.swissRecord === '0-2');
const round4High = matches.filter(m => m.swissRecord === '3-0');
const round4MidHigh = matches.filter(m => m.swissRecord === '2-1');
const round4MidLow = matches.filter(m => m.swissRecord === '1-2');
const round4Low = matches.filter(m => m.swissRecord === '0-3');
```

**UI 结构调整**（10个分组横向排列）：

```typescript
// 布局结构：
// Round 1 | Round 2 High | Round 3 High      |
//         | Round 2 Low  | Round 3 Mid        | Round 4 High  |
//                      | Round 3 Low   | Round 4 Mid-High  |
//                                   | Round 4 Mid-Low   |
//                                                | Round 4 Low  |
```

**晋�级展示修改**：

```typescript
// 替换原有的5分类展示为2分类
<div className="flex flex-col gap-2" data-testid="swiss-record-group-top8">
  <SwissStatusBadge type="qualified">前8名晋级</SwissStatusBadge>
  <SwissTeamList teams={teams} ids={advancement.top8} />
</div>

<div className="flex flex-col gap-2" data-testid="swiss-record-group-eliminated">
  <SwissStatusBadge type="eliminated">淘汰</SwissStatusBadge>
  <SwissTeamList teams={teams} ids={advancement.eliminated} />
</div>
```

---

#### 2.4.2 frontend/src/components/features/swiss/SwissMatchCard.tsx

**修改内容**：
- 如果比赛还未开始（`status === 'upcoming'`），显示 `BO1` 或 `BO3` 标识
- 根据 `boFormat` 字段显示赛制标识（如果存在）

---

### 阶段五：淘汰赛组件（Elimination Components）

#### 2.5.1 frontend/src/components/features/eliminationConstants.ts

**完全重写**：

```typescript
import { Match } from '@/types';

// 画布尺寸（适配8队单败制）
export const BOARD_WIDTH = 800;
export const BOARD_HEIGHT = 700;

// 8队单败制：7场比赛位置
export const ELIMINATION_POSITIONS = {
  // 四分之一决赛（4场）
  qf1: { x: 20, y: 30 },
  qf2: { x: 20, y: 190 },
  qf3: { x: 20, y: 350 },
  qf4: { x: 20, y: 510 },
  // 半决赛（2场）
  sf1: { x: 300, y: 110 },
  sf2: { x: 300, y: 430 },
  // 决赛（1场）
  f: { x: 580, y: 270 },
};

// 连接线配置
export const ELIMINATION_CONNECTORS = [
  // QF1 -> SF1
  { from: 'qf1' as const, to: 'sf1' as const },
  // QF2 -> SF1
  { from: 'qf2' as const, to: 'sf1' as const },
  // QF3 -> SF2
  { from: 'qf3' as const, to: 'sf2' as const },
  // QF4 -> SF2
  { from: 'qf4' as const, to: 'sf2' as const },
  // SF1 -> F
  { from: 'sf1' as const, to: 'f' as const },
  // SF2 -> F
  { from: 'sf2' as const, to: 'f' as const },
];

// 游戏键类型
type GameKey = 'qf1' | 'qf2' | 'qf3' | 'qf4' | 'sf1' | 'sf2' | 'f';

export const GAME_KEYS: GameKey[] = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'f'];

// 占位比赛数据生成
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
  boFormat: 'BO5',  // 所有淘汰赛都是BO5
  eliminationGameNumber: gameNum,
  eliminationBracket: gameNum <= 4 ? 'quarterfinals' : gameNum <= 6 ? 'semifinals' : 'finals',
});

export const getPositionByGameKey = (key: GameKey) => {
  return ELIMINATION_POSITIONS[key];
};
```

---

#### 2.5.2 frontend/src/components/features/EliminationStage.tsx

**完全重构**：

```typescript
// 游戏编号到ID的映射（7场比赛）
const GAME_NUMBER_TO_ID: Record<number, string> = {
  1: 'elim-qf-1',
  2: 'elim-qf-2',
  3: 'elim-qf-3',
  4: 'elim-qf-4',
  5: 'elim-sf-1',
  6: 'elim-sf-2',
  7: 'elim-f-1',
};

// 阶段名称映射
const BRACKET_NAMES: Record<string, string> = {
  quarterfinals: '四分之一决赛',
  semifinals: '半决赛',
  finals: '决赛',
};

// renderMatch 调用更新（7场比赛）
// 移除 g5-g8 相关的渲染
```

**UI 调整**：
- 移除双败制的 losers bracket 展示
- 添加 BO5 标识显示
- 更新连接线样式（从双败的L形改为单败的直线）

---

#### 2.5.3 frontend/src/components/features/BracketMatchCard.tsx

**修改内容**：
- 添加 `boFormat` 字段显示（默认显示 BO5）
- 简化双败相关的逻辑分支

---

#### 2.5.4 frontend/src/components/features/EditableBracketMatchCard.tsx

**修改内容**：
- 适配新的 `eliminationBracket` 类型
- 移除双败制相关的编辑逻辑

---

#### 2.5.5 frontend/src/components/features/EliminationConnectors.tsx

**完全重构**：
- 从双败连接器（8个位置，复杂L形连线）改为单败连接器（7个位置，简单直线连线）

---

### 阶段六：管理后台组件（Admin Components）

#### 2.6.1 frontend/src/pages/admin/SwissStageVisualEditor.tsx

**Props 接口修改**：

```typescript
// 当前
interface SwissStageVisualEditorProps {
  // ...
  advancement: {
    winners2_0: string[];
    winners2_1: string[];
    losersBracket: string[];
    eliminated3rd: string[];
    eliminated0_3: string[];
  };
  onAdvancementUpdate: (advancement: {
    winners2_0: string[];
    winners2_1: string[];
    losersBracket: string[];
    eliminated3rd: string[];
    eliminated0_3: string[];
  }) => void;
}

// 修改为
interface SwissStageVisualEditorProps {
  // ...
  advancement: {
    top8: string[];
    eliminated: string[];
  };
  onAdvancementUpdate: (advancement: {
    top8: string[];
    eliminated: string[];
  }) => void;
}
```

**布局调整**（10个分组）：
- 当前6个分组扩展为10个分组
- 需要更大的横向滚动区域
- 建议最小宽度从 1400px 增加到 1800px

**晋级名单管理面板**：
- 从5个分类卡片简化为2个分类卡片
- 调整拖拽逻辑

---

### 阶段七：Mock数据（Mock Data）

#### 2.7.1 frontend/src/mock/data.ts

**完全重写 swissMatches**（32场比赛）：

```typescript
// 第一轮：8场 BO1
const round1Matches: Match[] = [
  { id: 'swiss-r1-1', teamAId: 'team1', teamBId: 'team16', /* ... */ swissRecord: '0-0', boFormat: 'BO1' },
  { id: 'swiss-r1-2', teamAId: 'team2', teamBId: 'team15', /* ... */ swissRecord: '0-0', boFormat: 'BO1' },
  // ... 共8场
];

// 第二轮：8场 BO3
const round2Matches: Match[] = [
  // 1-0 组：4场
  { id: 'swiss-r2-h1', /* ... */ swissRecord: '1-0', boFormat: 'BO3' },
  // 0-1 组：4场
  { id: 'swiss-r2-l1', /* ... */ swissRecord: '0-1', boFormat: 'BO3' },
];

// 第三轮：8场 BO3
const round3Matches: Match[] = [
  // 2-0 组：2场
  { id: 'swiss-r3-h1', /* ... */ swissRecord: '2-0', boFormat: 'BO3' },
  // 1-1 组：4场
  { id: 'swiss-r3-m1', /* ... */ swissRecord: '1-1', boFormat: 'BO3' },
  // 0-2 组：2场
  { id: 'swiss-r3-l1', /* ... */ swissRecord: '0-2', boFormat: 'BO3' },
];

// 第四轮：8场 BO3
const round4Matches: Match[] = [
  // 3-0 组：1场
  { id: 'swiss-r4-h1', /* ... */ swissRecord: '3-0', boFormat: 'BO3' },
  // 2-1 组：3场
  { id: 'swiss-r4-mh1', /* ... */ swissRecord: '2-1', boFormat: 'BO3' },
  // 1-2 组：3场
  { id: 'swiss-r4-ml1', /* ... */ swissRecord: '1-2', boFormat: 'BO3' },
  // 0-3 组：1场
  { id: 'swiss-r4-l1', /* ... */ swissRecord: '0-3', boFormat: 'BO3' },
];

export const swissMatches: Match[] = [
  ...round1Matches,
  ...round2Matches,
  ...round3Matches,
  ...round4Matches,
];
```

**完全重写 eliminationMatches**（7场比赛）：

```typescript
// 四分之一决赛：4场 BO5
const quarterFinals: Match[] = [
  { id: 'elim-qf-1', teamAId: 'teamA', teamBId: 'teamB', /* ... */ eliminationBracket: 'quarterfinals', boFormat: 'BO5' },
  // ... 共4场
];

// 半决赛：2场 BO5
const semiFinals: Match[] = [
  { id: 'elim-sf-1', /* ... */ eliminationBracket: 'semifinals', boFormat: 'BO5' },
  // ... 共2场
];

// 决赛：1场 BO5
const finals: Match[] = [
  { id: 'elim-f-1', /* ... */ eliminationBracket: 'finals', boFormat: 'BO5' },
];

export const eliminationMatches: Match[] = [
  ...quarterFinals,
  ...semiFinals,
  ...finals,
];
```

**新增8支战队**：

```typescript
// 在现有8支战队基础上新增8支
export const newTeams: Team[] = [
  {
    id: 'team9',
    name: '新战队A',
    logo: 'https://picsum.photos/seed/team9/200/200',
    battleCry: '战队口号',
    players: [/* 5个队员 */],
  },
  // ... 共8支
];

export const initialTeams: Team[] = [...existing8Teams, ...newTeams];
```

**更新 swissAdvancement**：

```typescript
export const swissAdvancement = {
  top8: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
  eliminated: ['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16'],
  rankings: [],
};
```

---

### 阶段八：其他文件修改

#### 2.8.1 frontend/src/pages/admin/Schedule.tsx

**修改内容**：
- 更新 `handleAdvancementUpdate` 适配新的 `top8/eliminated` 结构
- 更新初始化提示文案："瑞士轮32场 + 淘汰赛7场"

#### 2.8.2 frontend/src/pages/admin/Teams.tsx

**新增内容**：
- 添加16支战队数量限制验证
- 添加超出限制时的友好提示

```typescript
const MAX_TEAMS = 16;

const handleAddTeam = async (team: Omit<Team, 'id'>) => {
  const currentTeams = getTeams();
  if (currentTeams.length >= MAX_TEAMS) {
    toast.error(`战队数量已达上限（${MAX_TEAMS}支）`);
    return;
  }
  // ... 添加逻辑
};
```

#### 2.8.3 frontend/src/components/features/TeamSection.tsx

**修改内容**：
- 验证并确保只显示16支战队
- 响应式布局适配16队网格

---

## 三、开发优先级

### 第一阶段：类型和配置（Day 1）
1. [ ] 更新 `types/index.ts` - Match, SwissAdvancementResult, AdvancementCategory
2. [ ] 重写 `swissRoundSlots.ts` - 10个战绩分组配置
3. [ ] 重写 `advancementStore.ts` - 简化为2分类

### 第二阶段：瑞士轮组件（Day 2-3）
4. [ ] 重写 `SwissStage.tsx` - 10分组布局
5. [ ] 修改 `SwissStageVisualEditor.tsx` - 适配新配置
6. [ ] 修改瑞士轮相关子组件

### 第三阶段：淘汰赛组件（Day 3-4）
7. [ ] 重写 `eliminationConstants.ts` - 7位置单败制
8. [ ] 重写 `EliminationConnectors.tsx` - 单败连线
9. [ ] 重写 `EliminationStage.tsx` - 8队单败展示
10. [ ] 修改 `BracketMatchCard.tsx` - BO5标识

### 第四阶段：数据（Day 4-5）
11. [ ] 创建16支战队 Mock 数据
12. [ ] 创建32场瑞士轮 Mock 数据
13. [ ] 创建7场淘汰赛 Mock 数据

### 第五阶段：集成和测试（Day 5-6）
14. [ ] 更新 `Schedule.tsx`
15. [ ] 添加16队限制验证
16. [ ] 集成测试
17. [ ] 响应式测试

---

## 四、文件修改清单汇总

| 序号 | 文件路径 | 修改类型 | 优先级 |
|------|---------|---------|--------|
| 1 | `types/index.ts` | 接口修改 | P0 |
| 2 | `pages/admin/swissRoundSlots.ts` | 完全重写 | P0 |
| 3 | `store/advancementStore.ts` | 完全重构 | P0 |
| 4 | `components/features/SwissStage.tsx` | 完全重构 | P0 |
| 5 | `components/features/eliminationConstants.ts` | 完全重写 | P0 |
| 6 | `components/features/EliminationStage.tsx` | 完全重构 | P0 |
| 7 | `components/features/EliminationConnectors.tsx` | 完全重写 | P0 |
| 8 | `components/features/BracketMatchCard.tsx` | 部分修改 | P1 |
| 9 | `components/features/EditableBracketMatchCard.tsx` | 部分修改 | P1 |
| 10 | `pages/admin/SwissStageVisualEditor.tsx` | 部分修改 | P0 |
| 11 | `mock/data.ts` | 完全重写 | P0 |
| 12 | `pages/admin/Schedule.tsx` | 部分修改 | P1 |
| 13 | `pages/admin/Teams.tsx` | 新增验证 | P1 |
| 14 | `components/features/TeamSection.tsx` | 部分修改 | P2 |

---

## 五、注意事项

1. **数据迁移**：现有8队数据需要迁移到16队，建议提供数据迁移脚本或引导用户重新初始化
2. **localStorage 清理**：晋级状态存储结构变更，需要清理旧数据
3. **响应式布局**：10个瑞士轮分组 + 7个淘汰赛位置需要更大的横向滚动区域
4. **BO赛制标识**：确保所有比赛卡片正确显示BO1/BO3/BO5标识
5. **测试覆盖**：重点测试新的赛制逻辑和各种边界情况

---

## 六、验收标准

### 瑞士轮验收
- [ ] 正确显示10个战绩分组
- [ ] 第一轮显示BO1标识
- [ ] 其他轮次显示BO3标识
- [ ] 晋级名单管理只有top8和eliminated两个分类
- [ ] 可以拖拽调整晋级状态
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
- [ ] 数据管理功能正常（加载Mock/清空数据）

### 性能验收
- [ ] 页面加载时间 < 2秒
- [ ] 赛程区域渲染流畅
- [ ] 横向滚动无明显延迟

---

**文档状态**：⏳ 待审核
**审核状态**：⏳ 待审核
**开发优先级**：🔥 高优先级