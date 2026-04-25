import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface MatchDataHeaderProps {
  onBack?: () => void;
  subtitle?: string;
  action?: React.ReactNode;
  title?: string;
}

const MatchDataHeader: React.FC<MatchDataHeaderProps> = ({
  onBack,
  subtitle,
  action,
  title = '对战数据详情',
}) => {
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
      <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-8">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-slate-800 hover:text-white flex-shrink-0"
            aria-label="返回上一页"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </motion.button>
          <div className="h-5 w-px bg-slate-700 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white md:text-xl neon-text truncate">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-400 md:text-sm truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="flex items-center gap-2 flex-shrink-0 pr-8">{action}</div>}
      </div>
    </div>
  );
};

export default React.memo(MatchDataHeader);
