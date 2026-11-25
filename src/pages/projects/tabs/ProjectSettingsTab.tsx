import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Table,
  Tag,
  Avatar,
  Space,
  Popconfirm,
  Modal,
  message,
} from 'antd';
import { Settings, UserPlus, Trash2, AlertTriangle } from 'lucide-react';
import {
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useTransferOwnershipMutation,
  type BackendProject,
} from '@/store/api/projectApiSlice';
import { departmentService } from '@/services/departmentService';
import { EmployeeSelector } from '@/components/projects/EmployeeSelector';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

interface ProjectSettingsTabProps {
  project: BackendProject;
  onProjectUpdated: () => void;
}

export const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({
  project,
  onProjectUpdated,
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
  const [addMemberMutation, { isLoading: addingMember }] = useAddProjectMemberMutation();
  const [removeMemberMutation] = useRemoveProjectMemberMutation();
  const [transferOwnershipMutation, { isLoading: transferring }] = useTransferOwnershipMutation();

  const { data: members = [], refetch: refetchMembers } = useGetProjectMembersQuery(
    project.project_id
  );

  // Add Member Modal State
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [selectedRole, setSelectedRole] = useState<string>('member');

  // Transfer Ownership Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<number | undefined>();
  const [transferReason, setTransferReason] = useState('');

  const departments = departmentService.getDepartments();

  const handleUpdateGeneral = async (values: Partial<BackendProject>) => {
    try {
      await updateProject({
        id: project.project_id,
        data: values,
      }).unwrap();
      message.success('Project settings saved successfully');
      onProjectUpdated();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to update project';
      message.error(msg);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      message.error('Please select an employee');
      return;
    }
    try {
      await addMemberMutation({
        projectId: project.project_id,
        user_id: selectedUserId,
        role: selectedRole,
      }).unwrap();
      message.success('Team member added');
      setShowAddMember(false);
      setSelectedUserId(undefined);
      refetchMembers();
    } catch {
      message.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await removeMemberMutation({
        projectId: project.project_id,
        userId,
      }).unwrap();
      message.success('Member removed');
      refetchMembers();
    } catch {
      message.error('Failed to remove member');
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerId || !transferReason.trim()) {
      message.error('Please select a new owner and state the business reason');
      return;
    }
    try {
      await transferOwnershipMutation({
        projectId: project.project_id,
        new_owner_id: newOwnerId,
        reason: transferReason.trim(),
      }).unwrap();
      message.success('Project ownership transferred successfully');
      setShowTransferModal(false);
      setTransferReason('');
      setNewOwnerId(undefined);
      onProjectUpdated();
    } catch {
      message.error('Failed to transfer ownership');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(project.project_id).unwrap();
      message.success('Project deleted successfully');
      navigate('/projects');
    } catch {
      message.error('Failed to delete project');
    }
  };

  const memberColumns = [
    {
      title: 'Member',
      key: 'name',
      render: (_: unknown, record: any) => {
        const initials = (record.name || 'User')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        return (
          <Space size={8}>
            <Avatar
              size="small"
              src={record.image_url}
              className="bg-primary/20 text-primary font-bold text-xs">
              {initials}
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">{record.name}</span>
              <span className="text-[10px] text-muted-foreground">{record.email}</span>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Department & Designation',
      key: 'dept',
      render: (_: unknown, record: any) => (
        <span className="text-xs text-muted-foreground">
          {record.designation || 'Staff'} {record.department ? `· ${record.department}` : ''}
        </span>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag
          color={role === 'lead' ? 'gold' : role === 'manager' ? 'blue' : 'default'}
          className="text-xs font-semibold capitalize rounded-md">
          {role || 'member'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: any) => (
        <Popconfirm
          title="Remove Member"
          description={`Remove ${record.name} from this project?`}
          onConfirm={() => handleRemoveMember(record.user_id)}
          okText="Remove"
          okButtonProps={{ danger: true }}>
          <Button type="text" danger size="small" icon={<Trash2 size={13} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* General Settings Card */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            <span className="font-bold text-sm">General Settings</span>
          </div>
        }
        className="rounded-2xl border-border-subtle bg-card shadow-xs">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            project_name: project.project_name,
            project_key: project.project_key,
            project_description: project.project_description,
            project_status: project.project_status || 'planning',
            health: project.health || 'on_track',
            department_id: project.department_id,
            start_date: project.start_date ? String(project.start_date).split('T')[0] : undefined,
            end_date: project.end_date
              ? String(project.end_date).split('T')[0]
              : project.deadline
                ? String(project.deadline).split('T')[0]
                : undefined,
            methodology: project.methodology || 'scrum',
          }}
          onFinish={handleUpdateGeneral}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="project_name"
                label="Project Name"
                rules={[{ required: true, message: 'Please enter project name' }]}>
                <Input className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="project_key"
                label="Project Key"
                rules={[{ required: true, message: 'Please enter project key' }]}>
                <Input maxLength={10} className="rounded-xl font-mono uppercase" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="project_description" label="Scope & Description">
            <TextArea rows={3} className="rounded-xl" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="project_status" label="Status">
                <Select
                  options={[
                    { value: 'planning', label: 'Planning' },
                    { value: 'active', label: 'Active' },
                    { value: 'on_hold', label: 'On Hold' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="health" label="Health">
                <Select
                  options={[
                    { value: 'on_track', label: 'On Track (Green)' },
                    { value: 'at_risk', label: 'At Risk (Amber)' },
                    { value: 'off_track', label: 'Off Track (Red)' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department_id" label="Department">
                <Select
                  allowClear
                  options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="start_date" label="Start Date">
                <Input type="date" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="end_date" label="Target Due Date">
                <Input type="date" className="rounded-xl" />
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

          <div className="flex justify-end pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              className="rounded-xl font-bold">
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>

      {/* Project Team & Member Management */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">Project Members ({members.length})</span>
            <Button
              type="primary"
              size="small"
              icon={<UserPlus size={14} />}
              onClick={() => setShowAddMember(true)}
              className="rounded-xl font-bold text-xs">
              Add Member
            </Button>
          </div>
        }
        className="rounded-2xl border-border-subtle bg-card shadow-xs">
        <Table
          columns={memberColumns}
          dataSource={members}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Danger Zone */}
      <Card
        title={
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={16} />
            <span className="font-bold text-sm">Danger Zone</span>
          </div>
        }
        className="rounded-2xl border border-destructive/20 bg-destructive/5 shadow-xs">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-destructive/10">
            <div>
              <span className="text-xs font-bold text-foreground block">Transfer Ownership</span>
              <span className="text-[11px] text-muted-foreground">
                Current owner: <strong>{project.owner_name || 'System Admin'}</strong>
              </span>
            </div>
            <Button
              onClick={() => setShowTransferModal(true)}
              className="rounded-xl text-xs font-bold">
              Transfer Ownership
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-destructive block">Delete Project</span>
              <span className="text-[11px] text-muted-foreground">
                Soft-deletes this project and archives its tasks. Recoverable by administrator.
              </span>
            </div>
            <Popconfirm
              title="Delete Project"
              description={`Are you sure you want to delete "${project.project_name}"?`}
              onConfirm={handleDeleteProject}
              okText="Delete"
              okButtonProps={{ danger: true }}>
              <Button danger loading={deleting} className="rounded-xl text-xs font-bold">
                Delete Project
              </Button>
            </Popconfirm>
          </div>
        </div>
      </Card>

      {/* Add Member Modal */}
      <Modal
        title="Add Project Member"
        open={showAddMember}
        onCancel={() => setShowAddMember(false)}
        onOk={handleAddMember}
        confirmLoading={addingMember}
        okText="Add Member"
        destroyOnClose>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Select Employee</label>
            <EmployeeSelector
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Search by name, role or dept..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Project Role</label>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              className="w-full"
              options={[
                { value: 'lead', label: 'Lead / Coordinator' },
                { value: 'manager', label: 'Project Manager' },
                { value: 'member', label: 'Contributor / Member' },
                { value: 'viewer', label: 'Viewer (Read Only)' },
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* Transfer Ownership Modal */}
      <Modal
        title="Transfer Project Ownership"
        open={showTransferModal}
        onCancel={() => setShowTransferModal(false)}
        onOk={handleTransferOwnership}
        confirmLoading={transferring}
        okText="Transfer Ownership"
        destroyOnClose>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">New Project Owner</label>
            <EmployeeSelector
              value={newOwnerId}
              onChange={setNewOwnerId}
              placeholder="Select new owner..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">
              Business Justification / Reason *
            </label>
            <TextArea
              rows={3}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="e.g. Leadership handover, team restructuring..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
