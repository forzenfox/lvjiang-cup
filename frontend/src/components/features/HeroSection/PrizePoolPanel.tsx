import React, { useEffect, useRef, useState } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { StarBurst, TrophyIcon } from '../ThanksSection/DecorativeIcons';
import type { PrizePoolData } from '@/data/types';

/**
 * 金额格式化工具函数
 */
function formatAmount(amount: number): string {
  if (amount <= 0) return '¥0';
  return `¥${amount.toLocaleString('zh-CN')}`;
}

/**
 * 数字滚动动画组件
 * 使用 framer-motion 的 useMotionValue + useTransform 实现从0到目标值的滚动效果
 * 在测试环境中(jsdom)直接渲染目标值
 */
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  useTransform(count, latest => `¥${Math.round(latest).toLocaleString('zh-CN')}`);
  const [displayValue, setDisplayValue] = useState('¥0');

  useEffect(() => {
    // 先注册监听器，确保能捕获到 animate 触发的所有值变化
    const unsubscribe = count.on('change', latest => {
      setDisplayValue(`¥${Math.round(latest).toLocaleString('zh-CN')}`);
    });
    return unsubscribe;
  }, [count]);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: 'easeOut' });
    return controls.stop;
  }, [count, value]);

  return <motion.span aria-live="polite">{displayValue}</motion.span>;
};

/**
 * 奖金池标题组件
 */
const PrizePoolTitle: React.FC<{ total: number }> = ({ total }) => (
  <div data-testid="prize-pool-title" className="text-center mb-6 md:mb-8">
    <h2
      className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide mb-3"
      style={{
        fontFamily: 'Chakra Petch, sans-serif',
        background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      <StarBurst
        size={20}
        className="inline-block text-amber-400 mr-2"
        style={{ WebkitTextFillColor: 'initial' }}
      />
      赛事奖金池
      <StarBurst
        size={20}
        className="inline-block text-amber-400 ml-2"
        style={{ WebkitTextFillColor: 'initial' }}
      />
    </h2>
    <div
      className="text-3xl md:text-4xl lg:text-5xl font-black tabular-nums"
      style={{
        fontFamily: 'Chakra Petch, sans-serif',
        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      <AnimatedNumber value={total} />
    </div>
  </div>
);

/**
 * 冠军/亚军奖金子卡片
 */
const PrizeSubCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  amount: number;
  ratio: string;
  testId: string;
}> = ({ icon, label, amount, ratio, testId }) => (
  <div
    data-testid={testId}
    className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-black/40 border border-amber-500/10 hover:border-amber-500/30 transition-all duration-300"
  >
    <div className="flex items-center gap-2">
      {icon}
      <span
        className="text-xs md:text-sm text-amber-400 font-semibold"
        style={{ fontFamily: 'Chakra Petch, sans-serif' }}
      >
        {label} {ratio}
      </span>
    </div>
    <div
      className="text-lg md:text-xl font-bold tabular-nums"
      style={{
        fontFamily: 'Chakra Petch, sans-serif',
        color: '#FBBF24',
      }}
    >
      {formatAmount(amount)}
    </div>
  </div>
);

/**
 * 常规奖金卡片组件
 */
const RegularPrizeCard: React.FC<{
  total: number;
  champion: number;
  runnerUp: number;
  championRatio?: number;
  runnerUpRatio?: number;
}> = ({ total, champion, runnerUp, championRatio, runnerUpRatio }) => (
  <div
    data-testid="regular-prize-card"
    className="relative h-full p-5 md:p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-800/80 backdrop-blur-md overflow-hidden group hover:border-amber-500/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
  >
    {/* CRT 扫描线效果 */}
    <div className="absolute inset-0 pointer-events-none opacity-5">
      <div
        className="w-full h-full"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245, 158, 11, 0.03) 2px, rgba(245, 158, 11, 0.03) 4px)',
        }}
      />
    </div>

    {/* 霓虹光晕边框 */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        boxShadow: 'inset 0 0 30px rgba(245, 158, 11, 0.1), 0 0 40px rgba(245, 158, 11, 0.1)',
      }}
    />

    {/* 标题 */}
    <div className="relative flex items-center justify-center gap-3 mb-4 md:mb-5">
      <div className="hidden md:block w-1 h-6 md:h-7 bg-gradient-to-b from-amber-500 to-yellow-300 rounded-full" />
      <h3
        data-testid="regular-total-label"
        className="text-lg md:text-xl font-bold tracking-wide text-center"
        style={{
          fontFamily: 'Chakra Petch, sans-serif',
          background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        常规奖金
      </h3>
      <div className="hidden md:block w-1 h-6 md:h-7 bg-gradient-to-b from-amber-500 to-yellow-300 rounded-full" />
    </div>

    {/* 总金额 */}
    <div className="relative text-center mb-5">
      <div
        className="text-3xl md:text-4xl font-black tabular-nums"
        data-testid="regular-total"
        style={{
          fontFamily: 'Chakra Petch, sans-serif',
          background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {formatAmount(total)}
      </div>
    </div>

    {/* 冠亚军卡片 - 上下布局 */}
    <div className="relative flex flex-col gap-3">
      <PrizeSubCard
        icon={<Trophy className="w-5 h-5 text-amber-400" />}
        label="冠军"
        amount={champion}
        ratio={`${Math.round((championRatio ?? 0.7) * 100)}%`}
        testId="champion-card"
      />
      <PrizeSubCard
        icon={<Medal className="w-5 h-5 text-amber-400" />}
        label="亚军"
        amount={runnerUp}
        ratio={`${Math.round((runnerUpRatio ?? 0.3) * 100)}%`}
        testId="runner-up-card"
      />
    </div>
  </div>
);

/**
 * 特殊奖项卡片组件（纵向滚动）
 */
const SpecialAwardsCard: React.FC<{ awards: { id: number; content: string }[] }> = ({ awards }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current && scrollContentRef.current) {
        const containerHeight = scrollContainerRef.current.clientHeight;
        const contentHeight = scrollContentRef.current.scrollHeight;
        setShouldScroll(contentHeight > containerHeight);
      }
    };

    const timer = setTimeout(() => {
      checkOverflow();
    }, 100);

    window.addEventListener('resize', checkOverflow);
    window.addEventListener('load', checkOverflow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
      window.removeEventListener('load', checkOverflow);
    };
  }, [awards]);

  const awardItems = awards.map(award => (
    <li
      key={award.id}
      className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-pink-500/30 hover:bg-pink-900/10 transition-all duration-300 min-h-[60px]"
    >
      <TrophyIcon className="flex-shrink-0 w-5 h-5 text-amber-400 mt-0.5" />
      <p className="text-gray-200 text-xs md:text-sm leading-relaxed flex-1">{award.content}</p>
    </li>
  ));

  return (
    <div
      data-testid="special-awards-card"
      className="relative p-5 md:p-6 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-900/20 via-black/50 to-amber-900/20 backdrop-blur-md overflow-hidden group flex flex-col h-full"
    >
      {/* 定义 scroll-up 关键帧动画 */}
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>

      {/* CRT 扫描线效果 */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="w-full h-full"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(219, 39, 119, 0.03) 2px, rgba(219, 39, 119, 0.03) 4px)',
          }}
        />
      </div>

      {/* 霓虹光晕边框 */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px rgba(219, 39, 119, 0.1), 0 0 40px rgba(219, 39, 119, 0.1)',
        }}
      />

      {/* 标题区域 */}
      <div className="relative flex items-center justify-center gap-3 mb-4 md:mb-5">
        <div className="hidden md:block w-1 h-6 md:h-7 bg-gradient-to-b from-pink-500 to-amber-500 rounded-full" />
        <h3
          data-testid="special-awards-title"
          className="text-lg md:text-xl font-bold tracking-wide flex items-center gap-2 text-center"
          style={{
            fontFamily: 'Chakra Petch, sans-serif',
            background: 'linear-gradient(135deg, #F472B6 0%, #FBBF24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          <StarBurst
            size={18}
            className="text-pink-400 flex-shrink-0"
            style={{ WebkitTextFillColor: 'initial' }}
          />
          特殊奖项
          <StarBurst
            size={18}
            className="text-amber-400 flex-shrink-0"
            style={{ WebkitTextFillColor: 'initial' }}
          />
        </h3>
        <div className="hidden md:block w-1 h-6 md:h-7 bg-gradient-to-b from-pink-500 to-amber-500 rounded-full" />
      </div>

      {/* 滚动区域 */}
      <div
        ref={scrollContainerRef}
        data-testid="special-awards-scroll"
        className="relative overflow-hidden flex-1"
        style={{ maxHeight: '280px', minHeight: '200px' }}
      >
        <div
          ref={scrollContentRef}
          className="space-y-3"
          style={
            shouldScroll
              ? {
                  animation: 'scroll-up 20s linear infinite',
                  width: '100%',
                }
              : undefined
          }
        >
          {awardItems}
          {/* 复制一份内容用于无缝循环滚动 */}
          {shouldScroll && awardItems}
        </div>
      </div>
    </div>
  );
};

/**
 * 奖金池展示面板主组件
 */
interface PrizePoolPanelProps {
  data: PrizePoolData;
}

const PrizePoolPanel: React.FC<PrizePoolPanelProps> = ({ data }) => {
  if (!data) return null;

  const showRegular = data.regular.total > 0;
  const showSpecial = data.specialAwards.length > 0;

  if (!showRegular && !showSpecial) return null;

  // 冠亚军金额：优先使用配置值，否则根据 total * ratio 计算
  const championRatio = data.regular.championRatio ?? 0.7;
  const runnerUpRatio = data.regular.runnerUpRatio ?? 0.3;
  const champion = data.regular.champion ?? Math.round(data.regular.total * championRatio);
  const runnerUp = data.regular.runnerUp ?? Math.round(data.regular.total * runnerUpRatio);

  return (
    <div
      data-testid="prize-pool-panel"
      className="relative mt-8 md:mt-12 mx-auto max-w-4xl w-full px-4"
      style={{
        fontFamily: 'Chakra Petch, sans-serif',
      }}
    >
      {/* 标题 + 总金额动画 */}
      {showRegular && <PrizePoolTitle total={data.prizePoolTotal} />}

      {/* 两列网格布局 */}
      <div
        data-testid="prize-pool-grid"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch"
      >
        {showRegular && (
          <RegularPrizeCard
            total={data.regular.total}
            champion={champion}
            runnerUp={runnerUp}
            championRatio={championRatio}
            runnerUpRatio={runnerUpRatio}
          />
        )}
        {showSpecial && <SpecialAwardsCard awards={data.specialAwards} />}
        {!showRegular && showSpecial && <div className="hidden md:block" />}
      </div>
    </div>
  );
};

export default PrizePoolPanel;
