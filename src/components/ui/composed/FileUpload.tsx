import React from 'react';
import { FileUpload as PRFileUpload, type FileUploadProps as PRFileUploadProps } from 'primereact/fileupload';
import { classNames } from 'primereact/utils';

export const FileUpload = React.forwardRef<PRFileUpload, PRFileUploadProps>(({ className, ...props }, ref) => {
  return (
    <PRFileUpload
      ref={ref}
      className={classNames(
        'rounded-card border border-border-subtle bg-white shadow-soft',
        className
      )}
      contentClassName="bg-surface-subtle border-t border-border-strong px-6 py-8 flex flex-col items-center justify-center gap-4"
      chooseLabel="Attach Files"
      uploadLabel="Upload All"
      cancelLabel="Remove All"
      {...props}
    />
  );
});

FileUpload.displayName = 'FileUpload';
