import React from 'react';
import { SocialLinks } from './SocialLinks';
import { WeChatSection } from './WeChatSection';
import { ContactInfo } from './ContactInfo';
import { ICPInfo } from './ICPInfo';
import { FOOTER_CONFIG } from '@/config/footer';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={cn(
        'bg-gradient-to-b from-primary to-gray-900 text-white',
        'hidden lg:block',
        className
      )}
      role="contentinfo"
      data-testid="footer"
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: FOOTER_CONFIG.layout.maxWidth,
          padding: `${FOOTER_CONFIG.layout.paddingY} ${FOOTER_CONFIG.layout.paddingX}`,
        }}
      >
        {/* 上半部分：社交媒体 + 微信公众号 */}
        <div
          className="grid mb-8"
          style={{ gap: FOOTER_CONFIG.layout.gap }}
        >
          <div className="col-span-3">
            <SocialLinks links={FOOTER_CONFIG.socialLinks} />
          </div>
          <div className="col-span-1 flex justify-end">
            <WeChatSection
              name={FOOTER_CONFIG.wechat.name}
              qrCode={FOOTER_CONFIG.wechat.qrCode}
              size={FOOTER_CONFIG.wechat.size}
            />
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-[1px] bg-gold/50 mb-8" />

        {/* 下半部分：联系信息 + 备案号 */}
        <div className="flex justify-between items-center">
          <ContactInfo email={FOOTER_CONFIG.contact.email} />
          <ICPInfo number={FOOTER_CONFIG.icp.number} />
        </div>
      </div>
    </footer>
  );
};

// 导出所有子组件
export { SocialLinks, WeChatSection, ContactInfo, ICPInfo };
