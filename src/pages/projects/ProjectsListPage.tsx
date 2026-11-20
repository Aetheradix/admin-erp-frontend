import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  ArrowRight,
  Building2,
  Sparkles,
} from 'lucide-react';
import {
  Modal,
  Input,
  Select,
  Button,
  Tag,
  Card,
  Row,
  Col,
  Space,
  Form,
  Radio,
  message,
} from 'antd';
import { projectService } from '@/services/projectService';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/hooks/useAuth';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import type { Project, ProjectMethodology, EstimationUnit, AutoShiftMode } from '@/types/project';

const { TextArea } = Input;

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Finance', 'Operations'];

const STATUS_COLORS: Record<string, string> = {
  active: 'green',
  planning: 'gold',
  on_hold: 'orange',
  completed: 'blue',
  archived: 'default',
};

export function ProjectsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();

  const [projects, setProjects] = useState<Project[]>(() => projectService.getProjects());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Synchronize live users and departments from backend into departmentService
  useEffect(() => {
    if (hierarchyData?.data) {
      departmentService.syncFromLiveUsers(
        hierarchyData.data.flatUsers || [],
        hierarchyData.data.departments || []
      );
    }
  }, [hierarchyData]);

  // Form for New Project Modal
  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState(false);

  const availableDepts = useMemo(() => {
    const live = departmentService.getDepartments();
    return live.length > 0 ? live.map((d) => d.name) : DEPARTMENTS;
  }, []);

  const eligibleEmployees = useMemo(() => {
    return departmentService.getAllEmployees();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.key.toLowerCase().includes(search.toLowerCase()) ||
        (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchDept = deptFilter === 'all' || p.departmentName === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [projects, search, statusFilter, deptFilter]);

  const handleCreateProject = (values: {
    name: string;
    key?: string;
    clientName?: string;
    departmentName: string;
    ownerUserId?: number;
    projectManagerId?: number;
    description?: string;
    startDate?: string;
    targetDate?: string;
    methodology: ProjectMethodology;
    estimationUnit: EstimationUnit;
    autoShiftMode: AutoShiftMode;
  }) => {
    const derivedKey = (values.key?.trim() || values.name.slice(0, 3)).toUpperCase();
    const selDept = departmentService.getDepartments().find((d) => d.name === values.departmentName);
    const deptHead = selDept ? departmentService.getDepartmentHead(selDept.id) : undefined;
    const owner = values.ownerUserId ? departmentService.getEmployeeById(values.ownerUserId) : undefined;
    const pm = values.projectManagerId ? departmentService.getEmployeeById(values.projectManagerId) : undefined;

    const created = projectService.createProject({
      name: values.name.trim(),
      key: derivedKey,
      clientName: values.clientName || 'Internal Client',
      departmentId: selDept?.id,
      departmentName: values.departmentName,
      createdById: user?.id || 1,
      createdByName: user?.username || 'Authenticated User',
      ownerUserId: owner?.userId || user?.id || 1,
      ownerName: owner?.userName || user?.username || 'Authenticated User',
      projectManagerId: pm?.userId || owner?.userId || user?.id || 1,
      projectManagerName: pm?.userName || owner?.userName || user?.username || 'Authenticated User',
      deptHeadId: deptHead?.userId,
      deptHeadName: deptHead?.userName,
      description: values.description || '',
      startDate: values.startDate || new Date().toISOString().split('T')[0],
      targetDate:
        values.targetDate ||
        new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      methodology: values.methodology || 'scrum',
      estimationUnit: values.estimationUnit || 'hours',
      autoShiftMode: values.autoShiftMode || 'flexible',
      status: 'planning',
      members: [
        {
          userId: user?.id || 1,
          name: user?.username || 'Authenticated User',
          email: user?.email || 'admin@startupos.io',
          role: 'lead',
        },
      ],
    });

    setProjects(projectService.getProjects());
    setShowModal(false);
    form.resetFields();
    message.success(`Project ${created.name} (${created.key}) created with full ownership records!`);
    navigate(`/projects/${created.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <FolderKanban className="text-primary" size={24} />
            <span>Projects & Pipelines</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Portfolio lifecycle tracking, Gantt scheduling, sprint execution, and automated departmental workflows.
          </p>
        </div>

        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              departmentName: 'Engineering',
              methodology: 'scrum',
              estimationUnit: 'hours',
              autoShiftMode: 'flexible',
              startDate: new Date().toISOString().split('T')[0],
              targetDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
            });
            setShowModal(true);
          }}
          className="rounded-xl font-bold text-xs h-10 shadow-xs">
          New Project
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <Space wrap size="middle" className="w-full md:w-auto">
          <Input
            prefix={<Search size={14} className="text-muted" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, key, client..."
            className="rounded-xl w-full sm:w-64"
            allowClear
          />

          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            className="w-44"
            options={[
              { value: 'all', label: 'All Departments' },
              ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
            ]}
          />
        </Space>

        <Radio.Group
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          buttonStyle="solid"
          className="overflow-x-auto">
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="active">Active</Radio.Button>
          <Radio.Button value="planning">Planning</Radio.Button>
          <Radio.Button value="on_hold">On Hold</Radio.Button>
          <Radio.Button value="completed">Completed</Radio.Button>
        </Radio.Group>
      </div>

      {/* Ant Design Projects Grid */}
      <Row gutter={[20, 20]}>
        {filteredProjects.map((project) => {
          const statusColor = STATUS_COLORS[project.status] || 'default';

          return (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Card
                hoverable
                onClick={() => navigate(`/projects/${project.id}`)}
                className="h-full rounded-2xl border-border-subtle bg-surface-subtle transition-all cursor-pointer group shadow-xs hover:border-primary/50"
                styles={{
                  body: {
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  },
                }}>
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Space size={6}>
                      <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                        {project.key}
                      </span>
                      {project.departmentName && (
                        <Tag
                          bordered={false}
                          className="flex items-center gap-1 font-semibold text-[11px] m-0 bg-surface-elevated text-muted">
                          <Building2 size={11} className="text-primary" />
                          {project.departmentName}
                        </Tag>
                      )}
                    </Space>

                    <Tag
                      color={statusColor}
                      className="font-bold text-[10px] uppercase rounded-md m-0">
                      {project.status.replace('_', ' ')}
                    </Tag>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 mb-4">
                    {project.description || project.clientName || 'General Project'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Tag bordered={false} className="text-[10px] m-0 text-muted bg-surface-elevated">
                      {project.methodology.replace('_', ' ')}
                    </Tag>
                    <Tag bordered={false} className="text-[10px] m-0 text-muted bg-surface-elevated">
                      {project.estimationUnit}
                    </Tag>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar size={13} className="text-primary" />
                    Due {project.targetDate}
                  </span>

                  <span className="flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Ant Design Modal for Creating Project */}
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
        width={560}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
          initialValues={{
            departmentName: 'Engineering',
            methodology: 'scrum',
            estimationUnit: 'hours',
            autoShiftMode: 'flexible',
          }}
          className="pt-2">
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}>
            <Input placeholder="e.g. Cedar Client Portal & Billing Suite" className="rounded-xl" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="key"
                label="Project Key (2-5 uppercase chars)"
                rules={[{ required: true, message: 'Please enter project key' }]}>
                <Input
                  maxLength={5}
                  placeholder="e.g. CDR"
                  className="rounded-xl font-mono uppercase"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clientName" label="Client / Stakeholder">
                <Input placeholder="e.g. Cedar Capital Group" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="departmentName"
                label="Responsible Department"
                rules={[{ required: true, message: 'Select a department' }]}>
                <Select
                  className="w-full"
                  options={availableDepts.map((dept) => ({ value: dept, label: dept }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ownerUserId" label="Project Owner">
                <Select
                  placeholder="Select Project Owner"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={eligibleEmployees.map((e) => ({
                    value: e.userId,
                    label: `${e.userName} (${e.designation} - ${e.departmentName})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="projectManagerId" label="Project Manager / Delivery Lead">
                <Select
                  placeholder="Select Delivery Manager"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={eligibleEmployees.map((e) => ({
                    value: e.userId,
                    label: `${e.userName} (${e.designation})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <span className="font-semibold text-primary block mb-0.5">Automated Identity</span>
                <span className="text-muted">Creator: </span>
                <span className="font-bold">{user?.username || 'Current User'}</span>
              </div>
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
              <Form.Item name="startDate" label="Start Date">
                <Input type="date" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetDate" label="Target Due Date">
                <Input type="date" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="methodology" label="Methodology">
                <Select
                  options={[
                    { value: 'scrum', label: 'Scrum' },
                    { value: 'kanban', label: 'Kanban' },
                    { value: 'timeline_first', label: 'Timeline First' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="estimationUnit" label="Unit">
                <Select
                  options={[
                    { value: 'hours', label: 'Hours' },
                    { value: 'points', label: 'Points' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="autoShiftMode" label="Auto Shift">
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

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-4">
            <Button onClick={() => setShowModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="rounded-xl font-bold shadow-xs">
              Create Project
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
