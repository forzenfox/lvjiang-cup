import React, { useState, useEffect } from 'react';
import { Video, CreateVideoRequest } from '@/api/videos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Link2, Type } from 'lucide-react';
import { toast } from 'sonner';
import VideoPreview from './VideoPreview';

interface VideoFormProps {
  video?: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateVideoRequest) => Promise<void>;
}

interface FormData {
  url: string;
  customTitle: string;
}

const extractBvidAndPage = (input: string): { bvid: string } | null => {
  const bilibiliVideoRegex = /(?:bilibili\.com\/video\/)([Bb][Vv][a-zA-Z0-9]+)/;

  const bvidMatch = input.match(bilibiliVideoRegex);

  if (bvidMatch) {
    return {
      bvid: bvidMatch[1],
    };
  }

  const directBvidRegex = /^([Bb][Vv][a-zA-Z0-9]{10})$/;
  const directMatch = input.match(directBvidRegex);

  if (directMatch) {
    return {
      bvid: directMatch[1],
    };
  }

  return null;
};

const validateUrl = (input: string): boolean => {
  return extractBvidAndPage(input) !== null;
};

const VideoForm: React.FC<VideoFormProps> = ({ video, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    url: '',
    customTitle: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  useEffect(() => {
    if (video) {
      const url = video.bvid ? `https://www.bilibili.com/video/${video.bvid}` : '';
      setFormData({
        url,
        customTitle: video.customTitle || '',
      });
    } else {
      setFormData({
        url: '',
        customTitle: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [video, isOpen]);

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const validateField = <K extends keyof FormData>(field: K, value: FormData[K]): boolean => {
    let error = '';

    switch (field) {
      case 'url':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          error = '视频链接不能为空';
        } else if (typeof value === 'string' && !validateUrl(value)) {
          error = '请输入有效的B站视频链接或BV号';
        }
        break;
      case 'customTitle':
        if (value && typeof value === 'string' && value.length > 50) {
          error = '自定义标题最多50字符';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleUrlChange = (value: string) => {
    handleChange('url', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const urlValid = validateField('url', formData.url);
    const customTitleValid = validateField('customTitle', formData.customTitle);

    if (!urlValid || !customTitleValid) {
      toast.error('请检查表单输入');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        url: formData.url.trim(),
        customTitle: formData.customTitle.trim() || undefined,
      });
      toast.success(video ? '视频更新成功' : '视频创建成功');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const extracted = formData.url ? extractBvidAndPage(formData.url) : null;
  const previewVideo: Video | null = extracted
    ? {
        id: video?.id || '',
        bvid: extracted.bvid,
        title: formData.customTitle || '预览中...',
        order: 0,
        isEnabled: true,
      }
    : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card
        className="w-full max-w-4xl bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto"
        data-testid="video-form"
      >
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-white text-lg">{video ? '编辑视频' : '添加视频'}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Link2 className="w-4 h-4" />
                    B站视频链接
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={e => handleUrlChange(e.target.value)}
                    placeholder="输入BV号或粘贴B站视频链接"
                    className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.url && touched.url ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.url && touched.url ? (
                    <p className="text-sm text-red-500 mt-1">{errors.url}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      支持直接输入BV号或粘贴B站视频链接自动解析
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Type className="w-4 h-4" />
                    自定义标题
                    <span className="text-gray-500 text-xs">(可选)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customTitle}
                    onChange={e => handleChange('customTitle', e.target.value)}
                    placeholder="留空则使用B站原始标题"
                    maxLength={50}
                    className={`w-full px-3 py-2 bg-gray-900 border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.customTitle && touched.customTitle
                        ? 'border-red-500'
                        : 'border-gray-700'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.customTitle && touched.customTitle ? (
                      <p className="text-sm text-red-500">{errors.customTitle}</p>
                    ) : (
                      <p />
                    )}
                    <p className="text-sm text-gray-500">{formData.customTitle.length}/50</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">预览</label>
                <VideoPreview video={previewVideo} autoPlay={false} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                data-testid="cancel-button"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="submit-button"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoForm;
