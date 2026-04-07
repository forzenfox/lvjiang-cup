import React, { useEffect } from 'react';
import MemberCard, { TeamMember } from './MemberCard';

interface MemberDetailModalProps {
  visible: boolean;
  onClose: () => void;
  team: {
    id: string;
    name: string;
    members: TeamMember[];
  };
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  visible,
  onClose,
  team,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  // Handle body overflow
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 黑色遮罩背景 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        style={{
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 弹框内容 */}
      <div
        className="relative z-50 w-full max-w-3xl mx-4 rounded-2xl overflow-hidden"
        style={{
          background: '#0F172A',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxHeight: '600px',
          animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-modal-title"
      >
        {/* 标题栏 */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-white/10"
          style={{
            height: '64px',
          }}
        >
          <h2
            id="member-modal-title"
            className="text-xl font-semibold text-slate-100"
          >
            {team.name} 战队成员详情
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div
          className="p-6 overflow-y-auto"
          style={{
            maxHeight: 'calc(600px - 64px)',
          }}
        >
          {/* 网格布局 */}
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            {team.members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default MemberDetailModal;