import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Radio, Users, Calendar, LogOut, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/stream', label: 'Stream Config', icon: Radio },
    { path: '/admin/teams', label: 'Team Management', icon: Users },
    { path: '/admin/schedule', label: 'Schedule Management', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-secondary">LvMao</span> Admin
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                  isActive 
                    ? "bg-secondary/20 text-secondary" 
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
           <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span>Back to Site</span>
          </Link>
          <Button 
            variant="destructive" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
