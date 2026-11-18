import type { ReactNode } from 'react';
import { FormModal, type FormModalProps } from './FormModal';

export type DetailModalProps = Omit<FormModalProps, 'footer'> & { footer?: ReactNode | null };

export function DetailModal({ footer = null, ...props }: DetailModalProps) {
  return <FormModal {...props} footer={footer} />;
}
