import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

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
    <div className="sticky top-0 z-50 h-16 border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="返回上一页"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </motion.button>
          <div className="h-5 w-px bg-slate-700" />
          <div>
            <h1 className="text-lg font-bold text-white md:text-xl neon-text">对战数据详情</h1>
            {subtitle && <p className="mt-0.5 text-xs text-gray-400 md:text-sm">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
};

export default React.memo(MatchDataHeader);
