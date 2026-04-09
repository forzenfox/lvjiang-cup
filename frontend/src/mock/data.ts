import { Team, Match, StreamInfo, Player } from '../types';

// 16支战队数据
export const initialTeams: Team[] = [
  // ========== 原有8支战队 ==========
  {
    id: 'team1',
    name: '驴酱',
    logo: 'https://picsum.photos/seed/donkey/200/200',
    battleCry: '驴酱战队',
    players: [
      { id: 'p1', nickname: '洞主', avatarUrl: 'https://robohash.org/dongzhu?set=set4&size=100x100', position: 'TOP', bio: '斗鱼138243', teamId: 'team1', gameId: 'douyu138243#0001', championPool: ['未来守护者·杰斯', '荒漠屠夫·雷克顿', '山隐之焰·奥恩'], rating: 95, isCaptain: true, liveUrl: 'https://www.douyu.com/138243', level: 'S' },
      { id: 'p2', nickname: '凯哥', avatarUrl: 'https://robohash.org/kaige?set=set4&size=100x100', position: 'JUNGLE', bio: '斗鱼138243', teamId: 'team1', gameId: 'douyu138243#0002', championPool: ['盲僧', '永猎双子·千珏', '法外狂徒·格雷福斯'], rating: 92, liveUrl: 'https://www.douyu.com/138243', level: 'A' },
      { id: 'p3', nickname: '啧啧', avatarUrl: 'https://robohash.org/zeze?set=set4&size=100x100', position: 'MID', bio: '操作细腻', teamId: 'team1', gameId: 'douyu138243#0003', championPool: ['离群之刺·阿卡丽', '解脱者·塞拉斯', '暮光星灵·佐伊'], rating: 94, liveUrl: 'https://www.douyu.com/138243', level: 'S' },
      { id: 'p4', nickname: '伏羲', avatarUrl: 'https://robohash.org/fuxi?set=set4&size=100x100', position: 'ADC', bio: '输出稳定', teamId: 'team1', gameId: 'douyu138243#0004', championPool: ['残月之肃·厄斐琉斯', '暴走萝莉·金克丝', '虚空之女·卡莎'], rating: 93, liveUrl: 'https://www.douyu.com/138243', level: 'A' },
      { id: 'p5', nickname: '小溪', avatarUrl: 'https://robohash.org/xiaoxi?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼8981206', teamId: 'team1', gameId: 'douyu8981206#0001', championPool: ['魂锁典狱长·锤石', '深海泰坦·诺提勒斯', '幻翎·洛'], rating: 90, liveUrl: 'https://www.douyu.com/8981206', level: 'A' },
    ],
  },
  {
    id: 'team2',
    name: 'IC',
    logo: 'https://picsum.photos/seed/icstar/200/200',
    battleCry: 'IC战队',
    players: [
      { id: 'p6', nickname: '余小C', avatarUrl: 'https://robohash.org/yuxiaoc?set=set4&size=100x100', position: 'TOP', bio: '斗鱼1126960', teamId: 'team2', gameId: 'douyu1126960#0001', championPool: ['青钢影·卡蜜尔', '腕豪·瑟提', '狂暴之心·凯南'], rating: 91, isCaptain: true, liveUrl: 'https://www.douyu.com/1126960', level: 'A' },
      { id: 'p7', nickname: '阿亮', avatarUrl: 'https://robohash.org/aliang?set=set4&size=100x100', position: 'JUNGLE', bio: '斗鱼1126960', teamId: 'team2', gameId: 'douyu1126960#0002', championPool: ['皮城执法官·蔚', '北地之怒·瑟庄妮', '水晶先锋·斯卡纳'], rating: 88, liveUrl: 'https://www.douyu.com/1126960', level: 'B' },
      { id: 'p8', nickname: '二泽', avatarUrl: 'https://robohash.org/erze?set=set4&size=100x100', position: 'MID', bio: '中路核心', teamId: 'team2', gameId: 'douyu1126960#0003', championPool: ['发条魔灵·奥莉安娜', '机械先驱·维克托', '暗黑元首·辛德拉'], rating: 93, liveUrl: 'https://www.douyu.com/1126960', level: 'A' },
      { id: 'p9', nickname: '恶意', avatarUrl: 'https://robohash.org/eyi?set=set4&size=100x100', position: 'ADC', bio: '激进射手', teamId: 'team2', gameId: 'douyu1126960#0004', championPool: ['荣耀行刑官·德莱文', '圣枪游侠·卢锡安', '沙漠玫瑰·莎弥拉'], rating: 94, liveUrl: 'https://www.douyu.com/1126960', level: 'S' },
      { id: 'p10', nickname: '阿瓜', avatarUrl: 'https://robohash.org/agua?set=set4&size=100x100', position: 'SUPPORT', bio: '团队大脑', teamId: 'team2', gameId: 'douyu1126960#0005', championPool: ['唤潮鲛姬·娜美', '风暴之怒·迦娜', '仙灵女巫·璐璐'], rating: 89, liveUrl: 'https://www.douyu.com/1126960', level: 'A' },
    ],
  },
  {
    id: 'team3',
    name: 'PLG',
    logo: 'https://picsum.photos/seed/plgwater/200/200',
    battleCry: 'PLG战队',
    players: [
      { id: 'p11', nickname: '泰妍', avatarUrl: 'https://robohash.org/taiyan?set=set4&size=100x100', position: 'TOP', bio: '稳健上路', teamId: 'team3', gameId: 'douyu4452132#0001', championPool: ['熔岩巨兽·墨菲特', '亡灵战神·赛恩', '扭曲树精·茂凯'], rating: 85, isCaptain: true, liveUrl: 'https://www.douyu.com/4452132', level: 'B' },
      { id: 'p12', nickname: '查理', avatarUrl: 'https://robohash.org/chali?set=set4&size=100x100', position: 'JUNGLE', bio: '节奏掌控', teamId: 'team3', gameId: 'douyu4452132#0002', championPool: ['战争之影·赫卡里姆', '永恒梦魇·魔腾', '虚空掠夺者·卡\'兹克'], rating: 87, liveUrl: 'https://www.douyu.com/4452132', level: 'B' },
      { id: 'p13', nickname: '二抛', avatarUrl: 'https://robohash.org/erpao?set=set4&size=100x100', position: 'MID', bio: '斗鱼4452132', teamId: 'team3', gameId: 'douyu4452132#0003', championPool: ['流浪法师·瑞兹', '魔蛇之拥·卡西奥佩娅', '虚空先知·玛尔扎哈'], rating: 86, liveUrl: 'https://www.douyu.com/4452132', level: 'B' },
      { id: 'p14', nickname: '芬达', avatarUrl: 'https://robohash.org/fenda?set=set4&size=100x100', position: 'ADC', bio: '后期大核', teamId: 'team3', gameId: 'douyu4452132#0004', championPool: ['战争女神·希维尔', '瘟疫之源·图奇', '深渊巨口·克格\'莫'], rating: 88, liveUrl: 'https://www.douyu.com/4452132', level: 'B' },
      { id: 'p15', nickname: '小唯', avatarUrl: 'https://robohash.org/xiaowei?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼8690608', teamId: 'team3', gameId: 'douyu8690608#0001', championPool: ['弗雷尔卓德之心·布隆', '深海泰坦·诺提勒斯', '牛头酋长·阿利斯塔'], rating: 84, liveUrl: 'https://www.douyu.com/8690608', level: 'C' },
    ],
  },
  {
    id: 'team4',
    name: '小熊',
    logo: 'https://picsum.photos/seed/xiaoxiong/200/200',
    battleCry: '小熊战队',
    players: [
      { id: 'p16', nickname: '小达', avatarUrl: 'https://robohash.org/xiaoda?set=set4&size=100x100', position: 'TOP', bio: '上路猛男', teamId: 'team4', gameId: 'douyu251783#0001', championPool: ['刀锋舞者·艾瑞莉娅', '无双剑姬·菲奥娜', '武器大师·贾克斯'], rating: 92, isCaptain: true, liveUrl: 'https://www.douyu.com/251783', level: 'A' },
      { id: 'p17', nickname: '老佳阳', avatarUrl: 'https://robohash.org/laojiayang?set=set4&size=100x100', position: 'JUNGLE', bio: '经验丰富', teamId: 'team4', gameId: 'douyu251783#0002', championPool: ['狂野女猎手·奈德丽', '蜘蛛女皇·伊莉丝', '时间刺客·艾克'], rating: 90, liveUrl: 'https://www.douyu.com/251783', level: 'A' },
      { id: 'p18', nickname: '银剑君', avatarUrl: 'https://robohash.org/yinjianjun?set=set4&size=100x100', position: 'MID', bio: '斗鱼251783', teamId: 'team4', gameId: 'douyu251783#0003', championPool: ['疾风剑豪·亚索', '封魔剑魂·永恩', '影流之主·劫'], rating: 91, liveUrl: 'https://www.douyu.com/251783', level: 'A' },
      { id: 'p19', nickname: '秃秃', avatarUrl: 'https://robohash.org/tutu?set=set4&size=100x100', position: 'ADC', bio: '稳定输出', teamId: 'team4', gameId: 'douyu251783#0004', championPool: ['逆羽·霞', '暗夜猎手·薇恩', '皮城女警·凯特琳'], rating: 89, liveUrl: 'https://www.douyu.com/251783', level: 'B' },
      { id: 'p20', nickname: '皮皮核桃', avatarUrl: 'https://robohash.org/pipihetao?set=set4&size=100x100', position: 'SUPPORT', bio: '保护型辅助', teamId: 'team4', gameId: 'douyu251783#0005', championPool: ['弗雷尔卓德之心·布隆', '暮光之眼·慎', '河流之王·塔姆·肯奇'], rating: 86, liveUrl: 'https://www.douyu.com/251783', level: 'B' },
    ],
  },
  {
    id: 'team5',
    name: '搓搓鸟',
    logo: 'https://picsum.photos/seed/cuocuoniao/200/200',
    battleCry: '搓搓鸟战队',
    players: [
      { id: 'p21', nickname: '法环', avatarUrl: 'https://robohash.org/fahuan?set=set4&size=100x100', position: 'TOP', bio: '上路法王', teamId: 'team5', gameId: 'douyu2057760#0001', championPool: ['放逐之刃·锐雯', '机械公敌·兰博', '迷失之牙·纳尔'], rating: 90, isCaptain: true, liveUrl: 'https://www.douyu.com/2057760', level: 'A' },
      { id: 'p22', nickname: '大本猪', avatarUrl: 'https://robohash.org/dabenzhu?set=set4&size=100x100', position: 'JUNGLE', bio: '肉盾型打野', teamId: 'team5', gameId: 'douyu2057760#0002', championPool: ['生化魔人·扎克', '披甲龙龟·拉莫斯', '狂战士·奥拉夫'], rating: 85, liveUrl: 'https://www.douyu.com/2057760', level: 'B' },
      { id: 'p23', nickname: '格局', avatarUrl: 'https://robohash.org/geju?set=set4&size=100x100', position: 'MID', bio: '斗鱼2057760', teamId: 'team5', gameId: 'douyu2057760#0003', championPool: ['卡牌大师·崔斯特', '正义巨像·加里奥', '岩雀·塔莉垭'], rating: 88, liveUrl: 'https://www.douyu.com/2057760', level: 'B' },
      { id: 'p24', nickname: 'xlbos', avatarUrl: 'https://robohash.org/xlbos?set=set4&size=100x100', position: 'ADC', bio: '技术流', teamId: 'team5', gameId: 'douyu2057760#0004', championPool: ['赏金猎人·厄运小姐', '戏命师·烬', '寒冰射手·艾希'], rating: 87, liveUrl: 'https://www.douyu.com/2057760', level: 'B' },
      { id: 'p25', nickname: '年年', avatarUrl: 'https://robohash.org/niannian?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼12619385', teamId: 'team5', gameId: 'douyu12619385#0001', championPool: ['蒸汽机器人·布里茨', '魂锁典狱长·锤石', '复仇焰魂·布兰德'], rating: 86, liveUrl: 'https://www.douyu.com/12619385', level: 'B' },
    ],
  },
  {
    id: 'team6',
    name: '100J',
    logo: 'https://picsum.photos/seed/100j/200/200',
    battleCry: '100J战队',
    players: [
      { id: 'p26', nickname: '十六夜', avatarUrl: 'https://robohash.org/shiliuye?set=set4&size=100x100', position: 'TOP', bio: '夜猫子选手', teamId: 'team6', gameId: 'douyu3863752#0001', championPool: ['猩红收割者·弗拉基米尔', '狂暴之心·凯南', '暮光之眼·慎'], rating: 86, isCaptain: true, liveUrl: 'https://www.douyu.com/3863752', level: 'B' },
      { id: 'p27', nickname: '小甜椒', avatarUrl: 'https://robohash.org/xiaotianjiao?set=set4&size=100x100', position: 'JUNGLE', bio: '斗鱼3863752', teamId: 'team6', gameId: 'douyu3863752#0002', championPool: ['德玛西亚皇子·嘉文四世', '酒桶·古拉加斯', '虚空遁地兽·雷克塞'], rating: 84, liveUrl: 'https://www.douyu.com/3863752', level: 'C' },
      { id: 'p28', nickname: '温柔遍野', avatarUrl: 'https://robohash.org/wenroubianye?set=set4&size=100x100', position: 'MID', bio: '温柔打法', teamId: 'team6', gameId: 'douyu3863752#0003', championPool: ['时光守护者·基兰', '死亡颂唱者·卡尔萨斯', '邪恶小法师·维迦'], rating: 83, liveUrl: 'https://www.douyu.com/3863752', level: 'C' },
      { id: 'p29', nickname: '团子', avatarUrl: 'https://robohash.org/tuanzi?set=set4&size=100x100', position: 'ADC', bio: '斗鱼1580850', teamId: 'team6', gameId: 'douyu1580850#0001', championPool: ['战争女神·希维尔', '涤魂圣枪·赛娜', '探险家·伊泽瑞尔'], rating: 85, liveUrl: 'https://www.douyu.com/1580850', level: 'C' },
      { id: 'p30', nickname: '柚柚子', avatarUrl: 'https://robohash.org/youyouzi?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼12661677', teamId: 'team6', gameId: 'douyu12661677#0001', championPool: ['众星之子·索拉卡', '琴瑟仙女·娑娜', '万花通灵·妮蔻'], rating: 82, liveUrl: 'https://www.douyu.com/12661677', level: 'C' },
    ],
  },
  {
    id: 'team7',
    name: '69',
    logo: 'https://picsum.photos/seed/69team/200/200',
    battleCry: '69战队',
    players: [
      { id: 'p31', nickname: '尊师HKL', avatarUrl: 'https://robohash.org/zunshihkl?set=set4&size=100x100', position: 'TOP', bio: '导师型选手', teamId: 'team7', gameId: 'douyu10902240#0001', championPool: ['扭曲树精·茂凯', '圣锤之毅·波比', '暮光之眼·慎'], rating: 82, isCaptain: true, liveUrl: 'https://www.douyu.com/10902240', level: 'C' },
      { id: 'p32', nickname: '大B脸', avatarUrl: 'https://robohash.org/dabilian?set=set4&size=100x100', position: 'JUNGLE', bio: '幽默担当', teamId: 'team7', gameId: 'douyu10902240#0002', championPool: ['无极剑圣·易', '德邦总管·赵信', '蛮族之王·泰达米尔'], rating: 80, liveUrl: 'https://www.douyu.com/10902240', level: 'D' },
      { id: 'p33', nickname: '可乐', avatarUrl: 'https://robohash.org/kele?set=set4&size=100x100', position: 'MID', bio: '快乐游戏', teamId: 'team7', gameId: 'douyu10902240#0003', championPool: ['疾风剑豪·亚索', '海洋之灾·普朗克', '刀锋之影·泰隆'], rating: 81, liveUrl: 'https://www.douyu.com/10902240', level: 'D' },
      { id: 'p34', nickname: '咬人鹅', avatarUrl: 'https://robohash.org/yaorene?set=set4&size=100x100', position: 'ADC', bio: '斗鱼10902240', teamId: 'team7', gameId: 'douyu10902240#0004', championPool: ['迅捷斥候·提莫', '恶魔小丑·萨科', '暗夜猎手·薇恩'], rating: 79, liveUrl: 'https://www.douyu.com/10902240', level: 'D' },
      { id: 'p35', nickname: '阿松', avatarUrl: 'https://robohash.org/asong?set=set4&size=100x100', position: 'SUPPORT', bio: '稳健辅助', teamId: 'team7', gameId: 'douyu10902240#0005', championPool: ['德玛西亚之力·盖伦', '德邦总管·赵信', '祖安狂人·蒙多医生'], rating: 78, liveUrl: 'https://www.douyu.com/10902240', level: 'D' },
    ],
  },
  {
    id: 'team8',
    name: '雨酱',
    logo: 'https://picsum.photos/seed/yujiang/200/200',
    battleCry: '雨酱战队',
    players: [
      { id: 'p36', nickname: '想和哥俩玩游戏', avatarUrl: 'https://robohash.org/xiangwan?set=set4&size=100x100', position: 'TOP', bio: '社交达人', teamId: 'team8', gameId: 'douyu9779433#0001', championPool: ['炼金术士·辛吉德', '迅捷斥候·提莫', '暗夜猎手·薇恩'], rating: 84, isCaptain: true, liveUrl: 'https://www.douyu.com/9779433', level: 'C' },
      { id: 'p37', nickname: '慧琳宝', avatarUrl: 'https://robohash.org/huilinbao?set=set4&size=100x100', position: 'JUNGLE', bio: '宝藏选手', teamId: 'team8', gameId: 'douyu9779433#0002', championPool: ['瘟疫之源·图奇', '翠神·艾翁', '雪原双子·努努和威朗普'], rating: 83, liveUrl: 'https://www.douyu.com/9779433', level: 'C' },
      { id: 'p38', nickname: '辰林', avatarUrl: 'https://robohash.org/chenlin?set=set4&size=100x100', position: 'MID', bio: '森林之子', teamId: 'team8', gameId: 'douyu9779433#0003', championPool: ['扭曲树精·茂凯', '翠神·艾翁', '雪原双子·努努和威朗普'], rating: 82, liveUrl: 'https://www.douyu.com/9779433', level: 'C' },
      { id: 'p39', nickname: '暴龙战士', avatarUrl: 'https://robohash.org/baolong?set=set4&size=100x100', position: 'ADC', bio: '斗鱼9779433', teamId: 'team8', gameId: 'douyu9779433#0004', championPool: ['圣枪游侠·卢锡安', '暗夜猎手·薇恩', '荣耀行刑官·德莱文'], rating: 84, liveUrl: 'https://www.douyu.com/9779433', level: 'C' },
      { id: 'p40', nickname: '冯雨', avatarUrl: 'https://robohash.org/fengyu?set=set4&size=100x100', position: 'SUPPORT', bio: '斗鱼317422', teamId: 'team8', gameId: 'douyu317422#0001', championPool: ['风暴之怒·迦娜', '仙灵女巫·璐璐', '琴瑟仙女·娑娜'], rating: 83, liveUrl: 'https://www.douyu.com/317422', level: 'C' },
    ],
  },
  // ========== 新增8支战队 ==========
  {
    id: 'team9',
    name: '星辰',
    logo: 'https://picsum.photos/seed/star/200/200',
    battleCry: '星辰战队',
    players: [
      { id: 'p41', nickname: '星河', avatarUrl: 'https://robohash.org/xinghe?set=set4&size=100x100', position: 'TOP', bio: '星光上路', teamId: 'team9', gameId: 'star0001', championPool: ['正义天使·凯尔', '正义天使·凯尔', '放逐之刃·锐雯'], rating: 91, isCaptain: true, level: 'A' },
      { id: 'p42', nickname: '闪烁', avatarUrl: 'https://robohash.org/shanshan?set=set4&size=100x100', position: 'JUNGLE', bio: '打野新星', teamId: 'team9', gameId: 'star0002', championPool: ['法外狂徒·格雷福斯', '虚空掠夺者·卡\'兹克', '傲之追猎者·雷恩加尔'], rating: 89, level: 'B' },
      { id: 'p43', nickname: '流星', avatarUrl: 'https://robohash.org/liuxing?set=set4&size=100x100', position: 'MID', bio: '中单新秀', teamId: 'team9', gameId: 'star0003', championPool: ['铸星龙王·奥瑞利安·索尔', '虚空先知·玛尔扎哈', '机械先驱·维克托'], rating: 90, level: 'A' },
      { id: 'p44', nickname: '彗星', avatarUrl: 'https://robohash.org/huixing?set=set4&size=100x100', position: 'ADC', bio: '精准射手', teamId: 'team9', gameId: 'star0004', championPool: ['惩戒之箭·韦鲁斯', '寒冰射手·艾希', '皮城女警·凯特琳'], rating: 88, level: 'B' },
      { id: 'p45', nickname: '夜空', avatarUrl: 'https://robohash.org/yekong?set=set4&size=100x100', position: 'SUPPORT', bio: '夜空守护', teamId: 'team9', gameId: 'star0005', championPool: ['幻翎·洛', '唤潮鲛姬·娜美', '天启者·卡尔玛'], rating: 87, level: 'B' },
    ],
  },
  {
    id: 'team10',
    name: '烈焰',
    logo: 'https://picsum.photos/seed/fire/200/200',
    battleCry: '烈焰战队',
    players: [
      { id: 'p46', nickname: '火焰', avatarUrl: 'https://robohash.org/huoyan?set=set4&size=100x100', position: 'TOP', bio: '烈焰上路', teamId: 'team10', gameId: 'fire0001', championPool: ['机械公敌·兰博', '机械公敌·兰博', '机械公敌·兰博'], rating: 90, isCaptain: true, level: 'A' },
      { id: 'p47', nickname: '燃烧', avatarUrl: 'https://robohash.org/ranshao?set=set4&size=100x100', position: 'JUNGLE', bio: '燃烧打野', teamId: 'team10', gameId: 'fire0002', championPool: ['复仇焰魂·布兰德', '末日使者·费德提克', '永恒梦魇·魔腾'], rating: 86, level: 'B' },
      { id: 'p48', nickname: '炽热', avatarUrl: 'https://robohash.org/chire?set=set4&size=100x100', position: 'MID', bio: '中单强者', teamId: 'team10', gameId: 'fire0003', championPool: ['黑暗之女·安妮', '黑暗之女·安妮', '流浪法师·瑞兹'], rating: 89, level: 'B' },
      { id: 'p49', nickname: '烈焰', avatarUrl: 'https://robohash.org/lieyan?set=set4&size=100x100', position: 'ADC', bio: '火焰射手', teamId: 'team10', gameId: 'fire0004', championPool: ['赏金猎人·厄运小姐', '戏命师·烬', '赏金猎人·厄运小姐'], rating: 87, level: 'B' },
      { id: 'p50', nickname: '灰烬', avatarUrl: 'https://robohash.org/huijin?set=set4&size=100x100', position: 'SUPPORT', bio: '辅助新星', teamId: 'team10', gameId: 'fire0005', championPool: ['复仇焰魂·布兰德', '机械公敌·兰博', '涤魂圣枪·尼菈'], rating: 85, level: 'C' },
    ],
  },
  {
    id: 'team11',
    name: '寒冰',
    logo: 'https://picsum.photos/seed/ice/200/200',
    battleCry: '寒冰战队',
    players: [
      { id: 'p51', nickname: '冰霜', avatarUrl: 'https://robohash.org/bingshuang?set=set4&size=100x100', position: 'TOP', bio: '冰封上路', teamId: 'team11', gameId: 'ice0001', championPool: ['冰霜女巫·丽桑卓', '圣锤之毅·波比', '深海泰坦·诺提勒斯'], rating: 88, isCaptain: true, level: 'B' },
      { id: 'p52', nickname: '雪花', avatarUrl: 'https://robohash.org/xuehua?set=set4&size=100x100', position: 'JUNGLE', bio: '雪花打野', teamId: 'team11', gameId: 'ice0002', championPool: ['寒冰射手·艾希', '冰晶凤凰·艾尼维亚', '扭曲树精·茂凯'], rating: 85, level: 'C' },
      { id: 'p53', nickname: '寒流', avatarUrl: 'https://robohash.org/hanliu?set=set4&size=100x100', position: 'MID', bio: '寒冰中单', teamId: 'team11', gameId: 'ice0003', championPool: ['冰晶凤凰·艾尼维亚', '发条魔灵·奥莉安娜', '机械先驱·维克托'], rating: 86, level: 'B' },
      { id: 'p54', nickname: '冰川', avatarUrl: 'https://robohash.org/bingchuan?set=set4&size=100x100', position: 'ADC', bio: '冰川射手', teamId: 'team11', gameId: 'ice0004', championPool: ['寒冰射手·艾希', '惩戒之箭·韦鲁斯', '寒冰射手·艾希'], rating: 87, level: 'B' },
      { id: 'p55', nickname: '极光', avatarUrl: 'https://robohash.org/jiguang?set=set4&size=100x100', position: 'SUPPORT', bio: '极光守护', teamId: 'team11', gameId: 'ice0005', championPool: ['冰霜女巫·丽桑卓', '风暴之怒·迦娜', '仙灵女巫·璐璐'], rating: 86, level: 'B' },
    ],
  },
  {
    id: 'team12',
    name: '雷霆',
    logo: 'https://picsum.photos/seed/thunder/200/200',
    battleCry: '雷霆战队',
    players: [
      { id: 'p56', nickname: '闪电', avatarUrl: 'https://robohash.org/shandian?set=set4&size=100x100', position: 'TOP', bio: '闪电上路', teamId: 'team12', gameId: 'thunder0001', championPool: ['刀锋舞者·艾瑞莉娅', '青钢影·卡蜜尔', '雷霆咆哮·沃利贝尔'], rating: 89, isCaptain: true, level: 'B' },
      { id: 'p57', nickname: '雷鸣', avatarUrl: 'https://robohash.org/leiming?set=set4&size=100x100', position: 'JUNGLE', bio: '雷鸣打野', teamId: 'team12', gameId: 'thunder0002', championPool: ['傲之追猎者·雷恩加尔', '虚空掠夺者·卡\'兹克', '虚空遁地兽·雷克塞'], rating: 87, level: 'B' },
      { id: 'p58', nickname: '电场', avatarUrl: 'https://robohash.org/dianchang?set=set4&size=100x100', position: 'MID', bio: '电场中单', teamId: 'team12', gameId: 'thunder0003', championPool: ['机械先驱·维克托', '暮光星灵·佐伊', '暗黑元首·辛德拉'], rating: 88, level: 'B' },
      { id: 'p59', nickname: '电荷', avatarUrl: 'https://robohash.org/dianhe?set=set4&size=100x100', position: 'ADC', bio: '电荷射手', teamId: 'team12', gameId: 'thunder0004', championPool: ['暴走萝莉·金克丝', '赏金猎人·厄运小姐', '英勇投弹手·库奇'], rating: 86, level: 'B' },
      { id: 'p60', nickname: '云端', avatarUrl: 'https://robohash.org/yunduan?set=set4&size=100x100', position: 'SUPPORT', bio: '云端辅助', teamId: 'team12', gameId: 'thunder0005', championPool: ['雷霆咆哮·沃利贝尔', '风暴之怒·迦娜', '仙灵女巫·璐璐'], rating: 85, level: 'C' },
    ],
  },
  {
    id: 'team13',
    name: '暗影',
    logo: 'https://picsum.photos/seed/shadow/200/200',
    battleCry: '暗影战队',
    players: [
      { id: 'p61', nickname: '影子', avatarUrl: 'https://robohash.org/yingzi?set=set4&size=100x100', position: 'TOP', bio: '暗影上路', teamId: 'team13', gameId: 'shadow0001', championPool: ['刀锋之影·泰隆', '影流之主·劫', '法外狂徒·格雷福斯'], rating: 88, isCaptain: true, level: 'B' },
      { id: 'p62', nickname: '幽灵', avatarUrl: 'https://robohash.org/youlong?set=set4&size=100x100', position: 'JUNGLE', bio: '幽灵打野', teamId: 'team13', gameId: 'shadow0002', championPool: ['永恒梦魇·魔腾', '瘟疫之源·图奇', '傲之追猎者·雷恩加尔'], rating: 86, level: 'B' },
      { id: 'p63', nickname: '黑夜', avatarUrl: 'https://robohash.org/heiye?set=set4&size=100x100', position: 'MID', bio: '黑夜中单', teamId: 'team13', gameId: 'shadow0003', championPool: ['暗黑元首·辛德拉', '影流之主·劫', '虚空行者·卡萨丁'], rating: 87, level: 'B' },
      { id: 'p64', nickname: '暗夜', avatarUrl: 'https://robohash.org/anye?set=set4&size=100x100', position: 'ADC', bio: '暗夜射手', teamId: 'team13', gameId: 'shadow0004', championPool: ['暗夜猎手·薇恩', '虚空之女·卡莎', '圣枪游侠·卢锡安'], rating: 86, level: 'B' },
      { id: 'p65', nickname: '迷雾', avatarUrl: 'https://robohash.org/miwnu?set=set4&size=100x100', position: 'SUPPORT', bio: '迷雾守护', teamId: 'team13', gameId: 'shadow0005', championPool: ['血港鬼影·派克', '深海泰坦·诺提勒斯', '诺克萨斯之手·德莱厄斯'], rating: 84, level: 'C' },
    ],
  },
  {
    id: 'team14',
    name: '疾风',
    logo: 'https://picsum.photos/seed/wind/200/200',
    battleCry: '疾风战队',
    players: [
      { id: 'p66', nickname: '风暴', avatarUrl: 'https://robohash.org/fengbao?set=set4&size=100x100', position: 'TOP', bio: '风暴上路', teamId: 'team14', gameId: 'wind0001', championPool: ['疾风剑豪·亚索', '疾风剑豪·亚索', '封魔剑魂·永恩'], rating: 90, isCaptain: true, level: 'A' },
      { id: 'p67', nickname: '飓风', avatarUrl: 'https://robohash.org/jufeng?set=set4&size=100x100', position: 'JUNGLE', bio: '飓风打野', teamId: 'team14', gameId: 'wind0002', championPool: ['皮城执法官·蔚', '德邦总管·赵信', '武器大师·贾克斯'], rating: 87, level: 'B' },
      { id: 'p68', nickname: '微风', avatarUrl: 'https://robohash.org/weifeng?set=set4&size=100x100', position: 'MID', bio: '微风中单', teamId: 'team14', gameId: 'wind0003', championPool: ['疾风剑豪·亚索', '影流之主·劫', '封魔剑魂·永恩'], rating: 88, level: 'B' },
      { id: 'p69', nickname: '狂风', avatarUrl: 'https://robohash.org/kuangfeng?set=set4&size=100x100', position: 'ADC', bio: '狂风射手', teamId: 'team14', gameId: 'wind0004', championPool: ['复仇之矛·卡莉斯塔', '暗夜猎手·薇恩', '圣枪游侠·卢锡安'], rating: 86, level: 'B' },
      { id: 'p70', nickname: '清风', avatarUrl: 'https://robohash.org/qingfeng?set=set4&size=100x100', position: 'SUPPORT', bio: '清风辅助', teamId: 'team14', gameId: 'wind0005', championPool: ['风暴之怒·迦娜', '唤潮鲛姬·娜美', '幻翎·洛'], rating: 85, level: 'C' },
    ],
  },
  {
    id: 'team15',
    name: '巨石',
    logo: 'https://picsum.photos/seed/rock/200/200',
    battleCry: '巨石战队',
    players: [
      { id: 'p71', nickname: '岩石', avatarUrl: 'https://robohash.org/yanshi?set=set4&size=100x100', position: 'TOP', bio: '岩石上路', teamId: 'team15', gameId: 'rock0001', championPool: ['熔岩巨兽·墨菲特', '山隐之焰·奥恩', '扭曲树精·茂凯'], rating: 86, isCaptain: true, level: 'C' },
      { id: 'p72', nickname: '山岳', avatarUrl: 'https://robohash.org/shanyue?set=set4&size=100x100', position: 'JUNGLE', bio: '山岳打野', teamId: 'team15', gameId: 'rock0002', championPool: ['生化魔人·扎克', '披甲龙龟·拉莫斯', '殇之木乃伊·阿木木'], rating: 84, level: 'C' },
      { id: 'p73', nickname: '砂石', avatarUrl: 'https://robohash.org/shashi?set=set4&size=100x100', position: 'MID', bio: '砂石中单', teamId: 'team15', gameId: 'rock0003', championPool: ['虚空先知·玛尔扎哈', '流浪法师·瑞兹', '卡牌大师·崔斯特'], rating: 85, level: 'C' },
      { id: 'p74', nickname: '碎石', avatarUrl: 'https://robohash.org/suishi?set=set4&size=100x100', position: 'ADC', bio: '碎石射手', teamId: 'team15', gameId: 'rock0004', championPool: ['战争女神·希维尔', '惩戒之箭·韦鲁斯', '寒冰射手·艾希'], rating: 84, level: 'C' },
      { id: 'p75', nickname: '岩壁', avatarUrl: 'https://robohash.org/yanbi?set=set4&size=100x100', position: 'SUPPORT', bio: '岩壁辅助', teamId: 'team15', gameId: 'rock0005', championPool: ['深海泰坦·诺提勒斯', '弗雷尔卓德之心·布隆', '牛头酋长·阿利斯塔'], rating: 83, level: 'D' },
    ],
  },
  {
    id: 'team16',
    name: '深海',
    logo: 'https://picsum.photos/seed/ocean/200/200',
    battleCry: '深海战队',
    players: [
      { id: 'p76', nickname: '海浪', avatarUrl: 'https://robohash.org/hailang?set=set4&size=100x100', position: 'TOP', bio: '海浪上路', teamId: 'team16', gameId: 'ocean0001', championPool: ['海洋之灾·普朗克', '俄洛伊', '海洋之灾·普朗克'], rating: 89, isCaptain: true, level: 'A' },
      { id: 'p77', nickname: '潮汐', avatarUrl: 'https://robohash.org/chaoxi?set=set4&size=100x100', position: 'JUNGLE', bio: '潮汐打野', teamId: 'team16', gameId: 'ocean0002', championPool: ['潮汐海灵·菲兹', '潮汐海灵·菲兹', '蜘蛛女皇·伊莉丝'], rating: 88, level: 'B' },
      { id: 'p78', nickname: '珊瑚', avatarUrl: 'https://robohash.org/shanhu?set=set4&size=100x100', position: 'MID', bio: '珊瑚中单', teamId: 'team16', gameId: 'ocean0003', championPool: ['潮汐海灵·菲兹', '虚空行者·卡萨丁', '时间刺客·艾克'], rating: 87, level: 'B' },
      { id: 'p79', nickname: '海龟', avatarUrl: 'https://robohash.org/haigui?set=set4&size=100x100', position: 'ADC', bio: '海龟射手', teamId: 'team16', gameId: 'ocean0004', championPool: ['涤魂圣枪·尼菈', '战争女神·希维尔', '麦林炮手·崔丝塔娜'], rating: 86, level: 'B' },
      { id: 'p80', nickname: '珍珠', avatarUrl: 'https://robohash.org/zhenzhu?set=set4&size=100x100', position: 'SUPPORT', bio: '珍珠辅助', teamId: 'team16', gameId: 'ocean0005', championPool: ['唤潮鲛姬·娜美', '幻翎·洛', '风暴之怒·迦娜'], rating: 85, level: 'C' },
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
