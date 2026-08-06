import { useState } from 'react';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import { Tabs } from '@/components/ui/primitives/Tabs';
import { Search, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  avatar: string;
}

export const initialUsers: UserRecord[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@aetheradix.com',
    role: 'Super Admin',
    department: 'Engineering',
    status: 'Active',
    avatar: 'SC',
  },
  {
    id: 2,
    name: 'James Wilson',
    email: 'james.wilson@aetheradix.com',
    role: 'Admin',
    department: 'Operations',
    status: 'Active',
    avatar: 'JW',
  },
  {
    id: 3,
    name: 'Maya Johnson',
    email: 'maya.johnson@aetheradix.com',
    role: 'Manager',
    department: 'Design',
    status: 'Active',
    avatar: 'MJ',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@aetheradix.com',
    role: 'Developer',
    department: 'Engineering',
    status: 'Active',
    avatar: 'DK',
  },
  {
    id: 5,
    name: 'Lisa Park',
    email: 'lisa.park@aetheradix.com',
    role: 'Manager',
    department: 'HR',
    status: 'Active',
    avatar: 'LP',
  },
  {
    id: 6,
    name: 'Alex Rivera',
    email: 'alex.rivera@aetheradix.com',
    role: 'Developer',
    department: 'Marketing',
    status: 'Away',
    avatar: 'AR',
  },
  {
    id: 7,
    name: 'Emily Davis',
    email: 'emily.davis@aetheradix.com',
    role: 'Viewer',
    department: 'Finance',
    status: 'Active',
    avatar: 'ED',
  },
  {
    id: 8,
    name: 'Rahul Patel',
    email: 'rahul.patel@aetheradix.com',
    role: 'Developer',
    department: 'Engineering',
    status: 'Inactive',
    avatar: 'RP',
  },
];

const ROLES = [
  { label: 'Super Admin', value: 'Super Admin' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Developer', value: 'Developer' },
  { label: 'Viewer', value: 'Viewer' },
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
  'Super Admin': 'bg-error/10 text-error',
  Admin: 'bg-warning/10 text-warning',
  Manager: 'bg-primary/10 text-primary',
  Developer: 'bg-info/10 text-info',
  Viewer: 'bg-surface-subtle text-muted',
};

const statusColors: Record<string, string> = {
  Active: 'text-success',
  Away: 'text-warning',
  Inactive: 'text-muted',
};

const emptyForm = { name: '', email: '', role: '', department: '' };

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const TABS = ['All', 'Active', 'Away', 'Inactive'];

  const filtered = users
    .filter((u) => activeTab === 'All' || u.status === activeTab)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.role || !form.department) return;
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
    };
    setUsers([newUser, ...users]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const columns: ColumnsType<UserRecord> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
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
          className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${roleColors[role] || 'bg-surface-subtle text-muted'}`}
        >
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
        <span className={`text-xs font-bold ${statusColors[status] || 'text-muted'}`}>
          ● {status}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: () => (
        <button className="p-2 rounded-lg hover:bg-surface-subtle text-muted hover:text-foreground transition-colors">
          <MoreHorizontal size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and access across the organization."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Users' }]}
        primaryAction={{
          label: 'Invite User',
          onClick: () => setShowForm(true),
          icon: 'pi pi-user-plus',
        }}
      />

      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-md bg-surface-subtle border-none text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Tabs items={TABS} activeItem={activeTab} onItemChange={setActiveTab} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden"
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={false}
          className="premium-table"
        />
      </motion.div>

      {/* Invite User Dialog */}
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
        }}
      >
        <div className="flex flex-col gap-5">
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
              Email Address
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
                Role
              </label>
              <Select
                options={ROLES}
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
              label="Send Invite"
              onClick={handleSubmit}
              icon="pi pi-send"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
