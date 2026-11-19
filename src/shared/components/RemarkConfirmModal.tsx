import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { FormModal } from './FormModal';

export interface RemarkConfirmModalProps {
  visible: boolean;
  onHide: () => void;
  title: string;
  message?: ReactNode;
  remarkLabel?: string;
  remarkPlaceholder?: string;
  requireRemark?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isSubmitting?: boolean;
  onConfirm: (remark: string) => void;
  className?: string;
}

export function RemarkConfirmModal({
  visible,
  onHide,
  title,
  message,
  remarkLabel = 'Remark',
  remarkPlaceholder = 'Add a remark…',
  requireRemark = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  isSubmitting = false,
  onConfirm,
  className,
}: RemarkConfirmModalProps) {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setRemark('');
    setError(null);
    onHide();
  };

  const handleConfirm = () => {
    if (requireRemark && !remark.trim()) {
      setError('A remark is required.');
      return;
    }
    setError(null);
    onConfirm(remark.trim());
    setRemark('');
  };

  return (
    <FormModal
      visible={visible}
      onHide={close}
      title={title}
      className={className}
      footer={
        <div className="flex justify-end gap-3 px-8 pb-8">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={isSubmitting}>
            {confirmLabel}
          </Button>
        </div>
      }>
      <div className="px-8 pb-2 flex flex-col gap-4">
        {message && <p className="text-sm text-muted font-medium">{message}</p>}
        <label className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-muted">
            {remarkLabel}
          </span>
          <Textarea
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            placeholder={remarkPlaceholder}
            aria-label={remarkLabel}
          />
        </label>
        {error && <p className="text-xs font-bold text-error">{error}</p>}
      </div>
    </FormModal>
  );
}
