import { Team, Match, StreamInfo } from '../types';

// 16支战队数据
export const initialTeams: Team[] = [
  // 原有8支战队保持不变
  {
    id: 'team1',
    name: '驴酱',
    logo: 'https://picsum.photos/seed/donkey/200/200',
    battleCry: '驴酱战队',
    players: [
      { id: 'p1', nickname: '洞主', avatarUrl: 'https://robohash.org/dongzhu?set=set4&size=100x100', position: 'TOP', bio: '斗鱼138243', teamId: 'team1' },
      { id: 'p2', nickname: '凯哥', avatarUrl: 'https://robohash.org/kaige?set=set4&size=100x100', position: 'JUNGLE', bio: '斗鱼138243', teamId: 'team1' },
      { id: 'p3', nickname: '啧啧', avatarUrl: 'https://robohash.org/zeze?set=set4&size=100x100', position: 'MID', bio: '操作细腻', teamId: 'team1' },
      { id: 'p4', nickname: '伏羲', avatarUrl: 'https://robohash.org/fuxi?set=set4&size=100x100', position: 'ADC', bio: '输出稳定', teamId: 'team1' },
      { id: 'p5', nickname: '小溪', avatarUrl: 'https://robohash.org/xiaoxi?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼8981206', teamId: 'team1' },
    ],
  },
  {
    id: 'team2',
    name: 'IC',
    logo: 'https://picsum.photos/seed/icstar/200/200',
    battleCry: 'IC战队',
    players: [
      { id: 'p6', nickname: '余小C', avatarUrl: 'https://robohash.org/yuxiaoc?set=set4&size=100x100', position: 'TOP', bio: '斗鱼1126960', teamId: 'team2' },
      { id: 'p7', nickname: '阿亮', avatarUrl: 'https://robohash.org/aliang?set=set4&size=100x100', position: 'JUNGLE', bio: '斗鱼1126960', teamId: 'team2' },
      { id: 'p8', nickname: '二泽', avatarUrl: 'https://robohash.org/erze?set=set4&size=100x100', position: 'MID', bio: '中路核心', teamId: 'team2' },
      { id: 'p9', nickname: '恶意', avatarUrl: 'https://robohash.org/eyi?set=set4&size=100x100', position: 'ADC', bio: '激进射手', teamId: 'team2' },
      { id: 'p10', nickname: '阿瓜', avatarUrl: 'https://robohash.org/agua?set=set4&size=100x100', position: 'SUPPORT', bio: '团队大脑', teamId: 'team2' },
    ],
  },
  {
    id: 'team3',
    name: 'PLG',
    logo: 'https://picsum.photos/seed/plgwater/200/200',
    battleCry: 'PLG战队',
    players: [
      { id: 'p11', nickname: '泰妍', avatarUrl: 'https://robohash.org/taiyan?set=set4&size=100x100', position: 'TOP', bio: '稳健上路', teamId: 'team3' },
      { id: 'p12', nickname: '查理', avatarUrl: 'https://robohash.org/chali?set=set4&size=100x100', position: 'JUNGLE', bio: '节奏掌控', teamId: 'team3' },
      { id: 'p13', nickname: '二抛', avatarUrl: 'https://robohash.org/erpao?set=set4&size=100x100', position: 'MID', bio: '斗鱼4452132', teamId: 'team3' },
      { id: 'p14', nickname: '芬达', avatarUrl: 'https://robohash.org/fenda?set=set4&size=100x100', position: 'ADC', bio: '后期大核', teamId: 'team3' },
      { id: 'p15', nickname: '小唯', avatarUrl: 'https://robohash.org/xiaowei?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼8690608', teamId: 'team3' },
    ],
  },
  {
    id: 'team4',
    name: '小熊',
    logo: 'https://picsum.photos/seed/xiaoxiong/200/200',
    battleCry: '小熊战队',
    players: [
      { id: 'p16', nickname: '小达', avatarUrl: 'https://robohash.org/xiaoda?set=set4&size=100x100', position: 'TOP', bio: '上路猛男', teamId: 'team4' },
      { id: 'p17', nickname: '老佳阳', avatarUrl: 'https://robohash.org/laojiayang?set=set4&size=100x100', position: 'JUNGLE', bio: '经验丰富', teamId: 'team4' },
      { id: 'p18', nickname: '银剑君', avatarUrl: 'https://robohash.org/yinjianjun?set=set4&size=100x100', position: 'MID', bio: '斗鱼251783', teamId: 'team4' },
      { id: 'p19', nickname: '秃秃', avatarUrl: 'https://robohash.org/tutu?set=set4&size=100x100', position: 'ADC', bio: '稳定输出', teamId: 'team4' },
      { id: 'p20', nickname: '皮皮核桃', avatarUrl: 'https://robohash.org/pipihetao?set=set4&size=100x100', position: 'SUPPORT', bio: '保护型辅助', teamId: 'team4' },
    ],
  },
  {
    id: 'team5',
    name: '搓搓鸟',
    logo: 'https://picsum.photos/seed/cuocuoniao/200/200',
    battleCry: '搓搓鸟战队',
    players: [
      { id: 'p21', nickname: '法环', avatarUrl: 'https://robohash.org/fahuan?set=set4&size=100x100', position: 'TOP', bio: '上路法王', teamId: 'team5' },
      { id: 'p22', nickname: '大本猪', avatarUrl: 'https://robohash.org/dabenzhu?set=set4&size=100x100', position: 'JUNGLE', bio: '肉盾型打野', teamId: 'team5' },
      { id: 'p23', nickname: '格局', avatarUrl: 'https://robohash.org/geju?set=set4&size=100x100', position: 'MID', bio: '斗鱼2057760', teamId: 'team5' },
      { id: 'p24', nickname: 'xlbos', avatarUrl: 'https://robohash.org/xlbos?set=set4&size=100x100', position: 'ADC', bio: '技术流', teamId: 'team5' },
      { id: 'p25', nickname: '年年', avatarUrl: 'https://robohash.org/niannian?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼12619385', teamId: 'team5' },
    ],
  },
  {
    id: 'team6',
    name: '100J',
    logo: 'https://picsum.photos/seed/100j/200/200',
    battleCry: '100J战队',
    players: [
      { id: 'p26', nickname: '十六夜', avatarUrl: 'https://robohash.org/shiliuye?set=set4&size=100x100', position: 'TOP', bio: '夜猫子选手', teamId: 'team6' },
      { id: 'p27', nickname: '小甜椒', avatarUrl: 'https://robohash.org/xiaotianjiao?set=set4&size=100x100', position: 'JUNGLE', bio: '斗鱼3863752', teamId: 'team6' },
      { id: 'p28', nickname: '温柔遍野', avatarUrl: 'https://robohash.org/wenroubianye?set=set4&size=100x100', position: 'MID', bio: '温柔打法', teamId: 'team6' },
      { id: 'p29', nickname: '团子', avatarUrl: 'https://robohash.org/tuanzi?set=set4&size=100x100', position: 'ADC', bio: '斗鱼1580850', teamId: 'team6' },
      { id: 'p30', nickname: '柚柚子', avatarUrl: 'https://robohash.org/youyouzi?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼12661677', teamId: 'team6' },
    ],
  },
  {
    id: 'team7',
    name: '69',
    logo: 'https://picsum.photos/seed/69team/200/200',
    battleCry: '69战队',
    players: [
      { id: 'p31', nickname: '尊师HKL', avatarUrl: 'https://robohash.org/zunshihkl?set=set4&size=100x100', position: 'TOP', bio: '导师型选手', teamId: 'team7' },
      { id: 'p32', nickname: '大B脸', avatarUrl: 'https://robohash.org/dabilian?set=set4&size=100x100', position: 'JUNGLE', bio: '幽默担当', teamId: 'team7' },
      { id: 'p33', nickname: '可乐', avatarUrl: 'https://robohash.org/kele?set=set4&size=100x100', position: 'MID', bio: '快乐游戏', teamId: 'team7' },
      { id: 'p34', nickname: '咬人鹅', avatarUrl: 'https://robohash.org/yaorene?set=set4&size=100x100', position: 'ADC', bio: '斗鱼10902240', teamId: 'team7' },
      { id: 'p35', nickname: '阿松', avatarUrl: 'https://robohash.org/asong?set=set4&size=100x100', position: 'SUPPORT', bio: '稳健辅助', teamId: 'team7' },
    ],
  },
  {
    id: 'team8',
    name: '雨酱',
    logo: 'https://picsum.photos/seed/yujiang/200/200',
    battleCry: '雨酱战队',
    players: [
      { id: 'p36', nickname: '想和哥俩玩游戏', avatarUrl: 'https://robohash.org/xiangwan?set=set4&size=100x100', position: 'TOP', bio: '社交达人', teamId: 'team8' },
      { id: 'p37', nickname: '慧琳宝', avatarUrl: 'https://robohash.org/huilinbao?set=set4&size=100x100', position: 'JUNGLE', bio: '宝藏选手', teamId: 'team8' },
      { id: 'p38', nickname: '辰林', avatarUrl: 'https://robohash.org/chenlin?set=set4&size=100x100', position: 'MID', bio: '森林之子', teamId: 'team8' },
      { id: 'p39', nickname: '暴龙战士', avatarUrl: 'https://robohash.org/baolong?set=set4&size=100x100', position: 'ADC', bio: '斗鱼9779433', teamId: 'team8' },
      { id: 'p40', nickname: '冯雨', avatarUrl: 'https://robohash.org/fengyu?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼317422', teamId: 'team8' },
    ],
  },
  // 新增8支战队
  {
    id: 'team9',
    name: '星辰',
    logo: 'https://picsum.photos/seed/star/200/200',
    battleCry: '星辰战队',
    players: [
      { id: 'p41', nickname: '星河', avatarUrl: 'https://robohash.org/xinghe?set=set4&size=100x100', position: 'TOP', bio: '星光上路', teamId: 'team9' },
      { id: 'p42', nickname: '闪烁', avatarUrl: 'https://robohash.org/shanshan?set=set4&size=100x100', position: 'JUNGLE', bio: '打野新星', teamId: 'team9' },
      { id: 'p43', nickname: '流星', avatarUrl: 'https://robohash.org/liuxing?set=set4&size=100x100', position: 'MID', bio: '中单新秀', teamId: 'team9' },
      { id: 'p44', nickname: '彗星', avatarUrl: 'https://robohash.org/huixing?set=set4&size=100x100', position: 'ADC', bio: '精准射手', teamId: 'team9' },
      { id: 'p45', nickname: '夜空', avatarUrl: 'https://robohash.org/yekong?set=set4&size=100x100', position: 'SUPPORT', bio: '夜空守护', teamId: 'team9' },
    ],
  },
  {
    id: 'team10',
    name: '烈焰',
    logo: 'https://picsum.photos/seed/fire/200/200',
    battleCry: '烈焰战队',
    players: [
      { id: 'p46', nickname: '火焰', avatarUrl: 'https://robohash.org/huoyan?set=set4&size=100x100', position: 'TOP', bio: '烈焰上路', teamId: 'team10' },
      { id: 'p47', nickname: '燃烧', avatarUrl: 'https://robohash.org/ranshao?set=set4&size=100x100', position: 'JUNGLE', bio: '燃烧打野', teamId: 'team10' },
      { id: 'p48', nickname: '炽热', avatarUrl: 'https://robohash.org/chire?set=set4&size=100x100', position: 'MID', bio: '中单强者', teamId: 'team10' },
      { id: 'p49', nickname: '烈焰', avatarUrl: 'https://robohash.org/lieyan?set=set4&size=100x100', position: 'ADC', bio: '火焰射手', teamId: 'team10' },
      { id: 'p50', nickname: '灰烬', avatarUrl: 'https://robohash.org/huijin?set=set4&size=100x100', position: 'SUPPORT', bio: '辅助新星', teamId: 'team10' },
    ],
  },
  {
    id: 'team11',
    name: '寒冰',
    logo: 'https://picsum.photos/seed/ice/200/200',
    battleCry: '寒冰战队',
    players: [
      { id: 'p51', nickname: '冰霜', avatarUrl: 'https://robohash.org/bingshuang?set=set4&size=100x100', position: 'TOP', bio: '冰封上路', teamId: 'team11' },
      { id: 'p52', nickname: '雪花', avatarUrl: 'https://robohash.org/xuehua?set=set4&size=100x100', position: 'JUNGLE', bio: '雪花打野', teamId: 'team11' },
      { id: 'p53', nickname: '寒流', avatarUrl: 'https://robohash.org/hanliu?set=set4&size=100x100', position: 'MID', bio: '寒冰中单', teamId: 'team11' },
      { id: 'p54', nickname: '冰川', avatarUrl: 'https://robohash.org/bingchuan?set=set4&size=100x100', position: 'ADC', bio: '冰川射手', teamId: 'team11' },
      { id: 'p55', nickname: '极光', avatarUrl: 'https://robohash.org/jiguang?set=set4&size=100x100', position: 'SUPPORT', bio: '极光守护', teamId: 'team11' },
    ],
  },
  {
    id: 'team12',
    name: '雷霆',
    logo: 'https://picsum.photos/seed/thunder/200/200',
    battleCry: '雷霆战队',
    players: [
      { id: 'p56', nickname: '闪电', avatarUrl: 'https://robohash.org/shandian?set=set4&size=100x100', position: 'TOP', bio: '闪电上路', teamId: 'team12' },
      { id: 'p57', nickname: '雷鸣', avatarUrl: 'https://robohash.org/leiming?set=set4&size=100x100', position: 'JUNGLE', bio: '雷鸣打野', teamId: 'team12' },
      { id: 'p58', nickname: '电场', avatarUrl: 'https://robohash.org/dianchang?set=set4&size=100x100', position: 'MID', bio: '电场中单', teamId: 'team12' },
      { id: 'p59', nickname: '电荷', avatarUrl: 'https://robohash.org/dianhe?set=set4&size=100x100', position: 'ADC', bio: '电荷射手', teamId: 'team12' },
      { id: 'p60', nickname: '云端', avatarUrl: 'https://robohash.org/yunduan?set=set4&size=100x100', position: 'SUPPORT', bio: '云端辅助', teamId: 'team12' },
    ],
  },
  {
    id: 'team13',
    name: '暗影',
    logo: 'https://picsum.photos/seed/shadow/200/200',
    battleCry: '暗影战队',
    players: [
      { id: 'p61', nickname: '影子', avatarUrl: 'https://robohash.org/yingzi?set=set4&size=100x100', position: 'TOP', bio: '暗影上路', teamId: 'team13' },
      { id: 'p62', nickname: '幽灵', avatarUrl: 'https://robohash.org/youlong?set=set4&size=100x100', position: 'JUNGLE', bio: '幽灵打野', teamId: 'team13' },
      { id: 'p63', nickname: '黑夜', avatarUrl: 'https://robohash.org/heiye?set=set4&size=100x100', position: 'MID', bio: '黑夜中单', teamId: 'team13' },
      { id: 'p64', nickname: '暗夜', avatarUrl: 'https://robohash.org/anye?set=set4&size=100x100', position: 'ADC', bio: '暗夜射手', teamId: 'team13' },
      { id: 'p65', nickname: '迷雾', avatarUrl: 'https://robohash.org/miwnu?set=set4&size=100x100', position: 'SUPPORT', bio: '迷雾守护', teamId: 'team13' },
    ],
  },
  {
    id: 'team14',
    name: '疾风',
    logo: 'https://picsum.photos/seed/wind/200/200',
    battleCry: '疾风战队',
    players: [
      { id: 'p66', nickname: '风暴', avatarUrl: 'https://robohash.org/fengbao?set=set4&size=100x100', position: 'TOP', bio: '风暴上路', teamId: 'team14' },
      { id: 'p67', nickname: '飓风', avatarUrl: 'https://robohash.org/jufeng?set=set4&size=100x100', position: 'JUNGLE', bio: '飓风打野', teamId: 'team14' },
      { id: 'p68', nickname: '微风', avatarUrl: 'https://robohash.org/weifeng?set=set4&size=100x100', position: 'MID', bio: '微风中单', teamId: 'team14' },
      { id: 'p69', nickname: '狂风', avatarUrl: 'https://robohash.org/kuangfeng?set=set4&size=100x100', position: 'ADC', bio: '狂风射手', teamId: 'team14' },
      { id: 'p70', nickname: '清风', avatarUrl: 'https://robohash.org/qingfeng?set=set4&size=100x100', position: 'SUPPORT', bio: '清风辅助', teamId: 'team14' },
    ],
  },
  {
    id: 'team15',
    name: '巨石',
    logo: 'https://picsum.photos/seed/rock/200/200',
    battleCry: '巨石战队',
    players: [
      { id: 'p71', nickname: '岩石', avatarUrl: 'https://robohash.org/yanshi?set=set4&size=100x100', position: 'TOP', bio: '岩石上路', teamId: 'team15' },
      { id: 'p72', nickname: '山岳', avatarUrl: 'https://robohash.org/shanyue?set=set4&size=100x100', position: 'JUNGLE', bio: '山岳打野', teamId: 'team15' },
      { id: 'p73', nickname: '砂石', avatarUrl: 'https://robohash.org/shashi?set=set4&size=100x100', position: 'MID', bio: '砂石中单', teamId: 'team15' },
      { id: 'p74', nickname: '碎石', avatarUrl: 'https://robohash.org/suishi?set=set4&size=100x100', position: 'ADC', bio: '碎石射手', teamId: 'team15' },
      { id: 'p75', nickname: '岩壁', avatarUrl: 'https://robohash.org/yanbi?set=set4&size=100x100', position: 'SUPPORT', bio: '岩壁辅助', teamId: 'team15' },
    ],
  },
  {
    id: 'team16',
    name: '深海',
    logo: 'https://picsum.photos/seed/ocean/200/200',
    battleCry: '深海战队',
    players: [
      { id: 'p76', nickname: '海浪', avatarUrl: 'https://robohash.org/hailang?set=set4&size=100x100', position: 'TOP', bio: '海浪上路', teamId: 'team16' },
      { id: 'p77', nickname: '潮汐', avatarUrl: 'https://robohash.org/chaoxi?set=set4&size=100x100', position: 'JUNGLE', bio: '潮汐打野', teamId: 'team16' },
      { id: 'p78', nickname: '珊瑚', avatarUrl: 'https://robohash.org/shanhu?set=set4&size=100x100', position: 'MID', bio: '珊瑚中单', teamId: 'team16' },
      { id: 'p79', nickname: '海龟', avatarUrl: 'https://robohash.org/haigui?set=set4&size=100x100', position: 'ADC', bio: '海龟射手', teamId: 'team16' },
      { id: 'p80', nickname: '珍珠', avatarUrl: 'https://robohash.org/zhenzhu?set=set4&size=100x100', position: 'SUPPORT', bio: '珍珠辅助', teamId: 'team16' },
    ],
  },
];

// 瑞士轮32场比赛
export const swissMatches: Match[] = [
  // ========== 第一轮：8场 BO1 (swissRound: 1, 0-0战绩) ==========
  { id: 'swiss-r1-1', teamAId: 'team1', teamBId: 'team2', scoreA: 1, scoreB: 0, winnerId: 'team1', round: 'Round 1', status: 'finished', startTime: '2025-11-13T18:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },
  { id: 'swiss-r1-2', teamAId: 'team3', teamBId: 'team4', scoreA: 0, scoreB: 1, winnerId: 'team4', round: 'Round 1', status: 'finished', startTime: '2025-11-13T19:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },
  { id: 'swiss-r1-3', teamAId: 'team5', teamBId: 'team6', scoreA: 1, scoreB: 0, winnerId: 'team5', round: 'Round 1', status: 'finished', startTime: '2025-11-13T20:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },
  { id: 'swiss-r1-4', teamAId: 'team7', teamBId: 'team8', scoreA: 0, scoreB: 1, winnerId: 'team8', round: 'Round 1', status: 'finished', startTime: '2025-11-13T21:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },
  { id: 'swiss-r1-5', teamAId: 'team9', teamBId: 'team10', scoreA: 1, scoreB: 0, winnerId: 'team9', round: 'Round 1', status: 'finished', startTime: '2025-11-13T18:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },
  { id: 'swiss-r1-6', teamAId: 'team11', teamBId: 'team12', scoreA: 0, scoreB: 1, winnerId: 'team12', round: 'Round 1', status: 'finished', startTime: '2025-11-13T19:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },
  { id: 'swiss-r1-7', teamAId: 'team13', teamBId: 'team14', scoreA: 1, scoreB: 0, winnerId: 'team13', round: 'Round 1', status: 'finished', startTime: '2025-11-13T20:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },
  { id: 'swiss-r1-8', teamAId: 'team15', teamBId: 'team16', scoreA: 0, scoreB: 1, winnerId: 'team16', round: 'Round 1', status: 'finished', startTime: '2025-11-13T21:00:00Z', stage: 'swiss', swissRecord: '0-0', swissRound: 1, boFormat: 'BO1' },

  // ========== 第二轮：8场 BO3 (swissRound: 2) ==========
  // 1-0 组 (4场)
  { id: 'swiss-r2-1', teamAId: 'team1', teamBId: 'team5', scoreA: 2, scoreB: 0, winnerId: 'team1', round: 'Round 2', status: 'finished', startTime: '2025-11-14T18:00:00Z', stage: 'swiss', swissRecord: '1-0', swissRound: 2, boFormat: 'BO3' },
  { id: 'swiss-r2-2', teamAId: 'team9', teamBId: 'team13', scoreA: 2, scoreB: 1, winnerId: 'team9', round: 'Round 2', status: 'finished', startTime: '2025-11-14T19:00:00Z', stage: 'swiss', swissRecord: '1-0', swissRound: 2, boFormat: 'BO3' },
  { id: 'swiss-r2-3', teamAId: 'team4', teamBId: 'team8', scoreA: 2, scoreB: 1, winnerId: 'team4', round: 'Round 2', status: 'finished', startTime: '2025-11-14T20:00:00Z', stage: 'swiss', swissRecord: '1-0', swissRound: 2, boFormat: 'BO3' },
  { id: 'swiss-r2-4', teamAId: 'team12', teamBId: 'team16', scoreA: 2, scoreB: 0, winnerId: 'team12', round: 'Round 2', status: 'finished', startTime: '2025-11-14T21:00:00Z', stage: 'swiss', swissRecord: '1-0', swissRound: 2, boFormat: 'BO3' },
  // 0-1 组 (4场)
  { id: 'swiss-r2-5', teamAId: 'team2', teamBId: 'team6', scoreA: 2, scoreB: 1, winnerId: 'team2', round: 'Round 2', status: 'finished', startTime: '2025-11-14T18:00:00Z', stage: 'swiss', swissRecord: '0-1', swissRound: 2, boFormat: 'BO3' },
  { id: 'swiss-r2-6', teamAId: 'team3', teamBId: 'team7', scoreA: 2, scoreB: 0, winnerId: 'team3', round: 'Round 2', status: 'finished', startTime: '2025-11-14T19:00:00Z', stage: 'swiss', swissRecord: '0-1', swissRound: 2, boFormat: 'BO3' },
  { id: 'swiss-r2-7', teamAId: 'team10', teamBId: 'team14', scoreA: 1, scoreB: 2, winnerId: 'team14', round: 'Round 2', status: 'finished', startTime: '2025-11-14T20:00:00Z', stage: 'swiss', swissRecord: '0-1', swissRound: 2, boFormat: 'BO3' },
  { id: 'swiss-r2-8', teamAId: 'team11', teamBId: 'team15', scoreA: 0, scoreB: 2, winnerId: 'team15', round: 'Round 2', status: 'finished', startTime: '2025-11-14T21:00:00Z', stage: 'swiss', swissRecord: '0-1', swissRound: 2, boFormat: 'BO3' },

  // ========== 第三轮：8场 BO3 (swissRound: 3) ==========
  // 2-0 组 (2场)
  { id: 'swiss-r3-1', teamAId: 'team1', teamBId: 'team4', scoreA: 2, scoreB: 1, winnerId: 'team1', round: 'Round 3', status: 'finished', startTime: '2025-11-15T18:00:00Z', stage: 'swiss', swissRecord: '2-0', swissRound: 3, boFormat: 'BO3' },
  { id: 'swiss-r3-2', teamAId: 'team9', teamBId: 'team12', scoreA: 2, scoreB: 0, winnerId: 'team9', round: 'Round 3', status: 'finished', startTime: '2025-11-15T19:00:00Z', stage: 'swiss', swissRecord: '2-0', swissRound: 3, boFormat: 'BO3' },
  // 1-1 组 (4场)
  { id: 'swiss-r3-3', teamAId: 'team5', teamBId: 'team8', scoreA: 2, scoreB: 1, winnerId: 'team5', round: 'Round 3', status: 'finished', startTime: '2025-11-15T18:00:00Z', stage: 'swiss', swissRecord: '1-1', swissRound: 3, boFormat: 'BO3' },
  { id: 'swiss-r3-4', teamAId: 'team2', teamBId: 'team3', scoreA: 2, scoreB: 1, winnerId: 'team2', round: 'Round 3', status: 'finished', startTime: '2025-11-15T19:00:00Z', stage: 'swiss', swissRecord: '1-1', swissRound: 3, boFormat: 'BO3' },
  { id: 'swiss-r3-5', teamAId: 'team13', teamBId: 'team16', scoreA: 1, scoreB: 2, winnerId: 'team16', round: 'Round 3', status: 'finished', startTime: '2025-11-15T20:00:00Z', stage: 'swiss', swissRecord: '1-1', swissRound: 3, boFormat: 'BO3' },
  { id: 'swiss-r3-6', teamAId: 'team14', teamBId: 'team15', scoreA: 2, scoreB: 0, winnerId: 'team14', round: 'Round 3', status: 'finished', startTime: '2025-11-15T21:00:00Z', stage: 'swiss', swissRecord: '1-1', swissRound: 3, boFormat: 'BO3' },
  // 0-2 组 (2场)
  { id: 'swiss-r3-7', teamAId: 'team6', teamBId: 'team7', scoreA: 0, scoreB: 2, winnerId: 'team7', round: 'Round 3', status: 'finished', startTime: '2025-11-15T20:00:00Z', stage: 'swiss', swissRecord: '0-2', swissRound: 3, boFormat: 'BO3' },
  { id: 'swiss-r3-8', teamAId: 'team10', teamBId: 'team11', scoreA: 2, scoreB: 1, winnerId: 'team10', round: 'Round 3', status: 'finished', startTime: '2025-11-15T21:00:00Z', stage: 'swiss', swissRecord: '0-2', swissRound: 3, boFormat: 'BO3' },

  // ========== 第四轮：8场 BO3 (swissRound: 4) ==========
  // 3-0 组 (1场) - 提前晋级
  { id: 'swiss-r4-1', teamAId: 'team1', teamBId: 'team9', scoreA: 2, scoreB: 0, winnerId: 'team1', round: 'Round 4', status: 'finished', startTime: '2025-11-16T18:00:00Z', stage: 'swiss', swissRecord: '3-0', swissRound: 4, boFormat: 'BO3' },
  // 2-1 组 (3场) - 胜者晋级
  { id: 'swiss-r4-2', teamAId: 'team4', teamBId: 'team5', scoreA: 2, scoreB: 1, winnerId: 'team4', round: 'Round 4', status: 'finished', startTime: '2025-11-16T18:00:00Z', stage: 'swiss', swissRecord: '2-1', swissRound: 4, boFormat: 'BO3' },
  { id: 'swiss-r4-3', teamAId: 'team2', teamBId: 'team12', scoreA: 2, scoreB: 0, winnerId: 'team2', round: 'Round 4', status: 'finished', startTime: '2025-11-16T19:00:00Z', stage: 'swiss', swissRecord: '2-1', swissRound: 4, boFormat: 'BO3' },
  { id: 'swiss-r4-4', teamAId: 'team16', teamBId: 'team14', scoreA: 2, scoreB: 1, winnerId: 'team16', round: 'Round 4', status: 'finished', startTime: '2025-11-16T20:00:00Z', stage: 'swiss', swissRecord: '2-1', swissRound: 4, boFormat: 'BO3' },
  // 1-2 组 (3场) - 败者淘汰
  { id: 'swiss-r4-5', teamAId: 'team8', teamBId: 'team3', scoreA: 1, scoreB: 2, winnerId: 'team3', round: 'Round 4', status: 'finished', startTime: '2025-11-16T18:00:00Z', stage: 'swiss', swissRecord: '1-2', swissRound: 4, boFormat: 'BO3' },
  { id: 'swiss-r4-6', teamAId: 'team13', teamBId: 'team15', scoreA: 2, scoreB: 0, winnerId: 'team13', round: 'Round 4', status: 'finished', startTime: '2025-11-16T19:00:00Z', stage: 'swiss', swissRecord: '1-2', swissRound: 4, boFormat: 'BO3' },
  { id: 'swiss-r4-7', teamAId: 'team7', teamBId: 'team10', scoreA: 2, scoreB: 1, winnerId: 'team7', round: 'Round 4', status: 'finished', startTime: '2025-11-16T20:00:00Z', stage: 'swiss', swissRecord: '1-2', swissRound: 4, boFormat: 'BO3' },
  // 0-3 组 (1场) - 淘汰
  { id: 'swiss-r4-8', teamAId: 'team6', teamBId: 'team11', scoreA: 0, scoreB: 2, winnerId: 'team11', round: 'Round 4', status: 'finished', startTime: '2025-11-16T21:00:00Z', stage: 'swiss', swissRecord: '0-3', swissRound: 4, boFormat: 'BO3' },
];

// 淘汰赛7场比赛 (四分之一决赛4场 + 半决赛2场 + 决赛1场)
export const eliminationMatches: Match[] = [
  // 四分之一决赛 (4场) - top8: team1, team4, team9, team5, team2, team16, team14, team3
  { id: 'elim-qf-1', teamAId: 'team1', teamBId: 'team8', scoreA: 3, scoreB: 1, winnerId: 'team1', round: 'Quarterfinals', status: 'finished', startTime: '2025-11-17T18:00:00Z', stage: 'elimination', eliminationBracket: 'quarterfinals', boFormat: 'BO5' },
  { id: 'elim-qf-2', teamAId: 'team4', teamBId: 'team5', scoreA: 3, scoreB: 2, winnerId: 'team4', round: 'Quarterfinals', status: 'finished', startTime: '2025-11-17T19:00:00Z', stage: 'elimination', eliminationBracket: 'quarterfinals', boFormat: 'BO5' },
  { id: 'elim-qf-3', teamAId: 'team2', teamBId: 'team9', scoreA: 3, scoreB: 1, winnerId: 'team2', round: 'Quarterfinals', status: 'finished', startTime: '2025-11-18T18:00:00Z', stage: 'elimination', eliminationBracket: 'quarterfinals', boFormat: 'BO5' },
  { id: 'elim-qf-4', teamAId: 'team3', teamBId: 'team14', scoreA: 3, scoreB: 2, winnerId: 'team3', round: 'Quarterfinals', status: 'finished', startTime: '2025-11-18T19:00:00Z', stage: 'elimination', eliminationBracket: 'quarterfinals', boFormat: 'BO5' },
  // 半决赛 (2场)
  { id: 'elim-sf-1', teamAId: 'team1', teamBId: 'team4', scoreA: 3, scoreB: 2, winnerId: 'team1', round: 'Semifinals', status: 'finished', startTime: '2025-11-20T18:00:00Z', stage: 'elimination', eliminationBracket: 'semifinals', boFormat: 'BO5' },
  { id: 'elim-sf-2', teamAId: 'team2', teamBId: 'team16', scoreA: 3, scoreB: 1, winnerId: 'team2', round: 'Semifinals', status: 'finished', startTime: '2025-11-20T19:00:00Z', stage: 'elimination', eliminationBracket: 'semifinals', boFormat: 'BO5' },
  // 决赛 (1场)
  { id: 'elim-f-1', teamAId: 'team1', teamBId: 'team2', scoreA: 3, scoreB: 2, winnerId: 'team1', round: 'Finals', status: 'finished', startTime: '2025-11-22T18:00:00Z', stage: 'elimination', eliminationBracket: 'finals', boFormat: 'BO5' },
];

// 合并所有比赛
export const initialMatches: Match[] = [...swissMatches, ...eliminationMatches];

// 瑞士轮晋级结果
export const swissAdvancement = {
  top8: ['team1', 'team4', 'team9', 'team5', 'team2', 'team16', 'team14', 'team3'],
  eliminated: ['team7', 'team10', 'team6', 'team11', 'team13', 'team15', 'team8', 'team12'],
  rankings: [
    { teamId: 'team1', record: '4-0', rank: 1 },
    { teamId: 'team4', record: '3-1', rank: 2 },
    { teamId: 'team9', record: '3-1', rank: 3 },
    { teamId: 'team5', record: '3-1', rank: 4 },
    { teamId: 'team2', record: '3-1', rank: 5 },
    { teamId: 'team16', record: '3-1', rank: 6 },
    { teamId: 'team14', record: '2-2', rank: 7 },
    { teamId: 'team3', record: '2-2', rank: 8 },
    { teamId: 'team7', record: '2-2', rank: 9 },
    { teamId: 'team10', record: '1-3', rank: 10 },
    { teamId: 'team6', record: '1-3', rank: 11 },
    { teamId: 'team11', record: '1-3', rank: 12 },
    { teamId: 'team13', record: '1-3', rank: 13 },
    { teamId: 'team15', record: '1-3', rank: 14 },
    { teamId: 'team8', record: '0-4', rank: 15 },
    { teamId: 'team12', record: '0-4', rank: 16 },
  ],
};

export const initialStreamInfo: StreamInfo = {
  title: '驴酱杯 2025 - 总决赛',
  url: 'https://www.douyu.com/138243',
  isLive: true,
};
