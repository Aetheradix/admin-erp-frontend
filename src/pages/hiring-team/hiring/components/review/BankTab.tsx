import type { ProfileCompletionData } from '@/services/employeeProfileService';
import { DetailField } from './DetailField';

interface BankTabProps {
  profile: ProfileCompletionData;
}

export function BankTab({ profile }: BankTabProps) {
  const bank = profile.bank;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="Account Holder Name" value={bank?.accountHolderName || '—'} />
        <DetailField label="Bank Name" value={bank?.bankName || '—'} />
        <DetailField
          label="Account Number"
          value={bank?.accountNumber ? `••••••••${bank.accountNumber.slice(-4)}` : '—'}
          mono
        />
        <DetailField label="IFSC Code" value={bank?.ifscCode || '—'} mono />
        <DetailField label="Branch Name" value={bank?.branchName || '—'} />
        <DetailField label="Account Type" value={bank?.accountType || '—'} capitalize />
      </div>
    </div>
  );
}
