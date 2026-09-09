import { useRevokeRecreationalBenefitMutation } from '@/store/api/recreationalbenefitsSlice';

interface Props {
  assignmentId: number;
  open: boolean;
  onClose: () => void;
}

const RevokeAssignmentDialog = ({ assignmentId, open, onClose }: Props) => {
  const [revokeBenefit, { isLoading }] = useRevokeRecreationalBenefitMutation();

  if (!open) return null;

  const handleRevoke = async () => {
    try {
      await revokeBenefit(assignmentId).unwrap();

      onClose();
    } catch (error) {
      console.error('Failed to revoke assignment:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <span className="text-red-600">!</span>
          </div>

          <h2 className="text-lg font-semibold text-gray-900">Revoke Benefit?</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Are you sure you want to revoke this benefit assignment? The employee will no longer be
            able to use this assignment.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleRevoke}
            disabled={isLoading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Revoking...' : 'Revoke'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevokeAssignmentDialog;
