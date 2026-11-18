import { showToast } from '@/components/ui/composed/Toast.utils';
import { getApiErrorMessage, useConfirmAction } from '@/shared';
import {
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteUserMutation,
} from '@/store/api/userSlice';
import { usePromoteToAdminMutation } from '@/store/api/authApiSlice';
import { useSaveEmployeeCompensationMutation } from '@/store/api/financeApiSlice';
import { buildStaffPayload, type CreateStaffResponse } from '../utils/staffPayload';
import type { StaffMember } from '@/types/models';

export function useStaffMutations(editingMember: StaffMember | null, onSaved: () => void) {
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteUserMutation();
  const [promoteToAdmin] = usePromoteToAdminMutation();
  const [saveEmployeeCompensation] = useSaveEmployeeCompensationMutation();
  const confirm = useConfirmAction();

  const handlePromote = (id: string) => {
    confirm({
      message: 'Are you sure you want to promote this member to Administrator?',
      header: 'Confirm Promotion',
      onConfirm: async () => {
        try {
          await promoteToAdmin(id).unwrap();
          showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Member promoted to administrator successfully!',
            life: 3000,
          });
        } catch (err: unknown) {
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: getApiErrorMessage(err, 'Failed to promote member.'),
            life: 3000,
          });
        }
      },
    });
  };

  const handleDelete = (id: string) => {
    confirm({
      message: 'Are you sure you want to remove this staff member?',
      header: 'Confirm Deletion',
      onConfirm: async () => {
        try {
          await deleteStaff(id).unwrap();
          showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Staff member removed successfully.',
            life: 3000,
          });
        } catch (err) {
          console.error('Failed to remove member', err);
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove member.',
            life: 3000,
          });
        }
      },
    });
  };

  const handleSubmit = async (data: Partial<StaffMember>) => {
    try {
      const payload = buildStaffPayload(data);
      let savedUserId: string | number | undefined = editingMember?.id;

      if (editingMember) {
        await updateStaff({ id: editingMember.id, ...payload }).unwrap();
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff member updated successfully.',
          life: 3000,
        });
      } else {
        const createRes = (await createStaff(payload).unwrap()) as CreateStaffResponse;
        savedUserId = createRes.id ?? createRes.data?.id ?? createRes.user?.id;
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Staff member added successfully.',
          life: 3000,
        });
      }

      // Also sync dedicated Employee Compensation endpoint if compensation entered
      if (savedUserId && data.totalCompensation) {
        try {
          await saveEmployeeCompensation({
            userId: Number(savedUserId),
            ctcAnnual: Number(data.totalCompensation),
            taxRegime: String(data.taxRegime || '')
              .toLowerCase()
              .includes('old')
              ? 'old'
              : 'new',
            payFrequency: (data.payFrequency || 'monthly').toLowerCase(),
            effectiveDate:
              data.effectiveDate || data.joinDate || new Date().toISOString().split('T')[0],
            isMidYearJoiner: Boolean(data.isMidYearJoiner),
            previousEmployerGross: Number(data.previousEmployerYtd?.grossPay || 0),
            previousEmployerTds: Number(data.previousEmployerYtd?.tdsDeducted || 0),
            previousEmployerPf: Number(data.previousEmployerYtd?.pfDeducted || 0),
            previousEmployerStandardDeduction: Number(
              data.previousEmployerStandardDeduction ||
                data.previousEmployerYtd?.standardDeduction ||
                0
            ),
            section80c: Number(data.section80c || 0),
            section80d: Number(data.section80d || 0),
            hraExemption: Number(data.hraExemption || 0),
          }).unwrap();
        } catch (compErr) {
          console.warn('Could not sync to dedicated compensation endpoint:', compErr);
        }
      }

      onSaved();
    } catch (err) {
      console.error('Operation failed', err);
      showToast({ severity: 'error', summary: 'Error', detail: 'Operation failed.', life: 3000 });
    }
  };

  return { handlePromote, handleDelete, handleSubmit };
}
