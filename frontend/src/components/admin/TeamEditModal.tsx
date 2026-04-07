import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Upload } from '@/components/ui';
import type { Team } from '@/types';

export interface TeamEditModalProps {
  visible: boolean;
  team: Team | null;
  onClose: () => void;
  onSave: (team: Team) => void;
}

const MAX_DESCRIPTION_LENGTH = 100;

export const TeamEditModal: React.FC<TeamEditModalProps> = ({
  visible,
  team,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (team) {
        setName(team.name || '');
        setLogo(team.logo || '');
        setDescription(team.description || '');
      } else {
        // 重置表单
        setName('');
        setLogo('');
        setDescription('');
      }
      setErrors({});
    }
  }, [visible, team]);

  // 表单验证
  const validate = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = '战队名称不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      id: team?.id || `team-${Date.now()}`,
      name: name.trim(),
      logo,
      description: description.trim(),
      players: team?.players || [],
    });
  };

  // 获取字符计数颜色
  const getCharCountColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 100) return 'text-red-500';
    if (percentage > 90) return 'text-yellow-500';
    return 'text-[#64748B]';
  };

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  // 防止背景滚动
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩背景 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 弹框内容 */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg mx-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl',
          'animate-in zoom-in-95 fade-in duration-200'
        )}
        data-testid="team-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-edit-modal-title"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 id="team-edit-modal-title" className="text-lg font-semibold text-white">
            {team ? '编辑战队' : '新建战队'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* 战队图标 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              战队图标
            </label>
            <div className="flex items-center gap-4">
              <Upload
                value={logo}
                onChange={setLogo}
                type="logo"
                placeholder="上传战队图标"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="或输入图标 URL"
                  className={cn(
                    'w-full px-3 py-2 text-sm text-white placeholder-[#475569]',
                    'bg-white/5 border border-white/10 rounded-lg',
                    'outline-none transition-colors duration-150',
                    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  )}
                />
              </div>
            </div>
          </div>

          {/* 战队名称 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              战队名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="请输入战队名称"
              className={cn(
                'w-full px-3 py-2 text-sm text-white placeholder-[#475569]',
                'bg-white/5 border rounded-lg',
                'outline-none transition-colors duration-150',
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              )}
              maxLength={50}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* 参赛宣言 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              参赛宣言
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入参赛宣言"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 text-sm text-white placeholder-[#475569] resize-none',
                  'bg-white/5 border border-white/10 rounded-lg',
                  'outline-none transition-colors duration-150',
                  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                )}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              <span
                className={cn(
                  'absolute bottom-2 right-2 text-xs',
                  getCharCountColor(description.length, MAX_DESCRIPTION_LENGTH)
                )}
              >
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className={cn(
              'px-4 py-2 text-sm font-medium text-black',
              'bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg',
              'hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-300',
              'border border-yellow-300'
            )}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamEditModal;