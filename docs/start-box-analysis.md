# `div.start-box` 封面元素实现分析

> 来源页面：`https://lpl.qq.com/es/worlds/2025/`
> 分析日期：2026-04-16

---

## 一、HTML 结构

```html
<div class="start-box">
    <!-- 上半部分：背景轮播图 -->
    <div class="start-t">
        <div class="start-swiper">
            <ul class="swiper-wrapper">
                <li class="swiper-slide">
                    <div class="start-t-img start-t-img1"></div>
                </li>
                <li class="swiper-slide">
                    <div class="start-t-img start-t-img2"></div>
                </li>
            </ul>
        </div>
    </div>
    <!-- 下半部分：文案 + Logo + 滚动提示 -->
    <div class="start-b">
        <div class="start-b-img"></div>
        <div class="start-logo"></div>
        <div class="start-tips page-scale">
            <i class="i-down"></i>
        </div>
    </div>
</div>
```

**结构说明**：

- `start-box` 是封面容器，分为 **上下两层**（`start-t` + `start-b`）
- `start-t`（上半部分 66.66%）：使用 **Swiper 3.4.2** 实现两张背景图的 **淡入淡出轮播**
- `start-b`（下半部分 33.34%）：包含主视觉文案图、赛事 Logo 和向下滚动提示箭头
- 所有图片均通过 **CSS `background-image`** 加载，非 `<img>` 标签

---

## 二、CSS 样式分析（PC 端）

| 元素 | 关键样式 | 说明 |
|---|---|---|
| `.start-box` | `width:100%; height:100%; background:#000; position:relative; z-index:10` | 全屏黑色容器，最高层级覆盖 |
| `.start-t` | `width:100%; height:66.66%; position:absolute; top:0; z-index:1` | 上半区绝对定位，占 2/3 高度 |
| `.start-t-img1` | `background: url(start-bg1.jpg) no-repeat 50% 50%/cover` | 背景图1，居中覆盖 |
| `.start-t-img2` | `background: url(start-bg2.jpg) no-repeat 50% 50%/cover` | 背景图2，居中覆盖 |
| `.start-b` | `width:100%; height:33.34%; position:absolute; bottom:0; z-index:2` | 下半区绝对定位，占 1/3 高度 |
| `.start-b-img` | `width:80%; height:70%; background: url(start-box-pic1.png) no-repeat 50% 50%/contain; top:10px; left:10%` | "争者留其名" 主文案图 |
| `.start-logo` | `width:100%; height:16.6%; background: url(start-box-pic2.png) no-repeat 50% 50%/contain; bottom:3.33%; pointer-events:none` | Worlds 2025 Logo，不可点击 |
| `.start-tips` | `width:32px; height:80px; position:absolute; left:50%; bottom:25%; margin-left:-16px; pointer-events:none` | 滚动提示容器，水平居中 |
| `.i-down` | `animation: translateY1 1.6s ease infinite` | 向下箭头，循环上下弹跳动画 |

### 完整 CSS 源码（PC 端）

```css
/* 封面 */
.start-box { width: 100%; height: 100%; background: #000; position: relative; z-index: 10; }
.start-box .start-t { width: 100%; height: 66.66%; position: absolute; left: 0; top: 0; z-index: 1; }
.start-box .start-t .start-swiper { width: 100%; height: 100%; }
.start-box .start-t .start-swiper li { width: 100%; height: 100%; }
.start-box .start-t .start-t-img { width: 100%; height: 100%; }
.start-box .start-t .start-t-img1 { background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg1.jpg) no-repeat 50% 50%/cover; }
.start-box .start-t .start-t-img2 { background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg2.jpg) no-repeat 50% 50%/cover; }
.start-box .start-b { width: 100%; height: 33.34%; position: absolute; left: 0; bottom: 0; z-index: 2;}
.start-box .start-b:after { content: ''; width: 100%; height: auto;}
.start-box .start-b .start-b-img { width: 80%; height: 70%; background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic1.png) no-repeat 50% 50%/contain; position: absolute; top: 10px; left: 10%; }
.start-box .start-b .start-logo { width: 100%; height: 16.6%; background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic2.png) no-repeat 50% 50%/contain; position: absolute; left: 0; bottom: 3.33%; pointer-events: none; }
.start-box .start-b .start-tips { width: 32px; height: 80px; position: absolute; left: 50%; bottom: 25%; margin-left: -16px; pointer-events: none; }
.start-box .start-b .i-down { width: 32px; height: 80px; display: block; background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/glide-tip.png) no-repeat 50% 0/100%; -webkit-animation: translateY1 1.6s ease infinite; animation: translateY1 1.6s ease infinite; }
/*.start-box.hide { opacity: 0; }*/
.start-box.hide .start-t { transform: translateY(-100%); transition: 1s; }
.start-box.hide .start-b { transform: translateY(100%); transition: 1s; }
.start-box.hide .start-logo { opacity: 0; }
.start-box.hide .start-tips { opacity: 0; }
```

---

## 三、动画实现

### 1. 滚动提示箭头弹跳动画（`translateY1`）

```css
@-webkit-keyframes translateY1 {
    0%   { -webkit-transform: translateY(0);    opacity: 1; }
    50%  { -webkit-transform: translateY(20px); opacity: 0.1; }
    100% { -webkit-transform: translateY(0);    opacity: 1; }
}

@keyframes translateY1 {
    0%   { transform: translateY(0);    opacity: 1; }
    50%  { transform: translateY(20px); opacity: 0.1; }
    100% { transform: translateY(0);    opacity: 1; }
}
```

- 周期 **1.6s**，缓动函数 `ease`，无限循环
- 箭头向下移动 20px 并渐隐，再回到原位并渐显

### 2. 封面退出动画（`.start-box.hide`）

```css
.start-box.hide .start-t     { transform: translateY(-100%); transition: 1s; }
.start-box.hide .start-b     { transform: translateY(100%);  transition: 1s; }
.start-box.hide .start-logo  { opacity: 0; }
.start-box.hide .start-tips  { opacity: 0; }
```

- 上半部分向上滑出、下半部分向下滑出，形成 **上下分裂揭幕** 效果
- Logo 和提示箭头渐隐消失
- 过渡时间 **1s**

---

## 四、JavaScript 交互逻辑

### 1. 背景轮播（Swiper）

```javascript
var startSw = new Swiper(".start-swiper", {
    effect: 'fade',                        // 淡入淡出效果
    simulateTouch: false,                  // 禁止触摸拖拽
    autoplay: 3000,                        // 每3秒自动切换
    autoplayDisableOnInteraction: false,
    observer: true,
    observeParents: true,
});
```

### 2. 封面退出交互 — PC 端（鼠标滚轮）

```javascript
window.addEventListener("wheel", function(event) {
    if (event.deltaY > 0 && firstFlag) {
        $('.start-box').addClass('hide');       // 触发分裂动画
        p0Sw2.startAutoplay();                 // 启动主页轮播
        setTimeout(() => {
            $('.start-box').css({               // 900ms后彻底隐藏
                'display': 'none',
                'pointer-events': 'none',
            });
            $('.tab-box').addClass('show');     // 显示内容区
            firstFlag = false;                  // 只触发一次
        }, 900);
    }
});
```

### 3. 封面退出交互 — 移动端（触摸滑动）

```javascript
$("body").on("touchmove", function(e) {
    // 判断垂直向下滑动
    if (Math.abs(Y) > Math.abs(X) && Y < 0) {
        $('.start-box').addClass('hide');
        setTimeout(() => {
            $('.start-box').css({ 'display': 'none', 'pointer-events': 'none' });
            $('.tab-box').addClass('show');
        }, 800);  // 移动端过渡稍快 800ms
    }
});
```

### 4. 页面缩放适配（PC 端）

```javascript
var vw = html.clientWidth / 2560;    // 设计稿宽度 2560px
var vh = html.clientHeight / 1440;   // 设计稿高度 1440px
var scale = Math.min(vw, vh) * 1.18;
$(".part-main, .page-scale").css({ transform: "scale(" + scale + ")" });
```

- 基于 **2560×1440** 设计稿进行等比缩放
- 取宽高比的较小值 × 1.18 倍系数，确保内容在各种分辨率下完整显示
- 监听 `resize`、`DOMContentLoaded`、`load` 事件动态更新

---

## 五、移动端适配差异

| 属性 | PC 端 | 移动端 |
|---|---|---|
| `start-t` 高度 | 66.66% | 66.3% |
| `start-b` 高度 | 33.34% | 33.7% |
| 背景图1 `background-position` | `50% 50%` | `60% 50%`（偏右展示主体） |
| 背景图2 `background-position` | `50% 50%` | `30% 50%`（偏左展示主体） |
| `start-b-img` 宽度 | 80% | 90%（更大展示区域） |
| `start-b-img` 图片 | `start-box-pic1.png` | `m/start-box-pic1.png`（移动端专用图） |
| `start-logo` 图片 | `start-box-pic2.png` | `m/start-box-pic2.png`（移动端专用图） |
| 退出过渡时间 | 900ms | 800ms |

### 完整 CSS 源码（移动端）

```css
/* 封面 */
.start-box { width: 100%; height: 100%; background: #000; position: relative; z-index: 10; }
.start-box .start-t { width: 100%; height: 66.3%; position: absolute; left: 0; top: 0; z-index: 1; }
.start-box .start-t .start-swiper { width: 100%; height: 100%; }
.start-box .start-t .start-swiper li { width: 100%; height: 100%; }
.start-box .start-t .start-t-img { width: 100%; height: 100%; }
.start-box .start-t .start-t-img1 { background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg1.jpg) no-repeat 60% 50%/cover; }
.start-box .start-t .start-t-img2 { background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg2.jpg) no-repeat 30% 50%/cover; }
.start-box .start-b { width: 100%; height: 33.7%; position: absolute; left: 0; bottom: 0; z-index: 2; }
.start-box .start-b:after { content: ''; width: 100%; height: auto; }
.start-box .start-b .start-b-img { width: 90%; height: 72%; background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic1.png) no-repeat 50% 0/contain; position: absolute; top: 4%; left: 5%; }
.start-box .start-b .start-logo { width: 90%; height: 13.6%; background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic2.png) no-repeat 50% 50%/contain; position: absolute; left: 5%; bottom: 3.33%; pointer-events: none; }
.start-box .start-b .start-tips { width: 32px; height: 80px; position: absolute; left: 50%; bottom: 24%; margin-left: -16px; pointer-events: none; }
.start-box .start-b .i-down { width: 32px; height: 80px; display: block; background: url(//game.gtimg.cn/images/lpl/act/a20250822s15/glide-tip.png) no-repeat 50% 0/100%; -webkit-animation: translateY1 1.6s ease infinite; animation: translateY1 1.6s ease infinite; }
.start-box.hide .start-t { transform: translateY(-100%); transition: 1s; }
.start-box.hide .start-b { transform: translateY(100%); transition: 1s; }
.start-box.hide .start-logo { opacity: 0; }
.start-box.hide .start-tips { opacity: 0; }
```

---

## 六、图片资源清单

| 资源 | URL | 用途 |
|---|---|---|
| `start-bg1.jpg` | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg1.jpg` | 封面上半部分背景图1 |
| `start-bg2.jpg` | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg2.jpg` | 封面上半部分背景图2 |
| `start-box-pic1.png` | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic1.png` | "争者留其名" 主文案图（PC） |
| `start-box-pic2.png` | `//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic2.png` | Worlds 2025 Logo（PC） |
| `glide-tip.png` | `//game.gtimg.cn/images/lpl/act/a20250822s15/glide-tip.png` | 向下滚动提示箭头 |
| `m/start-box-pic1.png` | `//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic1.png` | 主文案图（移动端） |
| `m/start-box-pic2.png` | `//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic2.png` | Logo（移动端） |

---

## 七、技术总结

| 维度 | 实现方案 |
|---|---|
| **布局方式** | 绝对定位分层（上 2/3 + 下 1/3），非 Flexbox/Grid |
| **图片加载** | 纯 CSS `background-image`，无 `<img>` 标签 |
| **轮播方案** | Swiper 3.4.2，fade 淡入淡出效果 |
| **动画方案** | CSS `@keyframes` + `transition`，无 JS 动画库 |
| **交互触发** | PC: `wheel` 事件 / 移动端: `touchmove` 事件 |
| **退出效果** | 上下分裂滑出 + 内容区渐显（黑幕淡出） |
| **缩放适配** | JS 动态计算 `transform: scale()`，基于 2560×1440 设计稿 |
| **响应式** | 媒体查询断点 1024px，PC/移动端使用不同 CSS + 不同图片资源 |
| **一次性交互** | `firstFlag` 变量确保封面退出动画只触发一次 |
| **字体资源** | 自定义字体 DIN / DINBold（OTF 格式） |
