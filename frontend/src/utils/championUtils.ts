import championMap from '../data/lol-champion-map.json';

const CDN_BASE_URL = 'https://game.gtimg.cn/images/lol/act/img/champion';

const enToCnMap: Record<string, string> = championMap as Record<string, string>;

const cnToEnMap: Record<string, string> = Object.entries(enToCnMap).reduce(
  (acc, [en, cn]) => {
    acc[cn] = en;
    return acc;
  },
  {} as Record<string, string>
);

export function getChampionNameByEn(enName: string): string {
  return enToCnMap[enName] || enName;
}

export function getChampionNameToEn(): Record<string, string> {
  return cnToEnMap;
}

export function getChampionIconUrl(cnName: string): string {
  const enName = cnToEnMap[cnName];
  if (!enName) {
    return '';
  }
  return `${CDN_BASE_URL}/${enName}.png`;
}