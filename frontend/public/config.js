/**
 * 前端运行时配置文件（生产环境）
 *
 * 此文件用于 Docker 生产环境部署
 * 构建时直接打包到 dist 目录
 *
 * 使用方法：
 * 1. 根据实际情况修改 API_BASE_URL
 * 2. 重新构建前端镜像
 * 3. 部署新镜像
 */

window.APP_CONFIG = {
  // API 基础地址
  // - 使用 Nginx Proxy Manager 代理时，使用相对路径：'/api'
  // - 分离部署（前后端不同域名）时，使用完整地址：'https://api.your-domain.com/api'
  API_BASE_URL: 'http://localhost:3000/api',

  // 应用名称
  APP_NAME: '驴酱杯赛事',

  // 版本号
  VERSION: '1.0.0',

  // 主播配置
  STREAMERS: [
    // 驴酱主播
    {
      id: '1',
      nickname: '洞主',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20humorous%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20dynamic%20pose%2C%20gaming%20scene%2C%20vibrant%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '驴酱核心主播，幽默风趣，游戏技术精湛，深受观众喜爱。',
      liveUrl: 'https://live.example.com/dongzhu',
      isStar: true,
      isGuest: false,
      level: 'S'
    },
    {
      id: '2',
      nickname: '凯哥',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20friendly%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20relaxed%20pose%2C%20gaming%20scene%2C%20warm%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '驴酱核心主播，性格温和，与洞主搭档直播，节目效果出色。',
      liveUrl: 'https://live.example.com/kaige',
      isStar: true,
      isGuest: false,
      level: 'A'
    },
    {
      id: '3',
      nickname: '余小C',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20energetic%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20energetic%20pose%2C%20gaming%20scene%2C%20bright%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '驴酱核心主播，以诺手闻名，直播风格激情澎湃。',
      liveUrl: 'https://live.example.com/yuxiaoc',
      isStar: true,
      isGuest: false,
      level: 'S'
    },
    {
      id: '4',
      nickname: '董亮',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20professional%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20professional%20pose%2C%20gaming%20scene%2C%20sophisticated%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '驴酱核心主播，专业游戏解说，分析深入，见解独到。',
      liveUrl: 'https://live.example.com/dongliang',
      isStar: true,
      isGuest: false,
      level: 'A'
    },
    {
      id: '5',
      nickname: '冯雨',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20female%2C%20cheerful%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20female%2C%20cheerful%20pose%2C%20gaming%20scene%2C%20pastel%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '驴酱核心主播，性格开朗，游戏技术出色，深受观众喜爱。',
      liveUrl: 'https://live.example.com/fengyu',
      isStar: true,
      isGuest: false,
      level: 'A'
    },
    {
      id: '6',
      nickname: '银建军',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20reliable%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20reliable%20pose%2C%20gaming%20scene%2C%20steady%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '驴酱核心主播，技术稳健，直播内容丰富，深受观众好评。',
      liveUrl: 'https://live.example.com/yinjianjun',
      isStar: true,
      isGuest: false,
      level: 'A'
    },
    // 嘉宾主播
    {
      id: '7',
      nickname: 'PIGFF',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20dynamic%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20action%20pose%2C%20gaming%20scene%2C%20intense%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '知名游戏主播，以FPS游戏闻名，直播风格激情四溢。',
      liveUrl: 'https://live.example.com/pigff',
      isStar: false,
      isGuest: true,
      level: 'S'
    },
    {
      id: '8',
      nickname: '孙悟空丨兰林汉',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20vigorous%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20vigorous%20pose%2C%20gaming%20scene%2C%20exciting%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '知名游戏主播，以其独特的直播风格和精彩的游戏操作著称。',
      liveUrl: 'https://live.example.com/wukong',
      isStar: false,
      isGuest: true,
      level: 'S'
    },
    {
      id: '9',
      nickname: '小白鸽WhiteDove',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20female%2C%20elegant%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20female%2C%20elegant%20pose%2C%20gaming%20scene%2C%20soft%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '知名游戏女主播，技术出色，直播内容丰富，深受观众喜爱。',
      liveUrl: 'https://live.example.com/baige',
      isStar: false,
      isGuest: true,
      level: 'A'
    }
  ]
};

console.log('[Config] 开发环境配置已加载:', window.APP_CONFIG);
