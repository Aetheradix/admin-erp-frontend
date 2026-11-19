import { message } from 'antd';
import type { InvitationRecord } from '@/services/auditService';
import { useResendSystemInvitationMutation } from '@/store/api/authApiSlice';
import { buildOnboardingUrl } from '../utils';

interface UseResendInvitationParams {
  refetchInvitations: () => void;
  refetchAuditLogs: () => void;
}

export function useResendInvitation({
  refetchInvitations,
  refetchAuditLogs,
}: UseResendInvitationParams) {
  const [resendSystemInvitation] = useResendSystemInvitationMutation();

  const handleResendInvitation = async (inv: InvitationRecord) => {
    try {
      const result = await resendSystemInvitation(inv.id).unwrap();
      if (result.success) {
        const newLink = buildOnboardingUrl(inv.email, result.token);
        navigator.clipboard.writeText(newLink).catch(() => {});
        message.success(`Invitation renewed for ${inv.email}! New onboarding link copied.`);
        refetchInvitations();
        refetchAuditLogs();
      } else {
        message.error('Failed to renew invitation.');
      }
    } catch {
      message.error('Failed to renew invitation — please try again.');
    }
  };

  return { handleResendInvitation };
}
