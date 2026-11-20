import { useState, useMemo } from 'react';
import type { Project, ProjectTask, Milestone } from '@/types/project';
import type { TaskStatus } from '@/types/taskStatus';
import type { ProjectPhase } from '@/types/phase';
import { projectService } from '@/services/projectService';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/hooks/useAuth';
import { useGetOrganizationHierarchyQuery } from '@/store/api/organizationApiSlice';
import {
  Clock,
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  User,
  AlertCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  Modal,
  Button,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Space,
  Form,
  Divider,
  Alert,
  message,
} from 'antd';

const { TextArea } = Input;

interface TaskDetailModalProps {
  task: ProjectTask;
  project: Project;
  phases: ProjectPhase[];
  milestones: Milestone[];
  statuses: TaskStatus[];
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export function TaskDetailModal({
  task,
  project,
  phases,
  milestones,
  statuses,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const { user } = useAuth();
  const { data: hierarchyData } = useGetOrganizationHierarchyQuery();
  const [form] = Form.useForm();
  const [status, setStatus] = useState(task.status);

  // Reassign Assignee & Reporting Manager state
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newAssigneeId, setNewAssigneeId] = useState<number | undefined>();
  const [newManagerId, setNewManagerId] = useState<number | undefined>();
  const [reassignReason, setReassignReason] = useState('');

  // Subtasks state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  // Comments state
  const [newComment, setNewComment] = useState('');
  // Attachments state
  const [newAttName, setNewAttName] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');
  const [showAddAtt, setShowAddAtt] = useState(false);

  // Eligible real employees from database
  const eligibleEmployees = useMemo(() => {
    if (hierarchyData?.data?.flatUsers && hierarchyData.data.flatUsers.length > 0) {
      departmentService.syncFromLiveUsers(
        hierarchyData.data.flatUsers,
        hierarchyData.data.departments || []
      );
    }
    return departmentService.getAllEmployees();
  }, [hierarchyData]);

  if (!isOpen) return null;

  const handleExecuteReassign = () => {
    if (!newAssigneeId) {
      message.error('Please select an employee to assign this task to.');
      return;
    }
    const assigneeObj = departmentService.getEmployeeById(newAssigneeId);
    if (!assigneeObj) return;

    const managerObj = newManagerId ? departmentService.getEmployeeById(newManagerId) : undefined;
    const reporting = departmentService.getEmployeeReporting(newAssigneeId);

    // Call reassign on projectService
    projectService.reassignTask(
      task.id,
      assigneeObj.userId,
      assigneeObj.userName,
      user?.id || 1,
      user?.username || 'Authenticated Admin',
      reassignReason.trim() || undefined
    );

    // Update the task's reporting manager and department if manager selected
    const all = projectService.getAllTasks();
    const updatedTask = all.find((t) => t.id === task.id);
    if (updatedTask) {
      if (managerObj) {
        updatedTask.reportingManagerId = managerObj.userId;
        updatedTask.reportingManagerName = managerObj.userName;
      } else if (reporting?.reportingManagerName) {
        updatedTask.reportingManagerId = reporting.reportingManagerId;
        updatedTask.reportingManagerName = reporting.reportingManagerName;
      }
      updatedTask.departmentId = assigneeObj.departmentId;
      updatedTask.departmentName = assigneeObj.departmentName;
      projectService.saveTask(updatedTask);
    }

    message.success(`Task reassigned to ${assigneeObj.userName} (Manager: ${managerObj?.userName || reporting?.reportingManagerName || 'Dept Head'})!`);
    setShowReassignModal(false);
    setNewAssigneeId(undefined);
    setNewManagerId(undefined);
    setReassignReason('');
    onTaskUpdated();
  };

  const handleStatusChange = (newStatusVal: string) => {
    if (!projectService.canTransition(status, newStatusVal)) {
      message.warning(`Transition from "${status}" to "${newStatusVal}" is not permitted by workflow rules.`);
      return;
    }
    setStatus(newStatusVal);
    projectService.saveTask({ id: task.id, status: newStatusVal });
    onTaskUpdated();
    message.success(`Status updated to ${newStatusVal}`);
  };

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    projectService.saveTask({
      id: task.id,
      title: values.title?.trim(),
      description: values.description?.trim(),
      status,
      priority: values.priority,
      phaseId: values.phaseId ? Number(values.phaseId) : null,
      milestoneId: values.milestoneId ? Number(values.milestoneId) : null,
      startDate: values.startDate,
      dueDate: values.dueDate,
      durationDays: Number(values.durationDays || 1),
      estimateMinutes: Number(values.estimateHours || 1) * 60,
      actualMinutes: Number(values.actualHours || 0) * 60,
    });
    onTaskUpdated();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    projectService.addSubtask(task.id, {
      title: newSubtaskTitle.trim(),
      projectId: project.id,
    });
    setNewSubtaskTitle('');
    onTaskUpdated();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    projectService.addTaskComment(task.id, {
      userId: 1,
      userName: 'Current User',
      content: newComment.trim(),
    });
    setNewComment('');
    onTaskUpdated();
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttName.trim() || !newAttUrl.trim()) return;
    projectService.addTaskAttachment(task.id, {
      name: newAttName.trim(),
      url: newAttUrl.trim(),
      uploadedBy: 'Current User',
    });
    setNewAttName('');
    setNewAttUrl('');
    setShowAddAtt(false);
    onTaskUpdated();
  };

  const currentStatusObj = statuses.find((s) => s.name === status);

  return (
    <Modal
      title={
        <div className="flex items-center justify-between pr-8">
          <Space>
            <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
              {project.key}-{task.keyNumber}
            </span>
            <Tag color={currentStatusObj?.color || 'blue'} className="font-bold uppercase text-[10px] m-0">
              {status}
            </Tag>
            <span className="text-xs text-muted font-semibold capitalize">
              {task.type}
            </span>
          </Space>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} className="rounded-xl font-bold">
          Save & Close
        </Button>,
      ]}
      width={800}
      centered
      destroyOnClose>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        initialValues={{
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          phaseId: task.phaseId ?? undefined,
          milestoneId: task.milestoneId ?? undefined,
          startDate: task.startDate || '',
          dueDate: task.dueDate || '',
          durationDays: task.durationDays || 1,
          estimateHours: Math.round((task.estimateMinutes || 60) / 60),
          actualHours: Math.round((task.actualMinutes || 0) / 60),
        }}
        className="py-2">
        <Row gutter={24}>
          {/* Main Content (Left 16 cols) */}
          <Col xs={24} md={15}>
            <Form.Item name="title" label="Task Title" rules={[{ required: true }]}>
              <Input className="rounded-xl font-bold text-sm" />
            </Form.Item>

            <Form.Item name="description" label="Description & Notes">
              <TextArea
                rows={4}
                placeholder="User stories, requirements, or acceptance criteria..."
                className="rounded-xl"
              />
            </Form.Item>

            {/* Subtasks Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-primary" />
                  Subtasks Checklist ({task.subtasks?.length || 0})
                </span>
              </div>

              <div className="space-y-1.5 mb-2">
                {task.subtasks?.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs">
                    <span>{st.title}</span>
                    <Tag color={st.status === 'Done' ? 'green' : 'default'} className="text-[10px] m-0 uppercase font-bold">
                      {st.status}
                    </Tag>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a checklist subtask..."
                  className="rounded-lg"
                />
                <Button htmlType="submit" icon={<Plus size={13} />} className="rounded-lg">
                  Add
                </Button>
              </form>
            </div>

            <Divider className="my-4" />

            {/* Attachments Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip size={14} className="text-primary" />
                  Attachments ({task.attachments?.length || 0})
                </span>
                <Button
                  type="link"
                  size="small"
                  icon={<Plus size={12} />}
                  onClick={() => setShowAddAtt(!showAddAtt)}>
                  Add Link
                </Button>
              </div>

              {showAddAtt && (
                <form
                  onSubmit={handleAddAttachment}
                  className="p-3 mb-2 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
                  <Input
                    value={newAttName}
                    onChange={(e) => setNewAttName(e.target.value)}
                    placeholder="Attachment Name (e.g. Design Specs PDF)"
                    className="rounded-lg"
                    required
                  />
                  <Input
                    type="url"
                    value={newAttUrl}
                    onChange={(e) => setNewAttUrl(e.target.value)}
                    placeholder="File URL or Link"
                    className="rounded-lg"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="small" onClick={() => setShowAddAtt(false)}>
                      Cancel
                    </Button>
                    <Button type="primary" size="small" htmlType="submit">
                      Attach
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-1.5">
                {task.attachments?.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary hover:underline">
                      {att.name}
                    </a>
                    <span className="text-[10px] text-muted">{att.uploadedBy}</span>
                  </div>
                ))}
              </div>
            </div>

            <Divider className="my-4" />

            {/* Comments Thread */}
            <div>
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                <MessageSquare size={14} className="text-primary" />
                Comments & Discussion ({task.comments?.length || 0})
              </span>

              <div className="space-y-2 mb-2 max-h-48 overflow-y-auto custom-scrollbar">
                {task.comments?.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <User size={12} className="text-primary" />
                        {c.userName}
                      </span>
                      <span className="text-muted text-[10px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90">{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment or update..."
                  className="rounded-xl"
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Send size={13} />}
                  className="rounded-xl"
                />
              </form>
            </div>
          </Col>

          {/* Right Sidebar Attributes (9 cols) */}
          <Col xs={24} md={9} className="space-y-3 bg-surface-subtle/50 p-4 rounded-2xl border border-border-subtle">
            <div>
              <label className="text-[11px] font-bold text-muted block mb-1">Status</label>
              <Select
                value={status}
                onChange={handleStatusChange}
                className="w-full"
                options={statuses.map((s) => ({
                  value: s.name,
                  label: (
                    <Space size={6}>
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>{s.name}</span>
                    </Space>
                  ),
                }))}
              />
            </div>

            <Form.Item name="priority" label="Priority" className="mb-2">
              <Select
                options={[
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="phaseId"
              label={
                <span className="flex items-center gap-1 text-[11px]">
                  <Sparkles size={11} className="text-primary" /> Lifecycle Phase
                </span>
              }
              className="mb-2">
              <Select
                allowClear
                placeholder="Assign Phase"
                options={phases.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>

            <Form.Item name="milestoneId" label="Target Milestone" className="mb-2">
              <Select
                allowClear
                placeholder="Assign Milestone"
                options={milestones.map((m) => ({ value: m.id, label: m.name }))}
              />
            </Form.Item>

            <Row gutter={8}>
              <Col span={12}>
                <Form.Item name="startDate" label={<span className="flex items-center gap-1"><Calendar size={11} /> Start</span>} className="mb-2">
                  <Input type="date" className="rounded-lg text-xs" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dueDate" label={<span className="flex items-center gap-1"><Calendar size={11} /> Due</span>} className="mb-2">
                  <Input type="date" className="rounded-lg text-xs" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={8}>
                <Form.Item name="durationDays" label={<span className="flex items-center gap-1"><Clock size={11} /> Days</span>} className="mb-2">
                  <Input type="number" min={1} className="rounded-lg text-xs" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="estimateHours" label="Est (h)" className="mb-2">
                  <Input type="number" min={0} className="rounded-lg text-xs" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="actualHours" label="Act (h)" className="mb-2">
                  <Input type="number" min={0} className="rounded-lg text-xs" />
                </Form.Item>
              </Col>
            </Row>

            {task.isCritical && (
              <Alert
                message="Critical Path"
                description="This task has zero float and directly influences target completion date."
                type="error"
                showIcon
                icon={<AlertCircle size={14} />}
                className="mt-3 text-xs"
              />
            )}

            {/* 6A: Task Ownership Structure */}
            <div className="mt-4 pt-3 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">
                Ownership & Governance
              </span>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/20">
                  <span className="text-muted">Department:</span>
                  <Tag color="cyan">{task.departmentName || 'Engineering'}</Tag>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/20">
                  <span className="text-muted">Assigned To:</span>
                  <span className="font-semibold">{task.assignedToName || task.assigneeNames?.[0] || 'Alex Mercer'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/20">
                  <span className="text-muted">Direct Manager:</span>
                  <span className="font-medium text-primary">{task.reportingManagerName || 'Liam Chen'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/20">
                  <span className="text-muted">Dept Head:</span>
                  <span className="font-medium">{task.deptHeadName || 'Alex Mercer'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/20">
                  <span className="text-muted">Project Manager:</span>
                  <span className="font-medium">{task.projectManagerName || 'Alex Mercer'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted">Created By:</span>
                  <span className="text-muted font-mono text-[11px]">{task.createdByName || 'System Seed'}</span>
                </div>
              </div>

              {/* Action Button: Reassign Employee & Manager */}
              <Button
                type="dashed"
                block
                icon={<UserCheck size={14} className="text-primary inline" />}
                onClick={() => {
                  setNewAssigneeId(task.assignedToId || task.assigneeIds?.[0]);
                  setNewManagerId(task.reportingManagerId);
                  setShowReassignModal(true);
                }}
                className="mt-3 rounded-xl font-bold text-xs">
                Reassign Task & Reporting Manager
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Reassign Employee & Manager Modal */}
      <Modal
        title={
          <Space>
            <UserCheck size={16} className="text-primary" />
            <span className="font-bold text-sm">Reassign Task & Manager ({project.key}-{task.keyNumber})</span>
          </Space>
        }
        open={showReassignModal}
        onCancel={() => setShowReassignModal(false)}
        onOk={handleExecuteReassign}
        okText="Update Assignment"
        centered>
        <div className="space-y-4 my-2">
          <p className="text-xs text-muted">
            Select a new assignee and reporting manager from active employees loaded from the database.
          </p>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Assignee (Assigned To) <span className="text-red-500">*</span>
            </label>
            <Select
              className="w-full"
              placeholder="Search and select employee from DB..."
              showSearch
              optionFilterProp="label"
              value={newAssigneeId}
              onChange={(val) => {
                setNewAssigneeId(val);
                // Auto-suggest employee's reporting manager from hierarchy
                const reporting = departmentService.getEmployeeReporting(val);
                if (reporting?.reportingManagerId) {
                  setNewManagerId(reporting.reportingManagerId);
                }
              }}
              options={eligibleEmployees.map((e) => ({
                value: e.userId,
                label: `${e.userName} (${e.designation} - ${e.departmentName})`,
              }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Direct Reporting Manager (Escalation / Oversight)
            </label>
            <Select
              className="w-full"
              placeholder="Select reporting manager from DB..."
              showSearch
              allowClear
              optionFilterProp="label"
              value={newManagerId}
              onChange={setNewManagerId}
              options={eligibleEmployees.map((e) => ({
                value: e.userId,
                label: `${e.userName} (${e.designation} - ${e.departmentName})`,
              }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Reassignment Reason / Audit Note
            </label>
            <Input.TextArea
              rows={2}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Workload balancing, sprint scope handoff, or skill domain alignment..."
              className="rounded-xl text-xs"
            />
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
