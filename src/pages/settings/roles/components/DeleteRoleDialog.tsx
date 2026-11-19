import { AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import type { RoleItem } from '@/store/api/roleApiSlice';

interface DeleteRoleDialogProps {
  visible: boolean;
  targetRole: RoleItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteRoleDialog({
  visible,
  targetRole,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteRoleDialogProps) {
  return (
    <Dialog visible={visible} onHide={onClose} header="Confirm Role Deletion" className="max-w-md">
      <div className="space-y-4 pt-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-foreground">
            Delete custom role "{targetRole?.name}"?
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            This action cannot be undone. All role permission associations will be permanently
            removed.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-4 border-t border-border/60">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Role'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
