import React, { useState, useEffect } from 'react';
import { X, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import HeroSelector from '@/components/team/HeroSelector';

export interface MemberFormData {
  avatarUrl?: string;
  nickname: string;
  gameId: string;
  position: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  bio?: string;
  championPool: string[];
  rating: number;
  isCaptain: boolean;
  liveUrl?: string;
}

export interface MemberFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: MemberFormData) => void;
  initialData?: MemberFormData | null;
}

// LOL 位置选项
const POSITIONS = [
  { value: 'TOP', label: '上单 (TOP)' },
  { value: 'JUNGLE', label: '打野 (JUNGLE)' },
  { value: 'MID', label: '中单 (MID)' },
  { value: 'ADC', label: 'ADC' },
  { value: 'SUPPORT', label: '辅助 (SUPPORT)' },
] as const;

const MAX_NICKNAME_LENGTH = 20;
const MAX_GAME_ID_LENGTH = 30;
const MAX_BIO_LENGTH = 200;
const MAX_CHAMPIONS = 5;

export const MemberForm: React.FC<MemberFormProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [position, setPosition] = useState<MemberFormData['position']>('MID');
  const [bio, setBio] = useState('');
  const [championPool, setChampionPool] = useState<string[]>([]);
  const [rating, setRating] = useState(60);
  const [isCaptain, setIsCaptain] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [errors, setErrors] = useState<{ nickname?: string; gameId?: string }>({});
  const [isHeroSelectorVisible, setIsHeroSelectorVisible] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setAvatarUrl(initialData.avatarUrl || '');
        setNickname(initialData.nickname);
        setGameId(initialData.gameId);
        setPosition(initialData.position);
        setBio(initialData.bio || '');
        setChampionPool(initialData.championPool || []);
        setRating(initialData.rating);
        setIsCaptain(initialData.isCaptain);
        setLiveUrl(initialData.liveUrl || '');
      } else {
        // 重置表单
        setAvatarUrl('');
        setNickname('');
        setGameId('');
        setPosition('MID');
        setBio('');
        setChampionPool([]);
        setRating(60);
        setIsCaptain(false);
        setLiveUrl('');
      }
      setErrors({});
    }
  }, [visible, initialData]);

  // 字符限制处理
  const handleNicknameChange = (value: string) => {
    if (value.length <= MAX_NICKNAME_LENGTH) {
      setNickname(value);
      if (errors.nickname) setErrors({ ...errors, nickname: undefined });
    }
  };

  const handleGameIdChange = (value: string) => {
    if (value.length <= MAX_GAME_ID_LENGTH) {
      setGameId(value);
      if (errors.gameId) setErrors({ ...errors, gameId: undefined });
    }
  };

  const handleBioChange = (value: string) => {
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
    }
  };

  // 表单验证
  const validate = (): boolean => {
    const newErrors: { nickname?: string; gameId?: string } = {};

    if (!nickname.trim()) {
      newErrors.nickname = '昵称不能为空';
    }

    if (!gameId.trim()) {
      newErrors.gameId = '游戏 ID 不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      avatarUrl: avatarUrl || undefined,
      nickname: nickname.trim(),
      gameId: gameId.trim(),
      position,
      bio: bio || undefined,
      championPool,
      rating,
      isCaptain,
      liveUrl: liveUrl || undefined,
    });
  };

  // 英雄选择确认
  const handleHeroConfirm = (heroes: string[]) => {
    setChampionPool(heroes);
  };

  // 获取字符计数颜色
  const getCharCountColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 100) return 'text-red-500';
    if (percentage > 90) return 'text-yellow-500';
    return 'text-gray-500';
  };

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
        data-testid="member-form"
        role="dialog"
        aria-modal="true"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? '编辑队员' : '添加队员'}
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
          {/* 头像 URL */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              头像
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="头像预览"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="24">?</text></svg>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-2xl">?</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="输入头像 URL 或点击上传"
                  className={cn(
                    'w-full px-3 py-2 text-sm text-white placeholder-[#475569]',
                    'bg-white/5 border border-white/10 rounded-lg',
                    'outline-none transition-colors duration-150',
                    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">支持 URL 或上传本地图片</p>
              </div>
            </div>
          </div>

          {/* 昵称 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              昵称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder="请输入昵称"
              className={cn(
                'w-full px-3 py-2 text-sm text-white placeholder-[#475569]',
                'bg-white/5 border rounded-lg',
                'outline-none transition-colors duration-150',
                errors.nickname
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              )}
              maxLength={MAX_NICKNAME_LENGTH}
            />
            {errors.nickname && (
              <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>
            )}
          </div>

          {/* 游戏 ID */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              游戏 ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => handleGameIdChange(e.target.value)}
              placeholder="请输入游戏 ID"
              className={cn(
                'w-full px-3 py-2 text-sm text-white placeholder-[#475569]',
                'bg-white/5 border rounded-lg',
                'outline-none transition-colors duration-150',
                errors.gameId
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              )}
              maxLength={MAX_GAME_ID_LENGTH}
            />
            {errors.gameId && (
              <p className="text-xs text-red-500 mt-1">{errors.gameId}</p>
            )}
          </div>

          {/* 位置 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              位置
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as MemberFormData['position'])}
              className={cn(
                'w-full px-3 py-2 text-sm text-white',
                'bg-white/5 border border-white/10 rounded-lg',
                'outline-none transition-colors duration-150',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                'cursor-pointer'
              )}
              role="combobox"
            >
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value} className="bg-[#0F172A]">
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          {/* 个人简介 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              个人简介
            </label>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => handleBioChange(e.target.value)}
                placeholder="介绍一下这位选手...（选填）"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 text-sm text-white placeholder-[#475569] resize-none',
                  'bg-white/5 border border-white/10 rounded-lg',
                  'outline-none transition-colors duration-150',
                  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                )}
                maxLength={MAX_BIO_LENGTH}
              />
              <span
                className={cn(
                  'absolute bottom-2 right-2 text-xs',
                  getCharCountColor(bio.length, MAX_BIO_LENGTH)
                )}
              >
                {bio.length}/{MAX_BIO_LENGTH}
              </span>
            </div>
          </div>

          {/* 英雄选择 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              常用英雄
            </label>
            <button
              type="button"
              onClick={() => setIsHeroSelectorVisible(true)}
              className={cn(
                'w-full px-3 py-2 text-sm text-left',
                'bg-white/5 border border-white/10 rounded-lg',
                'outline-none transition-colors duration-150',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                'hover:border-white/20 cursor-pointer'
              )}
            >
              {championPool.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {championPool.map((champion) => (
                    <span
                      key={champion}
                      className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded"
                    >
                      {champion}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[#475569]">
                  选择英雄 ({championPool.length}/{MAX_CHAMPIONS})
                </span>
              )}
            </button>
            {championPool.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                已选择 {championPool.length}/{MAX_CHAMPIONS} 个英雄
              </p>
            )}
          </div>

          {/* 评分 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              评分: <span className="text-yellow-500">{rating}</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className={cn(
                'w-full h-2 rounded-lg appearance-none cursor-pointer',
                'bg-white/10',
                '[&::-webkit-slider-thumb]:appearance-none',
                '[&::-webkit-slider-thumb]:w-4',
                '[&::-webkit-slider-thumb]:h-4',
                '[&::-webkit-slider-thumb]:rounded-full',
                '[&::-webkit-slider-thumb]:bg-yellow-500',
                '[&::-webkit-slider-thumb]:cursor-pointer',
                '[&::-webkit-slider-thumb]:transition-transform',
                '[&::-webkit-slider-thumb]:hover:scale-110'
              )}
              role="slider"
              aria-valuenow={rating}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* 队长 */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCaptain}
                onChange={(e) => setIsCaptain(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-yellow-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-yellow-500 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            <div className="flex items-center gap-2">
              <Crown className={cn('w-4 h-4', isCaptain ? 'text-yellow-500' : 'text-gray-500')} />
              <span className={cn('text-sm', isCaptain ? 'text-yellow-500' : 'text-[#94A3B8]')}>
                设为队长
              </span>
            </div>
          </div>

          {/* 直播间链接 */}
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              直播间链接
            </label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="输入直播间链接（选填）"
              className={cn(
                'w-full px-3 py-2 text-sm text-white placeholder-[#475569]',
                'bg-white/5 border border-white/10 rounded-lg',
                'outline-none transition-colors duration-150',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              )}
            />
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

        {/* 英雄选择器 */}
        <HeroSelector
          visible={isHeroSelectorVisible}
          onClose={() => setIsHeroSelectorVisible(false)}
          selectedHeroes={championPool}
          onConfirm={handleHeroConfirm}
          maxSelect={MAX_CHAMPIONS}
        />
      </div>
    </div>
  );
};

export default MemberForm;