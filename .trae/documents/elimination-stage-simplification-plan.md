# 淘汰赛UI简化方案实施计划

## 目标
将 `EliminationStage.tsx` 从动态SVG连线方案改为纯CSS固定布局方案，移除虚线，仅保留实线，让用户一眼看清赛程。

## 用户旅程

### 用户旅程1：查看淘汰赛赛程
**作为** 赛事管理员/观众  
**我想要** 查看淘汰赛的对阵图  
**以便** 了解比赛进程和晋级路线

### 用户旅程2：理解比赛关系
**作为** 赛事观众  
**我想要** 通过简单的连线看清比赛之间的晋级关系  
**以便** 不需要理解复杂的双败赛制规则就能看懂赛程

## TDD实施步骤

### Phase 1: 编写测试（Red）

#### 任务1.1: 创建EliminationStage组件测试文件
- **文件**: `src/components/features/__tests__/EliminationStage.test.tsx`
- **测试内容**:
  - 应该渲染8个比赛槽位（G1-G8）
  - 应该显示实线连接线（无虚线）
  - 应该正确显示比赛信息（队伍、比分、时间）
  - 应该正确标记胜者
  - 应该处理空比赛槽位（显示"待定"）
  - 应该响应式显示（水平滚动）

#### 任务1.2: 运行测试确认失败
```bash
npm test -- src/components/features/__tests__/EliminationStage.test.tsx
```
预期：测试失败，因为新实现还未编写

---

### Phase 2: 实现代码（Green）

#### 任务2.1: 重构EliminationStage组件
- **文件**: `src/components/features/EliminationStage.tsx`
- **改动内容**:
  1. 移除所有 `useRef`、`useLayoutEffect`、`useState`、`useCallback`
  2. 移除动态坐标计算逻辑
  3. 使用纯CSS绝对定位放置比赛卡片
  4. 使用简单div元素作为实线连接线
  5. 移除虚线（dashed lines）相关代码
  6. 保留 `BracketMatchCard` 组件的使用

#### 任务2.2: 固定布局设计
```
画布尺寸: 1200px x 650px

比赛位置（固定坐标）:
- G1: (20, 20)      - 胜者组第一轮上半区
- G2: (20, 160)     - 胜者组第一轮上半区
- G3: (20, 340)     - 败者组第一轮上半区
- G4: (20, 480)     - 败者组第一轮下半区
- G5: (300, 90)     - 胜者组第二轮
- G6: (300, 410)    - 败者组第二轮
- G7: (580, 410)    - 败者组第三轮
- G8: (860, 250)    - 总决赛

连接线（实线）:
- G1 → G5 (水平+垂直折线)
- G2 → G5 (水平+垂直折线)
- G3 → G6 (水平+垂直折线)
- G4 → G6 (水平+垂直折线)
- G5 → G8 (水平+垂直折线)
- G6 → G7 (水平+垂直折线)
- G7 → G8 (水平+垂直折线)
```

#### 任务2.3: 运行测试确认通过
```bash
npm test -- src/components/features/__tests__/EliminationStage.test.tsx
```
预期：所有测试通过

---

### Phase 3: 重构优化（Refactor）

#### 任务3.1: 代码质量优化
- 提取可复用的布局常量
- 优化CSS类名
- 添加必要的注释
- 确保类型安全

#### 任务3.2: 运行测试确保重构未破坏功能
```bash
npm test -- src/components/features/__tests__/EliminationStage.test.tsx
```
预期：所有测试仍然通过

---

### Phase 4: 验证覆盖率

#### 任务4.1: 运行覆盖率检查
```bash
npm run test:coverage -- src/components/features/__tests__/EliminationStage.test.tsx
```
目标：覆盖率 >= 80%

#### 任务4.2: 补充缺失的测试（如有需要）
- 边界条件测试
- 错误处理测试
- 空数据测试

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
npm run typecheck
```
确保：
- 无TypeScript错误

#### 任务5.3: 代码风格检查
```bash
npm run lint
```
确保：
- 无lint错误

---

## 预期收益

| 指标 | 当前方案 | 新方案 | 改进 |
|-----|---------|--------|------|
| 代码行数 | ~212行 | ~80-100行 | 减少50%+ |
| 复杂度 | 高（动态计算） | 低（纯CSS） | 大幅降低 |
| 性能 | 有计算开销 | 无JS计算 | 提升 |
| 可维护性 | 低 | 高 | 提升 |
| 视觉效果 | 有虚线（需理解） | 仅实线（直观） | 简化 |

## 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|-----|--------|------|---------|
| 布局在不同屏幕尺寸下显示异常 | 中 | 中 | 使用固定宽度容器+水平滚动 |
| 用户习惯原有虚线提示 | 低 | 低 | 虚线含义本就晦涩，移除后更直观 |
| 测试覆盖不足 | 低 | 高 | TDD确保测试先行，覆盖率>=80% |

## 回滚方案

如需回滚，可通过git恢复原始文件：
```bash
git checkout src/components/features/EliminationStage.tsx
git checkout src/components/features/__tests__/EliminationStage.test.tsx
```

## 验收标准

- [ ] 所有新测试通过
- [ ] 覆盖率 >= 80%
- [ ] 无TypeScript错误
- [ ] 无lint错误
- [ ] 全量测试通过
- [ ] 视觉效果符合预期（仅实线，无动态计算）
