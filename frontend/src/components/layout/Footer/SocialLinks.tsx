import React from 'react';
import { SocialLinkItem } from './SocialLinkItem';
import type { SocialLinkConfig } from '@/config/footer';

interface SocialLinksProps {
  links: SocialLinkConfig[];
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ links }) => {
  return (
    <div className="flex items-center gap-10" data-testid="social-links">
      {links.map((link, index) => (
        <SocialLinkItem key={`${link.platform}-${index}`} {...link} />
      ))}
    </div>
  );
};
