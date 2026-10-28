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

// Default initial seeded invitations to illustrate complete audit history
const SEEDED_INVITATIONS: InvitationRecord[] = [
  {
    id: 'inv-deedee',
    email: 'deedee@yopmail.com',
    name: 'DeeDee User',
    role: 'Employee',
    department: 'Operations',
    invitedBy: {
      name: 'Hasmukh',
      email: 'hasmukh.arx@gmail.com',
      role: 'SuperAdmin',
    },
    invitedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    token: 'tok_deedee_onboarded',
    acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resendCount: 0,
  },
  {
    id: 'inv-101',
    email: 'marcus.vance@aetheradix.com',
    name: 'Marcus Vance',
    role: 'Employee',
    department: 'Engineering',
    invitedBy: {
      name: 'Hasmukh',
      email: 'hasmukh.arx@gmail.com',
      role: 'SuperAdmin',
    },
    invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    token: 'tok_marcus_vance_2026',
    tempPassword: 'Aether@Temp9821!',
    resendCount: 0,
  },
  {
    id: 'inv-102',
    email: 'elena.rostova@aetheradix.com',
    name: 'Elena Rostova',
    role: 'Manager',
    department: 'Design',
    invitedBy: {
      name: 'Hasmukh',
      email: 'hasmukh.arx@gmail.com',
      role: 'SuperAdmin',
    },
    invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    token: 'tok_elena_rostova_2026',
    acceptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    resendCount: 0,
  },
  {
    id: 'inv-103',
    email: 'claire.dubois@aetheradix.com',
    name: 'Claire Dubois',
    role: 'HrAdmin',
    department: 'HR',
    invitedBy: {
      name: 'James Wilson',
      email: 'james.wilson@aetheradix.com',
      role: 'Admin',
    },
    invitedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'expired',
    token: 'tok_claire_dubois_expired',
    resendCount: 1,
  },
  {
    id: 'inv-104',
    email: 'contractor.guest@external.com',
    name: 'Contractor Guest',
    role: 'Employee',
    department: 'Operations',
    invitedBy: {
      name: 'James Wilson',
      email: 'james.wilson@aetheradix.com',
      role: 'Admin',
    },
    invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now()).toISOString(),
    status: 'revoked',
    token: 'tok_contractor_revoked',
    revokedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    revokedBy: {
      name: 'Hasmukh',
      email: 'hasmukh.arx@gmail.com',
    },
  },
];

// Default initial seeded audit logs
const SEEDED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-deedee-1',
    action: 'User Invitation Dispatched',
    category: 'invitation',
    user: 'Hasmukh',
    userEmail: 'hasmukh.arx@gmail.com',
    target: 'DeeDee User (deedee@yopmail.com)',
    targetEmail: 'deedee@yopmail.com',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.45',
    status: 'Success',
    details:
      'Dispatched onboarding email invitation to deedee@yopmail.com with role Employee in Operations department.',
  },
  {
    id: 'log-deedee-2',
    action: 'Temporary Password Changed',
    category: 'security',
    user: 'DeeDee User',
    userEmail: 'deedee@yopmail.com',
    target: 'deedee@yopmail.com (Account Security)',
    targetEmail: 'deedee@yopmail.com',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.105',
    status: 'Success',
    details:
      'Invited user successfully changed temporary password. Single-use credential invalidated. Onboarding step 1 of 2 complete.',
  },
  {
    id: 'log-deedee-3',
    action: 'Onboarding Completed — Profile Activated',
    category: 'invitation',
    user: 'DeeDee User',
    userEmail: 'deedee@yopmail.com',
    target: 'DeeDee User (Account)',
    targetEmail: 'deedee@yopmail.com',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.105',
    status: 'Success',
    details:
      'User completed mandatory onboarding. Profile details submitted and account fully activated. Department: Operations, Designation: Operations Coordinator.',
    changes: [
      { field: 'Full Name', from: '(not set)', to: 'DeeDee User' },
      { field: 'Contact Number', from: '(not set)', to: '+1 (555) 234-5678' },
      { field: 'Department', from: '(not set)', to: 'Operations' },
      { field: 'Designation', from: '(not set)', to: 'Operations Coordinator' },
      { field: 'Onboarding Status', from: 'Incomplete', to: 'Fully Activated' },
    ],
  },
  {
    id: 'log-101',
    action: 'User Invitation Dispatched',
    category: 'invitation',
    user: 'Hasmukh',
    userEmail: 'hasmukh.arx@gmail.com',
    target: 'marcus.vance@aetheradix.com',
    targetEmail: 'marcus.vance@aetheradix.com',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.45',
    status: 'Success',
    details: 'Dispatched onboarding invitation with role Employee in Engineering department.',
  },
  {
    id: 'log-102',
    action: 'Invitation Accepted & Onboarding Completed',
    category: 'invitation',
    user: 'Elena Rostova',
    userEmail: 'elena.rostova@aetheradix.com',
    target: 'Elena Rostova (Account)',
    targetEmail: 'elena.rostova@aetheradix.com',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.88',
    status: 'Success',
    details:
      'User successfully verified invitation token, set secure password, and completed profile onboarding.',
  },
  {
    id: 'log-103',
    action: 'User Invitation Revoked',
    category: 'invitation',
    user: 'Hasmukh',
    userEmail: 'hasmukh.arx@gmail.com',
    target: 'contractor.guest@external.com',
    targetEmail: 'contractor.guest@external.com',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.45',
    status: 'Warning',
    details: 'Revoked active invitation token before account registration was completed.',
  },
  {
    id: 'log-104',
    action: 'Password Changed',
    category: 'security',
    user: 'Hasmukh',
    userEmail: 'hasmukh.arx@gmail.com',
    target: 'Account Security Credentials',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.45',
    status: 'Success',
    details: 'User successfully updated account password meeting all complexity requirements.',
  },
  {
    id: 'log-105',
    action: 'Profile Updated',
    category: 'profile',
    user: 'James Wilson',
    userEmail: 'james.wilson@aetheradix.com',
    target: 'James Wilson Profile',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    ip: '192.168.1.12',
    status: 'Success',
    details: 'Modified contact number and office work location.',
    changes: [
      { field: 'contactNo', from: '+1 555-0100', to: '+1 555-0199' },
      { field: 'workLocation', from: 'Regional Office', to: 'Headquarters Plant' },
    ],
  },
];

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
    let list: InvitationRecord[] = raw ? JSON.parse(raw) : SEEDED_INVITATIONS;

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

    // Ensure deedee@yopmail.com is present for monitoring demo
    if (!list.some((inv) => inv.email.toLowerCase() === 'deedee@yopmail.com')) {
      list = [SEEDED_INVITATIONS[0], ...list];
      updated = true;
    }

    if (updated || !raw) {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    return SEEDED_INVITATIONS;
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
  if (!token && !email) {
    return { valid: false, reason: 'missing_token' };
  }

  const invitations = getInvitations();

  // Match by token first, then email
  let inv: InvitationRecord | undefined;
  if (token) {
    inv = invitations.find((i) => i.token === token);
  }
  if (!inv && email) {
    inv = invitations.find((i) => i.email.toLowerCase() === email.toLowerCase());
  }

  if (!inv) {
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
  const invitations = getInvitations();
  const target = invitations.find(
    (i) => i.token === token || i.email.toLowerCase() === completedProfile.email.toLowerCase()
  );
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
    if (!raw) {
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(SEEDED_AUDIT_LOGS));
      return SEEDED_AUDIT_LOGS;
    }
    let list: AuditLogEntry[] = JSON.parse(raw);
    const hasDeedee = list.some(
      (l) =>
        l.targetEmail?.toLowerCase() === 'deedee@yopmail.com' ||
        l.userEmail?.toLowerCase() === 'deedee@yopmail.com'
    );
    if (!hasDeedee) {
      const deedeeLogs = SEEDED_AUDIT_LOGS.filter(
        (l) =>
          l.targetEmail?.toLowerCase() === 'deedee@yopmail.com' ||
          l.userEmail?.toLowerCase() === 'deedee@yopmail.com'
      );
      list = [...deedeeLogs, ...list];
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(list));
    }
    // Enforce 3-month (90 days) retention policy: prune logs older than 3 months
    const retainedList = filterLogsByRetention(list);
    if (retainedList.length !== list.length) {
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(retainedList));
    }
    return retainedList;
  } catch {
    return filterLogsByRetention(SEEDED_AUDIT_LOGS);
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
