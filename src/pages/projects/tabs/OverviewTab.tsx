import { useState } from 'react';
import type { Project, Milestone, ProjectTask, Sprint } from '@/types/project';
import {
  CheckCircle2,
  Clock,
  Users,
  Target,
  Sparkles,
  Calendar,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building2,
  History,
} from 'lucide-react';
import {
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Input,
  message,
  Timeline,
} from 'antd';
import { departmentService } from '@/services/departmentService';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/hooks/useAuth';
import {
  useUpdateProjectManagerMutation,
  useTransferOwnershipMutation,
} from '@/store/api/projectApiSlice';

interface OverviewTabProps {
  project: Project;
  milestones: Milestone[];
  tasks: ProjectTask[];
  sprints: Sprint[];
  onTabChange: (tabKey: string) => void;
  onProjectUpdated?: () => void;
}

export function OverviewTab({
  project,
  milestones,
  tasks,
  sprints,
  onTabChange,
  onProjectUpdated,
}: OverviewTabProps) {
  const { user } = useAuth();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<number | undefined>();
  const [transferReason, setTransferReason] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Project Manager Change state
  const [showPMModal, setShowPMModal] = useState(false);
  const [newPMId, setNewPMId] = useState<number | undefined>();
  const [updatingPM, setUpdatingPM] = useState(false);

  // RTK Query mutations
  const [updatePMMutation] = useUpdateProjectManagerMutation();
  const [transferOwnershipMutation] = useTransferOwnershipMutation();

  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'In Progress' || t.status === 'In Review'
  ).length;
  const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const activeSprint = sprints.find((s) => s.status === 'active');

  const healthColor =
    project.health === 'on_track' ? 'green' : project.health === 'at_risk' ? 'gold' : 'red';

  const healthLabel =
    project.health === 'on_track'
      ? 'On Track'
      : project.health === 'at_risk'
        ? 'At Risk'
        : 'Off Track';

  const eligibleEmployees = departmentService.getAllEmployees();

  const handleUpdatePM = async () => {
    if (!newPMId) {
      message.error('Please select a project manager from the database list.');
      return;
    }
    const targetEmp = departmentService.getEmployeeById(newPMId);
    if (!targetEmp) return;

    setUpdatingPM(true);
    try {
      // Try real API
      await updatePMMutation({ projectId: project.id, manager_id: targetEmp.userId }).unwrap();
      message.success(`Project Manager updated to ${targetEmp.userName} successfully!`);
    } catch {
      // Fallback to localStorage service
      projectService.updateProjectManager(project.id, targetEmp.userId, targetEmp.userName);
      message.success(`Project Manager updated to ${targetEmp.userName} (locally).`);
    }
    setShowPMModal(false);
    setNewPMId(undefined);
    if (onProjectUpdated) onProjectUpdated();
    setUpdatingPM(false);
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerId || !transferReason.trim()) {
      message.error('Please select a new owner and state the business reason.');
      return;
    }
    const targetEmp = departmentService.getEmployeeById(newOwnerId);
    if (!targetEmp) return;

    setTransferring(true);
    try {
      await transferOwnershipMutation({
        projectId: project.id,
        new_owner_id: targetEmp.userId,
        reason: transferReason.trim(),
      }).unwrap();
      message.success(`Project ownership transferred to ${targetEmp.userName}!`);
    } catch {
      projectService.transferProjectOwnership(
        project.id,
        targetEmp.userId,
        targetEmp.userName,
        user?.id || 1,
        user?.username || 'Authenticated Admin',
        transferReason.trim()
      );
      message.success(`Ownership transferred to ${targetEmp.userName} (locally).`);
    }
    setShowTransferModal(false);
    setTransferReason('');
    setNewOwnerId(undefined);
    if (onProjectUpdated) onProjectUpdated();
    setTransferring(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs h-full"
            styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted">Project Health</span>
              <Tag color={healthColor} className="font-bold text-[10px] uppercase m-0">
                {healthLabel}
              </Tag>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-foreground">{progressPct}%</span>
              <span className="text-xs text-muted ml-2">completed</span>
              <Progress
                percent={progressPct}
                showInfo={false}
                strokeColor="var(--primary, #3b82f6)"
                className="mt-2"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs h-full"
            styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted">Active Sprint</span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles size={14} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm font-bold text-foreground line-clamp-1 block">
                {activeSprint ? activeSprint.name : 'No Active Sprint'}
              </span>
              <span className="text-xs text-muted mt-1 block">
                {activeSprint
                  ? `${activeSprint.completedPoints} / ${activeSprint.committedPoints} pts delivered`
                  : 'Cycle in backlog planning'}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs h-full"
            styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted">Task Pipeline</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{completedTasks}</span>
              <span className="text-xs text-muted">/ {tasks.length} done</span>
              <span className="text-xs font-bold text-amber-500 ml-auto">
                ({inProgressTasks} active)
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs h-full"
            styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted">Target Timeline</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Calendar size={14} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm font-bold text-foreground block">{project.targetDate}</span>
              <span className="text-xs text-muted mt-1 block">Started: {project.startDate}</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2. Real Project Ownership & Governance Banner */}
      <Card
        className="rounded-2xl border-primary/20 bg-primary/5 shadow-xs"
        styles={{ body: { padding: '20px' } }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={20} />
              <h3 className="text-base font-black text-foreground">
                Project Governance & Ownership
              </h3>
              <Tag color="cyan">{project.key}</Tag>
            </div>
            <p className="text-xs text-muted">
              Live organizational accountability structure connecting the project to company
              departments and delivery leads.
            </p>
          </div>

          <Space>
            <Button
              icon={<UserCheck size={14} className="text-primary" />}
              onClick={() => {
                setNewPMId(project.projectManagerId);
                setShowPMModal(true);
              }}
              className="rounded-xl font-bold">
              Change Project Manager
            </Button>
            <Button
              type="primary"
              icon={<ShieldCheck size={14} />}
              onClick={() => setShowTransferModal(true)}
              className="rounded-xl font-bold">
              Transfer Ownership
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} className="mt-4 pt-4 border-t border-primary/10">
          <Col xs={12} sm={6}>
            <span className="text-[11px] font-semibold text-muted uppercase block">
              Project Owner
            </span>
            <span className="text-sm font-bold text-foreground block mt-0.5">
              {project.ownerName || project.leadName || 'Alex Mercer'}
            </span>
            <span className="text-[11px] text-muted">Accountable for Delivery</span>
          </Col>
          <Col xs={12} sm={6}>
            <span className="text-[11px] font-semibold text-muted uppercase block">
              Project Manager
            </span>
            <span className="text-sm font-bold text-foreground block mt-0.5">
              {project.projectManagerName || project.leadName || 'Alex Mercer'}
            </span>
            <span className="text-[11px] text-muted">Sprint & Team Lead</span>
          </Col>
          <Col xs={12} sm={6}>
            <span className="text-[11px] font-semibold text-muted uppercase block">Department</span>
            <span className="text-sm font-bold text-foreground block mt-0.5 flex items-center gap-1">
              <Building2 size={13} className="text-primary inline" />
              {project.departmentName || 'Engineering'}
            </span>
            <span className="text-[11px] text-muted">
              Head: {project.deptHeadName || 'Alex Mercer'}
            </span>
          </Col>
          <Col xs={12} sm={6}>
            <span className="text-[11px] font-semibold text-muted uppercase block">Created By</span>
            <span className="text-sm font-bold text-foreground block mt-0.5">
              {project.createdByName || 'Authenticated User'}
            </span>
            <span className="text-[11px] text-muted">Initial Reporter</span>
          </Col>
        </Row>

        {/* Ownership Transfer History Audit Timeline */}
        {project.ownershipTransferHistory && project.ownershipTransferHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary/10">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
              <History size={13} className="text-primary" /> Ownership Transfer Audit Trail
            </span>
            <Timeline
              className="mt-2"
              items={project.ownershipTransferHistory.map((h) => ({
                color: 'blue',
                children: (
                  <div className="text-xs">
                    <span className="font-bold">{h.transferredByName}</span> transferred ownership
                    from <span className="font-semibold">{h.fromUserName || 'Initial Owner'}</span>{' '}
                    to <span className="font-semibold text-primary">{h.toUserName}</span> on{' '}
                    <span className="text-muted">{new Date(h.timestamp).toLocaleDateString()}</span>
                    <p className="text-muted text-[11px] italic mt-0.5">"{h.reason}"</p>
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </Card>

      {/* Main Section: Milestones & Team */}
      <Row gutter={[24, 24]}>
        {/* Milestones Summary */}
        <Col xs={24} lg={16}>
          <Card
            className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs"
            title={
              <Space>
                <Target size={16} className="text-primary" />
                <span className="text-sm font-black">Project Milestones</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => onTabChange('timeline')}
                className="font-bold p-0">
                <span>View Timeline Gantt</span>
                <ArrowRight size={13} className="ml-1 inline" />
              </Button>
            }
            styles={{ body: { padding: '16px 20px' } }}>
            <div className="space-y-3">
              {milestones.length === 0 ? (
                <p className="text-xs text-muted py-4 text-center">No milestones planned yet.</p>
              ) : (
                milestones.map((m) => {
                  const isDone = m.status === 'completed';
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-background border border-border-subtle flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-primary/10 text-primary'
                          }`}>
                          {isDone ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">{m.name}</h4>
                          <p className="text-[11px] text-muted flex items-center gap-2">
                            <span>Target: {m.targetDate}</span>
                            {m.isFixed && (
                              <span className="text-amber-500 font-semibold">• Fixed Date</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <Space>
                        {m.requiresSignoff && (
                          <Tag color="purple" className="text-[10px] font-bold m-0">
                            Sign-off Req
                          </Tag>
                        )}
                        <Tag
                          color={isDone ? 'green' : 'blue'}
                          className="text-[10px] font-bold uppercase m-0">
                          {m.status.replace('_', ' ')}
                        </Tag>
                      </Space>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </Col>

        {/* Team Members */}
        <Col xs={24} lg={8}>
          <Card
            className="rounded-2xl border-border-subtle bg-surface-subtle shadow-xs h-full"
            title={
              <Space>
                <Users size={16} className="text-primary" />
                <span className="text-sm font-black">Project Team ({project.members.length})</span>
              </Space>
            }
            styles={{ body: { padding: '16px 20px' } }}>
            <div className="space-y-2.5">
              {project.members.map((member) => (
                <div
                  key={member.userId}
                  className="p-2.5 rounded-xl bg-background border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {member.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate leading-tight">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-muted truncate">{member.email}</p>
                    </div>
                  </div>

                  <Tag color="blue" className="text-[10px] font-bold uppercase m-0">
                    {member.role}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Transfer Ownership Modal */}
      <Modal
        title={
          <Space>
            <ShieldCheck className="text-primary" size={16} />
            <span className="font-bold text-sm">Transfer Project Ownership ({project.key})</span>
          </Space>
        }
        open={showTransferModal}
        onCancel={() => setShowTransferModal(false)}
        onOk={handleTransferOwnership}
        confirmLoading={transferring}
        okText="Transfer Ownership"
        centered>
        <div className="space-y-4 my-2">
          <p className="text-xs text-muted">
            Transferring ownership reassigns final delivery accountability to the selected employee.
            An audit record will be preserved with your identity, timestamp, and justification.
          </p>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              New Project Owner
            </label>
            <Select
              className="w-full"
              placeholder="Search and select active employee..."
              showSearch
              optionFilterProp="label"
              value={newOwnerId}
              onChange={setNewOwnerId}
              options={eligibleEmployees.map((e) => ({
                value: e.userId,
                label: `${e.userName} (${e.designation} - ${e.departmentName})`,
              }))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Business Rationale
            </label>
            <Input.TextArea
              rows={3}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="e.g. Lead role transition following departmental sprint reallocation..."
              className="rounded-xl text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Change Project Manager Modal */}
      <Modal
        title={
          <Space>
            <UserCheck className="text-primary" size={16} />
            <span className="font-bold text-sm">Assign Project Manager ({project.key})</span>
          </Space>
        }
        open={showPMModal}
        onCancel={() => setShowPMModal(false)}
        onOk={handleUpdatePM}
        confirmLoading={updatingPM}
        okText="Update Project Manager"
        centered>
        <div className="space-y-4 my-2">
          <p className="text-xs text-muted">
            Select the designated Project Manager / Delivery Lead responsible for milestone
            execution and task oversight.
          </p>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Project Manager (Loaded from DB)
            </label>
            <Select
              className="w-full"
              placeholder="Search and select employee from DB..."
              showSearch
              optionFilterProp="label"
              value={newPMId}
              onChange={setNewPMId}
              options={eligibleEmployees.map((e) => ({
                value: e.userId,
                label: `${e.userName} (${e.designation} - ${e.departmentName})`,
              }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
