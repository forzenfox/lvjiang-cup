/**
 * 前端运行时配置文件（生产环境模板）
 *
 * 此文件用于 Docker 生产环境部署
 * 通过 volume 挂载到前端容器中，覆盖默认的本地开发配置
 *
 * 使用方法：
 * 1. 复制此文件到部署目录：cp config.js /opt/lvjiang-cup/deploy/config.js
 * 2. 根据实际情况修改 API_BASE_URL 和 THANKS_DATA
 * 3. docker-compose.yml 中已配置 volume 挂载（挂载到 /app/dist/config.js）
 * 4. 修改后执行 docker-compose restart frontend 生效
 */

window.APP_CONFIG = {
  // API 基础地址
  // - 使用 Nginx Proxy Manager 代理时，使用相对路径: '/api'
  // - 分离部署（前后端不同域名）时，使用完整地址: 'https://api.your-domain.com/api'
  API_BASE_URL: '/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',

  // GitHub CDN 基础地址 (用于加载 assets/ 目录下的图片资源)
  // 默认使用 JSDMirror (国内加速)，可随时切换为其他 CDN 源
  GITHUB_CDN_BASE: 'https://cdn.jsdmirror.com/gh/forzenfox/lvjiang-cup@main',

  // 封面图片配置
  // - 支持 pc 和 mobile 两个平台
  // - 只需填写 assets/ 目录下的图片文件名，代码会自动拼接 CDN 和本地路径
  // - 可配置多张图片实现轮播效果
  // - 建议使用 WebP 格式以提升加载性能
  COVER_IMAGES: {
    pc: [
      'cover_01.webp',
      'cover_02.webp',
      'cover_03.webp',
      'cover_04.webp'
    ],
    mobile: [
      'mobile_cover_01.webp'
    ],
  },
};

// 鸣谢模块数据配置
// - sponsors: 赞助商列表
//   - id: 唯一标识（不重复的正整数）
//   - sponsorName: 赞助人名称
//   - sponsorContent: 赞助内容/金额
//   - specialAward: 特殊奖项说明（可选）
// - staff: 工作人员列表
//   - id: 唯一标识（不重复的正整数）
//   - name: 工作人员姓名
//   - role: 角色/职责分类
window.THANKS_DATA = {
  sponsors: [
    { id: 1, sponsorName: "斗鱼官方", sponsorContent: "7W" },
    { id: 2, sponsorName: "神秘老板", sponsorContent: "5K" },
    { id: 3, sponsorName: "秀木老板", sponsorContent: "2W" },
    { id: 4, sponsorName: "玩一下鼓励员老板", sponsorContent: "2K" },
    { id: 5, sponsorName: "洞庭湖里的平头老板", sponsorContent: "3K" },
    { id: 6, sponsorName: "尊师hkl", sponsorContent: "2K" },
    { id: 7, sponsorName: "为何如此衰", sponsorContent: "8K", specialAward: "8强每个队伍1K" },
    { id: 8, sponsorName: "董B登", sponsorContent: "1K", specialAward: "冠军每人750g蓝莓果干+250g参片" },
    { id: 9, sponsorName: "只会打炉石的SteveD", sponsorContent: "1K" },
    { id: 10, sponsorName: "深红", sponsorContent: "2K" },
    { id: 11, sponsorName: "MT", sponsorContent: "2K", specialAward: "4强每人一份贡菜千层肚" },
    { id: 12, sponsorName: "不减到75kg不改名", sponsorContent: "1K", specialAward: "最佳C/D级（参赛选手评）" },
    { id: 13, sponsorName: "你真的是厉害（天谎星）", sponsorContent: "500", specialAward: "爆种奖" },
    { id: 14, sponsorName: "直播间最漂亮的寡妇", sponsorContent: "1K", specialAward: "最拉辅助和最强辅助，一人一半" },
    { id: 15, sponsorName: "热心市民小曹", sponsorContent: "2K" },
    { id: 16, sponsorName: "斗驴启动", sponsorContent: "1K", specialAward: "亚军SVP" },
    { id: 17, sponsorName: "小金拉黑属实不行", sponsorContent: "500", specialAward: "爆种奖" },
    { id: 18, sponsorName: "苏唐", sponsorContent: "1K", specialAward: "瑞士轮第一个淘汰的队伍5人平分" },
    { id: 19, sponsorName: "c酱的骚刚", sponsorContent: "600", specialAward: "弹幕票选表现最差A/S，300R/人" },
    { id: 20, sponsorName: "人生梦想", sponsorContent: "1K", specialAward: "冠军打野" }
  ],
  staff: [
    { id: 1, name: "（待补充）", role: "赛事策划" },
    { id: 2, name: "（待补充）", role: "技术支持" },
    { id: 3, name: "（待补充）", role: "运营推广" },
    { id: 4, name: "（待补充）", role: "数据统计" }
  ]
};

console.log('[Config] 生产环境配置已加载:', window.APP_CONFIG);
console.log('[ThanksData] 鸣谢模块数据已加载:', window.THANKS_DATA);
