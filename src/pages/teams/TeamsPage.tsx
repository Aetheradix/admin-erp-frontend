import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/composed/PageHeader';
import {
  Users,
  Crown,
  Folder,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Select } from '@/components/ui/primitives/Select';
import { Button } from '@/components/ui/primitives/Button';
import {
  useGetTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} from '@/store/api/teamsApiSlice';
import type { Team, CreateTeamPayload } from '@/store/api/teamsApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useAuth } from '@/hooks/useAuth';

const COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
  '#14B8A6',
];

const DEPARTMENTS = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Creative', value: 'Creative' },
  { label: 'Growth', value: 'Growth' },
  { label: 'Revenue', value: 'Revenue' },
  { label: 'People', value: 'People' },
  { label: 'Infrastructure', value: 'Infrastructure' },
];

interface TeamFormState {
  name: string;
  department: string;
  description: string;
  manager_id: string;
  color: string;
}

const emptyForm: TeamFormState = {
  name: '',
  department: '',
  description: '',
  manager_id: '',
  color: COLORS[0],
};

export function TeamsPage() {
  const navigate = useNavigate();
  const { roles } = useAuth();

  const canManage = roles.some((r) =>
    ['Admin', 'SuperAdmin', 'HrAdmin', 'admin', 'superadmin', 'hradmin'].includes(r)
  );

  const { data: teams = [], isLoading, isError, refetch } = useGetTeamsQuery();
  const { data: users = [] } = useGetUsersQuery();

  const [createTeam, { isLoading: creating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: updating }] = useUpdateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();

  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState<TeamFormState>(emptyForm);

  const filteredTeams = teams.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q);
  });

  const totalMembers = teams.reduce((s, t) => s + t.member_count, 0);
  const totalProjects = teams.reduce((s, t) => s + t.project_count, 0);
  const uniqueDepts = new Set(teams.map((t) => t.department)).size;

  const userOptions = users.map((u) => ({
    label: u.name || u.username || u.email,
    value: String(u.id),
  }));

  const openCreate = () => {
    setForm({ ...emptyForm, color: COLORS[teams.length % COLORS.length] });
    setShowCreateModal(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setForm({
      name: team.name,
      department: team.department,
      description: team.description || '',
      manager_id: team.manager_id ? String(team.manager_id) : '',
      color: team.color || COLORS[0],
    });
    setShowEditModal(true);
  };

  const handleCreate = async () => {
    if (!form.name || !form.department) return;
    const payload: CreateTeamPayload = {
      name: form.name,
      department: form.department,
      description: form.description || undefined,
      manager_id: form.manager_id ? Number(form.manager_id) : undefined,
      color: form.color,
      status: 'Active',
    };
    await createTeam(payload).unwrap().catch(() => null);
    setShowCreateModal(false);
    setForm(emptyForm);
  };

  const handleEdit = async () => {
    if (!editingTeam || !form.name || !form.department) return;
    await updateTeam({
      id: editingTeam.id,
      name: form.name,
      department: form.department,
      description: form.description || undefined,
      manager_id: form.manager_id ? Number(form.manager_id) : undefined,
      color: form.color,
    }).unwrap().catch(() => null);
    setShowEditModal(false);
    setEditingTeam(null);
  };

  const handleDelete = async (team: Team) => {
    if (!window.confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    await deleteTeam(team.id).unwrap().catch(() => null);
  };

  const TeamFormFields = () => (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
          Team Name *
        </label>
        <Input
          placeholder="e.g. Engineering"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
          Department *
        </label>
        <Select
          options={DEPARTMENTS}
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.value as string })}
          placeholder="Select department"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
          Description
        </label>
        <textarea
          placeholder="Optional team description..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-white text-sm text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
          Manager
        </label>
        <Select
          options={userOptions}
          value={form.manager_id}
          onChange={(e) => setForm({ ...form, manager_id: e.value as string })}
          placeholder="Select manager (optional)"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
          Team Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${form.color === c ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="flex flex-col gap-10 pb-20">
        <div className="h-16 bg-surface-subtle/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-subtle/60 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-surface-subtle/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <span className="text-muted font-bold">Failed to load teams.</span>
        <Button label="Retry" onClick={() => refetch()} variant="ghost" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Teams"
        description="Manage teams across your organization."
        breadcrumbs={[{ label: 'Home', url: '/' }, { label: 'Teams' }]}
        primaryAction={canManage ? {
          label: 'Create Team',
          onClick: openCreate,
          icon: 'pi pi-plus',
        } : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Teams', value: teams.length },
          { label: 'Total Members', value: totalMembers },
          { label: 'Active Projects', value: totalProjects },
          { label: 'Departments', value: uniqueDepts },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-xl border border-border-subtle shadow-soft flex flex-col gap-1"
          >
            <span className="text-2xl font-black text-foreground">{stat.value}</span>
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-[0.2em]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Directory Header + Search */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-soft p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm font-black text-foreground uppercase tracking-wider">
          Directory View
        </span>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs font-medium text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
            />
          </div>
          <span className="text-xs text-muted font-bold whitespace-nowrap">
            {filteredTeams.length} Active Teams
          </span>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-muted">
          <Users size={40} className="opacity-30" />
          <span className="font-bold text-sm">
            {searchQuery ? `No teams matching "${searchQuery}"` : 'No teams yet'}
          </span>
          {!searchQuery && canManage && (
            <Button label="Create First Team" onClick={openCreate} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-border-subtle shadow-soft p-8 flex flex-col gap-6 group hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                style={{ backgroundColor: team.color }}
              />
              <div className="flex items-start justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${team.color}15` }}
                  >
                    <Users size={24} style={{ color: team.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">
                      {team.name}
                    </h3>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                      {team.department}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openEdit(team); }}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="Edit team"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(team); }}
                      className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete team"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Crown size={14} />
                <span className="text-xs font-bold">{team.manager_name || 'No manager'}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-muted" />
                    <span className="text-xs font-bold text-muted">{team.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Folder size={13} className="text-muted" />
                    <span className="text-xs font-bold text-muted">{team.project_count} projects</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  View →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog
        visible={showCreateModal}
        onHide={() => { setShowCreateModal(false); setForm(emptyForm); }}
        header="Create New Team"
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
          <TeamFormFields />
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => { setShowCreateModal(false); setForm(emptyForm); }}
              className="rounded-md!"
            />
            <Button
              label={creating ? 'Creating...' : 'Create Team'}
              onClick={handleCreate}
              disabled={creating || !form.name || !form.department}
              icon="pi pi-check"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog
        visible={showEditModal}
        onHide={() => { setShowEditModal(false); setEditingTeam(null); }}
        header="Edit Team"
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
          <TeamFormFields />
          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => { setShowEditModal(false); setEditingTeam(null); }}
              className="rounded-md!"
            />
            <Button
              label={updating ? 'Saving...' : 'Save Changes'}
              onClick={handleEdit}
              disabled={updating || !form.name || !form.department}
              icon="pi pi-check"
              className="rounded-md! px-8!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
