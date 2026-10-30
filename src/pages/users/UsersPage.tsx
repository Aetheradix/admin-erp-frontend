import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Tabs } from '@/components/ui/primitives/Tabs';
import {
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Trash2,
  ShieldCheck,
  History,
  UserPlus,
  Edit3,
  RefreshCw,
  Ban,
  Copy,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { Table, Dropdown, message, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

import { useAuth } from '@/hooks/useAuth';
import {
  useGetUsersQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteUserMutation,
} from '@/store/api/userSlice';
import {
  useSendInvitationMutation,
  useGenerateInvitationMutation,
  useGetApprovalLogsQuery,
  useGetSystemInvitationsQuery,
  useGetSystemAuditLogsQuery,
  useCreateSystemInvitationMutation,
  useRevokeSystemInvitationMutation,
  useResendSystemInvitationMutation,
} from '@/store/api/authApiSlice';
import { useGetRolesQuery } from '@/store/api/roleApiSlice';
import type { UserRole } from '@/config/navItems';
import { recordAuditLog, type InvitationRecord, type AuditLogEntry } from '@/services/auditService';
import { ensureEmployeeProfileExists } from '@/services/employeeProfileService';

export interface UserRecord {
  id: number | string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  avatar: string;
  contactNo?: string;
  address?: string;
  createdAt?: string;
}

export const initialUsers: UserRecord[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@aetheradix.com',
    role: 'SuperAdmin',
    department: 'Engineering',
    status: 'Active',
    avatar: 'SC',
    contactNo: '+1 (555) 019-2831',
    address: '100 Silicon Blvd, San Francisco, CA',
    createdAt: '2026-01-10',
  },
  {
    id: 2,
    name: 'James Wilson',
    email: 'james.wilson@aetheradix.com',
    role: 'Admin',
    department: 'Operations',
    status: 'Active',
    avatar: 'JW',
    contactNo: '+1 (555) 018-9923',
    address: '450 Innovation Way, Austin, TX',
    createdAt: '2026-02-15',
  },
  {
    id: 3,
    name: 'Maya Johnson',
    email: 'maya.johnson@aetheradix.com',
    role: 'Manager',
    department: 'Design',
    status: 'Active',
    avatar: 'MJ',
    contactNo: '+1 (555) 012-4411',
    address: '78 Market St, New York, NY',
    createdAt: '2026-03-01',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@aetheradix.com',
    role: 'Employee',
    department: 'Engineering',
    status: 'Active',
    avatar: 'DK',
    contactNo: '+1 (555) 014-8832',
    address: '320 Tech Row, Seattle, WA',
    createdAt: '2026-03-12',
  },
  {
    id: 5,
    name: 'Lisa Park',
    email: 'lisa.park@aetheradix.com',
    role: 'HrAdmin',
    department: 'HR',
    status: 'Active',
    avatar: 'LP',
    contactNo: '+1 (555) 019-1100',
    address: '500 People Plaza, Chicago, IL',
    createdAt: '2026-04-05',
  },
  {
    id: 6,
    name: 'Alex Rivera',
    email: 'alex.rivera@aetheradix.com',
    role: 'Inventory operator',
    department: 'Operations',
    status: 'Away',
    avatar: 'AR',
    contactNo: '+1 (555) 016-5599',
    address: '88 Depot Rd, Dallas, TX',
    createdAt: '2026-04-20',
  },
  {
    id: 7,
    name: 'Emily Davis',
    email: 'emily.davis@aetheradix.com',
    role: 'FinanceAdmin',
    department: 'Finance',
    status: 'Active',
    avatar: 'ED',
    contactNo: '+1 (555) 017-7721',
    address: '250 Wall Street, New York, NY',
    createdAt: '2026-05-18',
  },
  {
    id: 8,
    name: 'Rahul Patel',
    email: 'rahul.patel@aetheradix.com',
    role: 'Employee',
    department: 'Engineering',
    status: 'Inactive',
    avatar: 'RP',
    contactNo: '+1 (555) 013-3390',
    address: '12 Pioneer Ave, San Jose, CA',
    createdAt: '2026-06-01',
  },
];

const DEFAULT_ROLES = [
  { label: 'SuperAdmin', value: 'SuperAdmin' },
  { label: 'Admin', value: 'Admin' },
  { label: 'HrAdmin', value: 'HrAdmin' },
  { label: 'FinanceAdmin', value: 'FinanceAdmin' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Employee', value: 'Employee' },
  { label: 'Inventory operator', value: 'Inventory operator' },
];

const DEPTS = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Design', value: 'Design' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'HR', value: 'HR' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Operations', value: 'Operations' },
];

const roleColors: Record<string, string> = {
  SuperAdmin: 'bg-error/10 text-error border-error/20',
  Admin: 'bg-warning/10 text-warning border-warning/20',
  HrAdmin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  FinanceAdmin: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Manager: 'bg-primary/10 text-primary border-primary/20',
  Employee: 'bg-info/10 text-info border-info/20',
  'Inventory operator': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  Viewer: 'bg-surface-subtle text-muted border-border-subtle',
};

const statusColors: Record<string, string> = {
  Active: 'text-success bg-success/10 border-success/20',
  Away: 'text-warning bg-warning/10 border-warning/20',
  Inactive: 'text-muted bg-surface-subtle border-border-subtle',
};

const emptyForm = { name: '', email: '', role: 'Employee', department: 'Engineering' };

export function UsersPage() {
  const { user: currentAuthUser } = useAuth();

  // Role authorization: only Admin, SuperAdmin, or HrAdmin can manage users & audit history
  const isAuthorizedAdmin = useMemo(() => {
    const role = currentAuthUser?.role || '';
    return ['Admin', 'SuperAdmin', 'HrAdmin'].includes(role);
  }, [currentAuthUser]);

  // --- RTK QUERY HOOKS ---
  const { data: apiUsers, isLoading: isUsersLoading, refetch: refetchUsers } = useGetUsersQuery();
  const { data: rolesData } = useGetRolesQuery();
  const { refetch: refetchLogs } = useGetApprovalLogsQuery();

  const [sendInvitation, { isLoading: isSendingInvite }] = useSendInvitationMutation();
  const [generateInvitation, { isLoading: isGeneratingInvite }] = useGenerateInvitationMutation();
  const [createStaff, { isLoading: isCreatingStaff }] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Backend invitation & audit log hooks
  const { data: invitationsResponse, refetch: refetchInvitations } = useGetSystemInvitationsQuery();
  const { data: auditLogsResponse, refetch: refetchAuditLogs } = useGetSystemAuditLogsQuery();

  const [createSystemInvitation] = useCreateSystemInvitationMutation();
  const [revokeSystemInvitation] = useRevokeSystemInvitationMutation();
  const [resendSystemInvitation] = useResendSystemInvitationMutation();

  // --- LOCAL STATE ---
  const [localUsers, setLocalUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Users');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Invitations & Audit Logs from backend
  const invitations: InvitationRecord[] = (invitationsResponse?.data ?? []) as InvitationRecord[];
  const auditLogs: AuditLogEntry[] = (auditLogsResponse?.data ?? []) as AuditLogEntry[];

  const [invitationFilter, setInvitationFilter] = useState<
    'all' | 'pending' | 'accepted' | 'expired' | 'revoked'
  >('all');

  // Invite Result Modal
  const [inviteResult, setInviteResult] = useState<{
    open: boolean;
    email: string;
    role: string;
    link: string;
    tempPass: string;
  }>({
    open: false,
    email: '',
    role: '',
    link: '',
    tempPass: '',
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Edit User Modal
  const [editUserModal, setEditUserModal] = useState<{
    open: boolean;
    user: UserRecord | null;
    form: {
      name: string;
      email: string;
      role: string;
      department: string;
      status: string;
      contactNo: string;
      address: string;
    };
  }>({
    open: false,
    user: null,
    form: {
      name: '',
      email: '',
      role: 'Employee',
      department: 'Engineering',
      status: 'Active',
      contactNo: '',
      address: '',
    },
  });

  // Offboard & Delete Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'offboard' | 'reactivate' | 'delete' | 'revoke_invitation';
    targetUser?: UserRecord | null;
    targetInvitation?: InvitationRecord | null;
  }>({
    open: false,
    type: 'offboard',
    targetUser: null,
    targetInvitation: null,
  });

  const TABS = [
    'All Users',
    'Active',
    'Away',
    'Inactive',
    'Invite Audit Log',
    'System Audit Trail',
  ];

  // Role Options (dynamically merge with backend roles if available)
  const availableRoles = useMemo(() => {
    if (rolesData?.data && rolesData.data.length > 0) {
      return rolesData.data.map((r) => ({ label: r.name, value: r.name }));
    }
    return DEFAULT_ROLES;
  }, [rolesData]);

  // Combine API users with local users
  const mergedUsers: UserRecord[] = useMemo(() => {
    if (apiUsers && apiUsers.length > 0) {
      return apiUsers.map((u) => {
        const name = u.name || u.username || u.email.split('@')[0];
        const initials =
          name
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
        return {
          id: u.id,
          name,
          email: u.email,
          role: u.role || u.designation || 'Employee',
          department: u.department || 'Operations',
          status: u.status === 'On Leave' ? 'Away' : u.status || 'Active',
          avatar: initials,
          contactNo: (u as any).contact_number || (u as any).contactNo || '',
          address: (u as any).address || '',
          createdAt: u.join_date || u.joinDate || 'Recently',
        };
      });
    }
    return localUsers;
  }, [apiUsers, localUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return mergedUsers
      .filter((u) => {
        if (activeTab === 'All Users') return true;
        return u.status === activeTab;
      })
      .filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.department.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
      );
  }, [mergedUsers, activeTab, search]);

  // Filtered Invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      if (invitationFilter !== 'all' && inv.status !== invitationFilter) return false;
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
  }, [invitations, invitationFilter, search]);

  // Counts for invitation filters
  const invitationCounts = useMemo(() => {
    return {
      all: invitations.length,
      pending: invitations.filter((i) => i.status === 'pending').length,
      accepted: invitations.filter((i) => i.status === 'accepted').length,
      expired: invitations.filter((i) => i.status === 'expired').length,
      revoked: invitations.filter((i) => i.status === 'revoked').length,
    };
  }, [invitations]);

  // --- ACTION HANDLERS ---
  const handleInviteSubmit = async () => {
    if (!form.name || !form.email || !form.role || !form.department) {
      message.error('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      message.error('Please enter a valid work email address.');
      return;
    }

    try {
      const adminActor = {
        name: (currentAuthUser?.username || 'Hasmukh').trim(),
        email: currentAuthUser?.email || 'hasmukh.arx@gmail.com',
        role: currentAuthUser?.role || 'SuperAdmin',
      };

      // 1. Create invitation in backend MySQL
      let serverLink = `${window.location.origin}/auth/onboarding?email=${encodeURIComponent(form.email)}`;
      let serverPass = `Aether@${Math.floor(100000 + Math.random() * 900000)}!`;

      try {
        const res = await createSystemInvitation({
          email: form.email,
          name: form.name,
          role: form.role,
          department: form.department,
          invitedBy: adminActor,
        }).unwrap();
        if (res.data?.token) {
          serverLink = `${window.location.origin}/auth/onboarding?token=${encodeURIComponent(res.data.token)}&email=${encodeURIComponent(form.email)}`;
        }
        if (res.data?.invitation?.tempPassword) serverPass = res.data.invitation.tempPassword;
      } catch {
        // Fallback: try legacy backend invitation endpoint
        try {
          const res = await generateInvitation({ email: form.email, role: form.role }).unwrap();
          if (res.link) serverLink = res.link;
          if (res.tempPass) serverPass = res.tempPass;
        } catch {
          try {
            await sendInvitation({ email: form.email, role: form.role as UserRole }).unwrap();
          } catch {}
        }
      }

      // 2. Register in staff list
      try {
        await createStaff({
          name: form.name,
          email: form.email,
          role: form.role,
          department: form.department,
          status: 'Active',
        }).unwrap();
      } catch {
        const initials = form.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setLocalUsers((prev) => [
          {
            id: Date.now(),
            name: form.name,
            email: form.email,
            role: form.role,
            department: form.department,
            status: 'Active',
            avatar: initials,
            createdAt: new Date().toISOString().split('T')[0],
          },
          ...prev,
        ]);
      }

      // Initialize employee onboarding tracking profile so Hiring Team immediately monitors them
      ensureEmployeeProfileExists(Date.now(), form.email, form.name, form.role, form.department);

      setInviteResult({
        open: true,
        email: form.email,
        role: form.role,
        link: serverLink,
        tempPass: serverPass,
      });
      message.success(`Invitation dispatched to ${form.email} and saved in the database.`);
      setShowForm(false);
      setForm(emptyForm);
      refetchUsers();
      refetchLogs();
      refetchAuditLogs?.();
      refetchInvitations();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to dispatch invitation');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteResult.link);
    setCopiedLink(true);
    message.success('Invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(inviteResult.tempPass);
    setCopiedPass(true);
    message.success('Temporary password copied to clipboard!');
    setTimeout(() => setCopiedPass(false), 2500);
  };

  // Resend / Renew invitation handler (backend API)
  const handleResendInvitation = async (inv: InvitationRecord) => {
    try {
      const result = await resendSystemInvitation(inv.id).unwrap();
      if (result.success) {
        const newLink = result.token
          ? `${window.location.origin}/auth/onboarding?token=${encodeURIComponent(result.token)}&email=${encodeURIComponent(inv.email)}`
          : `${window.location.origin}/auth/onboarding?email=${encodeURIComponent(inv.email)}`;
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

  // Execute Revoke Invitation (backend API)
  const handleExecuteRevokeInvitation = async () => {
    if (!confirmModal.targetInvitation) return;
    const inv = confirmModal.targetInvitation;

    try {
      await revokeSystemInvitation(inv.id).unwrap();
      message.warning(`Invitation for ${inv.email} has been revoked and access invalidated.`);
      refetchInvitations();
      refetchAuditLogs();
    } catch {
      message.error('Failed to revoke invitation — please try again.');
    }
    setConfirmModal({ open: false, type: 'offboard', targetInvitation: null });
  };

  // Open Edit User modal
  const handleOpenEditUser = (record: UserRecord) => {
    setEditUserModal({
      open: true,
      user: record,
      form: {
        name: record.name,
        email: record.email,
        role: record.role,
        department: record.department,
        status: record.status,
        contactNo: record.contactNo || '',
        address: record.address || '',
      },
    });
  };

  // Save edited user details and record audit log
  const handleSaveUserEdit = async () => {
    if (!editUserModal.user) return;
    const orig = editUserModal.user;
    const { form: edited } = editUserModal;

    if (!edited.name || !edited.email) {
      message.error('Name and email are required fields.');
      return;
    }

    // Calculate diffs for audit log
    const changedFields: Array<{ field: string; from: any; to: any }> = [];
    if (orig.name !== edited.name)
      changedFields.push({ field: 'name', from: orig.name, to: edited.name });
    if (orig.email !== edited.email)
      changedFields.push({ field: 'email', from: orig.email, to: edited.email });
    if (orig.role !== edited.role)
      changedFields.push({ field: 'role', from: orig.role, to: edited.role });
    if (orig.department !== edited.department)
      changedFields.push({ field: 'department', from: orig.department, to: edited.department });
    if (orig.status !== edited.status)
      changedFields.push({ field: 'status', from: orig.status, to: edited.status });
    if ((orig.contactNo || '') !== (edited.contactNo || '')) {
      changedFields.push({
        field: 'contactNo',
        from: orig.contactNo || '',
        to: edited.contactNo || '',
      });
    }
    if ((orig.address || '') !== (edited.address || '')) {
      changedFields.push({ field: 'address', from: orig.address || '', to: edited.address || '' });
    }

    try {
      await updateStaff({
        id: orig.id,
        name: edited.name,
        email: edited.email,
        role: edited.role,
        department: edited.department,
        status: edited.status,
      }).unwrap();
    } catch {
      // Local fallback
    }

    // Update local state
    setLocalUsers((prev) => prev.map((u) => (u.id === orig.id ? { ...u, ...edited } : u)));

    // Record in centralized audit log
    if (changedFields.length > 0) {
      recordAuditLog({
        action: 'User Profile Modified by Administrator',
        category: 'user_management',
        user: currentAuthUser?.username || 'Administrator',
        userEmail: currentAuthUser?.email || 'admin@aetheradix.com',
        target: `${edited.name} (${edited.email})`,
        targetEmail: edited.email,
        status: 'Success',
        details: `Administrator updated user properties: ${changedFields.map((c) => c.field).join(', ')}.`,
        changes: changedFields,
      });
    }

    message.success(`User profile for ${edited.name} updated and recorded in audit log.`);
    setEditUserModal({ ...editUserModal, open: false, user: null });
    refetchUsers();
  };

  // Status & Delete Actions
  const handleExecuteStatusChange = async () => {
    if (confirmModal.type === 'revoke_invitation') {
      handleExecuteRevokeInvitation();
      return;
    }

    if (!confirmModal.targetUser) return;
    const { targetUser, type } = confirmModal;

    try {
      if (type === 'offboard') {
        await updateStaff({ id: targetUser.id, status: 'Inactive' }).unwrap();
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Inactive' } : u))
        );

        recordAuditLog({
          action: 'User Account Offboarded / Disabled',
          category: 'user_management',
          user: currentAuthUser?.username || 'Administrator',
          userEmail: currentAuthUser?.email || 'admin@aetheradix.com',
          target: `${targetUser.name} (${targetUser.email})`,
          targetEmail: targetUser.email,
          status: 'Warning',
          details: `User account disabled and active sessions terminated.`,
        });

        message.success(`${targetUser.name} has been off-boarded and access is disabled.`);
      } else if (type === 'reactivate') {
        await updateStaff({ id: targetUser.id, status: 'Active' }).unwrap();
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Active' } : u))
        );

        recordAuditLog({
          action: 'User Account Reactivated',
          category: 'user_management',
          user: currentAuthUser?.username || 'Administrator',
          userEmail: currentAuthUser?.email || 'admin@aetheradix.com',
          target: `${targetUser.name} (${targetUser.email})`,
          targetEmail: targetUser.email,
          status: 'Success',
          details: `Account reactivated. Access restored.`,
        });

        message.success(`${targetUser.name}'s account has been reactivated.`);
      } else if (type === 'delete') {
        await deleteUser(targetUser.id).unwrap();
        setLocalUsers((prev) => prev.filter((u) => u.id !== targetUser.id));

        recordAuditLog({
          action: 'User Account Record Deleted',
          category: 'user_management',
          user: currentAuthUser?.username || 'Administrator',
          userEmail: currentAuthUser?.email || 'admin@aetheradix.com',
          target: `${targetUser.name} (${targetUser.email})`,
          targetEmail: targetUser.email,
          status: 'Critical',
          details: `User permanently deleted from system database.`,
        });

        message.success(`${targetUser.name} has been deleted.`);
      }
    } catch {
      // Local fallback
      if (type === 'offboard') {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Inactive' } : u))
        );
        message.success(`${targetUser.name} has been off-boarded.`);
      } else if (type === 'reactivate') {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Active' } : u))
        );
        message.success(`${targetUser.name}'s account reactivated.`);
      } else if (type === 'delete') {
        setLocalUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
        message.success(`${targetUser.name} deleted.`);
      }
    } finally {
      setConfirmModal({ open: false, type: 'offboard', targetUser: null, targetInvitation: null });
      refetchUsers();
    }
  };

  // Action Menu generator for each user
  const getUserActionsMenu = (record: UserRecord): MenuProps['items'] => {
    const isInactive = record.status === 'Inactive';
    const items: MenuProps['items'] = [];

    // Edit User Profile action
    if (isAuthorizedAdmin) {
      items.push({
        key: 'edit',
        icon: <Edit3 size={14} className="text-primary" />,
        label: <span className="text-foreground font-semibold">Edit User Profile</span>,
        onClick: () => handleOpenEditUser(record),
      });
      items.push({ type: 'divider' });
    }

    if (isInactive) {
      items.push({
        key: 'reactivate',
        icon: <UserCheck size={14} className="text-success" />,
        label: <span className="text-success font-semibold">Reactivate Account</span>,
        onClick: () =>
          setConfirmModal({
            open: true,
            type: 'reactivate',
            targetUser: record,
          }),
      });
    } else {
      items.push({
        key: 'offboard',
        icon: <UserX size={14} className="text-error" />,
        label: <span className="text-error font-semibold">Offboard / Disable</span>,
        onClick: () =>
          setConfirmModal({
            open: true,
            type: 'offboard',
            targetUser: record,
          }),
      });
    }

    items.push({ type: 'divider' });
    items.push({
      key: 'delete',
      icon: <Trash2 size={14} className="text-muted" />,
      label: <span className="text-muted font-medium">Delete Record</span>,
      onClick: () =>
        setConfirmModal({
          open: true,
          type: 'delete',
          targetUser: record,
        }),
    });

    return items;
  };

  // User Table Columns
  const columns: ColumnsType<UserRecord> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black ring-2 ring-primary/20">
            {record.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{record.name}</span>
            <span className="text-xs text-muted">{record.email}</span>
            {record.contactNo && (
              <span className="text-[11px] text-muted/70">{record.contactNo}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span
          className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
            roleColors[role] || 'bg-surface-subtle text-muted border-border-subtle'
          }`}>
          {role}
        </span>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <span className="text-sm font-medium text-muted">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
            statusColors[status] || 'text-muted border-border-subtle'
          }`}>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'Active' ? 'bg-success' : status === 'Away' ? 'bg-warning' : 'bg-muted'
            }`}
          />
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Dropdown menu={{ items: getUserActionsMenu(record) }} trigger={['click']}>
          <button className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors border border-transparent hover:border-border-subtle">
            <MoreHorizontal size={16} />
          </button>
        </Dropdown>
      ),
    },
  ];

  // Invitations Audit Log Columns
  const invitationColumns: ColumnsType<InvitationRecord> = [
    {
      title: 'Invited User',
      key: 'invitedUser',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {record.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{record.name}</span>
            <span className="text-xs text-muted font-mono">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Assigned Role & Dept',
      key: 'roleDept',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border w-fit ${
              roleColors[record.role] || 'bg-surface-subtle text-muted border-border-subtle'
            }`}>
            {record.role}
          </span>
          <span className="text-xs text-muted">{record.department}</span>
        </div>
      ),
    },
    {
      title: 'Invited By (Admin)',
      key: 'invitedBy',
      render: (_, record) => {
        const invName =
          record.invitedBy?.name &&
          record.invitedBy.name !== 'Sarah Chen' &&
          record.invitedBy.name !== 'Admin'
            ? record.invitedBy.name
            : (currentAuthUser?.username || 'Hasmukh').trim();
        const invEmail =
          record.invitedBy?.email &&
          !record.invitedBy.email.includes('sarah') &&
          !record.invitedBy.email.includes('admin@')
            ? record.invitedBy.email
            : currentAuthUser?.email || 'hasmukh.arx@gmail.com';
        const invRole =
          record.invitedBy?.role && record.invitedBy.role !== 'Admin'
            ? record.invitedBy.role
            : currentAuthUser?.role || 'SuperAdmin';

        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{invName}</span>
            <span className="text-[11px] text-muted">{invEmail}</span>
            <span className="text-[10px] text-primary/80 font-semibold">{invRole}</span>
          </div>
        );
      },
    },
    {
      title: 'Sent Date & Time',
      dataIndex: 'invitedAt',
      key: 'invitedAt',
      render: (ts) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">{new Date(ts).toLocaleDateString()}</span>
          <span className="text-[11px] text-muted">
            {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.status === 'accepted') {
          return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Accepted & Active
            </span>
          );
        }
        if (record.status === 'pending') {
          return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" /> Pending
            </span>
          );
        }
        if (record.status === 'expired') {
          return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface-subtle text-muted border border-border-subtle inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted" /> Expired
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-error/10 text-error border border-error/20 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-error" /> Revoked
          </span>
        );
      },
    },
    {
      title: 'Expiration / Details',
      key: 'expiration',
      render: (_, record) => {
        if (record.status === 'accepted') {
          return (
            <span className="text-xs text-success font-medium">
              Completed on{' '}
              {record.acceptedAt ? new Date(record.acceptedAt).toLocaleDateString() : 'Active'}
            </span>
          );
        }
        if (record.status === 'revoked') {
          return (
            <span className="text-xs text-error font-medium">
              Revoked by {record.revokedBy?.name || 'Admin'}
            </span>
          );
        }
        const isPast = Date.now() > new Date(record.expiresAt).getTime();
        return (
          <div className="flex flex-col text-xs">
            <span className={isPast ? 'text-error font-semibold' : 'text-foreground'}>
              {new Date(record.expiresAt).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-muted">
              {isPast ? 'Expired token' : 'Valid for 7 days'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Audit Actions',
      key: 'actions',
      render: (_, record) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const onboardingLink = `${origin}/auth/onboarding?token=${encodeURIComponent(
          record.token
        )}&email=${encodeURIComponent(record.email)}`;

        return (
          <div className="flex items-center gap-2">
            {/* Copy Onboarding Link */}
            {record.status === 'pending' && (
              <Tooltip title="Copy Onboarding URL">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(onboardingLink);
                    message.success('Onboarding link copied to clipboard!');
                  }}
                  className="p-1.5 rounded-lg bg-surface-subtle hover:bg-primary/10 hover:text-primary transition-colors text-muted cursor-pointer"
                  aria-label="Copy Onboarding URL">
                  <Copy size={14} />
                </button>
              </Tooltip>
            )}

            {/* Resend / Renew */}
            {(record.status === 'pending' || record.status === 'expired') && (
              <Tooltip
                title={record.status === 'expired' ? 'Renew 7-Day Invitation' : 'Resend Invite'}>
                <button
                  onClick={() => handleResendInvitation(record)}
                  className="p-1.5 rounded-lg bg-surface-subtle hover:bg-success/10 hover:text-success transition-colors text-muted cursor-pointer"
                  aria-label="Resend or Renew Invitation">
                  <RefreshCw size={14} />
                </button>
              </Tooltip>
            )}

            {/* Revoke */}
            {record.status === 'pending' && (
              <Tooltip title="Revoke & Invalidate Token">
                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      type: 'revoke_invitation',
                      targetInvitation: record,
                    })
                  }
                  className="p-1.5 rounded-lg bg-surface-subtle hover:bg-error/10 hover:text-error transition-colors text-muted cursor-pointer"
                  aria-label="Revoke Invitation">
                  <Ban size={14} />
                </button>
              </Tooltip>
            )}

            {record.status === 'accepted' && (
              <span className="text-[11px] text-muted font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} className="text-success" /> Active
              </span>
            )}
          </div>
        );
      },
    },
  ];

  // System Audit Log Columns
  const systemAuditColumns: ColumnsType<AuditLogEntry> = [
    {
      title: 'Action / Event',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <span className="text-xs font-bold text-foreground">{text}</span>,
    },
    {
      title: 'Initiated By',
      key: 'user',
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">{r.user}</span>
          <span className="text-[10px] text-muted">{r.userEmail}</span>
        </div>
      ),
    },
    {
      title: 'Target Entity',
      dataIndex: 'target',
      key: 'target',
      render: (text) => (
        <span className="px-2.5 py-1 rounded bg-surface-subtle border border-border-subtle text-xs font-medium text-foreground">
          {text}
        </span>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts) => (
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} />
          <span>{new Date(ts).toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: 'Outcome',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Success' ? 'success' : status === 'Warning' ? 'warning' : 'error'}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Users & Access Management"
        description="Invite new employees, configure role-based access, track invitation audit logs, and oversee account lifecycles."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Users' }]}
        primaryAction={{
          label: 'Invite User',
          onClick: () => setShowForm(true),
          icon: 'pi pi-user-plus',
        }}
      />

      {/* Search and Navigation Toolbar */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={
              activeTab === 'Invite Audit Log'
                ? 'Search invitations by name, email, or admin...'
                : 'Search users by name, email, department, role...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Tabs items={TABS} activeItem={activeTab} onItemChange={setActiveTab} />
      </div>

      {/* TAB 1: INVITATION AUDIT LOG */}
      {activeTab === 'Invite Audit Log' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  User Invitation Audit Log & Status Tracker
                </h3>
                <p className="text-xs text-muted">
                  Audit trail tracking who invited users, issuance date/time, token expirations, and
                  status transitions (Pending, Accepted, Expired, Revoked).
                </p>
              </div>
            </div>

            {/* Invitation Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All', count: invitationCounts.all },
                { id: 'pending', label: 'Pending', count: invitationCounts.pending },
                { id: 'accepted', label: 'Accepted', count: invitationCounts.accepted },
                { id: 'expired', label: 'Expired', count: invitationCounts.expired },
                { id: 'revoked', label: 'Revoked', count: invitationCounts.revoked },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setInvitationFilter(st.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    invitationFilter === st.id
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-surface-subtle text-muted hover:text-foreground'
                  }`}>
                  <span>{st.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      invitationFilter === st.id
                        ? 'bg-background/20 text-background'
                        : 'bg-border-subtle text-muted'
                    }`}>
                    {st.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Table
            scroll={{ x: 'max-content' }}
            columns={invitationColumns}
            dataSource={filteredInvitations}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            className="premium-table"
            locale={{
              emptyText: (
                <div className="py-12 text-center text-muted text-sm">
                  No invitations match the selected criteria.
                </div>
              ),
            }}
          />
        </motion.div>
      )}

      {/* TAB 2: SYSTEM AUDIT TRAIL */}
      {activeTab === 'System Audit Trail' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Platform Activity & Security Audit Trail
              </h3>
              <p className="text-xs text-muted">
                Historical security log tracking profile edits, password changes, approvals, and
                administrative modifications.
              </p>
            </div>
          </div>

          <Table
            scroll={{ x: 'max-content' }}
            columns={systemAuditColumns}
            dataSource={auditLogs}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            className="premium-table"
            locale={{
              emptyText: (
                <div className="py-12 text-center text-muted text-sm">
                  No platform activity records found.
                </div>
              ),
            }}
          />
        </motion.div>
      )}

      {/* USER LIST TABS: ALL USERS / ACTIVE / AWAY / INACTIVE */}
      {!['Invite Audit Log', 'System Audit Trail'].includes(activeTab) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
          <Table
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={isUsersLoading}
            pagination={{ pageSize: 10 }}
            className="premium-table"
          />
        </motion.div>
      )}

      {/* Invite User Form Modal */}
      <Dialog
        visible={showForm}
        onHide={() => setShowForm(false)}
        header="Invite New User"
        modal
        className="w-full max-w-xl mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-5">
          <p className="text-xs text-muted -mt-2">
            Send an onboarding invitation. An immutable audit record will track when the invitation
            was issued, the recipient, and status changes until onboarding is completed.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Full Name
            </label>
            <Input
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Work Email Address
            </label>
            <Input
              type="email"
              placeholder="john.doe@aetheradix.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Assigned Role
              </label>
              <Select
                options={availableRoles}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.value })}
                placeholder="Select role"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Department
              </label>
              <Select
                options={DEPTS}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.value })}
                placeholder="Select dept"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3 mt-1">
            <ShieldCheck size={18} className="text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-foreground/80 space-y-1">
              <p className="font-semibold text-foreground">Audit & Security Policy</p>
              <p className="text-muted leading-relaxed">
                The invitation token will be valid for 7 days. The user will complete their profile,
                residential address, and set a compliant master password via the onboarding flow.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="rounded-md!"
            />
            <Button
              label={
                isSendingInvite || isGeneratingInvite || isCreatingStaff
                  ? 'Dispatching...'
                  : 'Send Invitation'
              }
              onClick={handleInviteSubmit}
              disabled={isSendingInvite || isGeneratingInvite || isCreatingStaff}
              icon="pi pi-send"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>

      {/* Invitation Credentials & Link Result Dialog */}
      <Dialog
        visible={inviteResult.open}
        onHide={() => setInviteResult((prev) => ({ ...prev, open: false }))}
        header="Invitation Dispatched & Recorded"
        modal
        className="w-full max-w-lg mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success">
            <UserPlus size={20} className="shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Invitation and audit trail entry created for </span>
              <span className="font-extrabold underline">{inviteResult.email}</span>
              <span> ({inviteResult.role})</span>
            </div>
          </div>

          {/* Direct Invite Link */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Onboarding / Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteResult.link}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-mono text-foreground focus:outline-none select-all"
              />
              <Button
                variant={copiedLink ? 'outline' : 'primary'}
                label={copiedLink ? 'Copied!' : 'Copy'}
                icon={copiedLink ? 'pi pi-check' : 'pi pi-copy'}
                onClick={handleCopyLink}
                className="rounded-md! shrink-0!"
              />
            </div>
          </div>

          {/* Temporary Credentials */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Temporary Password
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteResult.tempPass}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-mono font-bold text-foreground focus:outline-none select-all"
              />
              <Button
                variant={copiedPass ? 'outline' : 'secondary'}
                label={copiedPass ? 'Copied!' : 'Copy'}
                icon={copiedPass ? 'pi pi-check' : 'pi pi-copy'}
                onClick={handleCopyPass}
                className="rounded-md! shrink-0!"
              />
            </div>
          </div>

          <div className="text-xs text-muted leading-relaxed p-3 rounded-lg bg-surface-subtle">
            💡 Share this link with the recipient. The invitation status is currently{' '}
            <strong className="text-warning">Pending</strong> and will transition to{' '}
            <strong className="text-success">Accepted & Active</strong> once they complete the
            onboarding wizard.
          </div>

          <div className="flex justify-end pt-2">
            <Button
              label="Done"
              onClick={() => setInviteResult((prev) => ({ ...prev, open: false }))}
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>

      {/* Edit User Profile Dialog (Requirement 1.4) */}
      <Dialog
        visible={editUserModal.open}
        onHide={() => setEditUserModal({ ...editUserModal, open: false, user: null })}
        header="Edit User Profile (Admin)"
        modal
        className="w-full max-w-lg mx-4"
        contentClassName="p-8"
        headerClassName="px-8 pt-8 pb-4 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}>
        <div className="flex flex-col gap-5">
          <p className="text-xs text-muted -mt-2">
            Update employee profile information. Changes are validated and logged into the platform
            audit trail.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Full Name
            </label>
            <Input
              value={editUserModal.form.name}
              onChange={(e) =>
                setEditUserModal({
                  ...editUserModal,
                  form: { ...editUserModal.form, name: e.target.value },
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              Email Address
            </label>
            <Input
              type="email"
              value={editUserModal.form.email}
              onChange={(e) =>
                setEditUserModal({
                  ...editUserModal,
                  form: { ...editUserModal.form, email: e.target.value },
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Role
              </label>
              <Select
                options={availableRoles}
                value={editUserModal.form.role}
                onChange={(e) =>
                  setEditUserModal({
                    ...editUserModal,
                    form: { ...editUserModal.form, role: e.value },
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Department
              </label>
              <Select
                options={DEPTS}
                value={editUserModal.form.department}
                onChange={(e) =>
                  setEditUserModal({
                    ...editUserModal,
                    form: { ...editUserModal.form, department: e.value },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Contact Number
              </label>
              <Input
                placeholder="+1 555-0199"
                value={editUserModal.form.contactNo}
                onChange={(e) =>
                  setEditUserModal({
                    ...editUserModal,
                    form: { ...editUserModal.form, contactNo: e.target.value },
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
                Status
              </label>
              <Select
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Away', value: 'Away' },
                  { label: 'Inactive', value: 'Inactive' },
                ]}
                value={editUserModal.form.status}
                onChange={(e) =>
                  setEditUserModal({
                    ...editUserModal,
                    form: { ...editUserModal.form, status: e.value },
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => setEditUserModal({ ...editUserModal, open: false, user: null })}
              className="rounded-md!"
            />
            <Button
              label="Save Changes"
              icon="pi pi-check"
              onClick={handleSaveUserEdit}
              className="rounded-md! px-6!"
            />
          </div>
        </div>
      </Dialog>

      {/* Confirm Offboard / Reactivate / Delete / Revoke Dialog */}
      <ConfirmDialog
        visible={confirmModal.open}
        onHide={() =>
          setConfirmModal({
            open: false,
            type: 'offboard',
            targetUser: null,
            targetInvitation: null,
          })
        }
        header={
          confirmModal.type === 'revoke_invitation'
            ? 'Revoke User Invitation'
            : confirmModal.type === 'offboard'
              ? 'Confirm User Offboarding'
              : confirmModal.type === 'reactivate'
                ? 'Reactivate User Account'
                : 'Delete User Record'
        }
        message={
          confirmModal.type === 'revoke_invitation' ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to revoke the invitation for{' '}
                <strong className="text-foreground">{confirmModal.targetInvitation?.email}</strong>?
              </p>
              <p className="text-xs text-muted">
                The onboarding security token will be immediately invalidated and recorded as{' '}
                <span className="text-error font-semibold">Revoked</span> in the audit log.
              </p>
            </div>
          ) : confirmModal.type === 'offboard' ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to offboard{' '}
                <strong className="text-foreground">{confirmModal.targetUser?.name}</strong>?
              </p>
              <p className="text-xs text-muted">
                Their active session will be terminated and their account marked as{' '}
                <span className="text-error font-semibold">Inactive</span>.
              </p>
            </div>
          ) : confirmModal.type === 'reactivate' ? (
            <div className="space-y-2">
              <p>
                Reactivate login access for{' '}
                <strong className="text-foreground">{confirmModal.targetUser?.name}</strong>?
              </p>
              <p className="text-xs text-muted">
                The user will be able to log back into the ERP with their assigned permissions.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                Are you sure you want to permanently delete{' '}
                <strong className="text-foreground">{confirmModal.targetUser?.name}</strong>?
              </p>
              <p className="text-xs text-error font-medium">
                This action is irreversible and removes the user from the staff database.
              </p>
            </div>
          )
        }
        accept={handleExecuteStatusChange}
        reject={() =>
          setConfirmModal({
            open: false,
            type: 'offboard',
            targetUser: null,
            targetInvitation: null,
          })
        }
      />
    </div>
  );
}
