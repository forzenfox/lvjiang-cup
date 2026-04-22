import React from 'react';

interface ContactInfoProps {
  email: string;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ email }) => {
  return (
    <div className="text-gray-300 text-sm" data-testid="contact-info">
      <span className="text-gold mr-2">📧</span>
      合作邮箱：{email}
    </div>
  );
};
