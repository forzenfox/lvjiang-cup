import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">管理仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-secondary mb-2">直播状态</h3>
          <p className="text-gray-400">管理直播链接和状态</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-secondary mb-2">战队管理</h3>
          <p className="text-gray-400">管理参赛战队和队员信息</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-secondary mb-2">赛程管理</h3>
          <p className="text-gray-400">更新比赛结果和赛程安排</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
