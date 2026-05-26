import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { useHomeData } from '@/context/HomeDataContext';
import type { Match, Team } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SwissStage from './SwissStageResponsive';
import EliminationStage from './EliminationStage';
import MatchDetailModal from './MatchDetailModal';
import MatchDetailDrawer from './MatchDetailDrawer';
import SwissEmptyState from './swiss/SwissEmptyState';

const ScheduleSkeleton: React.FC = () => (
  <div className="w-full" data-testid="schedule-skeleton">
    <div className="flex justify-center mb-8">
      <div className="flex space-x-2 bg-gray-800/50 p-1 rounded-lg">
        <div className="w-24 h-10 bg-white/10 rounded animate-pulse" />
        <div className="w-24 h-10 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20" data-testid="schedule-error">
    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
    <p className="text-xl text-red-400 mb-2">加载失败</p>
    <p className="text-sm text-gray-400 mb-6">{message}</p>
  </div>
);

const ScheduleSection: React.FC = () => {
  const { matches, teams } = useHomeData();
  const [activeTab, setActiveTab] = useState<string>('swiss');
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // 对战详情状态
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleCloseMatchDetail = () => {
    setSelectedMatch(null);
  };

  const swissMatches = useMemo(() => matches.filter(m => m.stage === 'swiss'), [matches]);
  const eliminationMatches = useMemo(
    () => matches.filter(m => m.stage === 'elimination'),
    [matches]
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setScale(1);
      return;
    }

    let rafId: number;
    const calculateScale = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const viewportHeight = window.innerHeight;
        const headerHeight = 98;
        const availableHeight = viewportHeight - headerHeight;

        const contentHeight = 886;
        const newScale = Math.min(1, availableHeight / contentHeight);
        setScale(newScale);
      });
    };

    calculateScale();
    window.addEventListener('resize', calculateScale, { passive: true });
    return () => {
      window.removeEventListener('resize', calculateScale);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeTab]);

  return (
    <section id="schedule" className="min-h-screen md:h-screen flex flex-col bg-black">
      <div className="max-w-7xl mx-auto px-4 flex-1 flex flex-col justify-center min-h-0 w-full">
        {matches.length === 0 ? (
          <ScheduleSkeleton />
        ) : (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: '100%',
            }}
          >
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
              data-testid="schedule-tabs"
            >
              <TabsList
                className="w-full max-w-md mx-auto mb-8 flex"
                data-testid="schedule-tab-list"
              >
                <TabsTrigger value="swiss" className="flex-1" data-testid="home-swiss-tab">
                  瑞士轮
                </TabsTrigger>
                <TabsTrigger
                  value="elimination"
                  className="flex-1"
                  data-testid="home-elimination-tab"
                >
                  淘汰赛
                </TabsTrigger>
              </TabsList>

              <TabsContent value="swiss" className="mt-0" data-testid="swiss-content">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  data-testid="swiss-stage-display"
                >
                  {swissMatches.length === 0 ? (
                    <SwissEmptyState message="暂无赛程信息，赛程信息将在比赛开始前公布" />
                  ) : (
                    <SwissStage
                      matches={swissMatches}
                      teams={teams}
                      onMatchClick={handleMatchClick}
                    />
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="elimination" className="mt-0" data-testid="elimination-content">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  data-testid="elimination-stage-display"
                >
                  {eliminationMatches.length === 0 ? (
                    <SwissEmptyState message="暂无淘汰赛信息" />
                  ) : (
                    <EliminationStage
                      matches={eliminationMatches}
                      teams={teams}
                      onMatchClick={handleMatchClick}
                    />
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* 对战详情：移动端抽屉 / PC端弹框 */}
      {isMobile && selectedMatch && (
        <MatchDetailDrawer match={selectedMatch} teams={teams} onClose={handleCloseMatchDetail} />
      )}
      {!isMobile && selectedMatch && (
        <MatchDetailModal
          visible={!!selectedMatch}
          onClose={handleCloseMatchDetail}
          match={selectedMatch}
          teams={teams}
        />
      )}
    </section>
  );
};

export default ScheduleSection;
