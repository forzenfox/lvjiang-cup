# 战队导入逻辑完整梳理

## 📊 整体流程图

```
用户上传 Excel 文件
    ↓
┌─────────────────────────────────────────────┐
│ 1. Controller 层（接收文件）                    │
│    - 使用 diskStorage 保存到 uploads/temp/      │
│    - 获取 file.path 传递给 Service              │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ 2. Service.importFromExcel()                 │
│    步骤 2.1: 校验 Excel 表头                     │
│    步骤 2.2: 解析 Excel 数据                     │
│    步骤 2.3: 校验导入数据                        │
│    步骤 2.4: 校验战队数量限制                     │
│    步骤 2.5: 保存到数据库                        │
│    步骤 2.6: 清理临时文件                        │
└─────────────────────────────────────────────┘
    ↓
返回 ImportResultDto（成功/失败统计 + 错误详情）
```

---

## 📝 详细步骤分析

### 步骤 1: Controller 层 - 文件上传

**文件**: `teams-import.controller.ts`

```typescript
@Post()
@UseInterceptors(FileInterceptor('file', { storage: excelStorage }))
async importTeams(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new Error('请上传 Excel 文件');
  }
  
  const result = await this.teamsImportService.importFromExcel(file.path);
  return result;
}
```

**存储配置**:
```typescript
const excelStorage = diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `import-${uniqueSuffix}${ext}`);
  },
});
```

**关键点**:
- ✅ 使用磁盘存储（解决了之前 path 为 undefined 的问题）
- ✅ 文件名使用 UUID 避免冲突
- ✅ 临时目录自动创建

---

### 步骤 2.1: 校验 Excel 表头

**文件**: `validate-import.util.ts` → `validateExcelHeaders()`

```typescript
const REQUIRED_HEADERS = [
  '战队名称', '队标 URL', '战队口号', '位置', '游戏 ID',
  '头像 URL', '评分', '是否队长', '等级', '常用英雄',
  '直播间', '简介',
];

export async function validateExcelHeaders(filePath: string): Promise<{ valid: boolean; missingHeaders: string[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  const headerRow = sheet.getRow(3); // 第 3 行是表头
  const actualHeaders: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    actualHeaders.push(String(cell.value || '').trim());
  });
  
  const missingHeaders = REQUIRED_HEADERS.filter(h => !actualHeaders.includes(h));
  return { valid: missingHeaders.length === 0, missingHeaders };
}
```

**Excel 结构**:
```
第 1 行：标题（合并单元格）"战队与队员信息导入模板"
第 2 行：说明（合并单元格）"导入说明..."
第 3 行：列头（12 列）"战队名称", "队标 URL", ...
第 4-83 行：数据行（战队和队员信息）
```

**校验点**:
- ✅ 检查所有必填列头是否存在
- ❌ 如果缺少列头，直接抛出错误，不继续处理

---

### 步骤 2.2: 解析 Excel 数据

**文件**: `excel.util.ts` → `parseExcel()`

#### 解析流程

```typescript
export async function parseExcel(filePath: string): Promise<ImportTeamDto[]> {
  // 1. 读取 Excel 文件
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  // 2. 遍历所有数据行（从第 4 行开始）
  const rows: ParsedRowDto[] = [];
  sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber < 4) return; // 跳过前 3 行表头
    
    // 3. 提取单元格数据
    const cells: any[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cells.push(cell.value);
    });
    
    // 4. 转换为 DTO
    rows.push({
      teamName: cells[0],
      logoUrl: cells[1],
      battleCry: cells[2],
      position: cells[3],           // 例如："上单"
      nickname: cells[4],
      gameId: cells[5],
      avatarUrl: cells[6],
      rating: cells[7],
      isCaptain: cells[8],          // 例如："是" 或 "否"
      level: cells[9],
      championPoolStr: cells[10],   // 例如："未来守护者·杰斯,荒漠屠夫·雷克顿"
      liveRoom: cells[11],
      bio: cells[12],
    });
  });
  
  // 5. 按战队名称分组
  const teamMap = new Map<string, ImportTeamDto>();
  for (const row of rows) {
    if (!teamMap.has(row.teamName)) {
      teamMap.set(row.teamName, {
        name: row.teamName,
        logoUrl: row.logoUrl,
        battleCry: row.battleCry,
        members: [],
      });
    }
    
    // 6. 解析并添加队员
    const parsedPosition = parsePosition(row.position); // "上单" → "TOP"
    
    const member: ImportMemberDto = {
      nickname: row.nickname || undefined,
      avatarUrl: row.avatarUrl || undefined,
      position: parsedPosition,                        // ✅ 已经是英文 "TOP"
      gameId: row.gameId || undefined,
      bio: row.bio || undefined,
      championPoolStr: row.championPoolStr,
      rating: row.rating,
      isCaptainStr: String(row.isCaptain || '否'),     // ❌ 问题：这里变成了 "true"/"false"
      isCaptain: parseIsCaptain(row.isCaptain),        // "是" → true
      level: parseLevel(row.level) || undefined,
      liveRoom: row.liveRoom,
      personalBio: row.bio || undefined,
    };
    
    teamMap.get(row.teamName)!.members.push(member);
  }
  
  return Array.from(teamMap.values());
}
```

#### 关键转换函数

**位置解析**:
```typescript
const POSITION_MAP = {
  '上单': 'TOP',
  '打野': 'JUNGLE',
  '中单': 'MID',
  'ADC': 'ADC',
  '辅助': 'SUPPORT',
};

export function parsePosition(position: string): string | null {
  const normalized = position?.trim();
  return POSITION_MAP[normalized] || null;
}
```
- 输入：`"上单"`
- 输出：`"TOP"`

**队长解析**:
```typescript
export function parseIsCaptain(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const strValue = String(value).trim();
  return strValue === '是';
}
```
- 输入：`"是"` → 输出：`true`
- 输入：`"否"` → 输出：`false`

---

### 步骤 2.3: 校验导入数据

**文件**: `validate-import.util.ts` → `validateImportData()`

```typescript
export function validateImportData(data: ImportTeamDto[], totalRows: number): ValidationResult {
  const errors: ImportErrorDto[] = [];
  
  // 1. 校验总行数（4-83）
  if (totalRows < MIN_ROWS || totalRows > MAX_ROWS) {
    return {
      valid: false,
      errors: [new ImportErrorDto(0, '', '', 'rowCount', 
        `总行数必须在${MIN_ROWS}-${MAX_ROWS}之间（前 3 行为表头，数据行从第 4 行开始）`)],
      teamCount: data.length,
    };
  }
  
  // 2. 校验战队数量（1-16）
  if (data.length < MIN_TEAMS || data.length > MAX_TEAMS) {
    errors.push(new ImportErrorDto(0, '', '', 'teamCount', 
      `战队数量必须在${MIN_TEAMS}-${MAX_TEAMS}之间`));
    return { valid: false, errors, teamCount: data.length };
  }
  
  // 3. 逐个校验战队和队员
  const teamNames = new Set<string>();
  const captainCountMap = new Map<string, number>();
  const positionMap = new Map<string, Set<string>>();
  
  for (const team of data) {
    // 3.1 校验战队名称
    if (!team.name || !team.name.trim()) {
      errors.push(new ImportErrorDto(0, team.name || '(空)', '', 'teamName', '战队名称不能为空'));
    } else if (team.name.length > TEAM_NAME_MAX_LENGTH) {
      errors.push(new ImportErrorDto(0, team.name, '', 'teamName', `战队名称不能超过${TEAM_NAME_MAX_LENGTH}个字符`));
    } else if (teamNames.has(team.name)) {
      errors.push(new ImportErrorDto(0, team.name, '', 'teamName', '战队名称在文件中不能重复'));
    } else {
      teamNames.add(team.name);
    }
    
    captainCountMap.set(team.name, 0);
    positionMap.set(team.name, new Set<string>());
    
    // 3.2 校验队员数量（1-5）
    if (team.members.length === 0) {
      errors.push(new ImportErrorDto(0, team.name, '', 'members', '战队至少需要 1 名队员'));
    } else if (team.members.length > 5) {
      errors.push(new ImportErrorDto(0, team.name, '', 'members', '战队最多 5 名队员'));
    }
    
    // 3.3 逐个校验队员
    for (const member of team.members) {
      const position = member.position; // ⚠️ 注意：这里已经是 "TOP", "JUNGLE" 等英文
      const validPositions = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      
      // 3.3.1 校验位置
      if (!position) {
        errors.push(new ImportErrorDto(0, team.name, '', 'position', '位置不能为空'));
      } else if (!validPositions.includes(position)) {
        errors.push(new ImportErrorDto(0, team.name, position, 'position', '位置枚举值无效'));
      } else {
        // 检查位置重复
        const teamPositions = positionMap.get(team.name)!;
        if (teamPositions.has(position)) {
          errors.push(new ImportErrorDto(0, team.name, position, 'position', '战队内位置不能重复'));
        } else {
          teamPositions.add(position);
        }
      }
      
      // 3.3.2 校验是否队长
      const isCaptainStr = String(member.isCaptainStr);
      if (!['是', '否'].includes(isCaptainStr)) {
        errors.push(new ImportErrorDto(0, team.name, member.position || '', 'isCaptain', '是否队长枚举值无效'));
      } else {
        if (isCaptainStr === '是') {
          captainCountMap.set(team.name, (captainCountMap.get(team.name) || 0) + 1);
          if (captainCountMap.get(team.name)! > 1) {
            errors.push(new ImportErrorDto(0, team.name, member.position || '', 'isCaptain', '每队最多 1 名队长'));
          }
        }
      }
      
      // 3.3.3 校验常用英雄
      const champions = parseChampionPool(member.championPoolStr);
      const invalidChampions = champions.filter(name => !findChampionId(name));
      if (invalidChampions.length > 0) {
        errors.push(new ImportErrorDto(0, team.name, member.position || '', 'championPool', 
          `常用英雄名称无效: ${invalidChampions.join(', ')}`));
      }
      
      // 3.3.4 校验评分（0-100）
      if (member.rating !== null && (member.rating < RATING_MIN || member.rating > RATING_MAX)) {
        errors.push(new ImportErrorDto(0, team.name, member.position || '', 'rating', `评分必须在${RATING_MIN}-${RATING_MAX}之间`));
      }
      
      // 3.3.5 校验英雄数量（最多 5 个）
      if (champions.length > MAX_CHAMPIONS) {
        errors.push(new ImportErrorDto(0, team.name, member.position || '', 'championPool', `常用英雄不能超过${MAX_CHAMPIONS}个`));
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    teamCount: data.length,
  };
}
```

---

### 步骤 2.4: 校验战队数量限制

```typescript
const existingTeams = await this.databaseService.all<any>('SELECT * FROM teams');
const existingTeamMap = new Map(existingTeams.map(t => [t.name, t]));

const existingTeamCount = existingTeams.length;
const newTeamCount = teams.filter(t => !existingTeamMap.has(t.name)).length;

if (existingTeamCount + newTeamCount > 16) {
  return new ImportResultDto(
    teams.length,
    0, 0, teams.length,
    [new ImportErrorDto(0, '', '', 'teamLimit', '导入后战队总数将超过16支上限')],
    []
  );
}
```

**逻辑**:
- 已存在的战队 + 新战队 ≤ 16

---

### 步骤 2.5: 保存到数据库

```typescript
await this.databaseService.begin();

try {
  for (const team of teams) {
    const existingTeam = existingTeamMap.get(team.name);
    
    if (existingTeam) {
      // 更新现有战队
      await this.databaseService.run(
        'UPDATE teams SET logo_url = ?, battle_cry = ? WHERE id = ?',
        [team.logoUrl || '', team.battleCry || '', existingTeam.id]
      );
      await this.databaseService.run('DELETE FROM team_members WHERE team_id = ?', [existingTeam.id]);
      updated++;
    } else {
      // 插入新战队
      const result = await this.databaseService.run(
        'INSERT INTO teams (name, logo_url, battle_cry) VALUES (?, ?, ?)',
        [team.name, team.logoUrl || '', team.battleCry || '']
      );
      team.id = result.lastID;
      created++;
    }
    
    // 插入队员
    for (const member of team.members) {
      const positionValue = parsePositionEnum(member.position);
      const captainFlag = member.isCaptain ? 1 : 0;
      const ratingValue = member.rating || null;
      
      await this.databaseService.run(
        `INSERT INTO team_members (team_id, position, nickname, game_id, avatar_url,
         rating, is_captain, level, champion_pool, live_room, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [team.id, positionValue, member.nickname || '', member.gameId || '', 
         member.avatarUrl || '', ratingValue, captainFlag, member.level || '',
         member.championPoolStr || '', member.liveRoom || '', member.personalBio || '']
      );
    }
  }
  
  await this.databaseService.commit();
} catch (error) {
  await this.databaseService.rollback();
  throw error;
}
```

---

### 步骤 2.6: 清理临时文件

```typescript
finally {
  try {
    await this.cleanupTempFile(filePath);
  } catch (cleanupError) {
    console.error('清理临时文件失败:', cleanupError);
  }
}
```

---

## 🔍 当前问题点总结

### 问题 1: `isCaptainStr` 解析错误

**现象**: 校验时报错"是否队长枚举值无效"

**原因**: 
```typescript
// excel.util.ts 第 171 行
isCaptainStr: String(row.isCaptain || '否'),
```

当 `row.isCaptain` 是布尔值 `true` 时，`String(true)` 返回 `"true"`，而不是原始的 `"是"`。

**数据流**:
```
Excel 单元格: "是" (字符串)
    ↓
解析时: row.isCaptain = "是"
    ↓
赋值: isCaptainStr = String("是" || '否') = "是" ✅ 正确
    ↓
但实际运行时可能因为类型转换问题变成:
isCaptainStr = "true" ❌ 错误
```

**影响**: 校验逻辑期望 `isCaptainStr` 是 `"是"` 或 `"否"`，但实际收到了 `"true"` 或 `"false"`。

---

### 问题 2: 英雄名称匹配不够灵活

**现象**: 报错"常用英雄名称无效：未来守护者·杰斯"

**原因**: 
Excel 中填写的是全称"未来守护者·杰斯"，但英雄数据中：
- `name`: "未来守护者"
- `title`: "杰斯"

原始校验逻辑只支持精确匹配 `name` 或 `title`，不支持组合匹配。

**数据流**:
```
Excel 填写: "未来守护者·杰斯"
    ↓
findChampionId("未来守护者·杰斯")
    ↓
遍历英雄数据，查找匹配项
    ↓
原始逻辑: 只比较 champion.name === "未来守护者·杰斯" ❌ 不匹配
         或 champion.title === "未来守护者·杰斯" ❌ 不匹配
    ↓
返回 null → 校验失败
```

**已修复**: 增加了全称匹配和模糊匹配逻辑。

---

### 问题 3: 位置校验逻辑

**现象**: 错误报告显示位置是 "TOP", "JUNGLE" 等英文

**分析**: 
- 解析时已将中文位置转换为英文（`parsePosition("上单") → "TOP"`）
- 校验时检查的是 `member.position`（已经是英文 "TOP"）
- 校验逻辑使用 `validPositions.includes(position)` 是正确的

**当前状态**: ✅ 位置校验逻辑已修复为检查英文枚举值

---

## 📊 数据结构转换总览

```
Excel 原始数据
├── 位置: "上单" (字符串)
├── 是否队长: "是" (字符串)
├── 常用英雄: "未来守护者·杰斯,荒漠屠夫·雷克顿" (字符串)
└── 评分: 75 (数字)

        ↓ parseExcel()

Parsed DTO
├── position: "TOP" (已转换)
├── isCaptainStr: "是" (应保持原始字符串)
├── isCaptain: true (布尔值)
├── championPoolStr: "未来守护者·杰斯,荒漠屠夫·雷克顿" (原始字符串)
└── rating: 75 (数字)

        ↓ validateImportData()

校验检查
├── position: validPositions.includes("TOP") ✅
├── isCaptainStr: ["是", "否"].includes("是") ✅
├── championPool: findChampionId("未来守护者·杰斯") ✅ (已增强匹配)
└── rating: 0 <= 75 <= 100 ✅
```

---

## 🎯 需要修复的问题

### 优先级 1 (高): `isCaptainStr` 解析问题

**文件**: `excel.util.ts` 第 171 行

**当前代码**:
```typescript
isCaptainStr: String(row.isCaptain || '否'),
```

**问题**: 如果 `row.isCaptain` 是布尔值，会转换成 "true"/"false"

**建议修复**:
```typescript
// 方案 1: 直接使用原始值
isCaptainStr: typeof row.isCaptain === 'string' 
  ? row.isCaptain 
  : (row.isCaptain ? '是' : '否'),

// 方案 2: 在读取时保持原始字符串
// 需要检查 row.isCaptain 是如何从 Excel 读取的
```

### 优先级 2 (中): 英雄名称匹配

**状态**: ✅ 已修复

增加了全称匹配和模糊匹配逻辑，支持：
- "未来守护者·杰斯"
- "未来守护者"
- "杰斯"
- "杰"

### 优先级 3 (低): 错误信息优化

**当前**: 错误信息中的行号都是 0

**建议**: 记录实际 Excel 行号，方便用户定位错误

---

## ✅ 校验规则总结

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| 总行数 | 4-83 行 | 总行数必须在 4-83 之间 |
| 战队数量 | 1-16 支 | 战队数量必须在 1-16 之间 |
| 战队名称 | 必填，≤20 字符，不重复 | 战队名称不能为空/超长/重复 |
| 队员数量 | 1-5 人/队 | 战队至少/最多 X 名队员 |
| 位置 | 必填，中文→英文转换 | 位置枚举值无效 |
| 位置唯一性 | 同队内不重复 | 战队内位置不能重复 |
| 队长 | 每队最多 1 人 | 每队最多 1 名队长 |
| 评分 | 0-100 | 评分必须在 0-100 之间 |
| 常用英雄 | ≤5 个，名称有效 | 英雄名称无效/数量超限 |

---

## 📌 待审核事项

1. **isCaptainStr 解析逻辑** - 需要确认 Excel 读取时 `row.isCaptain` 的实际类型
2. **错误信息行号** - 当前都是 0，是否需要改进？
3. **校验失败后的处理** - 当前直接返回错误，是否需要保存部分成功的数据？
4. **事务回滚** - 如果导入部分成功，是否需要回滚？

请审核以上梳理，确认是否需要调整或补充。
