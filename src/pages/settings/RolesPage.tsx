import { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Edit2,
  Check,
  History,
  Users,
  KeyRound,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Input } from '@/components/ui/primitives/Input';
import { Button } from '@/components/ui/primitives/Button';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { Table, message, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRbacAuditLogsQuery,
  type RoleItem,
  type PermissionItem,
  type RbacAuditLogItem,
} from '@/store/api/roleApiSlice';
import { usePermission } from '@/hooks/usePermission';

export function RolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix' | 'audit'>('roles');
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<number | null>(null);

  // RTK Query Hooks
  const { data: rolesData, isLoading: rolesLoading, refetch: refetchRoles } = useGetRolesQuery();
  const { data: permsData } = useGetPermissionsQuery();
  const {
    data: auditData,
    isLoading: auditLoading,
    refetch: refetchAudit,
  } = useGetRbacAuditLogsQuery({ limit: 100 });

  const [createRoleApi, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRoleApi, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRoleApi, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const { can, isSuperadmin } = usePermission();

  // Modals state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [targetRole, setTargetRole] = useState<RoleItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as number[],
  });

  const roles = useMemo(() => rolesData?.data || [], [rolesData]);
  const permissions = useMemo(() => permsData?.data?.permissions || [], [permsData]);
  const modules = useMemo(() => permsData?.data?.modules || {}, [permsData]);
  const auditLogs = useMemo(() => auditData?.data || [], [auditData]);

  // Set default selected role for matrix
  const currentMatrixRole = useMemo(() => {
    if (roles.length === 0) return null;
    if (selectedRoleForMatrix) {
      return roles.find((r) => r.id === selectedRoleForMatrix) || roles[0];
    }
    return roles[0];
  }, [roles, selectedRoleForMatrix]);

  // Handle open Create Modal
  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      permissionIds: [],
    });
    setCreateModalVisible(true);
  };

  // Handle open Edit Modal
  const openEditModal = (role: RoleItem) => {
    setTargetRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map((p) => p.id),
    });
    setEditModalVisible(true);
  };

  // Submit Create Role
  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      message.error('Please enter a role name');
      return;
    }

    try {
      await createRoleApi({
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionIds: formData.permissionIds,
      }).unwrap();

      message.success(`Custom role "${formData.name}" created successfully`);
      setCreateModalVisible(false);
    } catch (err: any) {
      message.error(err?.data?.message || err?.message || 'Failed to create role');
    }
  };

  // Submit Edit Role
  const handleEditSubmit = async () => {
    if (!targetRole) return;

    try {
      await updateRoleApi({
        id: targetRole.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionIds: formData.permissionIds,
      }).unwrap();

      message.success(`Role "${formData.name}" updated successfully`);
      setEditModalVisible(false);
      setTargetRole(null);
    } catch (err: any) {
      message.error(err?.data?.message || err?.message || 'Failed to update role');
    }
  };

  // Submit Delete Role
  const handleDeleteSubmit = async () => {
    if (!targetRole) return;

    try {
      await deleteRoleApi(targetRole.id).unwrap();
      message.success(`Role "${targetRole.name}" deleted successfully`);
      setDeleteModalVisible(false);
      setTargetRole(null);
    } catch (err: any) {
      message.error(err?.data?.message || err?.message || 'Failed to delete role');
    }
  };

  // Matrix toggle permission for currentMatrixRole
  const handleToggleMatrixPermission = async (permId: number) => {
    if (!currentMatrixRole) return;
    if (currentMatrixRole.is_system && !isSuperadmin) {
      message.warning('System role permissions can only be altered by Superadmins.');
      return;
    }

    const currentPermIds = currentMatrixRole.permissions.map((p) => p.id);
    const hasPerm = currentPermIds.includes(permId);
    const newPermIds = hasPerm
      ? currentPermIds.filter((id) => id !== permId)
      : [...currentPermIds, permId];

    try {
      await updateRoleApi({
        id: currentMatrixRole.id,
        name: currentMatrixRole.name,
        description: currentMatrixRole.description,
        permissionIds: newPermIds,
      }).unwrap();
      message.success('Permissions updated');
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update permission');
    }
  };

  // Toggle all permissions in a module for currentMatrixRole
  const handleToggleModulePermissions = async (modulePerms: PermissionItem[]) => {
    if (!currentMatrixRole) return;
    if (currentMatrixRole.is_system && !isSuperadmin) {
      message.warning('System role permissions can only be altered by Superadmins.');
      return;
    }

    const currentPermIds = currentMatrixRole.permissions.map((p) => p.id);
    const modulePermIds = modulePerms.map((p) => p.id);
    const allSelected = modulePermIds.every((id) => currentPermIds.includes(id));

    let newPermIds: number[];
    if (allSelected) {
      // Remove all module perms
      newPermIds = currentPermIds.filter((id) => !modulePermIds.includes(id));
    } else {
      // Add all missing module perms
      newPermIds = Array.from(new Set([...currentPermIds, ...modulePermIds]));
    }

    try {
      await updateRoleApi({
        id: currentMatrixRole.id,
        name: currentMatrixRole.name,
        description: currentMatrixRole.description,
        permissionIds: newPermIds,
      }).unwrap();
      message.success(`Updated ${modulePerms[0]?.module} permissions`);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update module permissions');
    }
  };

  // Role list columns
  const roleColumns: ColumnsType<RoleItem> = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
              record.is_system
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}>
            {record.is_system ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">{name}</span>
              {record.is_system ? (
                <Tag color="gold" className="text-[10px] font-bold uppercase rounded-md border-0">
                  System Role
                </Tag>
              ) : (
                <Tag color="blue" className="text-[10px] font-bold uppercase rounded-md border-0">
                  Custom Role
                </Tag>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {record.description || 'No description provided'}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Active Members',
      dataIndex: 'user_count',
      key: 'user_count',
      align: 'center',
      render: (count: number) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          {count} {count === 1 ? 'user' : 'users'}
        </span>
      ),
    },
    {
      title: 'Permissions Granted',
      key: 'permissions_count',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {record.permissions.length} / {permissions.length}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{
                width: `${Math.min(100, Math.round((record.permissions.length / (permissions.length || 1)) * 100))}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              setSelectedRoleForMatrix(record.id);
              setActiveTab('matrix');
            }}
            className="text-xs gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Matrix
          </Button>

          {can('role:edit') && (
            <Button
              variant="outline"
              size="small"
              onClick={() => openEditModal(record)}
              className="text-xs gap-1.5">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
          )}

          {can('role:delete') && (
            <Tooltip
              title={
                record.is_system
                  ? 'System roles cannot be deleted'
                  : record.user_count > 0
                    ? `Assigned to ${record.user_count} user(s). Reassign before deleting.`
                    : 'Delete custom role'
              }>
              <span>
                <Button
                  variant="outline"
                  size="small"
                  disabled={record.is_system || record.user_count > 0}
                  onClick={() => {
                    setTargetRole(record);
                    setDeleteModalVisible(true);
                  }}
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 disabled:opacity-40">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </span>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  // Audit logs columns
  const auditColumns: ColumnsType<RbacAuditLogItem> = [
    {
      title: 'Action',
      dataIndex: 'action_type',
      key: 'action_type',
      render: (action: string) => {
        let color = 'default';
        if (action.includes('CREATED') || action.includes('ASSIGNED')) color = 'green';
        if (action.includes('UPDATED')) color = 'blue';
        if (action.includes('DELETED') || action.includes('REVOKED')) color = 'red';
        return (
          <Tag color={color} className="font-mono text-xs font-bold uppercase rounded-md border-0">
            {action}
          </Tag>
        );
      },
    },
    {
      title: 'Actor (Initiator)',
      dataIndex: 'actor_name',
      key: 'actor_name',
      render: (name: string, record) => (
        <div>
          <span className="font-semibold text-foreground text-xs block">
            {name || 'System / Migration'}
          </span>
          <span className="text-[11px] text-muted-foreground">{record.actor_email}</span>
        </div>
      ),
    },
    {
      title: 'Target Entity',
      key: 'target',
      render: (_, record) => (
        <div className="text-xs">
          {record.target_role_name && (
            <span className="font-medium text-primary">Role: {record.target_role_name}</span>
          )}
          {record.target_user_name && (
            <span className="font-medium text-foreground block">
              User: {record.target_user_name} ({record.target_user_email})
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'IP & Source',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip: string) => (
        <span className="text-xs font-mono text-muted-foreground">{ip || 'Internal / Local'}</span>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <span className="text-xs text-muted-foreground">{new Date(date).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Role & Permission Management
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Configure granular access controls, scope-based permissions, and inspect security
              audit trails
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="small"
            onClick={() => {
              refetchRoles();
              if (activeTab === 'audit') refetchAudit();
            }}
            className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          {can('role:create') && (
            <Button variant="primary" size="small" onClick={openCreateModal} className="gap-2">
              <Plus className="w-4 h-4" /> New Custom Role
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Roles
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">{roles.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              System Roles
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">
              {roles.filter((r) => r.is_system).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Custom Roles
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">
              {roles.filter((r) => !r.is_system).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Granular Permissions
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">{permissions.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/60 gap-8">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'roles'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <Shield className="w-4 h-4" /> Role Directory ({roles.length})
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'matrix'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <KeyRound className="w-4 h-4" /> Permission Matrix (Modules × Actions)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}>
          <History className="w-4 h-4" /> RBAC Security Audit Logs
        </button>
      </div>

      {/* TAB 1: ROLES DIRECTORY */}
      {activeTab === 'roles' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <Table
            columns={roleColumns}
            dataSource={roles}
            rowKey="id"
            loading={rolesLoading}
            pagination={false}
            className="w-full"
          />
        </motion.div>
      )}

      {/* TAB 2: PERMISSION MATRIX */}
      {activeTab === 'matrix' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4">
          {/* Role Selector Toolbar */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">
                Select Role to Inspect/Edit:
              </span>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => {
                  const isSelected = currentMatrixRole?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoleForMatrix(r.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/50 text-foreground border-border/60 hover:bg-muted'
                      }`}>
                      {r.is_system && <Lock className="w-3 h-3 text-amber-500" />}
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {currentMatrixRole && (
              <div className="flex items-center gap-2">
                {currentMatrixRole.is_system ? (
                  <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Immutable System Role
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Custom Role (Click checkbox to toggle)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Matrix Table */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/60">
              {Object.entries(modules).map(([moduleName, modulePerms]) => {
                const currentPermIds = currentMatrixRole?.permissions.map((p) => p.id) || [];
                const allSelected = modulePerms.every((p) => currentPermIds.includes(p.id));

                return (
                  <div key={moduleName} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Module Info */}
                      <div className="w-48 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground capitalize text-sm">
                            {moduleName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-semibold">
                            {modulePerms.length}
                          </span>
                        </div>
                        {can('role:edit') && (!currentMatrixRole?.is_system || isSuperadmin) && (
                          <button
                            type="button"
                            onClick={() => handleToggleModulePermissions(modulePerms)}
                            className="text-[11px] text-primary hover:underline font-semibold mt-1 block">
                            {allSelected ? 'Deselect all' : 'Select all'}
                          </button>
                        )}
                      </div>

                      {/* Action Checkboxes */}
                      <div className="flex-1 flex flex-wrap gap-3">
                        {modulePerms.map((perm) => {
                          const isGranted = currentPermIds.includes(perm.id);
                          const isEditable =
                            can('role:edit') && (!currentMatrixRole?.is_system || isSuperadmin);

                          return (
                            <Tooltip key={perm.id} title={perm.description || perm.name}>
                              <button
                                type="button"
                                disabled={!isEditable}
                                onClick={() => handleToggleMatrixPermission(perm.id)}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                                  isGranted
                                    ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-xs'
                                    : 'bg-muted/30 border-border/40 text-muted-foreground hover:border-border'
                                } ${!isEditable ? 'cursor-default opacity-85' : 'cursor-pointer hover:scale-[1.02]'}`}>
                                <span
                                  className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                                    isGranted
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'border-muted-foreground/30 bg-background'
                                  }`}>
                                  {isGranted && <Check className="w-3 h-3 stroke-[3]" />}
                                </span>
                                <span>{perm.action}</span>
                              </button>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <Table
            columns={auditColumns}
            dataSource={auditLogs}
            rowKey="id"
            loading={auditLoading}
            pagination={{ pageSize: 15 }}
            className="w-full"
          />
        </motion.div>
      )}

      {/* CREATE ROLE MODAL */}
      <Dialog
        visible={createModalVisible}
        onHide={() => setCreateModalVisible(false)}
        header="Create New Custom Role"
        className="max-w-2xl">
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Role Name *</label>
            <Input
              placeholder="e.g. Marketing Lead, Inventory Auditor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Description</label>
            <Textarea
              placeholder="Explain the scope and responsibilities of this role..."
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foreground">
                Assign Permissions ({formData.permissionIds.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, permissionIds: permissions.map((p) => p.id) })
                  }
                  className="text-xs text-primary font-semibold hover:underline">
                  Select All
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, permissionIds: [] })}
                  className="text-xs text-muted-foreground font-semibold hover:underline">
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
              {Object.entries(modules).map(([modName, modPerms]) => (
                <div key={modName} className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground capitalize block">
                    {modName}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {modPerms.map((p) => {
                      const selected = formData.permissionIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const newIds = selected
                              ? formData.permissionIds.filter((id) => id !== p.id)
                              : [...formData.permissionIds, p.id];
                            setFormData({ ...formData, permissionIds: newIds });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            selected
                              ? 'bg-primary text-primary-foreground border-primary font-bold'
                              : 'bg-background text-muted-foreground border-border/60 hover:border-border'
                          }`}>
                          {selected && <Check className="w-3 h-3 stroke-[3]" />}
                          {p.action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Button variant="outline" onClick={() => setCreateModalVisible(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit} disabled={isCreating}>
              {isCreating ? 'Creating Role...' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* EDIT ROLE MODAL */}
      <Dialog
        visible={editModalVisible}
        onHide={() => {
          setEditModalVisible(false);
          setTargetRole(null);
        }}
        header={`Edit Role: ${targetRole?.name}`}
        className="max-w-2xl">
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Role Name {targetRole?.is_system && '(System roles cannot be renamed)'}
            </label>
            <Input
              disabled={targetRole?.is_system}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Description</label>
            <Textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foreground">
                Permissions ({formData.permissionIds.length} granted)
              </label>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
              {Object.entries(modules).map(([modName, modPerms]) => (
                <div key={modName} className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground capitalize block">
                    {modName}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {modPerms.map((p) => {
                      const selected = formData.permissionIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const newIds = selected
                              ? formData.permissionIds.filter((id) => id !== p.id)
                              : [...formData.permissionIds, p.id];
                            setFormData({ ...formData, permissionIds: newIds });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            selected
                              ? 'bg-primary text-primary-foreground border-primary font-bold'
                              : 'bg-background text-muted-foreground border-border/60 hover:border-border'
                          }`}>
                          {selected && <Check className="w-3 h-3 stroke-[3]" />}
                          {p.action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalVisible(false);
                setTargetRole(null);
              }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DELETE ROLE CONFIRMATION MODAL */}
      <Dialog
        visible={deleteModalVisible}
        onHide={() => {
          setDeleteModalVisible(false);
          setTargetRole(null);
        }}
        header="Confirm Role Deletion"
        className="max-w-md">
        <div className="space-y-4 pt-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground">
              Delete custom role "{targetRole?.name}"?
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              This action cannot be undone. All role permission associations will be permanently
              removed.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalVisible(false);
                setTargetRole(null);
              }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteSubmit} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Role'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default RolesPage;
