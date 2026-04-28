import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { streamersApi } from '@/api/streamers';
import apiClient from '@/api/axios';
import { Streamer, StreamerType } from '@/api/types';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  User,
  GripVertical,
  Upload,
  Download,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ZIndexLayers } from '@/constants/zIndex';
import Modal from '../../components/ui/Modal';
import { StreamerImportDialog } from '@/components/import/StreamerImportDialog';
import { downloadStreamerErrorReport, downloadStreamerTemplate, type StreamerImportResult } from '@/api/streamers-import';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DOUYU_URL_PREFIX = 'https://www.douyu.com/';

const normalizeDouyuLiveUrl = (url: string): string => {
  if (!url) return url;
  const trimmedUrl = url.trim();
  if (/^\d+$/.test(trimmedUrl)) {
    return `${DOUYU_URL_PREFIX}${trimmedUrl}`;
  }
  if (trimmedUrl.startsWith('www.douyu.com/')) {
    return `https://${trimmedUrl}`;
  }
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `${DOUYU_URL_PREFIX}${trimmedUrl}`;
  }
  return trimmedUrl;
};

interface StreamerFormData {
  id?: string;
  nickname: string;
  posterUrl: string;
  bio: string;
  liveUrl: string;
  streamerType: StreamerType;
}

interface SortableStreamerCardProps {
  streamer: Streamer;
  isExpanded: boolean;
  isBeingEdited: boolean;
  editingStreamerData: StreamerFormData | null;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onDeleteClick: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditingStreamerDataChange: (data: StreamerFormData) => void;
  loading: boolean;
}

const SortableStreamerCard: React.FC<SortableStreamerCardProps> = ({
  streamer,
  isExpanded,
  isBeingEdited,
  editingStreamerData,
  onToggleExpand,
  onStartEdit,
  onDeleteClick,
  onSaveEdit,
  onCancelEdit,
  onEditingStreamerDataChange,
  loading,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: streamer.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? ZIndexLayers.DRAGGING : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-testid={`streamer-card-${streamer.id}`}
      className={`bg-[#0F172A] border-white/10 overflow-hidden ${isDragging ? 'shadow-2xl ring-2 ring-blue-500' : ''}`}
    >
      <div
        data-testid={`streamer-header-${streamer.id}`}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center space-x-4">
          <button
            className="p-1 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 transition-colors"
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
            aria-label="拖拽排序"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          {streamer.posterUrl ? (
            <img
              src={streamer.posterUrl}
              alt={streamer.nickname}
              className="w-16 h-16 rounded object-cover bg-black/20"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="24">?</text></svg>';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded bg-white/5 flex items-center justify-center text-gray-500">
              <User className="w-8 h-8" />
            </div>
          )}
          <div>
            <h3 className="text-white text-lg font-semibold">
              {streamer.nickname || '未命名主播'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {streamer.streamerType === StreamerType.INTERNAL ? (
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  驴酱
                </span>
              ) : (
                <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  嘉宾
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isBeingEdited && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation();
                  onStartEdit();
                }}
                disabled={loading}
                aria-label="编辑"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation();
                  onDeleteClick();
                }}
                disabled={loading}
                aria-label="删除"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </>
          )}
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div data-testid={`streamer-detail-${streamer.id}`} className="border-t border-white/10">
          {isBeingEdited && editingStreamerData ? (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                    主播昵称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingStreamerData.nickname}
                    onChange={e =>
                      onEditingStreamerDataChange({
                        ...editingStreamerData,
                        nickname: e.target.value,
                      })
                    }
                    placeholder="请输入主播昵称"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#475569] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">主播类型</label>
                  <select
                    value={editingStreamerData.streamerType}
                    onChange={e =>
                      onEditingStreamerDataChange({
                        ...editingStreamerData,
                        streamerType: e.target.value as StreamerType,
                      })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={StreamerType.INTERNAL} className="bg-gray-800">
                      驴酱内部主播
                    </option>
                    <option value={StreamerType.GUEST} className="bg-gray-800">
                      嘉宾主播
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">海报URL</label>
                <div className="flex items-start gap-3">
                  <div
                    className="relative flex-shrink-0 w-32 h-32 border-2 border-dashed border-white/20 rounded-lg
                               flex items-center justify-center cursor-pointer
                               hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';
                      input.onchange = async e => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        if (file.size > 20 * 1024 * 1024) {
                          toast.error('图片大小不能超过 20MB');
                          return;
                        }
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('type', 'poster');
                          const response = await apiClient.post('/admin/upload/image', formData);
                          const url = response.data?.data?.url || response.data?.url;
                          if (url) {
                            onEditingStreamerDataChange({
                              ...editingStreamerData,
                              posterUrl: url,
                            });
                            toast.success('海报上传成功');
                          } else {
                            toast.error('海报上传失败：无法获取图片地址');
                          }
                        } catch (_error) {
                          toast.error('海报上传失败');
                        }
                      };
                      input.click();
                    }}
                  >
                    {editingStreamerData.posterUrl ? (
                      <>
                        <img
                          src={editingStreamerData.posterUrl}
                          alt="海报预览"
                          className="w-full h-full object-cover rounded"
                        />
                        <div
                          className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100
                                        flex items-center justify-center transition-opacity"
                        >
                          <span className="text-white text-xs">更换</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <span className="text-xs">上传海报</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editingStreamerData.posterUrl}
                      onChange={e =>
                        onEditingStreamerDataChange({
                          ...editingStreamerData,
                          posterUrl: e.target.value,
                        })
                      }
                      placeholder="或输入海报 URL"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#475569] focus:outline-none focus:border-blue-500 mb-1.5"
                    />
                    <p className="text-xs text-gray-500">支持 JPG/PNG 格式，不超过 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">直播间URL</label>
                <input
                  type="text"
                  value={editingStreamerData.liveUrl}
                  onChange={e =>
                    onEditingStreamerDataChange({
                      ...editingStreamerData,
                      liveUrl: e.target.value,
                    })
                  }
                  placeholder="输入斗鱼房间号，如：138243"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#475569] focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">支持输入完整链接或斗鱼房间号</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">个人简介</label>
                <textarea
                  value={editingStreamerData.bio}
                  onChange={e =>
                    onEditingStreamerDataChange({
                      ...editingStreamerData,
                      bio: e.target.value,
                    })
                  }
                  placeholder="请输入个人简介"
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#475569] focus:outline-none focus:border-blue-500 resize-none"
                />
                <span className="text-xs text-gray-500 mt-1 block text-right">
                  {(editingStreamerData.bio || '').length}/500
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onCancelEdit} disabled={loading}>
                  取消
                </Button>
                <Button
                  onClick={onSaveEdit}
                  disabled={loading}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">主播昵称</label>
                  <p className="text-white">{streamer.nickname || '未填写'}</p>
                </div>
                <div>
                  <label className="block text-xs text-[#64748B] mb-1">主播类型</label>
                  <div className="flex items-center gap-2">
                    {streamer.streamerType === StreamerType.INTERNAL ? (
                      <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        驴酱内部主播
                      </span>
                    ) : (
                      <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        嘉宾主播
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#64748B] mb-1">海报</label>
                {streamer.posterUrl ? (
                  <img
                    src={streamer.posterUrl}
                    alt={streamer.nickname}
                    className="w-32 h-32 rounded object-cover bg-black/20"
                  />
                ) : (
                  <span className="text-gray-500">未上传</span>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#64748B] mb-1">直播间</label>
                {streamer.liveUrl ? (
                  <a
                    href={streamer.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {streamer.liveUrl}
                  </a>
                ) : (
                  <span className="text-gray-500">未填写</span>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#64748B] mb-1">个人简介</label>
                <p className="text-white">{streamer.bio || '暂无简介'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const AdminStreamers: React.FC = () => {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [streamerToDelete, setStreamerToDelete] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<StreamerImportResult | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  const [expandedStreamerId, setExpandedStreamerId] = useState<string | null>(null);
  const [editingStreamerId, setEditingStreamerId] = useState<string | null>(null);
  const [editingStreamerData, setEditingStreamerData] = useState<StreamerFormData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!hasLoaded) {
      loadStreamers();
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  const loadStreamers = async () => {
    setLoading(true);
    try {
      const data = await streamersApi.getAll();
      setStreamers(data);
    } catch (error) {
      console.error('Failed to load streamers:', error);
      toast.error('加载主播列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadStreamerTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `驴酱杯_主播导入模板_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('模板下载失败，请重试');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = streamers.findIndex(s => s.id === active.id);
      const newIndex = streamers.findIndex(s => s.id === over.id);

      const newStreamers = arrayMove(streamers, oldIndex, newIndex);
      setStreamers(newStreamers);

      const orders = newStreamers.map((streamer, index) => ({
        id: streamer.id,
        sortOrder: index,
      }));

      try {
        await streamersApi.updateSort(orders);
        toast.success('排序已保存');
      } catch (error) {
        console.error('Failed to save sort order:', error);
        toast.error('保存排序失败');
        await loadStreamers();
      }
    }
  };

  const handleToggleExpand = (streamerId: string) => {
    if (editingStreamerId && editingStreamerId !== streamerId) {
      toast.error('请先保存或取消当前编辑');
      return;
    }
    setExpandedStreamerId(expandedStreamerId === streamerId ? null : streamerId);
  };

  const handleStartEdit = (streamer: Streamer) => {
    if (expandedStreamerId !== streamer.id) {
      setExpandedStreamerId(streamer.id);
    }
    setEditingStreamerId(streamer.id);
    setEditingStreamerData({
      id: streamer.id,
      nickname: streamer.nickname || '',
      posterUrl: streamer.posterUrl || '',
      bio: streamer.bio || '',
      liveUrl: streamer.liveUrl || '',
      streamerType: streamer.streamerType,
    });
  };

  const handleCancelEdit = () => {
    setEditingStreamerId(null);
    setEditingStreamerData(null);
  };

  const handleSaveEdit = async (streamerId: string) => {
    if (!editingStreamerData) return;

    if (!editingStreamerData.nickname.trim()) {
      toast.error('主播昵称不能为空');
      return;
    }

    const normalizedLiveUrl = normalizeDouyuLiveUrl(editingStreamerData.liveUrl);

    setLoading(true);
    try {
      const isNewStreamer = streamerId === 'new-streamer';

      if (isNewStreamer) {
        await streamersApi.create({
          nickname: editingStreamerData.nickname,
          posterUrl: editingStreamerData.posterUrl,
          bio: editingStreamerData.bio,
          liveUrl: normalizedLiveUrl,
          streamerType: editingStreamerData.streamerType,
        });
        toast.success('主播创建成功');
      } else {
        await streamersApi.update(streamerId, {
          nickname: editingStreamerData.nickname,
          posterUrl: editingStreamerData.posterUrl,
          bio: editingStreamerData.bio,
          liveUrl: normalizedLiveUrl,
          streamerType: editingStreamerData.streamerType,
        });
        toast.success('主播信息已更新');
      }

      setEditingStreamerId(null);
      setEditingStreamerData(null);
      await loadStreamers();
    } catch (error) {
      console.error('Failed to save streamer:', error);
      toast.error(error instanceof Error ? error.message : '保存主播失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setStreamerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!streamerToDelete) return;

    setLoading(true);
    try {
      await streamersApi.remove(streamerToDelete);
      toast.success('主播已删除');
      await loadStreamers();
    } catch (error) {
      console.error('Failed to delete streamer:', error);
      toast.error(error instanceof Error ? error.message : '删除主播失败');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setStreamerToDelete(null);
    }
  };

  const handleCreateNew = () => {
    const newStreamer: Streamer = {
      id: 'new-streamer',
      nickname: '',
      posterUrl: '',
      bio: '',
      liveUrl: '',
      streamerType: StreamerType.INTERNAL,
    };

    setStreamers([newStreamer, ...streamers]);
    setExpandedStreamerId('new-streamer');
    setEditingStreamerId('new-streamer');
    setEditingStreamerData({
      nickname: '',
      posterUrl: '',
      bio: '',
      liveUrl: '',
      streamerType: StreamerType.INTERNAL,
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">主播管理</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadStreamers}
            disabled={loading}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button onClick={handleCreateNew} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" /> 添加主播
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            下载模板
          </Button>
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-yellow-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]"
          >
            <Upload className="w-4 h-4 mr-2" />
            批量导入
          </Button>
        </div>
      </div>

      {loading && streamers.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mr-2" />
          加载中...
        </div>
      ) : streamers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无主播数据</p>
          <p className="text-sm mt-2">点击"添加主播"按钮创建第一个主播</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={streamers.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {streamers.map(streamer => {
                const isExpanded = expandedStreamerId === streamer.id;
                const isBeingEdited = editingStreamerId === streamer.id;

                return (
                  <SortableStreamerCard
                    key={streamer.id}
                    streamer={streamer}
                    isExpanded={isExpanded}
                    isBeingEdited={isBeingEdited}
                    editingStreamerData={editingStreamerData}
                    onToggleExpand={() => handleToggleExpand(streamer.id)}
                    onStartEdit={() => handleStartEdit(streamer)}
                    onDeleteClick={() => handleDeleteClick(streamer.id)}
                    onSaveEdit={() => handleSaveEdit(streamer.id)}
                    onCancelEdit={handleCancelEdit}
                    onEditingStreamerDataChange={setEditingStreamerData}
                    loading={loading}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="确认删除主播？"
        message="此操作将永久删除该主播，无法恢复。是否继续？"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setStreamerToDelete(null);
        }}
      />

      <StreamerImportDialog
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={result => {
          setImportResult(result);
          setIsResultDialogOpen(true);
          loadStreamers();
        }}
      />

      <Modal
        visible={isResultDialogOpen}
        onClose={() => setIsResultDialogOpen(false)}
        title="导入结果"
        className="max-w-2xl"
      >
        {importResult && (
          <div className="space-y-4">
            {/* 成功/失败统计 */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-300 font-medium">导入成功</p>
                  <div className="mt-2 text-sm text-green-200/80 space-y-1">
                    <p>
                      总计: {importResult.total} 条
                    </p>
                    <p>
                      成功: {importResult.created} 条
                    </p>
                    <p>
                      失败: {importResult.failed} 条
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 外链URL提醒 */}
            {importResult.externalUrlItems && importResult.externalUrlItems.length > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-medium mb-1">外链URL项</p>
                    <p className="text-sm text-blue-200/80">
                      以下URL为外部链接，请手动上传到图床后更新：
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-200/80 max-h-32 overflow-y-auto">
                      {importResult.externalUrlItems.map((item, i) => (
                        <li key={i} className="break-all">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 失败详情表格 */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">行号</th>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">主播昵称</th>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">字段</th>
                      <th className="px-3 py-2 text-left text-gray-400 font-medium">错误</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {importResult.errors.map((error, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/50">
                        <td className="px-3 py-2 text-gray-300">{error.row || '-'}</td>
                        <td className="px-3 py-2 text-gray-300">{error.nickname || '-'}</td>
                        <td className="px-3 py-2 text-gray-300">{error.field || '-'}</td>
                        <td className="px-3 py-2 text-red-400">{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const blob = await downloadStreamerErrorReport(importResult.errors!);
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `驴酱杯_主播导入错误报告_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch {
                        toast.error('错误报告下载失败');
                      }
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载错误报告
                  </Button>
                )}
              </div>
              <Button onClick={() => setIsResultDialogOpen(false)}>关闭</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminStreamers;
