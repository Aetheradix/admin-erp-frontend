import { UserPlus } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import type { InviteResultState } from '../types';
import { FormField } from './FormField';

interface InviteResultDialogProps {
  visible: boolean;
  result: InviteResultState;
  copiedLink: boolean;
  copiedPass: boolean;
  onCopyLink: () => void;
  onCopyPass: () => void;
  onHide: () => void;
}

export function InviteResultDialog({
  visible,
  result,
  copiedLink,
  copiedPass,
  onCopyLink,
  onCopyPass,
  onHide,
}: InviteResultDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Invitation Dispatched & Recorded"
      modal
      className="w-full max-w-lg mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success">
          <UserPlus size={20} className="shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Invitation and audit trail entry created for </span>
            <span className="font-extrabold underline">{result.email}</span>
            <span> ({result.role})</span>
          </div>
        </div>

        <FormField label="Onboarding / Invite Link">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={result.link}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-mono text-foreground focus:outline-none select-all"
            />
            <Button
              variant={copiedLink ? 'outline' : 'primary'}
              label={copiedLink ? 'Copied!' : 'Copy'}
              icon={copiedLink ? 'pi pi-check' : 'pi pi-copy'}
              onClick={onCopyLink}
              className="rounded-md! shrink-0!"
            />
          </div>
        </FormField>

        <FormField label="Temporary Password">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={result.tempPass}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-mono font-bold text-foreground focus:outline-none select-all"
            />
            <Button
              variant={copiedPass ? 'outline' : 'secondary'}
              label={copiedPass ? 'Copied!' : 'Copy'}
              icon={copiedPass ? 'pi pi-check' : 'pi pi-copy'}
              onClick={onCopyPass}
              className="rounded-md! shrink-0!"
            />
          </div>
        </FormField>

        <div className="text-xs text-muted leading-relaxed p-3 rounded-lg bg-surface-subtle">
          💡 Share this link with the recipient. The invitation status is currently{' '}
          <strong className="text-warning">Pending</strong> and will transition to{' '}
          <strong className="text-success">Accepted & Active</strong> once they complete the
          onboarding wizard.
        </div>

        <div className="flex justify-end pt-2">
          <Button label="Done" onClick={onHide} className="rounded-md! px-8!" />
        </div>
      </div>
    </Dialog>
  );
}
