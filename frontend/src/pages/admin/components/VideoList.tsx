import React, { useState, useEffect, useCallback } from 'react';
import * as videoApi from '@/api/videos';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Edit, Trash2, Eye, EyeOff, GripVertical, ChevronLeft, ChevronRight, Search, X, RefreshCw } from 'lucide-react';

interface VideoListProps {
  onEdit: (video: videoApi.Video) => void;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

const VideoList: React.FC<VideoListProps> = ({ onEdit }) => {
  const [videos, setVideos] = useState<videoApi.Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params: videoApi.GetVideosParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: 'order',
        sortOrder: 'asc',
      };
      if (search.trim()) {
        params.search = search.trim();
      }
      if (filterEnabled !== null) {
        params.isEnabled = filterEnabled;
      }
      const result = await videoApi.getAdminVideos(params);
      setVideos(result.list || []);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '获取视频列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, search, filterEnabled]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleToggleEnabled = async (video: videoApi.Video) => {
    try {
      const result = await videoApi.toggleVideoEnabled(video.id, !video.isEnabled);
      setVideos(prev => prev.map(v => v.id === result.id ? result : v));
      toast.success(`已${result.isEnabled ? '启用' : '禁用'}视频`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '切换状态失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await videoApi.deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      toast.success('删除成功');
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleDragStart = (e: React.DragEvent, videoId: string) => {
    setDraggedId(videoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIndex = videos.findIndex(v => v.id === draggedId);
    const targetIndex = videos.findIndex(v => v.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    const newVideos = [...videos];
    const [draggedVideo] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(targetIndex, 0, draggedVideo);

    const orderedIds = newVideos.map(v => v.id);
    setVideos(newVideos);
    setDraggedId(null);

    try {
      await videoApi.reorderVideos(orderedIds);
      toast.success('排序已保存');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存排序失败');
      fetchVideos();
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.pageSize)) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div className="space-y-4" data-testid="video-list">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
              placeholder="搜索标题或BV号..."
              className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPagination(prev => ({ ...prev, page: 1 })); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={filterEnabled === null ? '' : filterEnabled.toString()}
            onChange={e => { setFilterEnabled(e.target.value === '' ? null : e.target.value === 'true'); setPagination(prev => ({ ...prev, page: 1 })); }}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="true">已启用</option>
            <option value="false">已禁用</option>
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVideos}
          disabled={loading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {loading && videos.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mr-2" />
          加载中...
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-lg mb-2">暂无视频</p>
          <p className="text-sm">点击上方"添加视频"按钮创建第一个视频</p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-12">拖拽</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-16">序号</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">标题</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">BV号</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400 w-20">分P</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400 w-24">排序</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400 w-24">状态</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-32">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video, index) => (
                    <tr
                      key={video.id}
                      draggable
                      onDragStart={e => handleDragStart(e, video.id)}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, video.id)}
                      className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${draggedId === video.id ? 'opacity-50 bg-gray-700' : ''}`}
                      data-testid={`video-item-${video.id}`}
                    >
                      <td className="px-4 py-3 text-gray-500 cursor-move">
                        <GripVertical className="w-4 h-4" />
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {(pagination.page - 1) * pagination.pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium truncate max-w-xs block">{video.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 font-mono text-sm">{video.bvid}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-400">{video.page || 1}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-400">{video.order}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleEnabled(video)}
                          data-testid={`toggle-status-${video.id}`}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            video.isEnabled
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                          }`}
                        >
                          {video.isEnabled ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              已启用
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              已禁用
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(video)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                            data-testid={`edit-button-${video.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {deleteConfirmId === video.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(video.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                确认
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-400 hover:text-white hover:bg-gray-700"
                              >
                                取消
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(video.id)}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                              data-testid={`delete-button-${video.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                共 {pagination.total} 条记录，第 {pagination.page}/{totalPages} 页
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-400 px-2">
                  {pagination.page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoList;
