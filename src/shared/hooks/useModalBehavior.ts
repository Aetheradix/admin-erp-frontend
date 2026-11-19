import { useEffect, useRef, type RefObject } from 'react';

export interface ModalBehaviorOptions {
  lockScroll?: boolean;
  closeOnEscape?: boolean;
  restoreFocus?: boolean;
}

export function useModalBehavior(
  isOpen: boolean,
  onClose: () => void,
  modalRef?: RefObject<HTMLElement | null>,
  options: ModalBehaviorOptions = {}
): void {
  const { lockScroll = true, closeOnEscape = true, restoreFocus = true } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    return () => {
      if (restoreFocus && previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, restoreFocus]);

  useEffect(() => {
    if (!isOpen || !lockScroll) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, lockScroll]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen && modalRef?.current) {
      modalRef.current.focus();
    }
  }, [isOpen, modalRef]);
}
