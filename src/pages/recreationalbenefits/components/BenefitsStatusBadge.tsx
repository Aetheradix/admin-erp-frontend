interface Props {
  status: 'Active' | 'Inactive' | 'Expired' | 'Revoked' | 'Pending' | 'Approved' | 'Rejected';
}

export default function BenefitsStatusBadge({ status }: Props) {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Inactive: 'bg-gray-100 text-gray-700',
    Expired: 'bg-orange-100 text-orange-700',
    Revoked: 'bg-red-100 text-red-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
