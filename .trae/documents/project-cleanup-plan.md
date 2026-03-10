# 项目清理计划

## 目标

扫描并删除项目中无用的代码和文件，对要移除的项目进行深入评估分析。

## 详细分析

### 废弃文件详细说明

#### 1. AdvancementManager.tsx

* **文件路径**: `src/pages/admin/AdvancementManager.tsx`

* **废弃原因**: 根据 App.tsx 第 9-10 行和第 41-47 行的注释，该页面已废弃

* **引用情况**:

  * App.tsx 中的路由已被注释掉

  * 仅在自身文件和测试文件中被引用

* **风险评估**: 低风险，可以安全删除

#### 2. 旧版编辑器组件

* **文件列表**:

  * `EliminationStageEditor.tsx` - 第 2-8 行明确标记为废弃

  * `SwissStageEditor.tsx` - 第 2-8 行明确标记为废弃

* **废弃原因**: 已切换到可视化编辑器 (EliminationStage 和 SwissStageVisualEditor)

* **引用情况**:

  * 这两个文件只在自身内部被引用

  * Schedule.tsx 中已经使用新的可视化编辑器

  * 组件中提到的 `swissViewMode` 和 `eliminationViewMode` 在 Schedule.tsx 中并未实现

* **依赖组件** (同时废弃):

  * `MatchSection.tsx` - 仅被上述两个编辑器使用

  * `MatchRow.tsx` - 仅被上述两个编辑器使用

  * `MatchSearchBox.tsx` - 仅被上述两个编辑器使用

  * `useMatchFilter.ts` - 仅被上述两个编辑器使用

  * `useTempMatchManager.ts` - 仅被上述两个编辑器使用

* **风险评估**: 低风险，这些组件明确标记为废弃且未被使用

#### 3. EditableMatchCard.tsx

* **文件路径**: `src/components/features/EditableMatchCard.tsx`

* **使用情况**: 全文搜索未发现任何文件导入此组件

* **功能**: 可编辑的比赛卡片组件

* **替代方案**: 可能已被 SwissMatchCard 或 BracketMatchCard 替代

* **风险评估**: 中等风险，建议删除前再次确认

### 构建产物说明

#### 测试报告文件

* **生成原因**: 运行 `npm run test:coverage` 命令后自动生成

* **文件位置**:

  * `tests/reports/coverage/` - 覆盖率报告

  * `tests/reports/test-results.xml` - 测试结果

  * `src/tests/reports/` - 重复的测试报告（可能是配置错误导致）

* **是否可以删除**: 是，这些文件应该被添加到 .gitignore 中，不应该提交到版本控制

* **建议**: 更新 .gitignore 添加：

  ```
  tests/reports/
  coverage/
  *.log
  ```

### 保留文件说明

#### advancementStore.ts

* **文件路径**: `src/store/advancementStore.ts`

* **使用情况**:

  * SwissStage.tsx (第 3 行导入，第 58-59 行使用)

  * Schedule.tsx (第 9 行导入，第 16-17 行使用)

  * AdvancementManager.tsx (已废弃)

* **结论**: **不应删除**，该 store 仍被 SwissStage 和 Schedule 页面使用

### 1. 已废弃但仍在项目中的文件

* `src/pages/admin/AdvancementManager.tsx` - 根据 App.tsx 中的注释，此页面已被废弃

* 相关的路由和导入已被注释掉

* `src/store/advancementStore.ts` - 仅在 Schedule.tsx 和 SwissStage.tsx 中使用，需要验证是否还需要

### 2. 测试报告和覆盖率文件（构建产物）

* `tests/reports/coverage/**/*` - 测试覆盖率报告，属于构建产物

* `tests/reports/test-results.xml` - 测试结果文件，属于构建产物

* `src/tests/reports/coverage/**/*` - 重复的测试覆盖率报告

* `src/tests/reports/test-results.xml` - 重复的测试结果文件

### 3. 已标记废弃的旧版编辑器组件

* `src/pages/admin/components/EliminationStageEditor.tsx` - 已标记废弃，建议使用可视化编辑器

* `src/pages/admin/components/SwissStageEditor.tsx` - 已标记废弃，建议使用可视化编辑器

* `src/pages/admin/components/MatchSection.tsx` - 仅被废弃的编辑器使用

* `src/pages/admin/components/MatchRow.tsx` - 仅被废弃的编辑器使用

* `src/pages/admin/components/MatchSearchBox.tsx` - 仅被废弃的编辑器使用

* `src/pages/admin/hooks/useMatchFilter.ts` - 仅被废弃的编辑器使用

* `src/pages/admin/hooks/useTempMatchManager.ts` - 仅被废弃的编辑器使用

### 4. 潜在未使用的组件（根据引用分析）

* `src/components/features/EditableMatchCard.tsx` - 虽然存在但没有被任何文件导入使用

### 5. 计划文件（非必要代码文件）

* `.trae/documents/` 目录下的大量计划文件，这些是历史计划文件

## 清理步骤

### 第一阶段：安全删除（确认废弃的文件）

1. 删除 `src/pages/admin/AdvancementManager.tsx` - 已在 App.tsx 中被注释掉
2. 删除相关的测试文件 `tests/unit/store/advancementStore.test.ts`

### 第二阶段：删除构建产物

1. 删除 `tests/reports/` 目录下的所有内容
2. 删除 `src/tests/reports/` 目录下的所有内容

### 第三阶段：删除已标记废弃的旧版编辑器组件

1. 删除 `src/pages/admin/components/EliminationStageEditor.tsx`
2. 删除 `src/pages/admin/components/SwissStageEditor.tsx`
3. 删除 `src/pages/admin/components/MatchSection.tsx`
4. 删除 `src/pages/admin/components/MatchRow.tsx`
5. 删除 `src/pages/admin/components/MatchSearchBox.tsx`
6. 删除 `src/pages/admin/hooks/useMatchFilter.ts`
7. 删除 `src/pages/admin/hooks/useTempMatchManager.ts`

### 第四阶段：删除未使用的组件

1. 删除 `src/components/features/EditableMatchCard.tsx`

### 第五阶段：清理文档

1. 整理 `.trae/documents/` 目录，保留重要规划文件，删除过时文件

## 风险评估

### 低风险项：

* 构建产物文件（测试报告等）：可以安全删除

* 已明确标记为废弃的文件（如旧版编辑器组件）

* 已在代码中注释掉的废弃页面（AdvancementManager）

### 中等风险项：

* EditableMatchCard.tsx：需要再次确认没有被间接引用

### 验证步骤
1. 在删除前，使用全文搜索确保目标文件确实没有被引用
2. **每个阶段删除后都要执行以下步骤**：
   - 运行测试：`npm run test`
   - 运行类型检查：`npm run check`
   - 运行构建：`npm run build`
   - 确保所有测试通过且构建成功
3. 如有失败，立即回滚该阶段的删除操作

## 实施顺序
1. 首先备份相关文件
2. 执行第一阶段删除（AdvancementManager）
3. 运行测试和构建验证（确保项目完整性）
4. 执行第二阶段删除（构建产物）
5. 运行测试和构建验证（确保项目完整性）
6. 执行第三阶段删除（旧版编辑器组件）
7. 运行测试和构建验证（确保项目完整性）
8. 执行第四阶段删除（未使用组件）
9. 运行测试和构建验证（确保项目完整性）
10. 执行第五阶段清理（文档整理）
11. 最终验证（运行完整测试套件和构建）

## 预期收益

* 减少项目体积（预计减少约 500+ 行废弃代码）

* 提高代码库整洁度

* 减少维护负担

* 改善构建性能

* 消除混淆（避免开发者使用废弃组件）

## 删除清单

### 待删除文件列表（共 12 个文件）：

#### 第一阶段（1 个文件）：

* [ ] `src/pages/admin/AdvancementManager.tsx`

#### 第二阶段（构建产物，整个目录）：

* [ ] `tests/reports/` 目录

* [ ] `src/tests/reports/` 目录

#### 第三阶段（7 个文件）：

* [ ] `src/pages/admin/components/EliminationStageEditor.tsx`

* [ ] `src/pages/admin/components/SwissStageEditor.tsx`

* [ ] `src/pages/admin/components/MatchSection.tsx`

* [ ] `src/pages/admin/components/MatchRow.tsx`

* [ ] `src/pages/admin/components/MatchSearchBox.tsx`

* [ ] `src/pages/admin/hooks/useMatchFilter.ts`

* [ ] `src/pages/admin/hooks/useTempMatchManager.ts`

#### 第四阶段（1 个文件）：

* [ ] `src/components/features/EditableMatchCard.tsx`

#### 第五阶段（可选）：

* [ ] 整理 `.trae/documents/` 目录下的历史计划文件

### 保留文件（不应删除）：

* `src/store/advancementStore.ts` - 仍在使用

* `tests/unit/store/advancementStore.test.ts` - 对应 store 的测试

