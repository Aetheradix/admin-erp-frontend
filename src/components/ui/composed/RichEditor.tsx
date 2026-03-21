import React from 'react';
import { Editor, type EditorProps } from 'primereact/editor';
import { classNames } from 'primereact/utils';

export const RichEditor = React.forwardRef<Editor, EditorProps>(({ className, ...props }, ref) => {
  return (
    <Editor
      ref={ref}
      className={classNames(
        ' overflow-hidden border border-border-subtle bg-white shadow-soft',
        className
      )}
      {...props}
    />
  );
});

RichEditor.displayName = 'RichEditor';
