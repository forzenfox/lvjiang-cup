# 淘汰赛组件统一化实施方案（方案B）

## 目标
将 `EliminationStage.tsx` 和 `EliminationStageVisualEditor.tsx` 统一为一个通用组件，通过 `editable` 参数控制编辑功能。

## 用户旅程

### 用户旅程1：在主页查看淘汰赛
**作为** 赛事观众  
**我想要** 查看淘汰赛对阵图  
**以便** 了解比赛进程

### 用户旅程2：在管理页面编辑比赛
**作为** 赛事管理员  
**我想要** 点击比赛卡片进行编辑  
**以便** 更新比赛结果和信息

## TDD实施步骤

### Phase 1: 提取公共常量（Green）

#### 任务1.1: 创建eliminationConstants.ts
- **文件**: `src/components/features/eliminationConstants.ts`
- **内容**:
  - `ELIMINATION_POSITIONS` - 8个比赛位置坐标
  - `ELIMINATION_CONNECTORS` - 连接线配置
  - `BOARD_WIDTH`, `BOARD_HEIGHT` - 画布尺寸
  - `placeholderMatch` 函数

#### 任务1.2: 运行测试确保常量正确
```bash
npm test -- src/components/features/__tests__/eliminationConstants.test.ts
```

---

### Phase 2: 统一连接线渲染（Green）

#### 任务2.1: 创建EliminationConnectors组件
- **文件**: `src/components/features/EliminationConnectors.tsx`
- **实现**: 使用CSS实线（与EliminationStage一致）
- **props**: `positions`, `connectors`

#### 任务2.2: 编写测试
- **文件**: `src/components/features/__tests__/EliminationConnectors.test.tsx`
- **测试内容**:
  - 应该渲染所有连接线
  - 应该使用实线而非虚线
  - 应该正确计算位置

#### 任务2.3: 运行测试
```bash
npm test -- src/components/features/__tests__/EliminationConnectors.test.tsx
```

---

### Phase 3: 重构EliminationStage组件（Green）

#### 任务3.1: 更新EliminationStage组件
- **文件**: `src/components/features/EliminationStage.tsx`
- **新增props**:
  ```typescript
  interface EliminationStageProps {
    matches: Match[];
    teams: Team[];
    editable?: boolean;  // 新增
    onMatchUpdate?: (match: Match) => void;  // 新增
  }
  ```

#### 任务3.2: 集成EditableBracketMatchCard
- 当 `editable=true` 且 `onMatchUpdate` 存在时，使用 `EditableBracketMatchCard`
- 否则使用 `BracketMatchCard`

#### 任务3.3: 使用提取的常量
- 替换硬编码的 `POSITIONS` 和 `CONNECTORS`
- 使用 `eliminationConstants.ts` 中的常量

#### 任务3.4: 运行测试
```bash
npm test -- src/components/features/__tests__/EliminationStage.test.tsx
```

---

### Phase 4: 替换EliminationStageVisualEditor（Green）

#### 任务4.1: 更新Schedule.tsx中的管理页面
- **文件**: `src/pages/admin/Schedule.tsx`
- **改动**: 将 `EliminationStageVisualEditor` 替换为 `EliminationStage`
- **添加props**:
  ```tsx
  <EliminationStage
    matches={eliminationMatches}
    teams={teams}
    editable={true}
    onMatchUpdate={handleMatchUpdate}
  />
  ```

#### 任务4.2: 删除旧组件
- **删除**: `src/pages/admin/EliminationStageVisualEditor.tsx`

#### 任务4.3: 运行测试
```bash
npm test -- src/pages/admin/__tests__
```

---

### Phase 5: 集成验证

#### 任务5.1: 运行全量测试
```bash
npm test
```
确保：
- 所有现有测试通过
- 没有引入回归问题

#### 任务5.2: 类型检查
```bash
npx tsc --noEmit
```
确保：
- 无TypeScript错误

#### 任务5.3: 代码风格检查
```bash
npm run lint
```
确保：
- 无lint错误（新代码部分）

---

## 文件变更清单

### 新增文件
1. `src/components/features/eliminationConstants.ts` - 公共常量
2. `src/components/features/EliminationConnectors.tsx` - 连接线组件
3. `src/components/features/__tests__/eliminationConstants.test.ts` - 常量测试
4. `src/components/features/__tests__/EliminationConnectors.test.tsx` - 连接线测试

### 修改文件
1. `src/components/features/EliminationStage.tsx` - 添加editable支持
2. `src/components/features/__tests__/EliminationStage.test.tsx` - 更新测试
3. `src/pages/admin/Schedule.tsx` - 使用统一组件

### 删除文件
1. `src/pages/admin/EliminationStageVisualEditor.tsx` - 旧编辑器组件

---

## 验收标准

- [ ] 所有新测试通过
- [ ] 覆盖率 >= 80%
- [ ] 无TypeScript错误
- [ ] 全量测试通过
- [ ] 主页面只读模式正常
- [ ] 管理页面编辑功能正常
- [ ] 代码行数减少（目标：减少30%+）
