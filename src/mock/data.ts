import { Team, Match, StreamInfo } from '../types';

export const initialTeams: Team[] = [
  {
    id: 'team1',
    name: '驴酱传奇',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+donkey+mascot+blue+gold+aggressive&image_size=square',
    description: '驴酱公会的传奇战队',
    players: [
      {
        id: 'p1',
        name: '驴酱之王',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+headphones+blue+light&image_size=square',
        position: '上单',
        description: '上路核心',
        teamId: 'team1'
      },
      {
        id: 'p2',
        name: '野区猛兽',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+intense+stare&image_size=square',
        position: '打野',
        description: '侵略型打野',
        teamId: 'team1'
      },
      {
        id: 'p3',
        name: '中路之神',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+female+focused+cyberpunk&image_size=square',
        position: '中单',
        description: '操作怪',
        teamId: 'team1'
      },
      {
        id: 'p4',
        name: '射手核心',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+glasses+smart&image_size=square',
        position: 'ADC',
        description: '输出担当',
        teamId: 'team1'
      },
      {
        id: 'p5',
        name: '辅助救星',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+female+calm+leader&image_size=square',
        position: '辅助',
        description: '队长',
        teamId: 'team1'
      }
    ]
  },
  {
    id: 'team2',
    name: '斗鱼全明星',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+star+motif+orange+white+modern&image_size=square',
    description: '斗鱼平台的明星主播战队',
    players: [
      { id: 'p6', name: '明星上单', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+red+hair&image_size=square', position: '上单', description: '经验丰富', teamId: 'team2' },
      { id: 'p7', name: '明星打野', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+hoodie+mysterious&image_size=square', position: '打野', description: '抓人机器', teamId: 'team2' },
      { id: 'p8', name: '明星中单', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+female+bright+smile&image_size=square', position: '中单', description: '游走专家', teamId: 'team2' },
      { id: 'p9', name: '明星射手', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+focused+monitor+reflection&image_size=square', position: 'ADC', description: '补刀机器', teamId: 'team2' },
      { id: 'p10', name: '明星辅助', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+beard+wise&image_size=square', position: '辅助', description: '视野大师', teamId: 'team2' }
    ]
  },
  {
    id: 'team3',
    name: '水友战队',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+water+droplet+wave+blue+cyan&image_size=square',
    description: '最强的水友战队',
    players: [
      { id: 'p11', name: '水友上单', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+boy&image_size=square', position: '上单', description: '隐藏高手', teamId: 'team3' },
      { id: 'p12', name: '水友打野', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+cool&image_size=square', position: '打野', description: '排位王者', teamId: 'team3' },
      { id: 'p13', name: '水友中单', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+girl&image_size=square', position: '中单', description: '绝活哥', teamId: 'team3' },
      { id: 'p14', name: '水友射手', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+serious&image_size=square', position: 'ADC', description: 'KDA选手', teamId: 'team3' },
      { id: 'p15', name: '水友辅助', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+friendly&image_size=square', position: '辅助', description: '妹妹加成', teamId: 'team3' }
    ]
  },
  {
    id: 'team4',
    name: '黑马战队',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+black+horse+silhouette+minimalist&image_size=square',
    description: '意想不到的挑战者',
    players: [
      { id: 'p16', name: '黑马上单', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+masked+figure&image_size=square', position: '上单', description: '深不可测', teamId: 'team4' },
      { id: 'p17', name: '黑马打野', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+neon+lights&image_size=square', position: '打野', description: '变数', teamId: 'team4' },
      { id: 'p18', name: '黑马中单', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+hacker+style&image_size=square', position: '中单', description: '大局观', teamId: 'team4' },
      { id: 'p19', name: '黑马射手', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+robot+arm&image_size=square', position: 'ADC', description: '操作怪', teamId: 'team4' },
      { id: 'p20', name: '黑马辅助', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+digital+eyes&image_size=square', position: '辅助', description: '指挥', teamId: 'team4' }
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
    round: 'Semi-Final 1',
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
    round: 'Semi-Final 2',
    status: 'upcoming',
    startTime: '2025-03-02T18:00:00Z'
  },
  {
    id: 'm3',
    teamAId: 'team1',
    teamBId: '', // To be determined
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: 'Final',
    status: 'upcoming',
    startTime: '2025-03-03T20:00:00Z'
  }
];

export const initialStreamInfo: StreamInfo = {
  title: '驴酱杯 2025 - 总决赛',
  url: 'https://www.douyu.com/138243',
  platform: '斗鱼直播',
  isLive: true
};
