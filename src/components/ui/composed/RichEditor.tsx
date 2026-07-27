// import React, { useEffect, useRef } from 'react';

// import Quill from 'quill';
// import 'quill/dist/quill.snow.css';
// import { cn } from '@/utils/cn';

// interface RichEditorTextChangeEvent {
//   htmlValue?: string;
//   textValue?: string;
// }

// interface RichEditorProps {
//   value?: string;
//   onTextChange?: (e: RichEditorTextChangeEvent) => void;
//   className?: string;
//   style?: React.CSSProperties;
//   placeholder?: string;
//   readOnly?: boolean;
// }

// export const RichEditor = React.forwardRef<HTMLDivElement, RichEditorProps>(({
//   value = '',
//   onTextChange,
//   className,
//   style,
//   placeholder,
//   readOnly,
// }, ref) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const quillRef = useRef<Quill | null>(null);

//   // CHANGED: Keep latest callback reference
//   // Prevents stale onTextChange because Quill initializes only once
//   const onTextChangeRef = useRef(onTextChange);

//   // CHANGED: Update callback reference whenever parent changes
//   useEffect(() => {
//     onTextChangeRef.current = onTextChange;
//   }, [onTextChange]);


//   useEffect(() => {
//     if (!containerRef.current || quillRef.current) return;

//     const editorContainer = document.createElement('div');
//     containerRef.current.appendChild(editorContainer);

//     // quillRef.current = new Quill(editorContainer, {
//     //   theme: 'snow',
//     //   placeholder,
//     //   readOnly,
//     //   modules: {
//     //     toolbar: [
//     //       [{ header: [1, 2, 3, false] }],
//     //       ['bold', 'italic', 'underline', 'strike'],
//     //       [{ list: 'ordered' }, { list: 'bullet' }],
//     //       ['link', 'image'],
//     //       ['clean'],
//     //     ],
//     //   },
//     // });
//       quillRef.current = new Quill(editorContainer, {
//   theme: 'snow',
//   placeholder,
//   readOnly,
//   modules: {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       ['link', 'image'],
//       ['clean'],
//     ],
//   },
// });
// const quillContainer = editorContainer.querySelector('.ql-container') as HTMLElement;
// const quillEditor = editorContainer.querySelector('.ql-editor') as HTMLElement;

// if (quillContainer) {
//   quillContainer.style.height = '100%';
// }

// if (quillEditor) {
//   quillEditor.style.height = '100%';
// }


// // CHANGED: Make sure editor receives focus
// quillRef.current.focus();
//     // if (value) {
//     //   quillRef.current.root.innerHTML = value;
//     // }

//     // CHANGED: Use Quill API instead of directly changing innerHTML
//     if (value) {
//       quillRef.current.clipboard.dangerouslyPasteHTML(value);
//     }

//     // quillRef.current.on('text-change', () => {

//     //   // CHANGED: Added variables for debugging and cleaner handling
//     //   const htmlValue = quillRef.current?.root.innerHTML || '';
//     //   const textValue = quillRef.current?.getText() || '';

//     //   console.log("Quill HTML:", htmlValue);
//     //   console.log("Quill TEXT:", textValue);

//     //   // CHANGED: Use ref callback instead of direct callback
//     //   onTextChangeRef.current?.({
//     //     htmlValue,
//     //     textValue,
//     //   });
//     // });


//     quillRef.current.on('text-change', () => {
//   onTextChange?.({
//     htmlValue: quillRef.current?.root.innerHTML,
//     textValue: quillRef.current?.getText(),
//   });
// });
//     return () => {
//       quillRef.current = null;

//       if (containerRef.current) {
//         containerRef.current.innerHTML = '';
//       }
//     };
//   }, []);


//   // useEffect(() => {
//   //   if (quillRef.current && value !== quillRef.current.root.innerHTML) {
//   //     quillRef.current.root.innerHTML = value;
//   //   }
//   // }, [value]);

// useEffect(() => {
//   // CHANGED: Do not reset Quill while typing
//   if (
//     quillRef.current &&
//     value &&
//     value !== quillRef.current.root.innerHTML
//   ) {
//     quillRef.current.clipboard.dangerouslyPasteHTML(value);
//   }
// }, []);


//   return (
//     <div
//       ref={(node) => {
//         (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;

//         if (typeof ref === 'function') {
//           ref(node);
//         } else if (ref) {
//           ref.current = node;
//         }
//       }}
//       className={cn(
//         'overflow-hidden border border-border-subtle bg-white shadow-soft rounded-2xl',
//         className
//       )}
//       style={style}
//     />
//   );
// });

// RichEditor.displayName = 'RichEditor';



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

  // CHANGED: Keep latest callback reference
  // Prevents stale callback because Quill initializes only once
  const onTextChangeRef = useRef(onTextChange);

  // CHANGED: Update callback reference
  useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);


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


    // CHANGED: Load initial HTML using Quill API
    // Prevents empty content issue
    if (value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }


    // CHANGED: Use latest callback reference
    // quillRef.current.on('text-change', () => {
    //   const htmlValue = quillRef.current?.root.innerHTML || '';
    //   const textValue = quillRef.current?.getText() || '';

    //   onTextChangeRef.current?.({
    //     htmlValue,
    //     textValue,
    //   });
    // });

     // CHANGED: Capture Quill user typing changes
      quillRef.current.on('text-change', () => {
  const htmlValue = quillRef.current?.root.innerHTML || '';
  const textValue = quillRef.current?.getText() || '';

  console.log("Quill HTML:", htmlValue);
  console.log("Quill TEXT:", textValue);

  onTextChangeRef.current?.({
    htmlValue,
    textValue,
  });
});


    return () => {
      quillRef.current = null;

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };

  },[]);


  useEffect(() => {
    // CHANGED: Update editor only when external value changes
    // Avoids resetting while typing
    if (
      quillRef.current &&
      value &&
      value !== quillRef.current.root.innerHTML
    ) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);


  return (
    <div
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        'overflow-hidden border border-border-subtle bg-white shadow-soft rounded-2xl',
        className
      )}
      style={style}
    />
  );
});

RichEditor.displayName = 'RichEditor';
