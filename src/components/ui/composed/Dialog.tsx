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
  width?: string | number;
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
  footer = null,
  style,
  width,
  pt,
}: DialogProps) => {
  // Resolve responsive width: prefer explicit width prop, otherwise derive from max-w-* Tailwind classes
  const resolvedWidth =
    width ??
    (className?.includes('max-w-7xl')
      ? 'min(1400px, 96vw)'
      : className?.includes('max-w-6xl')
        ? 'min(1280px, 95vw)'
        : className?.includes('max-w-5xl')
          ? 'min(1080px, 94vw)'
          : className?.includes('max-w-4xl')
            ? 'min(900px, 92vw)'
            : className?.includes('max-w-3xl')
              ? 'min(768px, 90vw)'
              : className?.includes('max-w-2xl')
                ? 'min(672px, 90vw)'
                : className?.includes('max-w-xl')
                  ? 'min(576px, 90vw)'
                  : className?.includes('max-w-lg')
                    ? 'min(512px, 90vw)'
                    : className?.includes('max-w-md')
                      ? 'min(448px, 90vw)'
                      : undefined);

  return (
    <Modal
      open={visible}
      onCancel={onHide}
      width={resolvedWidth}
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
      style={{ maxWidth: '96vw', ...style }}
      destroyOnHidden>
      {children}
    </Modal>
  );
};
