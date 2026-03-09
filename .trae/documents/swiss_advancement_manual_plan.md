# 瑞士轮晋级/淘汰名单手动管理方案

## 1. 项目概述

### 目标
为管理员提供一个直观的手动管理界面，完全控制瑞士轮晋级/淘汰名单的设置。

### 核心功能
- 可视化展示当前晋级/淘汰名单
- 拖拽调整队伍分类
- 保存/重置操作
- 操作历史记录

---

## 2. 技术架构

```
src/
├── store/
│   └── advancementStore.ts       # 状态管理
├── pages/admin/
│   └── AdvancementManager.tsx    # 管理员界面（新）
├── components/features/
│   └── SwissStage.tsx            # 修改：从store读取数据
└── types/
    └── index.ts                  # 扩展类型定义
```

---

## 3. 开发步骤

### 步骤 1: 扩展类型定义
**文件**: `src/types/index.ts`

添加：
```typescript
export interface SwissAdvancementResult {
  winners2_0: string[];      // 2-0战绩晋级胜者组
  winners2_1: string[];      // 2-1战绩晋级胜者组
  losersBracket: string[];   // 晋级败者组
  eliminated3rd: string[];   // 积分第三淘汰
  eliminated0_3: string[];   // 0-3战绩淘汰
}

export interface AdvancementState {
  advancement: SwissAdvancementResult;
  lastUpdated: string;
  updatedBy: string;
}
```

### 步骤 2: 创建状态管理
**文件**: `src/store/advancementStore.ts`

使用 Zustand 管理：
- 当前生效的晋级名单
- 最后更新时间和操作人
- 持久化到 localStorage

初始化数据使用现有的 `swissAdvancement`。

### 步骤 3: 开发管理员界面
**文件**: `src/pages/admin/AdvancementManager.tsx`

界面功能：

#### 3.1 队伍列表区域
- 显示所有8支队伍
- 每支队伍显示名称、logo
- 支持拖拽

#### 3.2 分类区域（5个分类）
1. **2-0 晋级（胜者组）** - 绿色标识
2. **2-1 晋级（胜者组）** - 绿色标识
3. **晋级败者组** - 橙色标识
4. **积分第三淘汰** - 红色标识
5. **0-3 淘汰** - 红色标识

每个分类区域：
- 显示标题和说明
- 可放置队伍
- 显示当前队伍数量

#### 3.3 操作按钮
- **保存** - 保存当前配置
- **重置** - 恢复到上次保存的状态
- **恢复默认** - 恢复到初始数据

#### 3.4 状态显示
- 最后更新时间
- 操作人
- 未保存变更提示

### 步骤 4: 更新 SwissStage 组件
**文件**: `src/components/features/SwissStage.tsx`

修改：
- 从 advancementStore 读取数据
- 移除对静态 `swissAdvancement` 的依赖
- 添加"管理名单"按钮链接

### 步骤 5: 添加路由
**文件**: 路由配置文件

添加：
- `/admin/advancement` - 晋级名单管理页面
- 在管理后台导航中添加入口

### 步骤 6: 编写测试
**文件**: `src/store/__tests__/advancementStore.test.ts`

测试：
- 状态更新
- 持久化
- 重置功能

---

## 4. 界面设计

```
┌─────────────────────────────────────────────────────────────┐
│  晋级名单管理                                    [保存] [重置] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  最后更新: 2025-11-16 20:30    操作人: admin    ⚠️ 有未保存变更 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌─────────────────────────────────┐│
│  │  待分配队伍       │    │         分类区域                 ││
│  ├──────────────────┤    ├─────────────────────────────────┤│
│  │ • 驴酱           │    │  ┌──────────┐  ┌──────────┐     ││
│  │ • IC             │    │  │ 2-0晋级   │  │ 2-1晋级   │     ││
│  │ • PLG            │    │  │ 🟢       │  │ 🟢       │     ││
│  │ • 小熊           │    │  │ • 驴酱   │  │ • 小熊   │     ││
│  │ • 搓搓鸟         │    │  │ • IC     │  │ • 雨酱   │     ││
│  │ • 100J           │    │  └──────────┘  └──────────┘     ││
│  │ • 69             │    │                                  ││
│  │ • 雨酱           │    │  ┌──────────┐  ┌──────────┐     ││
│  └──────────────────┘    │  │ 败者组    │  │ 积分第三  │     ││
│                          │  │ 🟠       │  │ 淘汰 🔴  │     ││
│  [拖拽队伍到右侧分类]      │  │ • PLG    │  │ • 搓搓鸟 │     ││
│                          │  │ • 69     │  └──────────┘     ││
│                          │  └──────────┘  ┌──────────┐     ││
│                          │                  │ 0-3淘汰   │     ││
│                          │                  │ 🔴       │     ││
│                          │                  │ • 100J   │     ││
│                          │                  └──────────┘     ││
│                          └─────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 说明:                                                    ││
│  │ • 2-0和2-1战绩的队伍晋级胜者组                            ││
│  │ • 1-2战绩中积分前2名晋级败者组，第3名淘汰                  ││
│  │ • 0-3战绩的队伍直接淘汰                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 数据结构

### Store 结构
```typescript
interface AdvancementStore {
  // 当前生效的名单
  advancement: SwissAdvancementResult;
  
  // 元数据
  lastUpdated: string;
  updatedBy: string;
  
  // 操作方法
  setAdvancement: (data: SwissAdvancementResult, user: string) => void;
  moveTeam: (teamId: string, from: Category, to: Category) => void;
  reset: () => void;
  restoreDefault: () => void;
}

// 分类类型
type Category = 
  | 'winners2_0' 
  | 'winners2_1' 
  | 'losersBracket' 
  | 'eliminated3rd' 
  | 'eliminated0_3';
```

### 初始数据
使用现有的 `swissAdvancement` 作为默认值：
```typescript
const defaultAdvancement: SwissAdvancementResult = {
  winners2_0: ['team1', 'team2'],
  winners2_1: ['team4', 'team8'],
  losersBracket: ['team3', 'team7'],
  eliminated3rd: ['team5'],
  eliminated0_3: ['team6']
};
```

---

## 6. 交互流程

### 6.1 调整名单流程
1. 管理员进入晋级名单管理页面
2. 拖拽队伍从一个分类到另一个分类
3. 系统实时显示变更
4. 点击"保存"按钮
5. 数据保存到 store 和 localStorage
6. 前端展示自动更新

### 6.2 重置流程
1. 管理员进行了一些调整但未保存
2. 点击"重置"按钮
3. 确认对话框弹出
4. 确认后恢复到上次保存的状态

### 6.3 恢复默认流程
1. 点击"恢复默认"按钮
2. 确认对话框弹出（警告会覆盖当前配置）
3. 确认后恢复到初始数据

---

## 7. 核心代码实现

### 7.1 Store 实现
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdvancementStore {
  advancement: SwissAdvancementResult;
  lastUpdated: string;
  updatedBy: string;
  setAdvancement: (data: SwissAdvancementResult, user: string) => void;
  moveTeam: (teamId: string, from: Category, to: Category) => void;
  reset: () => void;
  restoreDefault: () => void;
}

const defaultAdvancement: SwissAdvancementResult = {
  winners2_0: ['team1', 'team2'],
  winners2_1: ['team4', 'team8'],
  losersBracket: ['team3', 'team7'],
  eliminated3rd: ['team5'],
  eliminated0_3: ['team6']
};

export const useAdvancementStore = create<AdvancementStore>()(
  persist(
    (set, get) => ({
      advancement: defaultAdvancement,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system',
      
      setAdvancement: (data, user) => set({
        advancement: data,
        lastUpdated: new Date().toISOString(),
        updatedBy: user
      }),
      
      moveTeam: (teamId, from, to) => {
        const { advancement } = get();
        const newAdvancement = { ...advancement };
        
        // 从原分类移除
        newAdvancement[from] = newAdvancement[from].filter(id => id !== teamId);
        
        // 添加到新分类
        newAdvancement[to] = [...newAdvancement[to], teamId];
        
        set({ advancement: newAdvancement });
      },
      
      reset: () => {
        // 从 localStorage 重新加载
        const persisted = localStorage.getItem('advancement-storage');
        if (persisted) {
          const data = JSON.parse(persisted);
          set({
            advancement: data.state.advancement,
            lastUpdated: data.state.lastUpdated,
            updatedBy: data.state.updatedBy
          });
        }
      },
      
      restoreDefault: () => set({
        advancement: defaultAdvancement,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      })
    }),
    {
      name: 'advancement-storage'
    }
  )
);
```

### 7.2 拖拽功能
使用 `@dnd-kit/core` 实现拖拽：

```typescript
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';

// DraggableTeam 组件
function DraggableTeam({ team }: { team: Team }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: team.id,
    data: { team }
  });
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Transform.toString(transform) }}
    >
      {team.name}
    </div>
  );
}

// DroppableCategory 组件
function DroppableCategory({ 
  category, 
  teams 
}: { 
  category: Category; 
  teams: Team[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: category
  });
  
  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'bg-blue-100' : ''}
    >
      {teams.map(team => <DraggableTeam key={team.id} team={team} />)}
    </div>
  );
}
```

---

## 8. 测试策略

### 8.1 单元测试
- Store 状态管理
- 拖拽逻辑
- 持久化功能

### 8.2 集成测试
- 组件渲染
- 用户交互
- 数据流

### 8.3 手动测试清单
- [ ] 可以拖拽队伍到不同分类
- [ ] 保存后数据持久化
- [ ] 重置功能正常
- [ ] 恢复默认功能正常
- [ ] 前端展示同步更新

---

## 9. 验收标准

- [ ] 管理员界面可以正常访问
- [ ] 可以拖拽调整队伍分类
- [ ] 保存后数据持久化
- [ ] 前端展示使用 store 数据
- [ ] 有未保存变更时给出提示
- [ ] 操作有确认对话框
- [ ] TypeScript 类型检查通过

---

## 10. 开发时间估算

| 任务 | 预估时间 |
|------|----------|
| 类型定义扩展 | 30分钟 |
| Store 实现 | 1小时 |
| 管理员界面开发 | 3小时 |
| SwissStage 更新 | 30分钟 |
| 路由配置 | 30分钟 |
| 测试 | 1小时 |
| **总计** | **约6.5小时** |
