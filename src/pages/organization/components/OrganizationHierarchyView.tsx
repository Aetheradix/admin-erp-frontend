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
  Shuffle,
  ClipboardList,
  FolderTree,
  Maximize2,
  Minimize2,
  Crown,
} from 'lucide-react';
import { Select, Tag, message, Table, Tree } from 'antd';
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

export function OrganizationHierarchyView() {
  const { data: hierarchyResponse, isLoading, refetch } = useGetOrganizationHierarchyQuery();
  const [updateReportingManager, { isLoading: isUpdatingManager }] =
    useUpdateReportingManagerMutation();
  const [updateDepartmentHierarchy, { isLoading: isUpdatingDept }] =
    useUpdateDepartmentHierarchyMutation();

  const { can, isSuperadmin } = usePermission();
  const canManageHierarchy = isSuperadmin || can('organization:manage');

  const [viewMode, setViewMode] = useState<'tree' | 'departments' | 'reorg' | 'audit'>('tree');
  const [treeLayout, setTreeLayout] = useState<'chart' | 'directory'>('chart');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  // ── Existing modals ──────────────────────────────────────────────────────────
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

  // ── New Reorg modals ─────────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
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

  // Reorg Studio handlers
  const handleOpenChangeManager = (user?: HierarchyNodeUser) =>
    setChangeManagerModal({ open: true, user: user || null });

  const handleOpenMatrixModal = (user?: HierarchyNodeUser) =>
    setMatrixModal({ open: true, userId: user?.id ?? null });

  // ── Establish Founder as Apex Root of Organization ───────────────────────────
  const unifiedTree = useMemo(() => {
    if (!rootUsers.length) return [];

    // Find Founder (Pratyush Shrivastava)
    const founder =
      rootUsers.find((u) => u.username.toLowerCase().includes('pratyush')) ||
      flatUsers.find((u) => u.username.toLowerCase().includes('pratyush')) ||
      rootUsers[0];

    if (!founder) return rootUsers;

    // Gather other top nodes that don't have a designated manager (e.g. Sarah, Yonko)
    const otherRoots = rootUsers.filter((u) => u.id !== founder.id);

    // Merge so that unassigned personnel report under the Founder
    const founderReports = [...(founder.directReports || [])];
    otherRoots.forEach((other) => {
      if (!founderReports.some((r) => r.id === other.id)) {
        founderReports.push(other);
      }
    });

    const apexFounderNode: HierarchyNodeUser = {
      ...founder,
      designation: founder.designation || 'Founder & CEO',
      directReports: founderReports,
    };

    return [apexFounderNode];
  }, [rootUsers, flatUsers]);

  // Filter tree nodes if search query is active
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return unifiedTree;
    const q = searchQuery.toLowerCase();

    const filterNode = (node: HierarchyNodeUser): HierarchyNodeUser | null => {
      const selfMatch =
        node.username.toLowerCase().includes(q) ||
        node.email.toLowerCase().includes(q) ||
        (node.department && node.department.toLowerCase().includes(q)) ||
        (node.role && node.role.toLowerCase().includes(q));

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
  }, [unifiedTree, searchQuery]);

  // Ant Design Tree Data Format (Directory Mode)
  const antdTreeData = useMemo(() => {
    const mapNode = (node: HierarchyNodeUser): any => {
      const isFounder =
        node.username.toLowerCase().includes('pratyush') ||
        node.designation?.toLowerCase().includes('founder');
      const hasReports = Boolean(node.directReports && node.directReports.length > 0);

      return {
        key: String(node.id),
        title: (
          <div className="inline-flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-muted/40 transition-colors">
            <div
              className={`w-7 h-7 rounded-lg font-black text-[10px] flex items-center justify-center shrink-0 ${
                isFounder
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'bg-primary/10 text-primary'
              }`}>
              {isFounder ? <Crown size={13} className="text-white" /> : node.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-bold text-foreground text-xs">{node.username}</span>
            {isFounder ? (
              <Tag color="gold" className="text-[10px] font-black m-0 px-2 py-0 border-amber-300 inline-flex items-center gap-1">
                <Crown size={10} className="text-amber-600" /> Founder
              </Tag>
            ) : (
              <Tag color="volcano" className="text-[10px] font-bold m-0 px-1.5 py-0">
                {node.role || 'Staff'}
              </Tag>
            )}
            <span className="text-[10px] text-muted-foreground hidden sm:inline">({node.email})</span>
            {node.department && (
              <span className="text-[10px] text-foreground font-bold px-2 py-0.5 rounded-md border border-border/80">
                {node.department}
              </span>
            )}
            {hasReports && (
              <Tag color="blue" className="text-[10px] font-bold m-0 px-1.5 py-0">
                {node.directReports!.length} {node.directReports!.length === 1 ? 'Report' : 'Reports'}
              </Tag>
            )}
            {canManageHierarchy && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditManager(node);
                }}
                title="Change Reporting Manager"
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1">
                <Edit2 size={11} />
              </button>
            )}
          </div>
        ),
        children: hasReports ? node.directReports!.map(mapNode) : undefined,
      };
    };

    return filteredTree.map(mapNode);
  }, [filteredTree, canManageHierarchy]);

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
      render: (_, r) =>
        canManageHierarchy && (
          <Button
            variant="outline"
            size="small"
            onClick={() => handleOpenEditDept(r)}
            className="text-xs font-bold gap-1">
            <Edit2 size={12} /> Configure
          </Button>
        ),
    },
  ];

  // Visual Tree Node Renderer with Connected SVG/CSS Branch Lines
  const renderVisualTreeNode = (
    node: HierarchyNodeUser,
    level: number = 0,
    isFirst: boolean = false,
    isLast: boolean = false,
    isOnlyChild: boolean = false
  ) => {
    const isExpanded = expandedNodes[node.id] !== false; // Default expanded
    const hasReports = Boolean(node.directReports && node.directReports.length > 0);
    const isFounder =
      level === 0 ||
      node.username.toLowerCase().includes('pratyush') ||
      node.designation?.toLowerCase().includes('founder');

    return (
      <div key={node.id} className="relative flex flex-col items-center">
        {/* Inbound Branch Line from Parent (for all non-root nodes) */}
        {level > 0 && (
          <div className="relative w-full h-8 flex justify-center items-center">
            {/* Horizontal connecting busbar spanning above sibling nodes */}
            {!isOnlyChild && (
              <div
                className={`absolute top-0 h-[2px] bg-slate-300 dark:bg-slate-700 ${
                  isFirst
                    ? 'left-1/2 right-0'
                    : isLast
                    ? 'left-0 right-1/2'
                    : 'left-0 right-0'
                }`}
              />
            )}
            {/* Vertical drop line down into the card */}
            <div className="w-[2px] h-8 bg-slate-300 dark:bg-slate-700" />
          </div>
        )}

        {/* Node Card */}
        <div
          className={`relative z-10 p-3.5 rounded-2xl bg-card border transition-all flex flex-col gap-2 ${
            isFounder
              ? 'w-72 border-amber-400 ring-2 ring-amber-400/25 shadow-md bg-gradient-to-b from-amber-500/5 via-card to-card'
              : 'w-68 border-border/70 hover:border-primary/40 shadow-xs hover:shadow-md'
          }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs relative ${
                  isFounder
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white ring-2 ring-amber-400/40'
                    : 'bg-gradient-to-tr from-primary to-primary-light text-white'
                }`}>
                {isFounder ? <Crown size={18} className="text-white drop-shadow-xs" /> : node.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground text-xs block truncate" title={node.username}>
                    {node.username}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block truncate" title={node.email}>
                  {node.email}
                </span>
              </div>
            </div>

            {canManageHierarchy && !isFounder && (
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
            {isFounder ? (
              <Tag color="gold" className="text-[10px] font-black m-0 px-2 py-0.5 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 inline-flex items-center gap-1">
                <Crown size={11} className="text-amber-600" />
                <span>Founder & SuperAdmin</span>
              </Tag>
            ) : (
              <Tag color="volcano" className="text-[10px] font-bold m-0 px-1.5 py-0">
                {node.role || 'Staff'}
              </Tag>
            )}
            {node.department && (
              <span className="text-[10px] text-foreground font-bold px-2 py-0.5 rounded-md border border-border/80 truncate max-w-[140px]">
                {node.department}
              </span>
            )}
          </div>

          {/* Subordinates Toggle Bar */}
          {hasReports && (
            <button
              type="button"
              onClick={() => toggleNode(node.id)}
              className="mt-0.5 w-full py-1 px-2 rounded-lg bg-surface-subtle hover:bg-muted/80 text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between transition-colors">
              <span className="flex items-center gap-1 text-primary">
                <Users size={11} /> {node.directReports!.length} Direct {node.directReports!.length === 1 ? 'Report' : 'Reports'}
              </span>
              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          )}
        </div>

        {/* Outbound Branch Line to Children */}
        {hasReports && isExpanded && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical stem descending from this card */}
            <div className="w-[2px] h-8 bg-slate-300 dark:bg-slate-700" />

            {/* Children row */}
            <div className="flex items-start justify-center">
              {node.directReports!.map((child, idx) => (
                <div key={child.id} className="px-3 flex flex-col items-center">
                  {renderVisualTreeNode(
                    child,
                    level + 1,
                    idx === 0,
                    idx === node.directReports!.length - 1,
                    node.directReports!.length === 1
                  )}
                </div>
              ))}
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
        <div className="flex items-center gap-2 flex-wrap">
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
          {canManageHierarchy && (
            <button
              onClick={() => setViewMode('reorg')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === 'reorg'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}>
              <Shuffle size={14} /> Reorg Studio
            </button>
          )}
          {canManageHierarchy && (
            <button
              onClick={() => setViewMode('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === 'audit'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}>
              <ClipboardList size={14} /> Audit Trail
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {viewMode === 'tree' && (
            <>
              {/* Layout Switcher: Chart vs Directory Tree */}
              <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/40">
                <button
                  type="button"
                  onClick={() => setTreeLayout('chart')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    treeLayout === 'chart'
                      ? 'bg-card text-primary shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  <GitBranch size={12} /> Chart
                </button>
                <button
                  type="button"
                  onClick={() => setTreeLayout('directory')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    treeLayout === 'directory'
                      ? 'bg-card text-primary shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  <FolderTree size={12} /> Tree List
                </button>
              </div>

              {/* Expand / Collapse All */}
              {treeLayout === 'chart' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleExpandAll}
                    className="text-[11px] font-semibold h-7 px-2"
                    title="Expand All Nodes">
                    <Maximize2 size={11} className="mr-1" /> Expand
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleCollapseAll}
                    className="text-[11px] font-semibold h-7 px-2"
                    title="Collapse All Nodes">
                    <Minimize2 size={11} className="mr-1" /> Collapse
                  </Button>
                </div>
              )}

              {/* Search */}
              <div className="relative flex-1 md:w-48">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-border/60 bg-muted/20 focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          <Button variant="outline" size="small" onClick={() => refetch()} className="gap-1.5 text-xs h-8">
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
          ) : filteredTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-bold text-foreground">No personnel records found</p>
              <p className="text-xs text-muted-foreground">Adjust search filter or assign managers.</p>
            </div>
          ) : treeLayout === 'directory' ? (
            <div className="p-4 bg-muted/10 rounded-2xl border border-border/40">
              <Tree
                showLine={{ showLeafIcon: false }}
                defaultExpandAll
                treeData={antdTreeData}
                className="bg-transparent"
              />
            </div>
          ) : (
            <div className="flex items-start justify-center min-w-max py-4">
              {filteredTree.map((root) =>
                renderVisualTreeNode(root, 0, false, false, true)
              )}
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

      {/* VIEW 3: REORG STUDIO */}
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

      {/* VIEW 4: AUDIT TRAIL */}
      {viewMode === 'audit' && (
        <HierarchyAuditTrailView flatUsers={flatUsers} />
      )}

      {/* MODAL: ASSIGN / CHANGE REPORTING MANAGER (tree node quick-edit) */}
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

      {/* ── REORG MODALS ──────────────────────────────────────────────────────── */}

      {/* Change Manager */}
      <ChangeManagerModal
        open={changeManagerModal.open}
        onClose={() => setChangeManagerModal({ open: false, user: null })}
        selectedUser={changeManagerModal.user}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      {/* Bulk Handover */}
      <BulkHandoverModal
        open={bulkHandoverModal}
        onClose={() => setBulkHandoverModal(false)}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      {/* Replace Manager */}
      <ReplaceManagerModal
        open={replaceManagerModal}
        onClose={() => setReplaceManagerModal(false)}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      {/* Offboard Rollup */}
      <OffboardRollupModal
        open={offboardRollupModal}
        onClose={() => setOffboardRollupModal(false)}
        flatUsers={flatUsers}
        onSuccess={refetch}
      />

      {/* Matrix Manager */}
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
