import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

// 隐藏滚动条的样式
const styles = `
  /* 隐藏垂直滚动条 */
  body::-webkit-scrollbar {
    display: none;
  }
  body {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState('hero');

  // 导航栏高度（与 h-24 = 6rem = 96px 对应）
  const NAVBAR_HEIGHT = 96;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 计算元素位置并减去导航栏高度，确保内容不被遮挡
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - NAVBAR_HEIGHT;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  // 注入隐藏滚动条的样式
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 添加键盘事件监听器，实现上下键切换模块
  useEffect(() => {
    const sections = ['streamers', 'teams', 'schedule'];
    let currentIndex = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (event.key === 'ArrowUp') {
          currentIndex = (currentIndex - 1 + sections.length) % sections.length;
        } else {
          currentIndex = (currentIndex + 1) % sections.length;
        }
        scrollToSection(sections[currentIndex]);
      }
    };

    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 监听滚动，更新当前激活的section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'streamers', 'teams', 'schedule'];
      // 使用导航栏高度作为偏移量，确保判断更准确
      const scrollPosition = window.scrollY + NAVBAR_HEIGHT + 20;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 导航项配置
  const navItems = [
    { id: 'hero', label: '直播' },
    { id: 'streamers', label: '主播' },
    { id: 'teams', label: '战队' },
    { id: 'schedule', label: '赛程' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* PC端顶部导航栏 - 仅在md及以上屏幕显示 */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] border-b-2 border-secondary/50 shadow-lg shadow-secondary/10">
        <div className="container mx-auto px-8 h-24 flex items-center justify-between">
          {/* Logo区域 */}
          <div
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={() => scrollToSection('hero')}
          >
            <div className="relative">
              <Trophy className="h-12 w-12 text-secondary group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white tracking-wider bg-gradient-to-r from-white via-secondary to-white bg-clip-text">
                驴酱杯
              </span>
              <span className="text-sm text-secondary font-bold tracking-[0.3em] uppercase">
                2026 Championship
              </span>
            </div>
          </div>

          {/* 中间导航菜单 */}
          <nav className="flex items-center bg-black/30 rounded-lg p-1.5 border border-white/10">
            {navItems.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    relative px-10 py-4 mx-1 text-lg font-bold transition-all duration-300 rounded-md
                    ${
                      isActive
                        ? 'bg-gradient-to-b from-primary to-primary/80 text-white shadow-lg shadow-primary/30 border border-primary/50'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* 选中状态的发光效果 */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent rounded-md" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* 右侧管理入口 */}
          <Link
            to="/admin/login"
            className="group flex items-center space-x-2 text-lg font-bold text-gray-300 hover:text-secondary transition-all duration-300 px-6 py-3 rounded-lg border border-transparent hover:border-secondary/30 hover:bg-secondary/10"
          >
            <span>管理</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* PC端为固定导航栏预留空间 */}
      <div className="hidden md:block h-24" />

      <main className="flex-grow pb-16 md:pb-0">{children}</main>

      {/* 移动端底部导航栏 - 参考官方设计 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-white/10">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  flex-1 py-3 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* PC端页脚 */}
      <footer className="hidden md:block bg-black/50 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 驴酱公会. 保留所有权利.</p>
          <p className="text-sm mt-2">粉丝自制项目</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
