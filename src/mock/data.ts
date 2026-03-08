import { Team, Match, StreamInfo } from '../types';

export const initialTeams: Team[] = [
  {
    id: 'team1',
    name: 'LvMao Legends',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+donkey+mascot+blue+gold+aggressive&image_size=square',
    description: 'The legendary team from LvMao guild.',
    players: [
      {
        id: 'p1',
        name: 'LvMao_King',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+headphones+blue+light&image_size=square',
        position: 'Top',
        description: 'Top lane carry',
        teamId: 'team1'
      },
      {
        id: 'p2',
        name: 'Jungle_Beast',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+intense+stare&image_size=square',
        position: 'Jungle',
        description: 'Aggressive jungler',
        teamId: 'team1'
      },
      {
        id: 'p3',
        name: 'Mid_God',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+female+focused+cyberpunk&image_size=square',
        position: 'Mid',
        description: 'Mechanical god',
        teamId: 'team1'
      },
      {
        id: 'p4',
        name: 'ADC_Carry',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+male+glasses+smart&image_size=square',
        position: 'ADC',
        description: 'Damage dealer',
        teamId: 'team1'
      },
      {
        id: 'p5',
        name: 'Supp_Savior',
        avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cool+gamer+avatar+female+calm+leader&image_size=square',
        position: 'Support',
        description: 'Team captain',
        teamId: 'team1'
      }
    ]
  },
  {
    id: 'team2',
    name: 'DouYu Allstars',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+star+motif+orange+white+modern&image_size=square',
    description: 'All-star streamers from DouYu.',
    players: [
      { id: 'p6', name: 'Star_Top', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+red+hair&image_size=square', position: 'Top', description: 'Experienced veteran', teamId: 'team2' },
      { id: 'p7', name: 'Star_Jungle', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+hoodie+mysterious&image_size=square', position: 'Jungle', description: 'Gank machine', teamId: 'team2' },
      { id: 'p8', name: 'Star_Mid', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+female+bright+smile&image_size=square', position: 'Mid', description: 'Roaming expert', teamId: 'team2' },
      { id: 'p9', name: 'Star_ADC', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+focused+monitor+reflection&image_size=square', position: 'ADC', description: 'Farming simulator', teamId: 'team2' },
      { id: 'p10', name: 'Star_Supp', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gamer+avatar+male+beard+wise&image_size=square', position: 'Support', description: 'Vision master', teamId: 'team2' }
    ]
  },
  {
    id: 'team3',
    name: 'Water Friends',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+water+droplet+wave+blue+cyan&image_size=square',
    description: 'The strongest water friends team.',
    players: [
      { id: 'p11', name: 'WF_Top', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+boy&image_size=square', position: 'Top', description: 'Hidden gem', teamId: 'team3' },
      { id: 'p12', name: 'WF_Jungle', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+cool&image_size=square', position: 'Jungle', description: 'Solo queue king', teamId: 'team3' },
      { id: 'p13', name: 'WF_Mid', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+girl&image_size=square', position: 'Mid', description: 'One trick pony', teamId: 'team3' },
      { id: 'p14', name: 'WF_ADC', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+serious&image_size=square', position: 'ADC', description: 'KDA player', teamId: 'team3' },
      { id: 'p15', name: 'WF_Supp', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime+style+gamer+avatar+friendly&image_size=square', position: 'Support', description: 'E-girl buff', teamId: 'team3' }
    ]
  },
  {
    id: 'team4',
    name: 'Dark Horse',
    logo: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=esports+team+logo+black+horse+silhouette+minimalist&image_size=square',
    description: 'The unexpected challengers.',
    players: [
      { id: 'p16', name: 'DH_Top', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+masked+figure&image_size=square', position: 'Top', description: 'Unpredictable', teamId: 'team4' },
      { id: 'p17', name: 'DH_Jungle', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+neon+lights&image_size=square', position: 'Jungle', description: 'Wildcard', teamId: 'team4' },
      { id: 'p18', name: 'DH_Mid', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+hacker+style&image_size=square', position: 'Mid', description: 'Macro genius', teamId: 'team4' },
      { id: 'p19', name: 'DH_ADC', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+robot+arm&image_size=square', position: 'ADC', description: 'Mechanics', teamId: 'team4' },
      { id: 'p20', name: 'DH_Supp', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cyberpunk+avatar+digital+eyes&image_size=square', position: 'Support', description: 'Shotcaller', teamId: 'team4' }
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
  title: 'LvMao Cup 2025 - Grand Finals',
  url: 'https://www.douyu.com/12345',
  platform: 'DouYu',
  isLive: true
};
