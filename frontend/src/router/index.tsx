import React from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Home from '../pages/Home';
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminStream from '../pages/admin/Stream';
import AdminTeams from '../pages/admin/Teams';
import AdminSchedule from '../pages/admin/Schedule';
import AdminStreamers from '../pages/admin/Streamers';
import Videos from '../pages/admin/Videos';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import MatchDataPage from '../components/features/match-data/MatchDataPage';

/**
 * 路由配置
 * 使用 React Router v6+ 的数据路由器
 */
export const routes: RouteObject[] = [
  // 公开路由
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/match/:id/games',
    element: <MatchDataPage />,
  },
  
  // 受保护的管理后台路由
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/stream',
    element: (
      <ProtectedRoute>
        <AdminStream />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/teams',
    element: (
      <ProtectedRoute>
        <AdminTeams />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/schedule',
    element: (
      <ProtectedRoute>
        <AdminSchedule />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/streamers',
    element: (
      <ProtectedRoute>
        <AdminStreamers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/videos',
    element: (
      <ProtectedRoute>
        <Videos />
      </ProtectedRoute>
    ),
  },
];

/**
 * 创建浏览器路由器实例
 */
export const router = createBrowserRouter(routes);

export default router;
