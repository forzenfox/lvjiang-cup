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
      setMessage('Stream info updated successfully!');
    } catch (error) {
      setMessage('Failed to update stream info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">Stream Configuration</h1>
      <Card className="max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Live Stream Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stream Title</label>
              <input
                type="text"
                value={streamInfo.title}
                onChange={(e) => setStreamInfo({ ...streamInfo, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Stream URL</label>
              <input
                type="text"
                value={streamInfo.url}
                onChange={(e) => setStreamInfo({ ...streamInfo, url: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
              <select
                value={streamInfo.platform}
                onChange={(e) => setStreamInfo({ ...streamInfo, platform: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="DouYu">DouYu</option>
                <option value="Huya">Huya</option>
                <option value="Bilibili">Bilibili</option>
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
              <label htmlFor="isLive" className="text-sm font-medium text-gray-300">Is Live Now</label>
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {loading ? 'Saving...' : 'Save Changes'}
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
