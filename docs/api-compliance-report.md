# API 合规性检查报告

**检查日期**: 2026-03-13  
**文档版本**: 基于 `docs/api-documentation.md`  
**前端位置**: `frontend/src/api/`

---

## 执行摘要

本次检查对比了前端 API 实现与 API 文档的符合程度。发现 **多处字段命名不一致** 和 **类型定义不匹配** 的问题，需要修复以确保前后端数据交互正常。

### 问题统计
| 类别 | 数量 | 优先级 |
|-----|------|-------|
| 字段命名不一致 | 6处 | 高 |
| 枚举值不一致 | 2处 | 高 |
| 缺失接口 | 1处 | 中 |
| 类型定义不匹配 | 多处 | 高 |

---

## 1. 认证管理模块

### 1.1 接口对比

| 检查项 | 文档定义 | 前端实现 | 状态 |
|-------|---------|---------|------|
| 路径 | `POST /admin/auth/login` | `POST /admin/auth/login` | ✅ 一致 |
| 请求参数 | username, password | username, password | ✅ 一致 |
| 响应字段 | access_token, token_type | access_token, token_type | ✅ 一致 |

### 1.2 问题发现

**问题**: 前端 `LoginResponse` 类型定义中包含 `token` 字段作为兼容，但后端只返回 `access_token`。

```typescript
// 前端 types.ts 第 67-78 行
export interface LoginResponse {
  access_token?: string;  // 后端返回
  token_type?: string;
  token?: string;         // 兼容字段，实际不存在
}
```

**建议**: 移除 `token` 字段，统一使用 `access_token`。

---

## 2. 战队管理模块

### 2.1 接口对比

| 检查项 | 文档定义 | 前端实现 | 状态 |
|-------|---------|---------|------|
| 获取列表 | `GET /teams` | `GET /teams` | ✅ 一致 |
| 获取详情 | `GET /teams/:id` | `GET /teams/${id}` | ✅ 一致 |
| 创建战队 | `POST /admin/teams` | `POST /admin/teams` | ✅ 一致 |
| 更新战队 | `PUT /admin/teams/:id` | `PUT /admin/teams/${id}` | ✅ 一致 |
| 删除战队 | `DELETE /admin/teams/:id` | `DELETE /admin/teams/${id}` | ✅ 一致 |

### 2.2 字段命名不一致

| 文档字段 | 前端类型定义 | 后端 DTO | 状态 |
|---------|-------------|---------|------|
| players | members? | players | ❌ **不一致** |
| logo | logo? | logo? | ✅ 一致 |
| description | description? | description? | ✅ 一致 |

**问题详情**:

```typescript
// 前端 types.ts 第 92-100 行
export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  members?: string[];  // ❌ 错误：应为 players
}

// 后端 CreateTeamDto
export class CreateTeamDto {
  players?: CreatePlayerDto[];  // ✅ 正确
}
```

**影响**: 前端发送/接收的 `members` 字段与后端的 `players` 字段不匹配，会导致队员数据丢失。

### 2.3 队员位置枚举说明

| 标准值 | 后端 DTO | 前端类型定义 | 状态 |
|-------|---------|-------------|------|
| top/jungle/mid/bot/support | top/jungle/mid/bot/support | '上单' \| '打野' \| '中单' \| 'AD' \| '辅助' | ❌ **不一致** |

**说明**: 
- 文档附录 D 明确定义位置枚举值为英文：`top/jungle/mid/bot/support`
- 后端 DTO 使用英文枚举值，与文档一致
- 前端类型定义使用中文位置名称，与文档不一致

**注意**: 文档中存在一处示例使用了中文 `"position": "上单"`（第 153 行），但附录 D 的枚举定义和参数说明都使用英文值。应以附录 D 的英文枚举值为准。

---

## 3. 比赛管理模块

### 3.1 接口对比

| 检查项 | 文档定义 | 前端实现 | 状态 |
|-------|---------|---------|------|
| 获取列表 | `GET /matches` | `GET /matches` | ✅ 一致 |
| 获取详情 | `GET /matches/:id` | `GET /matches/${id}` | ✅ 一致 |
| 更新比赛 | `PUT /admin/matches/:id` | `PUT /admin/matches/${id}` | ✅ 一致 |
| 清空比分 | `DELETE /admin/matches/:id/scores` | **未实现** | ❌ **缺失** |

### 3.2 字段命名不一致

| 文档字段 | 前端类型定义 | 后端 DTO/Service | 状态 |
|---------|-------------|-----------------|------|
| teamAId | team1Id | teamAId | ❌ **不一致** |
| teamBId | team2Id | teamBId | ❌ **不一致** |
| scoreA | team1Score | scoreA | ❌ **不一致** |
| scoreB | team2Score | scoreB | ❌ **不一致** |
| winnerId | winnerTeamId | winnerId | ❌ **不一致** |
| status | status | status | ⚠️ 枚举值不一致 |

**问题详情**:

```typescript
// 前端 types.ts 第 126-141 行
export interface Match {
  id: string;
  team1Id: string;        // ❌ 应为 teamAId
  team2Id: string;        // ❌ 应为 teamBId
  team1Score?: number;    // ❌ 应为 scoreA
  team2Score?: number;    // ❌ 应为 scoreB
  winnerTeamId?: string;  // ❌ 应为 winnerId
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';  // ❌ 枚举值错误
}

// 后端 Match 接口
export interface Match {
  teamAId?: string;       // ✅ 正确
  teamBId?: string;       // ✅ 正确
  scoreA: number;         // ✅ 正确
  scoreB: number;         // ✅ 正确
  winnerId?: string;      // ✅ 正确
  status: 'upcoming' | 'ongoing' | 'finished';  // ✅ 正确
}
```

### 3.3 状态枚举值不一致

| 文档值 | 后端枚举 | 前端枚举 | 状态 |
|-------|---------|---------|------|
| upcoming | upcoming | scheduled | ❌ **不一致** |
| ongoing | ongoing | live | ❌ **不一致** |
| finished | finished | completed | ❌ **不一致** |
| - | - | cancelled | ❌ 前端多出 |

### 3.4 缺失接口

**缺失**: 清空比赛比分接口

```typescript
// 需要在前端 matches.ts 中添加
export async function clearScores(id: string): Promise<Match> {
  const response = await apiClient.delete<ApiResponse<Match>>(`/admin/matches/${id}/scores`);
  // ...
}
```

---

## 4. 直播管理模块

### 4.1 接口对比

| 检查项 | 文档定义 | 前端实现 | 状态 |
|-------|---------|---------|------|
| 获取活跃直播 | `GET /streams/active` | `GET /streams/active` | ✅ 一致 |
| 获取指定直播 | `GET /streams/:id` | `GET /streams/${id}` | ✅ 一致 |
| 获取所有直播 | `GET /streams` | `GET /streams` | ✅ 一致 |
| 创建直播 | `POST /streams` | `POST /streams` | ✅ 一致 |
| 更新直播 | `PATCH /streams/:id` | `PATCH /streams/${id}` | ✅ 一致 |
| 删除直播 | `DELETE /streams/:id` | `DELETE /streams/${id}` | ✅ 一致 |

### 4.2 字段命名不一致

| 文档字段 | 前端类型定义 | 后端 DTO | 状态 |
|---------|-------------|---------|------|
| url | streamUrl | url | ❌ **不一致** |
| isLive | isActive | isLive | ❌ **不一致** |
| title | title | title | ✅ 一致 |

**问题详情**:

```typescript
// 前端 types.ts 第 159-168 行
export interface Stream {
  id: string;
  title: string;
  streamUrl: string;      // ❌ 应为 url
  isActive: boolean;      // ❌ 应为 isLive
  currentMatchId?: string;
}

// 后端 CreateStreamDto
export class CreateStreamDto {
  title: string;          // ✅ 正确
  url: string;            // ✅ 正确
  isLive?: boolean;       // ✅ 正确
}
```

---

## 5. 晋级名单管理模块

### 5.1 接口对比

| 检查项 | 文档定义 | 前端实现 | 状态 |
|-------|---------|---------|------|
| 获取晋级名单 | `GET /advancement` | `GET /advancement` | ✅ 一致 |
| 更新晋级名单 | `PUT /admin/advancement` | `PUT /admin/advancement` | ✅ 一致 |

### 5.2 数据结构不一致

**文档定义**:
```json
{
  "winners2_0": ["team-001", "team-002"],
  "winners2_1": ["team-003", "team-004"],
  "losersBracket": ["team-005", "team-006"],
  "eliminated3rd": ["team-007"],
  "eliminated0_3": ["team-008"]
}
```

**前端类型定义** (types.ts 第 181-189 行):
```typescript
export interface AdvancementRule {
  id: string;             // ❌ 多余字段
  stage: string;          // ❌ 多余字段
  advancementCount: number;  // ❌ 多余字段
  criteria: string;       // ❌ 多余字段
  tiebreaker?: string;    // ❌ 多余字段
}
```

**后端 Advancement 接口**:
```typescript
export interface Advancement {
  winners2_0: string[];       // ✅ 正确
  winners2_1: string[];       // ✅ 正确
  losersBracket: string[];    // ✅ 正确
  eliminated3rd: string[];    // ✅ 正确
  eliminated0_3: string[];    // ✅ 正确
}
```

**问题**: 前端 `AdvancementRule` 类型完全不符合实际数据结构，需要重新定义为 `Advancement`。

---

## 6. 管理操作模块

### 6.1 接口实现情况

| 接口 | 文档定义 | 前端实现 | 状态 |
|-----|---------|---------|------|
| 初始化槽位 | `POST /admin/init-slots` | **未实现** | ⚠️ 可选 |
| 重置槽位 | `POST /admin/reset-slots` | **未实现** | ⚠️ 可选 |
| 清空数据 | `DELETE /admin/data` | **未实现** | ⚠️ 可选 |

**说明**: 这些管理操作接口在前端 API 层未实现，如果管理后台需要使用这些功能，需要添加对应的 API 调用。

---

## 7. Axios 配置检查

### 7.1 基础配置

| 检查项 | 配置值 | 状态 |
|-------|-------|------|
| 基础 URL | `http://localhost:3000/api` | ✅ 可配置 |
| 超时时间 | 10秒 | ✅ 合理 |
| Content-Type | application/json | ✅ 正确 |

### 7.2 拦截器

| 检查项 | 实现情况 | 状态 |
|-------|---------|------|
| 请求拦截器 - 自动添加 Token | ✅ 已实现 | 正确 |
| 响应拦截器 - 错误处理 | ✅ 已实现 | 正确 |
| 响应拦截器 - 401 跳转 | ✅ 已实现 | 正确 |

---

## 8. 修复建议汇总

### 8.1 高优先级修复

1. **修复比赛字段命名** (`frontend/src/api/types.ts`)
   - `team1Id` → `teamAId`
   - `team2Id` → `teamBId`
   - `team1Score` → `scoreA`
   - `team2Score` → `scoreB`
   - `winnerTeamId` → `winnerId`

2. **修复比赛状态枚举** (`frontend/src/api/types.ts`)
   - `'scheduled' | 'live' | 'completed' | 'cancelled'` → `'upcoming' | 'ongoing' | 'finished'`

3. **修复直播字段命名** (`frontend/src/api/types.ts`)
   - `streamUrl` → `url`
   - `isActive` → `isLive`

4. **修复战队字段命名** (`frontend/src/api/types.ts`)
   - `members` → `players`

5. **修复队员位置枚举** (`frontend/src/api/types.ts`)
   - `'上单' | '打野' | '中单' | 'AD' | '辅助'` → `'top' | 'jungle' | 'mid' | 'bot' | 'support'`

6. **修复晋级名单类型** (`frontend/src/api/types.ts`)
   - 重新定义 `Advancement` 接口，匹配实际数据结构

### 8.2 中优先级修复

7. **添加清空比分接口** (`frontend/src/api/matches.ts`)
   ```typescript
   export async function clearScores(id: string): Promise<Match> {
     const response = await apiClient.delete<ApiResponse<Match>>(`/admin/matches/${id}/scores`);
     const responseData = response.data;
     if (!responseData.success || !responseData.data) {
       throw new Error(responseData.message || '清空比分失败');
     }
     return responseData.data;
   }
   ```

### 8.3 低优先级修复

8. **清理登录响应类型** (`frontend/src/api/types.ts`)
   - 移除 `token` 字段

9. **可选：添加管理操作接口** (`frontend/src/api/admin.ts`)
   - 初始化槽位
   - 重置槽位
   - 清空数据

---

## 9. 修复后的类型定义参考

```typescript
// 修复后的 Match 接口
export interface Match {
  id: string;
  stage: 'swiss' | 'elimination';
  round: string;
  teamAId?: string;
  teamBId?: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  startTime?: string;
  swissRecord?: string;
  swissDay?: number;
  eliminationBracket?: 'winners' | 'losers' | 'grand_finals';
  eliminationGameNumber?: number;
}

// 修复后的 Stream 接口
export interface Stream {
  id: string;
  title: string;
  url: string;
  isLive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 修复后的 Team 接口
export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  players?: Player[];  // 修复：members → players
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  position: 'top' | 'jungle' | 'mid' | 'bot' | 'support';
  teamId: string;
}

// 修复后的 Advancement 接口
export interface Advancement {
  winners2_0: string[];
  winners2_1: string[];
  losersBracket: string[];
  eliminated3rd: string[];
  eliminated0_3: string[];
}
```

---

## 10. 总结

本次检查发现前端 API 类型定义与后端实际实现存在多处不一致，主要集中在：

1. **字段命名风格不一致**: 前端使用 `team1Id/team2Id`，后端使用 `teamAId/teamBId`
2. **状态枚举值不一致**: 前端使用 `scheduled/live/completed`，后端使用 `upcoming/ongoing/finished`
3. **类型定义过时**: `AdvancementRule` 类型完全不匹配实际数据结构

**建议**: 按照第 8 节的修复建议，优先修复高优先级问题，确保前后端数据交互正常。
