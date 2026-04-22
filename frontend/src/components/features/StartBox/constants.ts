const DEFAULT_GITHUB_CDN_BASE = 'https://cdn.jsdmirror.com/gh/forzenfox/lvjiang-cup@main';
const GITHUB_CDN_BASE = window.APP_CONFIG?.GITHUB_CDN_BASE || DEFAULT_GITHUB_CDN_BASE;
const LOCAL_BASE = '/assets';

export interface CoverImage {
  cdn: string;
  local: string;
}

type CoverImagesRecord = Record<'pc' | 'mobile', readonly CoverImage[]>;
type CoverImageFileNames = Record<'pc' | 'mobile', readonly string[]>;

function buildCoverImages(fileNames: CoverImageFileNames): CoverImagesRecord {
  return {
    pc: fileNames.pc.map(fileName => ({
      cdn: `${GITHUB_CDN_BASE}/assets/${fileName}`,
      local: `${LOCAL_BASE}/${fileName}`,
    })),
    mobile: fileNames.mobile.map(fileName => ({
      cdn: `${GITHUB_CDN_BASE}/assets/${fileName}`,
      local: `${LOCAL_BASE}/${fileName}`,
    })),
  };
}

const DEFAULT_COVER_IMAGES: CoverImagesRecord = buildCoverImages({
  pc: ['cover_01.webp', 'cover_02.webp', 'cover_03.webp', 'cover_04.webp'],
  mobile: ['mobile_cover_01.webp'],
});

const appConfigImages = window.APP_CONFIG?.COVER_IMAGES as CoverImageFileNames | undefined;
export const COVER_IMAGES: CoverImagesRecord = appConfigImages
  ? buildCoverImages(appConfigImages)
  : DEFAULT_COVER_IMAGES;

export const COVER_BACKGROUNDS: Record<'pc' | 'mobile', readonly string[]> = {
  pc: COVER_IMAGES.pc.map(img => img.cdn),
  mobile: COVER_IMAGES.mobile.map(img => img.cdn),
};

export const SCROLL_TIP_IMAGE = '/glide-tip.png';

export const ANIMATION_CONFIG = {
  carouselInterval: 3000,
  exitDuration: 900,
  touchThreshold: 50,
} as const;
