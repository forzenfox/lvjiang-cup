export const COVER_IMAGES = {
  pc: {
    background1: '//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg1.jpg',
    background2: '//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg2.jpg',
    slogan: '//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic1.png',
    logo: '//game.gtimg.cn/images/lpl/act/a20250822s15/start-box-pic2.png',
    scrollTip: '//game.gtimg.cn/images/lpl/act/a20250822s15/glide-tip.png',
  },
  mobile: {
    background1: '//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg1.jpg',
    background2: '//game.gtimg.cn/images/lpl/act/a20250822s15/start-bg2.jpg',
    slogan: '//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic1.png',
    logo: '//game.gtimg.cn/images/lpl/act/a20250822s15/m/start-box-pic2.png',
    scrollTip: '//game.gtimg.cn/images/lpl/act/a20250822s15/glide-tip.png',
  },
} as const;

export const MOBILE_BG_POSITION = {
  background1: '60% 50%',
  background2: '30% 50%',
} as const;

export const ANIMATION_CONFIG = {
  carouselInterval: 3000,
  exitDuration: 900,
  scrollTipBounceDuration: 1.6,
  touchThreshold: 50,
} as const;
