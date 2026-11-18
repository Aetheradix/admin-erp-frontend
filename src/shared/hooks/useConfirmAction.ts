import { useCallback } from 'react';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';

export interface ConfirmActionOptions {
  message: string;
  header?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirmAction() {
  return useCallback(({ message, header, onConfirm, onCancel }: ConfirmActionOptions) => {
    showConfirm({
      message,
      header,
      accept: onConfirm,
      reject: onCancel,
    });
  }, []);
}
