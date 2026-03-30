import { Toast as PRToast } from 'primereact/toast';
import { useRef, useEffect } from 'react';

type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

interface ToastOptions {
  severity?: ToastSeverity;
  summary?: string;
  detail: string;
  life?: number;
}

const TOAST_EVENT = 'AETHER_SHOW_TOAST';

export const showToast = (options: ToastOptions) => {
  const event = new CustomEvent(TOAST_EVENT, { detail: options });
  window.dispatchEvent(event);
};

export const Toast = () => {
  const toast = useRef<PRToast>(null);

  useEffect(() => {
    const handleShowToast = (e: any) => {
      const { severity = 'info', summary = 'Notification', detail, life = 3000 } = e.detail;
      toast.current?.show({ severity, summary, detail, life });
    };

    window.addEventListener(TOAST_EVENT, handleShowToast);
    return () => window.removeEventListener(TOAST_EVENT, handleShowToast);
  }, []);

  return (
    <PRToast 
      ref={toast} 
      position="top-right"
      pt={{
        root: { className: 'z-[10000]' },
        message: { className: 'rounded-[20px] shadow-2xl backdrop-blur-md border-none px-6 py-4 mb-4 font-body animate-in slide-in-from-right duration-300' },
        content: { className: 'flex items-center gap-4' },
        icon: { className: 'text-2xl' },
        text: { className: 'flex flex-col gap-0.5' },
        summary: { className: 'font-black text-xs uppercase tracking-widest' },
        detail: { className: 'text-sm font-medium opacity-80 leading-tight' },
        closeButton: { className: 'opacity-40 hover:opacity-100 transition-opacity ml-auto' }
      }}
    />
  );
};
