import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  PauseCircle,
} from 'lucide-react';
import {
  Modal,
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  Form,
  Radio,
  message,
  Spin,
  Divider,
  Tooltip,
  Checkbox,
  DatePicker,
  Collapse,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { PROJECT_TYPE_TEMPLATES, type ProjectTypeTemplate } from './config/projectTemplates';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/hooks/useAuth';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import {
  useGetRawProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  type BackendProject,
} from '@/store/api/projectApiSlice';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { UserSelect } from '@/components/projects/UserSelect';

const { TextArea } = Input;

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Active', label: 'Active' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const isOverdueProject = (p: BackendProject) => {
  const date = p.end_date || p.deadline;
  return (
    !!date &&
    new Date(date) < new Date() &&
    p.project_status?.toLowerCase() !== 'completed' &&
    p.project_status?.toLowerCase() !== 'cancelled'
  );
};

type FormValues = {
  project_name: string;
  project_key?: string;
  description?: string;
  department_id?: number;
  owner_user_id?: number;
  project_manager_id?: number;
  start_date?: Dayjs | null;
  end_date?: Dayjs | null;
  methodology?: string;
  priority?: string;
  project_status?: string;
  progress?: number;
  project_type?: string;
  mode?: 'simple' | 'advanced';
  client_name?: string;
  estimation_unit?: 'hours' | 'points';
  auto_shift_mode?: 'strict' | 'flexible' | 'off';
  member_ids?: number[];
};

const PROJECT_TYPE_OPTIONS = [
  { value: 'Software', label: 'Software / Product' },
  { value: 'Client Delivery', label: 'Client Delivery' },
  { value: 'Marketing', label: 'Marketing & Growth' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Design', label: 'Design & UX' },
  { value: 'Internal', label: 'Internal Initiative' },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  accent: string;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({ label, value, icon, color, accent, onClick, active }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col gap-2 p-4 rounded-xl border cursor-pointer
        transition-all duration-150 select-none
        ${active ? `border-[${accent}] bg-[${accent}]/5 shadow-sm` : 'border-border-subtle bg-card hover:border-primary/30 hover:shadow-sm'}
      `}
      style={active ? { borderColor: accent, backgroundColor: `${accent}10` } : undefined}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="text-2xl font-black" style={{ color: active ? color : undefined }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ProjectsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modal state: null = closed, 'create' = new, project = edit
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [configMode, setConfigMode] = useState<'simple' | 'advanced'>('simple');
  const [selectedType, setSelectedType] = useState<ProjectTypeTemplate>(PROJECT_TYPE_TEMPLATES[0]);
  const [editingProject, setEditingProject] = useState<BackendProject | null>(null);
  const [form] = Form.useForm<FormValues>();

  // Queries & mutations
  const {
    data: projects = [],
    isLoading: loadingProjects,
    refetch,
  } = useGetRawProjectsQuery(undefined);

  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();

  // Sync org hierarchy into departmentService
  useEffect(() => {
    if (hierarchyData?.data) {
      departmentService.syncFromLiveUsers(
        hierarchyData.data.flatUsers || [],
        hierarchyData.data.departments || []
      );
    }
  }, [hierarchyData]);

  const availableDepts = useMemo(() => {
    const live = departmentService.getDepartments();
    return live.length > 0 ? live : [];
  }, [hierarchyData]);

  // ── Dynamic Stats (all computed from live project data) ──────────────────
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.project_status?.toLowerCase() === 'active').length;
    const planning = projects.filter((p) => p.project_status?.toLowerCase() === 'planning').length;
    const onHold = projects.filter(
      (p) =>
        p.project_status?.toLowerCase() === 'on hold' ||
        p.project_status?.toLowerCase() === 'on_hold'
    ).length;
    const completed = projects.filter(
      (p) => p.project_status?.toLowerCase() === 'completed'
    ).length;
    const overdue = projects.filter(isOverdueProject).length;
    return { total, active, planning, onHold, completed, overdue };
  }, [projects]);

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return projects.filter((p: BackendProject) => {
      const name = (p.project_name || '').toLowerCase();
      const key = (p.project_key || '').toLowerCase();
      const dept = p.department_name || '';
      const q = search.toLowerCase();

      const matchSearch =
        !search || name.includes(q) || key.includes(q) || dept.toLowerCase().includes(q);
      const matchDept = deptFilter === 'all' || dept === deptFilter;

      let matchStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          matchStatus = isOverdueProject(p);
        } else {
          matchStatus = (p.project_status || '').toLowerCase() === statusFilter.toLowerCase();
        }
      }

      return matchSearch && matchDept && matchStatus;
    });
  }, [projects, search, deptFilter, statusFilter]);

  // ── Open Create Modal ─────────────────────────────────────────────────────
  const openCreateModal = useCallback(() => {
    setEditingProject(null);
    setModalMode('create');
    setConfigMode('simple');
    setSelectedType(PROJECT_TYPE_TEMPLATES[0]);
    form.resetFields();
    form.setFieldsValue({
      methodology: PROJECT_TYPE_TEMPLATES[0].defaultMethodology,
      priority: 'Medium',
      project_status: 'Planning',
      project_type: PROJECT_TYPE_TEMPLATES[0].id,
      mode: 'simple',
      estimation_unit: 'hours',
      auto_shift_mode: 'flexible',
      owner_user_id: user?.id ? Number(user.id) : undefined,
      member_ids: user?.id ? [Number(user.id)] : [],
      start_date: dayjs(),
      end_date: null,
    });
  }, [form, user?.id]);

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const openEditModal = useCallback(
    (project: BackendProject) => {
      setEditingProject(project);
      setModalMode('edit');
      const m = project.mode === 'advanced' ? 'advanced' : 'simple';
      setConfigMode(m);
      form.resetFields();
      form.setFieldsValue({
        project_name: project.project_name,
        project_key: project.project_key,
        description: project.project_description,
        department_id: project.department_id,
        owner_user_id: project.owner_user_id,
        project_manager_id: project.project_manager_id,
        start_date: project.start_date ? dayjs(project.start_date) : null,
        end_date: project.end_date ? dayjs(project.end_date) : null,
        methodology: project.methodology || 'scrum',
        priority: project.priority || 'Medium',
        project_status: project.project_status || 'Planning',
        progress: project.progress ?? 0,
        project_type: project.project_type || 'Software',
        mode: m,
        client_name: project.client_name || '',
        estimation_unit: project.estimation_unit || 'hours',
        auto_shift_mode: project.auto_shift_mode || 'flexible',
      });
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingProject(null);
    form.resetFields();
  }, [form]);

  // ── Create Project ────────────────────────────────────────────────────────
  const handleCreateProject = async (values: FormValues) => {
    try {
      const derivedKey = (values.project_key?.trim() || values.project_name.slice(0, 4))
        .toUpperCase()
        .replace(/\s/g, '')
        .slice(0, 10);

      const created = await createProject({
        project_name: values.project_name.trim(),
        project_key: derivedKey,
        project_description: values.description || '',
        project_status: values.project_status || 'Planning',
        department_id: values.department_id,
        owner_user_id: values.owner_user_id || (user?.id as number),
        project_manager_id:
          values.project_manager_id || values.owner_user_id || (user?.id as number),
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : undefined,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : undefined,
        methodology: values.methodology || 'scrum',
        priority: values.priority || 'Medium',
        health: 'on_track',
        visibility: 'team',
        progress: values.progress ?? 0,
        project_type: modalMode === 'create' ? selectedType.id : values.project_type || 'Software',
        mode: values.mode || configMode,
        client_name: values.client_name || undefined,
        estimation_unit: values.estimation_unit || 'hours',
        auto_shift_mode: values.auto_shift_mode || 'flexible',
        steps: modalMode === 'create' ? selectedType.steps : undefined,
        member_ids: modalMode === 'create' ? values.member_ids : undefined,
      }).unwrap();

      closeModal();
      message.success(`Project "${created.project_name}" created!`);
      refetch();
      navigate(`/projects/${created.project_id}`);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to create project';
      message.error(msg);
    }
  };

  // ── Edit / Update Project ─────────────────────────────────────────────────
  const handleEditProject = async (values: FormValues) => {
    if (!editingProject) return;
    try {
      await updateProject({
        id: editingProject.project_id,
        data: {
          project_name: values.project_name?.trim(),
          project_key: values.project_key?.toUpperCase().replace(/\s/g, '').slice(0, 10),
          project_description: values.description,
          project_status: values.project_status,
          department_id: values.department_id,
          owner_user_id: values.owner_user_id,
          project_manager_id: values.project_manager_id,
          start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : undefined,
          end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : undefined,
          methodology: values.methodology,
          priority: values.priority,
          progress: values.progress ?? 0,
          project_type: values.project_type,
          mode: configMode,
          client_name: values.client_name,
          estimation_unit: values.estimation_unit,
          auto_shift_mode: values.auto_shift_mode,
        },
      }).unwrap();

      closeModal();
      message.success('Project updated successfully!');
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update project';
      message.error(msg);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (projectId: number) => {
    try {
      await deleteProject(projectId).unwrap();
      message.success('Project deleted');
      refetch();
    } catch {
      message.error('Failed to delete project');
    }
  };

  // ── Inline Status Change ──────────────────────────────────────────────────
  const handleStatusChange = async (projectId: number, newStatus: string) => {
    try {
      await updateProject({ id: projectId, data: { project_status: newStatus } }).unwrap();
      message.success(`Status updated to ${newStatus}`);
      refetch();
    } catch {
      message.error('Failed to update status');
    }
  };

  // ── Form submit router ────────────────────────────────────────────────────
  const handleFormFinish = (values: FormValues) => {
    if (modalMode === 'edit') {
      handleEditProject(values);
    } else {
      handleCreateProject(values);
    }
  };

  const isSubmitting = creating || updating;

  // ── Stat cards config ─────────────────────────────────────────────────────
  const statCards = [
    {
      key: 'all',
      label: 'All Projects',
      value: stats.total,
      icon: <FolderKanban size={16} />,
      color: '#6366f1',
      accent: '#6366f1',
    },
    {
      key: 'active',
      label: 'Active',
      value: stats.active,
      icon: <Clock size={16} />,
      color: '#22c55e',
      accent: '#22c55e',
    },
    {
      key: 'planning',
      label: 'Planning',
      value: stats.planning,
      icon: <Layers size={16} />,
      color: '#f59e0b',
      accent: '#f59e0b',
    },
    {
      key: 'on hold',
      label: 'On Hold',
      value: stats.onHold,
      icon: <PauseCircle size={16} />,
      color: '#8b5cf6',
      accent: '#8b5cf6',
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: stats.overdue,
      icon: <AlertTriangle size={16} />,
      color: '#ef4444',
      accent: '#ef4444',
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 size={16} />,
      color: '#10b981',
      accent: '#10b981',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <FolderKanban className="text-primary" size={22} />
            <span>Projects</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Track lifecycle, sprints, and team workflows across all departments.
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={15} />}
          onClick={openCreateModal}
          className="rounded-xl font-bold text-sm h-9 shadow-xs shrink-0">
          New Project
        </Button>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <Row gutter={[12, 12]}>
        {statCards.map((card) => (
          <Col xs={12} sm={8} lg={4} key={card.key}>
            <StatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              accent={card.accent}
              active={statusFilter === card.key}
              onClick={() => setStatusFilter((prev) => (prev === card.key ? 'all' : card.key))}
            />
          </Col>
        ))}
      </Row>

      {/* ── Filters & View Toggle ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Space wrap size="small" className="w-full sm:w-auto">
          <Input
            prefix={<Search size={13} className="text-muted" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, key or department..."
            className="rounded-lg w-full sm:w-72"
            allowClear
            size="middle"
          />

          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            className="w-44"
            size="middle"
            options={[
              { value: 'all', label: 'All Departments' },
              ...availableDepts.map((d) => ({ value: d.name, label: d.name })),
            ]}
          />

          {statusFilter !== 'all' && (
            <Tooltip title="Clear status filter">
              <Button
                size="middle"
                onClick={() => setStatusFilter('all')}
                className="rounded-lg text-xs">
                Clear Filter
              </Button>
            </Tooltip>
          )}
        </Space>

        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          buttonStyle="solid"
          size="small">
          <Radio.Button value="table">
            <span className="flex items-center gap-1">
              <TableIcon size={12} /> Table
            </span>
          </Radio.Button>
          <Radio.Button value="grid">
            <span className="flex items-center gap-1">
              <LayoutGrid size={12} /> Grid
            </span>
          </Radio.Button>
        </Radio.Group>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      {loadingProjects ? (
        <div className="flex justify-center items-center py-24">
          <Spin size="large" tip="Loading projects..." />
        </div>
      ) : viewMode === 'table' ? (
        <ProjectTable
          projects={filteredProjects}
          loading={loadingProjects}
          onOpenProject={(proj) => navigate(`/projects/${proj.project_id}`)}
          onEditProject={openEditModal}
          onDeleteProject={handleDelete}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.project_id}>
              <ProjectCard
                project={project}
                onClick={(proj) => navigate(`/projects/${proj.project_id}`)}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        title={
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-foreground">
                {modalMode === 'edit' ? 'Edit Project' : 'Start a new project'}
              </span>
              {modalMode === 'edit' && editingProject?.project_key && (
                <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                  {editingProject.project_key}
                </span>
              )}
            </div>
            {modalMode === 'create' && (
              <p className="text-xs font-normal text-muted m-0">
                Pick what kind of project it is.
              </p>
            )}
          </div>
        }
        open={modalMode !== null}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        centered
        width={680}>
        <Form form={form} layout="vertical" onFinish={handleFormFinish} className="pt-2">
          {modalMode === 'create' ? (
            <>
              {/* 6 Interactive Project Type Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                {PROJECT_TYPE_TEMPLATES.map((tpl) => {
                  const isSelected = selectedType.id === tpl.id;
                  const TypeIcon = tpl.icon;
                  return (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => {
                        setSelectedType(tpl);
                        form.setFieldsValue({
                          project_type: tpl.id,
                          methodology: tpl.defaultMethodology,
                        });
                      }}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs'
                          : 'border-border-subtle bg-card hover:border-primary/40'
                      }`}>
                      <div className="mb-1.5">
                        <TypeIcon
                          className={`w-4 h-4 ${isSelected ? 'text-primary' : tpl.iconColor}`}
                        />
                      </div>
                      <div className="text-xs font-bold text-foreground">{tpl.label}</div>
                      <div className="text-[11px] text-muted leading-snug mt-0.5">
                        {tpl.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Steps Preview Bar */}
              <div className="px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-[11px] text-muted mb-4">
                <span className="font-bold text-foreground">Steps: </span>
                {selectedType.steps.length > 0 ? (
                  <>
                    <span>{selectedType.steps.join(' → ')}</span>
                    <span className="opacity-75"> · you can rename, add or remove steps later</span>
                  </>
                ) : (
                  <span>Empty · add your own steps after creation</span>
                )}
              </div>

              {/* Project Name */}
              <Form.Item
                name="project_name"
                label="Project name"
                rules={[{ required: true, message: 'Please enter a project name' }]}>
                <Input placeholder="e.g. Lotus clinic website" className="rounded-lg" />
              </Form.Item>

              {/* Start & Finish by Dates */}
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="start_date" label="Start date">
                    <DatePicker className="w-full rounded-lg" format="DD-MM-YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="end_date" label="Finish by (optional)">
                    <DatePicker
                      className="w-full rounded-lg"
                      format="DD-MM-YYYY"
                      placeholder="Select finish date"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Who's working on it? (Live Org Users) */}
              <Form.Item name="member_ids" label="Who's working on it?" className="mb-2">
                {hierarchyData?.data?.flatUsers && hierarchyData.data.flatUsers.length > 0 ? (
                  <Checkbox.Group className="w-full flex flex-wrap gap-x-4 gap-y-1.5 p-2.5 rounded-xl border border-border-subtle bg-surface-subtle max-h-28 overflow-y-auto">
                    {hierarchyData.data.flatUsers.map((u) => (
                      <Checkbox key={u.id} value={u.id} className="text-xs m-0">
                        {u.username || u.email}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                ) : (
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs text-muted">
                    Loading team members...
                  </div>
                )}
              </Form.Item>

              {/* Collapsible More Options */}
              <Collapse
                ghost
                size="small"
                className="mb-2 -mx-3"
                items={[
                  {
                    key: 'more',
                    label: <span className="text-xs font-semibold text-muted">More options</span>,
                    children: (
                      <div className="p-3 rounded-xl border border-border-subtle bg-surface-subtle/50 space-y-2">
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              name="project_key"
                              label="Short code (made from the name)">
                              <Input
                                maxLength={10}
                                placeholder="Auto"
                                className="rounded-lg font-mono uppercase"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="client_name" label="Client">
                              <Input placeholder="Optional" className="rounded-lg" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="owner_user_id" label="Project lead">
                              <UserSelect placeholder="Select lead" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="mode" label="Advanced tools">
                              <Select
                                onChange={(val: 'simple' | 'advanced') => setConfigMode(val)}
                                options={[
                                  { value: 'simple', label: 'Off: keep it simple' },
                                  { value: 'advanced', label: 'On: Sprints, Timeline & Time' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item name="department_id" label="Department">
                              <Select
                                placeholder="Select department"
                                allowClear
                                options={availableDepts.map((d) => ({ value: d.id, label: d.name }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="priority" label="Priority">
                              <Select options={PRIORITY_OPTIONS} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ),
                  },
                ]}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-border-subtle">
                <span className="text-xs font-semibold text-muted">Configuration Mode</span>
                <Radio.Group
                  value={configMode}
                  onChange={(e) => setConfigMode(e.target.value)}
                  size="small"
                  buttonStyle="solid">
                  <Radio.Button value="simple">Simple Mode</Radio.Button>
                  <Radio.Button value="advanced">Advanced Mode</Radio.Button>
                </Radio.Group>
              </div>

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    name="project_name"
                    label="Project Name"
                    rules={[{ required: true, message: 'Please enter a project name' }]}>
                    <Input placeholder="e.g. Customer Portal Redesign" className="rounded-lg" />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="project_type" label="Project Type">
                    <Select options={PROJECT_TYPE_OPTIONS} placeholder="Select type" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={10}>
                  <Form.Item name="project_key" label="Project Key">
                    <Input
                      maxLength={10}
                      placeholder="e.g. CPR"
                      className="rounded-lg font-mono uppercase"
                    />
                  </Form.Item>
                </Col>
                <Col span={14}>
                  <Form.Item name="department_id" label="Department">
                    <Select
                      placeholder="Select department"
                      allowClear
                      options={availableDepts.map((d) => ({ value: d.id, label: d.name }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="owner_user_id" label="Project Owner">
                    <UserSelect placeholder="Select owner" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="project_manager_id" label="Project Manager">
                    <UserSelect placeholder="Select manager" />
                  </Form.Item>
                </Col>
              </Row>

              {configMode === 'advanced' && (
                <Row gutter={12}>
                  <Col span={8}>
                    <Form.Item name="client_name" label="Client Name">
                      <Input placeholder="e.g. Acme Corp" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="estimation_unit" label="Estimation Unit">
                      <Select
                        options={[
                          { value: 'hours', label: 'Hours' },
                          { value: 'points', label: 'Story Points' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="auto_shift_mode" label="Auto-Shift Mode">
                      <Select
                        options={[
                          { value: 'flexible', label: 'Flexible' },
                          { value: 'strict', label: 'Strict' },
                          { value: 'off', label: 'Off' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              <Form.Item name="description" label="Description">
                <TextArea
                  rows={2}
                  placeholder="Scope, deliverables, key goals..."
                  className="rounded-lg"
                />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="start_date" label="Start Date">
                    <DatePicker className="w-full rounded-lg" format="DD-MM-YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="end_date" label="Due Date">
                    <DatePicker className="w-full rounded-lg" format="DD-MM-YYYY" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="project_status" label="Status">
                    <Select options={STATUS_OPTIONS} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="priority" label="Priority">
                    <Select options={PRIORITY_OPTIONS} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="methodology" label="Methodology">
                    <Select
                      options={[
                        { value: 'scrum', label: 'Scrum' },
                        { value: 'kanban', label: 'Kanban' },
                        { value: 'waterfall', label: 'Waterfall' },
                        { value: 'timeline_first', label: 'Timeline First' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="progress" label="Progress (%)">
                <Input type="number" min={0} max={100} placeholder="0–100" className="rounded-lg" />
              </Form.Item>
            </>
          )}

          <Divider className="my-3" />

          <div className="flex justify-end gap-2">
            <Button onClick={closeModal} className="rounded-lg">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="rounded-lg font-bold shadow-xs">
              {modalMode === 'edit' ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
