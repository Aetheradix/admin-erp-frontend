import { Modal } from 'antd';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface DialogProps {
  visible: boolean;
  onHide: () => void;
  header?: ReactNode;
  modal?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  children: ReactNode;
  footer?: ReactNode | null;
  style?: React.CSSProperties;
  pt?: {
    root?: { className?: string };
    mask?: { className?: string };
  };
}

export const Dialog = ({
  visible,
  onHide,
  header,
  className,
  contentClassName,
  headerClassName,
  children,
  footer,
  style,
  pt,
}: DialogProps) => {
  return (
    <Modal
      open={visible}
      onCancel={onHide}
      title={
        header ? (
          <span className={cn('text-2xl font-black tracking-tight', headerClassName)}>
            {header}
          </span>
        ) : null
      }
      footer={footer}
      centered
      className={cn('premium-dialog', className)}
      classNames={{
        mask: cn('backdrop-blur-md !bg-black/40', pt?.mask?.className),
        body: cn('p-10', contentClassName),
        header: cn('px-10 pt-10 pb-4 border-none', headerClassName),
      }}
      styles={{
        body: { padding: 0 },
      }}
      style={style}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
};
