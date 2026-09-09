import type { RecreationalBenefitUsageStatus } from '../types/index';

interface Props {
  status: RecreationalBenefitUsageStatus;
}

const UsageStatusBadge = ({ status }: Props) => {
  const styles: Record<RecreationalBenefitUsageStatus, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Cancelled: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

export default UsageStatusBadge;
