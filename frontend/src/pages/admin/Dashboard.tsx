import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { mockService } from '../../mock/service';
import { Upload, Trash2, Database } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const [isLoadMockDialogOpen, setIsLoadMockDialogOpen] = useState(false);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMockData = async () => {
    setIsLoading(true);
    try {
      await mockService.resetAllData();
      toast.success('Mock 数据加载成功！');
      setIsLoadMockDialogOpen(false);
      // 刷新页面以显示新数据
      window.location.reload();
    } catch (error) {
      toast.error('加载 Mock 数据失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    setIsLoading(true);
    try {
      await mockService.clearAllData();
      toast.success('所有数据已清空！');
      setIsClearDataDialogOpen(false);
      // 刷新页面以反映数据清空
      window.location.reload();
    } catch (error) {
      toast.error('清空数据失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">管理仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* 数据管理区域 */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-secondary" />
          <h3 className="text-xl font-semibold text-white">数据管理</h3>
        </div>
        <p className="text-gray-400 mb-6">管理本地存储的数据，包括加载初始 Mock 数据或清空所有数据。</p>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => setIsLoadMockDialogOpen(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            加载 Mock 数据
          </Button>
          <Button
            onClick={() => setIsClearDataDialogOpen(true)}
            disabled={isLoading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空所有数据
          </Button>
        </div>
      </div>

      {/* 加载 Mock 数据确认对话框 */}
      <ConfirmDialog
        isOpen={isLoadMockDialogOpen}
        title="确认加载 Mock 数据？"
        message="此操作将重置所有数据为初始 Mock 状态，当前数据将被覆盖。是否继续？"
        confirmText="加载数据"
        cancelText="取消"
        onConfirm={handleLoadMockData}
        onCancel={() => setIsLoadMockDialogOpen(false)}
      />

      {/* 清空数据确认对话框 */}
      <ConfirmDialog
        isOpen={isClearDataDialogOpen}
        title="确认清空所有数据？"
        message="此操作将清空所有 localStorage 数据，无法恢复。是否继续？"
        confirmText="清空数据"
        cancelText="取消"
        onConfirm={handleClearAllData}
        onCancel={() => setIsClearDataDialogOpen(false)}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
