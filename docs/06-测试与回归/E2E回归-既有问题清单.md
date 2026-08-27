# 全栈 E2E 回归 — 既有问题清单

> 生成日期：2026-08-27
> 来源：`npm run test:e2e` 完整回归（296 例，`202 passed / 89 failed / 5 skipped`）
> 背景：bcrypt 原生二进制遗留问题修复后的完整回归。**bcrypt 重点回归 P1-05 / P1-06 / P2-01 已全部通过**；本清单为其余 89 例既有失败，与被修复问题、生产代码改动无关（本次未改动任何生产代码）。

## 结论摘要

- 89 例失败横跨 footer / P0 / P1 / P2 / P3 / P4 多个套件，属于该 E2E 套件**既有的测试与环境可靠性债**。
- 已抽查失败现场，归纳出 5 类主要根因：
  1. **登录态前置冲突**：部分用例期望未登录态（出现登录表单/401），实际在 `msedge` 项目已携带 `storageState` 登录态，导致 `input#username` 找不到或期望的未授权 API 返回 200。
  2. **StartBox 全屏封面拦截**：首页 `StartBox`（`fixed inset-0` + `zIndex COVER`）仅靠 wheel/点击/按键退出，Playwright 不穿透遮罩，首页点击/触摸类用例超时。
  3. **懒加载区块未滚动渲染**：首页分区按 IntersectionObserver 懒加载，`text=参赛战队` 等区块未滚动到视口不渲染。
  4. **数据/种子前置缺失**：依赖已存在的战队/选手/对战数据，数据清空后未自行建种。
  5. **外部资源/链接不可达**：外链跳转、外部 CDN 图片在当前运行环境不可达。

## 按套件明细（89 例）

### footer（4）
- `footer.spec.ts`：社交媒体链接正确跳转；微信公众号悬停显示二维码；页脚显示正确的备案号；页脚显示正确的邮箱

### P0
- `P0-01-home`（9）：TEST-001 访问赛事首页；TEST-008 刷新页面数据；TEST-003 浏览参赛战队；TEST-004 查看战队详情；TEST-005 查看瑞士轮赛程；TEST-006 查看淘汰赛赛程；TEST-007 追踪比赛状态；TEST-B004 空数据状态；TEST-008
- `P0-03-ui-components`（4）：TEST-ERROR-01 错误边界显示；TEST-ERROR-02 页面刷新恢复；TEST-PLAYER-01 选手详情弹窗；TEST-PLAYER-02 选手位置图标
- `P0-04-cover`（1）：移动端触摸滑动退出
- `P0-05-prize-pool`（1）：常规奖金金额展示正确

### P1
- `P1-01-login`（6）：TEST-101 登录管理后台成功；TEST-101-NEG-1..4（错误密码/错误用户名/空用户名/空密码）；TEST-113 退出登录；TEST-E002 未登录访问管理页面
- `P1-03-stream`（3）：TEST-103 配置直播信息；直播信息前台同步验证；直播按钮跳转验证
- `P1-04-teams`（2）：TEST-106 编辑战队信息；TEST-107 删除战队
- `P1-07a-match-data-display`（3）：TEST-MD-001 访问有数据的对战详情页面；TEST-MD-001.5 视频链接显示与跳转；TEST-MD-001.6 视频回顾按钮功能
- `P1-07b-match-data-game-switch`（2）：TEST-MD-004 BO3 对局切换器显示；TEST-MD-005 点击切换对局
- `P1-07c-match-data-radar`（1）：TEST-MD-008 点击选手行展开雷达图
- `P1-07e-match-data-responsive`（1）：TEST-MD-010 移动端布局
- `P1-07f-match-data-edit`（1）：TEST-MD-014 编辑模式保存功能
- `P1-07g-match-data-error`（1）：TEST-MD-016 加载失败后重试
- `P1-08-streamers-import`（3）：批量导入完整流程；导入结果弹窗显示；未认证用户不能访问导入功能
- `P1-09-thanks-marquee`（4）：TEST-THANKS-04 悬停暂停功能；TEST-THANKS-07 桌面端速度验证；TEST-THANKS-08 移动端速度验证；TEST-THANKS-09 速度一致性验证
- `P1-12-streamers-upload`（1）：TEST-STREAMER-UPLOAD-02 URL方式输入海报
- `P1-14-videos`（1）：TEST-VIDEO-02 添加视频完整流程

### P2
- `P2-02-edge-cases`（4）：TEST-B004 空数据状态；首页加载性能；数据刷新性能；TEST-CACHE-04 首页数据刷新
- `P2-03-concurrent`（1）：并发操作处理
- `P2-04-players`（12）：TEST-PLAYER-01 查看选手详情；TEST-PLAYER-02 选手详情信息显示；TEST-PLAYER-03/03-ESC/03-OVERLAY 关闭选手详情弹窗；TEST-PLAYER-04/04-POSITION 选手位置图标；TEST-PLAYER-05/05-VISIBLE 选手评分显示；TEST-PLAYER-06 队长标识显示；TEST-PLAYER-07 常用英雄显示

### P3
- `P3-01-import`（2）：TEST-1403 导入成功流程；TEST-1405 导入覆盖验证
- `P3-03-video-management`（13）：TEST-VIDEO-007 添加视频；TEST-VIDEO-012-EXT1 确认删除视频；TEST-VIDEO-022 筛选启用/禁用视频；TEST-VIDEO-026-EXT1/EXT2/EXT3 未登录访问视频 API；TEST-VIDEO-027 前台视频列表获取；TEST-VIDEO-027-EXT1 前台只显示已启用视频；TEST-VIDEO-029/029-EXT1/EXT2/EXT3 后台视频列表分页/排序/搜索/状态筛选
- `P3-04-match-data-import`（3）：TEST-MD-IMPORT-001 下载模板（后端 API）；TEST-MD-IMPORT-002 模板文件格式验证；TEST-MD-IMPORT-003 页面模板下载按钮展示

### P4
- `P4-01-security`（7）：TEST-SEC-01 XSS 防护；TEST-SEC-02 SQL 注入防护；TEST-SEC-03 特殊字符处理；TEST-SEC-04 长输入截断；TEST-SEC-05 Token 过期处理；TEST-SEC-06 未授权访问受保护页面；TEST-SEC-07 暴力登录防护
- `P4-03-large-dataset`（1）：TEST-PERF-02 首页大数据量加载性能

## 处置建议（按优先级）

1. **登录态前置 / 未授权 API 预期**（影响 P1-01-login、P4-01-security、P3-03 权限 API）：核对该拉测试是否应使用 `msedge-login` 项目或先清登录态/对未授权接口断言 401。
2. **StartBox 封面 / 首页点击**：在首页交互用例统一先退出封面（滚轮/回车/点击）或为对应用例加 `force`.
3. **懒加载滚动**：对依赖首页低部区块的用例先滚动到视口。
4. **数据种子**：为依赖战队/选手/对战数据的用例补充 beforeAll 种子数据。

> 注：本清单仅归档既有失败；本次 bcrypt 修复及其回归（集成全绿 + P1-05/P1-06/P2-01 E2E 全绿）已闭环。