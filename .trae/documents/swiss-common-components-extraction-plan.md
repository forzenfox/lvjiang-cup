# 瑞士轮公共组件提取方案

## 目标
提取 SwissStage 和 SwissStageVisualEditor 中的公共子组件，减少代码重复，保持主组件独立。

## 用户旅程

### 用户旅程1：查看瑞士轮比赛卡片
**作为** 赛事观众  
**我想要** 看到统一风格的比赛卡片  
**以便** 获得一致的视觉体验

### 用户旅程2：编辑瑞士轮比赛
**作为** 赛事管理员  
**我想要** 使用与展示页面相同的卡片样式进行编辑  
**以便** 所见即所得

## 公共组件清单

### 1. SwissMatchCard - 瑞士轮比赛卡片
**文件**: `src/components/features/swiss/SwissMatchCard.tsx`

**Props**:
```typescript
interface SwissMatchCardProps {
  match: Match;
  teams: Team[];
  onClick?: () => void;  // 可选的点击事件
  className?: string;
}
```

**功能**:
- 显示两队信息和比分
- 显示比赛状态（未开始/进行中/已结束）
- 显示比赛时间
- 高亮显示胜者
- 支持点击事件（用于编辑模式）

---

### 2. SwissMatchCardEditor - 瑞士轮比赛卡片编辑器
**文件**: `src/components/features/swiss/SwissMatchCardEditor.tsx`

**Props**:
```typescript
interface SwissMatchCardEditorProps {
  match: Match | null;
  teams: Team[];
  slot: SwissRoundSlot;
  onSave: (match: Match) => void;
  onCreate?: (match: Omit<Match, 'id'>) => void;
  onCancel?: () => void;
}
```

**功能**:
- 空槽位显示"+ 等待对阵"
- 编辑模式：选择队伍、输入比分
- 保存/取消操作

---

### 3. SwissTeamLogo - 队伍Logo组件
**文件**: `src/components/features/swiss/SwissTeamLogo.tsx`

**Props**:
```typescript
interface SwissTeamLogoProps {
  team?: Team;
  size?: 'sm' | 'md' | 'lg';
}
```

**功能**:
- 显示队伍Logo或占位符
- 支持不同尺寸

---

### 4. SwissMatchStatusBadge - 比赛状态徽章
**文件**: `src/components/features/swiss/SwissMatchStatusBadge.tsx`

**Props**:
```typescript
interface SwissMatchStatusBadgeProps {
  status: MatchStatus;
}
```

**功能**:
- 显示比赛状态（未开始/进行中/已结束）
- 不同状态不同颜色样式

---

### 5. SwissStatusBadge - 晋级状态徽章
**文件**: `src/components/features/swiss/SwissStatusBadge.tsx`

**Props**:
```typescript
interface SwissStatusBadgeProps {
  type: 'qualified' | 'eliminated' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
}
```

**功能**:
- 显示晋级/淘汰/危险状态
- 支持点击事件（编辑模式）

---

### 6. SwissTeamList - 队伍列表组件
**文件**: `src/components/features/swiss/SwissTeamList.tsx`

**Props**:
```typescript
interface SwissTeamListProps {
  teams: Team[];
  ids: string[];
  onRemove?: (id: string) => void;  // 可选的移除功能
}
```

**功能**:
- 显示队伍列表
- 支持移除按钮（编辑模式）

---

### 7. SwissRoundColumn - 轮次列组件
**文件**: `src/components/features/swiss/SwissRoundColumn.tsx`

**Props**:
```typescript
interface SwissRoundColumnProps {
  roundName: string;
  swissRecord: string;
  matches: Match[];
  teams: Team[];
  maxMatches?: number;  // 最大比赛数（用于编辑模式固定槽位）
  editable?: boolean;
  onMatchUpdate?: (match: Match) => void;
  onMatchCreate?: (match: Omit<Match, 'id'>) => void;
  className?: string;
}
```

**功能**:
- 显示轮次标题和BO格式
- 显示该轮次的所有比赛
- 支持编辑模式（固定槽位）

---

## TDD实施步骤

### Phase 1: 提取 SwissTeamLogo 和 SwissMatchStatusBadge

#### 任务1.1: 创建 SwissTeamLogo 组件
- **文件**: `src/components/features/swiss/SwissTeamLogo.tsx`
- **测试**: `src/components/features/swiss/__tests__/SwissTeamLogo.test.tsx`

#### 任务1.2: 创建 SwissMatchStatusBadge 组件
- **文件**: `src/components/features/swiss/SwissMatchStatusBadge.tsx`
- **测试**: `src/components/features/swiss/__tests__/SwissMatchStatusBadge.test.tsx`

#### 任务1.3: 运行测试
```bash
npm test -- src/components/features/swiss/__tests__
```

---

### Phase 2: 提取 SwissMatchCard

#### 任务2.1: 创建 SwissMatchCard 组件
- **文件**: `src/components/features/swiss/SwissMatchCard.tsx`
- **依赖**: SwissTeamLogo, SwissMatchStatusBadge

#### 任务2.2: 编写测试
- **文件**: `src/components/features/swiss/__tests__/SwissMatchCard.test.tsx`
- **测试内容**:
  - 应该正确显示两队信息
  - 应该显示比赛状态
  - 应该高亮显示胜者
  - 应该支持点击事件
  - 应该显示比赛时间

#### 任务2.3: 运行测试
```bash
npm test -- src/components/features/swiss/__tests__/SwissMatchCard.test.tsx
```

---

### Phase 3: 提取 SwissMatchCardEditor

#### 任务3.1: 创建 SwissMatchCardEditor 组件
- **文件**: `src/components/features/swiss/SwissMatchCardEditor.tsx`
- **依赖**: SwissTeamLogo

#### 任务3.2: 编写测试
- **文件**: `src/components/features/swiss/__tests__/SwissMatchCardEditor.test.tsx`

#### 任务3.3: 运行测试
```bash
npm test -- src/components/features/swiss/__tests__/SwissMatchCardEditor.test.tsx
```

---

### Phase 4: 提取 SwissStatusBadge 和 SwissTeamList

#### 任务4.1: 创建 SwissStatusBadge 组件
- **文件**: `src/components/features/swiss/SwissStatusBadge.tsx`
- **测试**: `src/components/features/swiss/__tests__/SwissStatusBadge.test.tsx`

#### 任务4.2: 创建 SwissTeamList 组件
- **文件**: `src/components/features/swiss/SwissTeamList.tsx`
- **测试**: `src/components/features/swiss/__tests__/SwissTeamList.test.tsx`

#### 任务4.3: 运行测试
```bash
npm test -- src/components/features/swiss/__tests__
```

---

### Phase 5: 提取 SwissRoundColumn

#### 任务5.1: 创建 SwissRoundColumn 组件
- **文件**: `src/components/features/swiss/SwissRoundColumn.tsx`
- **依赖**: SwissMatchCard, SwissMatchCardEditor

#### 任务5.2: 编写测试
- **文件**: `src/components/features/swiss/__tests__/SwissRoundColumn.test.tsx`

#### 任务5.3: 运行测试
```bash
npm test -- src/components/features/swiss/__tests__/SwissRoundColumn.test.tsx
```

---

### Phase 6: 重构 SwissStage 使用公共组件

#### 任务6.1: 更新 SwissStage.tsx
- 使用 SwissMatchCard 替换内嵌 MatchCard
- 使用 SwissTeamLogo 替换内嵌 TeamLogo
- 使用 SwissMatchStatusBadge 替换内嵌 MatchStatusBadge
- 使用 SwissStatusBadge 替换内嵌 StatusBadge
- 使用 SwissTeamList 替换内嵌 TeamList

#### 任务6.2: 运行测试
```bash
npm test -- tests/unit/components/features/SwissStage.test.tsx
```

---

### Phase 7: 重构 SwissStageVisualEditor 使用公共组件

#### 任务7.1: 更新 SwissStageVisualEditor.tsx
- 使用 SwissMatchCardEditor 替换内嵌 FixedSlotMatchCard
- 使用 SwissTeamLogo 替换内嵌 TeamLogo
- 使用 SwissMatchStatusBadge 替换内嵌 MatchStatusBadge
- 使用 SwissStatusBadge 替换内嵌 StatusBadge
- 使用 SwissTeamList 替换内嵌 TeamList

#### 任务7.2: 运行测试
```bash
npm test -- src/pages/admin/__tests__
```

---

### Phase 8: 集成验证

#### 任务8.1: 运行全量测试
```bash
npm test
```

#### 任务8.2: 类型检查
```bash
npx tsc --noEmit
```

#### 任务8.3: 代码风格检查
```bash
npm run lint
```

---

## 文件变更清单

### 新增文件
1. `src/components/features/swiss/SwissTeamLogo.tsx`
2. `src/components/features/swiss/SwissMatchStatusBadge.tsx`
3. `src/components/features/swiss/SwissMatchCard.tsx`
4. `src/components/features/swiss/SwissMatchCardEditor.tsx`
5. `src/components/features/swiss/SwissStatusBadge.tsx`
6. `src/components/features/swiss/SwissTeamList.tsx`
7. `src/components/features/swiss/SwissRoundColumn.tsx`
8. `src/components/features/swiss/index.ts` - 统一导出
9. 对应的测试文件（7个）

### 修改文件
1. `src/components/features/SwissStage.tsx` - 使用公共组件
2. `src/pages/admin/SwissStageVisualEditor.tsx` - 使用公共组件

---

## 预期收益

| 指标 | 改进前 | 改进后 | 变化 |
|-----|--------|--------|------|
| 代码重复率 | 60% | 20% | 降低40% |
| 组件可复用性 | 低 | 高 | 提升 |
| 维护成本 | 中 | 低 | 降低 |
| 视觉一致性 | 有风险 | 保证 | 提升 |

## 验收标准

- [ ] 所有新组件测试通过
- [ ] 覆盖率 >= 80%
- [ ] 无TypeScript错误
- [ ] 全量测试通过
- [ ] SwissStage 功能正常
- [ ] SwissStageVisualEditor 功能正常
- [ ] 视觉样式保持一致
