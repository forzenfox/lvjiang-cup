import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { mockService } from '../../mock/service';
import { StreamInfo } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AdminStream: React.FC = () => {
  const [streamInfo, setStreamInfo] = useState<StreamInfo>({
    title: '',
    url: '',
    platform: '',
    isLive: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    mockService.getStreamInfo().then(setStreamInfo);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await mockService.updateStreamInfo(streamInfo);
      setMessage('直播信息更新成功！');
    } catch {
      setMessage('更新直播信息失败。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">直播配置</h1>
      <Card className="max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">直播设置</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">直播标题</label>
              <input
                type="text"
                value={streamInfo.title}
                onChange={(e) => setStreamInfo({ ...streamInfo, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">直播链接</label>
              <input
                type="text"
                value={streamInfo.url}
                onChange={(e) => setStreamInfo({ ...streamInfo, url: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">直播平台</label>
              <select
                value={streamInfo.platform}
                onChange={(e) => setStreamInfo({ ...streamInfo, platform: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="DouYu">斗鱼直播</option>
                <option value="Huya">虎牙直播</option>
                <option value="Bilibili">哔哩哔哩</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isLive"
                checked={streamInfo.isLive}
                onChange={(e) => setStreamInfo({ ...streamInfo, isLive: e.target.checked })}
                className="w-4 h-4 text-secondary bg-gray-700 border-gray-600 rounded focus:ring-secondary"
              />
              <label htmlFor="isLive" className="text-sm font-medium text-gray-300">正在直播</label>
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {loading ? '保存中...' : '保存更改'}
              </Button>
            </div>
            {message && (
              <p className={`text-sm mt-2 ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminStream;
