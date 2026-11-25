import { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Tabs,
  Typography,
  Space,
  Empty,
  Select,
} from 'antd';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  User,
  Building2,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/hooks/useAuth';
import type { Project, ProjectTask } from '@/types/project';

const { Title, Paragraph } = Typography;

export default function ProjectMonitoringDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'my_work' | 'dept_tasks' | 'pm_view' | 'admin_overview'
  >('my_work');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  const allProjects = useMemo(() => projectService.getProjects(), []);
  const allTasks = useMemo(() => projectService.getAllTasks(), []);
  const allDepartments = useMemo(() => departmentService.getDepartments(), []);

  // Filter tasks for current logged-in employee
  const currentUserId = user?.id || 1;
  const myTasks = useMemo(() => {
    return allTasks.filter(
      (t) =>
        t.assignedToId === currentUserId ||
        t.assigneeIds?.includes(currentUserId) ||
        t.createdById === currentUserId ||
        t.collaboratorIds?.includes(currentUserId)
    );
  }, [allTasks, currentUserId]);

  const myAssignedTasks = myTasks.filter(
    (t) => t.assignedToId === currentUserId || t.assigneeIds?.includes(currentUserId)
  );
  const myCreatedTasks = myTasks.filter((t) => t.createdById === currentUserId);
  const myPendingTasks = myAssignedTasks.filter(
    (t) => t.status !== 'Done' && t.status !== 'Completed'
  );
  const myCompletedTasks = myAssignedTasks.filter(
    (t) => t.status === 'Done' || t.status === 'Completed'
  );

  // Filter tasks for department view
  const userDept = user?.department || 'Engineering';
  const deptTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (selectedDeptFilter === 'all') {
        return t.departmentName?.toLowerCase() === userDept.toLowerCase() || !t.departmentName;
      }
      return t.departmentName === selectedDeptFilter;
    });
  }, [allTasks, userDept, selectedDeptFilter]);

  // Filter projects managed by user
  const myManagedProjects = useMemo(() => {
    return allProjects.filter(
      (p) =>
        p.ownerUserId === currentUserId ||
        p.leadUserId === currentUserId ||
        p.createdById === currentUserId
    );
  }, [allProjects, currentUserId]);

  // Overall organization metrics
  const orgTotalProjects = allProjects.length;
  const orgActiveProjects = allProjects.filter((p) => p.status === 'active').length;
  const orgTotalTasks = allTasks.length;
  const orgCompletedTasks = allTasks.filter(
    (t) => t.status === 'Done' || t.status === 'Completed'
  ).length;

  const taskTableColumns = [
    {
      title: 'Task Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ProjectTask) => (
        <div>
          <span className="font-bold text-foreground text-xs block">{text}</span>
          <span className="text-[11px] text-muted">Phase: {record.phaseName || 'General'}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const isDone = status === 'Done' || status === 'Completed';
        return <Tag color={isDone ? 'green' : 'blue'}>{status}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (p: string) => (
        <Tag color={p === 'High' ? 'red' : p === 'Medium' ? 'orange' : 'blue'}>{p}</Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'department',
      render: (val?: string) => <Tag color="geekblue">{val || 'Engineering'}</Tag>,
    },
    {
      title: 'Assignee',
      dataIndex: 'assignedToName',
      key: 'assignee',
      render: (val?: string, record?: ProjectTask) => (
        <span className="text-xs font-semibold">
          {val || record?.assigneeNames?.[0] || 'Alex Mercer'}
        </span>
      ),
    },
    {
      title: 'Direct Manager',
      dataIndex: 'reportingManagerName',
      key: 'manager',
      render: (val?: string) => <span className="text-xs text-muted">{val || 'Director'}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (val?: string) => <span className="text-xs text-muted">{val || '—'}</span>,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          <FolderKanban size={22} className="inline text-primary mr-2" />
          Project & Task Monitoring Suite
        </Title>
        <Paragraph type="secondary">
          Live multi-tier monitoring: personal assignments, departmental task queues, delivery
          manager oversight, and organization-wide KPI health.
        </Paragraph>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as any)}
        items={[
          {
            key: 'my_work',
            label: (
              <span className="flex items-center gap-1.5 font-bold text-xs">
                <User size={14} /> My Work ({myAssignedTasks.length})
              </span>
            ),
          },
          {
            key: 'dept_tasks',
            label: (
              <span className="flex items-center gap-1.5 font-bold text-xs">
                <Building2 size={14} /> Department Tasks ({deptTasks.length})
              </span>
            ),
          },
          {
            key: 'pm_view',
            label: (
              <span className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles size={14} /> Project Manager View ({myManagedProjects.length})
              </span>
            ),
          },
          {
            key: 'admin_overview',
            label: (
              <span className="flex items-center gap-1.5 font-bold text-xs">
                <CheckSquare size={14} /> Organization Admin Overview
              </span>
            ),
          },
        ]}
      />

      {/* TAB 1: MY WORK (Employee Dashboard) */}
      {activeTab === 'my_work' && (
        <div className="space-y-6 mt-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Assigned to Me"
                  value={myAssignedTasks.length}
                  prefix={<CheckSquare className="text-primary inline mr-1" size={16} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Pending Action"
                  value={myPendingTasks.length}
                  valueStyle={{ color: myPendingTasks.length > 0 ? '#faad14' : '#52c41a' }}
                  prefix={<Clock className="text-amber-500 inline mr-1" size={16} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Completed Tasks"
                  value={myCompletedTasks.length}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircle2 className="text-emerald-500 inline mr-1" size={16} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Tasks Created by Me"
                  value={myCreatedTasks.length}
                  prefix={<User className="text-primary inline mr-1" size={16} />}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title={
              <Space>
                <CheckSquare size={16} className="text-primary" />
                <span className="text-sm font-black">My Active Assignments</span>
              </Space>
            }
            bordered={false}
            className="rounded-2xl shadow-xs">
            {myAssignedTasks.length === 0 ? (
              <Empty description="You have no pending tasks assigned at this moment." />
            ) : (
              <Table
                dataSource={myAssignedTasks}
                columns={taskTableColumns}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                size="small"
              />
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: DEPARTMENT TASKS */}
      {activeTab === 'dept_tasks' && (
        <div className="space-y-6 mt-4">
          <div className="flex justify-between items-center bg-surface-subtle p-3 rounded-2xl border border-border-subtle">
            <span className="text-xs font-semibold text-muted">Filter Department:</span>
            <Select
              value={selectedDeptFilter}
              onChange={setSelectedDeptFilter}
              className="w-56"
              options={[
                { value: 'all', label: `My Department (${userDept})` },
                ...allDepartments.map((d) => ({ value: d.name, label: d.name })),
              ]}
            />
          </div>

          <Card
            title={
              <Space>
                <Building2 size={16} className="text-primary" />
                <span className="text-sm font-black">Department Operational Queue</span>
              </Space>
            }
            bordered={false}
            className="rounded-2xl shadow-xs">
            <Table
              dataSource={deptTasks}
              columns={taskTableColumns}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              size="small"
            />
          </Card>
        </div>
      )}

      {/* TAB 3: PROJECT MANAGER VIEW */}
      {activeTab === 'pm_view' && (
        <div className="space-y-6 mt-4">
          <Row gutter={[16, 16]}>
            {myManagedProjects.map((p) => {
              const projTasks = allTasks.filter((t) => t.projectId === p.id);
              const doneCount = projTasks.filter(
                (t) => t.status === 'Done' || t.status === 'Completed'
              ).length;
              const pct =
                projTasks.length > 0 ? Math.round((doneCount / projTasks.length) * 100) : 0;

              return (
                <Col xs={24} md={12} key={p.id}>
                  <Card
                    bordered={false}
                    className="rounded-2xl shadow-xs border border-border-subtle">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                          {p.key}
                        </span>
                        <h4 className="text-sm font-bold text-foreground mt-1">{p.name}</h4>
                      </div>
                      <Tag color="green">{p.status}</Tag>
                    </div>

                    <div className="text-xs text-muted space-y-1 mb-3">
                      <div>
                        Owner:{' '}
                        <span className="font-semibold text-foreground">
                          {p.ownerName || p.leadName}
                        </span>
                      </div>
                      <div>
                        Department:{' '}
                        <span className="font-semibold text-foreground">
                          {p.departmentName || 'Engineering'}
                        </span>
                      </div>
                      <div>
                        Delivery Target:{' '}
                        <span className="font-semibold text-foreground">{p.targetDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span>Delivery Progress</span>
                      <span>
                        {pct}% ({doneCount}/{projTasks.length})
                      </span>
                    </div>
                    <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {/* TAB 4: ORG ADMIN DASHBOARD */}
      {activeTab === 'admin_overview' && (
        <div className="space-y-6 mt-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Total Portfolio Projects"
                  value={orgTotalProjects}
                  prefix={<FolderKanban className="text-primary inline mr-1" size={16} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Active Running Projects"
                  value={orgActiveProjects}
                  prefix={<Sparkles className="text-primary inline mr-1" size={16} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Total System Tasks"
                  value={orgTotalTasks}
                  prefix={<CheckSquare className="text-primary inline mr-1" size={16} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="rounded-2xl shadow-xs">
                <Statistic
                  title="Total Completed"
                  value={orgCompletedTasks}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircle2 className="text-emerald-500 inline mr-1" size={16} />}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title={
              <Space>
                <FolderKanban size={16} className="text-primary" />
                <span className="text-sm font-black">
                  All Organization Projects & Governance Ownership
                </span>
              </Space>
            }
            bordered={false}
            className="rounded-2xl shadow-xs">
            <Table
              dataSource={allProjects}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              size="small"
              columns={[
                {
                  title: 'Project Key & Name',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name: string, record: Project) => (
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">{record.key}</span>
                      <div className="font-semibold text-xs">{name}</div>
                    </div>
                  ),
                },
                {
                  title: 'Department',
                  dataIndex: 'departmentName',
                  key: 'dept',
                  render: (val?: string) => <Tag color="cyan">{val || 'Engineering'}</Tag>,
                },
                {
                  title: 'Project Owner',
                  dataIndex: 'ownerName',
                  key: 'owner',
                  render: (val?: string, record?: Project) => (
                    <span className="text-xs font-semibold">
                      {val || record?.leadName || 'Alex Mercer'}
                    </span>
                  ),
                },
                {
                  title: 'Project Manager',
                  dataIndex: 'projectManagerName',
                  key: 'pm',
                  render: (val?: string, record?: Project) => (
                    <span className="text-xs text-muted">
                      {val || record?.leadName || 'Alex Mercer'}
                    </span>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => <Tag color="green">{status}</Tag>,
                },
                {
                  title: 'Target Date',
                  dataIndex: 'targetDate',
                  key: 'targetDate',
                },
              ]}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
