import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { cn } from '@/utils/cn';

interface RichEditorTextChangeEvent {
  htmlValue?: string;
  textValue?: string;
}

interface RichEditorProps {
  value?: string;
  onTextChange?: (e: RichEditorTextChangeEvent) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  readOnly?: boolean;
}

export const RichEditor = React.forwardRef<HTMLDivElement, RichEditorProps>(({
  value = '',
  onTextChange,
  className,
  style,
  placeholder,
  readOnly,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const editorContainer = document.createElement('div');
    containerRef.current.appendChild(editorContainer);

    quillRef.current = new Quill(editorContainer, {
      theme: 'snow',
      placeholder,
      readOnly,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean'],
        ],
      },
    });

    if (value) {
      quillRef.current.root.innerHTML = value;
    }

    quillRef.current.on('text-change', () => {
      onTextChange?.({
        htmlValue: quillRef.current?.root.innerHTML,
        textValue: quillRef.current?.getText(),
      });
    });

    return () => {
      quillRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn('overflow-hidden border border-border-subtle bg-white shadow-soft rounded-2xl', className)}
      style={style}
    />
  );
});

RichEditor.displayName = 'RichEditor';
