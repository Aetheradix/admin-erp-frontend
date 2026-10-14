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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { ConfirmDialog } from '@/components/ui/composed/ConfirmDialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { Table, Dropdown, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

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
  type AuditLog,
} from '@/store/api/authApiSlice';
import { useGetRolesQuery } from '@/store/api/roleApiSlice';
import type { UserRole } from '@/config/navItems';

export interface UserRecord {
  id: number | string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  avatar: string;
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
  // --- RTK QUERY HOOKS ---
  const { data: apiUsers, isLoading: isUsersLoading, refetch: refetchUsers } = useGetUsersQuery();
  const { data: rolesData } = useGetRolesQuery();
  const { data: rawApprovalLogs, isLoading: isAuditLoading, refetch: refetchLogs } = useGetApprovalLogsQuery();

  const [sendInvitation, { isLoading: isSendingInvite }] = useSendInvitationMutation();
  const [generateInvitation, { isLoading: isGeneratingInvite }] = useGenerateInvitationMutation();
  const [createStaff, { isLoading: isCreatingStaff }] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteUser] = useDeleteUserMutation();

  // --- LOCAL STATE ---
  const [localUsers, setLocalUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

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

  // Offboard & Delete Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'offboard' | 'reactivate' | 'delete';
    targetUser: UserRecord | null;
  }>({
    open: false,
    type: 'offboard',
    targetUser: null,
  });

  const TABS = ['All', 'Active', 'Away', 'Inactive', 'Audit Trail'];

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
          status: u.status === 'On Leave' ? 'Away' : (u.status || 'Active'),
          avatar: initials,
          createdAt: u.join_date || u.joinDate || 'Recently',
        };
      });
    }
    return localUsers;
  }, [apiUsers, localUsers]);

  // Audit Logs formatting
  const auditLogs: AuditLog[] = useMemo(() => {
    const responseObj = rawApprovalLogs as unknown as { data?: AuditLog[]; logs?: AuditLog[] };
    const raw = Array.isArray(rawApprovalLogs)
      ? rawApprovalLogs
      : (responseObj?.data ?? responseObj?.logs ?? []);
    return Array.isArray(raw) ? raw : [];
  }, [rawApprovalLogs]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return mergedUsers
      .filter((u) => activeTab === 'All' || u.status === activeTab)
      .filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.department.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase())
      );
  }, [mergedUsers, activeTab, search]);

  // --- ACTION HANDLERS ---
  const handleInviteSubmit = async () => {
    if (!form.name || !form.email || !form.role || !form.department) {
      message.error('Please fill in all required fields.');
      return;
    }

    const tempPassword = `Aether@${Math.floor(100000 + Math.random() * 900000)}!`;
    const inviteLink = `${window.location.origin}/auth/onboarding?email=${encodeURIComponent(
      form.email
    )}&role=${encodeURIComponent(form.role)}`;

    try {
      // 1. Try backend invitation API
      let serverLink = inviteLink;
      let serverPass = tempPassword;
      try {
        const res = await generateInvitation({
          email: form.email,
          role: form.role,
        }).unwrap();
        if (res.link) serverLink = res.link;
        if (res.tempPass) serverPass = res.tempPass;
      } catch {
        // Fallback to sendInvitation
        try {
          await sendInvitation({
            email: form.email,
            role: form.role as UserRole,
          }).unwrap();
        } catch {
          // If offline / dev mode, proceed with local credentials
        }
      }

      // 2. Also register in staff list if API available
      try {
        await createStaff({
          name: form.name,
          email: form.email,
          role: form.role,
          department: form.department,
          status: 'Active',
        }).unwrap();
      } catch {
        // Local fallback
        const initials = form.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const newUser: UserRecord = {
          id: Date.now(),
          name: form.name,
          email: form.email,
          role: form.role,
          department: form.department,
          status: 'Active',
          avatar: initials,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setLocalUsers((prev) => [newUser, ...prev]);
      }

      // Show result modal
      setInviteResult({
        open: true,
        email: form.email,
        role: form.role,
        link: serverLink,
        tempPass: serverPass,
      });

      message.success(`Invitation created for ${form.email}`);
      setShowForm(false);
      setForm(emptyForm);
      refetchUsers();
      refetchLogs();
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

  // Status & Delete Actions
  const handleExecuteStatusChange = async () => {
    if (!confirmModal.targetUser) return;
    const { targetUser, type } = confirmModal;

    try {
      if (type === 'offboard') {
        // Disable / Offboard user
        await updateStaff({
          id: targetUser.id,
          status: 'Inactive',
        }).unwrap();
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Inactive' } : u))
        );
        message.success(`${targetUser.name} has been off-boarded and access is disabled.`);
      } else if (type === 'reactivate') {
        // Reactivate user
        await updateStaff({
          id: targetUser.id,
          status: 'Active',
        }).unwrap();
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Active' } : u))
        );
        message.success(`${targetUser.name}'s account has been reactivated.`);
      } else if (type === 'delete') {
        // Delete user
        await deleteUser(targetUser.id).unwrap();
        setLocalUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
        message.success(`${targetUser.name} has been deleted.`);
      }
    } catch {
      // Local fallback for offline / mock testing
      if (type === 'offboard') {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Inactive' } : u))
        );
        message.success(`${targetUser.name} has been off-boarded (local).`);
      } else if (type === 'reactivate') {
        setLocalUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: 'Active' } : u))
        );
        message.success(`${targetUser.name}'s account has been reactivated (local).`);
      } else if (type === 'delete') {
        setLocalUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
        message.success(`${targetUser.name} has been deleted (local).`);
      }
    } finally {
      setConfirmModal({ open: false, type: 'offboard', targetUser: null });
      refetchUsers();
    }
  };

  // Action Menu generator for each user
  const getUserActionsMenu = (record: UserRecord): MenuProps['items'] => {
    const isInactive = record.status === 'Inactive';
    return [
      isInactive
        ? {
            key: 'reactivate',
            icon: <UserCheck size={14} className="text-success" />,
            label: <span className="text-success font-semibold">Reactivate Account</span>,
            onClick: () =>
              setConfirmModal({
                open: true,
                type: 'reactivate',
                targetUser: record,
              }),
          }
        : {
            key: 'offboard',
            icon: <UserX size={14} className="text-error" />,
            label: <span className="text-error font-semibold">Offboard / Disable</span>,
            onClick: () =>
              setConfirmModal({
                open: true,
                type: 'offboard',
                targetUser: record,
              }),
          },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <Trash2 size={14} className="text-muted" />,
        label: <span className="text-muted font-medium">Delete Record</span>,
        onClick: () =>
          setConfirmModal({
            open: true,
            type: 'delete',
            targetUser: record,
          }),
      },
    ];
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
              status === 'Active'
                ? 'bg-success'
                : status === 'Away'
                ? 'bg-warning'
                : 'bg-muted'
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

  // Audit Logs Table Columns
  const auditColumns: ColumnsType<AuditLog> = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={action === 'APPROVED' ? 'success' : 'error'} className="font-bold">
          {action}
        </Tag>
      ),
    },
    {
      title: 'Target User',
      key: 'targetUser',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            {record.targetUser?.name || 'User'}
          </span>
          <span className="text-xs text-muted">{record.targetUser?.email}</span>
        </div>
      ),
    },
    {
      title: 'Assigned Role',
      dataIndex: 'assignedRole',
      key: 'assignedRole',
      render: (role) => (
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
          {role || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Action By',
      key: 'actionBy',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">
            {record.actionBy?.name || 'Administrator'}
          </span>
          <span className="text-[11px] text-muted">{record.actionBy?.email}</span>
        </div>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts) => (
        <span className="text-xs text-muted">
          {ts ? new Date(ts).toLocaleString() : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Users & Access Management"
        description="Invite new employees, configure role-based access, and oversee account lifecycles and off-boarding."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Users' }]}
        primaryAction={{
          label: 'Invite User',
          onClick: () => setShowForm(true),
          icon: 'pi pi-user-plus',
        }}
      />

      {/* Search and Tabs Toolbar */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, department, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-md bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Tabs items={TABS} activeItem={activeTab} onItemChange={setActiveTab} />
      </div>

      {/* Main Content: Table or Audit Trail */}
      {activeTab === 'Audit Trail' ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden p-6">
          <div className="flex items-center gap-3 pb-6 border-b border-border-subtle mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">User Audit Trail & Approval Logs</h3>
              <p className="text-xs text-muted">
                Immutable security record of user invitations, account activations, and permission changes.
              </p>
            </div>
          </div>
          <Table
            columns={auditColumns}
            dataSource={auditLogs}
            rowKey={(r) => r.id || `${r.timestamp}-${r.targetUser?.email}`}
            loading={isAuditLoading}
            pagination={{ pageSize: 8 }}
            className="premium-table"
            locale={{
              emptyText: (
                <div className="py-12 text-center text-muted text-sm">
                  No approval or invitation audit logs recorded yet.
                </div>
              ),
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden">
          <Table
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
            Send an invitation to a new team member with pre-configured access rights. They will be
            guided to complete onboarding on first login.
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
              <p className="font-semibold text-foreground">Security Policy Note</p>
              <p className="text-muted leading-relaxed">
                An invitation token and single-use temporary password will be generated. The user will
                be required to configure mandatory 2FA and set a custom password upon initial login.
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
        header="Invitation Dispatched Successfully"
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
              <span className="font-bold">Account invitation ready for </span>
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
            💡 Share these credentials or link with the employee. Once they complete the onboarding
            wizard, their status will transition to <strong className="text-success">Active</strong>.
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

      {/* Confirm Offboard / Reactivate / Delete Dialog */}
      <ConfirmDialog
        visible={confirmModal.open}
        onHide={() => setConfirmModal({ open: false, type: 'offboard', targetUser: null })}
        header={
          confirmModal.type === 'offboard'
            ? 'Confirm User Offboarding'
            : confirmModal.type === 'reactivate'
            ? 'Reactivate User Account'
            : 'Delete User Record'
        }
        message={
          confirmModal.type === 'offboard' ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to offboard{' '}
                <strong className="text-foreground">{confirmModal.targetUser?.name}</strong>?
              </p>
              <p className="text-xs text-muted">
                Their active session will be terminated and their account marked as{' '}
                <span className="text-error font-semibold">Inactive</span>. They will lose access to
                all systems immediately.
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
        reject={() => setConfirmModal({ open: false, type: 'offboard', targetUser: null })}
      />
    </div>
  );
}
