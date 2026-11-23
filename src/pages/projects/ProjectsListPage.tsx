import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
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
  Card,
  Statistic,
  Spin,
} from 'antd';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/hooks/useAuth';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import {
  useGetRawProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectStatsQuery,
  type BackendProject,
} from '@/store/api/projectApiSlice';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { EmployeeSelector } from '@/components/projects/EmployeeSelector';

const { TextArea } = Input;

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Finance', 'Operations'];

export function ProjectsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Live backend projects
  const {
    data: projects = [],
    isLoading: loadingProjects,
    refetch,
  } = useGetRawProjectsQuery(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
  const { data: statsData } = useGetProjectStatsQuery();
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // Sync org hierarchy into departmentService for dropdowns
  useEffect(() => {
    if (hierarchyData?.data) {
      departmentService.syncFromLiveUsers(
        hierarchyData.data.flatUsers || [],
        hierarchyData.data.departments || []
      );
    }
  }, [hierarchyData]);

  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState(false);

  const availableDepts = useMemo(() => {
    const live = departmentService.getDepartments();
    return live.length > 0 ? live.map((d) => d.name) : DEPARTMENTS;
  }, [hierarchyData]);

  // Client-side filter for search & dept (status handled server-side)
  const filteredProjects = useMemo(() => {
    return projects.filter((p: BackendProject) => {
      const name = p.project_name || '';
      const key = p.project_key || '';
      const dept = p.department_name || '';
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        key.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || dept === deptFilter;
      return matchSearch && matchDept;
    });
  }, [projects, search, deptFilter]);

  const handleCreateProject = async (values: {
    project_name: string;
    project_key?: string;
    description?: string;
    department_id?: number;
    owner_user_id?: number;
    project_manager_id?: number;
    start_date?: string;
    end_date?: string;
    methodology?: string;
  }) => {
    try {
      const derivedKey = (values.project_key?.trim() || values.project_name.slice(0, 4))
        .toUpperCase()
        .replace(/\s/g, '')
        .slice(0, 10);

      const created = await createProject({
        project_name: values.project_name.trim(),
        project_key: derivedKey,
        project_description: values.description || '',
        project_status: 'planning',
        department_id: values.department_id,
        owner_user_id: values.owner_user_id || (user?.id as number),
        project_manager_id:
          values.project_manager_id || values.owner_user_id || (user?.id as number),
        start_date: values.start_date,
        end_date: values.end_date,
        methodology: values.methodology || 'scrum',
        priority: 'Medium',
        health: 'on_track',
        visibility: 'team',
      }).unwrap();

      setShowModal(false);
      form.resetFields();
      message.success(`Project "${created.project_name}" created successfully!`);
      refetch();
      navigate(`/projects/${created.project_id}`);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to create project';
      message.error(msg);
    }
  };

  const handleDelete = async (projectId: number) => {
    try {
      await deleteProject(projectId).unwrap();
      message.success('Project deleted');
      refetch();
    } catch {
      message.error('Failed to delete project');
    }
  };

  // 4 Focused Summary Metrics: All Projects, Active, At Risk, Completed
  const statsProjects = statsData?.projects as Record<string, number> | undefined;
  const totalCount = statsProjects?.total ?? projects.length;
  const activeCount =
    statsProjects?.active ?? projects.filter((p) => p.project_status === 'active').length;
  const atRiskCount = projects.filter((p) => p.health === 'at_risk' || p.health === 'off_track').length;
  const completedCount =
    statsProjects?.completed ?? projects.filter((p) => p.project_status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <FolderKanban className="text-primary" size={24} />
            <span>Projects Workspace</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Portfolio lifecycle tracking, sprint execution, and automated departmental workflows.
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              methodology: 'scrum',
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
            });
            setShowModal(true);
          }}
          className="rounded-xl font-bold text-xs h-10 shadow-xs">
          Create Project
        </Button>
      </div>

      {/* Summary Cards (4 clean, uncluttered cards) */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border-border-subtle shadow-xs bg-card">
            <Statistic
              title={<span className="text-xs text-muted">All Projects</span>}
              value={totalCount}
              prefix={<FolderKanban size={16} className="text-primary mr-1" />}
              valueStyle={{ fontSize: 22, fontWeight: 800 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border-border-subtle shadow-xs bg-card">
            <Statistic
              title={<span className="text-xs text-muted">Active</span>}
              value={activeCount}
              prefix={<Clock size={16} className="text-emerald-500 mr-1" />}
              valueStyle={{ fontSize: 22, fontWeight: 800, color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border-border-subtle shadow-xs bg-card">
            <Statistic
              title={<span className="text-xs text-muted">At Risk / Overdue</span>}
              value={atRiskCount}
              prefix={<AlertTriangle size={16} className="text-amber-500 mr-1" />}
              valueStyle={{
                fontSize: 22,
                fontWeight: 800,
                color: atRiskCount > 0 ? '#faad14' : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="rounded-xl border-border-subtle shadow-xs bg-card">
            <Statistic
              title={<span className="text-xs text-muted">Completed</span>}
              value={completedCount}
              prefix={<CheckCircle2 size={16} className="text-blue-500 mr-1" />}
              valueStyle={{ fontSize: 22, fontWeight: 800, color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and View Switching Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <Space wrap size="middle" className="w-full md:w-auto">
          <Input
            prefix={<Search size={14} className="text-muted" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="rounded-xl w-full sm:w-64"
            allowClear
          />

          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            className="w-44"
            options={[
              { value: 'all', label: 'All Departments' },
              ...availableDepts.map((d) => ({ value: d, label: d })),
            ]}
          />

          <Radio.Group
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            buttonStyle="solid"
            size="small"
            className="overflow-x-auto">
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="active">Active</Radio.Button>
            <Radio.Button value="planning">Planning</Radio.Button>
            <Radio.Button value="on_hold">On Hold</Radio.Button>
            <Radio.Button value="completed">Completed</Radio.Button>
          </Radio.Group>
        </Space>

        {/* View Switcher: Table vs Grid */}
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          buttonStyle="solid"
          size="small">
          <Radio.Button value="table">
            <span className="flex items-center gap-1">
              <TableIcon size={13} /> Table
            </span>
          </Radio.Button>
          <Radio.Button value="grid">
            <span className="flex items-center gap-1">
              <LayoutGrid size={13} /> Grid
            </span>
          </Radio.Button>
        </Radio.Group>
      </div>

      {/* Main Content Area */}
      {loadingProjects ? (
        <div className="flex justify-center items-center py-24">
          <Spin size="large" tip="Loading projects..." />
        </div>
      ) : viewMode === 'table' ? (
        <ProjectTable
          projects={filteredProjects}
          loading={loadingProjects}
          onOpenProject={(proj) => navigate(`/projects/${proj.project_id}`)}
          onDeleteProject={handleDelete}
        />
      ) : (
        <Row gutter={[20, 20]}>
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

      {/* Create Project Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2">
            <Sparkles size={18} className="text-primary" />
            <span className="text-base font-black">Create New Project</span>
          </div>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        destroyOnClose
        centered
        width={580}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
          initialValues={{ methodology: 'scrum' }}
          className="pt-2">
          <Form.Item
            name="project_name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}>
            <Input placeholder="e.g. Cedar Client Portal & Billing Suite" className="rounded-xl" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="project_key"
                label="Project Key (2–5 chars)"
                rules={[{ required: true, message: 'Enter a project key' }]}>
                <Input
                  maxLength={10}
                  placeholder="e.g. CDR"
                  className="rounded-xl font-mono uppercase"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department_id" label="Department">
                <Select
                  placeholder="Select department"
                  allowClear
                  options={departmentService.getDepartments().map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="owner_user_id" label="Project Owner">
                <EmployeeSelector placeholder="Select Project Owner" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="project_manager_id" label="Project Manager">
                <EmployeeSelector placeholder="Select Delivery Manager" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Scope & Description">
            <TextArea
              rows={3}
              placeholder="Scope, deliverables, key targets..."
              className="rounded-xl"
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="start_date" label="Start Date">
                <Input type="date" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="Target Due Date">
                <Input type="date" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

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

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-4">
            <Button onClick={() => setShowModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              className="rounded-xl font-bold shadow-xs">
              Create Project
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
