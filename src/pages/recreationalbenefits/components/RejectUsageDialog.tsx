import { useState } from 'react';

import { useRejectRecreationalBenefitUsageMutation } from '@/services/recreationalBenefitsApi';

interface Props {
  usageId: number;
  open: boolean;
  onClose: () => void;
}

const RejectUsageDialog = ({ usageId, open, onClose }: Props) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const [rejectUsage, { isLoading }] = useRejectRecreationalBenefitUsageMutation();

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }

    try {
      await rejectUsage({
        usageId,
        rejection_reason: reason.trim(),
      }).unwrap();

      setReason('');
      setError('');
      onClose();
    } catch (err) {
      console.error('Failed to reject usage:', err);

      setError('Failed to reject usage.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-lg font-semibold">Reject Usage</h2>

            <p className="mt-2 text-sm text-gray-500">
              Provide a reason for rejecting this usage request.
            </p>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium">Rejection Reason</label>

              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                disabled={isLoading}
                placeholder="Enter reason..."
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isLoading ? 'Rejecting...' : 'Reject Usage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectUsageDialog;
