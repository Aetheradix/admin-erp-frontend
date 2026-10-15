import React from 'react';
import { Upload } from 'antd';
import type { UploadProps } from 'antd';
import { cn } from '@/utils/cn';

interface FileUploadProps extends Omit<UploadProps, 'onChange'> {
  mode?: 'basic' | 'advanced';
  name?: string;
  accept?: string;
  maxFileSize?: number;
  chooseLabel?: string;
  uploadLabel?: string;
  cancelLabel?: string;
  contentClassName?: string;
  auto?: boolean;
  onUpload?: (e: { files: File[]; base64?: string }) => void;
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ className, mode = 'advanced', accept, maxFileSize, onUpload, ...props }, ref) => {
    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
      if (maxFileSize && file.size > maxFileSize) {
        return Upload.LIST_IGNORE;
      }

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (onUpload && e.target?.result) {
          onUpload({ files: [file], base64: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);

      return false; // Prevent automatic antd network upload
    };

    return (
      <div ref={ref} className={cn('rounded-card relative w-full h-full', className)}>
        <Upload
          showUploadList={mode === 'basic' ? false : true}
          accept={accept}
          beforeUpload={beforeUpload}
          multiple={false}
          className={cn(
            mode === 'basic' &&
              'w-full h-full block [&_.ant-upload]:w-full [&_.ant-upload]:h-full [&_.ant-upload]:block [&_.ant-upload-select]:w-full [&_.ant-upload-select]:h-full [&_.ant-upload-select]:block'
          )}
          {...props}>
          {mode === 'advanced' ? (
            <div className="bg-surface-subtle border-t border-border-strong px-6 py-8 flex flex-col items-center justify-center gap-4 cursor-pointer">
              <span className="font-bold text-primary">Attach Files</span>
            </div>
          ) : (
            <div className="w-full h-full absolute inset-0 cursor-pointer" />
          )}
        </Upload>
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
