import { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Network,
  GitBranch,
  FolderTree,
  Crown,
  Edit2,
  UserCheck,
} from 'lucide-react';
import { Select, message, Table, Tree } from 'antd';
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
import { ChangeManagerModal } from './ChangeManagerModal';
import { BulkHandoverModal } from './BulkHandoverModal';
import { ReplaceManagerModal } from './ReplaceManagerModal';
import { OffboardRollupModal } from './OffboardRollupModal';
import { MatrixManagerModal } from './MatrixManagerModal';
import { HierarchyReorgStudio } from './HierarchyReorgStudio';
import { HierarchyAuditTrailView } from './HierarchyAuditTrailView';
import { OrgCanvasMap } from './OrgCanvasMap';
import { OrgEmployeeDrawer } from './OrgEmployeeDrawer';
import { OrgAddEmployeeModal } from './OrgAddEmployeeModal';
import { OrgRemoveConfirmModal } from './OrgRemoveConfirmModal';
import { getDepartmentColor } from '../utils/orgLayoutEngine';

export function OrganizationHierarchyView() {
  const { data: hierarchyResponse, isLoading, refetch } = useGetOrganizationHierarchyQuery();
  const [updateReportingManager, { isLoading: isUpdatingManager }] =
    useUpdateReportingManagerMutation();
  const [updateDepartmentHierarchy, { isLoading: isUpdatingDept }] =
    useUpdateDepartmentHierarchyMutation();

  const { can, isSuperadmin } = usePermission();
  const canManageHierarchy = isSuperadmin || can('organization:manage');

  // View mode: 'map' (interactive horizontal map), 'list' (tree list directory), 'departments', 'reorg', 'audit'
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'departments' | 'reorg' | 'audit'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<HierarchyNodeUser | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  const [hiddenCount, setHiddenCount] = useState<number>(0);

  // ── Modals: Add & Remove Employee ──────────────────────────────────────────
  const [addEmployeeModal, setAddEmployeeModal] = useState<{
    open: boolean;
    preselectedManagerId: number | null;
  }>({ open: false, preselectedManagerId: null });

  const [removeEmployeeModal, setRemoveEmployeeModal] = useState<{
    open: boolean;
    user: HierarchyNodeUser | null;
  }>({ open: false, user: null });

  // ── Existing Enterprise Reorg Modals ────────────────────────────────────────
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

  const [changeManagerModal, setChangeManagerModal] = useState<{
    open: boolean;
    user: HierarchyNodeUser | null;
  }>({ open: false, user: null });

  const [bulkHandoverModal, setBulkHandoverModal] = useState(false);
  const [replaceManagerModal, setReplaceManagerModal] = useState(false);
  const [offboardRollupModal, setOffboardRollupModal] = useState(false);
  const [matrixModal, setMatrixModal] = useState<{
    open: boolean;
    userId: number | null;
  }>({ open: false, userId: null });

  // ── Derived data ─────────────────────────────────────────────────────────────
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

  const unassignedCount = useMemo(() => {
    return rootUsers.length > 1 ? rootUsers.length - 1 : 0;
  }, [rootUsers]);

  // Dynamic department filters with headcount
  const departmentFilters = useMemo(() => {
    const counts: Record<string, number> = {};
    flatUsers.forEach((u) => {
      if (u.department) {
        counts[u.department] = (counts[u.department] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [flatUsers]);

  // Expand / Collapse Handlers
  const toggleNode = (id: number) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<number, boolean> = {};
    flatUsers.forEach((u) => {
      allExpanded[u.id] = true;
    });
    setExpandedNodes(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<number, boolean> = {};
    flatUsers.forEach((u) => {
      allCollapsed[u.id] = false;
    });
    setExpandedNodes(allCollapsed);
  };

  // Export JSON handler
  const handleExportJson = () => {
    if (!hierarchyData) {
      message.warning('No organization data available to export.');
      return;
    }
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(hierarchyData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `organization-map-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    message.success('Organization data exported successfully as JSON.');
  };

  // Flow handlers
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
        reason: 'Reporting line updated via Organization Chart',
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
      message.success(`Department ${editDeptModal.department.department_name} updated successfully.`);
      setEditDeptModal({
        open: false,
        department: null,
        selectedHeadId: null,
        parentDeptId: null,
      });
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update department leadership.');
    }
  };

  const handleOpenChangeManager = (user?: HierarchyNodeUser) => {
    setChangeManagerModal({
      open: true,
      user: user || null,
    });
  };

  const handleOpenMatrixModal = (user?: HierarchyNodeUser) => {
    setMatrixModal({
      open: true,
      userId: user?.id || null,
    });
  };

  // ── Establish Founder as Apex Root of Organization for Tree List ─────────────
  const unifiedTree = useMemo<HierarchyNodeUser[]>(() => {
    if (!rootUsers.length) return [];

    // Find the real founder/CEO/executive apex leader
    const apexLeader =
      rootUsers.find(
        (u) =>
          u.designation?.toLowerCase().includes('founder') ||
          u.designation?.toLowerCase().includes('ceo') ||
          u.designation?.toLowerCase().includes('director') ||
          u.username?.toLowerCase().includes('pratyush') ||
          (u.directReports && u.directReports.length > 0)
      ) ||
      flatUsers.find(
        (u) =>
          !u.reporting_manager_id && (
            u.designation?.toLowerCase().includes('founder') ||
            u.designation?.toLowerCase().includes('ceo') ||
            u.designation?.toLowerCase().includes('director') ||
            u.username?.toLowerCase().includes('pratyush') ||
            (u.directReports && u.directReports.length > 0)
          )
      ) ||
      rootUsers[0];

    const unassignedRoots = rootUsers.filter((u) => u.id !== apexLeader.id);

    if (unassignedRoots.length === 0) {
      return [apexLeader];
    }

    // Best Practice: Cluster unassigned personnel into an explicit staging pool
    const unassignedGroupNode: HierarchyNodeUser = {
      id: -999,
      username: 'Unassigned Personnel',
      email: 'unassigned@organization.local',
      role: 'Staff Pool',
      department: 'Operations',
      designation: `${unassignedRoots.length} awaiting manager`,
      employee_code: 'POOL',
      reporting_manager_id: apexLeader.id,
      directReports: unassignedRoots,
      subordinatesCount: unassignedRoots.length,
    };

    const unifiedApexNode: HierarchyNodeUser = {
      ...apexLeader,
      directReports: [...(apexLeader.directReports || []), unassignedGroupNode],
    };

    return [unifiedApexNode];
  }, [rootUsers, flatUsers]);

  // Filter tree nodes if search query or department filter is active
  const filteredTree = useMemo<HierarchyNodeUser[]>(() => {
    if (!searchQuery.trim() && selectedDepartment === 'ALL') return unifiedTree;
    const q = searchQuery.toLowerCase().trim();

    const filterNode = (node: HierarchyNodeUser): HierarchyNodeUser | null => {
      const nameMatch = !q || node.username.toLowerCase().includes(q);
      const emailMatch = !q || (node.email && node.email.toLowerCase().includes(q));
      const roleMatch = !q || (node.role && node.role.toLowerCase().includes(q));
      const desigMatch = !q || (node.designation && node.designation.toLowerCase().includes(q));
      const deptMatch =
        selectedDepartment === 'ALL' ||
        (node.department && node.department.toLowerCase() === selectedDepartment.toLowerCase());

      const selfMatch = (nameMatch || emailMatch || roleMatch || desigMatch) && deptMatch;

      const matchedChildren = (node.directReports || [])
        .map(filterNode)
        .filter(Boolean) as HierarchyNodeUser[];

      if (selfMatch || matchedChildren.length > 0) {
        return {
          ...node,
          directReports: matchedChildren,
        };
      }
      return null;
    };

    return unifiedTree.map(filterNode).filter(Boolean) as HierarchyNodeUser[];
  }, [unifiedTree, searchQuery, selectedDepartment]);

  // Ant Design Tree Data Format (Directory Mode matching Screenshot)
  const antdTreeData = useMemo(() => {
    const mapNode = (node: HierarchyNodeUser): any => {
      if (node.id === -999) {
        return {
          key: String(node.id),
          title: (
            <div className="inline-flex items-center justify-between gap-4 p-3 my-1 rounded-2xl bg-amber-50/70 border-2 border-dashed border-amber-300 hover:border-amber-400 transition-all w-full max-w-4xl shadow-xs">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 font-bold text-xs flex items-center justify-center shrink-0 text-amber-800">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-950 text-xs">
                      {node.username}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                      {node.directReports?.length || 0} Staff
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                    {node.designation}
                  </span>
                </div>
              </div>
            </div>
          ),
          children: (node.directReports || []).map(mapNode),
        };
      }

      // Only identify as Founder/CEO by designation (job title), not RBAC role
      const isFounder = Boolean(
        !node.reporting_manager_id && (
          node.designation?.toLowerCase().includes('founder') ||
          node.designation?.toLowerCase().includes('ceo')
        )
      );
      const hasReports = Boolean(node.directReports && node.directReports.length > 0);
      const deptColor = getDepartmentColor(node.department);

      return {
        key: String(node.id),
        title: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEmployee(node);
            }}
            className="inline-flex items-center justify-between gap-4 p-3 my-1 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all w-full max-w-4xl shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {node.image_url ? (
                <img
                  src={node.image_url}
                  alt={node.username}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                    isFounder
                      ? 'bg-amber-500 text-white shadow-amber-200'
                      : 'text-white'
                  }`}
                  style={!isFounder ? { backgroundColor: deptColor.text } : {}}
                >
                  {isFounder ? (
                    <Crown size={16} className="text-white" />
                  ) : (
                    node.username ? node.username.slice(0, 2).toUpperCase() : 'U'
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-primary transition-colors">
                    {node.username}
                  </span>
                  {isFounder ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                      <Crown size={10} className="text-amber-600" /> {node.designation || 'Founder & CEO'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {node.role || node.designation || 'Staff'}
                    </span>
                  )}
                  {node.department && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: deptColor.bg,
                        color: deptColor.text,
                      }}
                    >
                      {node.department}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px] truncate">
                  <span className="truncate">{node.email}</span>
                  {node.designation && (
                    <span className="text-slate-400 shrink-0">• {node.designation}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {hasReports && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                  {node.directReports!.length} {node.directReports!.length === 1 ? 'Direct Report' : 'Direct Reports'}
                </span>
              )}
              {canManageHierarchy && (
                <button
                  type="button"
                  onClick={() => handleOpenEditManager(node)}
                  title="Change Reporting Manager"
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
          </div>
        ),
        children: hasReports ? node.directReports!.map(mapNode) : undefined,
      };
    };

    return filteredTree.map(mapNode);
  }, [filteredTree, canManageHierarchy]);

  // Department Table Columns (for Department Heads view)
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
      title: 'Headcount',
      key: 'count',
      render: (_, r) => (
        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-surface-subtle text-foreground border border-border-subtle">
          {r.member_count} {r.member_count === 1 ? 'member' : 'members'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) =>
        canManageHierarchy ? (
          <Button
            variant="outline"
            size="small"
            onClick={() => handleOpenEditDept(r)}
            className="text-xs">
            Configure Leadership
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* ── HEADER & WORKSPACE TOOLBAR (Matching Screenshot 1 & 2) ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Header Left: Title & Subtitle */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Organization map
              </h1>

              {/* View Switcher Pill */}
              <div className="flex items-center p-0.5 bg-surface-subtle rounded-full border border-border-subtle text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'map'
                      ? 'bg-white text-primary font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <GitBranch size={12} />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-white text-primary font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FolderTree size={12} />
                  <span>Tree List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('departments')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    viewMode === 'departments'
                      ? 'bg-white text-primary font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Teams
                </button>
                {canManageHierarchy && (
                  <button
                    type="button"
                    onClick={() => setViewMode('reorg')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      viewMode === 'reorg'
                        ? 'bg-white text-primary font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Reorg Studio
                  </button>
                )}
                {canManageHierarchy && (
                  <button
                    type="button"
                    onClick={() => setViewMode('audit')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      viewMode === 'audit'
                        ? 'bg-white text-primary font-bold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Audit
                  </button>
                )}
              </div>
            </div>

            {/* Subtitle Stats Line */}
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {stats.totalEmployees || flatUsers.length} people ·{' '}
              {stats.totalDepartments || departmentFilters.length} teams ·{' '}
              {hiddenCount} hidden in collapsed branches
              {unassignedCount > 0 && (
                <span className="text-amber-700 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-amber-100/70 border border-amber-200">
                  {unassignedCount} awaiting manager
                </span>
              )}
            </p>
          </div>

          {/* Header Right: Floating Pill Toolbar Matching Screenshot 1 & 2 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Pill */}
            <div className="relative">
              <Search
                size={13}
                className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search name, role or team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 text-xs pl-8 pr-7 py-1.5 rounded-full border border-border-subtle bg-surface-elevated text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Expand all */}
            <button
              type="button"
              onClick={handleExpandAll}
              className="h-8 px-3 rounded-full bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Maximize2 size={12} className="text-muted-foreground" />
              <span>Expand all</span>
            </button>

            {/* Collapse all */}
            <button
              type="button"
              onClick={handleCollapseAll}
              className="h-8 px-3 rounded-full bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Minimize2 size={12} className="text-muted-foreground" />
              <span>Collapse all</span>
            </button>

            {/* Export */}
            <button
              type="button"
              onClick={handleExportJson}
              className="h-8 px-3 rounded-full bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download size={12} className="text-muted-foreground" />
              <span>Export</span>
            </button>

            {/* Add employee (Primary Button) */}
            {canManageHierarchy && (
              <button
                type="button"
                onClick={() =>
                  setAddEmployeeModal({
                    open: true,
                    preselectedManagerId: selectedEmployee?.id ?? null,
                  })
                }
                className="h-8 px-4 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                <span>Add employee</span>
              </button>
            )}

            {/* Refresh */}
            <button
              type="button"
              onClick={() => refetch()}
              className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Refresh tree data"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Row of Department Filter Chips with Color Dots */}
        {(viewMode === 'map' || viewMode === 'list') && departmentFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => setSelectedDepartment('ALL')}
              className={`h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedDepartment === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>All Teams ({flatUsers.length})</span>
            </button>

            {departmentFilters.map((dept) => {
              const color = getDepartmentColor(dept.name);
              const isActive = selectedDepartment.toLowerCase() === dept.name.toLowerCase();
              return (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => setSelectedDepartment(isActive ? 'ALL' : dept.name)}
                  className={`h-7 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-surface-elevated hover:bg-surface-subtle border border-border-subtle text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color.dot }}
                  />
                  <span>{dept.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      {viewMode === 'map' && (
        <div className="w-full h-[calc(100vh-210px)] min-h-[640px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-[#faf9f8]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <RefreshCw size={24} className="animate-spin text-[#e8583a]" />
              <span className="text-xs font-bold">Loading interactive organizational map...</span>
            </div>
          ) : rootUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-2">
              <Network className="w-10 h-10 text-slate-400 opacity-50 mb-1" />
              <p className="text-sm font-bold text-slate-800">No personnel records found</p>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                No active employee hierarchy records were returned from the system.
              </p>
            </div>
          ) : (
            <OrgCanvasMap
              rootUsers={rootUsers}
              flatUsers={flatUsers}
              searchQuery={searchQuery}
              selectedDepartment={selectedDepartment}
              selectedUserId={selectedEmployee?.id ?? null}
              onSelectUser={(u) => {
                if (u.id !== -999) setSelectedEmployee(u);
              }}
              onAddDirectReport={(u) =>
                setAddEmployeeModal({ open: true, preselectedManagerId: u.id })
              }
              onRemoveUser={(u) => setRemoveEmployeeModal({ open: true, user: u })}
              expandedNodes={expandedNodes}
              onToggleNode={toggleNode}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onHiddenCountChange={setHiddenCount}
            />
          )}
        </div>
      )}

      {/* VIEW: TREE LIST (Directory View matching user screenshot) */}
      {viewMode === 'list' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6 min-h-[640px] overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
              <RefreshCw size={24} className="animate-spin text-[#e8583a]" />
              <span className="text-xs font-bold">Loading organization tree list...</span>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 gap-2">
              <Network className="w-10 h-10 text-slate-400 opacity-50 mb-1" />
              <p className="text-sm font-bold text-slate-800">No personnel records found</p>
              <p className="text-xs text-slate-500 font-medium max-w-sm">
                No active employee records match your search query or department filter.
              </p>
            </div>
          ) : (
            <div className="py-2">
              <Tree
                showLine={{ showLeafIcon: false }}
                defaultExpandAll
                treeData={antdTreeData}
                blockNode
                className="bg-transparent"
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW: DEPARTMENT HEADS TABLE */}
      {viewMode === 'departments' && (
        <div className="rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft overflow-hidden p-3">
          <Table
            scroll={{ x: 'max-content' }}
            columns={deptColumns}
            dataSource={departments}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            className="premium-table"
          />
        </div>
      )}

      {/* VIEW: REORG STUDIO */}
      {viewMode === 'reorg' && (
        <HierarchyReorgStudio
          onOpenFlowA={handleOpenChangeManager}
          onOpenFlowB1={() => setBulkHandoverModal(true)}
          onOpenFlowB2={() => setReplaceManagerModal(true)}
          onOpenFlowB3={() => setOffboardRollupModal(true)}
          onOpenFlowC={handleOpenMatrixModal}
          stats={stats}
        />
      )}

      {/* VIEW: AUDIT TRAIL */}
      {viewMode === 'audit' && (
        <HierarchyAuditTrailView flatUsers={flatUsers} />
      )}

      {/* ── CONTEXTUAL EMPLOYEE PROFILE DRAWER ── */}
      <OrgEmployeeDrawer
        user={selectedEmployee}
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        flatUsers={flatUsers}
        onSelectUser={(u) => setSelectedEmployee(u)}
        onAddDirectReport={(u) =>
          setAddEmployeeModal({ open: true, preselectedManagerId: u.id })
        }
        onRemoveUser={(u) => setRemoveEmployeeModal({ open: true, user: u })}
        onChangeManager={(u) => {
          setSelectedEmployee(null);
          handleOpenEditManager(u);
        }}
        onMatrixManager={(u) => {
          setSelectedEmployee(null);
          handleOpenMatrixModal(u);
        }}
        canManage={canManageHierarchy}
      />

      {/* ── ADD EMPLOYEE MODAL ── */}
      <OrgAddEmployeeModal
        open={addEmployeeModal.open}
        onClose={() => setAddEmployeeModal({ open: false, preselectedManagerId: null })}
        preselectedManagerId={addEmployeeModal.preselectedManagerId}
        flatUsers={flatUsers}
        departments={departments}
        onSuccess={async (newId) => {
          const res = await refetch();
          const updatedFlat = res.data?.data?.flatUsers || [];
          if (newId) {
            const found = updatedFlat.find((u) => u.id === newId);
            if (found) {
              if (found.reporting_manager_id) {
                setExpandedNodes((prev) => ({
                  ...prev,
                  [found.reporting_manager_id!]: true,
                }));
              }
              setSelectedEmployee(found);
            }
          }
        }}
      />

      {/* ── REMOVE EMPLOYEE CONFIRM MODAL ── */}
      <OrgRemoveConfirmModal
        open={removeEmployeeModal.open}
        onClose={() => setRemoveEmployeeModal({ open: false, user: null })}
        user={removeEmployeeModal.user}
        flatUsers={flatUsers}
        onSuccess={() => {
          setSelectedEmployee(null);
          refetch();
        }}
      />

      {/* ── MODAL: ASSIGN / CHANGE REPORTING MANAGER ── */}
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
                  .filter((u) => u.id !== editManagerModal.user?.id)
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

      {/* ── MODAL: ASSIGN DEPARTMENT HEAD ── */}
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

      {/* ── ENTERPRISE REORG MODALS ── */}
      <ChangeManagerModal
        open={changeManagerModal.open}
        onClose={() => setChangeManagerModal({ open: false, user: null })}
        selectedUser={changeManagerModal.user}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      <BulkHandoverModal
        open={bulkHandoverModal}
        onClose={() => setBulkHandoverModal(false)}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      <ReplaceManagerModal
        open={replaceManagerModal}
        onClose={() => setReplaceManagerModal(false)}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      <OffboardRollupModal
        open={offboardRollupModal}
        onClose={() => setOffboardRollupModal(false)}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      <MatrixManagerModal
        open={matrixModal.open}
        onClose={() => setMatrixModal({ open: false, userId: null })}
        preselectedUserId={matrixModal.userId}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />
    </div>
  );
}
