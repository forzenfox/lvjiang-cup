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
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <Trophy className="h-8 w-8 text-secondary" />
            <span className="text-xl font-bold tracking-wider text-white">LvMao Cup</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('schedule')} className="text-sm font-medium text-gray-300 hover:text-secondary transition-colors">
              Schedule
            </button>
            <button onClick={() => scrollToSection('teams')} className="text-sm font-medium text-gray-300 hover:text-secondary transition-colors">
              Teams
            </button>
            <Link to="/admin" className="text-sm font-medium text-gray-300 hover:text-secondary transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-black/50 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 LvMao Guild. All rights reserved.</p>
          <p className="text-sm mt-2">Powered by DouYu Streaming Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
