import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import {
  Users,
  Crown,
  ArrowLeft,
  Plus,
  Trash2,
  UserCog,
  Search,
  Folder,
} from 'lucide-react';
import { useGetTeamByIdQuery, useGetTeamMembersQuery, useAddTeamMemberMutation, useRemoveTeamMemberMutation, useChangeTeamManagerMutation } from '@/store/api/teamsApiSlice';
import { useGetUsersQuery } from '@/store/api/userSlice';
import { useAuth } from '@/hooks/useAuth';
import type { StaffMember } from '@/types/models';

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);
  const navigate = useNavigate();
  const { roles } = useAuth();

  const canManage = roles.some((r) =>
    ['Admin', 'SuperAdmin', 'HrAdmin', 'admin', 'superadmin', 'hradmin'].includes(r)
  );

  const { data: team, isLoading: teamLoading, isError: teamError } = useGetTeamByIdQuery(teamId, {
    skip: !teamId,
  });
  const { data: members = [], isLoading: membersLoading } = useGetTeamMembersQuery(teamId, {
    skip: !teamId,
  });
  const { data: allUsers = [] } = useGetUsersQuery();

  const [addTeamMember] = useAddTeamMemberMutation();
  const [removeTeamMember] = useRemoveTeamMemberMutation();
  const [changeTeamManager] = useChangeTeamManagerMutation();

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showChangeManager, setShowChangeManager] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [addingMembers, setAddingMembers] = useState(false);
  const [changingManager, setChangingManager] = useState(false);

  const memberIds = new Set(members.map((m) => m.id));

  const availableUsers = allUsers.filter((u) => {
    const uid = Number(u.id);
    if (memberIds.has(uid)) return false;
    if (!memberSearch) return true;
    const q = memberSearch.toLowerCase();
    const name = (u.name || u.username || u.email || '').toLowerCase();
    return name.includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const toggleUserSelect = (uid: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    );
  };

  const handleAddMembers = async () => {
    if (!selectedUserIds.length) return;
    setAddingMembers(true);
    try {
      await Promise.all(selectedUserIds.map((userId) => addTeamMember({ teamId, userId }).unwrap()));
      setSelectedUserIds([]);
      setShowAddMembers(false);
    } catch {
      // silently ignore — RTK Query will mark error
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = async (userId: number, name: string) => {
    if (!window.confirm(`Remove ${name} from this team?`)) return;
    await removeTeamMember({ teamId, userId }).unwrap().catch(() => null);
  };

  const handleChangeManager = async () => {
    if (!selectedManagerId) return;
    setChangingManager(true);
    try {
      await changeTeamManager({ teamId, managerId: selectedManagerId }).unwrap();
      setShowChangeManager(false);
      setSelectedManagerId(null);
    } catch {
      // silently ignore
    } finally {
      setChangingManager(false);
    }
  };

  const getInitials = (member: { name?: string; username?: string; email: string }) => {
    const src = member.name || member.username || member.email;
    return src.charAt(0).toUpperCase();
  };

  const getDisplayName = (member: { name?: string; username?: string; email: string }) =>
    member.name || member.username || member.email;

  const getUserDisplayName = (u: StaffMember) => u.name || u.username || u.email;

  if (teamLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted font-bold text-sm">
        <span className="animate-pulse">Loading team details...</span>
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <span className="text-muted font-bold">Failed to load team details.</span>
        <Button label="Go Back" onClick={() => navigate('/teams')} variant="ghost" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/teams')}
          className="flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Teams
        </button>
      </div>

      {/* Team Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-border-subtle shadow-soft relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl" style={{ backgroundColor: team.color }} />
        <div className="p-8 pt-10 flex flex-col md:flex-row md:items-start gap-6">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <Users size={30} style={{ color: team.color }} />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">{team.name}</h1>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit"
                style={{ backgroundColor: `${team.color}15`, color: team.color }}
              >
                {team.department}
              </span>
            </div>
            {team.description && (
              <p className="text-sm text-muted font-medium max-w-xl">{team.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-5 mt-2 text-sm text-muted">
              {team.manager_name && (
                <div className="flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-500" />
                  <span className="font-bold">{team.manager_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span className="font-bold">{team.member_count} members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Folder size={14} />
                <span className="font-bold">{team.project_count} projects</span>
              </div>
              {team.created_at && (
                <span className="text-xs">
                  Created {new Date(team.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {canManage && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                label="Change Manager"
                icon={<UserCog size={15} />}
                variant="ghost"
                onClick={() => {
                  setSelectedManagerId(null);
                  setShowChangeManager(true);
                }}
                className="rounded-xl! text-sm!"
              />
              <Button
                label="Add Members"
                icon={<Plus size={15} />}
                onClick={() => {
                  setMemberSearch('');
                  setSelectedUserIds([]);
                  setShowAddMembers(true);
                }}
                className="rounded-xl! text-sm!"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden"
      >
        <div className="px-8 py-5 border-b border-border-subtle flex items-center justify-between">
          <span className="text-sm font-black text-foreground uppercase tracking-wider">
            Team Members
          </span>
          <span className="text-xs text-muted font-bold">{members.length} total</span>
        </div>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
            <Users size={36} className="opacity-30" />
            <span className="text-sm font-bold">No members yet</span>
            {canManage && (
              <button
                type="button"
                onClick={() => setShowAddMembers(true)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Add the first member →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-subtle/40">
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted">
                    Joined
                  </th>
                  {canManage && (
                    <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {members.map((member, i) => {
                  const displayName = getDisplayName(member);
                  const initials = getInitials(member);
                  const isManager = member.id === team.manager_id;
                  return (
                    <tr
                      key={member.id}
                      className={`border-b border-border-subtle/50 hover:bg-surface-subtle/30 transition-colors ${i % 2 === 0 ? '' : 'bg-surface-subtle/10'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.image_url || member.image ? (
                            <img
                              src={member.image_url || member.image}
                              alt={displayName}
                              className="w-9 h-9 rounded-full object-cover border border-border-subtle"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm"
                              style={{ backgroundColor: team.color }}
                            >
                              {initials}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-foreground">{displayName}</span>
                              {isManager && (
                                <span title="Team Manager">
                                  <Crown size={12} className="text-amber-500" />
                                </span>
                              )}
                            </div>
                            {member.username && member.name && (
                              <span className="text-xs text-muted">@{member.username}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted font-medium">{member.email}</td>
                      <td className="px-6 py-4 text-sm text-muted font-medium">
                        {member.designation || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted font-medium">
                        {member.department || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted font-medium">
                        {member.assigned_at
                          ? new Date(member.assigned_at).toLocaleDateString()
                          : '—'}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id, displayName)}
                            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove member"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Members Modal */}
      <Dialog
        visible={showAddMembers}
        onHide={() => setShowAddMembers(false)}
        header="Add Members"
        modal
        className="w-full max-w-lg mx-4"
        contentClassName="p-6"
        headerClassName="px-6 pt-6 pb-3 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <Input
              placeholder="Search employees..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="pl-9!"
            />
          </div>
          <div className="max-h-72 overflow-y-auto flex flex-col gap-1 pr-1">
            {availableUsers.length === 0 ? (
              <div className="text-center text-sm text-muted py-8 font-medium">
                {memberSearch ? 'No matching employees found' : 'All employees are already in this team'}
              </div>
            ) : (
              availableUsers.map((u) => {
                const uid = Number(u.id);
                const isChecked = selectedUserIds.includes(uid);
                const displayName = getUserDisplayName(u);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isChecked ? 'bg-primary/8 border border-primary/30' : 'hover:bg-surface-subtle border border-transparent'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleUserSelect(uid)}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: team.color }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
                      <span className="text-xs text-muted truncate">{u.email}</span>
                    </div>
                    {u.designation && (
                      <span className="ml-auto text-[10px] font-bold text-muted bg-surface-subtle px-2 py-0.5 rounded-md whitespace-nowrap">
                        {u.designation}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
            <span className="text-xs text-muted font-bold">
              {selectedUserIds.length} selected
            </span>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                label="Cancel"
                onClick={() => setShowAddMembers(false)}
                className="rounded-xl!"
              />
              <Button
                label={addingMembers ? 'Adding...' : 'Add Selected'}
                onClick={handleAddMembers}
                disabled={!selectedUserIds.length || addingMembers}
                className="rounded-xl!"
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Change Manager Modal */}
      <Dialog
        visible={showChangeManager}
        onHide={() => setShowChangeManager(false)}
        header="Change Team Manager"
        modal
        className="w-full max-w-md mx-4"
        contentClassName="p-6"
        headerClassName="px-6 pt-6 pb-3 text-xl font-black tracking-tight border-none"
        pt={{
          root: { className: 'rounded-2xl overflow-hidden border-none shadow-2xl bg-white' },
          mask: { className: 'backdrop-blur-md bg-black/40' },
        }}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted font-medium">
            Select a team member to become the new manager.
          </p>
          <div className="max-h-64 overflow-y-auto flex flex-col gap-1 pr-1">
            {members.length === 0 ? (
              <div className="text-center text-sm text-muted py-8">No members in this team yet.</div>
            ) : (
              members.map((member) => {
                const displayName = getDisplayName(member);
                const isSelected = selectedManagerId === member.id;
                const isCurrentManager = member.id === team.manager_id;
                return (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-primary/8 border border-primary/30' : 'hover:bg-surface-subtle border border-transparent'}`}
                  >
                    <input
                      type="radio"
                      name="manager"
                      checked={isSelected}
                      onChange={() => setSelectedManagerId(member.id)}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: team.color }}
                    >
                      {getInitials(member)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground">{displayName}</span>
                        {isCurrentManager && (
                          <span title="Current Manager">
                            <Crown size={12} className="text-amber-500" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">{member.designation || member.email}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
            <Button
              variant="ghost"
              label="Cancel"
              onClick={() => setShowChangeManager(false)}
              className="rounded-xl!"
            />
            <Button
              label={changingManager ? 'Saving...' : 'Confirm'}
              onClick={handleChangeManager}
              disabled={!selectedManagerId || changingManager}
              className="rounded-xl!"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
