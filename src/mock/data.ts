import { Team, Match, StreamInfo } from '../types';

export const initialTeams: Team[] = [
  {
    id: 'team1',
    name: '驴酱',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+donkey+mascot+blue+gold+aggressive&image_size=square',
    description: '驴酱战队',
    players: [
      {
        id: 'p1',
        name: '洞主',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+headphones+blue+light&image_size=square',
        position: '上单',
        description: '斗鱼138243',
        teamId: 'team1'
      },
      {
        id: 'p2',
        name: '凯哥',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+intense+stare&image_size=square',
        position: '打野',
        description: '斗鱼138243',
        teamId: 'team1'
      },
      {
        id: 'p3',
        name: '啧啧',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+female+focused+cyberpunk&image_size=square',
        position: '中单',
        description: '操作细腻',
        teamId: 'team1'
      },
      {
        id: 'p4',
        name: '伏羲',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+glasses+smart&image_size=square',
        position: 'ADC',
        description: '输出稳定',
        teamId: 'team1'
      },
      {
        id: 'p5',
        name: '小溪',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+female+calm+leader&image_size=square',
        position: '辅助',
        description: '斗鱼8981206',
        teamId: 'team1'
      }
    ]
  },
  {
    id: 'team2',
    name: 'IC',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+star+motif+orange+white+modern&image_size=square',
    description: 'IC战队',
    players: [
      { id: 'p6', name: '余小C', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+red+hair&image_size=square', position: '上单', description: '斗鱼1126960', teamId: 'team2' },
      { id: 'p7', name: '阿亮', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+hoodie+mysterious&image_size=square', position: '打野', description: '斗鱼1126960', teamId: 'team2' },
      { id: 'p8', name: '二泽', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+female+bright+smile&image_size=square', position: '中单', description: '中路核心', teamId: 'team2' },
      { id: 'p9', name: '恶意', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+focused+monitor+reflection&image_size=square', position: 'ADC', description: '激进射手', teamId: 'team2' },
      { id: 'p10', name: '阿瓜', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+beard+wise&image_size=square', position: '辅助', description: '团队大脑', teamId: 'team2' }
    ]
  },
  {
    id: 'team3',
    name: 'PLG',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+water+droplet+wave+blue+cyan&image_size=square',
    description: 'PLG战队',
    players: [
      { id: 'p11', name: '泰妍', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+boy&image_size=square', position: '上单', description: '稳健上路', teamId: 'team3' },
      { id: 'p12', name: '查理', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+cool&image_size=square', position: '打野', description: '节奏掌控', teamId: 'team3' },
      { id: 'p13', name: '二抛', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+girl&image_size=square', position: '中单', description: '斗鱼4452132', teamId: 'team3' },
      { id: 'p14', name: '芬达', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+serious&image_size=square', position: 'ADC', description: '后期大核', teamId: 'team3' },
      { id: 'p15', name: '小唯', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+friendly&image_size=square', position: '辅助', description: '斗鱼8690608', teamId: 'team3' }
    ]
  },
  {
    id: 'team4',
    name: '小熊',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+black+horse+silhouette+minimalist&image_size=square',
    description: '小熊战队',
    players: [
      { id: 'p16', name: '小达', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+masked+figure&image_size=square', position: '上单', description: '上路猛男', teamId: 'team4' },
      { id: 'p17', name: '老佳阳', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+neon+lights&image_size=square', position: '打野', description: '经验丰富', teamId: 'team4' },
      { id: 'p18', name: '银剑君', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+hacker+style&image_size=square', position: '中单', description: '斗鱼251783', teamId: 'team4' },
      { id: 'p19', name: '秃秃', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+robot+arm&image_size=square', position: 'ADC', description: '稳定输出', teamId: 'team4' },
      { id: 'p20', name: '皮皮核桃', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+digital+eyes&image_size=square', position: '辅助', description: '保护型辅助', teamId: 'team4' }
    ]
  },
  {
    id: 'team5',
    name: '搓搓鸟',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+bird+mascot+purple+white+modern&image_size=square',
    description: '搓搓鸟战队',
    players: [
      { id: 'p21', name: '法环', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+blue+hair&image_size=square', position: '上单', description: '上路法王', teamId: 'team5' },
      { id: 'p22', name: '大本猪', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+strong+build&image_size=square', position: '打野', description: '肉盾型打野', teamId: 'team5' },
      { id: 'p23', name: '格局', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+smart+glasses&image_size=square', position: '中单', description: '斗鱼2057760', teamId: 'team5' },
      { id: 'p24', name: 'xlbos', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+cool+style&image_size=square', position: 'ADC', description: '技术流', teamId: 'team5' },
      { id: 'p25', name: '年年', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+female+cute+style&image_size=square', position: '辅助', description: '斗鱼12619385', teamId: 'team5' }
    ]
  },
  {
    id: 'team6',
    name: '100J',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+number+100+red+gold+modern&image_size=square',
    description: '100J战队',
    players: [
      { id: 'p26', name: '十六夜', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+night+theme&image_size=square', position: '上单', description: '夜猫子选手', teamId: 'team6' },
      { id: 'p27', name: '小甜椒', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+red+hair&image_size=square', position: '打野', description: '斗鱼3863752', teamId: 'team6' },
      { id: 'p28', name: '温柔遍野', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+gentle+style&image_size=square', position: '中单', description: '温柔打法', teamId: 'team6' },
      { id: 'p29', name: '团子', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+round+face&image_size=square', position: 'ADC', description: '斗鱼1580850', teamId: 'team6' },
      { id: 'p30', name: '柚柚子', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+pomelo+theme&image_size=square', position: '辅助', description: '斗鱼12661677', teamId: 'team6' }
    ]
  },
  {
    id: 'team7',
    name: '69',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+number+69+green+black+modern&image_size=square',
    description: '69战队',
    players: [
      { id: 'p31', name: '尊师HKL', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+master+style&image_size=square', position: '上单', description: '导师型选手', teamId: 'team7' },
      { id: 'p32', name: '大B脸', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+big+face&image_size=square', position: '打野', description: '幽默担当', teamId: 'team7' },
      { id: 'p33', name: '可乐', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+cola+theme&image_size=square', position: '中单', description: '快乐游戏', teamId: 'team7' },
      { id: 'p34', name: '咬人鹅', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+goose+theme&image_size=square', position: 'ADC', description: '斗鱼10902240', teamId: 'team7' },
      { id: 'p35', name: '阿松', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+pine+theme&image_size=square', position: '辅助', description: '稳健辅助', teamId: 'team7' }
    ]
  },
  {
    id: 'team8',
    name: '雨酱',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+rain+drop+blue+purple+modern&image_size=square',
    description: '雨酱战队',
    players: [
      { id: 'p36', name: '想和哥俩玩游戏', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+playful&image_size=square', position: '上单', description: '社交达人', teamId: 'team8' },
      { id: 'p37', name: '慧琳宝', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+treasure&image_size=square', position: '打野', description: '宝藏选手', teamId: 'team8' },
      { id: 'p38', name: '辰林', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+forest+theme&image_size=square', position: '中单', description: '森林之子', teamId: 'team8' },
      { id: 'p39', name: '暴龙战士', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+dinosaur+theme&image_size=square', position: 'ADC', description: '斗鱼9779433', teamId: 'team8' },
      { id: 'p40', name: '冯雨', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+rain+theme&image_size=square', position: '辅助', description: '斗鱼317422', teamId: 'team8' }
    ]
  }
];

export const initialMatches: Match[] = [
  {
    id: 'm1',
    teamAId: 'team1',
    teamBId: 'team2',
    scoreA: 2,
    scoreB: 1,
    winnerId: 'team1',
    round: '四分之一决赛 1',
    status: 'finished',
    startTime: '2025-03-01T18:00:00Z'
  },
  {
    id: 'm2',
    teamAId: 'team3',
    teamBId: 'team4',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: '四分之一决赛 2',
    status: 'upcoming',
    startTime: '2025-03-02T18:00:00Z'
  },
  {
    id: 'm3',
    teamAId: 'team5',
    teamBId: 'team6',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: '四分之一决赛 3',
    status: 'upcoming',
    startTime: '2025-03-03T18:00:00Z'
  },
  {
    id: 'm4',
    teamAId: 'team7',
    teamBId: 'team8',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: '四分之一决赛 4',
    status: 'upcoming',
    startTime: '2025-03-04T18:00:00Z'
  },
  {
    id: 'm5',
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: '半决赛 1',
    status: 'upcoming',
    startTime: '2025-03-05T20:00:00Z'
  },
  {
    id: 'm6',
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: '半决赛 2',
    status: 'upcoming',
    startTime: '2025-03-06T20:00:00Z'
  },
  {
    id: 'm7',
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: '总决赛',
    status: 'upcoming',
    startTime: '2025-03-08T20:00:00Z'
  }
];

export const initialStreamInfo: StreamInfo = {
  title: '驴酱杯 2025 - 总决赛',
  url: 'https://www.douyu.com/138243',
  platform: '斗鱼直播',
  isLive: true
};
