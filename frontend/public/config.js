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
    {
      id: '1',
      nickname: 'PDD',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20confident%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20dynamic%20pose%2C%20gaming%20scene%2C%20vibrant%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '知名游戏主播，驴酱杯创始人之一，以幽默风趣的直播风格和高超的游戏技术深受观众喜爱。',
      liveUrl: 'https://live.example.com/pdd',
      isStar: true,
      isGuest: false,
      level: 'S'
    },
    {
      id: '2',
      nickname: '大司马',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20portrait%2C%20male%2C%20glasses%2C%20smiling%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20gamer%20streamer%20poster%2C%20male%2C%20teaching%20pose%2C%20gaming%20scene%2C%20warm%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '金牌讲师，游戏解说，以其独特的教学风格和幽默的直播内容著称。',
      liveUrl: 'https://live.example.com/dasma',
      isStar: true,
      isGuest: false,
      level: 'A'
    },
    {
      id: '3',
      nickname: 'Uzi',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20portrait%2C%20male%2C%20focused%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20poster%2C%20male%2C%20competitive%20pose%2C%20gaming%20arena%2C%20intense%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '前职业选手，世界冠军，被誉为世界第一ADC，技术精湛，比赛经验丰富。',
      liveUrl: 'https://live.example.com/uzi',
      isStar: false,
      isGuest: true,
      level: 'S'
    },
    {
      id: '4',
      nickname: 'TheShy',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20portrait%2C%20male%2C%20cool%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20poster%2C%20male%2C%20aggressive%20pose%2C%20gaming%20arena%2C%20dynamic%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '顶级上单选手，以其激进的打法和出色的操作闻名，多次获得世界冠军。',
      liveUrl: 'https://live.example.com/theshy',
      isStar: false,
      isGuest: true,
      level: 'S'
    },
    {
      id: '5',
      nickname: 'Rookie',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20portrait%2C%20male%2C%20asian%2C%20confident%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20poster%2C%20male%2C%20mid%20laner%2C%20gaming%20arena%2C%20vibrant%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '世界级中单选手，操作细腻，意识出色，多次带领队伍取得好成绩。',
      liveUrl: 'https://live.example.com/rookie',
      isStar: false,
      isGuest: true,
      level: 'S'
    },
    {
      id: '6',
      nickname: 'Letme',
      avatarUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20portrait%2C%20male%2C%20calm%2C%20gaming%20background%2C%20high%20quality&image_size=square_hd',
      posterUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20esports%20player%20poster%2C%20male%2C%20top%20laner%2C%20gaming%20arena%2C%20steady%20colors%2C%20high%20quality&image_size=landscape_16_9',
      bio: '前职业上单选手，以稳健的打法和团队意识著称，退役后转型主播。',
      liveUrl: 'https://live.example.com/letme',
      isStar: true,
      isGuest: false,
      level: 'A'
    }
  ]
};

console.log('[Config] 开发环境配置已加载:', window.APP_CONFIG);
