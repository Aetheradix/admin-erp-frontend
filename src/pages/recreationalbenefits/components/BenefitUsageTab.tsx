import { useState } from 'react';

import { useGetRecreationalBenefitUsageByBenefitQuery } from '@/store/api/recreationalbenefitsSlice';

import ApproveUsageDialog from '../components/ApproveUsageDialog';
import RejectUsageDialog from '../components/RejectUsageDialog';
import UsageStatusBadge from '../components/UsageStatusBadge';

interface Props {
  benefitId: number;
}

const BenefitUsageTab = ({ benefitId }: Props) => {
  const [approveId, setApproveId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);

  const {
    data: usage = [],
    isLoading,
    isError,
  } = useGetRecreationalBenefitUsageByBenefitQuery(benefitId);

  if (isLoading) {
    return <p className="text-gray-500">Loading usage...</p>;
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        Failed to load benefit usage.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold">Benefit Usage</h2>

          <p className="mt-1 text-sm text-gray-500">Usage submitted against this benefit.</p>
        </div>

        {usage.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">No usage recorded</p>

            <p className="mt-1 text-sm text-gray-500">
              Usage records will appear here when employees use this benefit.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Amount</th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                    Description
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Date</th>

                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Status</th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {usage.map((item) => (
                  <tr key={item.usage_id}>
                    <td className="px-5 py-4 text-sm">Employee #{item.assignment_id}</td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {item.usage_amount != null ? item.usage_amount.toLocaleString() : '-'}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-gray-600">
                      {item.usage_description || '-'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(item.usage_date)}
                    </td>

                    <td className="px-5 py-4">
                      <UsageStatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      {item.status === 'Pending' && (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setApproveId(item.usage_id)}
                            className="text-sm font-medium text-green-600"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => setRejectId(item.usage_id)}
                            className="text-sm font-medium text-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {approveId && (
        <ApproveUsageDialog usageId={approveId} open onClose={() => setApproveId(null)} />
      )}

      {rejectId && <RejectUsageDialog usageId={rejectId} open onClose={() => setRejectId(null)} />}
    </>
  );
};

const formatDate = (date?: string | null) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString();
};

export default BenefitUsageTab;
