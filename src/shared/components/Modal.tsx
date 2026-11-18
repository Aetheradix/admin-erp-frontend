import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useModalBehavior } from '../hooks/useModalBehavior';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  className?: string;
  bodyClassName?: string;
  ariaLabel?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  children,
  size = 'md',
  closeOnBackdrop = true,
  className,
  bodyClassName,
  ariaLabel,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useModalBehavior(isOpen, onClose, panelRef);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const hasHeader = Boolean(title || subtitle || icon);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
        className={cn(
          'bg-white w-full rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden outline-none',
          SIZE_MAP[size],
          className
        )}>
        {hasHeader && (
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              {icon}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-lg font-black text-slate-900 truncate">{title}</h2>
                )}
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0078d4]">
              <X size={18} />
            </button>
          </div>
        )}
        <div className={cn('px-6 py-5 overflow-y-auto max-h-[70vh]', bodyClassName)}>
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
