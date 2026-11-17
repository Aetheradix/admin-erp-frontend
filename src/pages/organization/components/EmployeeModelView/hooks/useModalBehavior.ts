import { useEffect, type RefObject } from 'react';

export function useModalBehavior(
  isOpen: boolean,
  onClose: () => void,
  modalRef?: RefObject<HTMLDivElement | null>
) {
  // Prevent background scrolling
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus modal window on open for a11y
  useEffect(() => {
    if (isOpen && modalRef?.current) {
      modalRef.current.focus();
    }
  }, [isOpen, modalRef]);
}
