import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MatchDataHeaderProps {
  onBack?: () => void;
  subtitle?: string;
  action?: React.ReactNode;
}

const MatchDataHeader: React.FC<MatchDataHeaderProps> = ({ onBack, subtitle, action }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="返回上一页"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          返回
        </motion.button>
        <div className="h-5 w-px bg-slate-700" />
        <div>
          <h1 className="text-lg font-bold text-white md:text-xl">对战数据详情</h1>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400 md:text-sm">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export default React.memo(MatchDataHeader);
