import { useMemo, useState } from 'react';
import type { ProfileCompletionData } from '@/services/employeeProfileService';

export function useHiringSelection(combinedProfiles: ProfileCompletionData[]) {
  const [rawSelectedProfile, setSelectedProfile] = useState<ProfileCompletionData | null>(null);

  // Keep the selected profile fresh when the combined list changes
  const selectedProfile = useMemo(() => {
    if (!rawSelectedProfile) return null;
    return (
      combinedProfiles.find(
        (p) =>
          String(p.userId) === String(rawSelectedProfile.userId) ||
          (Boolean(p.userEmail) &&
            p.userEmail.toLowerCase() === rawSelectedProfile.userEmail?.toLowerCase())
      ) ?? rawSelectedProfile
    );
  }, [combinedProfiles, rawSelectedProfile]);

  return { selectedProfile, setSelectedProfile };
}
