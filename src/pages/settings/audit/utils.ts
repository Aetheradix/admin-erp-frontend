import { CheckCircle2, FileText, Lock, Mail } from 'lucide-react';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import type { User } from '@/types/auth';
import type { AuditActorInfo, JourneyStat, JourneyStep } from './types';

export function buildJourney(
  invitation: InvitationRecord,
  logs: AuditLogEntry[],
  actor: AuditActorInfo
): JourneyStep[] {
  const email = invitation.email.toLowerCase();

  const adminName = invitation.invitedBy?.name || actor.name;
  const adminRole = invitation.invitedBy?.role || actor.role;
  const adminEmail = invitation.invitedBy?.email || actor.email;

  const inviteSentLog = logs.find(
    (l) =>
      l.category === 'invitation' &&
      l.action.toLowerCase().includes('dispatched') &&
      (l.targetEmail?.toLowerCase() === email || l.target.toLowerCase().includes(email))
  );

  const passwordLog = logs.find(
    (l) =>
      l.category === 'security' &&
      l.action.toLowerCase().includes('password') &&
      (l.userEmail?.toLowerCase() === email || l.targetEmail?.toLowerCase() === email)
  );

  const onboardingCompleteLog = logs.find(
    (l) =>
      l.category === 'invitation' &&
      (l.action.toLowerCase().includes('onboarding') ||
        l.action.toLowerCase().includes('completed')) &&
      (l.userEmail?.toLowerCase() === email || l.targetEmail?.toLowerCase() === email)
  );

  const profileLog = logs.find(
    (l) =>
      l.category === 'profile' &&
      (l.userEmail?.toLowerCase() === email || l.targetEmail?.toLowerCase() === email)
  );

  const isAccepted = invitation.status === 'accepted';
  const isRevoked = invitation.status === 'revoked';
  const isExpired = invitation.status === 'expired';

  return [
    {
      label: 'Invitation Dispatched',
      description: `Dispatched by Admin ${adminName} (${adminRole} · ${adminEmail}) to ${invitation.name || invitation.email} for role ${invitation.role} (${invitation.department})`,
      timestamp: invitation.invitedAt,
      status: 'done',
      icon: Mail,
      logEntry: inviteSentLog,
    },
    {
      label: 'Invite Email Delivered',
      description: `Temporary credentials sent to ${invitation.email}`,
      timestamp: invitation.invitedAt,
      status: isRevoked || isExpired ? 'failed' : 'done',
      icon: Mail,
    },
    {
      label: 'Temporary Password Changed',
      description: 'User logged in and changed single-use temp password',
      timestamp: passwordLog?.timestamp,
      status: passwordLog ? 'done' : isAccepted ? 'done' : 'pending',
      icon: Lock,
      logEntry: passwordLog,
    },
    {
      label: 'Profile & Details Submitted',
      description: 'Full name, contact number, department and designation saved',
      timestamp: onboardingCompleteLog?.timestamp || profileLog?.timestamp,
      status: onboardingCompleteLog || isAccepted ? 'done' : 'pending',
      icon: FileText,
      logEntry: onboardingCompleteLog || profileLog,
    },
    {
      label: 'Account Fully Activated',
      description: 'Onboarding complete — user has full system access',
      timestamp: invitation.acceptedAt || onboardingCompleteLog?.timestamp,
      status: isAccepted ? 'done' : isRevoked ? 'failed' : 'pending',
      icon: CheckCircle2,
    },
  ];
}

export function filterAuditLogs(
  logs: AuditLogEntry[],
  search: string,
  categoryFilter: string,
  statusFilter: string
): AuditLogEntry[] {
  return logs.filter((l) => {
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(term) ||
      l.user.toLowerCase().includes(term) ||
      l.userEmail.toLowerCase().includes(term) ||
      l.target.toLowerCase().includes(term) ||
      (l.details && l.details.toLowerCase().includes(term))
    );
  });
}

export function filterInvitations(
  invitations: InvitationRecord[],
  search: string
): InvitationRecord[] {
  if (!search.trim()) return invitations;
  const term = search.toLowerCase();
  return invitations.filter(
    (inv) =>
      inv.email.toLowerCase().includes(term) ||
      inv.name.toLowerCase().includes(term) ||
      inv.role.toLowerCase().includes(term) ||
      inv.invitedBy.name.toLowerCase().includes(term)
  );
}

export function findMatchingInvitation(
  record: AuditLogEntry,
  invitations: InvitationRecord[]
): InvitationRecord | undefined {
  const targetEmail = record.targetEmail?.toLowerCase();
  const userEmail = record.userEmail?.toLowerCase();
  return invitations.find(
    (inv) =>
      (targetEmail && inv.email.toLowerCase() === targetEmail) ||
      (userEmail && inv.email.toLowerCase() === userEmail) ||
      (record.target && record.target.toLowerCase().includes(inv.email.toLowerCase()))
  );
}

export function resolveActorRole(
  record: AuditLogEntry,
  invitations: InvitationRecord[],
  currentAuthUser: User | null,
  actor: AuditActorInfo
): string {
  const explicitRole = (record as AuditLogEntry & { userRole?: string }).userRole;
  if (explicitRole) return explicitRole;
  if (
    currentAuthUser &&
    (record.userEmail?.toLowerCase() === currentAuthUser.email?.toLowerCase() ||
      record.user?.toLowerCase() === currentAuthUser.username?.toLowerCase())
  ) {
    return currentAuthUser.role || 'SuperAdmin';
  }
  const inv = invitations.find(
    (i) => i.invitedBy?.email?.toLowerCase() === record.userEmail?.toLowerCase()
  );
  if (inv?.invitedBy?.role && inv.invitedBy.role !== 'Admin') return inv.invitedBy.role;
  if (
    record.userEmail?.toLowerCase().includes('admin') ||
    record.user?.toLowerCase().includes('admin')
  ) {
    return actor.role;
  }
  if (record.category === 'invitation' || record.category === 'admin') return actor.role;
  return 'Staff';
}

export function buildJourneyStats(invitations: InvitationRecord[]): JourneyStat[] {
  return [
    {
      label: 'Total Invites',
      value: invitations.length,
      color: 'text-primary',
      bg: 'bg-primary/5',
    },
    {
      label: 'Accepted',
      value: invitations.filter((i) => i.status === 'accepted').length,
      color: 'text-success',
      bg: 'bg-success/5',
    },
    {
      label: 'Pending',
      value: invitations.filter((i) => i.status === 'pending').length,
      color: 'text-warning',
      bg: 'bg-warning/5',
    },
    {
      label: 'Expired / Revoked',
      value: invitations.filter((i) => i.status === 'expired' || i.status === 'revoked').length,
      color: 'text-error',
      bg: 'bg-error/5',
    },
  ];
}
