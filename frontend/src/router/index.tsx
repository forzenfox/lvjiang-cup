import React from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Home from '../pages/Home';

/**
 * 路由配置
 * 使用 React Router v6+ 的数据路由器
 */
export const routes: RouteObject[] = [
  {
    path: '/s2',
    element: <Home />,
  },
];

/**
 * 创建浏览器路由器实例
 */
export const router = createBrowserRouter(routes);

export default router;
