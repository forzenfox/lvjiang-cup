# LPL赛事数据页 - 比赛概览区 UI设计文档

> **版本**：v1.1（简化版）
> **参考来源**：`lpl.qq.com/web202301/stats.shtml?bmid=13222`
> **分析对象**：BLG 2:0 WBG 比赛数据页
> **文档目的**：为复刻/重构比赛概览区提供完整的组件拆解、样式规范和数据结构定义
> **简化说明**：已移除天赋符文、召唤师技能、装备相关显示

---

## 一、页面整体布局结构

### 1.1 容器体系

| 容器 | CSS类名 | 宽度 | 说明 |
|------|---------|------|------|
| 全局包裹 | `.wrap` | 100% | 最外层容器 |
| 内容缩放 | `.zoom-wrap-1240` | 1240px（基准） | 通过CSS zoom适配不同分辨率 |
| 面包屑 | `.c-breadcrumb.dark-mode` | 100% | 高34px，暗色模式 |
| 比赛概览区 | `.data-mode1-box` | 1240px | 背景图+底色，padding: 60px 0 100px 0 |
| 对战区 | `.data-teamvs` | 1004px | 居中，包含左队+比分+右队 |
| 数据详情区 | `.data-main-box` | 1240px | margin: 80px auto 0，背景#2d2d2d |

### 1.2 页面层级结构图

```
.wrap
├── .c-breadcrumb.dark-mode          ← 面包屑导航
│   └── .center-wrap
│       ├── a "数据"
│       ├── a "2026职业联赛..."
│       └── a "BLG VS WBG"
│
├── .data-mode1                      ← 比赛概览区（Hero Section）
│   ├── .data-mode1-box
│   │   ├── .data-teamvs.pr.clearfix ← 【核心】对战区
│   │   │   ├── .data-team.fl        ← 左侧队伍面板
│   │   │   │   ├── .team-pic        ← 队伍Logo (170px宽)
│   │   │   │   └── .team-info       ← 队伍名称
│   │   │   │
│   │   │   ├── .match-score.pa      ← 中央计分板 (300px宽)
│   │   │   │   ├── p.fl.bgn         ← 左队分数
│   │   │   │   │   ├── em           ← 分数数字
│   │   │   │   │   └── i.ico        ← 背景装饰
│   │   │   │   ├── p.fr.victory     ← 右队分数
│   │   │   │   │   ├── em           ← 分数数字
│   │   │   │   │   └── i.ico
│   │   │   │   ├── span.semicolon   ← 冒号分隔符 ":"
│   │   │   │   ├── .bmatch-time     ← 日期时间
│   │   │   │   │   ├── #bmatch_date
│   │   │   │   │   └── #bmatch_time
│   │   │   │   ├── .bmatch-stats    ← 比赛状态
│   │   │   │   └── a.match_video    ← CTA按钮 "视频回顾"
│   │   │   │
│   │   │   └── .data-team.fr        ← 右侧队伍面板
│   │   │       ├── .team-pic
│   │   │       └── .team-info
│   │   │
│   │   └── .data-main-box           ← 数据详情区
│   │       ├── .data-mode1-seasonbox ← 分场选择器
│   │       │   └── ul.data-mode1-season
│   │       │       ├── li "第1场"
│   │       │       └── li "第2场"
│   │       │
│   │       ├── .data-season.clearfix ← 单场数据对比
│   │       │   ├── #victory_team     ← 胜利标识
│   │       │   ├── .data-main.fl     ← 左队数据
│   │       │   │   ├── .data-main-t  ← 队名+Logo行
│   │       │   │   ├── ul.data-main-m ← 目标数据行
│   │       │   │   └── .data-main-b  ← Ban位行
│   │       │   │
│   │       │   ├── .data-main-sz.pa  ← 中央击杀比分
│   │       │   │   ├── p.killnum1    ← 左队击杀数
│   │       │   │   ├── i.n-spr.spr-vs ← VS图标
│   │       │   │   ├── p.killnum2    ← 右队击杀数
│   │       │   │   └── div "BAN"     ← BAN标签
│   │       │   │
│   │       │   └── .data-main.fr     ← 右队数据（镜像）
│   │       │
│   │       ├── .n-data-mode1-data    ← 子标签切换
│   │       │   ├── a "赛后综述" (on)
│   │       │   └── a "比赛分析"
│   │       │
│   │       └── .data-table           ← 选手数据表格
│   │           └── table.data-tab
│   │
│   └── (footer)
```

---

## 二、组件详细规范

### 2.1 面包屑导航（Breadcrumb）

| 属性 | 值 |
|------|-----|
| CSS类 | `.c-breadcrumb.dark-mode` |
| 高度 | 34px |
| 字体 | 14px |
| 文字颜色 | #ffffff（暗色模式） |
| 分隔符 | 7×13px 箭头图片，margin-left: 16px |
| 布局 | Flex，垂直居中 |

### 2.2 比赛概览区背景（Hero Background）

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-mode1-box` |
| 背景色 | #1f1f1f |
| 背景图 | `data_bg.jpg`，center top，no-repeat |
| 内边距 | padding: 60px 0 100px 0 |

### 2.3 队伍面板（Team Panel）

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-team`（左）/ `.data-team.fr`（右） |
| 宽度 | 170px |
| 对齐 | text-align: center |
| Logo容器 | `.team-pic`，图片宽度130px（`.data-teamvs img{width:130px}`） |
| 队名 | `.team-info`，color: #fff，font-size: 22px |

### 2.4 中央计分板（Score Panel）

| 属性 | 值 |
|------|-----|
| CSS类 | `.match-score.pa` |
| 宽度 | 300px |
| 定位 | position: absolute，top: 22px，left: 50%，margin-left: -134px |
| 字体 | font-family: dinbold, microsoft yahei |

#### 分数卡片（单个）

| 属性 | 值 |
|------|-----|
| CSS类 | `.match-score p`（左 `.bgn`）/ `.match-score p.victory`（右） |
| 宽×高 | 122px × 146px |
| 行高 | line-height: 146px |
| 背景 | #3b3b3b |
| 圆角 | border-radius: 5px |
| 内边距 | padding: 0 4px |
| 溢出 | overflow: hidden |

#### 分数数字

| 属性 | 值 |
|------|-----|
| CSS类 | `.match-score p em` |
| 宽×高 | 122px × 144px |
| 字号 | font-size: 130px |
| 行高 | line-height: 146px |
| 对齐 | text-align: center |
| 默认颜色 | #ffffff |
| 胜方颜色 | `.victory em` → **#0febc1**（青绿色） |
| 圆角 | border-radius: 3px |
| 布局 | display: block |

#### 冒号分隔符

| 属性 | 值 |
|------|-----|
| CSS类 | `.match-score .semicolon` |
| 宽×高 | 40px × 70px |
| 行高 | line-height: 70px |
| 字号 | font-size: 120px |
| 颜色 | #3b3b3b |
| 定位 | position: absolute，top: 32px，left: 50%，margin-left: -20px |

#### 日期时间

| 属性 | 值 |
|------|-----|
| CSS类 | `.bmatch-time` |
| 定位 | position: absolute，width: 100%，height: 30px |
| 顶部偏移 | top: 255px |
| 字号 | font-size: 20px |
| 颜色 | #ffffff |
| 对齐 | text-align: center |
| 日期字体 | font-family: dinlight, '微软雅黑'，margin-right: 20px |
| 时间字体 | font-family: dinbold, '微软雅黑' |

#### 比赛状态

| 属性 | 值 |
|------|-----|
| CSS类 | `.bmatch-stats` |
| 尺寸 | 80px × 80px |
| 定位 | position: absolute，top: -15px，left: 744px |
| 背景 | `match_sta.png`（精灵图），no-repeat |
| 文字缩进 | text-indent: -999em（文字隐藏，用图片展示） |

#### CTA按钮 "视频回顾"

| 属性 | 值 |
|------|-----|
| CSS类 | `.match_video` |
| 宽×高 | 294px × 38px |
| 行高 | line-height: 38px |
| 字号 | font-size: 18px |
| 颜色 | #ffffff |
| 对齐 | text-align: center |
| 背景 | #c49f58 |
| 圆角 | border-radius: 19px（全圆角药丸形） |
| 外边距 | margin: 13px auto 0 |
| 布局 | display: block |

---

### 2.5 分场选择器（Game Tabs）

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-mode1-season` |
| 宽度 | 1240px |
| 背景 | #181818（在 `.data-main-box` 内） |
| 边框 | border-bottom: 1px solid #505050 |

#### 单个Tab项

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-mode1-season li` |
| 高度 | 67px |
| 行高 | line-height: 67px |
| 默认边框 | border-top: 3px solid #181818 |
| 默认文字 | font-size: 16px，color: #727272 |
| 激活/悬停 | `.on` / `:hover` → border-color: **#c49f58**，color: **#c49f58**，font-weight: 700 |

---

### 2.6 单场数据对比区（Game Data Comparison）

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-season` |
| 内边距顶部 | padding-top: 28px |
| 边框 | border-bottom: 1px solid #505050 |

#### 队名+Logo行

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-main-t` |
| 内边距 | padding: 0 30px |
| 高度 | 60px |
| 行高 | line-height: 55px |
| 颜色 | #d5d4d4 |
| 字重 | font-weight: 700 |
| 字号 | font-size: 42px |
| Logo尺寸 | 55px × 55px |
| 队名间距 | margin: 0 13px |

#### 目标数据行（大龙/小龙/防御塔/金币）

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-main-m` |
| 内边距 | padding: 7px 6px 0 |
| 高度 | 56px |

**数据项 `.data-main-m-w1`（大龙/小龙/防御塔）**

| 属性 | 值 |
|------|-----|
| 宽度 | 95px |
| 对齐 | text-align: center |
| 标签文字 | font-size: 14px，line-height: 20px，color: grey，padding-bottom: 6px |
| 图标+数值容器 | height: 30px，line-height: 30px |
| 图标 | height: 100%（自适应） |
| 数值 | color: **#c49f58**，font-size: 20px，line-height: 30px，margin-left: 6px |
| 数值字体 | font-family: dinbold, microsoft yahei |

**数据项 `.data-main-m-w2`（金币）**

| 属性 | 值 |
|------|-----|
| 宽度 | 105px |
| 其余同上 | — |

#### Ban位行

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-main-b` |
| 高度 | 40px |
| 内边距 | padding: 20px 26px 33px |
| 图片 | height: 100%，margin: 0 4px |
| 数量 | 每队5个Ban位英雄头像 |

#### 中央击杀比分

| 属性 | 值 |
|------|-----|
| CSS类 | `.data-main-sz.pa` |
| 宽度 | 320px |
| 定位 | position: absolute，left: 50%，margin-left: -160px，top: 50px |
| 对齐 | text-align: center |

**击杀数字**

| 属性 | 左队 `.killnum1` | 右队 `.killnum2` |
|------|-----------------|-----------------|
| 宽度 | 140px | 140px |
| 字号 | 79px | 79px |
| 行高 | line-height: 90px | line-height: 90px |
| 颜色 | **#eb3200**（红橙色） | **#4594ee**（蓝色） |
| 字体 | dinbold, microsoft yahei | dinbold, microsoft yahei |
| 浮动 | float: left | float: right |

**VS图标**

| 属性 | 值 |
|------|-----|
| CSS类 | `.n-spr.spr-vs` |
| 尺寸 | 44px × 42px |
| 背景 | 精灵图 `n-spr.png`，background-position: -4px -4px |
| 定位 | position: absolute，top: 30px，left: 50%，margin-left: -22px |

**BAN标签**

| 属性 | 值 |
|------|-----|
| 元素 | `div` |
| 宽度 | 100% |
| 字号 | font-size: 26px |
| 字重 | font-weight: 700 |
| 行高 | line-height: 40px |
| 内边距顶部 | padding-top: 31px |

---

### 2.7 子标签切换（赛后综述/比赛分析）

| 属性 | 值 |
|------|-----|
| CSS类 | `.n-data-mode1-data.disul` |
| 宽度 | 1240px |
| 背景 | #1a1a1a |
| 布局 | font-size: 0（消除间距），text-align: center |

**单个标签项**

| 属性 | 值 |
|------|-----|
| CSS类 | `.n-data-mode1-data li` / `a.disli` |
| 宽度 | 50%（2列等分，已移除"天赋符文"） |
| 高度 | 115px（li）/ 118px（a） |
| 行高 | line-height: 160px |
| 默认文字 | color: #747474 |
| 激活/悬停 | `.on` / `:hover` → background: #2d2d2d，border-top: 3px solid **#cea04b**，color: **#cea04a** |

---

## 三、设计Token（Design Tokens）

### 3.1 色彩系统

```css
:root {
  /* 背景色 */
  --bg-primary: #1a1a1a;        /* 页面主背景 */
  --bg-secondary: #1f1f1f;      /* 概览区背景 */
  --bg-card: #2d2d2d;           /* 卡片/面板背景 */
  --bg-panel: #3b3b3b;          /* 分数卡片背景 */
  --bg-tab: #181818;            /* Tab栏背景 */
  --bg-tab-hover: #2d2d2d;      /* Tab悬停背景 */

  /* 文字色 */
  --text-primary: #ffffff;      /* 主文字 */
  --text-secondary: #d5d4d4;    /* 次要文字 */
  --text-muted: #727272;        /* 弱化文字 */
  --text-label: grey;           /* 标签文字（浏览器grey = #808080） */

  /* 强调色 */
  --accent-gold: #c49f58;       /* 金色主强调（CTA、Tab激活、数值） */
  --accent-gold-light: #cea04a; /* 浅金色（Tab激活态） */
  --accent-gold-dark: #cea04b;  /* 深金色 */
  --accent-cyan: #0febc1;       /* 胜方分数色 */
  --accent-red: #eb3200;        /* 左队击杀色 */
  --accent-blue: #4594ee;       /* 右队击杀色 */
  --accent-border: #505050;     /* 分隔线 */

  /* 功能色 */
  --color-win: #0febc1;         /* 胜利 */
  --color-lose: #ffffff;        /* 失败（白色） */
}
```

### 3.2 字体系统

```css
:root {
  /* 字体族 */
  --font-display: dinbold, 'Microsoft YaHei', sans-serif;  /* 数字/标题 */
  --font-light: dinlight, 'Microsoft YaHei', sans-serif;   /* 日期 */
  --font-body: 'Microsoft YaHei', sans-serif;               /* 正文 */

  /* 字号阶梯 */
  --text-xs: 12px;     /* 辅助信息 */
  --text-sm: 14px;     /* 标签、面包屑 */
  --text-base: 16px;   /* Tab文字 */
  --text-md: 18px;     /* CTA按钮 */
  --text-lg: 20px;     /* 日期时间 */
  --text-xl: 22px;     /* 队伍名称 */
  --text-2xl: 26px;    /* BAN标签 */
  --text-3xl: 40px;    /* 大击杀数字（紧凑模式） */
  --text-4xl: 42px;    /* 数据区队名 */
  --text-5xl: 79px;    /* 击杀比分数字 */
  --text-6xl: 120px;   /* 冒号分隔符 */
  --text-7xl: 130px;   /* 总比分数字 */
}
```

### 3.3 间距系统

```css
:root {
  --space-1: 4px;
  --space-2: 6px;
  --space-3: 8px;
  --space-4: 13px;
  --space-5: 16px;
  --space-6: 20px;
  --space-7: 26px;
  --space-8: 28px;
  --space-9: 30px;
  --space-10: 33px;
  --space-11: 34px;
  --space-12: 38px;
  --space-13: 40px;
  --space-14: 50px;
  --space-15: 55px;
  --space-16: 56px;
  --space-17: 60px;
  --space-18: 67px;
  --space-19: 70px;
  --space-20: 80px;
  --space-21: 100px;
  --space-22: 122px;
  --space-23: 134px;
  --space-24: 146px;
}
```

### 3.4 圆角系统

```css
:root {
  --radius-sm: 3px;     /* 分数数字内圆角 */
  --radius-md: 5px;     /* 分数卡片 */
  --radius-lg: 19px;    /* CTA按钮（全圆角药丸） */
}
```

---

## 四、组件线框图（ASCII）

### 4.1 比赛概览区完整线框

```
┌─────────────────────────────────────────────────────────────────────┐
│  .data-mode1-box (1240px, bg: #1f1f1f + bg_img, padding: 60px 0) │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  .data-teamvs (1004px, 居中, position: relative)             │  │
│  │                                                               │  │
│  │  ┌─────────┐  ┌──────────────────────────┐  ┌─────────┐     │  │
│  │  │.data-team│  │     .match-score         │  │.data-team│     │  │
│  │  │  170px   │  │       300px              │  │  170px   │     │  │
│  │  │          │  │  ┌─────┐ : ┌─────┐     │  │          │     │  │
│  │  │  [LOGO]  │  │  │  2  │   │  0  │     │  │  [LOGO]  │     │  │
│  │  │  130px   │  │  │122px│   │122px│     │  │  130px   │     │  │
│  │  │          │  │  │×146px│   │×146px│     │  │          │     │  │
│  │  │  BLG     │  │  │#0febc1│  │#fff │     │  │  WBG     │     │  │
│  │  │  22px    │  │  └─────┘   └─────┘     │  │  22px    │     │  │
│  │  │  #fff    │  │                          │  │  #fff    │     │  │
│  │  │          │  │  2026-04-12  19:00       │  │          │     │  │
│  │  │          │  │     20px  dinlight       │  │          │     │  │
│  │  │          │  │                          │  │          │     │  │
│  │  │          │  │  ┌──────────────────┐    │  │          │     │  │
│  │  │          │  │  │   视频回顾       │    │  │          │     │  │
│  │  │          │  │  │  294×38px        │    │  │          │     │  │
│  │  │          │  │  │  #c49f58 圆角19px│    │  │          │     │  │
│  │  │          │  │  └──────────────────┘    │  │          │     │  │
│  │  └─────────┘  └──────────────────────────┘  └─────────┘     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  .data-main-box (1240px, bg: #2d2d2d, margin-top: 80px)     │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  .data-mode1-season (分场选择器)                         │  │  │
│  │  │  ┌──────────┬──────────┐                                │  │  │
│  │  │  │  第1场   │  第2场   │  bg: #181818, h: 67px          │  │  │
│  │  │  │  (激活)  │  (默认)  │  激活: border-top 3px #c49f58  │  │  │
│  │  │  └──────────┴──────────┘                                │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  .data-season (单场数据对比, padding-top: 28px)          │  │  │
│  │  │                                                         │  │  │
│  │  │  ┌───────────┐  ┌────────┐  ┌───────────┐              │  │  │
│  │  │  │ BLG 55px  │  │  26    │  │  WBG 55px │              │  │  │
│  │  │  │ Logo+Name │  │ ⚔ VS  │  │ Logo+Name │              │  │  │
│  │  │  │ 42px bold │  │  15    │  │ 42px bold │              │  │  │
│  │  │  │ #d5d4d4   │  │ 79px   │  │ #d5d4d4   │              │  │  │
│  │  │  └───────────┘  └────────┘  └───────────┘              │  │  │
│  │  │                 ┌──────┐                                  │  │  │
│  │  │                 │ BAN  │  26px bold                      │  │  │
│  │  │                 └──────┘                                  │  │  │
│  │  │                                                         │  │  │
│  │  │  ┌────────────────────┐  ┌────────────────────┐         │  │  │
│  │  │  │ .data-main.fl      │  │ .data-main.fr      │         │  │  │
│  │  │  │ ┌──────┬──────┐    │  │ ┌──────┬──────┐    │         │  │  │
│  │  │  │ │大龙 2│小龙 4│    │  │ │金币   │防御塔1│    │         │  │  │
│  │  │  │ │塔 10 │金82727│   │  │ │69278 │小龙 1│    │         │  │  │
│  │  │  │ │95px  │105px │    │  │ │105px │95px  │    │         │  │  │
│  │  │  │ └──────┴──────┘    │  │ └──────┴──────┘    │         │  │  │
│  │  │  │ [Ban1][Ban2]...[5] │  │ [Ban1][Ban2]...[5] │         │  │  │
│  │  │  └────────────────────┘  └────────────────────┘         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  .n-data-mode1-data (子标签切换)                        │  │  │
│  │  │  ┌──────────────────┬──────────────────┐                │  │  │
│  │  │  │    赛后综述      │    比赛分析      │  2列等分 50%   │  │  │
│  │  │  │     (激活)       │                  │  h: 115px      │  │  │
│  │  │  └──────────────────┴──────────────────┘                │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 五、完整数据结构定义

### 5.1 比赛概览数据（Match Overview）

```typescript
interface MatchOverview {
  // ===== 比赛基础信息 =====
  matchId: string;                    // 比赛唯一ID
  tournamentName: string;             // 赛事名称，如 "2026职业联赛第二赛段组内赛"
  matchDate: string;                  // 比赛日期，格式 "YYYY-MM-DD"，如 "2026-04-12"
  matchTime: string;                  // 比赛时间，格式 "HH:MM"，如 "19:00"
  matchStatus: MatchStatus;           // 比赛状态枚举
  videoReplayUrl: string | null;      // 视频回顾链接（null表示无回放）
  bestOf: number;                     // 赛制，如 3（BO3）、5（BO5）

  // ===== 队伍信息 =====
  teamA: TeamInfo;                    // 左侧/蓝方队伍
  teamB: TeamInfo;                    // 右侧/红方队伍

  // ===== 比赛结果 =====
  teamAScore: number;                 // 队伍A胜场数，如 2
  teamBScore: number;                 // 队伍B胜场数，如 0
  winner: 'teamA' | 'teamB' | null;  // 胜方标识
}

enum MatchStatus {
  NOT_STARTED = 'not_started',        // 未开始
  IN_PROGRESS = 'in_progress',        // 进行中
  FINISHED = 'finished',              // 已结束
}

interface TeamInfo {
  teamId: string;                     // 队伍唯一ID
  teamName: string;                   // 队伍简称，如 "BLG"
  teamFullName: string;               // 队伍全称，如 "Bilibili Gaming"
  teamLogoUrl: string;                // 队伍Logo图片URL
  teamLink: string;                   // 队伍详情页链接
}
```

### 5.2 单场游戏数据（Per-Game Data）

```typescript
interface GameData {
  // ===== 单场基础信息 =====
  gameId: string;                     // 单场唯一ID
  gameNumber: number;                 // 第几场，从1开始
  gameDuration: number;               // 游戏时长（秒），如 2340（39分00秒）
  winner: 'teamA' | 'teamB';          // 本场胜方

  // ===== 团队目标数据 =====
  teamAObjectives: TeamObjectives;    // 队伍A目标数据
  teamBObjectives: TeamObjectives;    // 队伍B目标数据

  // ===== 击杀数据 =====
  teamAKills: number;                 // 队伍A总击杀数
  teamBKills: number;                 // 队伍B总击杀数

  // ===== Ban位数据 =====
  teamABans: ChampionBan[];           // 队伍A的Ban位列表（5个）
  teamBBans: ChampionBan[];           // 队伍B的Ban位列表（5个）

  // ===== 选手数据 =====
  teamAPlayers: PlayerGameData[];     // 队伍A的5名选手数据
  teamBPlayers: PlayerGameData[];     // 队伍B的5名选手数据
}

interface TeamObjectives {
  barons: number;                     // 大龙（纳什男爵）数量
  dragons: number;                    // 小龙数量
  towers: number;                     // 防御塔推掉数量
  totalGold: number;                  // 团队总金币
  inhibitors: number;                 // 水晶/抑制塔数量（可选）
  heralds: number;                    // 峡谷先锋数量（可选）
  elders: number;                     // 远古龙数量（可选）
}

interface ChampionBan {
  championId: string;                 // 英雄唯一ID
  championName: string;               // 英雄名称，如 "韦鲁斯"
  championTitle: string;              // 英雄称号，如 "惩戒之箭"
  championIconUrl: string;            // 英雄头像图片URL
  banOrder: number;                   // Ban的顺序（1-5）
}

interface PlayerGameData {
  // ===== 选手基础信息 =====
  playerId: string;                   // 选手唯一ID
  playerName: string;                 // 选手游戏ID，如 "Bin"
  playerAvatarUrl: string;            // 选手头像URL
  role: PlayerRole;                   // 位置/角色

  // ===== 英雄信息 =====
  championId: string;                 // 使用的英雄ID
  championName: string;               // 英雄名称
  championIconUrl: string;            // 英雄头像URL
  championLevel: number;              // 英雄最终等级

  // ===== KDA =====
  kills: number;                      // 击杀数
  deaths: number;                     // 死亡数
  assists: number;                    // 助攻数

  // ===== 经济数据 =====
  goldEarned: number;                 // 获得金币
  goldPerMinute: number;              // 每分钟金币（可选）
  creepScore: number;                 // 补刀数
  creepScorePerMinute: number;        // 每分钟补刀（可选）

  // ===== 伤害数据（可选/进阶） =====
  totalDamageDealt: number;           // 总伤害输出
  totalDamageDealtToChampions: number; // 对英雄伤害
  totalDamageTaken: number;           // 承受伤害
  damagePerMinute: number;            // 每分钟伤害（可选）

  // ===== 视野数据（可选/进阶） =====
  visionScore: number;                // 视野得分
  wardsPlaced: number;                // 放置守卫数
  wardsKilled: number;                // 击杀守卫数

  // ===== 参团数据（可选/进阶） =====
  killParticipation: number;          // 参团率（百分比）
  longestLivingTime: number;          // 最长存活时间（秒）
  doubleKills: number;                // 双杀次数
  tripleKills: number;                // 三杀次数
  quadraKills: number;                // 四杀次数
  pentaKills: number;                 // 五杀次数
}

enum PlayerRole {
  TOP = 'top',                        // 上单
  JUNGLE = 'jungle',                  // 打野
  MID = 'mid',                        // 中单
  ADC = 'adc',                        // ADC
  SUPPORT = 'support'                 // 辅助
}
```

### 5.3 完整比赛数据（聚合）

```typescript
interface FullMatchData {
  overview: MatchOverview;            // 比赛概览（比分、队伍、时间）
  games: GameData[];                  // 各场详细数据
}

// ===== 示例数据 =====
const exampleData: FullMatchData = {
  overview: {
    matchId: "13222",
    tournamentName: "2026职业联赛第二赛段组内赛",
    matchDate: "2026-04-12",
    matchTime: "19:00",
    matchStatus: MatchStatus.FINISHED,
    videoReplayUrl: "//lpl.qq.com/video/...",
    bestOf: 3,
    teamA: {
      teamId: "blg",
      teamName: "BLG",
      teamFullName: "Bilibili Gaming",
      teamLogoUrl: "//game.gtimg.cn/images/lol/teams/blg.png",
      teamLink: "//lpl.qq.com/team/blg"
    },
    teamB: {
      teamId: "wbg",
      teamName: "WBG",
      teamFullName: "Weibo Gaming",
      teamLogoUrl: "//game.gtimg.cn/images/lol/teams/wbg.png",
      teamLink: "//lpl.qq.com/team/wbg"
    },
    teamAScore: 2,
    teamBScore: 0,
    winner: "teamA"
  },
  games: [
    {
      gameId: "game1",
      gameNumber: 1,
      gameDuration: 2340,
      winner: "teamA",
      teamAObjectives: { barons: 2, dragons: 4, towers: 10, totalGold: 82727 },
      teamBObjectives: { barons: 0, dragons: 1, towers: 1, totalGold: 69278 },
      teamAKills: 26,
      teamBKills: 15,
      teamABans: [
        { championId: "champ1", championName: "韦鲁斯", championTitle: "惩戒之箭", championIconUrl: "...", banOrder: 1 },
        { championId: "champ2", championName: "兰博", championTitle: "机械公敌", championIconUrl: "...", banOrder: 2 },
        { championId: "champ3", championName: "嘉文四世", championTitle: "德玛西亚皇子", championIconUrl: "...", banOrder: 3 },
        { championId: "champ4", championName: "安妮", championTitle: "黑暗之女", championIconUrl: "...", banOrder: 4 },
        { championId: "champ5", championName: "阿萝拉", championTitle: "双界灵兔", championIconUrl: "...", banOrder: 5 }
      ],
      teamBBans: [
        { championId: "champ6", championName: "奥莉安娜", championTitle: "发条魔灵", championIconUrl: "...", banOrder: 1 },
        { championId: "champ7", championName: "瑞兹", championTitle: "符文法师", championIconUrl: "...", banOrder: 2 },
        { championId: "champ8", championName: "卡尔玛", championTitle: "天启者", championIconUrl: "...", banOrder: 3 },
        { championId: "champ9", championName: "纳尔", championTitle: "迷失之牙", championIconUrl: "...", banOrder: 4 },
        { championId: "champ10", championName: "安蓓萨", championTitle: "铁血狼母", championIconUrl: "...", banOrder: 5 }
      ],
      teamAPlayers: [
        { playerId: "p1", playerName: "Bin", role: PlayerRole.TOP, championId: "gwen", championName: "格温", championLevel: 18, kills: 2, deaths: 2, assists: 11, goldEarned: 17315, creepScore: 349 },
        { playerId: "p2", playerName: "Xun", role: PlayerRole.JUNGLE, championId: "pantheon", championName: "潘森", championLevel: 18, kills: 4, deaths: 7, assists: 10, goldEarned: 14855, creepScore: 261 },
        { playerId: "p3", playerName: "Knight", role: PlayerRole.MID, championId: "ksante", championName: "奎桑提", championLevel: 18, kills: 13, deaths: 0, assists: 11, goldEarned: 19592, creepScore: 339 },
        { playerId: "p4", playerName: "Viper", role: PlayerRole.ADC, championId: "ashe", championName: "艾希", championLevel: 18, kills: 7, deaths: 3, assists: 10, goldEarned: 19385, creepScore: 368 },
        { playerId: "p5", playerName: "ON", role: PlayerRole.SUPPORT, championId: "seraphine", championName: "萨勒芬妮", championLevel: 18, kills: 0, deaths: 3, assists: 22, goldEarned: 11580, creepScore: 47 }
      ],
      teamBPlayers: [
        { playerId: "p6", playerName: "Zika", role: PlayerRole.TOP, championId: "sion", championName: "赛恩", championLevel: 18, kills: 1, deaths: 5, assists: 9, goldEarned: 12062, creepScore: 267 },
        { playerId: "p7", playerName: "Tian", role: PlayerRole.JUNGLE, championId: "xinzhao", championName: "赵信", championLevel: 18, kills: 6, deaths: 4, assists: 8, goldEarned: 15241, creepScore: 264 },
        { playerId: "p8", playerName: "Xiaohu", role: PlayerRole.MID, championId: "azir", championName: "阿兹尔", championLevel: 18, kills: 4, deaths: 5, assists: 9, goldEarned: 13478, creepScore: 297 },
        { playerId: "p9", playerName: "ELK", role: PlayerRole.ADC, championId: "neeko", championName: "妮蔻", championLevel: 18, kills: 3, deaths: 5, assists: 8, goldEarned: 18116, creepScore: 375 },
        { playerId: "p10", playerName: "Hang", role: PlayerRole.SUPPORT, championId: "lulu", championName: "璐璐", championLevel: 18, kills: 1, deaths: 7, assists: 14, goldEarned: 10381, creepScore: 46 }
      ]
    },
    // game2...
  ]
};
```

---

## 六、静态资源清单

### 6.1 图片资源

| 资源 | URL | 用途 | 尺寸 |
|------|-----|------|------|
| 概览区背景 | `//game.gtimg.cn/images/lpl/es/web201612/data_bg.jpg` | Hero区背景 | 全宽 |
| 精灵图（通用） | `//ossweb-img.qq.com/images/lol/match/lspl/spr.png` | 比分卡片装饰 | 精灵图 |
| 精灵图（数据区） | `//game.gtimg.cn/images/lpl/es/web201612/n-spr.png` | VS图标等 | 精灵图 |
| 大龙图标 | `//ossweb-img.qq.com/images/lpl/web201612/data-ico1.png` | 大龙数量 | 30px高 |
| 小龙图标 | `//ossweb-img.qq.com/images/lpl/web201612/data-ico2.png` | 小龙数量 | 30px高 |
| 防御塔图标 | `//ossweb-img.qq.com/images/lpl/web201612/data-ico3.png` | 防御塔数量 | 30px高 |
| 金币图标 | `//ossweb-img.qq.com/images/lpl/web201612/data-ico4.png` | 金币数量 | 30px高 |
| 比赛状态图 | `//game.gtimg.cn/images/lpl/es/web201612/match_sta.png` | "已结束"状态 | 80×80px |
| 面包屑箭头（亮色） | `//game.gtimg.cn/images/lpl/web202301/breadcrumb-arrow.png` | 分隔符 | 7×13px |
| 面包屑箭头（暗色） | `//game.gtimg.cn/images/lpl/web202301/breadcrumb-arrow-dark-mode.png` | 分隔符 | 7×13px |
| 默认占位图 | `//game.gtimg.cn/images/lol/match/public/pic_none.png` | 图片加载占位 | — |

### 6.2 CSS文件

| 文件 | URL | 主要内容 |
|------|-----|---------|
| 通用样式 | `/web202301/css/common.css` | 布局容器、面包屑、导航 |
| 核心数据页样式 | `/web201612/css/ny.css` | 比赛概览区、数据对比区、精灵图 |
| 数据表格样式 | `/web201612/css/stats_comm.css` | 选手数据表格 |
| Tooltip样式 | `//lol.qq.com/act/base/css/tooltip.css` | 悬浮提示 |

### 6.3 JS文件

| 文件 | URL | 主要内容 |
|------|-----|---------|
| jQuery | `//ossweb-img.qq.com/images/js/jquery/jquery-1.9.1.min.js` | DOM操作 |
| Milo框架 | `//ossweb-img.qq.com/images/js/milo_bundle/milo.js` | 腾讯MVC框架 |
| 数据加载 | `/web201612/js/showdata2.js` | 数据请求与渲染 |
| 数据页逻辑 | `/web202301/js/after-data-1.js` | 赛后数据页交互 |
| 通用逻辑 | `/web202301/js/common.js` | 公共函数 |
| 工具函数 | `/web201612/js/tools.js` | 辅助工具 |

---

## 七、交互状态定义

| 组件 | 默认态 | 悬停态 | 激活/选中态 | 禁用态 |
|------|--------|--------|------------|--------|
| 分场Tab | color: #727272, bg: transparent | bg: #2d2d2d, border-top: 3px solid #c49f58 | color: #c49f58, font-weight: 700, bg: #2d2d2d | — |
| 子标签（赛后综述/比赛分析） | color: #747474 | bg: #2d2d2d, border-top: 3px solid #cea04b | color: #cea04a | — |
| CTA按钮"视频回顾" | bg: #c49f58, color: #fff | bg: lighten(#c49f58, 10%), shadow增强 | — | bg: #666, cursor: not-allowed |
| 队伍Logo | — | — | — | — |
| 分数卡片 | bg: #3b3b3b | — | 胜方: color #0febc1 | — |
| 数据行（选手） | bg: transparent | transform: translateY(-8px), bg: #66583d | — | — |

---

## 八、响应式适配建议

| 断点 | 宽度范围 | 适配策略 |
|------|---------|---------|
| Desktop XL | ≥1440px | 原始1240px布局居中，两侧留白 |
| Desktop | 1024-1439px | 保持1240px布局，CSS zoom缩放 |
| Tablet | 768-1023px | 队伍面板缩窄，分数字号缩小，数据区横向滚动 |
| Mobile | <768px | 纵向堆叠：队A → 比分 → 队B → CTA；数据区改为卡片式 |

---

## 九、开发注意事项

1. **字体依赖**：页面使用了 `dinbold` 和 `dinlight` 字体，需要自行引入 DIN 字体文件或使用替代字体（如 Bebas Neue、Oswald 等）
2. **精灵图**：VS图标、比分装饰等使用CSS精灵图定位，复刻时需重新切图或改用SVG图标
3. **数据加载**：原始页面通过JS动态加载数据（showdata2.js），HTML中为占位符（`?` / `pic_none.png`），需实现数据接口对接
4. **浮动布局**：原始页面大量使用 `float` 布局（`.fl` = float:left, `.fr` = float:right），建议重构时改用 Flexbox 或 Grid
5. **绝对定位**：计分板、击杀比分、比赛状态等使用 `position: absolute`，需注意父容器 `position: relative`
6. **图片资源**：所有图片托管在 `game.gtimg.cn` 和 `ossweb-img.qq.com`，需考虑CDN可用性和图片版权

---

## 十、简化说明

本版本相较于原始设计做了以下简化：

| 移除项 | 原位置 | 说明 |
|--------|--------|------|
| 天赋符文标签 | 子标签切换区 | 从3个标签减少为2个（赛后综述、比赛分析） |
| 召唤师技能 | 选手数据表格 | 移除D/F键召唤师技能图标显示 |
| 装备展示 | 选手数据表格 | 移除6件装备+饰品的图标显示 |
| 符文数据 | 选手数据结构 | 移除 `primaryRunePath`、`secondaryRunePath`、`statShards` 字段 |
| 装备数据 | 选手数据结构 | 移除 `items`、`trinket` 字段 |
| 召唤师技能数据 | 选手数据结构 | 移除 `summonerSpellD`、`summonerSpellF` 字段 |

**简化后的数据结构更聚焦于核心比赛数据**：
- 比赛结果（比分、胜负）
- 团队目标（大龙、小龙、防御塔、金币）
- 击杀数据
- Ban位信息
- 选手基础数据（英雄、KDA、金币、补刀）

---

## 十一、选手展开面板 — 六芒星雷达图对比（新增）

### 11.1 功能说明

在选手数据表格中，**点击某一行选手**时，展开一个对比面板，显示该选手与对位选手的**六芒星雷达图数据对比**。

- **触发方式**：点击选手数据行
- **展开内容**：六芒星雷达图 + 双方选手名称与英雄
- **关闭方式**：再次点击收起，或点击其他选手行切换

### 11.2 展开面板整体布局

```
┌─────────────────────────────────────────────────────────────────────┐
│  选手展开面板 (.player-expand-panel)                                │
│  宽度: 100%（与数据表格同宽）                                        │
│  背景: #2a2a2a                                                       │
│                                                                     │
│  ┌───────────┐  ┌──────────────────────┐  ┌───────────┐            │
│  │ 左侧选手   │  │                      │  │ 右侧选手   │            │
│  │           │  │   六芒星雷达图        │  │           │            │
│  │ [英雄头像] │  │   (Radar Chart)      │  │ [英雄头像] │            │
│  │ 选手名称   │  │                      │  │ 选手名称   │            │
│  │ 英雄名称   │  │   6个维度对比         │  │ 英雄名称   │            │
│  │           │  │   双层多边形叠加       │  │           │            │
│  └───────────┘  └──────────────────────┘  └───────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

**三栏布局**：左选手信息 | 中央雷达图 | 右选手信息

### 11.3 选手信息侧栏（简化版）

每侧仅显示选手名称和英雄，布局简洁。

| 属性 | 值 |
|------|-----|
| 宽度 | ~120px |
| 对齐 | text-align: center |
| 垂直位置 | 与雷达图垂直居中对齐 |

**选手名称**

| 属性 | 值 |
|------|-----|
| 字号 | 18px |
| 字重 | font-weight: 700 |
| 颜色 | #ffffff |
| 字体 | --font-body |
| 间距 | margin-bottom: 8px |

**英雄头像**

| 属性 | 值 |
|------|-----|
| 尺寸 | 48px × 48px |
| 形状 | 圆形（border-radius: 50%） |
| 边框 | 2px solid，左队: #00bcd4，右队: #f44336 |
| 间距 | margin-bottom: 6px |

**英雄名称**

| 属性 | 值 |
|------|-----|
| 字号 | 14px |
| 字重 | font-weight: 400 |
| 颜色 | #b0b0b0 |

### 11.4 六芒星雷达图（核心组件）

#### 整体容器

| 属性 | 值 |
|------|-----|
| CSS类 | `.radar-chart` |
| 尺寸 | 320px × 320px（正方形） |
| 定位 | 居中于展开面板 |
| 背景 | transparent（继承面板背景 #2a2a2a） |

#### 六芒星网格（背景层）

| 属性 | 值 |
|------|-----|
| 形状 | 正六边形，6个顶点均匀分布（60°间隔） |
| 同心层数 | 5层（从中心到外） |
| 网格线颜色 | rgba(255, 255, 255, 0.1) |
| 网格线宽度 | 1px |
| 轴线颜色 | rgba(255, 255, 255, 0.15) |
| 轴线宽度 | 1px |
| 轴线长度 | 从中心到最外层顶点 |

#### 6个数据维度

从12点钟方向顺时针排列：

| 序号 | 维度名称 | 英文Key | 数据类型 | 格式 | 说明 |
|------|---------|---------|---------|------|------|
| 1 | 伤害占比 | `damageShare` | 百分比 | "27.4%" | 选手伤害占团队总伤害的比例 |
| 2 | 每死承伤 | `damageTakenPerDeath` | 数值 | "11,547" | 总承受伤害 / 死亡次数 |
| 3 | 经济 | `goldEarned` | 数值 | "13,051" | 总获得金币 |
| 4 | 补刀 | `creepScore` | 数值 | "299" | 总补刀数 |
| 5 | 参团率 | `killParticipation` | 百分比 | "50.0%" | (击杀+助攻) / 团队总击杀 |
| 6 | 生存 | `survival` | 数值 | "-2" | 净击杀差（击杀 - 死亡），可为负值 |

#### 维度标签

| 属性 | 值 |
|------|-----|
| 字号 | 12px |
| 颜色 | #b0b0b0 |
| 位置 | 各轴顶点外侧，距顶点 ~20px |
| 对齐 | 文字居中对齐到对应轴方向 |

#### 数据多边形（左队 / 蓝方）

| 属性 | 值 |
|------|-----|
| 填充色 | rgba(0, 188, 212, 0.25)（青色半透明） |
| 边框色 | #00bcd4（青色实线） |
| 边框宽度 | 2px |
| 顶点标记 | 无（纯多边形） |
| 数据映射 | 各维度值归一化到 0~1 范围后映射到同心层 |

#### 数据多边形（右队 / 红方）

| 属性 | 值 |
|------|-----|
| 填充色 | rgba(244, 67, 54, 0.25)（红色半透明） |
| 边框色 | #f44336（红色实线） |
| 边框宽度 | 2px |
| 顶点标记 | 无（纯多边形） |
| 数据映射 | 同上，使用右队数据 |

#### 数据归一化规则

每个维度的最大值取**双方该维度的较大值**，最小值为 0：

```
normalizedValue = Math.max(0, value) / Math.max(leftValue, rightValue, 1)
```

- **百分比类型**（伤害占比、参团率）：直接使用百分比值 / 100
- **数值类型**（每死承伤、经济、补刀）：按双方最大值归一化
- **生存维度**（可为负值）：需特殊处理，建议将负值映射为 0，正值为 (value / maxValue)

### 11.5 配色方案（雷达图专用）

```css
:root {
  /* 雷达图配色 */
  --radar-left-fill: rgba(0, 188, 212, 0.25);     /* 左队填充 */
  --radar-left-stroke: #00bcd4;                     /* 左队边框 */
  --radar-right-fill: rgba(244, 67, 54, 0.25);     /* 右队填充 */
  --radar-right-stroke: #f44336;                    /* 右队边框 */
  --radar-grid: rgba(255, 255, 255, 0.1);           /* 网格线 */
  --radar-axis: rgba(255, 255, 255, 0.15);          /* 轴线 */
  --radar-label: #b0b0b0;                           /* 维度标签 */
  --radar-panel-bg: #2a2a2a;                        /* 面板背景 */
}
```

### 11.6 交互状态

| 状态 | 触发 | 效果 |
|------|------|------|
| 展开 | 点击选手行 | 面板从0高度展开到完整高度，transition: height 0.3s ease |
| 收起 | 再次点击同一行 | 面板收起，transition: height 0.3s ease |
| 切换 | 点击另一行 | 当前面板内容更新为新对位选手数据 |
| 悬停雷达图 | 鼠标悬停某维度区域 | 显示该维度的双方具体数值 tooltip |

### 11.7 展开面板线框图

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ┌─────────┐                                        ┌─────────┐  │
│   │ [格温]  │          伤害占比                        │ [赛恩]  │  │
│   │  48px   │           27.4%  24.6%                   │  48px   │  │
│   │         │          ╱        ╲                       │         │  │
│   │  Bin    │     每死承伤      经济                    │  Zika   │  │
│   │  18px   │    11,547       13,051                    │  18px   │  │
│   │  格温   │       │    ⬡    │                         │  赛恩   │  │
│   │  14px   │  参团率 ╱ ╲ 补刀                         │  14px   │  │
│   │         │  50.0% ╲ ╱  299                          │         │  │
│   │  #00bcd4│       生存                                │  #f44336│  │
│   └─────────┘                                        └─────────┘  │
│                                                                     │
│   青色半透明多边形（左队）叠加 红色半透明多边形（右队）               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.8 技术实现建议

**推荐方案**：使用 Canvas 或 SVG 绘制六芒星雷达图

**SVG方案（推荐）**：
- 使用 `<polygon>` 绘制网格和数据多边形
- 使用 `<text>` 绘制维度标签
- 使用 CSS transition 实现展开/收起动画
- 优势：矢量无损缩放、DOM可访问性好、易于添加交互事件

**Canvas方案**：
- 使用 `<canvas>` 绘制全部图形
- 优势：性能更好，适合大量动画
- 劣势：需要手动处理 DPI 缩放和交互事件

**数据归一化函数示例**：

```typescript
function normalizeRadarData(
  leftPlayer: RadarData,
  rightPlayer: RadarData
): { left: number[]; right: number[] } {
  const dimensions: (keyof RadarData)[] = [
    'damageShare', 'damageTakenPerDeath', 'goldEarned',
    'creepScore', 'killParticipation', 'survival'
  ];

  return {
    left: dimensions.map(dim => {
      const leftVal = Math.max(0, leftPlayer[dim] as number);
      const rightVal = Math.max(0, rightPlayer[dim] as number);
      const maxVal = Math.max(leftVal, rightVal, 1);
      return leftVal / maxVal;
    }),
    right: dimensions.map(dim => {
      const leftVal = Math.max(0, leftPlayer[dim] as number);
      const rightVal = Math.max(0, rightPlayer[dim] as number);
      const maxVal = Math.max(leftVal, rightVal, 1);
      return rightVal / maxVal;
    })
  };
}
```

### 11.9 雷达图数据结构

```typescript
interface RadarData {
  damageShare: number;            // 伤害占比（百分比数值，如 27.4 表示 27.4%）
  damageTakenPerDeath: number;   // 每死承伤（数值）
  goldEarned: number;             // 经济（数值）
  creepScore: number;             // 补刀（数值）
  killParticipation: number;      // 参团率（百分比数值，如 50.0 表示 50.0%）
  survival: number;               // 生存（净击杀差 = kills - deaths）
}
```

该接口已集成到下方 §5.2 的 `PlayerGameData` 中（见 §11.10）。

### 11.10 数据结构更新说明

在 `PlayerGameData` 接口中新增 `radarData` 字段：

```typescript
interface PlayerGameData {
  // ... 原有字段保持不变 ...

  // ===== 雷达图数据（新增） =====
  radarData: RadarData;           // 六芒星雷达图6维度数据
}
```

**完整 `PlayerGameData` 更新后**：

```typescript
interface PlayerGameData {
  // ===== 选手基础信息 =====
  playerId: string;
  playerName: string;
  playerAvatarUrl: string;
  role: PlayerRole;

  // ===== 英雄信息 =====
  championId: string;
  championName: string;
  championIconUrl: string;
  championLevel: number;

  // ===== KDA =====
  kills: number;
  deaths: number;
  assists: number;

  // ===== 经济数据 =====
  goldEarned: number;
  goldPerMinute: number;              // 可选
  creepScore: number;
  creepScorePerMinute: number;        // 可选

  // ===== 伤害数据（可选/进阶） =====
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageDealtToChampionsShare: number;  // 新增：伤害占比（%）
  totalDamageTaken: number;
  damagePerMinute: number;            // 可选

  // ===== 视野数据（可选/进阶） =====
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;

  // ===== 参团数据（可选/进阶） =====
  killParticipation: number;          // 参团率（%）
  longestLivingTime: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;

  // ===== 雷达图数据（新增） =====
  radarData: RadarData;
}
```

**`RadarData` 可从已有字段自动计算**：

```typescript
function computeRadarData(player: PlayerGameData, teamTotalKills: number, teamTotalDamage: number): RadarData {
  return {
    damageShare: player.totalDamageDealtToChampionsShare
      ?? (teamTotalDamage > 0 ? (player.totalDamageDealtToChampions / teamTotalDamage) * 100 : 0),
    damageTakenPerDeath: player.deaths > 0 ? Math.round(player.totalDamageTaken / player.deaths) : 0,
    goldEarned: player.goldEarned,
    creepScore: player.creepScore,
    killParticipation: player.killParticipation
      ?? (teamTotalKills > 0 ? ((player.kills + player.assists) / teamTotalKills) * 100 : 0),
    survival: player.kills - player.deaths  // 净击杀差
  };
}
```

**示例数据**：

```typescript
// Bin (BLG) vs Zika (WBG) 上单对位
const binRadar: RadarData = {
  damageShare: 18.5,          // 18.5%
  damageTakenPerDeath: 8542,  // 17084 / 2
  goldEarned: 17315,
  creepScore: 349,
  killParticipation: 50.0,    // (2+11)/26 * 100
  survival: 0                 // 2-2=0
};

const zikaRadar: RadarData = {
  damageShare: 15.2,
  damageTakenPerDeath: 6231,  // 31155 / 5
  goldEarned: 12062,
  creepScore: 267,
  killParticipation: 60.0,    // (1+9)/15 * 100（按WBG团队击杀算）... 或按全场: (1+9)/41
  survival: -4                // 1-5=-4
};
```
