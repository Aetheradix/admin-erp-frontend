import { useApproveRecreationalBenefitUsageMutation } from '@/store/api/recreationalbenefitsSlice';

interface Props {
  usageId: number;
  open: boolean;
  onClose: () => void;
}

const ApproveUsageDialog = ({ usageId, open, onClose }: Props) => {
  const [approveUsage, { isLoading }] = useApproveRecreationalBenefitUsageMutation();

  if (!open) return null;

  const handleApprove = async () => {
    try {
      await approveUsage(usageId).unwrap();

      onClose();
    } catch (error) {
      console.error('Failed to approve usage:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Approve Usage?</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Are you sure you want to approve this usage request?
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLoading ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveUsageDialog;
