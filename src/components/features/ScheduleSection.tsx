import React from 'react';
import { motion } from 'framer-motion';
import { matches as initialMatches } from '@/data/matches';
import { teams as initialTeams } from '@/data/teams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SwissStage from './SwissStage';
import EliminationStage from './EliminationStage';
import { useAdvancementStore } from '@/store/advancementStore';

const ScheduleSection: React.FC = () => {
  const advancement = useAdvancementStore(state => state.advancement);

  // Filter matches by stage
  const swissMatches = initialMatches.filter(m => m.stage === 'swiss');
  const eliminationMatches = initialMatches.filter(m => m.stage === 'elimination');

  return (
    <section id="schedule" className="py-20 px-4 bg-gradient-to-b from-primary via-primary to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white uppercase tracking-wider"
        >
          赛程安排
        </motion.h2>

        <Tabs defaultValue="swiss" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-8 flex">
            <TabsTrigger value="swiss" className="flex-1">瑞士轮</TabsTrigger>
            <TabsTrigger value="elimination" className="flex-1">淘汰赛</TabsTrigger>
          </TabsList>

          <TabsContent value="swiss" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SwissStage 
                matches={swissMatches} 
                teams={initialTeams}
                advancement={advancement}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="elimination" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EliminationStage 
                matches={eliminationMatches} 
                teams={initialTeams}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ScheduleSection;