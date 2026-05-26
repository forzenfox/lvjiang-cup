import React from 'react';
import { useNavigate } from 'react-router-dom';

const DisabledEditPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
      <div className="sticky top-0 z-50 h-16 border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              返回
            </button>
            <div className="h-5 w-px bg-slate-700" />
            <div>
              <h1 className="text-lg font-bold text-white md:text-xl neon-text">
                对战数据详情编辑
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c49f58]/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#c49f58]"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                fill="none"
                height="24"
                stroke="currentColor"
                strokeWidth="2"
                width="24"
                x="3"
                y="11"
              />
              <circle cx="12" cy="16" r="1" />
              <circle cx="8" cy="16" r="1" />
              <circle cx="16" cy="16" r="1" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">功能暂时禁用</h2>
          <p className="text-gray-400 mb-6">
            对战数据编辑功能暂时禁用
            <br />
            如有需要请联系管理员
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-[#c49f58] hover:bg-[#b08d4a] text-[#1a1a2e] font-bold rounded-lg transition-colors"
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
};

const MatchDataEditPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return <DisabledEditPage onBack={handleBack} />;
};

export default MatchDataEditPage;
