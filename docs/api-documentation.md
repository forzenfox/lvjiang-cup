# 驴酱杯 API 接口文档

## 概述

本文档描述了驴酱杯赛事管理系统的后端 API 接口。所有接口基于 RESTful 设计原则，使用 JSON 格式进行数据交换。

- **基础URL**: `http://localhost:3000` (开发环境)
- **数据格式**: JSON
- **认证方式**: JWT Bearer Token

---

## 目录

1. [认证管理](#1-认证管理)
2. [战队管理](#2-战队管理)
3. [比赛管理](#3-比赛管理)
4. [直播管理](#4-直播管理)
5. [晋级名单管理](#5-晋级名单管理)
6. [管理操作](#6-管理操作)

---

## 1. 认证管理

### 1.1 管理员登录

**接口信息**
- **路径**: `POST /admin/auth/login`
- **描述**: 管理员登录获取访问令牌
- **认证**: 不需要

**请求参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

**响应字段说明**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| access_token | string | JWT 访问令牌 |
| token_type | string | 令牌类型，固定为 "Bearer" |

---

## 2. 战队管理

### 2.1 获取所有战队列表

**接口信息**
- **路径**: `GET /teams`
- **描述**: 获取所有战队列表（支持分页）
- **认证**: 不需要

**查询参数**

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| page | integer | 否 | 1 | 页码，最小值为 1 |
| pageSize | integer | 否 | 10 | 每页数量，最小值为 1 |

**响应示例**
```json
{
  "data": [
    {
      "id": "team-001",
      "name": "战队A",
      "logo": "https://example.com/logo.png",
      "description": "这是一支强队",
      "players": [
        {
          "id": "player-001",
          "name": "选手1",
          "avatar": "https://example.com/avatar.png",
          "position": "上单",
          "teamId": "team-001"
        }
      ]
    }
  ],
  "total": 8,
  "page": 1,
  "pageSize": 10
}
```

**响应字段说明**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| data | array | 战队列表 |
| data[].id | string | 战队ID |
| data[].name | string | 战队名称 |
| data[].logo | string | 战队Logo URL |
| data[].description | string | 战队描述 |
| data[].players | array | 队员列表 |
| data[].players[].id | string | 队员ID |
| data[].players[].name | string | 队员名称 |
| data[].players[].avatar | string | 队员头像URL |
| data[].players[].position | string | 位置（上单/打野/中单/AD/辅助） |
| data[].players[].teamId | string | 所属战队ID |
| total | integer | 总数量 |
| page | integer | 当前页码 |
| pageSize | integer | 每页数量 |

---

### 2.2 获取单个战队详情

**接口信息**
- **路径**: `GET /teams/:id`
- **描述**: 获取指定战队的详细信息
- **认证**: 不需要

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 战队ID |

**响应示例**
```json
{
  "id": "team-001",
  "name": "战队A",
  "logo": "https://example.com/logo.png",
  "description": "这是一支强队",
  "players": [
    {
      "id": "player-001",
      "name": "选手1",
      "avatar": "https://example.com/avatar.png",
      "position": "上单",
      "teamId": "team-001"
    }
  ]
}
```

---

### 2.3 创建战队

**接口信息**
- **路径**: `POST /admin/teams`
- **描述**: 创建新战队（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**请求参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 战队ID |
| name | string | 是 | 战队名称 |
| logo | string | 否 | 战队Logo URL |
| description | string | 否 | 战队描述 |
| players | array | 否 | 队员列表 |
| players[].id | string | 是 | 队员ID |
| players[].name | string | 是 | 队员名称 |
| players[].avatar | string | 否 | 队员头像URL |
| players[].position | string | 是 | 位置（上单/打野/中单/AD/辅助） |

**请求示例**
```json
{
  "id": "team-002",
  "name": "战队B",
  "logo": "https://example.com/logo2.png",
  "description": "新成立的战队",
  "players": [
    {
      "id": "player-002",
      "name": "选手2",
      "avatar": "https://example.com/avatar2.png",
      "position": "打野"
    }
  ]
}
```

**响应示例**
```json
{
  "id": "team-002",
  "name": "战队B",
  "logo": "https://example.com/logo2.png",
  "description": "新成立的战队",
  "players": [
    {
      "id": "player-002",
      "name": "选手2",
      "avatar": "https://example.com/avatar2.png",
      "position": "打野",
      "teamId": "team-002"
    }
  ]
}
```

---

### 2.4 更新战队

**接口信息**
- **路径**: `PUT /admin/teams/:id`
- **描述**: 更新战队信息（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 战队ID |

**请求参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | string | 否 | 战队名称 |
| logo | string | 否 | 战队Logo URL |
| description | string | 否 | 战队描述 |
| players | array | 否 | 队员列表（会替换原有队员） |
| players[].id | string | 否 | 队员ID |
| players[].name | string | 否 | 队员名称 |
| players[].avatar | string | 否 | 队员头像URL |
| players[].position | string | 否 | 位置（上单/打野/中单/AD/辅助） |

**请求示例**
```json
{
  "name": "战队B-新名称",
  "description": "更新后的描述"
}
```

---

### 2.5 删除战队

**接口信息**
- **路径**: `DELETE /admin/teams/:id`
- **描述**: 删除指定战队（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 战队ID |

**响应示例**
```json
{
  "message": "Team deleted successfully"
}
```

---

## 3. 比赛管理

### 3.1 获取所有比赛列表

**接口信息**
- **路径**: `GET /matches`
- **描述**: 获取所有比赛列表（支持分页和阶段筛选）
- **认证**: 不需要

**查询参数**

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| page | integer | 否 | 1 | 页码，最小值为 1 |
| pageSize | integer | 否 | 10 | 每页数量，最小值为 1 |
| stage | string | 否 | - | 按阶段筛选（swiss/elimination） |

**响应示例**
```json
{
  "data": [
    {
      "id": "swiss-r1-1",
      "teamAId": "team-001",
      "teamBId": "team-002",
      "teamA": {
        "id": "team-001",
        "name": "战队A",
        "logo": "https://example.com/logo.png"
      },
      "teamB": {
        "id": "team-002",
        "name": "战队B",
        "logo": "https://example.com/logo2.png"
      },
      "scoreA": 1,
      "scoreB": 0,
      "winnerId": "team-001",
      "round": "Round 1",
      "status": "finished",
      "startTime": "2024-01-15T14:00:00Z",
      "stage": "swiss",
      "swissRecord": "0-0",
      "swissDay": 1,
      "eliminationBracket": null,
      "eliminationGameNumber": null
    }
  ],
  "total": 22,
  "page": 1,
  "pageSize": 10
}
```

**响应字段说明**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| data | array | 比赛列表 |
| data[].id | string | 比赛ID |
| data[].teamAId | string | 战队A ID |
| data[].teamBId | string | 战队B ID |
| data[].teamA | object | 战队A信息（包含id, name, logo） |
| data[].teamB | object | 战队B信息（包含id, name, logo） |
| data[].scoreA | number | 战队A比分 |
| data[].scoreB | number | 战队B比分 |
| data[].winnerId | string | 获胜方ID |
| data[].round | string | 轮次名称 |
| data[].status | string | 比赛状态（upcoming/ongoing/finished） |
| data[].startTime | string | 开始时间（ISO 8601格式） |
| data[].stage | string | 阶段（swiss/elimination） |
| data[].swissRecord | string | 瑞士轮战绩（如 "0-0", "1-0"） |
| data[].swissDay | number | 瑞士轮比赛日 |
| data[].eliminationBracket | string | 淘汰赛分组（winners/losers/grand_finals） |
| data[].eliminationGameNumber | number | 淘汰赛场次编号 |
| total | integer | 总数量 |
| page | integer | 当前页码 |
| pageSize | integer | 每页数量 |

---

### 3.2 获取单个比赛详情

**接口信息**
- **路径**: `GET /matches/:id`
- **描述**: 获取指定比赛的详细信息
- **认证**: 不需要

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 比赛ID |

---

### 3.3 更新比赛

**接口信息**
- **路径**: `PUT /admin/matches/:id`
- **描述**: 更新比赛信息（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 比赛ID |

**请求参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| teamAId | string | 否 | 战队A ID |
| teamBId | string | 否 | 战队B ID |
| scoreA | number | 否 | 战队A比分 |
| scoreB | number | 否 | 战队B比分 |
| winnerId | string | 否 | 获胜方ID |
| status | string | 否 | 比赛状态（upcoming/ongoing/finished） |
| startTime | string | 否 | 开始时间 |

**请求示例**
```json
{
  "teamAId": "team-001",
  "teamBId": "team-002",
  "scoreA": 2,
  "scoreB": 1,
  "winnerId": "team-001",
  "status": "finished"
}
```

---

### 3.4 清空比赛比分

**接口信息**
- **路径**: `DELETE /admin/matches/:id/scores`
- **描述**: 清空指定比赛的比分数据（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 比赛ID |

**说明**: 此操作会将比分重置为 0:0，获胜方设为 null，状态重置为 upcoming。

---

## 4. 直播管理

### 4.1 获取当前活跃直播

**接口信息**
- **路径**: `GET /streams/active`
- **描述**: 获取当前活跃的直播信息
- **认证**: 不需要

**响应示例**
```json
{
  "id": "1",
  "title": "驴酱杯决赛直播",
  "url": "https://live.example.com/stream",
  "isLive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

---

### 4.2 获取指定直播

**接口信息**
- **路径**: `GET /streams/:id`
- **描述**: 获取指定ID的直播信息
- **认证**: 不需要

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 直播ID |

---

### 4.3 获取所有直播列表

**接口信息**
- **路径**: `GET /streams`
- **描述**: 获取所有直播列表
- **认证**: 不需要

**响应示例**
```json
[
  {
    "id": "1",
    "title": "驴酱杯决赛直播",
    "url": "https://live.example.com/stream",
    "isLive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
]
```

---

### 4.4 创建直播

**接口信息**
- **路径**: `POST /streams`
- **描述**: 创建新的直播信息（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**请求参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| title | string | 是 | 直播标题 |
| url | string | 是 | 直播URL |
| isLive | boolean | 否 | 是否直播中，默认为 false |

**请求示例**
```json
{
  "title": "驴酱杯半决赛",
  "url": "https://live.example.com/semifinal",
  "isLive": true
}
```

---

### 4.5 更新直播

**接口信息**
- **路径**: `PATCH /streams/:id`
- **描述**: 更新直播信息（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 直播ID |

**请求参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| title | string | 否 | 直播标题 |
| url | string | 否 | 直播URL |
| isLive | boolean | 否 | 是否直播中 |

---

### 4.6 删除直播

**接口信息**
- **路径**: `DELETE /streams/:id`
- **描述**: 删除指定直播（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**路径参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 直播ID |

---

### 4.7 获取直播信息（兼容旧接口）

**接口信息**
- **路径**: `GET /streams/stream`
- **描述**: 获取直播信息（兼容旧接口）
- **认证**: 不需要

**响应示例**
```json
{
  "title": "驴酱杯决赛直播",
  "url": "https://live.example.com/stream",
  "isLive": true
}
```

---

## 5. 晋级名单管理

### 5.1 获取晋级名单

**接口信息**
- **路径**: `GET /advancement`
- **描述**: 获取当前晋级名单
- **认证**: 不需要

**响应示例**
```json
{
  "winners2_0": ["team-001", "team-002"],
  "winners2_1": ["team-003", "team-004"],
  "losersBracket": ["team-005", "team-006"],
  "eliminated3rd": ["team-007"],
  "eliminated0_3": ["team-008"]
}
```

**响应字段说明**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| winners2_0 | array | 2-0 胜者组战队ID列表 |
| winners2_1 | array | 2-1 胜者组战队ID列表 |
| losersBracket | array | 败者组战队ID列表 |
| eliminated3rd | array | 第三名淘汰战队ID列表 |
| eliminated0_3 | array | 0-3 淘汰战队ID列表 |

---

### 5.2 更新晋级名单

**接口信息**
- **路径**: `PUT /admin/advancement`
- **描述**: 更新晋级名单（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**请求参数**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| winners2_0 | array | 否 | 2-0 胜者组战队ID列表 |
| winners2_1 | array | 否 | 2-1 胜者组战队ID列表 |
| losersBracket | array | 否 | 败者组战队ID列表 |
| eliminated3rd | array | 否 | 第三名淘汰战队ID列表 |
| eliminated0_3 | array | 否 | 0-3 淘汰战队ID列表 |

**请求示例**
```json
{
  "winners2_0": ["team-001", "team-002"],
  "winners2_1": ["team-003", "team-004"],
  "losersBracket": ["team-005", "team-006"],
  "eliminated3rd": [],
  "eliminated0_3": []
}
```

---

## 6. 管理操作

### 6.1 初始化比赛槽位

**接口信息**
- **路径**: `POST /admin/init-slots`
- **描述**: 初始化瑞士轮和淘汰赛的比赛槽位（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**说明**: 
- 此操作会创建 14 个瑞士轮槽位和 8 个淘汰赛槽位
- 如果槽位已存在，则不会重复创建

**响应示例**
```json
{
  "message": "Match slots initialized successfully",
  "count": 22
}
```

---

### 6.2 重置槽位

**接口信息**
- **路径**: `POST /admin/reset-slots`
- **描述**: 重置比赛槽位（清空战队和比分，保留槽位结构）（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**说明**: 
- 此操作会清空所有比赛的战队分配和比分数据
- 保留槽位结构（ID、轮次等信息）
- 同时会清除缓存

**响应示例**
```json
{
  "message": "Match slots reset successfully"
}
```

---

### 6.3 完全清空所有数据

**接口信息**
- **路径**: `DELETE /admin/data`
- **描述**: 完全清空所有数据（需要管理员认证）
- **认证**: 需要 JWT Token

**请求头**
```
Authorization: Bearer <access_token>
```

**警告**: 此操作会删除所有数据，包括战队、比赛、直播、晋级名单等，请谨慎使用！

**响应示例**
```json
{
  "message": "All data cleared successfully"
}
```

---

## 附录

### A. 错误响应格式

当请求发生错误时，API 会返回以下格式的响应：

```json
{
  "statusCode": 400,
  "message": "错误描述信息",
  "error": "错误类型"
}
```

### B. 常见 HTTP 状态码

| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### C. 比赛状态枚举

| 状态值 | 描述 |
|--------|------|
| upcoming | 未开始 |
| ongoing | 进行中 |
| finished | 已结束 |

### D. 位置枚举

| 位置值 | 描述 |
|--------|------|
| top | 上路 |
| jungle | 野区 |
| mid | 中路 |
| bot | 射手 |
| support | 辅助 |

---

**文档版本**: 1.0  
**最后更新**: 2026年
