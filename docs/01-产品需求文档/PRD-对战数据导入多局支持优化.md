# PRD - 对战数据导入多局支持优化

> **文档版本**：v1.3
> **创建日期**：2026-04-25
> **文档类型**：产品需求文档（PRD）
> **关联文档**：
> - [对战数据导入模板设计方案 v2.0](../03-技术方案文档/对战数据导入模板设计方案.md)
> - [对战数据导入模板优化方案 v3.0](../03-技术方案文档/对战数据导入模板优化方案-v3.md)
> - [PRD - 对战数据展示](PRD-对战数据展示.md)

---

## 一、需求背景

### 1.1 现状分析

当前对战数据导入功能采用**单文件单局**模式：一个 Excel 文件仅包含一个 Sheet，对应一局对局数据。对于 BO3、BO5 等多局赛制的对战，管理员需要：

1. 重复下载模板
2. 分别填写 2~3 个（BO3）或 3~5 个（BO5）Excel 文件
3. 逐个上传导入

**当前模板结构**（单 Sheet，固定 18 行）：

```
MatchData_BLG_vs_WBG_BO3_Game1.xlsx
└── Sheet: MatchData（单局数据，18行固定结构）
    ├── 第 1-2 行：MatchInfo（对战信息）
    ├── 第 3-5 行：TeamStats（战队数据）
    ├── 第 6-16 行：PlayerStats（选手数据）
    └── 第 17-18 行：BAN 数据
```

### 1.2 痛点

| 痛点 | 描述 | 影响 |
|------|------|------|
| 操作繁琐 | BO3 需要导入 2~3 次，BO5 需要导入 3~5 次 | 管理效率低 |
| 文件管理复杂 | 多个文件容易混淆局数对应关系 | 出错概率高 |
| 局数填写不一致 | 表格内"局数"字段与实际文件对应的局数可能不一致 | 数据准确性风险 |
| 缺少局数校验 | 无法校验填写的局数是否超出赛制限制 | 数据一致性风险 |

### 1.3 优化目标

1. **一个文件导入同一场对战的多局信息**：通过 Excel 多 Sheet 区分不同对局
2. **Sheet 名称标准化**：统一 Sheet 命名规则，自动解析局数
3. **局数一致性校验**：Sheet 名称与表格内"局数"字段交叉验证
4. **赛制合法性校验**：根据 BO1/BO3/BO5 校验局数有效性
5. **局数唯一性校验**：防止同一局数据重复导入

---

## 二、需求范围

### 2.1 功能范围

| 功能项 | 优先级 | 说明 |
|--------|--------|------|
| 多 Sheet 导入支持 | P0 | 核心功能，支持一个 Excel 文件包含多个 Sheet |
| Sheet 名称解析与校验 | P0 | 解析 Sheet 名称获取局数，并进行格式校验 |
| 局数一致性校验与告警 | P0 | Sheet 局数与表格局数字段不一致时告警 |
| 赛制合法性校验 | P0 | 局数不能超出赛制上限 |
| 局数唯一性校验 | P0 | 多个 Sheet 的局数不能重复 |
| 基于比分动态生成模板 | P0 | 根据已结束对战的比分动态计算 Sheet 数量 |

### 2.2 非功能范围

- 不涉及数据库表结构变更
- 不涉及前端对战数据展示页面的修改
- 不涉及选手匹配逻辑的修改

---

## 三、功能需求详细设计

### 3.1 多 Sheet 导入模板设计

#### 3.1.1 新模板结构

优化后的模板支持通过多个 Sheet 承载同一场对战的多局数据，每个 Sheet 对应一局对局信息。

**文件命名规则**：

```
驴酱杯对战信息_{红方战队}_vs_{蓝方战队}_{赛制}.xlsx
```

示例：
- `驴酱杯对战信息_BLG_vs_WBG_BO3.xlsx`（包含 2~3 个 Sheet）
- `驴酱杯对战信息_JDG_vs_TES_BO5.xlsx`（包含 3~5 个 Sheet）

**Sheet 命名规则**（必须遵守）：

| 格式 | 示例 | 解析局数 |
|------|------|----------|
| 第X局（中文数字） | 第一局、第二局、第三局 | 1、2、3 |
| 第X局（阿拉伯数字） | 第1局、第2局、第3局 | 1、2、3 |

**支持的中文数字映射**：

| 中文 | 数值 |
|------|------|
| 一 | 1 |
| 二 | 2 |
| 三 | 3 |
| 四 | 4 |
| 五 | 5 |

**每个 Sheet 内部结构**（与现有模板一致，18 行固定结构）：

```
Sheet: 第一局（或 第1局）
├── 第 1-2 行：MatchInfo（对战信息，含"局数"字段）
├── 第 3-5 行：TeamStats（战队数据）
├── 第 6-16 行：PlayerStats（选手数据）
└── 第 17-18 行：BAN 数据
```

#### 3.1.2 模板生成规则

下载模板时，根据**已结束对战的比分**动态计算 Sheet 数量。Sheet 数量 = 双方比分之和（即实际对局数）。

**计算规则**：

```
Sheet数量 = scoreA + scoreB
```

| 赛制 | 比分 | Sheet 数量 | Sheet 名称 |
|------|------|-----------|-----------|
| BO1 | 1:0 | 1 | 第一局 |
| BO3 | 2:0 | 2 | 第一局、第二局 |
| BO3 | 2:1 | 3 | 第一局、第二局、第三局 |
| BO5 | 3:0 | 3 | 第一局、第二局、第三局 |
| BO5 | 3:1 | 4 | 第一局、第二局、第三局、第四局 |
| BO5 | 3:2 | 5 | 第一局、第二局、第三局、第四局、第五局 |

**比分校验**：

- 只有状态为 `finished` 的对战才能下载模板
- 比分必须满足赛制约束（BO1 的胜方得分必须为1，BO3 的胜方得分必须为2或3，BO5 的胜方得分必须为3、4或5）
- 如果比分不满足赛制约束，提示用户先修正比分

**每个 Sheet 的 MatchInfo 示例数据中"局数"字段**应与 Sheet 名称解析的局数保持一致：

| Sheet 名称 | MatchInfo 局数字段示例值 |
|-----------|------------------------|
| 第一局 | 1 |
| 第二局 | 2 |
| 第三局 | 3 |

**模板文件命名**：

下载模板时，文件名包含对战信息：

```
驴酱杯对战信息_{红方战队}_vs_{蓝方战队}_{赛制}.xlsx
```

#### 3.1.3 模板下载 API 变更

当前模板下载 API `GET /admin/matches/import/template` 不携带对战信息，生成的是通用单 Sheet 模板。

**优化方案**：模板下载 API 必须指定对战 ID，根据对战的比分动态生成对应数量的 Sheet。

```
GET /admin/matches/:matchId/import/template
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| matchId | string | 是 | 对战 ID（路径参数） |

**后端逻辑**：

1. 根据 `matchId` 查询对战信息（`bo_format`、`score_a`、`score_b`、`team_a_id`、`team_b_id`）
2. 校验对战状态为 `finished`
3. 计算 Sheet 数量：`sheetCount = score_a + score_b`
4. 生成对应数量的 Sheet，每个 Sheet 填充**已知字段**，**未知字段留空**（见下方字段填充规则）
5. 返回 Excel 文件

**字段填充规则**：

模板生成时，根据已知信息自动填充部分字段，用户只需填写剩余必填字段。填充原则：
- **能确定就填充**：根据对战信息可以直接确定的字段
- **不确定就留空**：可能因局而异的字段（如每局红蓝方交换）、用户主观选择的字段（如 MVP、BV号）一律留空，避免误导

| 数据块 | 字段 | 是否填充 | 填充值 | 说明 |
|--------|------|---------|--------|------|
| MatchInfo | 红方战队名 | ✅ 填充 | 对战信息中的红方战队名 | 从对战信息获取，固定不变 |
| MatchInfo | 蓝方战队名 | ✅ 填充 | 对战信息中的蓝方战队名 | 从对战信息获取，固定不变 |
| MatchInfo | 局数 | ✅ 填充 | 当前 Sheet 对应的局数 | 根据 Sheet 名称解析，如第一局=1 |
| MatchInfo | 比赛时间 | ❌ 留空 | - | 每局时间可能不同，由用户填写 |
| MatchInfo | 游戏时长 | ❌ 留空 | - | 每局时长不同，由用户填写 |
| MatchInfo | 获胜方 | ❌ 留空 | - | 每局获胜方不同，由用户填写 |
| MatchInfo | MVP | ❌ 留空 | - | 每局 MVP 不同，由用户填写 |
| MatchInfo | 视频BV号 | ❌ 留空 | - | 每局 BV号不同，由用户填写 |
| TeamStats | 阵营 | ✅ 填充 | red / blue | 红方行填 red，蓝方行填 blue |
| TeamStats | 战队名 | ❌ 留空 | - | 每局红蓝方可能交换，模板无法确定哪方是红方，由用户填写 |
| TeamStats | 其他数据字段 | ❌ 留空 | - | 击杀、死亡等数据由用户填写 |
| PlayerStats | 阵营 | ✅ 填充 | red / blue | 红方5人填 red，蓝方5人填 blue |
| PlayerStats | 位置 | ✅ 填充 | TOP/JUNGLE/MID/ADC/SUPPORT | 位置固定，按顺序填充 |
| PlayerStats | 选手昵称 | ❌ 留空 | - | 需要用户填写 |
| PlayerStats | 英雄名 | ❌ 留空 | - | 需要用户填写 |
| PlayerStats | 其他数据字段 | ❌ 留空 | - | KDA、经济等数据由用户填写 |
| BAN | 红方BAN | ❌ 留空 | - | 需要用户填写 |
| BAN | 蓝方BAN | ❌ 留空 | - | 需要用户填写 |

**未填充字段处理**：
- 留空的单元格不设置示例值或占位文字，保持完全空白
- 避免因示例值误导用户（如示例战队名可能不是实际的战队）
- 用户打开模板后，只需关注**未填充的必填字段**，减少填写工作量

### 3.2 Sheet 名称解析规则

#### 3.2.1 解析逻辑

系统按以下规则解析 Sheet 名称，提取局数信息：

1. **匹配正则表达式**：`/^第([一二三四五1-5])局$/`
2. **提取局数**：
   - 阿拉伯数字：直接转换为数值
   - 中文数字：通过映射表转换为数值
3. **忽略不匹配的 Sheet**：Sheet 名称不符合规则时，该 Sheet 不参与导入

#### 3.2.2 Sheet 名称校验规则

| 校验项 | 规则 | 错误码 | 错误信息 |
|--------|------|--------|----------|
| 格式校验 | 必须匹配 `第X局` 格式 | `SHEET_NAME_INVALID` | Sheet「{sheetName}」名称格式错误，应为"第X局"格式（X为1-5的数字或中文数字） |
| 局数范围 | 解析的局数必须在 1-5 之间 | `SHEET_NAME_INVALID` | Sheet「{sheetName}」解析的局数超出范围，局数必须在1-5之间 |

#### 3.2.3 Sheet 处理优先级

当 Excel 文件中存在多个 Sheet 时，按以下规则处理：

1. **仅处理名称匹配的 Sheet**：名称不符合 `第X局` 格式的 Sheet 被忽略
2. **按局数排序处理**：按解析出的局数从小到大依次处理
3. **至少一个有效 Sheet**：如果没有任何 Sheet 名称匹配，返回错误

### 3.3 局数一致性校验

#### 3.3.1 校验规则

对于每个有效 Sheet，系统需要校验 **Sheet 名称解析的局数** 与 **MatchInfo 中"局数"字段的值** 是否一致：

| 场景 | Sheet 局数 | MatchInfo 局数 | 处理方式 |
|------|-----------|---------------|----------|
| 一致 | 1 | 1 | 正常导入 |
| 不一致 | 1 | 2 | 告警提示，用户确认后以 Sheet 局数为准 |
| MatchInfo 局数为空 | 1 | 空/0 | 以 Sheet 局数为准，不告警 |

#### 3.3.2 告警提示设计

当检测到不一致时，系统返回告警信息，由前端展示确认对话框：

**告警信息格式**：

```json
{
  "code": 40010,
  "message": "局数不一致",
  "data": {
    "warnings": [
      {
        "sheetName": "第一局",
        "sheetGameNumber": 1,
        "excelGameNumber": 2,
        "resolvedGameNumber": 1,
        "message": "Sheet「第一局」解析的局数为1，但表格中填写的局数为2，将以Sheet名称的局数1为准"
      }
    ]
  }
}
```

**前端交互流程**：

```
用户上传文件
    ↓
后端解析并校验
    ↓
┌─ 校验通过，无告警 → 直接导入
│
├─ 存在局数不一致告警 → 弹出确认对话框
│   ├─ 用户确认导入 → 以 Sheet 局数为准，继续导入
│   └─ 用户取消 → 终止导入
│
└─ 校验失败（其他错误）→ 显示错误信息
```

#### 3.3.3 最终局数取值规则

| 条件 | 最终局数取值 |
|------|-------------|
| Sheet 局数与 MatchInfo 局数一致 | 取一致值 |
| Sheet 局数与 MatchInfo 局数不一致，用户确认导入 | 取 Sheet 局数 |
| MatchInfo 局数为空或0 | 取 Sheet 局数，不告警 |

### 3.4 赛制合法性校验

#### 3.4.1 校验规则

系统根据当前对战的赛制（`bo_format`）校验每个 Sheet 解析的局数是否有效：

| 赛制 | 有效局数范围 | 最大局数 |
|------|-------------|---------|
| BO1 | 1 | 1 |
| BO3 | 1, 2, 3 | 3 |
| BO5 | 1, 2, 3, 4, 5 | 5 |

#### 3.4.2 校验时机

赛制合法性校验在 Sheet 名称解析后、数据导入前执行。如果任何 Sheet 的局数超出赛制限制，整个导入操作被拒绝。

#### 3.4.3 错误信息

```json
{
  "code": 40011,
  "message": "局数超出赛制限制",
  "errors": [
    "Sheet「第三局」解析的局数为3，但当前对战的赛制为BO1，最多允许1局"
  ]
}
```

### 3.5 局数唯一性校验

#### 3.5.1 校验规则

当 Excel 文件包含多个 Sheet 时，系统校验所有 Sheet 解析出的局数是否唯一：

| 场景 | 示例 | 结果 |
|------|------|------|
| 局数唯一 | 第一局、第二局、第三局 | 通过 |
| 局数重复 | 第一局、第1局、第二局 | 不通过（两个第一局） |

#### 3.5.2 错误信息

```json
{
  "code": 40012,
  "message": "局数重复",
  "errors": [
    "Sheet「第一局」和Sheet「第1局」解析的局数均为1，局数不能重复"
  ]
}
```

---

## 四、导入流程设计

### 4.1 整体导入流程

```
用户选择对战 → 下载模板（根据比分动态生成多Sheet）→ 填写数据 → 上传文件
    ↓
后端接收文件
    ↓
解析所有Sheet名称 → 校验Sheet名称格式
    ↓
┌─ 无有效Sheet → 返回错误
│
├─ 校验局数唯一性
│   └─ 不唯一 → 返回错误
│
├─ 校验赛制合法性
│   └─ 不合法 → 返回错误
│
├─ 逐Sheet解析数据
│   ↓
│   校验局数一致性
│   ┌─ 一致 → 继续
│   └─ 不一致 → 返回告警，等待用户确认
│
├─ 执行数据校验（战队名、选手、英雄等）
│
└─ 逐Sheet导入数据 → 返回导入结果
```

### 4.2 导入结果响应

多局导入时，响应需要包含每局的导入结果：

```typescript
interface MultiGameImportResponse {
  /** 是否全部导入成功 */
  imported: boolean;
  /** 总导入局数 */
  totalGames: number;
  /** 各局导入结果 */
  results: Array<{
    /** 局数 */
    gameNumber: number;
    /** 该局是否导入成功 */
    imported: boolean;
    /** 导入的选手数据条数 */
    playerCount: number;
    /** 失败的选手数量 */
    failedCount: number;
    /** 是否为覆盖导入 */
    overwritten: boolean;
    /** 失败详情 */
    failedPlayers?: MatchDataImportError[];
    /** 错误信息（该局导入失败时） */
    error?: string;
  }>;
  /** 局数不一致告警（需用户确认） */
  warnings?: Array<{
    sheetName: string;
    sheetGameNumber: number;
    excelGameNumber: number;
    resolvedGameNumber: number;
    message: string;
  }>;
}
```

### 4.3 导入模式

系统支持两种导入模式，通过 API 参数区分：

| 模式 | 参数 | 说明 |
|------|------|------|
| 预检模式 | `dryRun=true` | 仅校验不导入，返回校验结果和告警 |
| 导入模式 | `dryRun=false`（默认） | 校验通过后直接导入 |

**预检模式用途**：前端先调用预检，如果有告警则展示确认对话框，用户确认后再以导入模式调用。

### 4.4 导入策略

| 场景 | 策略 |
|------|------|
| 全部校验通过 | 逐 Sheet 导入，使用事务保证每局数据的原子性 |
| 部分局导入失败 | 已成功的局保留，失败的局返回错误信息 |
| 局数不一致告警 | 需用户确认后才执行导入，以 Sheet 局数为准 |

---

## 五、API 设计

### 5.1 导入 API 变更

**现有 API**：

```
POST /admin/matches/:matchId/games/import
Content-Type: multipart/form-data
Body: file (Excel文件)
```

**优化后 API**：

```
POST /admin/matches/:matchId/games/import
Content-Type: multipart/form-data
Body:
  - file: Excel文件（支持多Sheet）
  - dryRun: boolean（可选，默认false，预检模式）
  - confirmWarnings: boolean（可选，默认false，确认告警后继续导入）
```

**响应结构**：

```json
{
  "imported": true,
  "totalGames": 2,
  "results": [
    {
      "gameNumber": 1,
      "imported": true,
      "playerCount": 10,
      "failedCount": 0,
      "overwritten": false
    },
    {
      "gameNumber": 2,
      "imported": true,
      "playerCount": 10,
      "failedCount": 1,
      "overwritten": true,
      "failedPlayers": [
        {
          "row": 12,
          "nickname": "UnknownPlayer",
          "side": "blue",
          "type": "player_not_found",
          "message": "选手 UnknownPlayer 在蓝方战队中未找到"
        }
      ]
    }
  ]
}
```

**告警响应**（局数不一致时，`dryRun=false` 且 `confirmWarnings=false`）：

```json
{
  "code": 40010,
  "message": "局数不一致，请确认是否继续导入",
  "data": {
    "warnings": [
      {
        "sheetName": "第一局",
        "sheetGameNumber": 1,
        "excelGameNumber": 2,
        "resolvedGameNumber": 1,
        "message": "Sheet「第一局」解析的局数为1，但表格中填写的局数为2，将以Sheet名称的局数1为准"
      }
    ],
    "totalGames": 2,
    "results": []
  }
}
```

### 5.2 模板下载 API 变更

**现有 API**：

```
GET /admin/matches/import/template
```

**优化后 API**：

```
GET /admin/matches/:matchId/import/template
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| matchId | string | 是 | 对战 ID（路径参数） |

**后端处理逻辑**：

1. 查询对战信息（`bo_format`、`score_a`、`score_b`、战队信息）
2. 校验对战状态为 `finished`，否则返回错误
3. 计算 Sheet 数量：`sheetCount = score_a + score_b`
4. 生成包含 `sheetCount` 个 Sheet 的 Excel 文件
5. 每个 Sheet 填充对应战队名和局数的示例数据
6. 文件名格式：`驴酱杯对战信息_{战队A}_vs_{战队B}_{赛制}.xlsx`

**响应**：下载 Excel 文件，包含根据比分动态生成的对应数量 Sheet。

**错误响应**：

| 场景 | 错误码 | 错误信息 |
|------|--------|----------|
| 对战不存在 | 404 | 对战不存在 |
| 对战未结束 | 40020 | 对战尚未结束，无法下载模板 |
| 比分无效 | 40021 | 对战比分无效，请先修正比分 |

### 5.3 错误码定义

| 错误码 | 含义 | 触发场景 |
|--------|------|----------|
| 40001 | 数据验证失败 | 战队名不匹配、选手未找到等 |
| 40002 | 局数超出赛制限制 | 单个 Sheet 的局数超出 BO 限制 |
| 40010 | 局数不一致告警 | Sheet 局数与 MatchInfo 局数不一致 |
| 40011 | 局数超出赛制限制（多Sheet） | Sheet 名称解析的局数超出赛制限制 |
| 40012 | 局数重复 | 多个 Sheet 解析出相同的局数 |
| 40013 | 无有效Sheet | 没有任何 Sheet 名称匹配规则 |
| 40014 | Sheet名称格式错误 | Sheet 名称不符合"第X局"格式 |
| 40020 | 对战未结束 | 下载模板时对战状态非 finished |
| 40021 | 比分无效 | 下载模板时对战比分不满足赛制约束 |

---

## 六、校验规则汇总

### 6.1 校验执行顺序

导入时按以下顺序依次执行校验，任一环节失败即终止：

```
1. Sheet名称格式校验 → 确保至少一个有效Sheet
2. 局数唯一性校验 → 确保Sheet局数不重复
3. 赛制合法性校验 → 确保局数不超出赛制限制
4. 逐Sheet数据解析 → 解析MatchInfo、TeamStats、PlayerStats、BAN数据
5. 局数一致性校验 → 比对Sheet局数与MatchInfo局数
6. 战队名称匹配校验 → 确保Excel战队名与对战战队名一致
7. 数据字段校验 → 必填、格式、范围等
8. 英雄名称校验 → BAN和选手使用英雄
9. 选手匹配校验 → 选手昵称与战队关联
```

### 6.2 校验规则详细说明

#### 6.2.1 Sheet 名称格式校验

| 规则 | 说明 |
|------|------|
| 正则表达式 | `/^第([一二三四五1-5])局$/` |
| 有效示例 | 第一局、第1局、第三局、第5局 |
| 无效示例 | 第一把、Game1、Sheet1、match1 |
| 容错 | 前后空格自动去除 |

#### 6.2.2 局数唯一性校验

| 规则 | 说明 |
|------|------|
| 校验对象 | 所有有效 Sheet 解析出的局数集合 |
| 通过条件 | 集合中无重复值 |
| 失败示例 | Sheet「第一局」和「第1局」解析出局数均为 1 |

#### 6.2.3 赛制合法性校验

| 赛制 | 有效局数 | 无效示例 |
|------|---------|---------|
| BO1 | {1} | Sheet「第二局」→ 局数2 |
| BO3 | {1, 2, 3} | Sheet「第四局」→ 局数4 |
| BO5 | {1, 2, 3, 4, 5} | 无（1-5均在范围内） |

#### 6.2.4 局数一致性校验

| Sheet 局数 | MatchInfo 局数 | 结果 | 处理 |
|-----------|---------------|------|------|
| 1 | 1 | 一致 | 正常导入 |
| 1 | 2 | 不一致 | 告警，用户确认后以 Sheet 局数为准 |
| 1 | 空/0 | MatchInfo 缺失 | 以 Sheet 局数为准，不告警 |
| 1 | 非数字 | MatchInfo 格式错误 | 以 Sheet 局数为准，告警 |

---

## 七、交互设计

### 7.1 导入对话框交互流程

#### 7.1.1 正常导入流程（无告警）

```
[上传文件] → [解析中...] → [导入预览] → [确认导入] → [导入成功]
```

**导入预览展示**（多局）：

```
┌─────────────────────────────────────────┐
│  导入预览                                │
│                                         │
│  本次将导入 2 局数据：                    │
│                                         │
│  ✓ 第1局：10名选手数据                   │
│  ✓ 第2局：10名选手数据（覆盖已有数据）    │
│                                         │
│  [确认导入]  [取消]                      │
└─────────────────────────────────────────┘
```

#### 7.1.2 局数不一致告警流程

```
[上传文件] → [解析中...] → [局数不一致告警] → [用户确认] → [导入预览] → [确认导入]
                                      ↓
                               [用户取消] → 终止
```

**告警确认对话框**：

```
┌─────────────────────────────────────────────────────────┐
│  ⚠ 局数不一致告警                                       │
│                                                         │
│  检测到以下Sheet的局数与表格中填写的局数不一致：          │
│                                                         │
│  Sheet「第一局」解析的局数为1，但表格中填写的局数为2     │
│  → 将以Sheet名称的局数1为准                              │
│                                                         │
│  是否继续导入？                                          │
│                                                         │
│  [继续导入]  [取消]                                     │
└─────────────────────────────────────────────────────────┘
```

#### 7.1.3 校验失败流程

```
[上传文件] → [解析中...] → [校验失败] → [显示错误详情]
```

**校验失败展示**：

```
┌─────────────────────────────────────────────────────────┐
│  ✗ 导入校验失败                                         │
│                                                         │
│  错误类型：局数重复                                      │
│  Sheet「第一局」和Sheet「第1局」解析的局数均为1          │
│                                                         │
│  错误类型：局数超出赛制限制                              │
│  Sheet「第三局」解析的局数为3，但当前赛制为BO1           │
│                                                         │
│  [关闭]                                                 │
└─────────────────────────────────────────────────────────┘
```

#### 7.1.4 文件清除规则

为避免用户重复上传文件时产生混淆，导入对话框需要在以下场景自动清除已上传的文件：

| 场景 | 清除时机 | 说明 |
|------|---------|------|
| 用户取消告警确认 | 后台及时清除 | 用户点击"取消"后，在后台及时清除上传的冗余文件，重置所有导入状态 |
| 导入成功 | 后台及时清除 | 显示成功提示后，在后台及时清除上传的冗余文件，避免占用存储空间 |
| 校验失败 | 后台清除错误文件 | 校验失败说明导入文件数据错误，应在后台自动清除该文件，用户需修正后重新上传 |
| 用户手动关闭对话框 | 后台及时清除 | 对话框关闭时，在后台及时清除上传的冗余文件，避免残留 |

**文件清除实现**：

```
用户取消告警：
  [点击取消] → 前端清除文件状态(selectedFile = null) → 后台删除上传的冗余文件 → 关闭对话框 → 重置所有导入状态

导入成功：
  [显示成功提示] → 前端清除文件状态(selectedFile = null) → 后台删除上传的冗余文件 → 关闭对话框 → 刷新对战列表

校验失败：
  [显示错误] → 后台自动清除错误文件 → 前端清除文件状态

手动关闭对话框：
  [关闭对话框] → 前端清除文件状态 → 后台删除上传的冗余文件
```

**关键约束**：
- 文件清除必须在对话框关闭前完成，确保下次打开时不会残留上一次的文件
- 清除操作不影响已导入的数据，仅重置前端上传状态
- 用户再次打开导入对话框时，必须重新上传文件

### 7.2 模板下载交互

用户必须先选择一场已结束的对战，才能下载对应的导入模板。模板根据对战的比分动态生成对应数量的 Sheet。

#### 7.2.1 交互流程

```
[对战列表页] → [点击某对战的"下载模板"按钮] → [根据比分动态生成模板] → [下载Excel文件]
```

#### 7.2.2 对战列表页改造

当前对战列表页（MatchDataList）的"下载模板"按钮位于搜索栏旁，不关联具体对战。优化后，将"下载模板"按钮移至每行对战记录的操作列中。

**改造前**：

```
┌──────────────────────────────────────────────────────────────────┐
│  对战数据管理                                                     │
│                                                                  │
│  [搜索战队名称...]                    [下载模板]                  │
│                                                                  │
│  比赛          赛制   比赛时间         比分     操作              │
│  BLG vs WBG   BO3   2026-04-16      2:1     [管理数据] [导入数据]│
│  JDG vs TES   BO5   2026-04-17      3:2     [管理数据] [导入数据]│
└──────────────────────────────────────────────────────────────────┘
```

**改造后**：

```
┌──────────────────────────────────────────────────────────────────────────┐
│  对战数据管理                                                             │
│                                                                          │
│  [搜索战队名称...]                                                       │
│                                                                          │
│  比赛          赛制   比赛时间         比分     操作                      │
│  BLG vs WBG   BO3   2026-04-16      2:1     [下载模板] [管理数据] [导入数据]│
│  JDG vs TES   BO5   2026-04-17      3:2     [下载模板] [管理数据] [导入数据]│
└──────────────────────────────────────────────────────────────────────────┘
```

#### 7.2.3 下载模板按钮行为

点击某对战的"下载模板"按钮时：

1. **调用 API**：`GET /admin/matches/:matchId/import/template`
2. **按钮状态**：点击后显示 loading 状态（"生成中..."）
3. **下载文件**：API 返回后自动下载 Excel 文件
4. **文件名**：`驴酱杯对战信息_{战队A}_vs_{战队B}_{赛制}.xlsx`
5. **错误处理**：
   - 对战未结束 → toast 提示"对战尚未结束，无法下载模板"
   - 比分无效 → toast 提示"对战比分无效，请先修正比分"

#### 7.2.4 导入对话框改造

导入对话框中的"导入说明"更新，增加模板下载引导：

```
导入说明：
• 支持 .xlsx 和 .xls 格式的 Excel 文件
• 文件大小不超过 10MB
• 支持多Sheet导入：每个Sheet对应一局对局数据
• Sheet名称须为"第X局"格式（如：第一局、第1局）
• 导入后将覆盖对应局的现有数据
• 请确保 Excel 格式符合模板要求

💡 如需模板，请在对战列表中点击对应对战的"下载模板"按钮
```

#### 7.2.5 模板下载与导入的关联关系

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  对战列表页   │────▶│  下载模板     │────▶│  填写数据    │
│  选择对战     │     │  根据比分生成  │     │  按Sheet填写 │
└──────┬──────┘     └──────────────┘     └──────┬──────┘
       │                                        │
       │         ┌──────────────┐               │
       └────────▶│  导入数据     │◀──────────────┘
                 │  上传Excel    │
                 └──────────────┘
```

**关键约束**：

- 下载模板和导入数据必须针对同一场对战
- 模板中预填的战队名、局数与对战信息一致，减少填写错误
- 导入时校验 Excel 中的战队名是否与所选对战一致

### 7.3 导入说明更新

导入对话框中的说明文字更新为：

```
导入说明：
• 支持 .xlsx 和 .xls 格式的 Excel 文件
• 文件大小不超过 10MB
• 支持多Sheet导入：每个Sheet对应一局对局数据
• Sheet名称须为"第X局"格式（如：第一局、第1局）
• 导入后将覆盖对应局的现有数据
• 请确保 Excel 格式符合模板要求

💡 如需模板，请在对战列表中点击对应对战的"下载模板"按钮
```

---

## 八、向后兼容性说明

### 8.1 不兼容旧版单 Sheet 模板

本次优化**不再兼容旧版单 Sheet 模板**，原因如下：

1. **模板结构变化**：新模板采用多 Sheet 结构，Sheet 名称承载局数信息，旧版单 Sheet 模板无法满足
2. **模板下载流程变化**：新版必须先选择对战再下载模板，模板根据比分动态生成
3. **导入校验强化**：新版强制要求 Sheet 名称符合 `第X局` 格式，旧版 Sheet 名称（如 `MatchData`）将无法通过校验

### 8.2 迁移方案

- 旧版模板文件将无法导入，系统返回错误提示："未找到有效的Sheet，Sheet名称须为'第X局'格式"
- 管理员需重新下载新版模板并按新格式填写数据
- 已导入的历史数据不受影响，无需迁移

### 8.3 API 变更

- **模板下载 API**：`GET /admin/matches/import/template` → `GET /admin/matches/:matchId/import/template`（必须指定对战 ID）
- **导入 API**：响应结构从单局结果变更为多局结果数组
- **模板刷新 API**：`GET /admin/matches/import/template/refresh` 废弃，模板不再缓存（每次根据对战信息动态生成）

---

## 九、异常场景处理

### 9.1 异常场景汇总

| 场景 | 处理方式 |
|------|----------|
| Excel 文件无任何 Sheet | 返回错误：Excel文件中没有工作表 |
| 所有 Sheet 名称均不匹配 | 返回错误：未找到有效的Sheet，Sheet名称须为"第X局"格式 |
| 使用旧版单Sheet模板导入 | 返回错误：未找到有效的Sheet，Sheet名称须为"第X局"格式 |
| 部分局导入成功、部分失败 | 成功的局保留，返回每局的导入结果 |
| 同一局数据已存在 | 覆盖导入，标记 `overwritten: true` |
| Sheet 内数据行数不足 | 返回该 Sheet 的解析错误 |
| Sheet 内战队名不匹配 | 返回该 Sheet 的校验错误 |
| 文件过大 | 前端校验拦截（10MB 限制） |
| 网络中断 | 事务回滚，已导入的局数据保留 |

### 9.2 事务策略

- **每局独立事务**：每个 Sheet 的导入使用独立事务，确保单局数据的原子性
- **不使用全局事务**：避免一个 Sheet 失败导致所有已成功导入的局回滚
- **部分成功处理**：前端根据 `results` 中每局的 `imported` 状态展示结果

---

## 十、非功能性需求

### 10.1 性能要求

| 指标 | 要求 |
|------|------|
| 单 Sheet 解析时间 | < 1秒 |
| 5 局导入总时间 | < 5秒 |
| 文件大小限制 | 10MB |

### 10.2 安全要求

- 导入 API 需要管理员权限（JWT + AdminRoleGuard）
- 文件类型校验（仅 .xlsx/.xls）
- 文件大小校验（≤ 10MB）

### 10.3 可观测性

- 导入操作记录日志（matchId、gameNumber、playerCount、failedCount）
- 校验失败记录详细错误信息
- 覆盖导入记录原有数据信息

---

## 十一、测试要点

### 11.1 功能测试

| 测试场景 | 预期结果 |
|----------|----------|
| 上传包含3个Sheet的BO3模板（比分2:1） | 3局数据全部导入成功 |
| 上传包含2个Sheet的BO3模板（比分2:0） | 2局数据导入成功 |
| Sheet名称为"第一局"、"第2局"混合格式 | 正确解析局数 |
| Sheet名称为"第一把"等无效格式 | 该Sheet被忽略，提示错误 |
| 所有Sheet名称无效 | 返回错误，导入失败 |
| Sheet局数与MatchInfo局数一致 | 正常导入，无告警 |
| Sheet局数与MatchInfo局数不一致 | 返回告警，用户确认后以Sheet局数为准 |
| 用户取消不一致告警 | 终止导入，无数据写入 |
| BO1对战中Sheet局数为2 | 返回错误：局数超出赛制限制 |
| 两个Sheet解析出局数均为1 | 返回错误：局数重复 |
| 使用旧版单Sheet模板导入 | 返回错误：未找到有效的Sheet |
| 部分局数据校验失败 | 成功的局导入，失败的局返回错误 |
| 下载模板时对战未结束 | 返回错误：对战尚未结束 |
| 下载模板时比分无效 | 返回错误：对战比分无效 |

### 11.2 边界测试

| 测试场景 | 预期结果 |
|----------|----------|
| Sheet名称含前后空格（如" 第一局 "） | 自动去除空格后正确解析 |
| MatchInfo局数字段为空 | 以Sheet局数为准，不告警 |
| MatchInfo局数字段为非数字 | 以Sheet局数为准，告警 |
| 文件仅包含1个有效Sheet | 正常导入1局 |
| BO5对战中5个Sheet全部填写 | 5局全部导入成功 |
| 导入已有数据的局 | 覆盖导入，标记overwritten |

### 11.3 模板下载测试

| 测试场景 | 预期结果 |
|----------|----------|
| BO1 对战（比分1:0）下载模板 | 生成1个Sheet（第一局） |
| BO3 对战（比分2:0）下载模板 | 生成2个Sheet（第一局、第二局） |
| BO3 对战（比分2:1）下载模板 | 生成3个Sheet（第一局、第二局、第三局） |
| BO5 对战（比分3:2）下载模板 | 生成5个Sheet（第一局~第五局） |
| 未结束对战下载模板 | 返回错误提示 |
| 模板文件名包含战队名和赛制 | 文件名格式：驴酱杯对战信息_{战队A}_vs_{战队B}_{赛制}.xlsx |
| 使用旧版单Sheet模板导入 | 返回错误：未找到有效的Sheet |

---

## 十二、实施计划

### 12.1 开发任务拆分

| 阶段 | 任务 | 优先级 |
|------|------|--------|
| 后端 - Sheet解析 | 实现Sheet名称解析与校验工具函数 | P0 |
| 后端 - 导入逻辑 | 改造importMatchData支持多Sheet遍历 | P0 |
| 后端 - 校验逻辑 | 实现局数一致性、唯一性、赛制校验 | P0 |
| 后端 - 模板生成 | 改造模板生成：根据比分动态生成多Sheet，移除缓存机制 | P0 |
| 后端 - API | 调整导入API参数和响应结构；模板下载API改为按matchId生成 | P0 |
| 前端 - 对战列表页 | "下载模板"按钮从搜索栏移至每行操作列 | P0 |
| 前端 - 导入对话框 | 支持多局导入预览和告警确认 | P0 |
| 前端 - 模板下载 | 适配新API，传入matchId下载模板 | P0 |
| 测试 | 单元测试、集成测试、E2E测试 | P0 |

### 12.2 依赖关系

```
Sheet解析工具函数 → 导入逻辑改造 → API调整
                                    ↓
模板生成改造（比分动态生成）──→ 前端适配（下载按钮移至行内）
                                    ↓
                              测试验证
```

---

## 附录 A：Sheet 名称解析工具函数设计

```typescript
/**
 * 中文数字映射表
 */
const CHINESE_NUMBER_MAP: Record<string, number> = {
  '一': 1,
  '二': 2,
  '三': 3,
  '四': 4,
  '五': 5,
};

/**
 * Sheet名称正则表达式
 */
const SHEET_NAME_REGEX = /^第([一二三四五1-5])局$/;

/**
 * 解析Sheet名称，提取局数
 * @param sheetName Sheet名称
 * @returns 局数（1-5），不匹配返回null
 */
function parseSheetGameNumber(sheetName: string): number | null {
  const trimmed = sheetName.trim();
  const match = trimmed.match(SHEET_NAME_REGEX);
  if (!match) return null;

  const numStr = match[1];
  if (CHINESE_NUMBER_MAP[numStr] !== undefined) {
    return CHINESE_NUMBER_MAP[numStr];
  }
  return parseInt(numStr, 10);
}

/**
 * 校验多个Sheet的局数唯一性
 * @param sheetGameNumbers Sheet名称与解析局数的映射
 * @returns 校验结果
 */
function validateGameNumberUniqueness(
  sheetGameNumbers: Array<{ sheetName: string; gameNumber: number }>,
): ValidationResult {
  const errors: string[] = [];
  const numberMap = new Map<number, string[]>();

  for (const item of sheetGameNumbers) {
    if (!numberMap.has(item.gameNumber)) {
      numberMap.set(item.gameNumber, []);
    }
    numberMap.get(item.gameNumber)!.push(item.sheetName);
  }

  for (const [gameNumber, sheetNames] of numberMap) {
    if (sheetNames.length > 1) {
      errors.push(
        `Sheet「${sheetNames.join('」和Sheet「')}」解析的局数均为${gameNumber}，局数不能重复`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 校验局数是否在赛制允许范围内
 * @param gameNumber 局数
 * @param boFormat 赛制
 * @returns 是否有效
 */
function validateGameNumberForFormat(gameNumber: number, boFormat: string): boolean {
  const maxGames = { BO1: 1, BO3: 3, BO5: 5 }[boFormat] || 1;
  return gameNumber >= 1 && gameNumber <= maxGames;
}

/**
 * 根据比分计算模板Sheet数量
 * @param scoreA 战队A得分
 * @param scoreB 战队B得分
 * @returns Sheet数量（即实际对局数）
 */
function calculateSheetCount(scoreA: number, scoreB: number): number {
  return scoreA + scoreB;
}

/**
 * 校验比分是否满足赛制约束
 * @param scoreA 战队A得分
 * @param scoreB 战队B得分
 * @param boFormat 赛制
 * @returns 校验结果
 */
function validateScoreForFormat(
  scoreA: number,
  scoreB: number,
  boFormat: string,
): ValidationResult {
  const errors: string[] = [];
  const maxGames = { BO1: 1, BO3: 3, BO5: 5 }[boFormat] || 1;
  const winScore = { BO1: 1, BO3: 2, BO5: 3 }[boFormat] || 1;

  const totalGames = scoreA + scoreB;
  const maxScore = Math.max(scoreA, scoreB);
  const minScore = Math.min(scoreA, scoreB);

  if (totalGames < 1 || totalGames > maxGames) {
    errors.push(`比分 ${scoreA}:${scoreB} 的总场数不在1-${maxGames}范围内`);
  }

  if (maxScore !== winScore && maxScore <= maxGames) {
    // 胜方得分必须达到胜出条件
    if (maxScore < winScore) {
      errors.push(`${boFormat}赛制中胜方至少需要${winScore}分，当前最高分为${maxScore}`);
    }
  }

  if (minScore >= winScore) {
    errors.push(`双方得分均达到${winScore}，比分不合法`);
  }

  return { valid: errors.length === 0, errors };
}
```

## 附录 B：多 Sheet 导入解析流程伪代码

```
function importMultiSheetMatchData(matchId, file, options):
    // 1. 读取Excel文件
    workbook = readExcel(file)

    // 2. 解析所有Sheet名称
    validSheets = []
    for sheetName in workbook.SheetNames:
        gameNumber = parseSheetGameNumber(sheetName)
        if gameNumber !== null:
            validSheets.push({ sheetName, gameNumber, sheet: workbook.Sheets[sheetName] })

    // 3. 校验：至少一个有效Sheet
    if validSheets.length === 0:
        throw Error(40013, "未找到有效的Sheet，Sheet名称须为'第X局'格式")

    // 4. 校验：局数唯一性
    uniquenessResult = validateGameNumberUniqueness(validSheets)
    if !uniquenessResult.valid:
        throw Error(40012, uniquenessResult.errors)

    // 5. 校验：赛制合法性
    match = getMatch(matchId)
    for sheet in validSheets:
        if !validateGameNumberForFormat(sheet.gameNumber, match.bo_format):
            throw Error(40011, "Sheet「{sheet.sheetName}」解析的局数超出赛制限制")

    // 6. 逐Sheet解析数据
    warnings = []
    parsedResults = []
    for sheet in validSheets (sorted by gameNumber):
        parsedData = parseMatchDataExcel(sheet.sheet)

        // 7. 局数一致性校验
        if parsedData.matchInfo.gameNumber !== sheet.gameNumber:
            if parsedData.matchInfo.gameNumber > 0:
                warnings.push({
                    sheetName: sheet.sheetName,
                    sheetGameNumber: sheet.gameNumber,
                    excelGameNumber: parsedData.matchInfo.gameNumber,
                    resolvedGameNumber: sheet.gameNumber,
                    message: "..."
                })
            // 以Sheet局数为准
            parsedData.matchInfo.gameNumber = sheet.gameNumber

        parsedResults.push(parsedData)

    // 8. 如果有告警且用户未确认，返回告警
    if warnings.length > 0 && !options.confirmWarnings:
        return { code: 40010, warnings }

    // 9. 逐Sheet导入数据
    results = []
    for parsedData in parsedResults:
        result = importSingleGameData(matchId, parsedData)
        results.push(result)

    return { imported: true, totalGames: results.length, results }
```

---

**文档版本**：v1.1
**创建日期**：2026-04-25
**最后更新**：2026-04-25
**文档状态**：待审核
