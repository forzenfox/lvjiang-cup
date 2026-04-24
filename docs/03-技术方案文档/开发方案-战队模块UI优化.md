# 战队模块UI优化 - 开发方案文档

## 1. 文档信息
- **项目名称**：战队模块UI优化
- **开发方案版本**：V1.0
- **创建日期**：2026-04-20
- **关联PRD**：[PRD-战队模块UI优化.md](./PRD-战队模块UI优化.md)
- **开发负责人**：待填写
- **评审状态**：待评审

---

## 2. 修改范围与目标

### 2.1 修改范围
本次优化针对 **前端用户侧战队展示模块**，具体修改文件：
- **主入口**：`frontend/src/components/features/TeamSection.tsx`
- **新增组件**：
  - `frontend/src/components/team/TeamMemberModal.tsx` - 战队成员列表弹框
  - `frontend/src/components/team/PlayerDetailDrawer.tsx` - 队员详情抽屉
- **复用组件**：
  - `frontend/src/components/ui/Modal.tsx` - 通用弹框（复用封装逻辑）
  - `frontend/src/components/team/PlayerDetailModal.tsx` - 队员详情内容（复用展示逻辑）

### 2.2 不涉及修改的部分
- 后台管理页面 `AdminTeams.tsx`
- API接口和数据服务层 `teamService.ts`、`teamApi.ts`、`membersApi.ts`
- 类型定义 `api/types.ts`

---

## 3. 技术栈对齐

### 3.1 实际使用技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | 视图层框架 |
| TypeScript | ~5.8.3 | 类型系统 |
| Tailwind CSS | 3.4.17 | 样式系统 |
| lucide-react | 0.511.0 | 图标库 |
| framer-motion | 12.34.5 | 动画库 |
| sonner | 2.0.7 | Toast通知 |
| zustand | 5.0.3 | 状态管理 |

### 3.2 样式规范
- 使用 **Tailwind CSS** 编写所有样式，不使用Ant Design
- 动画使用 **framer-motion** 或 **Tailwind animate 类**
- 全局z-index层级遵循 `constants/zIndex.ts` 规范

---

## 4. 组件架构设计

### 4.1 组件层级图
```
TeamSection (改造)
├── TeamGrid (新增组件)
│   └── TeamCard (精简改造：仅logo + 队名)
├── TeamMemberModal (新增组件)
│   ├── Modal Header (战队logo + 队名)
│   ├── MemberList (队员列表)
│   │   └── MemberRow (队员行，可点击)
│   └── PlayerDetailDrawer (新增组件 - 嵌套在弹框内)
│       └── PlayerDetailContent (复用PlayerDetailModal内容逻辑)
```

### 4.2 组件职责拆分

| 组件 | 职责 | 状态管理 |
|------|------|----------|
| TeamSection | 数据获取、状态管理、组件编排 | 主组件 |
| TeamGrid | 网格布局渲染 | 无状态 |
| TeamCard | 单张战队卡片渲染 | 无状态 |
| TeamMemberModal | 战队成员列表弹框 | 自身状态 |
| MemberRow | 单行队员信息渲染 | 无状态 |
| PlayerDetailDrawer | 队员详情抽屉 | 自身状态 |

---

## 5. 交互流程设计

### 5.1 交互状态图
```
[初始状态] TeamSection 展示战队网格
     │
     ▼ (点击战队卡片)
[弹框显示] TeamMemberModal 显示战队成员列表
     │
     ├─ 点击遮罩层/关闭按钮 ──▶ [弹框关闭] 回到初始状态
     │
     ▼ (点击队员行)
[抽屉打开] PlayerDetailDrawer 从右侧滑出显示队员详情
     │
     ├─ 点击其他队员行 ──▶ [内容切换] 抽屉内容直接切换，不关闭抽屉
     │
     ├─ 点击抽屉关闭按钮 ──▶ [抽屉关闭] 弹框保持显示
     │
     └─ 点击弹框其他区域 ──▶ [抽屉关闭] 弹框保持显示
```

### 5.2 移动端交互差异
```
[初始状态] TeamSection 展示战队网格（2列）
     │
     ▼ (点击战队卡片)
[弹框显示] TeamMemberModal 显示（90%屏幕宽度）
     │
     ▼ (点击队员行)
[底部抽屉] PlayerDetailDrawer 从底部滑出（100%宽度，70%高度）
     │
     ├─ 下滑手势 ──▶ [抽屉关闭]
     │
     └─ 点击遮罩层 ──▶ [抽屉关闭]
```

### 5.3 关键交互说明

| 交互场景 | 行为 | 动画效果 |
|---------|------|---------|
| 点击战队卡片 | 弹框从中心渐显 | fade-in + scale (0.95→1) 0.2s |
| 关闭弹框 | 弹框渐隐 | fade-out 0.15s |
| 打开抽屉(PC/平板) | 抽屉从右侧滑入 | slide-in-right 0.3s |
| 关闭抽屉(PC/平板) | 抽屉向右侧滑出 | slide-out-right 0.25s |
| 打开抽屉(手机) | 抽屉从底部滑入 | slide-in-bottom 0.3s |
| 切换队员 | 内容直接切换，无抽屉动画 | content fade 0.15s |
| 下拉刷新 | 数据重新加载 | skeleton loading |

---

## 6. 响应式方案设计

### 6.1 Tailwind标准断点
| 断点 | 尺寸 | 列数 | 卡片尺寸 | 弹框宽度 | 抽屉宽度 |
|------|------|------|---------|---------|---------|
| 默认(手机) | <640px | 2列 | 150x150px | 90vw | 100%(底部) |
| sm | ≥640px | 2列 | 160x160px | 90vw | 100%(底部) |
| md | ≥768px | 3列 | 170x170px | 600px | 320px(右侧) |
| lg | ≥1024px | 4列 | 180x180px | 700px | 350px(右侧) |
| xl | ≥1280px | 5列 | 200x200px | 800px | 400px(右侧) |

### 6.2 响应式实现策略
```typescript
// Tailwind类名示例
// 网格列数
grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5

// 卡片尺寸
w-[150px] sm:w-[160px] md:w-[170px] lg:w-[180px] xl:w-[200px]
h-[150px] sm:h-[160px] md:h-[170px] lg:h-[180px] xl:h-[200px]

// 弹框宽度
w-[90vw] md:w-[600px] lg:w-[700px] xl:w-[800px]

// 抽屉宽度（PC/平板）
w-[320px] md:w-[350px] lg:w-[400px]

// 抽屉高度（手机端）
h-[70vh] md:h-full
```

---

## 7. 新增组件详细设计

### 7.1 TeamMemberModal 组件

**文件路径**：`frontend/src/components/team/TeamMemberModal.tsx`

**Props定义**：
```typescript
interface TeamMemberModalProps {
  team: Team;                    // 战队数据
  isOpen: boolean;               // 弹框显示状态
  onClose: () => void;           // 关闭弹框回调
  onPlayerClick: (player: Player) => void;  // 点击队员回调
}
```

**组件结构**：
```typescript
<TeamMemberModal>
  {/* 遮罩层 */}
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
  
  {/* 弹框主体 */}
  <div className="relative w-full max-w-xl ...">
    {/* 头部：战队logo + 队名 */}
    <div className="flex items-center gap-4 px-6 py-4 border-b">
      <img src={team.logo} className="w-12 h-12" />
      <h2 className="text-xl font-bold">{team.name}</h2>
      <button onClick={onClose}><X /></button>
    </div>
    
    {/* 队员列表 */}
    <div className="overflow-y-auto">
      {team.members?.map(player => (
        <div 
          key={player.id}
          onClick={() => onPlayerClick(player)}
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
        >
          <span>{player.nickname}</span>
          <PositionIcon position={player.position} />
        </div>
      ))}
    </div>
  </div>
  
  {/* 抽屉组件（嵌套渲染） */}
  {selectedPlayer && (
    <PlayerDetailDrawer 
      player={selectedPlayer} 
      onClose={() => setSelectedPlayer(null)} 
    />
  )}
</TeamMemberModal>
```

### 7.2 PlayerDetailDrawer 组件

**文件路径**：`frontend/src/components/team/PlayerDetailDrawer.tsx`

**Props定义**：
```typescript
interface PlayerDetailDrawerProps {
  player: Player;                // 队员数据
  onClose: () => void;           // 关闭抽屉回调
  isMobile?: boolean;            // 是否为移动端
}
```

**组件结构**：
```typescript
<PlayerDetailDrawer>
  {/* 抽屉内容复用PlayerDetailModal的内部渲染逻辑 */}
  <div className={`... ${isMobile ? 'bottom-0' : 'right-0 top-0'}`}>
    {/* 关闭按钮 */}
    <button onClick={onClose}><X /></button>
    
    {/* 队员详情内容（复用PlayerDetailModal内容区） */}
    <div className="p-6">
      {/* 头像 */}
      <div className="w-28 h-28 rounded-full ...">
        <img src={player.avatarUrl} />
      </div>
      
      {/* 昵称 + 位置 */}
      <h3>{player.nickname}</h3>
      <p>{POSITION_LABELS[player.position]}</p>
      
      {/* 个人简介 */}
      <div>个人简介: {player.bio}</div>
      
      {/* 常用英雄 */}
      <div>常用英雄: {player.championPool?.map(...)}</div>
      
      {/* 评分 */}
      <div>评分: {player.rating}</div>
      
      {/* 实力等级 */}
      {player.level && <div>等级: {player.level}</div>}
      
      {/* 直播间 */}
      {player.liveUrl && <a href={player.liveUrl}>观看直播</a>}
    </div>
  </div>
</PlayerDetailDrawer>
```

### 7.3 代码复用策略

| 复用内容 | 来源组件 | 复用方式 |
|---------|---------|---------|
| 弹框Portal逻辑 | Modal.tsx | 参考其createPortal实现 |
| 队员详情展示 | PlayerDetailModal.tsx | 提取内容区为独立函数组件 |
| 位置图标 | PositionIcon.tsx | 直接import使用 |
| 等级徽章 | utils/levelColors.ts | 直接import使用 |
| 英雄图标 | utils/championUtils.ts | 直接import使用 |
| z-index层级 | constants/zIndex.ts | 使用NESTED_MODAL: 120 |

---

## 8. 改造TeamSection组件

### 8.1 改造前结构
```typescript
// 当前TeamSection渲染每张卡片包含：
// - logo区域
// - 队名
// - 参赛宣言
// - 队员列表（可直接点击查看队员详情）
```

### 8.2 改造后结构
```typescript
// 改造后TeamSection渲染每张卡片仅包含：
// - logo区域
// - 队名
// - 点击卡片 → 弹出TeamMemberModal
```

### 8.3 具体改造点

```typescript
// 改造前
<Card onClick={() => handlePlayerClick(player)}>  // 点击队员行
  <div className="h-32">...</div>                 // logo区域
  <CardHeader>
    <CardTitle>{team.name}</CardTitle>            // 队名
    <CardDescription>{team.battleCry}</CardDescription> // 宣言
  </CardHeader>
  <CardContent>
    {team.players.map(player => (                // 队员列表
      <div onClick={() => handlePlayerClick(player)}>
        <img src={player.avatarUrl} />            // 队员头像
        <span>{player.nickname}</span>            // 队员昵称
        <PositionIcon position={player.position} />
      </div>
    ))}
  </CardContent>
</Card>

// 改造后
<Card onClick={() => handleTeamClick(team)}>      // 点击整张卡片
  <div className="h-32">...</div>                 // logo区域
  <CardHeader>
    <CardTitle>{team.name}</CardTitle>            // 队名（保留）
    {/* 移除CardDescription和CardContent */}
  </CardHeader>
</Card>

// 新增弹框状态管理
const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
```

---

## 9. 状态管理设计

### 9.1 TeamSection状态
```typescript
interface TeamSectionState {
  teams: Team[];                 // 战队列表
  loading: boolean;              // 加载状态
  error: string | null;          // 错误信息
  selectedTeam: Team | null;     // 当前选中的战队（弹框显示）
  isTeamModalOpen: boolean;      // 弹框显示状态
  selectedPlayer: Player | null; // 当前选中的队员（抽屉显示）
}
```

### 9.2 状态流转
```typescript
// 点击战队卡片
handleTeamClick = (team: Team) => {
  setSelectedTeam(team);
  setIsTeamModalOpen(true);
}

// 点击队员行
handlePlayerClick = (player: Player) => {
  setSelectedPlayer(player);
}

// 关闭弹框
handleCloseModal = () => {
  setIsTeamModalOpen(false);
  setSelectedTeam(null);
  setSelectedPlayer(null);  // 同时清空队员选择
}

// 关闭抽屉
handleCloseDrawer = () => {
  setSelectedPlayer(null);
}
```

---

## 10. 边界情况处理

### 10.1 空数据处理
| 场景 | 处理方式 |
|------|---------|
| 战队列表为空 | 显示EmptyState组件（已有） |
| 战队无logo | 显示默认图标（`/assets/default-team-logo.png`） |
| 战队无队员 | 弹框显示"暂无队员"提示 |
| 队员无头像 | 显示昵称首字母占位符 |
| 队员无简介 | 显示"暂无简介" |
| 队员无常用英雄 | 显示"暂无常用英雄" |

### 10.2 加载状态
```typescript
// 弹框打开时显示loading骨架屏
{isLoading && (
  <div className="space-y-3">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
    ))}
  </div>
)}
```

### 10.3 错误处理
```typescript
// 数据加载失败
try {
  const teams = await teamService.getAll();
  setTeams(teams);
} catch (error) {
  setError(error.message);
  // 显示错误提示Toast
  toast.error('加载战队数据失败，请重试');
}
```

### 10.4 移动端手势
```typescript
// 底部抽屉支持下滑关闭
const handleTouchMove = (e: TouchEvent) => {
  if (isMobile && e.deltaY > 50) {  // 下滑超过50px
    onClose();
  }
}
```

---

## 11. 动画实现方案

### 11.1 弹框动画
```css
/* 弹框打开动画 */
@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter {
  animation: modal-in 0.2s ease-out;
}
```

### 11.2 抽屉动画
```css
/* PC/平板 - 右侧滑入 */
@keyframes drawer-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* 手机 - 底部滑入 */
@keyframes drawer-in-bottom {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drawer-enter-right {
  animation: drawer-in-right 0.3s ease-out;
}

.drawer-enter-bottom {
  animation: drawer-in-bottom 0.3s ease-out;
}
```

### 11.3 使用framer-motion（推荐）
```typescript
import { motion, AnimatePresence } from 'framer-motion';

// 弹框动画
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* 弹框内容 */}
</motion.div>

// 抽屉动画
<motion.div
  initial={{ x: '100%' }}  // PC/平板
  // initial={{ y: '100%' }}  // 手机
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
>
  {/* 抽屉内容 */}
</motion.div>
```

---

## 12. 开发步骤

### Phase 1: 组件提取与准备（预计2小时）
- [ ] 从`PlayerDetailModal.tsx`提取详情内容区为独立函数组件`PlayerDetailContent`
- [ ] 确认`Modal.tsx`的Portal实现可直接复用
- [ ] 确认所有需要的工具函数已存在

### Phase 2: 新增组件开发（预计4小时）
- [ ] 创建`TeamMemberModal.tsx`组件
- [ ] 创建`PlayerDetailDrawer.tsx`组件
- [ ] 实现弹框动画效果
- [ ] 实现抽屉动画效果（PC/平板/手机三种模式）

### Phase 3: TeamSection改造（预计2小时）
- [ ] 精简`TeamCard`渲染（移除队员列表）
- [ ] 添加战队点击事件处理
- [ ] 集成`TeamMemberModal`组件
- [ ] 添加状态管理逻辑

### Phase 4: 响应式适配（预计2小时）
- [ ] 实现5个断点的网格布局
- [ ] 实现弹框响应式尺寸
- [ ] 实现抽屉响应式行为（右侧/底部）
- [ ] 添加移动端手势支持

### Phase 5: 边界情况处理（预计1小时）
- [ ] 添加loading骨架屏
- [ ] 添加错误状态处理
- [ ] 添加空数据提示
- [ ] 添加图片加载失败处理

### Phase 6: 测试与优化（预计1小时）
- [ ] 编写组件单元测试
- [ ] 编写E2E测试用例
- [ ] 性能优化（懒加载、缓存）
- [ ] 跨浏览器兼容性测试

---

## 13. 测试方案

### 13.1 单元测试
| 测试用例 | 测试组件 | 断言内容 |
|---------|---------|---------|
| TeamMemberModal渲染 | TeamMemberModal | 正确显示战队logo和队名 |
| 队员列表渲染 | TeamMemberModal | 正确显示所有队员 |
| 队员行点击 | TeamMemberModal | 触发onPlayerClick回调 |
| 关闭按钮点击 | TeamMemberModal | 触发onClose回调 |
| PlayerDetailDrawer渲染 | PlayerDetailDrawer | 正确显示队员信息 |
| 抽屉关闭 | PlayerDetailDrawer | 触发onClose回调 |

### 13.2 E2E测试
| 测试场景 | 测试步骤 | 预期结果 |
|---------|---------|---------|
| 点击战队卡片 | 点击任意战队卡片 | 弹框显示，包含战队信息和队员列表 |
| 关闭弹框 | 点击遮罩层 | 弹框关闭，回到战队网格 |
| 查看队员详情 | 点击队员行 | 抽屉从右侧滑出显示队员详情 |
| 切换队员 | 点击其他队员行 | 抽屉内容切换为新队员 |
| 关闭抽屉 | 点击抽屉关闭按钮 | 抽屉关闭，弹框保持显示 |
| 响应式布局 | 切换浏览器窗口大小 | 网格列数和组件尺寸正确变化 |

### 13.3 响应式测试清单
| 设备 | 分辨率 | 测试重点 |
|------|--------|---------|
| iPhone SE | 375x667 | 2列网格，底部抽屉 |
| iPhone 14 | 390x844 | 2列网格，底部抽屉 |
| iPad | 768x1024 | 3列网格，右侧抽屉320px |
| iPad Pro | 1024x1366 | 4列网格，右侧抽屉350px |
| Desktop | 1920x1080 | 5列网格，右侧抽屉400px |

---

## 14. 风险评估

### 14.1 技术风险
| 风险项 | 影响 | 概率 | 应对措施 |
|--------|------|------|---------|
| 弹窗+抽屉层级冲突 | 高 | 中 | 使用z-index规范，抽屉使用NESTED_MODAL: 120 |
| 移动端手势冲突 | 中 | 低 | 使用framer-motion手势库处理 |
| 动画性能问题 | 中 | 低 | 使用CSS transform而非top/left |
| 图片加载失败 | 低 | 中 | 添加onError fallback处理 |

### 14.2 兼容性风险
| 风险项 | 影响 | 应对措施 |
|--------|------|---------|
| Safari动画兼容 | 中 | 测试-webkit前缀 |
| 旧版浏览器不支持 | 低 | 使用autoprefixer |
| 移动端浏览器差异 | 中 | 覆盖主流浏览器测试 |

---

## 15. 性能优化建议

### 15.1 渲染优化
```typescript
// 使用React.memo避免不必要的重渲染
const TeamCard = React.memo(({ team, onClick }) => {
  return (
    <Card onClick={() => onClick(team)}>
      {/* 组件内容 */}
    </Card>
  );
});

// 使用useCallback稳定回调引用
const handleTeamClick = useCallback((team: Team) => {
  setSelectedTeam(team);
  setIsTeamModalOpen(true);
}, []);
```

### 15.2 图片优化
```typescript
// 使用loading="lazy"延迟加载
<img 
  src={team.logo} 
  loading="lazy"
  onError={(e) => {
    (e.target as HTMLImageElement).src = '/assets/default-team-logo.png';
  }}
/>
```

### 15.3 数据缓存
```typescript
// 使用zustand缓存战队数据
const useTeamStore = create((set) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
}));
```

---

## 16. 文件清单

### 16.1 新增文件
| 文件路径 | 说明 |
|---------|------|
| `frontend/src/components/team/TeamMemberModal.tsx` | 战队成员列表弹框组件 |
| `frontend/src/components/team/PlayerDetailDrawer.tsx` | 队员详情抽屉组件 |

### 16.2 修改文件
| 文件路径 | 修改内容 |
|---------|---------|
| `frontend/src/components/features/TeamSection.tsx` | 精简卡片渲染，添加弹框状态管理 |
| `frontend/src/components/team/PlayerDetailModal.tsx` | 提取详情内容区为可复用组件（可选） |

### 16.3 不需要修改的文件
| 文件路径 | 原因 |
|---------|------|
| `frontend/src/api/teams.ts` | 接口已满足需求 |
| `frontend/src/api/members.ts` | 接口已满足需求 |
| `frontend/src/services/teamService.ts` | 服务层已满足需求 |
| `frontend/src/api/types.ts` | 类型定义已满足需求 |
| `frontend/src/constants/zIndex.ts` | z-index层级已定义 |

---

## 17. 验收标准

### 17.1 功能验收
- [ ] 主页面正确展示战队logo和队名（移除队员列表）
- [ ] 点击战队卡片弹出成员列表弹框
- [ ] 弹框顶部显示战队logo和队名
- [ ] 弹框中部显示队员列表（选手ID + 位置图标）
- [ ] 点击队员行打开右侧抽屉显示详情
- [ ] 抽屉内容与现有PlayerDetailModal一致
- [ ] 关闭弹框同时关闭抽屉
- [ ] 切换队员时抽屉内容平滑切换

### 17.2 响应式验收
- [ ] PC端（≥1280px）：5列网格，右侧抽屉400px
- [ ] 大屏（1024-1279px）：4列网格，右侧抽屉350px
- [ ] 中屏（768-1023px）：3列网格，右侧抽屉320px
- [ ] 小屏（640-767px）：2列网格，右侧抽屉320px
- [ ] 手机端（<640px）：2列网格，底部抽屉70vh

### 17.3 交互验收
- [ ] 弹框打开动画流畅（fade-in + scale）
- [ ] 抽屉滑入动画流畅（slide-in）
- [ ] 点击遮罩层关闭弹框
- [ ] 点击关闭按钮关闭弹框/抽屉
- [ ] 按ESC键关闭弹框
- [ ] 移动端支持手势下滑关闭抽屉

### 17.4 性能验收
- [ ] 首屏加载时间 ≤ 2秒
- [ ] 弹框打开响应时间 ≤ 200ms
- [ ] 抽屉打开响应时间 ≤ 300ms
- [ ] 动画帧率 ≥ 50fps
- [ ] Lighthouse性能评分 ≥ 80

---

## 18. 附录

### 18.1 参考资源
- PRD文档：[PRD-战队模块UI优化.md](./PRD-战队模块UI优化.md)
- 官方世界赛参考：见PRD截图
- 现有战队模块：`frontend/src/components/features/TeamSection.tsx`
- 现有队员详情：`frontend/src/components/team/PlayerDetailModal.tsx`

### 18.2 技术文档
- Tailwind CSS断点：https://tailwindcss.com/docs/responsive-design
- framer-motion文档：https://www.framer.com/motion/
- React Portal：https://react.dev/reference/react-dom/createPortal

### 18.3 变更历史
| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|---------|--------|
| V1.0 | 2026-04-20 | 初始版本创建 | 待填写 |
