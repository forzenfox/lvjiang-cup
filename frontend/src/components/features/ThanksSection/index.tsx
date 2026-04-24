import React from 'react';
import { MarqueeBanner } from './MarqueeBanner';
import { SpecialAwards } from './SpecialAwards';
import { StaffThanks } from './StaffThanks';
import type { SponsorConfig, StaffConfig, ThanksData } from '@/data/types';

declare global {
  interface Window {
    THANKS_DATA?: ThanksData;
  }
}

const thanksData: ThanksData = window.THANKS_DATA || { sponsors: [], staff: [] };

const sponsors: SponsorConfig[] = thanksData.sponsors || [];
const staff: StaffConfig[] = thanksData.staff || [];

export const ThanksSection: React.FC = () => {
  if (sponsors.length === 0 && staff.length === 0) return null;

  return (
    <section
      id="thanks"
      data-testid="thanks-section"
      className="relative min-h-[500px] py-16 md:py-24 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden"
    >
      {/* 背景装饰 - 网格 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(219, 39, 119, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(219, 39, 119, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* 背景装饰 - 光晕 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />

      {/* CRT 扫描线效果 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(219, 39, 119, 0.1) 2px, rgba(219, 39, 119, 0.1) 4px)',
          }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-10 md:mb-14">
          {/* 顶部装饰线 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-pink-500 to-amber-500" />
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span
                className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
            <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent via-pink-500 to-amber-500" />
          </div>

          <h2
            data-testid="thanks-section-title"
            className="text-2xl md:text-4xl font-bold tracking-wider"
            style={{
              fontFamily: 'Chakra Petch, sans-serif',
              background: 'linear-gradient(135deg, #F472B6 0%, #FBBF24 50%, #F472B6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(244, 114, 182, 0.3)',
            }}
          >
            ✦ 特别鸣谢 ✦
          </h2>

          <p
            className="mt-3 text-gray-400 text-sm md:text-base max-w-md mx-auto"
            style={{ fontFamily: 'Chakra Petch, sans-serif' }}
          >
            感谢每一位支持者的信任与陪伴
          </p>

          {/* 底部装饰线 */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-amber-500/50" />
            <span
              className="text-amber-500/40 text-xs tracking-[0.3em]"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              SPONSORS & STAFF
            </span>
            <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
        </div>

        {/* 弹幕区域 */}
        <div className="mb-6">
          <MarqueeBanner sponsors={sponsors} />
        </div>

        {/* 特殊奖项 */}
        <SpecialAwards sponsors={sponsors} />

        {/* 幕后工作人员 */}
        {staff.length > 0 && <StaffThanks staff={staff} />}

        {/* 底部装饰 */}
        <div className="mt-12 md:mt-16 flex items-center justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-pink-500/20 bg-black/40 backdrop-blur-sm">
            <span className="text-pink-400 text-lg">♥</span>
            <span
              className="text-gray-400 text-sm"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              再次感谢所有支持
            </span>
            <span className="text-amber-400 text-lg">♥</span>
          </div>
        </div>
      </div>
    </section>
  );
};
