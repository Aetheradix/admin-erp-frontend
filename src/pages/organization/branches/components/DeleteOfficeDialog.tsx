import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';

interface DeleteOfficeDialogProps {
  visible: boolean;
  isDeleting: boolean;
  onHide: () => void;
  onConfirm: () => void;
}

export function DeleteOfficeDialog({ visible, isDeleting, onHide, onConfirm }: DeleteOfficeDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Confirm Delete"
      modal
      className="w-full max-w-sm mx-4"
      contentClassName="p-6"
      headerClassName="px-6 pt-6 pb-2 text-lg font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-[28px] overflow-hidden border-none shadow-2xl bg-surface-elevated' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <div className="space-y-4">
        <p className="text-xs text-muted font-medium">
          Are you sure you want to remove this office location? Employees will no longer be able to check in against this geofence.
        </p>
        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            label="Cancel"
            onClick={onHide}
            className="rounded-xl!"
          />
          <Button
            type="button"
            disabled={isDeleting}
            label={isDeleting ? 'Deleting...' : 'Delete Office'}
            onClick={onConfirm}
            className="rounded-xl! px-5! bg-red-600 hover:bg-red-700 text-white font-black"
          />
        </div>
      </div>
    </Dialog>
  );
}
