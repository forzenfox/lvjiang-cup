import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxLength?: number;
  showCount?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, maxLength, showCount = true, value, ...props }, ref) => {
    const textareaId = React.useId();
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block mb-2 text-sm font-medium text-gray-200">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg',
            'text-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all duration-200',
            'resize-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          ref={ref}
          {...props}
        />
        {showCount && maxLength && (
          <p
            className={cn(
              'mt-1.5 text-sm text-right',
              charCount >= maxLength ? 'text-red-400' : 'text-gray-400'
            )}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };
