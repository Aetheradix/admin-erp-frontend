import { FormModal } from '@/shared';
import { StaffForm } from './StaffForm';
import type { StaffMember } from '@/types/models';

interface StaffMemberFormModalProps {
  visible: boolean;
  onHide: () => void;
  member: StaffMember | null;
  onSubmit: (data: Partial<StaffMember>) => void;
}

export function StaffMemberFormModal({
  visible,
  onHide,
  member,
  onSubmit,
}: StaffMemberFormModalProps) {
  return (
    <FormModal
      visible={visible}
      onHide={onHide}
      title={member ? 'Revise Member Profile' : 'Onboard New Specialist'}
      className="w-full max-w-4xl mx-4"
      contentClassName="p-10"
      headerClassName="px-10 pt-10 pb-4 text-2xl font-black tracking-tight border-none"
      pt={{
        root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
        mask: { className: 'backdrop-blur-md bg-black/40' },
      }}>
      <StaffForm initialData={member} onSubmit={onSubmit} onCancel={onHide} />
    </FormModal>
  );
}
