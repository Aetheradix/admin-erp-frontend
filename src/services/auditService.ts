/**
 * Audit Logging and Invitation Management Service
 * Provides centralized tracking for user invitations, status changes (pending, accepted, expired, revoked),
 * profile edits, password updates, and system-wide security actions.
 */

import { API_URL } from '@/config/env';
import { broadcastSync } from './syncService';
import { filterLogsByRetention } from '@/utils/auditExport';
export interface InvitationRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  invitedBy: {
    name: string;
    email: string;
    role: string;
  };
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
  tempPassword?: string;
  acceptedAt?: string;
  revokedAt?: string;
  revokedBy?: {
    name: string;
    email: string;
  };
  resendCount?: number;
  lastResentAt?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  category:
    | 'invitation'
    | 'profile'
    | 'security'
    | 'user_management'
    | 'admin'
    | 'invoice'
    | 'finance'
    | 'payroll';
  user: string;
  userEmail: string;
  target: string;
  targetEmail?: string;
  timestamp: string;
  ip: string;
  status: 'Success' | 'Warning' | 'Critical';
  details?: string;
  changes?: Array<{
    field: string;
    from: any;
    to: any;
  }>;
}

const INVITATIONS_STORAGE_KEY = 'aether_user_invitations';
const AUDIT_LOGS_STORAGE_KEY = 'aether_system_audit_logs';


// Helper to notify all listening components that audit logs or invitations changed
const notifyChange = (event: 'invitations' | 'audit_logs') => {
  broadcastSync(event);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`aether_${event}_updated`));
    try {
      const ch = new BroadcastChannel('aether_events');
      ch.postMessage({ type: `aether_${event}_updated`, timestamp: Date.now() });
      ch.close();
    } catch {}
    localStorage.setItem('aether_last_onboarding_sync', Date.now().toString());
  }
};

/**
 * Fetch all invitations with automatic expiration status updates
 */
export function getInvitations(): InvitationRecord[] {
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (!raw) return [];
    let list: InvitationRecord[] = JSON.parse(raw);

    // Check expiration status against current time
    const now = Date.now();
    let updated = false;

    list = list.map((inv) => {
      if (inv.status === 'pending') {
        const expiryTime = new Date(inv.expiresAt).getTime();
        if (now > expiryTime) {
          updated = true;
          return { ...inv, status: 'expired' as const };
        }
      }
      return inv;
    });

    if (updated) {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    return [];
  }
}

/**
 * Create and record a new user invitation
 */
export function createInvitation(payload: {
  email: string;
  name: string;
  role: string;
  department: string;
  invitedBy: {
    name: string;
    email: string;
    role: string;
  };
  customExpiryDays?: number;
  tempPassword?: string;
}): { invitation: InvitationRecord; link: string } {
  const invitations = getInvitations();

  // Generate secure token and ID
  const token = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  const id = `inv-${Date.now().toString(36)}`;
  const days = payload.customExpiryDays ?? 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const tempPass = payload.tempPassword || `Aether@${Math.floor(100000 + Math.random() * 900000)}!`;

  const newInvitation: InvitationRecord = {
    id,
    email: payload.email.trim().toLowerCase(),
    name: payload.name.trim(),
    role: payload.role,
    department: payload.department,
    invitedBy: payload.invitedBy,
    invitedAt: new Date().toISOString(),
    expiresAt,
    status: 'pending',
    token,
    tempPassword: tempPass,
    resendCount: 0,
  };

  // Replace any previous pending invitation for this email or append
  const filtered = invitations.filter(
    (inv) => inv.email.toLowerCase() !== payload.email.toLowerCase() || inv.status !== 'pending'
  );
  const updatedList = [newInvitation, ...filtered];
  localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updatedList));

  // Record audit log entry
  recordAuditLog({
    action: 'User Invitation Dispatched',
    category: 'invitation',
    user: payload.invitedBy.name,
    userEmail: payload.invitedBy.email,
    target: `${payload.name} (${payload.email})`,
    targetEmail: payload.email,
    status: 'Success',
    details: `Created user invitation with role ${payload.role} in ${payload.department} (Expires: ${new Date(expiresAt).toLocaleDateString()}).`,
  });

  notifyChange('invitations');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = `${origin}/auth/onboarding?token=${encodeURIComponent(token)}&email=${encodeURIComponent(payload.email)}`;

  return { invitation: newInvitation, link };
}

/**
 * Revoke an active invitation
 */
export function revokeInvitation(
  invitationId: string,
  revokedBy: { name: string; email: string }
): boolean {
  const invitations = getInvitations();
  const target = invitations.find((i) => i.id === invitationId);
  if (!target) return false;

  const updatedList = invitations.map((inv) => {
    if (inv.id === invitationId) {
      return {
        ...inv,
        status: 'revoked' as const,
        revokedAt: new Date().toISOString(),
        revokedBy,
      };
    }
    return inv;
  });

  localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updatedList));

  recordAuditLog({
    action: 'User Invitation Revoked',
    category: 'invitation',
    user: revokedBy.name,
    userEmail: revokedBy.email,
    target: `${target.name} (${target.email})`,
    targetEmail: target.email,
    status: 'Warning',
    details: `Revoked active invitation for ${target.email}. Token has been invalidated.`,
  });

  notifyChange('invitations');
  return true;
}

/**
 * Resend / renew an invitation
 */
export function resendInvitation(
  invitationId: string,
  actor: { name: string; email: string }
): { success: boolean; link?: string; tempPassword?: string } {
  const invitations = getInvitations();
  const target = invitations.find((i) => i.id === invitationId);
  if (!target) return { success: false };

  // Extend expiration by 7 days from now
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const newToken = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  const newPass = `Aether@${Math.floor(100000 + Math.random() * 900000)}!`;

  const updatedList = invitations.map((inv) => {
    if (inv.id === invitationId) {
      return {
        ...inv,
        token: newToken,
        status: 'pending' as const,
        expiresAt: newExpiresAt,
        tempPassword: newPass,
        resendCount: (inv.resendCount || 0) + 1,
        lastResentAt: new Date().toISOString(),
      };
    }
    return inv;
  });

  localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updatedList));

  recordAuditLog({
    action: 'User Invitation Resent',
    category: 'invitation',
    user: actor.name,
    userEmail: actor.email,
    target: `${target.name} (${target.email})`,
    targetEmail: target.email,
    status: 'Success',
    details: `Resent invitation with renewed 7-day validity to ${target.email}.`,
  });

  notifyChange('invitations');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = `${origin}/auth/onboarding?token=${encodeURIComponent(newToken)}&email=${encodeURIComponent(target.email)}`;

  return { success: true, link, tempPassword: newPass };
}

/**
 * Validate an invitation token or email
 */
export function validateInvitation(
  token?: string | null,
  email?: string | null
): {
  valid: boolean;
  reason?:
    | 'missing_token'
    | 'not_found'
    | 'expired'
    | 'revoked'
    | 'already_accepted'
    | 'duplicate_account';
  invitation?: InvitationRecord;
} {
  // SECURITY FIX (VULN-07): A cryptographically valid invitation token is mandatory.
  // Never permit claiming or validating an invitation using email alone without a valid token.
  if (!token || token.trim().length < 8) {
    return { valid: false, reason: 'missing_token' };
  }

  const invitations = getInvitations();

  // Strict match by token only
  const inv = invitations.find((i) => i.token === token.trim());

  if (!inv) {
    return { valid: false, reason: 'not_found' };
  }

  // If email was provided, ensure it strictly matches the token's assigned email
  if (email && inv.email.toLowerCase() !== email.trim().toLowerCase()) {
    return { valid: false, reason: 'not_found' };
  }

  if (inv.status === 'revoked') {
    return { valid: false, reason: 'revoked', invitation: inv };
  }

  if (inv.status === 'accepted') {
    return { valid: false, reason: 'already_accepted', invitation: inv };
  }

  const isExpired = Date.now() > new Date(inv.expiresAt).getTime() || inv.status === 'expired';
  if (isExpired) {
    return { valid: false, reason: 'expired', invitation: inv };
  }

  return { valid: true, invitation: inv };
}

/**
 * Accept an invitation during onboarding completion
 */
export function acceptInvitation(
  token: string,
  completedProfile: {
    name: string;
    email: string;
    role: string;
    department: string;
    address?: string;
    contactNo?: string;
  }
): boolean {
  if (!token || token.trim().length < 8) return false;

  const invitations = getInvitations();
  // SECURITY FIX: Match strictly on token to prevent account takeover by email guessing
  const target = invitations.find((i) => i.token === token.trim());
  if (target) {
    const updatedList = invitations.map((inv) => {
      if (inv.id === target.id) {
        return {
          ...inv,
          status: 'accepted' as const,
          acceptedAt: new Date().toISOString(),
        };
      }
      return inv;
    });

    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updatedList));
    notifyChange('invitations');
  }

  // Record audit log
  recordAuditLog({
    action: 'Invitation Accepted & Onboarding Completed',
    category: 'invitation',
    user: completedProfile.name,
    userEmail: completedProfile.email,
    target: `${completedProfile.name} (${completedProfile.email})`,
    targetEmail: completedProfile.email,
    status: 'Success',
    details: `User completed onboarding wizard and set credentials for role ${completedProfile.role}.`,
  });

  // Dual-write: Call backend MySQL /invitations/accept
  try {
    const authToken = localStorage.getItem('token');
    fetch(`${API_URL}/invitations/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        token,
        profile: completedProfile,
      }),
    }).catch(() => {});
  } catch {
    // Ignore error
  }

  return true;
}

/**
 * Get all system audit logs
 */
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const list: AuditLogEntry[] = JSON.parse(raw);
    // Enforce 3-month (90 days) retention policy: prune logs older than 3 months
    const retainedList = filterLogsByRetention(list);
    if (retainedList.length !== list.length) {
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(retainedList));
    }
    return retainedList;
  } catch {
    return [];
  }
}

/**
 * Record a new audit log entry
 * Dual-write: localStorage (instant local sync with 3-month retention) + backend MySQL (persistent)
 */
export function recordAuditLog(entry: {
  action: string;
  category: AuditLogEntry['category'];
  user: string;
  userEmail: string;
  target: string;
  targetEmail?: string;
  status: 'Success' | 'Warning' | 'Critical';
  details?: string;
  changes?: Array<{ field: string; from: any; to: any }>;
  ip?: string;
}): AuditLogEntry {
  const logs = getAuditLogs();

  const newLog: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action: entry.action,
    category: entry.category,
    user: entry.user || 'System',
    userEmail: entry.userEmail || 'system@aetheradix.com',
    target: entry.target,
    targetEmail: entry.targetEmail,
    timestamp: new Date().toISOString(),
    ip: entry.ip || '192.168.1.105',
    status: entry.status,
    details: entry.details,
    changes: entry.changes,
  };

  // Local storage: prepend and enforce 3-month retention window
  const updatedLogs = filterLogsByRetention([newLog, ...logs]);
  localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
  notifyChange('audit_logs');

  // Background POST to backend MySQL (fire-and-forget)
  try {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        action: newLog.action,
        category: newLog.category,
        user: newLog.user,
        userEmail: newLog.userEmail,
        target: newLog.target,
        targetEmail: newLog.targetEmail,
        status: newLog.status,
        details: newLog.details,
        changes: newLog.changes,
        ip: newLog.ip,
      }),
    }).catch(() => {
      // Silently ignore network errors — local log already recorded
    });
  } catch {
    // No-op — backend persistence is best-effort
  }

  return newLog;
}
