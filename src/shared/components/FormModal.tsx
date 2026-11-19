import type { CSSProperties, ReactNode } from 'react';
import { Dialog, type DialogProps } from '@/components/ui/composed/Dialog';

export interface FormModalProps {
  visible: boolean;
  onHide: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode | null;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  width?: string | number;
  style?: CSSProperties;
  pt?: DialogProps['pt'];
}

export function FormModal({
  visible,
  onHide,
  title,
  children,
  footer = null,
  ...dialogProps
}: FormModalProps) {
  return (
    <Dialog visible={visible} onHide={onHide} header={title} modal footer={footer} {...dialogProps}>
      {children}
    </Dialog>
  );
}
