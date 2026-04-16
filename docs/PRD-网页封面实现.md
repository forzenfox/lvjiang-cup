# 驴酱杯LOL娱乐赛事网站 - 网页封面实现 PRD

&gt; 版本: v1.0
&gt; 更新日期: 2026-04-16
&gt; 状态: 待实现

---

## 1. 产品概述

本次需求为驴酱杯赛事网站添加仿照 LPL 官方网站的网页封面效果，提升网站的品牌感和视觉冲击力。封面将在用户首次访问时展示，通过滚动或触摸操作触发退出动画，展现网站主内容。

### 1.1 参考来源
- 官方网站：`https://lpl.qq.com/es/worlds/2025/`
- 分析文档：[start-box-analysis.md](file:///workspace/docs/start-box-analysis.md)

### 1.2 技术栈
- **动画方案**: Framer Motion（项目已安装，无需额外依赖）
- **样式方案**: Tailwind CSS + 自定义 CSS
- **响应式**: 媒体查询断点 1024px

---

## 2. 核心功能

### 2.1 用户角色

| 角色 | 访问方式 | 核心体验 |
|------|----------|----------|
| 游客 | 直接访问网站 | 看到封面动画，滚动后进入主内容 |
| 管理员 | 通过 `/admin` 路径访问后台 | 不展示封面，直接进入管理后台 |

### 2.2 功能模块

| 模块名称 | 功能描述 |
|---------|---------|
| 全屏封面容器 | 黑色全屏容器，最高层级覆盖 |
| 背景轮播 | 两张背景图淡入淡出轮播，3秒自动切换 |
| 主视觉区域 | 上2/3展示背景轮播，下1/3展示文案和Logo |
| 滚动提示 | 向下箭头弹跳动画，提示用户滚动 |
| 退出动画 | 上下分裂滑出效果，展现主内容 |
| 一次性触发 | 每个会话只触发一次封面动画 |

---

## 3. 核心流程

### 3.1 游客首次访问流程

```
graph TD
  A[用户访问首页] --&gt; B{是否首次访问该会话?}
  B --&gt;|是| C[展示封面动画]
  B --&gt;|否| D[直接展示主内容]
  C --&gt; E[背景轮播自动播放]
  E --&gt; F[用户向下滚动/触摸滑动]
  F --&gt; G[触发上下分裂退出动画]
  G --&gt; H[封面隐藏，展示主内容]
  H --&gt; I[导航栏显示]
```

### 3.2 管理员访问流程

```
graph TD
  A[用户访问 /admin/*] --&gt; B[不展示封面]
  B --&gt; C[直接展示管理后台内容]
```

---

## 4. 用户界面设计

### 4.1 设计风格

- **整体风格**: 仿照 LPL 官方 Worlds 2025 封面
- **背景**: 纯黑色全屏
- **动画**: 流畅过渡，无卡顿
- **响应式**: PC 端和移动端分别适配

### 4.2 布局结构

#### PC 端布局

| 区域 | 高度占比 | 内容 |
|------|---------|------|
| 上半部分 (start-t) | 66.66% | 背景轮播图 |
| 下半部分 (start-b) | 33.34% | 主文案图、赛事 Logo、滚动提示 |

#### 移动端布局

| 区域 | 高度占比 | 内容 |
|------|---------|------|
| 上半部分 (start-t) | 66.3% | 背景轮播图（偏右/偏左展示主体） |
| 下半部分 (start-b) | 33.7% | 主文案图（移动端专用）、赛事 Logo（移动端专用）、滚动提示 |

### 4.3 视觉元素说明

| 元素 | 描述 |
|------|------|
| 背景图 1 | 赛事主题背景图，居中覆盖 |
| 背景图 2 | 另一张赛事主题背景图，居中覆盖 |
| 主文案图 | "争者留其名" 或自定义赛事 slogan |
| Logo 图 | Worlds 2025 或驴酱杯 Logo |
| 滚动箭头 | 向下箭头，1.6s 周期弹跳动画 |

### 4.4 动画效果

#### 1. 滚动提示箭头动画 (translateY1)

```css
@keyframes translateY1 {
  0%   { transform: translateY(0);    opacity: 1; }
  50%  { transform: translateY(20px); opacity: 0.1; }
  100% { transform: translateY(0);    opacity: 1; }
}
```

- 周期：1.6s
- 缓动函数：ease
- 循环：无限

#### 2. 封面退出动画

- 上半部分：向上滑出 (translateY: -100%)
- 下半部分：向下滑出 (translateY: 100%)
- Logo 和箭头：渐隐消失
- 过渡时间：1s

---

## 5. 技术实现方案

### 5.1 组件结构

```
src/
├── components/
│   └── features/
│       └── StartBox.tsx          # 新增：网页封面组件
└── pages/
    └── Home.tsx                   # 修改：在最顶部添加 StartBox
```

### 5.2 核心组件：StartBox.tsx

**Props 接口**

```typescript
interface StartBoxProps {
  onExit?: () =&gt; void;
}
```

**State 管理**

```typescript
const [isVisible, setIsVisible] = useState(true);
const [isExiting, setIsExiting] = useState(false);
const [hasExited, setHasExited] = useState(false);
```

### 5.3 交互逻辑

#### PC 端 - 鼠标滚轮触发

```typescript
useEffect(() =&gt; {
  const handleWheel = (event: WheelEvent) =&gt; {
    if (event.deltaY &gt; 0 &amp;&amp; isVisible &amp;&amp; !isExiting) {
      triggerExit();
    }
  };
  window.addEventListener('wheel', handleWheel);
  return () =&gt; window.removeEventListener('wheel', handleWheel);
}, [isVisible, isExiting]);
```

#### 移动端 - 触摸滑动触发

```typescript
useEffect(() =&gt; {
  let startY = 0;
  const handleTouchStart = (e: TouchEvent) =&gt; {
    startY = e.touches[0].clientY;
  };
  const handleTouchMove = (e: TouchEvent) =&gt; {
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    if (diff &gt; 50 &amp;&amp; isVisible &amp;&amp; !isExiting) {
      triggerExit();
    }
  };
  window.addEventListener('touchstart', handleTouchStart);
  window.addEventListener('touchmove', handleTouchMove);
  return () =&gt; {
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
  };
}, [isVisible, isExiting]);
```

#### 一次性触发机制

```typescript
useEffect(() =&gt; {
  const hasSeenCover = sessionStorage.getItem('hasSeenCover');
  if (hasSeenCover) {
    setHasExited(true);
    setIsVisible(false);
  }
}, []);

const triggerExit = () =&gt; {
  setIsExiting(true);
  sessionStorage.setItem('hasSeenCover', 'true');
  setTimeout(() =&gt; {
    setIsVisible(false);
    setHasExited(true);
    onExit?.();
  }, 900);
};
```

### 5.4 图片资源清单

| 资源 | URL（临时） | 用途 |
|------|------------|------|
| start-bg1.jpg | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg1.jpg` | 封面上半部分背景图1 |
| start-bg2.jpg | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg2.jpg` | 封面上半部分背景图2 |
| start-box-pic1.png | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic1.png` | 主文案图（PC） |
| start-box-pic2.png | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic2.png` | Logo（PC） |
| glide-tip.png | `//game.gtimg.cn/images/lpl/act/a20250822s15/glide-tip.png` | 向下滚动提示箭头 |
| m/start-box-pic1.png | `//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic1.png` | 主文案图（移动端） |
| m/start-box-pic2.png | `//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic2.png` | Logo（移动端） |

&gt; **注意**: 以上为临时使用官方图片，后续需要替换为自有版权图片。

---

## 6. 与现有系统的集成

### 6.1 Home.tsx 修改

在 [Home.tsx](file:///workspace/frontend/src/pages/Home.tsx#L193) 的 `&lt;Layout&gt;` 内最上方添加 `StartBox` 组件：

```tsx
return (
  &lt;Layout&gt;
    {/* 新增：网页封面 */}
    &lt;StartBox onExit={() =&gt; {
      // 封面退出后的回调（如需要）
    }} /&gt;
    
    {/* 现有内容 */}
    {showError &amp;&amp; state.error &amp;&amp; (...)}
    &lt;GlobalLoadingIndicator visible={state.loading} /&gt;
    &lt;HeroSection /&gt;
    ...
  &lt;/Layout&gt;
);
```

### 6.2 Layout.tsx 调整

封面显示时隐藏导航栏，退出后显示：

```tsx
// 在 StartBox 组件中通过 Context 或 Props 控制导航栏显示
// 或者在 StartBox 中通过 CSS z-index 覆盖导航栏
```

---

## 7. 验收标准

### 7.1 功能验收

- [ ] 首次访问网站时显示封面
- [ ] 背景轮播正常播放，3秒自动切换，淡入淡出效果
- [ ] 滚动提示箭头有弹跳动画
- [ ] PC 端向下滚动触发退出动画
- [ ] 移动端向下滑动触发退出动画
- [ ] 退出动画为上下分裂效果
- [ ] 刷新页面后不再显示封面（sessionStorage 生效）
- [ ] 关闭浏览器标签页重新打开后再次显示封面
- [ ] 访问 /admin/* 路径不显示封面

### 7.2 视觉验收

- [ ] 封面为全屏黑色
- [ ] PC 端布局比例正确（上 66.66% + 下 33.34%）
- [ ] 移动端布局比例正确（上 66.3% + 下 33.7%）
- [ ] 所有图片居中显示，无拉伸变形
- [ ] 动画流畅，无卡顿
- [ ] 在不同分辨率下显示正常

### 7.3 性能验收

- [ ] 图片加载速度快，无长时间白屏
- [ ] 动画帧率稳定在 60fps
- [ ] 不影响页面其他功能的加载和性能

---

## 8. 开发计划

| 阶段 | 任务 | 预计耗时 |
|-----|------|---------|
| 1 | 组件结构搭建 + 基础布局 | 1小时 |
| 2 | 背景轮播 + 动画实现 | 1.5小时 |
| 3 | 交互逻辑（滚动触发） | 1小时 |
| 4 | 响应式适配 + 移动端测试 | 1.5小时 |
| 5 | 调试优化 + 验收测试 | 1小时 |
| **总计** | | **约 6 小时** |

---

## 9. 风险与注意事项

### 9.1 潜在风险

| 风险 | 影响 | 概率 | 缓解措施 |
|-----|------|------|---------|
| 图片版权问题 | 高 | 中 | 暂时使用官方图片，后续尽快替换为自有图片 |
| 导航栏兼容性问题 | 中 | 中 | 通过 z-index 或 state 控制导航栏显示 |
| 动画卡顿 | 中 | 低 | 使用 Framer Motion 的硬件加速特性 |
| 移动端适配问题 | 中 | 中 | 充分测试不同尺寸的移动设备 |

### 9.2 注意事项

1. **图片替换**: 正式上线前必须替换所有官方图片为自有版权图片
2. **SEO 影响**: 确保搜索引擎爬虫能正常抓取主内容
3. **可访问性**: 考虑为无障碍用户提供跳过封面的选项
4. **性能优化**: 图片使用 WebP 格式，适当压缩大小

---

## 10. 更新日志

### v1.0 (2026-04-16)
- 初始版本 PRD
- 定义核心功能和界面设计
- 制定技术实现方案和验收标准
