import React from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/features/HeroSection';
import ScheduleSection from '../components/features/ScheduleSection';
import TeamSection from '../components/features/TeamSection';

const Home: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <TeamSection />
      <ScheduleSection />
    </Layout>
  );
};

export default Home;
