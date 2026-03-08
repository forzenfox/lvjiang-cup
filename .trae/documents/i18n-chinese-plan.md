# 页面内容汉化计划

## 目标
将项目中所有的英文内容汉化为中文，包括页面文本、按钮、标签、提示信息等。

## 需要汉化的文件清单

### 1. 页面组件 (src/pages/)
- [ ] `Home.tsx` - 检查是否有英文文本
- [ ] `admin/Login.tsx` - 登录页面文本
- [ ] `admin/Dashboard.tsx` - 仪表盘文本
- [ ] `admin/Stream.tsx` - 直播管理文本
- [ ] `admin/Teams.tsx` - 战队管理文本
- [ ] `admin/Schedule.tsx` - 赛程管理文本

### 2. 功能组件 (src/components/features/)
- [ ] `HeroSection.tsx` - 英雄区域文本
- [ ] `ScheduleSection.tsx` - 赛程区域文本
- [ ] `TeamSection.tsx` - 战队区域文本

### 3. 布局组件 (src/components/layout/)
- [ ] `Layout.tsx` - 布局文本
- [ ] `AdminLayout.tsx` - 后台布局文本
- [ ] `ProtectedRoute.tsx` - 路由保护文本

### 4. UI 组件 (src/components/ui/)
- [ ] `button.tsx` - 按钮组件
- [ ] `card.tsx` - 卡片组件

### 5. Mock 数据 (src/mock/)
- [ ] `data.ts` - Mock 数据中的英文内容

### 6. 类型定义 (src/types/)
- [ ] `index.ts` - 类型注释（如有）

## 实施步骤

1. **读取所有文件** - 先读取所有需要汉化的文件内容
2. **识别英文内容** - 找出所有需要汉化的文本
3. **执行汉化** - 将英文替换为中文
4. **验证检查** - 确保没有遗漏

## 注意事项

- 保持代码功能不变，只修改显示文本
- 保留变量名、函数名、类名等代码标识符
- 确保中文显示正常，无乱码
