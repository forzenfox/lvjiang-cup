# 直播信息优化计划

## 任务概述
1. 将首页 HeroSection 中的"正在直播：{platform}"修改为显示直播标题
2. 评估并删除 Admin Stream 页面中的直播平台选项

## 需求分析

### 需求1：首页显示直播标题
**现状：**
- HeroSection.tsx 第 53 行显示：`🔴 正在直播：{streamInfo.platform}`
- 显示的是直播平台（如"斗鱼直播"）

**目标：**
- 修改为显示直播标题（`streamInfo.title`）
- 格式：`🔴 正在直播：{streamInfo.title}`

### 需求2：删除直播平台选项
**现状：**
- Admin Stream 页面有"直播平台"下拉选择框（第 64-74 行）
- 选项包括：斗鱼直播、虎牙直播、哔哩哔哩
- platform 字段在 StreamInfo 类型中定义

**评估：**
- 直播平台信息在实际使用中价值有限
- 直播链接已经包含了平台信息
- 可以简化配置流程，只保留标题、链接和直播状态

**目标：**
- 删除 Admin Stream 页面的平台选择下拉框
- 删除 StreamInfo 类型中的 platform 字段
- 更新 mock 数据，移除 platform 字段

## 实现步骤

### Phase 1: 修改 HeroSection 显示直播标题

#### 1.1 修改 HeroSection.tsx
文件路径：`src/components/features/HeroSection.tsx`

修改第 52-54 行：
```typescript
// 修改前
<p className="text-yellow-400 font-semibold animate-pulse">
  🔴 正在直播：{streamInfo.platform}
</p>

// 修改后
<p className="text-yellow-400 font-semibold animate-pulse">
  🔴 正在直播：{streamInfo.title}
</p>
```

### Phase 2: 删除直播平台选项

#### 2.1 修改 StreamInfo 类型
文件路径：`src/types/index.ts`

删除第 49 行：`platform: string;`

#### 2.2 修改 Admin Stream 页面
文件路径：`src/pages/admin/Stream.tsx`

删除第 64-74 行的平台选择下拉框：
```typescript
// 删除以下代码块
<div>
  <label className="block text-sm font-medium text-gray-300 mb-1">直播平台</label>
  <select
    value={streamInfo.platform}
    onChange={(e) => setStreamInfo({ ...streamInfo, platform: e.target.value })}
    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
  >
    <option value="DouYu">斗鱼直播</option>
    <option value="Huya">虎牙直播</option>
    <option value="Bilibili">哔哩哔哩</option>
  </select>
</div>
```

同时修改初始状态（第 9-14 行），移除 platform 字段：
```typescript
const [streamInfo, setStreamInfo] = useState<StreamInfo>({
  title: '',
  url: '',
  isLive: false
});
```

#### 2.3 更新 mock 数据
文件路径：`src/mock/data.ts`

修改 initialStreamInfo（第 510-515 行）：
```typescript
// 修改前
export const initialStreamInfo: StreamInfo = {
  title: '驴酱杯 2025 - 总决赛',
  url: 'https://www.douyu.com/138243',
  platform: '斗鱼直播',
  isLive: true
};

// 修改后
export const initialStreamInfo: StreamInfo = {
  title: '驴酱杯 2025 - 总决赛',
  url: 'https://www.douyu.com/138243',
  isLive: true
};
```

#### 2.4 更新 mock service
文件路径：`src/mock/service.ts`

确保 streamInfo 的初始化和保存逻辑正确处理没有 platform 的情况。

### Phase 3: 代码审查

#### 3.1 运行类型检查
```bash
npm run check
```

#### 3.2 运行 ESLint
```bash
npm run lint
```

#### 3.3 运行测试
```bash
npm run test:run
```

## 文件变更清单

### 修改文件
1. `src/components/features/HeroSection.tsx` - 显示直播标题
2. `src/types/index.ts` - 删除 platform 字段
3. `src/pages/admin/Stream.tsx` - 删除平台选择下拉框
4. `src/mock/data.ts` - 更新 initialStreamInfo

## 验收标准

- [ ] 首页显示"🔴 正在直播：{直播标题}"
- [ ] Admin Stream 页面没有平台选择下拉框
- [ ] StreamInfo 类型没有 platform 字段
- [ ] mock 数据正确
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 所有测试通过
