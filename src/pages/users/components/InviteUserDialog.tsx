import { ShieldCheck } from 'lucide-react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import type { InviteForm, OptionItem } from '../types';
import { FormField } from './FormField';

interface InviteUserDialogProps {
  visible: boolean;
  form: InviteForm;
  setForm: (form: InviteForm) => void;
  availableRoles: OptionItem[];
  availableDepartments: OptionItem[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onHide: () => void;
}

export function InviteUserDialog({
  visible,
  form,
  setForm,
  availableRoles,
  availableDepartments,
  isSubmitting,
  onSubmit,
  onHide,
}: InviteUserDialogProps) {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Invite New User"
      modal
      className="w-full max-w-xl mx-4"
      contentClassName="p-8"
      headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <div className="flex flex-col gap-5">
        <p className="text-xs text-muted -mt-2">
          Send an onboarding invitation. An immutable audit record will track when the invitation was
          issued, the recipient, and status changes until onboarding is completed.
        </p>

        <FormField label="Full Name">
          <Input
            placeholder="e.g. John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>

        <FormField label="Work Email Address">
          <Input
            type="email"
            placeholder="john.doe@aetheradix.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Assigned Role">
            <Select
              options={availableRoles}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.value })}
              placeholder="Select role"
            />
          </FormField>
          <FormField label="Department">
            <Select
              options={availableDepartments}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.value })}
              placeholder="Select dept"
            />
          </FormField>
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3 mt-1">
          <ShieldCheck size={18} className="text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-foreground/80 space-y-1">
            <p className="font-semibold text-foreground">Audit & Security Policy</p>
            <p className="text-muted leading-relaxed">
              The invitation token will be valid for 7 days. The user will complete their profile,
              residential address, and set a compliant master password via the onboarding flow.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button variant="ghost" label="Cancel" onClick={onHide} className="rounded-md!" />
          <Button
            label={isSubmitting ? 'Dispatching...' : 'Send Invitation'}
            onClick={onSubmit}
            disabled={isSubmitting}
            icon="pi pi-send"
            className="rounded-md! px-8!"
          />
        </div>
      </div>
    </Dialog>
  );
}
