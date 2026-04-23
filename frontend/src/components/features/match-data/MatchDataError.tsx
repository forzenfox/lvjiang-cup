import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatchDataErrorProps {
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

const MatchDataError: React.FC<MatchDataErrorProps> = ({
  message = '数据加载失败',
  onRetry,
  retrying = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[60vh] flex flex-col items-center justify-center px-4"
    >
      {/* 错误图标 */}
      <div className="w-16 h-16 mb-6 text-red-500">
        <AlertCircle className="w-full h-full" strokeWidth={1.5} />
      </div>

      {/* 错误标题 */}
      <h2 className="text-xl font-bold text-white mb-2">{message}</h2>

      {/* 错误描述 */}
      <p className="text-gray-400 text-center max-w-md mb-8">
        数据加载失败，请检查网络连接或稍后重试
      </p>

      {/* 重试按钮 */}
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          disabled={retrying}
          className="flex items-center gap-2 px-6 py-3 
                     bg-gradient-to-r from-yellow-400 to-yellow-600 
                     text-[#1a1a2e] font-bold rounded-lg 
                     hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {retrying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              加载中...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                  clipRule="evenodd"
                />
              </svg>
              刷新重试
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default MatchDataError;
