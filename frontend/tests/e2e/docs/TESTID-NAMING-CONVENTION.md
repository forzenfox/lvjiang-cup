# E2E 测试 test-id 命名规范

## 概述

本文档定义了 `lvjiang-cup-test` 项目中 E2E 测试使用的 `data-testid` 属性命名规范。统一命名规范可以提高测试的可维护性和可读性。

## 命名规则

### 1. 基本格式

```
{feature}-{component}-{identifier}
```

### 2. 组件类型后缀

| 组件类型 | 后缀格式 | 示例 |
|---------|---------|------|
| 输入框 | `-input` | `team-name-input`, `stream-url-input` |
| 按钮 | `-button` | `save-team-button`, `delete-team-button` |
| 卡片 | `-card` | `admin-team-card`, `swiss-match-card` |
| 列表项 | `-item-{index}` | `match-item-1`, `player-item-3` |
| 状态指示器 | `-status` | `sync-status`, `team-status` |
| Tab | `-tab` | `swiss-tab`, `elimination-tab` |
| 分组容器 | `-group-{id}` | `swiss-record-group-2-0`, `swiss-round-1` |
| 对话框 | `-dialog` | `match-edit-dialog` |
| Toast | `-toast` | `success-toast`, `error-toast` |

## 页面区域命名

### 首页 (Home)

| 区域 | test-id | 说明 |
|------|---------|------|
| 英雄标题 | `hero-title` | 首页大标题 |
| 直播按钮 | `live-button` | 观看直播按钮 |
| 管理入口 | `admin-link` | 跳转管理后台的链接 |
| 战队区域 | `teams-section` | 参赛战队展示区 |
| 赛程区域 | `schedule-section` | 赛程安排展示区 |
| 瑞士轮Tab | `home-swiss-tab` | 首页赛程Tab - 瑞士轮 |
| 淘汰赛Tab | `home-elimination-tab` | 首页赛程Tab - 淘汰赛 |
| 瑞士轮展示 | `swiss-stage-display` | 前台瑞士轮舞台组件 |
| 淘汰赛展示 | `elimination-stage-display` | 前台淘汰赛舞台组件 |
| 晋级状态 | `advancement-status` | 晋级状态指示器 |

### 管理后台

#### 通用

| 组件 | test-id | 说明 |
|------|---------|------|
| 页面标题 | `page-title` | 页面主标题 |
| 刷新按钮 | `refresh-button` | 刷新数据按钮 |
| 保存按钮 | `save-button` | 保存操作按钮 |
| 取消按钮 | `cancel-button` | 取消操作按钮 |
| 删除按钮 | `delete-button` | 删除操作按钮 |
| 添加按钮 | `add-button` | 添加新项目按钮 |

#### 登录页

| 组件 | test-id | 说明 |
|------|---------|------|
| 用户名输入 | `username-input` | 用户名输入框 |
| 密码输入 | `password-input` | 密码输入框 |
| 登录按钮 | `login-button` | 登录提交按钮 |
| 错误提示 | `login-error` | 登录错误提示 |

#### 仪表盘

| 组件 | test-id | 说明 |
|------|---------|------|
| 战队统计卡片 | `team-count-card` | 战队数量统计 |
| 比赛统计卡片 | `match-count-card` | 比赛数量统计 |
| 直播状态卡片 | `stream-status-card` | 直播状态卡片 |
| 系统状态卡片 | `system-status-card` | 系统状态卡片 |
| 直播管理入口 | `stream-management-link` | 直播管理快捷入口 |
| 战队管理入口 | `teams-management-link` | 战队管理快捷入口 |
| 赛程管理入口 | `schedule-management-link` | 赛程管理快捷入口 |

#### 战队管理

| 组件 | test-id | 说明 |
|------|---------|------|
| 战队卡片 | `team-card-{name}` | 单个战队卡片 |
| 战队名称 | `team-name` | 战队名称文本 |
| 队员数量 | `player-count` | 队员数量 |
| 战队Logo | `team-logo` | 战队Logo图片 |
| 选手头像 | `player-avatar` | 选手头像 |
| 选手名称 | `player-name` | 选手名称 |
| 位置标签 | `position-label` | 选手位置标签 |
| 添加战队按钮 | `add-team-button` | 添加新战队 |
| 保存战队按钮 | `save-team-button` | 保存战队信息 |
| 取消编辑按钮 | `cancel-edit-team-button` | 取消编辑 |
| 战队上限警告 | `team-limit-warning` | 战队数量上限提示 |

#### 赛程管理

| 组件 | test-id | 说明 |
|------|---------|------|
| 页面标题 | `schedule-page-title` | 赛程管理标题 |
| 比赛数量 | `schedule-match-count` | 比赛数量显示 |
| Tab容器 | `schedule-tabs` | Tab切换容器 |
| 瑞士轮Tab | `swiss-tab` | 瑞士轮Tab |
| 淘汰赛Tab | `elimination-tab` | 淘汰赛Tab |
| 初始化按钮 | `init-slots-button` | 初始化赛程槽位 |
| 刷新按钮 | `refresh-schedule-button` | 刷新赛程 |

#### 瑞士轮编辑器

| 组件 | test-id | 说明 |
|------|---------|------|
| 编辑器容器 | `swiss-stage-editor` | 瑞士轮编辑器主容器 |
| 瑞士轮舞台 | `swiss-stage` | 瑞士轮舞台组件 |
| 第1轮 | `swiss-round-1` | 瑞士轮第1轮 |
| 第2轮 | `swiss-round-2` | 瑞士轮第2轮 |
| 第3轮 | `swiss-round-3` | 瑞士轮第3轮 |
| 第4轮 | `swiss-round-4` | 瑞士轮第4轮 |
| 第5轮 | `swiss-round-5` | 瑞士轮第5轮 |
| 战绩分组 | `swiss-record-group-{record}` | 战绩分组，如 `swiss-record-group-2-0` |
| 比赛卡片 | `swiss-match-card-{record}-{index}` | 比赛卡片 |
| 晋级区域 | `editor-qualified-3-2` | 3-2晋级区 |
| 淘汰区域 | `editor-eliminated-2-3` | 2-3淘汰区 |
| 晋级状态 | `advancement-status` | 晋级状态显示 |

#### 淘汰赛

| 组件 | test-id | 说明 |
|------|---------|------|
| 淘汰赛舞台 | `elimination-stage` | 淘汰赛舞台组件 |
| 淘汰赛比赛 | `elimination-match-card-{stage}-{index}` | 淘汰赛比赛卡片 |
| 四分之一决赛 | `quarterfinals` | 四分之一决赛 |
| 半决赛 | `semifinals` | 半决赛 |
| 决赛 | `finals` | 决赛 |

#### 直播管理

| 组件 | test-id | 说明 |
|------|---------|------|
| 直播标题输入 | `stream-title-input` | 直播标题输入框 |
| 直播链接输入 | `stream-url-input` | 直播链接输入框 |
| 直播状态切换 | `is-live-toggle` | 直播状态开关 |
| 保存按钮 | `save-stream-button` | 保存直播配置 |

#### 晋级管理

| 组件 | test-id | 说明 |
|------|---------|------|
| 晋级列表 | `advancement-list` | 晋级名单列表 |
| 队伍项 | `team-item` | 晋级队伍项 |
| 添加按钮 | `add-team-to-advancement-button` | 添加晋级队伍 |
| 自动生成按钮 | `auto-generate-button` | 自动生成晋级名单 |
| 清空按钮 | `clear-advancement-button` | 清空晋级名单 |

## 动态ID命名

### 战队相关

```html
<!-- 按名称区分的战队卡片 -->
<div data-testid="team-card-驴酱"></div>
<div data-testid="team-card-测试战队A"></div>

<!-- 按索引的选手项 -->
<div data-testid="player-item-0"></div>
<div data-testid="player-item-1"></div>
```

### 比赛相关

```html
<!-- 按战绩和索引的比赛卡片 -->
<div data-testid="swiss-match-card-0-0-0"></div>
<div data-testid="swiss-match-card-1-0-0"></div>

<!-- 淘汰赛按阶段和索引 -->
<div data-testid="elimination-match-card-quarterfinals-1"></div>
<div data-testid="elimination-match-card-semifinals-1"></div>
```

## 状态命名

### 比赛状态

| 状态 | test-id值 | 说明 |
|------|----------|------|
| 未开始 | `upcoming` | 比赛尚未开始 |
| 进行中 | `ongoing` | 比赛进行中 |
| 已结束 | `finished` | 比赛已结束 |

### 战队状态

| 状态 | test-id值 | 说明 |
|------|----------|------|
| 晋级 | `qualified` | 战队已晋级 |
| 淘汰 | `eliminated` | 战队已淘汰 |
| 进行中 | `in-progress` | 比赛中 |

## 最佳实践

### ✅ 推荐做法

```typescript
// 使用清晰的命名
page.getByTestId('team-name-input')
page.getByTestId('swiss-match-card-2-0-0')
page.getByTestId('player-avatar-top')

// 使用描述性前缀
page.getByTestId('admin-team-card')
page.getByTestId('home-swiss-tab')
```

### ❌ 不推荐做法

```typescript
// 过于简略
page.getByTestId('input')
page.getByTestId('card')
page.getByTestId('btn')

// 缺少上下文
page.getByTestId('name')  // 不清楚是什么的名称
page.getByTestId('status')  // 不清楚是什么的状态
```

## 实施指南

1. **新组件**: 在创建新组件时，按照本规范添加 `data-testid` 属性
2. **现有组件**: 逐步将现有组件迁移到规范，使用一致的命名
3. **测试文件**: 测试中应使用 `data-testid` 进行元素定位，避免使用 CSS 选择器或 XPath

## 更新日志

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-04-11 | 1.0.0 | 初始版本，定义基础命名规范 |
