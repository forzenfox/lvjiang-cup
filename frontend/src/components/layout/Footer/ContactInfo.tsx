import React from 'react';

interface ContactInfoProps {
  email: string;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ email }) => {
  return (
    <div className="flex items-center gap-2 text-gray-300 text-sm" data-testid="contact-info">
      <svg
        className="w-4 h-4 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <span>
        合作邮箱：<span className="text-white">{email}</span>
      </span>
    </div>
  );
};
