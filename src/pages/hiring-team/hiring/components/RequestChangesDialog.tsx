import { Send } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';

interface RequestChangesDialogProps {
  visible: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function RequestChangesDialog({
  visible,
  notes,
  onNotesChange,
  onClose,
  onSubmit,
}: RequestChangesDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      width={500}
      header={<h3 className="text-base font-black text-foreground">Request Profile Changes</h3>}>
      <div className="space-y-4 pt-2">
        <p className="text-xs text-muted">
          Explain what documents or fields the employee needs to update or re-upload. The employee
          will see this message upon logging in.
        </p>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
            Feedback & Correction Instructions *
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="e.g. Please upload a clear photo of your PAN card, and verify your bank account number."
            className="w-full px-4 py-3 rounded-xl border border-border-subtle text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border-subtle bg-white text-foreground text-xs font-bold">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-5 py-2 rounded-xl bg-warning text-white hover:bg-warning/90 text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Send size={13} />
            Send to Employee
          </button>
        </div>
      </div>
    </Dialog>
  );
}
