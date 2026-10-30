import { PageHeader } from '@/components/ui/composed/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import type { AuditLogEntry, InvitationRecord } from '@/services/auditService';
import { useGetSystemAuditLogsQuery, useGetSystemInvitationsQuery } from '@/store/api/authApiSlice';
import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Terminal,
  User,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const statusColors: Record<string, string> = {
  Success: 'text-success bg-success/10 border-success/20',
  Warning: 'text-warning bg-warning/10 border-warning/20',
  Critical: 'text-error bg-error/10 border-error/20',
  Info: 'text-info bg-info/10 border-info/20',
};

const categoryIcons: Record<string, any> = {
  invitation: UserPlus,
  profile: FileText,
  security: KeyRound,
  user_management: User,
  admin: Shield,
};

// ─── Journey Timeline ──────────────────────────────────────────────────────────

interface JourneyStep {
  label: string;
  description: string;
  timestamp?: string;
  status: 'done' | 'pending' | 'failed';
  icon: any;
  logEntry?: AuditLogEntry;
}

function buildJourney(
  invitation: InvitationRecord,
  logs: AuditLogEntry[],
  currentAuthUser?: any
): JourneyStep[] {
  const email = invitation.email.toLowerCase();

  const fallbackAdminName = currentAuthUser?.username || currentAuthUser?.name || 'Hasmukh';
  const fallbackAdminRole = currentAuthUser?.role || 'SuperAdmin';
  const fallbackAdminEmail = currentAuthUser?.email || 'hasmukh.arx@gmail.com';

  const adminName =
    invitation.invitedBy?.name &&
    invitation.invitedBy.name !== 'Sarah Chen' &&
    invitation.invitedBy.name !== 'Admin'
      ? invitation.invitedBy.name
      : fallbackAdminName;
  const adminRole =
    invitation.invitedBy?.role && invitation.invitedBy.role !== 'Admin'
      ? invitation.invitedBy.role
      : fallbackAdminRole;
  const adminEmail =
    invitation.invitedBy?.email &&
    !invitation.invitedBy.email.includes('sarah') &&
    !invitation.invitedBy.email.includes('admin@')
      ? invitation.invitedBy.email
      : fallbackAdminEmail;

  // Find relevant log entries for this email
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

const stepStatusStyle: Record<string, string> = {
  done: 'bg-success text-white',
  pending: 'bg-border-subtle/60 text-muted',
  failed: 'bg-error text-white',
};

const invStatusBadge: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border border-warning/20',
  accepted: 'bg-success/10 text-success border border-success/20',
  expired: 'bg-muted/10 text-muted border border-border-subtle',
  revoked: 'bg-error/10 text-error border border-error/20',
};

function JourneyCard({
  invitation,
  logs,
}: {
  invitation: InvitationRecord;
  logs: AuditLogEntry[];
}) {
  const { user: currentAuthUser } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const steps = buildJourney(invitation, logs, currentAuthUser);
  const doneCount = steps.filter((s) => s.status === 'done').length;

  const fallbackAdminName = currentAuthUser?.username || 'Hasmukh';
  const fallbackAdminRole = currentAuthUser?.role || 'SuperAdmin';
  const fallbackAdminEmail = currentAuthUser?.email || 'hasmukh.arx@gmail.com';

  const adminName =
    invitation.invitedBy?.name &&
    invitation.invitedBy.name !== 'Sarah Chen' &&
    invitation.invitedBy.name !== 'Admin'
      ? invitation.invitedBy.name
      : fallbackAdminName;
  const adminRole =
    invitation.invitedBy?.role && invitation.invitedBy.role !== 'Admin'
      ? invitation.invitedBy.role
      : fallbackAdminRole;
  const adminEmail =
    invitation.invitedBy?.email &&
    !invitation.invitedBy.email.includes('sarah') &&
    !invitation.invitedBy.email.includes('admin@')
      ? invitation.invitedBy.email
      : fallbackAdminEmail;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-surface-subtle/40 transition-colors cursor-pointer">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
          {(invitation.name || invitation.email).charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-black text-foreground truncate">
              {invitation.name || invitation.email}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Role: {invitation.role}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${invStatusBadge[invitation.status]}`}>
              {invitation.status}
            </span>
          </div>
          <div className="text-[11px] text-muted truncate font-mono">
            {invitation.email} · {invitation.department}
          </div>
          <div className="text-[11px] text-muted mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 bg-surface-subtle px-2.5 py-1 rounded-lg border border-border-subtle">
              <span className="text-muted text-[10px] font-bold uppercase tracking-wider">
                Invited by:
              </span>
              <strong className="text-foreground font-bold">{adminName}</strong>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {adminRole}
              </span>
              <span className="text-[10px] text-muted font-mono">({adminEmail})</span>
            </span>
            <span className="text-[10px] text-muted">
              {new Date(invitation.invitedAt).toLocaleDateString()} at{' '}
              {new Date(invitation.invitedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-border-subtle/40"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke={progress === 100 ? '#22c55e' : '#6366f1'}
                strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 97.4} 97.4`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-foreground">
              {progress}%
            </span>
          </div>
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
            {doneCount}/{steps.length}
          </span>
        </div>

        {/* Expand caret */}
        <div className="text-muted ml-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 w-full bg-border-subtle/30">
        <div
          className="h-full transition-all duration-700 ease-out rounded-full"
          style={{
            width: `${progress}%`,
            background: progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          }}
        />
      </div>

      {/* Timeline (expandable) */}
      {expanded && (
        <div className="px-5 pb-5 pt-4">
          <div className="relative pl-6">
            {/* Vertical connector line */}
            <div className="absolute left-3 top-3 bottom-3 w-px bg-border-subtle/50" />

            {steps.map((step, idx) => {
              // const Icon = step.icon;
              const isLast = idx === steps.length - 1;
              return (
                <div
                  key={idx}
                  className={`relative flex items-start gap-4 ${isLast ? '' : 'mb-5'}`}>
                  {/* Step dot */}
                  <div
                    className={`absolute -left-[9px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 ${stepStatusStyle[step.status]}`}>
                    {step.status === 'done' ? (
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-white">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : step.status === 'failed' ? (
                      <span className="text-[8px] font-black">✕</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-muted/40 block" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 ml-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${step.status === 'done' ? 'text-foreground' : step.status === 'failed' ? 'text-error' : 'text-muted'}`}>
                        {step.label}
                      </span>
                      {step.status === 'done' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-success/10 text-success">
                          done
                        </span>
                      )}
                      {step.status === 'pending' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-muted/10 text-muted">
                          pending
                        </span>
                      )}
                      {step.status === 'failed' && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-error/10 text-error">
                          blocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-[10px] text-muted/60 flex items-center gap-1 mt-0.5">
                        <Clock size={9} />
                        {new Date(step.timestamp).toLocaleString()}
                      </p>
                    )}
                    {step.logEntry && (
                      <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-[10px] text-muted leading-relaxed">
                        {step.logEntry.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function AuditLogPage() {
  const { user: currentAuthUser } = useAuth();
  const activeAdminName = currentAuthUser?.username || 'Hasmukh';
  const activeAdminRole = currentAuthUser?.role || 'SuperAdmin';
  const activeAdminEmail = currentAuthUser?.email || 'hasmukh.arx@gmail.com';
  // ─── Backend-driven data (MySQL via RTK Query) ──────────────────────────────
  const {
    data: auditLogsResponse,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    refetch: refetchLogs,
  } = useGetSystemAuditLogsQuery();

  const {
    data: invitationsResponse,
    isLoading: isLoadingInvitations,
    refetch: refetchInvitations,
  } = useGetSystemInvitationsQuery();

  const logs: AuditLogEntry[] = (auditLogsResponse?.data ?? []) as AuditLogEntry[];
  const invitations: InvitationRecord[] = (invitationsResponse?.data ?? []) as InvitationRecord[];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [activeView, setActiveView] = useState<'stream' | 'journey'>('stream');

  const filteredLogs = useMemo(() => {
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
  }, [logs, search, categoryFilter, statusFilter]);

  // Filter invitations by search
  const filteredInvitations = useMemo(() => {
    if (!search.trim()) return invitations;
    const term = search.toLowerCase();
    return invitations.filter(
      (inv) =>
        inv.email.toLowerCase().includes(term) ||
        inv.name.toLowerCase().includes(term) ||
        inv.role.toLowerCase().includes(term) ||
        inv.invitedBy.name.toLowerCase().includes(term)
    );
  }, [invitations, search]);

  // Helper to find matching invitation for an audit record
  const getMatchingInvitation = (record: AuditLogEntry): InvitationRecord | undefined => {
    const targetEmail = record.targetEmail?.toLowerCase();
    const userEmail = record.userEmail?.toLowerCase();
    return invitations.find(
      (inv) =>
        (targetEmail && inv.email.toLowerCase() === targetEmail) ||
        (userEmail && inv.email.toLowerCase() === userEmail) ||
        (record.target && record.target.toLowerCase().includes(inv.email.toLowerCase()))
    );
  };

  // Helper to resolve admin/initiator role
  const getActorRole = (record: AuditLogEntry): string => {
    if ((record as any).userRole) return (record as any).userRole;
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
      return activeAdminRole;
    }
    if (record.category === 'invitation' || record.category === 'admin') return activeAdminRole;
    return 'Staff';
  };

  const columns: ColumnsType<AuditLogEntry> = [
    {
      title: 'Activity / Event',
      key: 'action',
      render: (_, record) => {
        const Icon = categoryIcons[record.category] || Terminal;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{record.action}</span>
              {record.details && (
                <span className="text-[11px] text-muted line-clamp-1 max-w-xs">
                  {record.details}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actor (Admin / Initiator)',
      key: 'actor',
      render: (_, record) => {
        const inv = getMatchingInvitation(record);
        const role = getActorRole(record);
        const isAdminAction = record.category === 'invitation' || record.category === 'admin';
        const isSelf =
          currentAuthUser &&
          (record.userEmail?.toLowerCase() === currentAuthUser.email?.toLowerCase() ||
            record.user === currentAuthUser.username ||
            record.user === 'Sarah Chen' ||
            record.user === 'Admin');
        const displayName = isSelf
          ? activeAdminName
          : isAdminAction &&
              inv?.invitedBy?.name &&
              inv.invitedBy.name !== 'Sarah Chen' &&
              inv.invitedBy.name !== 'Admin'
            ? inv.invitedBy.name
            : record.user === 'Sarah Chen' || record.user === 'Admin'
              ? activeAdminName
              : record.user;
        const displayEmail = isSelf
          ? activeAdminEmail
          : isAdminAction &&
              inv?.invitedBy?.email &&
              !inv.invitedBy.email.includes('sarah') &&
              !inv.invitedBy.email.includes('admin@')
            ? inv.invitedBy.email
            : record.userEmail?.includes('sarah') || record.userEmail === 'admin@aetheradix.com'
              ? activeAdminEmail
              : record.userEmail;
        const displayRole =
          isAdminAction && inv?.invitedBy?.role && inv.invitedBy.role !== 'Admin'
            ? inv.invitedBy.role
            : role;

        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isAdminAction ? 'bg-primary/10 text-primary' : 'bg-surface-subtle text-muted'
              }`}>
              {isAdminAction ? <Shield size={14} /> : <User size={14} />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground">{displayName}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {displayRole}
                </span>
              </div>
              <span className="text-[10px] text-muted font-mono">{displayEmail}</span>
              {inv?.invitedBy && (
                <div className="inline-flex items-center gap-1 text-[9.5px] text-muted mt-1 bg-surface-subtle/80 px-2 py-0.5 rounded border border-border-subtle w-fit">
                  <span>Invited by:</span>
                  <strong className="text-foreground">{inv.invitedBy.name}</strong>
                  <span className="px-1 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {inv.invitedBy.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Target (Invitee / Entity)',
      key: 'target',
      render: (_, record) => {
        const inv = getMatchingInvitation(record);
        const adminName =
          inv?.invitedBy?.name &&
          inv.invitedBy.name !== 'Sarah Chen' &&
          inv.invitedBy.name !== 'Admin'
            ? inv.invitedBy.name
            : activeAdminName;
        const adminRole =
          inv?.invitedBy?.role && inv.invitedBy.role !== 'Admin'
            ? inv.invitedBy.role
            : activeAdminRole;

        return (
          <div className="flex flex-col gap-1 max-w-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-surface-subtle border border-border-subtle rounded-lg text-xs font-semibold text-foreground tracking-wide">
                {inv?.name || record.target}
              </span>
              {inv?.role && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                  Role: {inv.role}
                </span>
              )}
            </div>
            {record.targetEmail && (
              <span className="text-[10px] text-muted font-mono truncate">
                {record.targetEmail} {inv?.department ? `• ${inv.department}` : ''}
              </span>
            )}
            {/* Explicit Admin Name Badge */}
            <div className="inline-flex items-center gap-1 text-[9.5px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15 w-fit">
              <Shield size={10} className="shrink-0" />
              <span>Admin:</span>
              <strong className="text-foreground">{adminName}</strong>
              <span className="text-[8.5px] text-primary/80 uppercase">({adminRole})</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts) => (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} />
          <span>{ts ? new Date(ts).toLocaleString() : 'Just now'}</span>
        </div>
      ),
    },
    {
      title: 'Origin IP',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip) => <span className="text-[11px] font-mono text-muted/70">{ip}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            statusColors[status] || 'text-muted border-border-subtle'
          }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Details',
      key: 'view',
      width: 80,
      render: (_, record) => (
        <button
          onClick={() => setSelectedLog(record)}
          className="text-xs font-bold text-primary hover:underline cursor-pointer">
          View
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Security & System Audit Log"
          description="Immutable chronological record of invitations, onboarding journeys, authentication changes, and system administration events."
          breadcrumbs={[
            { label: 'Home', url: '/' },
            { label: 'Settings', url: '/settings' },
            { label: 'Audit Log' },
          ]}
        />
        <div className="flex items-center gap-2 pt-1 shrink-0">
          {/* Live backend sync badge */}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-wider">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-success ${isFetchingLogs ? 'animate-ping' : 'animate-pulse'}`}
            />
            Live DB Sync
          </span>
          <button
            onClick={() => {
              refetchLogs();
              refetchInvitations();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border-subtle text-muted text-xs font-bold hover:text-foreground hover:border-primary/30 transition-all cursor-pointer"
            title="Refresh from database">
            <RefreshCw size={13} className={isFetchingLogs ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {(isLoadingLogs || isLoadingInvitations) && (
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading audit data from database...
        </div>
      )}

      {/* View toggle */}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('stream')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'stream'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white border border-border-subtle text-muted hover:text-foreground'
          }`}>
          <Terminal size={14} />
          Activity Stream
        </button>
        <button
          onClick={() => setActiveView('journey')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'journey'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white border border-border-subtle text-muted hover:text-foreground'
          }`}>
          <Zap size={14} />
          Onboarding Journeys
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-black">
            {invitations.length}
          </span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search logs by action, actor, email, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {activeView === 'stream' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1">
                Status:
              </span>
              {['all', 'Success', 'Warning', 'Critical'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-surface-subtle text-muted hover:text-foreground'
                  }`}>
                  {st === 'all' ? 'All Outcomes' : st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter Pills — only for Activity Stream */}
        {activeView === 'stream' && (
          <div className="flex items-center gap-2 border-t border-border-subtle/60 pt-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Activities', icon: Terminal },
              { id: 'invitation', label: 'User Invitations', icon: UserPlus },
              { id: 'profile', label: 'Profile Changes', icon: FileText },
              { id: 'security', label: 'Security & Password', icon: KeyRound },
              { id: 'admin', label: 'Administration', icon: Shield },
            ].map((cat) => {
              const Icon = cat.icon;
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-surface-subtle text-muted hover:text-foreground hover:bg-surface-subtle/80'
                  }`}>
                  <Icon size={13} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── ACTIVITY STREAM VIEW ─── */}
      {activeView === 'stream' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
          <div className="p-6 pb-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-primary" />
              <span className="text-sm font-black text-foreground uppercase tracking-wider">
                System Activity Stream
              </span>
            </div>
            <span className="text-xs font-bold text-muted">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'event' : 'events'} recorded
            </span>
          </div>

          <Table
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="premium-table"
            locale={{
              emptyText: (
                <div className="py-12 text-center text-muted text-sm">
                  No audit entries match the selected filters.
                </div>
              ),
            }}
          />
        </motion.div>
      )}

      {/* ─── ONBOARDING JOURNEY VIEW ─── */}
      {activeView === 'journey' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
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
                value: invitations.filter((i) => i.status === 'expired' || i.status === 'revoked')
                  .length,
                color: 'text-error',
                bg: 'bg-error/5',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`${stat.bg} rounded-2xl p-4 border border-border-subtle`}>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted font-semibold mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {filteredInvitations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center text-muted text-sm">
              No invitation journeys found{search ? ' matching your search' : ''}.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredInvitations.map((inv) => (
                <JourneyCard key={inv.id} invitation={inv} logs={logs} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={null}
        title={
          <div className="flex items-center gap-2 text-base font-black text-foreground pt-2">
            <Shield size={18} className="text-primary" />
            <span>Audit Event Details</span>
          </div>
        }
        className="rounded-2xl overflow-hidden">
        {selectedLog && (
          <div className="flex flex-col gap-5 pt-3 text-xs">
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Event ID:</span>
                <span className="font-mono text-foreground font-bold">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Action:</span>
                <span className="font-bold text-foreground">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Category:</span>
                <span className="font-bold text-primary uppercase text-[10px]">
                  {selectedLog.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted font-semibold">Outcome:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                    statusColors[selectedLog.status]
                  }`}>
                  {selectedLog.status}
                </span>
              </div>
            </div>

            {/* Rich Admin & Invitee Attribution Box */}
            {(() => {
              const inv = getMatchingInvitation(selectedLog);
              const actorRole = getActorRole(selectedLog);
              return (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-surface-subtle to-white border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <UserPlus size={14} />
                      Admin & Invitee Attribution
                    </span>
                    {inv?.status && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${invStatusBadge[inv.status]}`}>
                        Status: {inv.status}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Admin Block */}
                    <div className="p-3 rounded-xl bg-white border border-border-subtle space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                        Admin / Initiator
                      </span>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {inv?.invitedBy?.name || selectedLog.user}
                        <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[9px] font-black uppercase border border-primary/20">
                          {inv?.invitedBy?.role || actorRole}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted font-mono truncate">
                        {inv?.invitedBy?.email || selectedLog.userEmail}
                      </div>
                    </div>

                    {/* Invitee Block */}
                    <div className="p-3 rounded-xl bg-white border border-border-subtle space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted block">
                        Invitee (Target User)
                      </span>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {inv?.name || selectedLog.target}
                        {inv?.role && (
                          <span className="px-1.5 py-0.2 rounded bg-surface-subtle border border-border-subtle text-[9px] font-black uppercase">
                            {inv.role}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted font-mono truncate">
                        {inv?.email || selectedLog.targetEmail || selectedLog.target}
                      </div>
                      {inv?.department && (
                        <div className="text-[10px] text-muted">Department: {inv.department}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                Audit Record Details
              </span>
              <div className="p-3 rounded-xl border border-border-subtle space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted">Initiated By:</span>
                  <span className="font-semibold text-foreground">
                    {selectedLog.user} ({selectedLog.userEmail})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Target Resource:</span>
                  <span className="font-semibold text-foreground">{selectedLog.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Origin IP Address:</span>
                  <span className="font-mono text-muted">{selectedLog.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Timestamp:</span>
                  <span className="text-foreground">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {selectedLog.details && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Description / Event Log
                </span>
                <p className="p-3 rounded-xl bg-surface-subtle text-foreground/90 leading-relaxed border border-border-subtle">
                  {selectedLog.details}
                </p>
              </div>
            )}

            {selectedLog.changes && selectedLog.changes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                  Recorded Attribute Changes
                </span>
                <div className="rounded-xl border border-border-subtle overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-subtle/60 border-b border-border-subtle font-bold text-muted text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Field</th>
                        <th className="p-2.5">Previous Value</th>
                        <th className="p-2.5">New Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {selectedLog.changes.map((ch, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-foreground">{ch.field}</td>
                          <td className="p-2.5 text-error font-medium line-through">
                            {String(ch.from || '(empty)')}
                          </td>
                          <td className="p-2.5 text-success font-semibold">
                            {String(ch.to || '(empty)')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
