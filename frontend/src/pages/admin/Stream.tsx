import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { streamService } from '@/services/streamService';
import type { Stream } from '@/api/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Radio, Link2, Type, Activity, RefreshCw, Eye, EyeOff, Save } from 'lucide-react';

// 将 API Stream 转换为表单数据
const toFormData = (stream: Stream | null) => ({
  id: stream?.id || '',
  title: stream?.title || '',
  url: stream?.url || '',
  isLive: stream?.isLive || false,
});

interface StreamFormData {
  id: string;
  title: string;
  url: string;
  isLive: boolean;
}

const AdminStream: React.FC = () => {
  const [streamInfo, setStreamInfo] = useState<StreamFormData>({
    id: '',
    title: '',
    url: '',
    isLive: false,
  });
  const [originalStream, setOriginalStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadStreamInfo();
  }, []);

  // 检测是否有变更
  useEffect(() => {
    if (originalStream) {
      const original = toFormData(originalStream);
      const changed =
        original.title !== streamInfo.title ||
        original.url !== streamInfo.url ||
        original.isLive !== streamInfo.isLive;
      setHasChanges(changed);
    }
  }, [streamInfo, originalStream]);

  const loadStreamInfo = async () => {
    setLoading(true);
    try {
      const stream = await streamService.get();
      setOriginalStream(stream);
      setStreamInfo(toFormData(stream));
    } catch (error) {
      console.error('Failed to load stream info:', error);
      toast.error('加载直播信息失败');
      // 如果获取失败，使用默认值
      setStreamInfo({
        id: '',
        title: '',
        url: '',
        isLive: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!streamInfo.id) {
      toast.error('直播ID不能为空，请先创建直播');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        id: streamInfo.id,
        title: streamInfo.title,
        url: streamInfo.url,
        isLive: streamInfo.isLive,
      };

      await streamService.update(updateData);
      toast.success('直播信息更新成功！');

      // 刷新数据
      await loadStreamInfo();
    } catch (error) {
      console.error('Failed to update stream:', error);
      toast.error(error instanceof Error ? error.message : '更新直播信息失败');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalStream) {
      setStreamInfo(toFormData(originalStream));
      toast.info('已重置为上次保存的内容');
    }
  };

  const toggleLiveStatus = () => {
    setStreamInfo(prev => ({ ...prev, isLive: !prev.isLive }));
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">直播配置</h1>
          <p className="text-sm text-gray-400 mt-1">管理直播链接、标题和直播状态</p>
        </div>
        <Button
          variant="outline"
          onClick={loadStreamInfo}
          disabled={loading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mr-2" />
          加载中...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 直播设置表单 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                直播设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 直播状态开关 */}
                <div
                  data-testid="stream-status-section"
                  className="bg-gray-900/50 p-4 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${streamInfo.isLive ? 'bg-green-500/20' : 'bg-gray-700'}`}
                      >
                        {streamInfo.isLive ? (
                          <Eye className="w-5 h-5 text-green-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">直播状态</p>
                        <p data-testid="stream-status-text" className="text-sm text-gray-400">
                          {streamInfo.isLive ? '当前正在直播' : '当前未直播'}
                        </p>
                      </div>
                    </div>
                    <button
                      data-testid="stream-status-toggle"
                      type="button"
                      onClick={toggleLiveStatus}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                        streamInfo.isLive ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          streamInfo.isLive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 直播标题 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Type className="w-4 h-4" />
                    直播标题
                  </label>
                  <input
                    data-testid="stream-title-input"
                    type="text"
                    value={streamInfo.title}
                    onChange={e => setStreamInfo({ ...streamInfo, title: e.target.value })}
                    placeholder="请输入直播标题"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 直播链接 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Link2 className="w-4 h-4" />
                    直播链接
                  </label>
                  <input
                    data-testid="stream-url-input"
                    type="url"
                    value={streamInfo.url}
                    onChange={e => setStreamInfo({ ...streamInfo, url: e.target.value })}
                    placeholder="https://example.com/stream"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4">
                  <Button
                    data-testid="stream-save-button"
                    type="submit"
                    disabled={saving || !hasChanges}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存更改'}
                  </Button>
                  {hasChanges && (
                    <Button
                      data-testid="stream-reset-button"
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={saving}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      重置
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 预览卡片 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 直播状态预览 */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-3 h-3 rounded-full ${streamInfo.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
                    />
                    <span
                      className={`font-medium ${streamInfo.isLive ? 'text-green-400' : 'text-gray-400'}`}
                    >
                      {streamInfo.isLive ? '● 直播中' : '○ 未直播'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {streamInfo.title || '未设置标题'}
                  </h3>

                  {streamInfo.url && (
                    <a
                      href={streamInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 break-all"
                    >
                      {streamInfo.url}
                    </a>
                  )}
                </div>

                {/* 快速操作 */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">快速操作</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStreamInfo(prev => ({ ...prev, isLive: true }))}
                      disabled={streamInfo.isLive}
                      className="flex-1 border-green-600/50 text-green-400 hover:bg-green-600/20"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      开始直播
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStreamInfo(prev => ({ ...prev, isLive: false }))}
                      disabled={!streamInfo.isLive}
                      className="flex-1 border-red-600/50 text-red-400 hover:bg-red-600/20"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      结束直播
                    </Button>
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
                  <p className="text-sm text-blue-400">
                    <strong>提示：</strong>
                    {streamInfo.isLive
                      ? '当前正在直播中，观众可以通过首页观看直播。'
                      : '开始直播后，观众将能够在首页看到直播入口。'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStream;
