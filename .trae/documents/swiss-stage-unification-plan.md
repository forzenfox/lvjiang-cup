# 瑞士轮组件统一化方案评估

## 背景
当前有两个独立的瑞士轮可视化组件：
1. `SwissStage.tsx` - 主页面展示组件（只读）
2. `SwissStageVisualEditor.tsx` - 管理页面编辑组件（可编辑）

## 方案对比评估

### 方案A：保持现状（两个独立组件）

#### 优点
| 优点 | 说明 |
|-----|------|
| 职责单一 | 每个组件只负责一种场景 |
| 无侵入性 | 不会影响现有功能 |
| 风险低 | 无需改动现有代码 |
| 架构差异大 | 两个组件的架构设计差异较大，统一成本高 |

#### 缺点
| 缺点 | 说明 |
|-----|------|
| 代码重复 | MatchCard、TeamLogo、StatusBadge等组件重复 |
| 维护成本高 | 修改UI样式需要改两个文件 |
| 不一致风险 | 两个组件可能逐渐产生视觉差异 |

#### 代码重复度分析
```
重复内容：
- MatchStatusBadge 组件 ✅ 完全相同
- TeamLogo 组件 ✅ 完全相同
- MatchCard 基础结构 ✅ 高度相似
- StatusBadge 组件 ✅ 完全相同
- TeamList 组件 ✅ 高度相似
- RoundColumn 结构 ⚠️ 略有不同（Editor使用slot配置）

重复率：约 60%
```

---

### 方案B：统一为通用组件

#### 实现思路
```typescript
interface SwissStageProps {
  matches: Match[];
  teams: Team[];
  advancement?: SwissAdvancement;
  editable?: boolean;
  onMatchUpdate?: (match: Match) => void;
  onMatchCreate?: (match: Omit<Match, 'id'>) => void;
  onAdvancementUpdate?: (advancement: SwissAdvancement) => void;
}
```

#### 优点
| 优点 | 说明 |
|-----|------|
| 代码复用 | 共享MatchCard、TeamLogo等子组件 |
| 一致性保证 | 两个页面视觉效果完全一致 |
| 减少bug | 修改只需改一处 |

#### 缺点
| 缺点 | 说明 |
|-----|------|
| 架构差异大 | SwissStage使用按record分组，Editor使用slot配置 |
| 复杂度显著增加 | 需要兼容两种数据组织方式 |
| 侵入性改动大 | 需要重构主页面或管理页面其中一个 |
| 开发时间长 | 预计需要4-6小时 |
| 测试回归风险高 | 需要确保两种模式都正常工作 |

#### 技术难点

**1. 数据组织方式不同**
- `SwissStage`: 按 `swissRecord` 字段分组（0-0, 1-0, 0-1, 1-1, 0-2, 1-2）
- `SwissStageVisualEditor`: 使用 `swissRoundSlots` 配置数组

**2. 布局结构不同**
- `SwissStage`: 固定4列布局，手动控制每列的margin-top
- `SwissStageVisualEditor`: 动态布局，根据slot配置渲染

**3. 晋级名单管理**
- `SwissStage`: 只读展示，从store或props读取
- `SwissStageVisualEditor`: 可编辑，有完整的AdvancementEditor组件

---

### 方案对比矩阵

| 评估维度 | 方案A（现状） | 方案B（统一） | 胜出 |
|---------|-------------|-------------|------|
| 代码复用率 | 40% | 70% | B |
| 维护成本 | 中 | 低（长期） | B |
| 开发时间 | 0 | 4-6小时 | A |
| 架构复杂度 | 低 | 高 | A |
| 测试复杂度 | 低 | 高 | A |
| 回归风险 | 无 | 高 | A |
| 长期可维护性 | 中 | 好 | B |
| 当前稳定性 | 高 | 需验证 | A |

---

## 推荐方案

### 短期建议：方案A（保持现状）

**理由**：
1. 两个组件虽然功能相似，但架构设计差异较大
2. 统一化需要重构其中一方的数据组织方式，风险高
3. 当前代码已稳定运行，无紧急问题
4. 瑞士轮赛制比淘汰赛更复杂，统一化收益不如淘汰赛明显

### 部分优化建议（不强制统一）

可以提取公共子组件，减少重复但不强制统一主组件：

**1. 提取公共组件**
- `SwissMatchCard` - 统一的瑞士轮比赛卡片
- `SwissTeamLogo` - 统一的队伍Logo组件
- `SwissStatusBadge` - 统一的状态徽章

**2. 保持主组件独立**
- `SwissStage` - 保持现有只读实现
- `SwissStageVisualEditor` - 保持现有编辑实现

这样可以在不大幅改动架构的情况下，减少代码重复。

---

## 结论

**当前建议：暂不实施统一化**

瑞士轮的两个组件虽然功能相似，但：
1. 架构设计差异较大（分组方式不同）
2. 统一化需要大量重构，风险高于收益
3. 可以只提取公共子组件，保持主组件独立

**与淘汰赛的对比**：
- 淘汰赛：两个组件布局完全相同，统一化收益高 ✅ 已实施
- 瑞士轮：两个组件架构差异大，统一化成本高 ❌ 建议暂缓
