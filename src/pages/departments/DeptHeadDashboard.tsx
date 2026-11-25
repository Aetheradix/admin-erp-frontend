import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Collapse,
  Button,
  Avatar,
  Space,
  Typography,
  Breadcrumb,
  Alert,
  Empty,
  Badge,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowLeftOutlined,
  ApartmentOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { departmentService } from '@/services/departmentService';
import { projectService } from '@/services/projectService';
import type { Department, DepartmentMember, EmployeeWorkload } from '@/types/department';
import type { ProjectTask } from '@/types/project';

const { Title, Text } = Typography;

export default function DeptHeadDashboard() {
  const { deptId } = useParams<{ deptId: string }>();
  const navigate = useNavigate();

  const [department, setDepartment] = useState<Department | undefined>();
  const [deptHead, setDeptHead] = useState<DepartmentMember | undefined>();
  const [workloads, setWorkloads] = useState<EmployeeWorkload[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);

  useEffect(() => {
    if (deptId) {
      const id = parseInt(deptId, 10);
      const dept = departmentService.getDepartmentById(id);
      setDepartment(dept);
      setDeptHead(departmentService.getDepartmentHead(id));
      setWorkloads(departmentService.getWorkloadsForDept(id));
      const allTasks = projectService.getAllTasks();
      setTasks(allTasks.filter((t: ProjectTask) => t.departmentId === id || !t.departmentId));
    }
  }, [deptId]);

  if (!department) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Department not found" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/departments')}>
            Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  // Aggregate Metrics
  const totalTasks = workloads.reduce((sum, w) => sum + w.openTasks, 0);
  const totalOverdue = workloads.reduce((sum, w) => sum + w.overdueTasks, 0);
  const totalCompleted = workloads.reduce((sum, w) => sum + w.completedThisWeek, 0);
  const averageWorkload =
    workloads.length > 0
      ? Math.round(workloads.reduce((sum, w) => sum + w.workloadScore, 0) / workloads.length)
      : 0;

  const getTagColor = (label: string) => {
    switch (label) {
      case 'Light':
        return 'success';
      case 'Moderate':
        return 'processing';
      case 'Heavy':
        return 'warning';
      case 'Overloaded':
        return 'error';
      default:
        return 'default';
    }
  };

  const workloadColumns = [
    {
      title: 'Employee',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string, record: EmployeeWorkload) => (
        <Space>
          <Avatar
            style={{ backgroundColor: record.userId === deptHead?.userId ? '#722ed1' : '#1677ff' }}>
            {name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>
              {name} {record.userId === deptHead?.userId && <Tag color="purple">Dept Head</Tag>}
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.designation}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Open Tasks',
      dataIndex: 'openTasks',
      key: 'openTasks',
      render: (val: number) => (
        <Badge count={val} overflowCount={99} style={{ backgroundColor: '#108ee9' }} />
      ),
    },
    {
      title: 'Overdue',
      dataIndex: 'overdueTasks',
      key: 'overdueTasks',
      render: (val: number) =>
        val > 0 ? (
          <Tag color="red" icon={<FireOutlined />}>
            {val} Overdue
          </Tag>
        ) : (
          <Tag color="green">0</Tag>
        ),
    },
    {
      title: 'Done (This Wk)',
      dataIndex: 'completedThisWeek',
      key: 'completedThisWeek',
      render: (val: number) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{val}</span>,
    },
    {
      title: 'Active Projects',
      dataIndex: 'activeProjects',
      key: 'activeProjects',
    },
    {
      title: 'Capacity Utilization',
      dataIndex: 'workloadScore',
      key: 'workloadScore',
      width: 200,
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          status={score > 75 ? 'exception' : score > 50 ? 'normal' : 'success'}
        />
      ),
    },
    {
      title: 'Workload Status',
      dataIndex: 'workloadLabel',
      key: 'workloadLabel',
      render: (label: string) => <Tag color={getTagColor(label)}>{label}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/departments')}>Departments</a> },
          { title: department.name },
        ]}
      />

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #f0f0f0',
        }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <ApartmentOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            {department.name} — Department Head Dashboard
          </Title>
          <Text type="secondary">{department.description}</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Department Head
          </Text>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{deptHead?.userName || 'Alex Mercer'}</div>
          <Tag color="purple">{deptHead?.designation || 'VP'}</Tag>
        </div>
      </div>

      {totalOverdue > 0 && (
        <Alert
          message={`${totalOverdue} Tasks Overdue Across Department`}
          description="Attention required: Overdue deliverables may breach project milestone SLAs. Review individual staff workloads below."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 20 }}
        />
      )}

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Active Staff Tasks"
              value={totalTasks}
              prefix={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Overdue Tasks"
              value={totalOverdue}
              valueStyle={{ color: totalOverdue > 0 ? '#cf1322' : '#3f8600' }}
              prefix={<FireOutlined style={{ color: '#cf1322' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Completed This Week"
              value={totalCompleted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Avg Capacity Utilization"
              value={averageWorkload}
              suffix="%"
              prefix={<ApartmentOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Employee Workload Table */}
      <Card
        title="Department Capacity & Workload Balance"
        bordered={false}
        style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Table
          dataSource={workloads}
          columns={workloadColumns}
          rowKey="userId"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Task Delegation & Oversight Accordion */}
      <Card
        title="Active Task Allocations by Staff Member"
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Collapse
          defaultActiveKey={workloads.slice(0, 2).map((w) => String(w.userId))}
          items={workloads.map((w) => {
            const memberTasks = tasks.filter(
              (t) => t.assignedToId === w.userId || t.assigneeIds?.includes(w.userId)
            );
            return {
              key: String(w.userId),
              label: (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    paddingRight: 16,
                  }}>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
                      {w.userName.charAt(0)}
                    </Avatar>
                    <strong>{w.userName}</strong>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>({w.designation})</span>
                  </Space>
                  <Space>
                    <Tag color={getTagColor(w.workloadLabel)}>{w.workloadLabel}</Tag>
                    <Badge
                      count={memberTasks.length}
                      overflowCount={99}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </Space>
                </div>
              ),
              children: (
                <Table
                  dataSource={memberTasks}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'Task Title',
                      dataIndex: 'title',
                      key: 'title',
                      render: (text: string) => <strong>{text}</strong>,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => <Tag color="blue">{status}</Tag>,
                    },
                    {
                      title: 'Priority',
                      dataIndex: 'priority',
                      key: 'priority',
                      render: (p: string) => (
                        <Tag color={p === 'High' ? 'red' : p === 'Medium' ? 'orange' : 'blue'}>
                          {p}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Direct Manager',
                      dataIndex: 'reportingManagerName',
                      key: 'manager',
                      render: (val?: string) => val || 'Alex Mercer',
                    },
                    {
                      title: 'Due Date',
                      dataIndex: 'dueDate',
                      key: 'dueDate',
                      render: (val?: string) => val || '—',
                    },
                  ]}
                />
              ),
            };
          })}
        />
      </Card>
    </div>
  );
}
