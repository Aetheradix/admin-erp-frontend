import type { RefObject } from 'react';
import { useModalBehavior as useSharedModalBehavior } from '@/shared/hooks/useModalBehavior';

export function useModalBehavior(
  isOpen: boolean,
  onClose: () => void,
  modalRef?: RefObject<HTMLDivElement | null>
) {
  useSharedModalBehavior(isOpen, onClose, modalRef, { restoreFocus: false });
}
