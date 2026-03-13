/**
 * 直播测试数据
 */
import { mockStreamInfo } from './mock-data.fixture';

export interface Stream {
  title: string;
  url: string;
  isLive: boolean;
}

export const liveStream: Stream = {
  title: mockStreamInfo.title,
  url: mockStreamInfo.url,
  isLive: true,
};

export const offlineStream: Stream = {
  title: '驴酱杯 2025 - 精彩回顾',
  url: '',
  isLive: false,
};
