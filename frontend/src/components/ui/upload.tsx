import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadProps {
  value?: string;
  onChange?: (value: string) => void;
  onFileSelect?: (file: File) => void;
  type?: 'avatar' | 'logo' | 'image';
  accept?: string;
  placeholder?: string;
  className?: string;
  maxSize?: number;
}

const Upload: React.FC<UploadProps> = ({
  value,
  onChange,
  onFileSelect,
  type = 'image',
  accept = 'image/*',
  placeholder = '点击上传图片',
  className,
  maxSize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      setError(`图片大小不能超过 ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      onChange?.(result);
    };
    reader.readAsDataURL(file);

    onFileSelect?.(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    onChange?.('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const sizeClasses = {
    avatar: 'w-16 h-16',
    logo: 'w-24 h-24',
    image: 'w-full h-32',
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
        isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20',
        error ? 'border-red-500' : '',
        className
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className={cn('relative overflow-hidden rounded-lg', sizeClasses[type])}>
          <img
            src={value}
            alt="上传预览"
            className="w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="24">?</text></svg>';
            }}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white transition-colors"
            aria-label="删除图片"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn('flex flex-col items-center justify-center gap-2 p-4', sizeClasses[type])}
        >
          <UploadIcon className="w-8 h-8 text-gray-500" />
          <span className="text-sm text-gray-500">{placeholder}</span>
        </div>
      )}

      {error && <div className="absolute -bottom-6 left-0 text-xs text-red-500">{error}</div>}
    </div>
  );
};

export default Upload;
