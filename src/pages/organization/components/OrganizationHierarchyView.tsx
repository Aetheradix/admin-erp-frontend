import { useState, useMemo } from 'react';
import {
  GitBranch,
  Users,
  Building2,
  Layers,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Edit2,
  RefreshCw,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Select, Tag, message, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import {
  useGetOrganizationHierarchyQuery,
  useUpdateReportingManagerMutation,
  useUpdateDepartmentHierarchyMutation,
  type HierarchyNodeUser,
  type DepartmentHierarchyItem,
} from '@/store/api/organizationApiSlice';
import { usePermission } from '@/hooks/usePermission';

export function OrganizationHierarchyView() {
  const { data: hierarchyResponse, isLoading, refetch } = useGetOrganizationHierarchyQuery();
  const [updateReportingManager, { isLoading: isUpdatingManager }] =
    useUpdateReportingManagerMutation();
  const [updateDepartmentHierarchy, { isLoading: isUpdatingDept }] =
    useUpdateDepartmentHierarchyMutation();

  const { can, isSuperadmin } = usePermission();
  const canManageHierarchy = isSuperadmin || can('organization:manage');

  const [viewMode, setViewMode] = useState<'tree' | 'departments'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  // Modals
  const [editManagerModal, setEditManagerModal] = useState<{
    open: boolean;
    user: HierarchyNodeUser | null;
    selectedManagerId: number | null;
  }>({
    open: false,
    user: null,
    selectedManagerId: null,
  });

  const [editDeptModal, setEditDeptModal] = useState<{
    open: boolean;
    department: DepartmentHierarchyItem | null;
    selectedHeadId: number | null;
    parentDeptId: number | null;
  }>({
    open: false,
    department: null,
    selectedHeadId: null,
    parentDeptId: null,
  });

  const hierarchyData = hierarchyResponse?.data;
  const rootUsers = hierarchyData?.tree || [];
  const flatUsers = hierarchyData?.flatUsers || [];
  const departments = hierarchyData?.departments || [];
  const stats = hierarchyData?.stats || {
    totalEmployees: 0,
    totalManagers: 0,
    totalDepartments: 0,
    hierarchyDepth: 0,
  };

  const toggleNode = (id: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? true : !prev[id],
    }));
  };

  const handleOpenEditManager = (user: HierarchyNodeUser) => {
    setEditManagerModal({
      open: true,
      user,
      selectedManagerId: user.reporting_manager_id || null,
    });
  };

  const handleSaveManager = async () => {
    if (!editManagerModal.user) return;
    try {
      await updateReportingManager({
        userId: editManagerModal.user.id,
        reportingManagerId: editManagerModal.selectedManagerId,
      }).unwrap();
      message.success(`Reporting relationship updated for ${editManagerModal.user.username}`);
      setEditManagerModal({ open: false, user: null, selectedManagerId: null });
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update reporting manager.');
    }
  };

  const handleOpenEditDept = (dept: DepartmentHierarchyItem) => {
    setEditDeptModal({
      open: true,
      department: dept,
      selectedHeadId: dept.head_user_id || null,
      parentDeptId: dept.parent_department_id || null,
    });
  };

  const handleSaveDept = async () => {
    if (!editDeptModal.department) return;
    try {
      await updateDepartmentHierarchy({
        departmentId: editDeptModal.department.id,
        headUserId: editDeptModal.selectedHeadId,
        parentDepartmentId: editDeptModal.parentDeptId,
      }).unwrap();
      message.success(`Department updated: ${editDeptModal.department.department_name}`);
      setEditDeptModal({ open: false, department: null, selectedHeadId: null, parentDeptId: null });
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update department.');
    }
  };

  // Filter root users if search query is active
  const filteredRootUsers = useMemo(() => {
    if (!searchQuery.trim()) return rootUsers;
    const q = searchQuery.toLowerCase();
    return rootUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
    );
  }, [rootUsers, searchQuery]);

  // Department Table Columns
  const deptColumns: ColumnsType<DepartmentHierarchyItem> = [
    {
      title: 'Department',
      key: 'name',
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Building2 size={16} />
          </div>
          <div>
            <span className="font-bold text-foreground block">{r.department_name}</span>
            {r.parent_department_name && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <GitBranch size={10} /> Parent: {r.parent_department_name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Department Head',
      key: 'head',
      render: (_, r) => (
        <div className="flex items-center gap-2.5">
          {r.head_name ? (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                {r.head_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">{r.head_name}</span>
                <span className="text-[10px] text-muted-foreground">{r.head_email}</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">No Head Designated</span>
          )}
        </div>
      ),
    },
    {
      title: 'Team Strength',
      dataIndex: 'member_count',
      key: 'members',
      render: (count: number) => (
        <Tag color="blue" className="font-bold px-2 py-0.5 rounded-full">
          {count} Members
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => (
        canManageHierarchy && (
          <Button
            variant="outline"
            size="small"
            onClick={() => handleOpenEditDept(r)}
            className="text-xs font-bold gap-1">
            <Edit2 size={12} /> Configure
          </Button>
        )
      ),
    },
  ];

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: HierarchyNodeUser, level: number = 0) => {
    const isExpanded = expandedNodes[node.id] !== false; // Default expanded
    const hasReports = node.directReports && node.directReports.length > 0;

    return (
      <div key={node.id} className="relative flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`p-4 rounded-2xl bg-card border transition-all shadow-sm w-72 flex flex-col gap-2.5 ${
            level === 0
              ? 'border-primary/40 ring-2 ring-primary/10 shadow-md'
              : 'border-border/60 hover:border-primary/40'
          }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {node.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-black text-foreground text-xs block truncate" title={node.username}>
                  {node.username}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate" title={node.email}>
                  {node.email}
                </span>
              </div>
            </div>

            {canManageHierarchy && (
              <button
                type="button"
                onClick={() => handleOpenEditManager(node)}
                title="Change Reporting Manager"
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Edit2 size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/40">
            <Tag color={level === 0 ? 'volcano' : 'blue'} className="text-[10px] font-bold m-0">
              {node.role || 'Staff'}
            </Tag>
            {node.department && (
              <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted/60">
                {node.department}
              </span>
            )}
          </div>

          {/* Subordinates Toggle Bar */}
          {hasReports && (
            <button
              type="button"
              onClick={() => toggleNode(node.id)}
              className="mt-1 w-full py-1.5 px-2 rounded-xl bg-surface-subtle hover:bg-muted/80 text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between transition-colors">
              <span className="flex items-center gap-1 text-primary">
                <Users size={12} /> {node.directReports.length} Direct {node.directReports.length === 1 ? 'Report' : 'Reports'}
              </span>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>

        {/* Children Branches */}
        {hasReports && isExpanded && (
          <div className="flex flex-col items-center">
            {/* Vertical connector line */}
            <div className="w-0.5 h-6 bg-border/80" />

            {/* Horizontal branch bar */}
            <div className="flex items-start justify-center gap-6 pt-1 relative">
              {node.directReports.map((child) => renderTreeNode(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Workforce
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">{stats.totalEmployees}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Managers
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">{stats.totalManagers}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Departments
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">{stats.totalDepartments}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Hierarchy Depth
            </p>
            <h3 className="text-2xl font-black text-foreground mt-1">Level {stats.hierarchyDepth}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'tree'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground'
            }`}>
            <GitBranch size={14} /> Organization Tree
          </button>
          <button
            onClick={() => setViewMode('departments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              viewMode === 'departments'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground'
            }`}>
            <Building2 size={14} /> Department Heads
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {viewMode === 'tree' && (
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, role, team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-border/60 bg-muted/20 focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <Button variant="outline" size="small" onClick={() => refetch()} className="gap-1.5 text-xs">
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE HIERARCHY TREE */}
      {viewMode === 'tree' && (
        <div className="p-8 rounded-2xl bg-card border border-border/60 shadow-sm overflow-x-auto min-h-[450px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-xs text-muted-foreground font-semibold">
              Loading organization hierarchy...
            </div>
          ) : filteredRootUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-bold text-foreground">No personnel records found</p>
              <p className="text-xs text-muted-foreground">Adjust search filter or assign managers.</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-start justify-center gap-10 min-w-max py-4">
              {filteredRootUsers.map((root) => renderTreeNode(root, 0))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DEPARTMENT HEADS TABLE */}
      {viewMode === 'departments' && (
        <div className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden">
          <Table
            scroll={{ x: 'max-content' }}
            columns={deptColumns}
            dataSource={departments}
            rowKey="id"
            loading={isLoading}
            pagination={false}
          />
        </div>
      )}

      {/* MODAL: ASSIGN / CHANGE REPORTING MANAGER */}
      <Dialog
        visible={editManagerModal.open}
        onHide={() => setEditManagerModal({ open: false, user: null, selectedManagerId: null })}
        header="Change Reporting Manager"
        className="max-w-md">
        {editManagerModal.user && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                {editManagerModal.user.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-foreground text-sm block">
                  {editManagerModal.user.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {editManagerModal.user.designation || editManagerModal.user.role} • {editManagerModal.user.department}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Select Direct Reporting Manager
              </label>
              <Select
                showSearch
                placeholder="Select manager (or leave empty for root/executive)..."
                allowClear
                className="w-full"
                value={editManagerModal.selectedManagerId || undefined}
                onChange={(val) =>
                  setEditManagerModal((prev) => ({
                    ...prev,
                    selectedManagerId: val ? Number(val) : null,
                  }))
                }
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={flatUsers
                  .filter((u) => u.id !== editManagerModal.user?.id) // Cannot report to self
                  .map((u) => ({
                    value: u.id,
                    label: `${u.username} (${u.email}) -- ${u.role}`,
                  }))}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                The selected manager will review this employee's leave and WFH requests when hierarchy-based approvals are active.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Button
                variant="ghost"
                onClick={() =>
                  setEditManagerModal({ open: false, user: null, selectedManagerId: null })
                }>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveManager}
                loading={isUpdatingManager}
                className="px-6">
                Update Manager
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* MODAL: ASSIGN DEPARTMENT HEAD */}
      <Dialog
        visible={editDeptModal.open}
        onHide={() =>
          setEditDeptModal({ open: false, department: null, selectedHeadId: null, parentDeptId: null })
        }
        header="Configure Department Leadership"
        className="max-w-md">
        {editDeptModal.department && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Department Name
              </label>
              <p className="text-sm font-black text-foreground">
                {editDeptModal.department.department_name}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Designate Department Head
              </label>
              <Select
                showSearch
                placeholder="Select an employee as Department Head..."
                allowClear
                className="w-full"
                value={editDeptModal.selectedHeadId || undefined}
                onChange={(val) =>
                  setEditDeptModal((prev) => ({
                    ...prev,
                    selectedHeadId: val ? Number(val) : null,
                  }))
                }
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={flatUsers.map((u) => ({
                  value: u.id,
                  label: `${u.username} (${u.email}) -- ${u.role}`,
                }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Parent Department (Optional)
              </label>
              <Select
                placeholder="Select parent department..."
                allowClear
                className="w-full"
                value={editDeptModal.parentDeptId || undefined}
                onChange={(val) =>
                  setEditDeptModal((prev) => ({
                    ...prev,
                    parentDeptId: val ? Number(val) : null,
                  }))
                }
                options={departments
                  .filter((d) => d.id !== editDeptModal.department?.id)
                  .map((d) => ({
                    value: d.id,
                    label: d.department_name,
                  }))}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Button
                variant="ghost"
                onClick={() =>
                  setEditDeptModal({
                    open: false,
                    department: null,
                    selectedHeadId: null,
                    parentDeptId: null,
                  })
                }>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveDept}
                loading={isUpdatingDept}
                className="px-6">
                Save Department
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

