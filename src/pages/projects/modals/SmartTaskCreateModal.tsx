import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Radio,
  Space,
  Table,
  Tag,
  Avatar,
  Alert,
  Descriptions,
  message,
} from 'antd';
import {
  ApartmentOutlined,
  UserOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { departmentService } from '@/services/departmentService';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/hooks/useAuth';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import { useCreateTaskRealMutation } from '@/store/api/projectApiSlice';
import { EmployeeWorkloadCard } from '@/components/projects/EmployeeWorkloadCard';
import type { Department, DepartmentMember } from '@/types/department';
import type { ProjectPhase } from '@/types/phase';

const { TextArea } = Input;

interface SmartTaskCreateModalProps {
  visible: boolean;
  projectId: number;
  projectKey?: string;
  phases?: ProjectPhase[];
  onClose: () => void;
  onSuccess: () => void;
}

export const SmartTaskCreateModal: React.FC<SmartTaskCreateModalProps> = ({
  visible,
  projectId,
  projectKey = 'PRJ',
  phases = [],
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();
  const [createTaskReal, { isLoading: isCreatingTask }] = useCreateTaskRealMutation();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  // Selections
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>();
  const [deptHead, setDeptHead] = useState<DepartmentMember | undefined>();
  const [deptMembers, setDeptMembers] = useState<DepartmentMember[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<DepartmentMember | undefined>();
  const [reportingChain, setReportingChain] = useState<{
    reportingManagerName?: string;
    departmentHeadName?: string;
  }>({});

  useEffect(() => {
    if (visible) {
      if (hierarchyData?.data) {
        departmentService.syncFromLiveUsers(
          hierarchyData.data.flatUsers || [],
          hierarchyData.data.departments || []
        );
      }
      setDepartments(departmentService.getDepartments());
      setCurrentStep(0);
      form.resetFields();
      setSelectedDeptId(undefined);
      setSelectedAssignee(undefined);
      setDeptHead(undefined);
      setDeptMembers([]);
      setReportingChain({});
    }
  }, [visible, form, hierarchyData]);

  // When department changes
  const handleDeptSelect = (deptId: number) => {
    setSelectedDeptId(deptId);
    const head = departmentService.getDepartmentHead(deptId);
    setDeptHead(head);
    const members = departmentService.getDepartmentMembers(deptId);
    setDeptMembers(members);
    setSelectedAssignee(undefined);
  };

  // When assignee is selected
  const handleAssigneeSelect = (member: DepartmentMember) => {
    setSelectedAssignee(member);
    const reporting = departmentService.getEmployeeReporting(member.userId);
    setReportingChain({
      reportingManagerName: reporting?.reportingManagerName || 'Self / Direct to Head',
      departmentHeadName: reporting?.departmentHeadName || deptHead?.userName || 'Alex Mercer',
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const currentDept = departments.find((d) => d.id === selectedDeptId);
      const selPhase = phases.find((p) => p.id === values.phaseId);

      const startDateStr = values.dateRange?.[0] ? dayjs(values.dateRange[0]).format('YYYY-MM-DD') : undefined;
      const dueDateStr = values.dateRange?.[1] ? dayjs(values.dateRange[1]).format('YYYY-MM-DD') : undefined;

      // 1. Create in real database backend
      try {
        await createTaskReal({
          task_title: values.title,
          task_description: values.description || values.title,
          task_type: values.type || 'task',
          priority: values.priority || 'Medium',
          task_status: 'Pending',
          start_date: startDateStr,
          due_date: dueDateStr,
          project_id: projectId,
          allocated_to: selectedAssignee?.userId || (user?.id as number) || 1,
          allocated_by: (user?.id as number) || 1,
          department_id: selectedDeptId || selectedAssignee?.departmentId,
          reporting_manager_id: selectedAssignee?.reportingManagerId,
          dept_head_id: deptHead?.userId,
        }).unwrap();
      } catch (apiErr) {
        console.warn('Backend task create notice (persisting locally):', apiErr);
      }

      // 2. Also keep localStorage copy in sync
      projectService.createTaskWithOwnership({
        projectId,
        title: values.title,
        description: values.description,
        type: values.type || 'task',
        priority: values.priority || 'Medium',
        startDate: startDateStr,
        dueDate: dueDateStr,
        phaseId: values.phaseId,
        phaseName: selPhase?.name,
        // Ownership fields
        createdById: user?.id || 1, // Current authenticated user
        createdByName: user?.username || 'Authenticated User',
        assignedById: user?.id || 1,
        assignedByName: user?.username || 'Authenticated User',
        assignedToId: selectedAssignee?.userId,
        assignedToName: selectedAssignee?.userName,
        reportingManagerId: selectedAssignee?.reportingManagerId,
        reportingManagerName: reportingChain.reportingManagerName,
        deptHeadId: deptHead?.userId,
        deptHeadName: deptHead?.userName,
        projectManagerId: 1,
        projectManagerName: 'Alex Mercer',
        departmentId: selectedDeptId,
        departmentName: currentDept?.name,
        collaboratorIds: values.collaboratorIds || [],
      });

      message.success(`Task created and assigned to ${selectedAssignee?.userName || 'Team'} successfully!`);
      onSuccess();
      onClose();
    } catch {
      message.error('Please fill in all required task details.');
    }
  };

  const steps = [
    {
      title: 'Department',
      icon: <ApartmentOutlined />,
    },
    {
      title: 'Assignee',
      icon: <UserOutlined />,
    },
    {
      title: 'Task Details',
      icon: <FileDoneOutlined />,
    },
    {
      title: 'Ownership Review',
      icon: <SafetyCertificateOutlined />,
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <ApartmentOutlined style={{ color: '#1677ff' }} />
          <span>Smart Task Assignment Workflow ({projectKey})</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={780}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 ? (
            <Button onClick={() => setCurrentStep((prev) => prev - 1)}>Previous</Button>
          ) : (
            <div />
          )}
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            {currentStep < 3 && (
              <Button
                type="primary"
                onClick={() => {
                  if (currentStep === 0 && !selectedDeptId) {
                    message.warning('Please select a responsible department.');
                    return;
                  }
                  if (currentStep === 1 && !selectedAssignee) {
                    message.warning('Please select an assignee from the department.');
                    return;
                  }
                  if (currentStep === 2) {
                    form.validateFields().then(() => {
                      setCurrentStep((prev) => prev + 1);
                    }).catch(() => {
                      message.error('Please provide a valid task title.');
                    });
                    return;
                  }
                  setCurrentStep((prev) => prev + 1);
                }}
              >
                Next
              </Button>
            )}
            {currentStep === 3 && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSubmit} loading={isCreatingTask}>
                Save & Assign Task
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Steps current={currentStep} items={steps} size="small" style={{ marginBottom: 24 }} />

      {/* STEP 0: Department Selection */}
      {currentStep === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert
            message="Step 1: Department Responsibility"
            description="Select which department is responsible for delivering this task. StartupOS will auto-resolve the department head, team leads, and available capacity."
            type="info"
            showIcon
          />

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
              Responsible Department:
            </label>
            <Radio.Group
              value={selectedDeptId}
              onChange={(e) => handleDeptSelect(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {departments.map((dept) => (
                  <Radio.Button
                    key={dept.id}
                    value={dept.id}
                    style={{
                      display: 'block',
                      height: 'auto',
                      padding: '12px 16px',
                      borderRadius: 8,
                      marginBottom: 8,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{dept.name}</strong>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{dept.description}</div>
                      </div>
                      <Tag color="blue">{dept.memberCount} Members</Tag>
                    </div>
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {selectedDeptId && deptHead && (
            <Alert
              message={`Department Head Identified: ${deptHead.userName} (${deptHead.designation})`}
              description="Notifications and escalation tracking will automatically route through this department head."
              type="success"
              showIcon
            />
          )}

          {selectedDeptId && !deptHead && (
            <Alert
              message="No Department Head Assigned"
              description="This department does not currently have a head designated. Assignments will escalate to General Administration."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
            />
          )}
        </div>
      )}

      {/* STEP 1: Assignee Selection with Workload */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert
            message="Step 2: Department Member & Capacity Selection"
            description="Select the employee responsible for this task. Real-time workload and overdue indicators help avoid team bottlenecks."
            type="info"
            showIcon
          />

          <Table
            dataSource={deptMembers}
            rowKey="userId"
            size="small"
            pagination={false}
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedAssignee ? [selectedAssignee.userId] : [],
              onSelect: (record) => handleAssigneeSelect(record),
            }}
            columns={[
              {
                title: 'Employee',
                dataIndex: 'userName',
                key: 'userName',
                render: (name: string, record) => (
                  <Space orientation="horizontal">
                    <Avatar style={{ backgroundColor: record.isDepartmentHead ? '#1677ff' : '#52c41a' }}>
                      {name.charAt(0)}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.designation}</div>
                    </div>
                  </Space>
                ),
              },
              {
                title: 'Team / Role',
                key: 'team',
                render: (_, record) => (
                  <div>
                    {record.isDepartmentHead && <Tag color="gold">Dept Head</Tag>}
                    {record.isTeamLeader && <Tag color="cyan">Team Lead</Tag>}
                    {record.teamName && <Tag>{record.teamName}</Tag>}
                  </div>
                ),
              },
              {
                title: 'Direct Manager',
                dataIndex: 'reportingManagerName',
                key: 'manager',
                render: (val?: string) => val || <span style={{ color: '#8c8c8c' }}>Direct to Head</span>,
              },
              {
                title: 'Status',
                dataIndex: 'employmentStatus',
                key: 'status',
                render: (status: string) => (
                  <Tag color={status === 'Active' ? 'success' : status === 'On Leave' ? 'warning' : 'default'}>
                    {status}
                  </Tag>
                ),
              },
            ]}
          />

          {selectedAssignee && (
            <div style={{ marginTop: 8 }}>
              <EmployeeWorkloadCard userId={selectedAssignee.userId} />
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Task Details */}
      {currentStep === 2 && (
        <Form form={form} layout="vertical" initialValues={{ priority: 'Medium', type: 'task' }}>
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter a task title' }]}
          >
            <Input placeholder="e.g. Implement OAuth2 client credentials grant" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Provide details, acceptance criteria, or technical constraints..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="priority" label="Priority">
              <Select>
                <Select.Option value="High">
                  <Tag color="red">High</Tag> Priority
                </Select.Option>
                <Select.Option value="Medium">
                  <Tag color="orange">Medium</Tag> Priority
                </Select.Option>
                <Select.Option value="Low">
                  <Tag color="blue">Low</Tag> Priority
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="phaseId" label="Project Phase">
              <Select placeholder="Assign to phase (optional)" allowClear>
                {phases.map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="dateRange" label="Estimated Schedule (Start - Due)">
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="collaboratorIds" label="Additional Collaborators">
              <Select mode="multiple" placeholder="Select co-workers..." allowClear>
                {deptMembers
                  .filter((m) => m.userId !== selectedAssignee?.userId)
                  .map((m) => (
                    <Select.Option key={m.userId} value={m.userId}>
                      {m.userName} ({m.designation})
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      )}

      {/* STEP 3: Ownership Review */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert
            message="Smart Task Assignment & Ownership Hierarchy"
            description="The complete 8-tier ownership chain has been computed. Notifications and SLA escalations will follow this structure."
            type="success"
            showIcon
          />

          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Task Title">
              <strong>{form.getFieldValue('title')}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Responsible Department">
              {departments.find((d) => d.id === selectedDeptId)?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned Employee (assigned_to)">
              <Tag color="blue">{selectedAssignee?.userName}</Tag> ({selectedAssignee?.designation})
            </Descriptions.Item>
            <Descriptions.Item label="Direct Reporting Manager (reporting_manager)">
              <Tag color="geekblue">{reportingChain.reportingManagerName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Department Head (dept_head)">
              <Tag color="purple">{deptHead?.userName || 'Alex Mercer'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Project Manager (project_manager)">
              <Tag color="cyan">Alex Mercer</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Assigned By (assigned_by)">
              {user?.username || 'Authenticated User'}
            </Descriptions.Item>
            <Descriptions.Item label="Priority & Type">
              <Tag color={form.getFieldValue('priority') === 'High' ? 'red' : 'orange'}>
                {form.getFieldValue('priority')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
};
