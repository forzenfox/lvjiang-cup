import React, { lazy, Suspense, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { StartBox } from '../components/features/StartBox';
import HeroSection from '../components/features/HeroSection';
import { HomeDataProvider, useHomeData } from '../context/HomeDataContext';

const ScheduleSection = lazy(() => import('../components/features/ScheduleSection'));
const TeamSection = lazy(() => import('../components/features/TeamSection'));
const StreamerSection = lazy(() => import('../components/features/StreamerSection'));
const ThanksSection = lazy(() =>
  import('../components/features/ThanksSection').then(m => ({ default: m.ThanksSection }))
);
const LazyVideoCarousel = lazy(() =>
  import('../components/video-carousel').then(m => ({ default: m.VideoCarousel }))
);

const SectionSkeleton: React.FC = () => (
  <div className="h-[calc(100vh-96px)] flex items-center justify-center bg-black">
    <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
  </div>
);

const VideoSection: React.FC = () => {
  const { videos, fetchVideos, isLoading } = useHomeData();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const videoItems = videos.map(video => ({
    bvid: video.bvid,
    title: video.title,
    cover: video.coverUrl || undefined,
  }));

  if (isLoading.videos && videos.length === 0) {
    return (
      <section
        id="videos"
        className="h-[calc(100vh-96px)] bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] flex items-center justify-center"
      >
        <SectionSkeleton />
      </section>
    );
  }

  return (
    <section
      id="videos"
      className="h-[calc(100vh-96px)] bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] flex items-center justify-center"
    >
      <div className="container mx-auto px-4 w-full h-full flex flex-col justify-center">
        {videoItems.length > 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Suspense fallback={<SectionSkeleton />}>
              <LazyVideoCarousel videos={videoItems} />
            </Suspense>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">暂无视频</p>
          </div>
        )}
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  return (
    <HomeDataProvider>
      <Layout>
        <StartBox />
        <HeroSection />
        <VideoSection />
        <Suspense fallback={<SectionSkeleton />}>
          <StreamerSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TeamSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ScheduleSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ThanksSection />
        </Suspense>
      </Layout>
    </HomeDataProvider>
  );
};

export default Home;
