import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <Trophy className="h-8 w-8 text-secondary" />
            <span className="text-xl font-bold tracking-wider text-white">驴酱杯</span>
          </div>
          <nav className="flex items-center space-x-2 md:space-x-8">
            <button
              onClick={() => scrollToSection('streamers')}
              className="text-xs md:text-sm font-medium text-gray-300 hover:text-secondary transition-colors"
            >
              主播
            </button>
            <button
              onClick={() => scrollToSection('teams')}
              className="text-xs md:text-sm font-medium text-gray-300 hover:text-secondary transition-colors"
            >
              战队
            </button>
            <button
              onClick={() => scrollToSection('schedule')}
              className="text-xs md:text-sm font-medium text-gray-300 hover:text-secondary transition-colors"
            >
              赛程
            </button>
            <Link
              to="/admin/login"
              className="text-xs md:text-sm font-medium text-gray-300 hover:text-secondary transition-colors"
            >
              管理
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-black/50 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 驴酱公会. 保留所有权利.</p>
          <p className="text-sm mt-2">粉丝自制项目</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
