import type { InvitationRecord } from '@/services/auditService';
import type { InvitationCounts, InvitationStatusFilter } from '../types';

export function filterInvitationRecords(
  invitations: InvitationRecord[],
  filter: InvitationStatusFilter,
  search: string
): InvitationRecord[] {
  return invitations.filter((inv) => {
    if (filter !== 'all' && inv.status !== filter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      inv.name.toLowerCase().includes(term) ||
      inv.email.toLowerCase().includes(term) ||
      inv.role.toLowerCase().includes(term) ||
      inv.department.toLowerCase().includes(term) ||
      inv.invitedBy.name.toLowerCase().includes(term)
    );
  });
}

export function countInvitations(invitations: InvitationRecord[]): InvitationCounts {
  return {
    all: invitations.length,
    pending: invitations.filter((i) => i.status === 'pending').length,
    accepted: invitations.filter((i) => i.status === 'accepted').length,
    expired: invitations.filter((i) => i.status === 'expired').length,
    revoked: invitations.filter((i) => i.status === 'revoked').length,
  };
}

export function buildOnboardingUrl(email: string, token?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const tokenPart = token ? `token=${encodeURIComponent(token)}&` : '';
  return `${origin}/auth/onboarding?${tokenPart}email=${encodeURIComponent(email)}`;
}
