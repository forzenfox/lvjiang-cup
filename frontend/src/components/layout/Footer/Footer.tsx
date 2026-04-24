import React, { useState } from 'react';
import { SocialLinks } from './SocialLinks';
import { WeChatSection } from './WeChatSection';
import { ContactInfo } from './ContactInfo';
import { ICPInfo } from './ICPInfo';
import { FOOTER_CONFIG } from '@/config/footer';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <>
      {/* 触发区域 - 底部不可见区域 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ height: '20px' }}
        data-testid="footer-trigger"
        onMouseEnter={() => {
          setIsOpen(true);
          setHasInteracted(true);
        }}
      />

      {/* 提示条 - 首次访问时显示，提示用户有页脚 */}
      <AnimatePresence>
        {!isOpen && !hasInteracted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
            className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 cursor-pointer"
            onMouseEnter={() => {
              setIsOpen(true);
              setHasInteracted(true);
            }}
          >
            <div className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-t-lg text-white/50 text-xs">
              <span className="mr-1">⌄</span> 鼠标移到底部查看页脚
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 抽屉式页脚 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        data-testid="footer-drawer"
        onMouseEnter={() => {
          setIsOpen(true);
          setHasInteracted(true);
        }}
        onMouseLeave={() => setIsOpen(false)}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.footer
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'bg-gradient-to-r from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] text-white shadow-2xl',
                'border-t-2 border-secondary/30',
                className
              )}
              role="contentinfo"
              data-testid="footer"
            >
              <div
                className="mx-auto px-6 py-4"
                style={{
                  maxWidth: FOOTER_CONFIG.layout.maxWidth,
                }}
              >
                {/* 紧凑布局：所有内容在一行 */}
                <div className="flex justify-between items-center">
                  {/* 左侧：社交媒体链接 */}
                  <div className="flex-shrink-0">
                    <SocialLinks links={FOOTER_CONFIG.socialLinks} />
                  </div>

                  {/* 中间：联系信息和备案号 */}
                  <div className="flex items-center gap-6">
                    <ContactInfo email={FOOTER_CONFIG.contact.email} />
                    <div className="w-[1px] h-4 bg-white/20" />
                    <ICPInfo number={FOOTER_CONFIG.icp.number} />
                  </div>

                  {/* 右侧：微信公众号 */}
                  <div className="flex-shrink-0">
                    <WeChatSection
                      name={FOOTER_CONFIG.wechat.name}
                      qrCode={FOOTER_CONFIG.wechat.qrCode}
                      size={FOOTER_CONFIG.wechat.size}
                    />
                  </div>
                </div>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// 导出所有子组件
export { SocialLinks, WeChatSection, ContactInfo, ICPInfo };
