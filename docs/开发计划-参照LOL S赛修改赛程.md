# 开发计划 - 参照LOL S赛修改赛程

&gt; 版本: v1.0  
&gt; 更新日期: 2026-04-07  
&gt; 状态: 待执行

---

## 一、总体方案

### 核心思路
采用**固定槽位 + 管理员编辑对战**的方案，与现有架构保持一致：
1. **瑞士轮**：预先创建16队赛制的所有比赛槽位，管理员通过编辑槽位来配置对战
2. **淘汰赛**：预先创建8队单败赛制的所有比赛槽位，管理员通过编辑槽位来配置抽签对阵关系

### 优势
- 与现有代码架构保持一致
- 编辑逻辑复用度高
- 用户体验统一

---

## 二、修改清单

### 2.1 类型定义

**文件**：[frontend/src/types/index.ts](file:///workspace/frontend/src/types/index.ts)

#### 修改内容：

1. **更新 `Match` 接口**
   - 添加 `boFormat?: 'BO1' | 'BO3' | 'BO5'` 字段
   - 更新 `swissRecord` 注释，添加更多战绩选项
   - 更新 `swissRound` 范围从 (1-5) 改为 (1-4)
   - 更新 `eliminationBracket` 类型改为 `'quarterfinals' | 'semifinals' | 'finals'`

2. **更新 `SwissAdvancementResult` 接口**
   ```typescript
   interface SwissAdvancementResult {
     top8: string[]; // 前8名晋级淘汰赛
     eliminated: string[]; // 被淘汰队伍
     rankings: {
       teamId: string;
       record: string; // 如 "3-0", "3-1" 等
       rank: number; // 1-16
     }[];
   }
   ```

3. **更新 `AdvancementCategory` 类型**
   ```typescript
   type AdvancementCategory = 'top8' | 'eliminated';
   ```

---

### 2.2 瑞士轮槽位配置

**文件**：[frontend/src/pages/admin/swissRoundSlots.ts](file:///workspace/frontend/src/pages/admin/swissRoundSlots.ts)

#### 修改内容：

1. **重写 `swissRoundSlots` 配置**（16队4轮赛制）：
   ```typescript
   export const swissRoundSlots: SwissRoundSlot[] = [
     // 第一轮：0-0，8场BO1
     { swissRecord: '0-0', roundName: 'Round 1', maxMatches: 8 },
     // 第二轮：1-0，4场BO3；0-1，4场BO3
     { swissRecord: '1-0', roundName: 'Round 2 High', maxMatches: 4 },
     { swissRecord: '0-1', roundName: 'Round 2 Low', maxMatches: 4 },
     // 第三轮：2-0，2场BO3；1-1，4场BO3；0-2，2场BO3
     { swissRecord: '2-0', roundName: 'Round 3 High', maxMatches: 2 },
     { swissRecord: '1-1', roundName: 'Round 3 Mid', maxMatches: 4 },
     { swissRecord: '0-2', roundName: 'Round 3 Low', maxMatches: 2 },
     // 第四轮：3-0，1场BO3；2-1，3场BO3；1-2，3场BO3；0-3，1场BO3
     { swissRecord: '3-0', roundName: 'Round 4 High', maxMatches: 1 },
     { swissRecord: '2-1', roundName: 'Round 4 Mid-High', maxMatches: 3 },
     { swissRecord: '1-2', roundName: 'Round 4 Mid-Low', maxMatches: 3 },
     { swissRecord: '0-3', roundName: 'Round 4 Low', maxMatches: 1 },
   ];
   ```

2. **更新 `getRoundFormat` 函数**
   - 保持逻辑不变：'0-0' 返回 'BO1'，其他返回 'BO3'

3. **添加 `getTotalSlots` 函数保持不变**

---

### 2.3 晋级状态管理

**文件**：[frontend/src/store/advancementStore.ts](file:///workspace/frontend/src/store/advancementStore.ts)

#### 修改内容：

1. **更新 `defaultAdvancement`**
   ```typescript
   const defaultAdvancement: SwissAdvancementResult = {
     top8: [],
     eliminated: [],
     rankings: [],
   };
   ```

2. **更新 `categoryConfig`**
   ```typescript
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
   ```

3. **更新 `categoryOrder`**
   ```typescript
   export const categoryOrder: AdvancementCategory[] = ['top8', 'eliminated'];
   ```

4. **更新 `getAllTeamIds` 方法**
   ```typescript
   getAllTeamIds: () => {
     const { advancement } = get();
     return [...advancement.top8, ...advancement.eliminated];
   },
   ```

---

### 2.4 瑞士轮可视化编辑器

**文件**：[frontend/src/pages/admin/SwissStageVisualEditor.tsx](file:///workspace/frontend/src/pages/admin/SwissStageVisualEditor.tsx)

#### 修改内容：

1. **更新布局**（适配10个战绩分组）
   - 当前是6个分组，需要扩展为10个分组
   - 调整布局结构，确保10个分组能横向排列

2. **更新 RoundColumn 渲染逻辑**
   - 按照新的 `swissRoundSlots` 顺序渲染所有分组
   - 可能需要调整分组之间的间距和偏移

3. **更新晋级名单管理面板**
   - 只显示2个分类：top8 和 eliminated
   - 调整UI以适配新的分类

---

### 2.5 瑞士轮展示组件

**文件**：[frontend/src/components/features/SwissStage.tsx](file:///workspace/frontend/src/components/features/SwissStage.tsx)

#### 修改内容：

1. **更新战绩分组过滤**
   ```typescript
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

2. **更新布局结构**
   - 添加所有10个战绩分组的 RoundColumn
   - 调整宽度以适配更多分组

3. **更新晋级展示**
   - 展示 top8 晋级队伍
   - 展示 eliminated 淘汰队伍

---

### 2.6 淘汰赛常量配置

**文件**：[frontend/src/components/features/eliminationConstants.ts](file:///workspace/frontend/src/components/features/eliminationConstants.ts)

#### 修改内容：

1. **更新 `BOARD_WIDTH` 和 `BOARD_HEIGHT`**（根据8队单败制调整）

2. **重写 `ELIMINATION_POSITIONS`**（8队单败制，7场比赛）
   ```typescript
   export const ELIMINATION_POSITIONS = {
     // 四分之一决赛（4场）
     qf1: { x: 20, y: 50 },
     qf2: { x: 20, y: 200 },
     qf3: { x: 20, y: 350 },
     qf4: { x: 20, y: 500 },
     // 半决赛（2场）
     sf1: { x: 300, y: 125 },
     sf2: { x: 300, y: 425 },
     // 决赛（1场）
     f: { x: 580, y: 275 },
   };
   ```

3. **重写 `ELIMINATION_CONNECTORS`**
   ```typescript
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
   ```

4. **更新 `createPlaceholderMatch`**
   - 设置 `boFormat: 'BO5'`
   - 更新 `eliminationBracket` 为新的类型

5. **更新 `GAME_KEYS`**
   ```typescript
   export const GAME_KEYS: GameKey[] = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'f'];
   ```

6. **更新 `GAME_NUMBER_TO_ID` 映射（在 EliminationStage.tsx 中）**
   - 对应新的7场比赛

---

### 2.7 淘汰赛展示组件

**文件**：[frontend/src/components/features/EliminationStage.tsx](file:///workspace/frontend/src/components/features/EliminationStage.tsx)

#### 修改内容：

1. **更新 `GAME_NUMBER_TO_ID` 映射**
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
   ```

2. **更新 `renderMatch` 调用**
   - 对应新的7场比赛和位置

3. **添加 BO5 标识显示**
   - 在比赛卡片上显示 BO5 标识

---

### 2.8 Mock数据

**文件**：[frontend/src/mock/data.ts](file:///workspace/frontend/src/mock/data.ts)

#### 修改内容：

1. **扩展战队数量**：从8支扩展到16支
   - 复制现有8支战队作为模板
   - 创建另外8支新战队

2. **重写 `swissMatches`**
   - 创建16队4轮赛制的所有比赛
   - 第一轮：8场 BO1
   - 第二轮：8场 BO3（4场1-0 + 4场0-1）
   - 第三轮：8场 BO3（2场2-0 + 4场1-1 + 2场0-2）
   - 第四轮：8场 BO3（1场3-0 + 3场2-1 + 3场1-2 + 1场0-3）
   - 总计：32场比赛

3. **重写 `eliminationMatches`**
   - 创建8队单败赛制的7场比赛
   - 四分之一决赛：4场 BO5
   - 半决赛：2场 BO5
   - 决赛：1场 BO5
   - 总计：7场比赛

4. **更新 `swissAdvancement`**
   ```typescript
   export const swissAdvancement = {
     top8: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
     eliminated: ['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16'],
     rankings: [],
   };
   ```

---

### 2.9 赛程管理页面

**文件**：[frontend/src/pages/admin/Schedule.tsx](file:///workspace/frontend/src/pages/admin/Schedule.tsx)

#### 修改内容：

1. **更新 `handleAdvancementUpdate`**
   - 适配新的 `SwissAdvancementResult` 结构

2. **更新初始化提示文案**
   - 提示文案从"瑞士轮14场和淘汰赛8场"改为新的数量

3. **战队数量限制**（可选，如果后端还没做）
   - 在战队管理页面添加16支战队的限制

---

### 2.10 后端（如有需要）

**待确认**：是否需要同步修改后端？
- 如果使用纯前端Mock，不需要
- 如果有后端API，需要同步更新：
  - 数据模型
  - initSlots API
  - 相关Service

---

## 三、开发优先级

### 第一阶段：核心配置和类型
1. [ ] 更新类型定义
2. [ ] 更新瑞士轮槽位配置
3. [ ] 更新晋级状态管理
4. [ ] 更新淘汰赛常量配置

### 第二阶段：组件修改
5. [ ] 修改瑞士轮可视化编辑器
6. [ ] 修改瑞士轮展示组件
7. [ ] 修改淘汰赛展示组件

### 第三阶段：数据和整合
8. [ ] 更新Mock数据（16支战队 + 新赛制比赛）
9. [ ] 更新赛程管理页面
10. [ ] 整合测试

---

## 四、注意事项

1. **保持编辑逻辑不变**：只修改配置和数据结构，不修改核心的固定槽位编辑逻辑
2. **向后兼容**：尽量保持现有接口的兼容性，便于数据迁移
3. **响应式布局**：10个瑞士轮分组可能需要横向滚动，确保移动端体验
4. **BO5显示**：淘汰赛需要添加BO5标识显示
5. **测试覆盖**：重点测试新的布局和数据结构

---

## 五、验收标准

- [ ] 瑞士轮正确显示10个战绩分组
- [ ] 瑞士轮第一轮显示BO1，其他显示BO3
- [ ] 晋级名单管理只有top8和eliminated两个分类
- [ ] 淘汰赛正确显示8队单败赛制
- [ ] 淘汰赛所有比赛显示BO5标识
- [ ] 管理员可以自由编辑所有比赛的对战信息
- [ ] Mock数据包含16支战队
- [ ] 所有功能正常工作

---

**文档状态**：⏳ 待审核  
**开发优先级**：🔥 高优先级
