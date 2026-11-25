import type { ProfileCompletionData } from '@/services/employeeProfileService';
import { DetailField } from './DetailField';

interface PersonalTabProps {
  profile: ProfileCompletionData;
}

export function PersonalTab({ profile }: PersonalTabProps) {
  const personal = profile.personal;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DetailField label="Full Name" value={personal?.fullName || '—'} />
        <DetailField label="Contact Phone" value={personal?.contactNumber || '—'} />
        <DetailField label="Email" value={personal?.email || profile.userEmail || '—'} />
        <DetailField
          label="Date of Birth / Gender"
          value={`${personal?.dateOfBirth || '—'} (${personal?.gender || '—'})`}
        />
        <DetailField
          label="Nationality / Marital Status"
          value={`${personal?.nationality || '—'} / ${personal?.maritalStatus || '—'}`}
        />
        <DetailField label="Alternate Contact" value={personal?.alternateContact || '—'} />
        <DetailField
          label="Current Address"
          value={personal?.currentAddress || '—'}
          className="col-span-2"
          plain
        />
        <DetailField
          label="Permanent Address"
          value={personal?.permanentAddress || '—'}
          className="col-span-2"
          plain
        />
        <DetailField label="Emergency Contact Name" value={personal?.emergencyContactName || '—'} />
        <DetailField
          label="Emergency Contact Phone"
          value={personal?.emergencyContactPhone || '—'}
        />
      </div>
    </div>
  );
}
