import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-secondary mb-2">Stream Status</h3>
          <p className="text-gray-400">Manage live stream links and status.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-secondary mb-2">Teams</h3>
          <p className="text-gray-400">Manage participating teams and players.</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-secondary mb-2">Schedule</h3>
          <p className="text-gray-400">Update match results and schedule.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
