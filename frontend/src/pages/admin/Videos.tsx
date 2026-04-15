import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import * as videoApi from '@/api/videos';
import type { Video } from '@/api/videos';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Video as VideoIcon, Plus } from 'lucide-react';
import VideoList from './components/VideoList';
import VideoForm from './components/VideoForm';

const Videos: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setEditingVideo(null);
    setFormOpen(true);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingVideo(null);
  };

  const handleSave = async (data: videoApi.CreateVideoRequest) => {
    try {
      if (editingVideo) {
        await videoApi.updateVideo({ id: editingVideo.id, ...data });
      } else {
        await videoApi.createVideo(data);
      }
      toast.success(editingVideo ? '视频更新成功' : '视频创建成功');
      handleCloseForm();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败');
      throw error;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <VideoIcon className="w-8 h-8 text-blue-500" />
              视频管理
            </h1>
            <p className="text-sm text-gray-400 mt-1">管理赛事视频，支持B站视频链接添加和预览</p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="add-video-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加视频
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              视频列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoList key={refreshKey} onEdit={handleEdit} />
          </CardContent>
        </Card>
      </div>

      <VideoForm
        video={editingVideo}
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
      />
    </AdminLayout>
  );
};

export default Videos;